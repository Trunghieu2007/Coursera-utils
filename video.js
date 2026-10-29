// Lecture video completion.
//
// The module marks the lecture videos of the current course as completed by calling
// the same Coursera endpoints the web client calls, in the order the client uses them:
// open the playback session, write the viewing progress, then send the ended event.
// Every lecture is handled on its own, one request at a time, and every answer is
// verified by reading the item progress back, so an HTTP 200 alone is never treated
// as success.
//
// The module does nothing on its own. It only runs when the popup asks it to,
// so the button in the popup is the single way to start a run.

const VIDEO_RETRY_DELAY = 8000;
const VIDEO_MAX_ATTEMPTS = 5;
const VIDEO_ITEM_DELAY = 700;
const VIDEO_COMMIT_DELAY = 2000;

const VIDEO_TEXTS = {
    en: {
        started: (count) => `Completing ${count} lecture video${count === 1 ? "" : "s"}, one at a time.`,
        progress: (done, total) => `Completed ${done} of ${total} lecture videos.`,
        finished: (completed, total) => `Completed ${completed} of ${total} lecture videos. Reload the page to see the checkmarks.`,
        partial: (completed, total, failed) => `Completed ${completed} of ${total} lecture videos. ${failed} still need attention.`,
        none: "No lecture videos were found in this course.",
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        busy: "Lecture video completion is already running."
    },
    vi: {
        started: (count) => `Đang hoàn thành ${count} video bài giảng, từng video một.`,
        progress: (done, total) => `Đã hoàn thành ${done}/${total} video bài giảng.`,
        finished: (completed, total) => `Đã hoàn thành ${completed}/${total} video bài giảng. Reload trang để thấy dấu tick.`,
        partial: (completed, total, failed) => `Đã hoàn thành ${completed}/${total} video bài giảng. ${failed} video chưa được.`,
        none: "Không tìm thấy video bài giảng nào trong khoá học này.",
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        busy: "Hoàn thành video bài giảng đang chạy."
    }
};

let videoRunning = false;
let videoLanguage = "en";
let videoState = { phase: "idle", code: "idle", total: 0, done: 0, completed: 0, failed: 0, note: "" };

// pick the string table for the saved language
function videoTexts() {
    return VIDEO_TEXTS[videoLanguage] || VIDEO_TEXTS.en;
}

// wait for a number of milliseconds
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// CSRF token from the course cookie, empty when the cookie is not readable
function csrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)CSRF3-Token=([^;]+)/) || document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return match && match[1] ? match[1] : "";
}

// headers every API call needs
function apiHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = csrfToken();
    if (token) headers["X-CSRF3-Token"] = token;
    return headers;
}

// call the Coursera API, dropping the CSRF header when the server rejects it
async function apiRequest(url, options = {}) {
    const response = await fetch(url, Object.assign({ credentials: "include" }, options));
    const status = response.status;
    if ((status === 401 || status === 403) && options.headers && options.headers["X-CSRF3-Token"]) {
        const headers = Object.assign({}, options.headers);
        delete headers["X-CSRF3-Token"];
        return fetch(url, Object.assign({ credentials: "include" }, options, { headers }));
    }
    return response;
}

// read a JSON body, empty object when the answer is not JSON
async function apiJson(response) {
    return response.json().catch(() => ({}));
}

// the course slug of the current page, empty when the page is not a course page
function courseSlug() {
    const match = window.location.pathname.match(/\/learn\/([^/]+)/);
    return match && match[1] ? match[1] : "";
}

// the signed-in user id, empty when Coursera does not answer
async function resolveUserId() {
    const response = await apiRequest("/api/users.v1?q=me");
    if (response.ok) {
        const data = await apiJson(response);
        const me = data.elements && data.elements[0];
        if (me && me.id) return String(me.id);
    }
    const cookie = document.cookie.match(/(?:^|;\s*)c_user=([^;]+)/);
    return cookie && cookie[1] ? cookie[1] : "";
}

// the whole course tree, with the item list Coursera uses for the outline
async function fetchSyllabus(slug) {
    const url = "/api/onDemandCourseMaterials.v2/?q=slug&slug=" + encodeURIComponent(slug)
        + "&includes=modules,lessons,items,gradingParameters"
        + "&fields=moduleIds,onDemandCourseMaterialModules.v1(lessonIds,optional),"
        + "onDemandCourseMaterialLessons.v1(elementIds,optional,itemIds),"
        + "onDemandCourseMaterialItems.v2(name,slug,isLocked,itemClass,timeCommitment,contentSummary)";
    const response = await apiRequest(url);
    if (!response.ok) return null;
    return apiJson(response);
}

// the internal course id, used by the video progress record
function internalCourseId(syllabus) {
    const linked = syllabus.linked || {};
    const grading = linked["onDemandGradingParameters.v1"];
    if (grading && grading[0] && grading[0].id) return grading[0].id;
    const elements = syllabus.elements || [];
    if (elements[0] && elements[0].id) return elements[0].id;
    return "";
}

// the lecture videos of the course, every other item type is left alone
function lectureItems(syllabus) {
    const linked = syllabus.linked || {};
    const items = linked["onDemandCourseMaterialItems.v2"] || [];
    return items
        .filter((item) => item && item.id && item.contentSummary && item.contentSummary.typeName === "lecture")
        .map((item) => ({
            id: item.id,
            name: item.name || item.id,
            timeCommitment: Number(item.timeCommitment) || 0
        }));
}

// the internal video id of one lecture, plus the real duration when the API gives it
async function resolveVideo(courseId, item) {
    const url = "/api/onDemandLectureVideos.v1/" + encodeURIComponent(courseId + "~" + item.id)
        + "?includes=video&fields=onDemandVideos.v1";
    const response = await apiRequest(url);
    if (!response.ok) return { id: "", duration: 0 };
    const data = await apiJson(response);
    const linked = data.linked || {};
    const video = (linked["onDemandVideos.v1"] || [])[0];
    if (!video || !video.id) return { id: "", duration: 0 };
    return { id: String(video.id), duration: Number(video.duration) || 0 };
}

// send one playback event and read the item progress back from the answer
async function postVideoEvent(userId, slug, itemId, eventName, maxAttempts, retryDelay) {
    const attempts = maxAttempts || 1;
    const wait = retryDelay === undefined ? VIDEO_RETRY_DELAY : retryDelay;
    const url = "/api/opencourse.v1/user/" + encodeURIComponent(userId)
        + "/course/" + encodeURIComponent(slug)
        + "/item/" + encodeURIComponent(itemId)
        + "/lecture/videoEvents/" + eventName + "?autoEnroll=false";
    const options = { method: "POST", headers: apiHeaders(), body: JSON.stringify({ contentRequestBody: {} }) };

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const response = await apiRequest(url, options);
            const data = await apiJson(response);
            const state = data && data.itemProgress ? data.itemProgress.progressState : "";

            if (response.ok && state === "Completed") return { ok: true, completed: true };
            if (eventName === "play" && response.ok) return { ok: true, completed: false };
            if (attempt < attempts) {
                await sleep(wait);
                continue;
            }
            return { ok: response.ok, completed: false };
        } catch {
            if (attempt >= attempts) return { ok: false, completed: false };
            await sleep(wait);
        }
    }
    return { ok: false, completed: false };
}

// write the viewing progress record the server needs before the ended event counts
async function putVideoProgress(userId, courseId, videoId, viewedUpTo) {
    if (!videoId) return false;
    const progressId = userId + "~" + courseId + "~" + videoId;
    const url = "/api/onDemandVideoProgresses.v1/" + encodeURIComponent(progressId);
    const response = await apiRequest(url, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({ viewedUpTo: Math.floor(viewedUpTo || 0), videoProgressId: progressId })
    });
    return response.ok;
}

// complete one lecture: probe first, then open the session, write the progress and retry the ended event
async function completeLecture(item, context) {
    const probe = await postVideoEvent(context.userId, context.slug, item.id, "ended", 1, 0);
    if (probe.completed) return true;

    await postVideoEvent(context.userId, context.slug, item.id, "play", 1, 0);
    if (item.videoId) {
        await putVideoProgress(context.userId, context.courseId, item.videoId, item.viewedUpTo);
    }
    await sleep(VIDEO_COMMIT_DELAY);
    const ended = await postVideoEvent(context.userId, context.slug, item.id, "ended", VIDEO_MAX_ATTEMPTS, VIDEO_RETRY_DELAY);
    return ended.completed;
}

// run the whole course, one lecture at a time
async function runVideoCompletion() {
    const texts = videoTexts();
    const slug = courseSlug();
    if (!slug) {
        videoState = { phase: "error", code: "notCourse", total: 0, done: 0, completed: 0, failed: 0, note: texts.notCourse };
        return videoState;
    }

    const userId = await resolveUserId();
    if (!userId) {
        videoState = { phase: "error", code: "notLoggedIn", total: 0, done: 0, completed: 0, failed: 0, note: texts.notLoggedIn };
        return videoState;
    }

    const syllabus = await fetchSyllabus(slug);
    if (!syllabus) {
        videoState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, failed: 0, note: texts.notCourse };
        return videoState;
    }

    const courseId = internalCourseId(syllabus);
    const lectures = lectureItems(syllabus);
    if (lectures.length === 0) {
        videoState = { phase: "error", code: "none", total: 0, done: 0, completed: 0, failed: 0, note: texts.none };
        return videoState;
    }

    videoState = { phase: "running", code: "running", total: lectures.length, done: 0, completed: 0, failed: 0, note: "" };
    notify(texts.started(lectures.length));

    for (const item of lectures) {
        const video = await resolveVideo(courseId, item);
        item.videoId = video.id;
        item.viewedUpTo = video.duration || item.timeCommitment;

        const done = await completeLecture(item, { userId, slug, courseId });
        videoState.done += 1;
        if (done) videoState.completed += 1;
        else videoState.failed += 1;

        notify(texts.progress(videoState.done, videoState.total));
        await sleep(VIDEO_ITEM_DELAY);
    }

    const note = videoState.failed > 0
        ? texts.partial(videoState.completed, videoState.total, videoState.failed)
        : texts.finished(videoState.completed, videoState.total);
    videoState = {
        phase: "done",
        code: videoState.failed > 0 ? "partial" : "done",
        total: videoState.total,
        done: videoState.done,
        completed: videoState.completed,
        failed: videoState.failed,
        note
    };
    notify(note);
    return videoState;
}

// start the run in the background, the popup follows the state on its own
function startVideoCompletion() {
    const texts = videoTexts();
    if (videoRunning) {
        videoState = {
            phase: "running",
            code: "busy",
            total: videoState.total,
            done: videoState.done,
            completed: videoState.completed,
            failed: videoState.failed,
            note: texts.busy
        };
        return Promise.resolve(videoState);
    }

    videoRunning = true;
    videoState = { phase: "running", code: "starting", total: 0, done: 0, completed: 0, failed: 0, note: "" };
    runVideoCompletion()
        .catch(() => {
            videoState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, failed: 0, note: texts.notCourse };
        })
        .finally(() => {
            videoRunning = false;
        });
    return Promise.resolve(videoState);
}

// show a notice on the page, the toast helper lives in content.js
function notify(text, isError) {
    if (typeof showToast === "function") showToast(text, isError);
}

// read the saved language
function loadVideoLanguage() {
    return chrome.storage.local.get(["language"]).then((stored) => {
        videoLanguage = VIDEO_TEXTS[stored.language] ? stored.language : "en";
    });
}

// answer the popup while the run is going on
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "completeVideos") {
        startVideoCompletion().then((state) => sendResponse(state)).catch(() => sendResponse({ phase: "error" }));
        return true;
    }
    if (request.action === "videoStatus") {
        sendResponse(videoState);
        return true;
    }
    return false;
});

// keep the language in sync with the popup
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.language && VIDEO_TEXTS[changes.language.newValue]) videoLanguage = changes.language.newValue;
});

loadVideoLanguage();
