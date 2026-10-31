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
// The module also guards against a page that is not honest: the account named by the
// cookie and the account written into the page state have to agree or the run refuses to
// start, an id that is not a plain id never becomes part of a record key, and a queue that
// is still running stops when the page moves or another account takes over.
//
// Nothing runs on its own. The module only works when the popup asks it to.

const READING_ITEM_DELAY = 700;

const READING_TEXTS = {
    en: {
        started: (total, already, remaining) => remaining === 0
            ? `All ${total} reading${total === 1 ? "" : "s"} are already complete.`
            : already > 0
                ? `Found ${total} reading${total === 1 ? "" : "s"}: ${already} already complete, completing the other ${remaining}.`
                : `Completing ${total} reading${total === 1 ? "" : "s"}, one at a time.`,
        progress: (done, total) => `Completed ${done} of ${total} readings.`,
        finished: (completed, total) => `Completed ${completed} of ${total} readings. Reload the page to see the checkmarks.`,
        partial: (completed, total, failed) => `Completed ${completed} of ${total} readings. ${failed} still ${failed === 1 ? "needs" : "need"} attention.`,
        unverified: (completed, total, unverified) => `${completed} of ${total} readings are confirmed, ${unverified} could not be read back.`,
        none: "No reading material was found in this course.",
        failed: "The run stopped with an unexpected error. Check the browser console.",
        skipped: (count) => ` ${count} locked reading${count === 1 ? "" : "s"} left alone.`,
        already: (count) => ` ${count} reading${count === 1 ? " was" : "s were"} already complete.`,
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        identity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
        stopped: "The page changed while the run was going on, so the rest of the list was left alone.",
        busy: "Reading completion is already running."
    },
    vi: {
        started: (total, already, remaining) => remaining === 0
            ? `Cả ${total} bài đọc đều đã hoàn thành.`
            : already > 0
                ? `Tìm thấy ${total} bài đọc: ${already} đã xong, còn ${remaining} sẽ hoàn thành.`
                : `Đang hoàn thành ${total} bài đọc, từng bài một.`,
        progress: (done, total) => `Đã hoàn thành ${done}/${total} bài đọc.`,
        finished: (completed, total) => `Đã hoàn thành ${completed}/${total} bài đọc. Reload trang để thấy dấu tick.`,
        partial: (completed, total, failed) => `Đã hoàn thành ${completed}/${total} bài đọc. ${failed} bài chưa được.`,
        unverified: (completed, total, unverified) => `${completed}/${total} bài đọc đã xác minh, còn ${unverified} bài đã ghi nhưng không đọc lại được.`,
        none: "Không tìm thấy bài đọc nào trong khoá học này.",
        failed: "Lần chạy dừng vì một lỗi bất ngờ. Xem console của trình duyệt.",
        skipped: (count) => ` ${count} bài đọc bị khoá được bỏ qua.`,
        already: (count) => ` ${count} bài đọc đã hoàn thành từ trước.`,
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        identity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
        stopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
        busy: "Hoàn thành bài đọc đang chạy."
    }
};

let readingRunning = false;
let readingLanguage = "en";
let readingRequestMode = "sequential";
let readingState = { phase: "idle", code: "idle", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, note: "" };
let readingBootstrapData = null;
let readingRunPromise = Promise.resolve();

// pick the string table for the saved language
function readingTexts() {
    return READING_TEXTS[readingLanguage] || READING_TEXTS.en;
}

// wait for a number of milliseconds
function readingSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// instant mode removes the deliberate pause between items; the requests still go one at a
// time and in the same order
function readingPace(ms) {
    return readingRequestMode === "instant" ? 0 : ms;
}

// the page writes its own start-up state into an inline script, and that state already
// holds the signed-in user id and the csrf token, so neither needs a request
function loadReadingBootstrap() {
    if (readingBootstrapData) return readingBootstrapData;
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
    readingBootstrapData = found;
    return found;
}

// a token read out of a cookie or out of the page is only usable if the browser is
// allowed to put it in a header: a control character makes fetch throw and a cookie that
// is not valid URL encoding makes decodeURIComponent throw, so both cases drop the token
// instead of sending a header the server was going to refuse anyway
function readingUsableToken(value) {
    let text = String(value || "");
    try {
        text = decodeURIComponent(text);
    } catch {
        /* keep the raw value when it is not URL encoded */
    }
    return /^[\x20-\x7E]*$/.test(text) ? text : "";
}

// CSRF token from the course cookie, or from the page state when the cookie is hidden
function readingCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)CSRF3-Token=([^;]+)/) || document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    if (match && match[1]) return readingUsableToken(match[1]);
    return readingUsableToken(loadReadingBootstrap().csrf);
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

// the account the cookie names, "" when the page carries no such cookie
function readingCookieUser() {
    const cookie = document.cookie.match(/(?:^|;\s*)c_user=([^;]+)/);
    return cookie && /^\d+$/.test(cookie[1]) ? cookie[1] : "";
}

// the signed-in user id, empty when the page and Coursera both stay silent
async function readingUserId() {
    const fromPage = loadReadingBootstrap().userId;
    if (fromPage) return fromPage;
    const fromCookie = readingCookieUser();
    if (fromCookie) return fromCookie;
    // Coursera answers this finder with 405 today, so it is only a last try
    const response = await readingRequest("/api/users.v1?q=me");
    if (response.ok) {
        const data = await readingJson(response);
        const me = data.elements && data.elements[0];
        if (me && /^\d+$/.test(String(me.id))) return String(me.id);
    }
    return "";
}

// the whole course tree, with the item list Coursera uses for the outline. Locked items
// are asked for on purpose: they have to be seen to be left alone.
async function readingSyllabus(slug) {
    const url = "/api/onDemandCourseMaterials.v2/?q=slug&slug=" + encodeURIComponent(slug)
        + "&includes=modules,lessons,items,gradingParameters"
        + "&fields=moduleIds,onDemandCourseMaterialModules.v1(lessonIds,optional),"
        + "onDemandCourseMaterialLessons.v1(elementIds,optional,itemIds),"
        + "onDemandCourseMaterialItems.v2(name,slug,isLocked,lockedStatus,itemLockedReasonCode,itemClass,timeCommitment,contentSummary)"
        + "&showLockedItems=true";
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

// the per-course progress list, the same record the outline checkmark is read from. One
// read tells the run what is already done before it writes anything.
async function readingCourseProgressItems(userId, courseId) {
    const key = encodeURIComponent(userId + "~" + courseId);
    const response = await readingRequest("/api/onDemandCoursesProgress.v1/" + key + "?fields=items", { cache: "no-store" });
    if (!response.ok) return null;
    const data = await readingJson(response);
    const record = (data.elements || [])[0];
    const items = record && record.items;
    if (!items || typeof items !== "object") return null;
    return items;
}

// true when Coursera's own progress list already reports the reading as done
function readingItemCompleted(items, itemId) {
    if (!items || !Object.prototype.hasOwnProperty.call(items, itemId)) return false;
    const entry = items[itemId];
    return Boolean(entry && entry.progressState === "Completed");
}

// a reading the course will not let the student open yet
function readingItemIsLocked(item) {
    if (item.isLocked === true) return true;
    const status = String(item.lockedStatus || "").trim().toLowerCase();
    return status === "locked" || status.indexOf("locked_") === 0 || status.indexOf("hard_locked") === 0;
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
        .map((item) => ({ id: item.id, name: item.name || item.id, locked: readingItemIsLocked(item) }));
}

// a completion record is keyed by user, course and item joined with "~", so a part that
// carries a separator, a slash or a query mark would put the record somewhere the course
// never asked for. Coursera's own ids are plain, so a part that is not plain is never
// sent at all.
function readingIsKeyId(value) {
    return /^[A-Za-z0-9._-]{1,64}$/.test(String(value));
}

// the three parts of one record key, checked together
function readingKeyIsSafe(userId, courseId, itemId) {
    return readingIsKeyId(userId) && readingIsKeyId(courseId) && readingIsKeyId(itemId);
}

// the queue is slow on purpose, so the page can move on half way through. When it does,
// or when another account takes over the tab, the rest of the list is left alone.
function readingPageMoved(slug, userId) {
    if (readingCourseSlug() !== slug) return true;
    const cookieUser = readingCookieUser();
    return Boolean(cookieUser) && cookieUser !== String(userId);
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
        readingState = { phase: "error", code: "notCourse", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, note: texts.notCourse };
        return readingState;
    }

    const userId = await readingUserId();
    if (!userId) {
        readingState = { phase: "error", code: "notLoggedIn", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, note: texts.notLoggedIn };
        return readingState;
    }

    // the cookie and the page state name the same account on a real course page, so a page
    // that names a different one is not a page this run should be writing for
    const cookieUser = readingCookieUser();
    if (cookieUser && cookieUser !== String(userId)) {
        readingState = { phase: "error", code: "identity", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, note: texts.identity };
        return readingState;
    }

    const syllabus = await readingSyllabus(slug);
    if (!syllabus) {
        readingState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, note: texts.failed };
        return readingState;
    }

    const courseId = readingCourseId(syllabus);
    const allReadings = supplementItems(syllabus);
    const readings = allReadings.filter((item) => !item.locked);
    const skipped = allReadings.length - readings.length;
    if (allReadings.length === 0) {
        readingState = { phase: "error", code: "none", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, note: texts.none };
        return readingState;
    }

    // one read-only scan before the first write: the readings Coursera already reports as
    // complete are counted and left alone, and only the rest is sent
    const progressItems = await readingCourseProgressItems(userId, courseId);
    const alreadyCount = readings.filter((item) => readingItemCompleted(progressItems, item.id)).length;
    const remaining = readings.length - alreadyCount;

    readingState = { phase: "running", code: "running", total: readings.length, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped, note: "" };
    let stopped = false;

    for (const item of readings) {
        if (readingPageMoved(slug, userId)) {
            stopped = true;
            break;
        }
        // the scan already said this reading is done, so it costs no request at all
        if (readingItemCompleted(progressItems, item.id)) {
            readingState.already += 1;
            readingState.done += 1;
            continue;
        }
        const safe = readingKeyIsSafe(userId, courseId, item.id);
        // an id the record key cannot hold is reported as a failure and never sent, so a
        // syllabus that lies about its own ids cannot move a record into another key
        const result = safe ? await completeSupplement(userId, courseId, item) : "failed";
        readingState.done += 1;
        if (result === "completed") readingState.completed += 1;
        else if (result === "unverified") readingState.unverified += 1;
        else readingState.failed += 1;

        // only a real write needs the pause, a refused id costs nothing
        if (safe) await readingSleep(readingPace(READING_ITEM_DELAY));
    }

    // a run that lost its page or its account keeps what it already confirmed and writes
    // nothing more
    if (stopped) {
        readingState = {
            phase: "error",
            code: "stopped",
            total: readingState.total,
            done: readingState.done,
            completed: readingState.completed,
            already: readingState.already,
            unverified: readingState.unverified,
            failed: readingState.failed,
            skipped,
            note: texts.stopped
        };
        return readingState;
    }

    const tail = (skipped > 0 ? texts.skipped(skipped) : "")
        + (readingState.already > 0 ? texts.already(readingState.already) : "");
    let note;
    let code;
    if (readingState.failed > 0) {
        code = "partial";
        note = texts.partial(readingState.completed, readingState.total, readingState.failed) + tail;
    } else if (readingState.unverified > 0) {
        code = "unverified";
        note = texts.unverified(readingState.completed, readingState.total, readingState.unverified) + tail;
    } else {
        code = "done";
        note = texts.finished(readingState.completed, readingState.total) + tail;
    }

    readingState = {
        phase: "done",
        code,
        total: readingState.total,
        done: readingState.done,
        completed: readingState.completed,
        already: readingState.already,
        unverified: readingState.unverified,
        failed: readingState.failed,
        skipped,
        note
    };
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
            already: readingState.already,
            unverified: readingState.unverified,
            failed: readingState.failed,
            skipped: readingState.skipped,
            note: texts.busy
        };
        return Promise.resolve(readingState);
    }

    readingRunning = true;
    // Coursera can hand out a new csrf token while the tab stays open, so the page state
    // is read again for every run instead of once per page load
    readingBootstrapData = null;
    readingState = { phase: "running", code: "starting", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, note: "" };
    readingRunPromise = runReadingCompletion()
        .catch(() => {
            readingState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, note: texts.failed };
        })
        .finally(() => {
            readingRunning = false;
        });
    return Promise.resolve(readingState);
}

// the run that is going on, so the skip-all step can wait for the module to finish
function waitForReadingRun() {
    return readingRunPromise;
}

// the current state, so the skip-all step can read the counts directly
function readingCurrentState() {
    return readingState;
}

// let the skip-all run use its own pacing for one pass, without touching the saved setting
function readingSetRequestMode(mode) {
    readingRequestMode = mode === "instant" ? "instant" : "sequential";
}

// read the saved language and request mode
function loadReadingLanguage() {
    return chrome.storage.local.get(["language", "requestMode"]).then((stored) => {
        readingLanguage = READING_TEXTS[stored.language] ? stored.language : "en";
        readingRequestMode = stored.requestMode === "instant" ? "instant" : "sequential";
    });
}

// answer the popup while the run is going on
// answer the popup. The message is only ever a trigger: which course, which account and
// which readings to use all come from the page, never from the message.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || typeof request.action !== "string") return false;
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
    if (changes.requestMode) readingRequestMode = changes.requestMode.newValue === "instant" ? "instant" : "sequential";
});

loadReadingLanguage();
