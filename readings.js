// Reading completion.
//
// The module marks the reading supplements of the current course as completed. Coursera
// stores a reading as a syllabus item whose content type is "supplement", and the web
// client records a finished reading by creating an onDemandSupplementCompletions record,
// so the module creates the same record through the same endpoint.
//
// The plumbing here is repeated on purpose from video.js. Both files are loaded in the
// same isolated world, so a shared helper name would collide, and keeping the two
// modules self contained means either one can be dropped without touching the other.
//
// Nothing runs on its own. The module only works when the popup asks it to.

const READING_ITEM_DELAY = 700;

const READING_TEXTS = {
    en: {
        started: (count) => `Completing ${count} reading${count === 1 ? "" : "s"}, one at a time.`,
        progress: (done, total) => `Completed ${done} of ${total} readings.`,
        finished: (completed, total) => `Completed ${completed} of ${total} readings. Reload the page to see the checkmarks.`,
        partial: (completed, total, failed) => `Completed ${completed} of ${total} readings. ${failed} still need attention.`,
        unverified: (completed, total, unverified) => `${completed} of ${total} readings are confirmed, ${unverified} could not be read back.`,
        none: "No reading material was found in this course.",
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        busy: "Reading completion is already running."
    },
    vi: {
        started: (count) => `Đang hoàn thành ${count} bài đọc, từng bài một.`,
        progress: (done, total) => `Đã hoàn thành ${done}/${total} bài đọc.`,
        finished: (completed, total) => `Đã hoàn thành ${completed}/${total} bài đọc. Reload trang để thấy dấu tick.`,
        partial: (completed, total, failed) => `Đã hoàn thành ${completed}/${total} bài đọc. ${failed} bài chưa được.`,
        unverified: (completed, total, unverified) => `${completed}/${total} bài đọc đã xác minh, còn ${unverified} bài đã ghi nhưng không đọc lại được.`,
        none: "Không tìm thấy bài đọc nào trong khoá học này.",
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        busy: "Hoàn thành bài đọc đang chạy."
    }
};

let readingRunning = false;
let readingLanguage = "en";
let readingState = { phase: "idle", code: "idle", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, note: "" };

// pick the string table for the saved language
function readingTexts() {
    return READING_TEXTS[readingLanguage] || READING_TEXTS.en;
}

// wait for a number of milliseconds
function readingSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// CSRF token from the course cookie, empty when the cookie is not readable
function readingCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)CSRF3-Token=([^;]+)/) || document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return match && match[1] ? match[1] : "";
}

// headers every API call needs
function readingHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = readingCsrfToken();
    if (token) headers["X-CSRF3-Token"] = token;
    return headers;
}

// call the Coursera API, dropping the CSRF header when the server rejects it
async function readingRequest(url, options = {}) {
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
async function readingJson(response) {
    return response.json().catch(() => ({}));
}

// the course slug of the current page, empty when the page is not a course page
function readingCourseSlug() {
    const match = window.location.pathname.match(/\/learn\/([^/]+)/);
    return match && match[1] ? match[1] : "";
}

// the signed-in user id, empty when Coursera does not answer
async function readingUserId() {
    const response = await readingRequest("/api/users.v1?q=me");
    if (response.ok) {
        const data = await readingJson(response);
        const me = data.elements && data.elements[0];
        if (me && me.id) return String(me.id);
    }
    const cookie = document.cookie.match(/(?:^|;\s*)c_user=([^;]+)/);
    return cookie && cookie[1] ? cookie[1] : "";
}

// the whole course tree, with the item list Coursera uses for the outline
async function readingSyllabus(slug) {
    const url = "/api/onDemandCourseMaterials.v2/?q=slug&slug=" + encodeURIComponent(slug)
        + "&includes=modules,lessons,items,gradingParameters"
        + "&fields=moduleIds,onDemandCourseMaterialModules.v1(lessonIds,optional),"
        + "onDemandCourseMaterialLessons.v1(elementIds,optional,itemIds),"
        + "onDemandCourseMaterialItems.v2(name,slug,isLocked,itemClass,timeCommitment,contentSummary)";
    const response = await readingRequest(url);
    if (!response.ok) return null;
    return readingJson(response);
}

// the internal course id, used by the reading completion record
function readingCourseId(syllabus) {
    const linked = syllabus.linked || {};
    const grading = linked["onDemandGradingParameters.v1"];
    if (grading && grading[0] && grading[0].id) return grading[0].id;
    const elements = syllabus.elements || [];
    if (elements[0] && elements[0].id) return elements[0].id;
    return "";
}

// the reading supplements of the course, every other item type is left alone
function supplementItems(syllabus) {
    const linked = syllabus.linked || {};
    const items = linked["onDemandCourseMaterialItems.v2"] || [];
    return items
        .filter((item) => {
            const type = item && item.contentSummary ? item.contentSummary.typeName : "";
            return item && item.id && type === "supplement";
        })
        .map((item) => ({ id: item.id, name: item.name || item.id }));
}

// the body the completion endpoint takes, with the user id in the form the record wants
function completionBody(userId, courseId, itemId) {
    const numeric = Number(userId);
    return { userId: Number.isNaN(numeric) ? String(userId) : numeric, courseId, itemId };
}

// read one completion record back, so a bare HTTP 200 is never treated as done
async function readCompletion(userId, courseId, itemId) {
    const id = userId + "~" + courseId + "~" + itemId;
    const response = await readingRequest("/api/onDemandSupplementCompletions.v1/" + encodeURIComponent(id));
    if (!response.ok) return false;
    const data = await readingJson(response);
    return Boolean((data && data.id) || (data && data.elements && data.elements.length));
}

// complete one reading: create the record, then confirm it exists
async function completeSupplement(userId, courseId, item) {
    const url = "/api/onDemandSupplementCompletions.v1";
    let body = completionBody(userId, courseId, item.id);
    let response = await readingRequest(url, { method: "POST", headers: readingHeaders(), body: JSON.stringify(body) });

    // a numeric user id that the server refuses is retried once as plain text
    if (response.status === 400 && typeof body.userId === "number") {
        body = { userId: String(userId), courseId, itemId: item.id };
        response = await readingRequest(url, { method: "POST", headers: readingHeaders(), body: JSON.stringify(body) });
    }

    if (!response.ok) return "failed";

    // the create call answers with the record it wrote, which is already a read back
    const created = await readingJson(response);
    if (created && (created.id || (created.elements && created.elements.length))) return "completed";

    return (await readCompletion(userId, courseId, item.id)) ? "completed" : "unverified";
}

// run the whole course, one reading at a time
async function runReadingCompletion() {
    const texts = readingTexts();
    const slug = readingCourseSlug();
    if (!slug) {
        readingState = { phase: "error", code: "notCourse", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, note: texts.notCourse };
        return readingState;
    }

    const userId = await readingUserId();
    if (!userId) {
        readingState = { phase: "error", code: "notLoggedIn", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, note: texts.notLoggedIn };
        return readingState;
    }

    const syllabus = await readingSyllabus(slug);
    if (!syllabus) {
        readingState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, note: texts.notCourse };
        return readingState;
    }

    const courseId = readingCourseId(syllabus);
    const readings = supplementItems(syllabus);
    if (readings.length === 0) {
        readingState = { phase: "error", code: "none", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, note: texts.none };
        return readingState;
    }

    readingState = { phase: "running", code: "running", total: readings.length, done: 0, completed: 0, unverified: 0, failed: 0, note: "" };
    readingNotify(texts.started(readings.length));

    for (const item of readings) {
        const result = await completeSupplement(userId, courseId, item);
        readingState.done += 1;
        if (result === "completed") readingState.completed += 1;
        else if (result === "unverified") readingState.unverified += 1;
        else readingState.failed += 1;

        readingNotify(texts.progress(readingState.done, readingState.total));
        await readingSleep(READING_ITEM_DELAY);
    }

    let note;
    let code;
    if (readingState.failed > 0) {
        code = "partial";
        note = texts.partial(readingState.completed, readingState.total, readingState.failed);
    } else if (readingState.unverified > 0) {
        code = "unverified";
        note = texts.unverified(readingState.completed, readingState.total, readingState.unverified);
    } else {
        code = "done";
        note = texts.finished(readingState.completed, readingState.total);
    }

    readingState = {
        phase: "done",
        code,
        total: readingState.total,
        done: readingState.done,
        completed: readingState.completed,
        unverified: readingState.unverified,
        failed: readingState.failed,
        note
    };
    readingNotify(note);
    return readingState;
}

// start the run in the background, the popup follows the state on its own
function startReadingCompletion() {
    const texts = readingTexts();
    if (readingRunning) {
        readingState = {
            phase: "running",
            code: "busy",
            total: readingState.total,
            done: readingState.done,
            completed: readingState.completed,
            unverified: readingState.unverified,
            failed: readingState.failed,
            note: texts.busy
        };
        return Promise.resolve(readingState);
    }

    readingRunning = true;
    readingState = { phase: "running", code: "starting", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, note: "" };
    runReadingCompletion()
        .catch(() => {
            readingState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, note: texts.notCourse };
        })
        .finally(() => {
            readingRunning = false;
        });
    return Promise.resolve(readingState);
}

// show a notice on the page, the toast helper lives in content.js
function readingNotify(text) {
    if (typeof showToast === "function") showToast(text);
}

// read the saved language
function loadReadingLanguage() {
    return chrome.storage.local.get(["language"]).then((stored) => {
        readingLanguage = READING_TEXTS[stored.language] ? stored.language : "en";
    });
}

// answer the popup while the run is going on
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "completeReadings") {
        startReadingCompletion().then((state) => sendResponse(state)).catch(() => sendResponse({ phase: "error" }));
        return true;
    }
    if (request.action === "readingStatus") {
        sendResponse(readingState);
        return true;
    }
    return false;
});

// keep the language in sync with the popup
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.language && READING_TEXTS[changes.language.newValue]) readingLanguage = changes.language.newValue;
});

loadReadingLanguage();
