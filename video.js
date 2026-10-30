// Lecture video completion.
//
// The module marks the lecture videos of the current course as completed by calling
// the same Coursera endpoints the web client calls, in the order the client uses them:
// open the playback session, write the viewing progress, then send the ended event.
// Every lecture is handled on its own, one request at a time, and every answer is
// verified by reading the item progress back, so an HTTP 200 alone is never treated
// as success. A lecture the course has locked is left alone instead of being retried,
// and a lecture whose events did not stick gets one direct completion record, which is
// the call the web client makes when it marks an item done without the player.
//
// The module does nothing on its own. It only runs when the popup asks it to,
// so the button in the popup is the single way to start a run.
//
// Three guards cover the case where the page itself is not honest: the account named by
// the cookie and the account written into the page state have to agree or the run refuses
// to start, an id that is not a plain id is never put in the event path or in a record
// key, and a queue that is still running stops when the page moves or another account
// takes over.

const VIDEO_RETRY_DELAY = 8000;
const VIDEO_MAX_ATTEMPTS = 5;
const VIDEO_ITEM_DELAY = 700;
const VIDEO_COMMIT_DELAY = 2000;
const VIDEO_EVENT_MARGIN = 5000;

const VIDEO_TEXTS = {
    en: {
        started: (count) => `Completing ${count} lecture video${count === 1 ? "" : "s"}, one at a time.`,
        progress: (done, total) => `Completed ${done} of ${total} lecture videos.`,
        finished: (completed, total) => `Completed ${completed} of ${total} lecture videos. Reload the page to see the checkmarks.`,
        partial: (completed, total, failed) => `Completed ${completed} of ${total} lecture videos. ${failed} still ${failed === 1 ? "needs" : "need"} attention.`,
        none: "No lecture videos were found in this course.",
        failed: "The run stopped with an unexpected error. Check the browser console.",
        skipped: (count) => ` ${count} locked lecture${count === 1 ? "" : "s"} left alone.`,
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        identity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
        stopped: "The page changed while the run was going on, so the rest of the list was left alone.",
        busy: "Lecture video completion is already running."
    },
    vi: {
        started: (count) => `Đang hoàn thành ${count} video bài giảng, từng video một.`,
        progress: (done, total) => `Đã hoàn thành ${done}/${total} video bài giảng.`,
        finished: (completed, total) => `Đã hoàn thành ${completed}/${total} video bài giảng. Reload trang để thấy dấu tick.`,
        partial: (completed, total, failed) => `Đã hoàn thành ${completed}/${total} video bài giảng. ${failed} video chưa được.`,
        none: "Không tìm thấy video bài giảng nào trong khoá học này.",
        failed: "Lần chạy dừng vì một lỗi bất ngờ. Xem console của trình duyệt.",
        skipped: (count) => ` ${count} bài giảng bị khoá được bỏ qua.`,
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        identity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
        stopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
        busy: "Hoàn thành video bài giảng đang chạy."
    }
};

let videoRunning = false;
let videoLanguage = "en";
let videoState = { phase: "idle", code: "idle", total: 0, done: 0, completed: 0, failed: 0, skipped: 0, note: "" };
let videoBootstrap = null;

// pick the string table for the saved language
function videoTexts() {
    return VIDEO_TEXTS[videoLanguage] || VIDEO_TEXTS.en;
}

// wait for a number of milliseconds
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// the page writes its own start-up state into an inline script, and that state already
// holds the signed-in user id and the csrf token, so neither needs a request
function readBootstrap() {
    if (videoBootstrap) return videoBootstrap;
    const found = { userId: "", csrf: "" };
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
        const text = scripts[i].textContent || "";
        if (text.indexOf("window.App") < 0) continue;
        const user = text.match(/"userData"\s*:\s*\{\s*"id"\s*:\s*"?(\d+)"?/);
        const token = text.match(/"csrfToken"\s*:\s*"([^"\\]+)"/);
        if (user) found.userId = user[1];
        if (token && token[1].indexOf("MISSING") < 0) found.csrf = token[1];
        break;
    }
    videoBootstrap = found;
    return found;
}

// a token read out of a cookie or out of the page is only usable if the browser is
// allowed to put it in a header: a control character makes fetch throw and a cookie that
// is not valid URL encoding makes decodeURIComponent throw, so both cases drop the token
// instead of sending a header the server was going to refuse anyway
function videoUsableToken(value) {
    let text = String(value || "");
    try {
        text = decodeURIComponent(text);
    } catch {
        /* keep the raw value when it is not URL encoded */
    }
    return /^[\x20-\x7E]*$/.test(text) ? text : "";
}

// CSRF token from the course cookie, or from the page state when the cookie is hidden
function csrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)CSRF3-Token=([^;]+)/) || document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    if (match && match[1]) return videoUsableToken(match[1]);
    return videoUsableToken(readBootstrap().csrf);
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

// the account the cookie names, "" when the page carries no such cookie
function videoCookieUser() {
    const cookie = document.cookie.match(/(?:^|;\s*)c_user=([^;]+)/);
    return cookie && /^\d+$/.test(cookie[1]) ? cookie[1] : "";
}

// the signed-in user id, empty when the page and Coursera both stay silent
async function resolveUserId() {
    const fromPage = readBootstrap().userId;
    if (fromPage) return fromPage;
    const fromCookie = videoCookieUser();
    if (fromCookie) return fromCookie;
    // Coursera answers this finder with 405 today, so it is only a last try
    const response = await apiRequest("/api/users.v1?q=me");
    if (response.ok) {
        const data = await apiJson(response);
        const me = data.elements && data.elements[0];
        if (me && /^\d+$/.test(String(me.id))) return String(me.id);
    }
    return "";
}

// a lecture is addressed by a course id, an item id and a video id, plain in Coursera's
// own data. An id that carries a separator, a slash or a query mark would put a record
// somewhere the course never asked for, so it is never sent.
function videoIsKeyId(value) {
    return /^[A-Za-z0-9._-]{1,64}$/.test(String(value));
}

// the course slug goes into the playback event path, where a slash would move the request
function videoIsSlug(value) {
    return /^[A-Za-z0-9._-]{1,120}$/.test(String(value));
}

// the queue is slow on purpose, so the page can move on half way through. When it does,
// or when another account takes over the tab, the rest of the list is left alone.
function videoPageMoved(slug, userId) {
    if (courseSlug() !== slug) return true;
    const cookieUser = videoCookieUser();
    return Boolean(cookieUser) && cookieUser !== String(userId);
}

// the whole course tree, with the item list Coursera uses for the outline. Locked items
// are asked for on purpose: they have to be seen to be left alone.
async function fetchSyllabus(slug) {
    const url = "/api/onDemandCourseMaterials.v2/?q=slug&slug=" + encodeURIComponent(slug)
        + "&includes=modules,lessons,items,gradingParameters"
        + "&fields=moduleIds,onDemandCourseMaterialModules.v1(lessonIds,optional),"
        + "onDemandCourseMaterialLessons.v1(elementIds,optional,itemIds),"
        + "onDemandCourseMaterialItems.v2(name,slug,isLocked,lockedStatus,itemLockedReasonCode,itemClass,timeCommitment,contentSummary)"
        + "&showLockedItems=true";
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

// a lecture the course will not let the student open yet
function itemIsLocked(item) {
    if (item.isLocked === true) return true;
    const status = String(item.lockedStatus || "").trim().toLowerCase();
    return status === "locked" || status.indexOf("locked_") === 0 || status.indexOf("hard_locked") === 0;
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
            timeCommitment: Number(item.timeCommitment) || 0,
            locked: itemIsLocked(item)
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

// send one playback event and read the item progress back from the answer. Without a
// position the call is a plain question, with one it carries what the player would have
// reported at that moment.
async function postVideoEvent(userId, slug, itemId, eventName, maxAttempts, retryDelay, positionSeconds) {
    const attempts = maxAttempts || 1;
    const wait = retryDelay === undefined ? VIDEO_RETRY_DELAY : retryDelay;
    const url = "/api/opencourse.v1/user/" + encodeURIComponent(userId)
        + "/course/" + encodeURIComponent(slug)
        + "/item/" + encodeURIComponent(itemId)
        + "/lecture/videoEvents/" + eventName + "?autoEnroll=false";
    const content = { contentRequestBody: {} };
    if (positionSeconds) {
        const ms = Math.max(Math.floor(positionSeconds) * 1000 - VIDEO_EVENT_MARGIN, 0);
        content.contentRequestBody = { currentTimeMs: ms, videoTimestampMs: ms, clientTimestampMs: Date.now() };
    }
    const options = { method: "POST", headers: apiHeaders(), body: JSON.stringify(content) };

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

// record the item as done on its own, the way the client does when a lecture is marked
// without the player running to the end
async function postCompletedItem(userId, courseId, itemId) {
    const response = await apiRequest("/api/onDemandCompletedItems.v1", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ userId: String(userId), courseId, itemId })
    });
    return response.ok;
}

// complete one lecture: probe first, then open the session, write the progress and
// retry the ended event, and only then fall back to the direct completion record
async function completeLecture(item, context) {
    // an id that the event path or the record key cannot hold is never sent at all
    if (!videoIsSlug(context.slug) || !videoIsKeyId(context.userId) || !videoIsKeyId(item.id)) return false;
    // the two records are keyed by the course id, so a course id that is not a plain id
    // costs those two writes while the playback events, addressed by the page slug, still
    // go through
    const canRecord = videoIsKeyId(context.courseId);

    const probe = await postVideoEvent(context.userId, context.slug, item.id, "ended", 1, 0);
    if (probe.completed) return true;

    await postVideoEvent(context.userId, context.slug, item.id, "play", 1, 0);
    if (item.videoId && canRecord && videoIsKeyId(item.videoId)) {
        await putVideoProgress(context.userId, context.courseId, item.videoId, item.viewedUpTo);
    }
    await sleep(VIDEO_COMMIT_DELAY);
    const ended = await postVideoEvent(context.userId, context.slug, item.id, "ended",
        VIDEO_MAX_ATTEMPTS, VIDEO_RETRY_DELAY, item.viewedUpTo);
    if (ended.completed) return true;

    if (canRecord && await postCompletedItem(context.userId, context.courseId, item.id)) {
        const after = await postVideoEvent(context.userId, context.slug, item.id, "ended", 1, 0);
        if (after.completed) return true;
    }
    return false;
}

// run the whole course, one lecture at a time
async function runVideoCompletion() {
    const texts = videoTexts();
    const slug = courseSlug();
    if (!slug) {
        videoState = { phase: "error", code: "notCourse", total: 0, done: 0, completed: 0, failed: 0, skipped: 0, note: texts.notCourse };
        return videoState;
    }

    const userId = await resolveUserId();
    if (!userId) {
        videoState = { phase: "error", code: "notLoggedIn", total: 0, done: 0, completed: 0, failed: 0, skipped: 0, note: texts.notLoggedIn };
        return videoState;
    }

    // the cookie and the page state name the same account on a real course page, so a page
    // that names a different one is not a page this run should be writing for
    const cookieUser = videoCookieUser();
    if (cookieUser && cookieUser !== String(userId)) {
        videoState = { phase: "error", code: "identity", total: 0, done: 0, completed: 0, failed: 0, skipped: 0, note: texts.identity };
        return videoState;
    }

    const syllabus = await fetchSyllabus(slug);
    if (!syllabus) {
        videoState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, failed: 0, skipped: 0, note: texts.failed };
        return videoState;
    }

    const courseId = internalCourseId(syllabus);
    const allLectures = lectureItems(syllabus);
    const lectures = allLectures.filter((item) => !item.locked);
    const skipped = allLectures.length - lectures.length;
    if (allLectures.length === 0) {
        videoState = { phase: "error", code: "none", total: 0, done: 0, completed: 0, failed: 0, skipped: 0, note: texts.none };
        return videoState;
    }

    videoState = { phase: "running", code: "running", total: lectures.length, done: 0, completed: 0, failed: 0, skipped, note: "" };
    notify(texts.started(lectures.length));
    let stopped = false;

    for (const item of lectures) {
        if (videoPageMoved(slug, userId)) {
            stopped = true;
            break;
        }
        // an id that cannot go in the event path is reported as a failure and never sent,
        // so a syllabus that lies about its own ids cannot address another lecture
        if (!videoIsKeyId(item.id) || !videoIsSlug(slug)) {
            videoState.done += 1;
            videoState.failed += 1;
            notify(texts.progress(videoState.done, videoState.total));
            continue;
        }
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

    // a run that lost its page or its account keeps what it already confirmed and writes
    // nothing more
    if (stopped) {
        videoState = {
            phase: "error",
            code: "stopped",
            total: videoState.total,
            done: videoState.done,
            completed: videoState.completed,
            failed: videoState.failed,
            skipped,
            note: texts.stopped
        };
        notify(texts.stopped);
        return videoState;
    }

    const tail = skipped > 0 ? texts.skipped(skipped) : "";
    const note = videoState.failed > 0
        ? texts.partial(videoState.completed, videoState.total, videoState.failed) + tail
        : texts.finished(videoState.completed, videoState.total) + tail;
    videoState = {
        phase: "done",
        code: videoState.failed > 0 ? "partial" : "done",
        total: videoState.total,
        done: videoState.done,
        completed: videoState.completed,
        failed: videoState.failed,
        skipped,
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
            skipped: videoState.skipped,
            note: texts.busy
        };
        return Promise.resolve(videoState);
    }

    videoRunning = true;
    // Coursera can hand out a new csrf token while the tab stays open, so the page state
    // is read again for every run instead of once per page load
    videoBootstrap = null;
    videoState = { phase: "running", code: "starting", total: 0, done: 0, completed: 0, failed: 0, skipped: 0, note: "" };
    runVideoCompletion()
        .catch(() => {
            videoState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, failed: 0, skipped: 0, note: texts.failed };
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
// answer the popup. The message is only ever a trigger: which course, which account and
// which lectures to use all come from the page, never from the message.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || typeof request.action !== "string") return false;
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
