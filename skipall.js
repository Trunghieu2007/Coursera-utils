// Skip everything.
//
// One button runs every completion module of the course in a fixed order: lecture videos,
// readings, discussions, practice items, labs and ungraded app items. Graded work is not in
// that list, and the read-only graded check is not started either: this button only finishes
// what each module can finish without a grade.
//
// The run starts with one scan of the course outline and of the per-course progress list, so
// the student sees how many items can be skipped and how many Coursera already reports as
// done before the first write goes out. Locked items are counted apart and never touched. The
// discussion step is left out when the reply box is empty, because that module only posts the
// text the student wrote.
//
// Each module still takes its own scan and still writes its items one at a time, so this file
// adds no path of its own to the server: it only calls the modules in order, waits for each
// run to finish and adds up what they report. The request mode setting is read by the modules
// themselves, so the whole run follows it without a second switch here.
//
// A module that reports a dead account, a changed page or an unreadable course stops the run
// before the next module starts. A module that simply finds nothing, or a discussion step
// without reply text, does not.
//
// The plumbing here is repeated on purpose from the other modules. All of these files are
// loaded in the same isolated world, so a shared helper name would collide, and keeping the
// modules self contained means any one of them can be dropped without touching the others.
//
// Nothing runs on its own. The module only works when the popup asks it to.

// the item types the four completion modules own, exactly once each
const SKIP_ALL_TYPES = [
    "lecture",
    "supplement",
    "discussionPrompt",
    "ungradedWidget",
    "ungradedLti",
    "ungradedLab",
    "interactivePlugin",
    "dialogue"
];

// the answers that mean the page or the account is not usable any more, so the rest of the
// list is left alone
const SKIP_ALL_FATAL = ["notCourse", "notLoggedIn", "identity", "stopped", "failed"];

const SKIP_ALL_TEXTS = {
    en: {
        started: (total, already, remaining) => remaining === 0
            ? `All ${total} skippable item${total === 1 ? " is" : "s are"} already done.`
            : already > 0
                ? `Found ${total} skippable items: ${already} already done, skipping the other ${remaining}.`
                : `Skipping ${total} item${total === 1 ? "" : "s"}, one at a time.`,
        progress: (done, total) => `Skipped ${done} of ${total} items.`,
        finished: (completed, already) => `Skip finished: ${completed} newly marked, ${already} already done. Reload the page to see the checkmarks.`,
        partial: (completed, already, failed) => `Skip finished: ${completed} newly marked, ${already} already done, ${failed} still ${failed === 1 ? "needs" : "need"} attention.`,
        unverified: (completed, already, unverified) => `Skip finished: ${completed} newly marked, ${already} already done, ${unverified} could not be read back.`,
        skipped: (count) => ` ${count} locked item${count === 1 ? "" : "s"} left alone.`,
        answered: (count) => ` ${count} discussion prompt${count === 1 ? "" : "s"} already had your answer.`,
        discussionLeft: " Discussion prompts were left alone because no reply text is set.",
        none: "No item that can be skipped was found in this course.",
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        identity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
        stopped: "The page changed while the run was going on, so the rest of the list was left alone.",
        failed: "The run stopped with an unexpected error. Check the browser console.",
        busy: "Skip everything is already running."
    },
    vi: {
        started: (total, already, remaining) => remaining === 0
            ? `Cả ${total} bài có thể skip đều đã xong.`
            : already > 0
                ? `Tìm thấy ${total} bài có thể skip: ${already} đã xong, còn ${remaining} bài sẽ skip.`
                : `Đang skip ${total} bài, từng bài một.`,
        progress: (done, total) => `Đã skip ${done}/${total} bài.`,
        finished: (completed, already) => `Đã skip xong: ${completed} bài vừa đánh dấu, ${already} bài đã xong từ trước. Reload trang để thấy dấu tick.`,
        partial: (completed, already, failed) => `Đã skip xong: ${completed} bài vừa đánh dấu, ${already} bài đã xong từ trước, còn ${failed} bài chưa được.`,
        unverified: (completed, already, unverified) => `Đã skip xong: ${completed} bài vừa đánh dấu, ${already} bài đã xong từ trước, còn ${unverified} bài đã ghi nhưng không đọc lại được.`,
        skipped: (count) => ` ${count} bài bị khoá được bỏ qua.`,
        answered: (count) => ` ${count} thảo luận đã có câu trả lời của bạn.`,
        discussionLeft: " Các thảo luận được bỏ qua vì chưa có nội dung trả lời.",
        none: "Không tìm thấy bài nào có thể skip trong khoá học này.",
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        identity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
        stopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
        failed: "Lần chạy dừng vì một lỗi bất ngờ. Xem console của trình duyệt.",
        busy: "Skip mọi bài đang chạy."
    }
};

let skipAllRunning = false;
let skipAllLanguage = "en";
let skipAllState = { phase: "idle", code: "idle", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, discussionLeft: 0, answered: 0, note: "" };
let skipAllBootstrapData = null;
let skipAllRunPromise = Promise.resolve();

// pick the string table for the saved language
function skipAllTexts() {
    return SKIP_ALL_TEXTS[skipAllLanguage] || SKIP_ALL_TEXTS.en;
}

// the page writes its own start-up state into an inline script, and that state already holds
// the signed-in user id, so the scan needs no request to learn who is signed in
function loadSkipAllBootstrap() {
    if (skipAllBootstrapData) return skipAllBootstrapData;
    const found = { userId: "" };
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
        const text = scripts[i].textContent || "";
        if (text.indexOf("window.App") < 0) continue;
        const user = text.match(/"userData"\s*:\s*\{\s*"id"\s*:\s*"?(\d+)"?/);
        if (user) found.userId = user[1];
        break;
    }
    skipAllBootstrapData = found;
    return found;
}

// read one Coursera API endpoint with the session cookie. This module only reads, so no
// header, no csrf token and no write path of its own exists here
async function skipAllRequest(url, options = {}) {
    return fetch(url, Object.assign({ credentials: "include" }, options));
}

// read a JSON body, empty object when the answer is not JSON
async function skipAllJson(response) {
    return response.json().catch(() => ({}));
}

// the course slug of the current page, empty when the page is not a course page
function skipAllCourseSlug() {
    const match = window.location.pathname.match(/\/learn\/([^/]+)/);
    return match && match[1] ? match[1] : "";
}

// the account the cookie names, "" when the page carries no such cookie
function skipAllCookieUser() {
    const cookie = document.cookie.match(/(?:^|;\s*)c_user=([^;]+)/);
    return cookie && /^\d+$/.test(cookie[1]) ? cookie[1] : "";
}

// the signed-in user id, empty when the page and Coursera both stay silent
async function skipAllUserId() {
    const fromPage = loadSkipAllBootstrap().userId;
    if (fromPage) return fromPage;
    const fromCookie = skipAllCookieUser();
    if (fromCookie) return fromCookie;
    // Coursera answers this finder with 405 today, so it is only a last try
    const response = await skipAllRequest("/api/users.v1?q=me");
    if (response.ok) {
        const data = await skipAllJson(response);
        const me = data.elements && data.elements[0];
        if (me && /^\d+$/.test(String(me.id))) return String(me.id);
    }
    return "";
}

// the whole course tree, locked items included on purpose
async function skipAllSyllabus(slug) {
    const url = "/api/onDemandCourseMaterials.v2/?q=slug&slug=" + encodeURIComponent(slug)
        + "&includes=modules,lessons,items,gradingParameters"
        + "&fields=moduleIds,onDemandCourseMaterialModules.v1(lessonIds,optional),"
        + "onDemandCourseMaterialLessons.v1(elementIds,optional,itemIds),"
        + "onDemandCourseMaterialItems.v2(name,slug,isLocked,lockedStatus,itemLockedReasonCode,itemClass,timeCommitment,contentSummary)"
        + "&showLockedItems=true";
    const response = await skipAllRequest(url);
    if (!response.ok) return null;
    return skipAllJson(response);
}

// the internal course id, used by the progress list
function skipAllCourseId(syllabus) {
    const linked = syllabus.linked || {};
    const grading = linked["onDemandGradingParameters.v1"];
    if (grading && grading[0] && grading[0].id) return grading[0].id;
    const elements = syllabus.elements || [];
    if (elements[0] && elements[0].id) return elements[0].id;
    return "";
}

// the per-course progress list, the same one every module scans before it writes
async function skipAllCourseProgressItems(userId, courseId) {
    const key = encodeURIComponent(userId + "~" + courseId);
    const response = await skipAllRequest("/api/onDemandCoursesProgress.v1/" + key + "?fields=items", { cache: "no-store" });
    if (!response.ok) return null;
    const data = await skipAllJson(response);
    const record = (data.elements || [])[0];
    const items = record && record.items;
    if (!items || typeof items !== "object") return null;
    return items;
}

// true when the progress list already reports the item as done
function skipAllItemCompleted(items, itemId) {
    if (!items || !Object.prototype.hasOwnProperty.call(items, itemId)) return false;
    const entry = items[itemId];
    return Boolean(entry && entry.progressState === "Completed");
}

// an item the course will not let the student open yet
function skipAllItemIsLocked(item) {
    if (item.isLocked === true) return true;
    const status = String(item.lockedStatus || "").trim().toLowerCase();
    return status === "locked" || status.indexOf("locked_") === 0 || status.indexOf("hard_locked") === 0;
}

// the discussion step only runs when the student has written a reply. An unset box means the
// module falls back to its own default sentence, so only an explicitly cleared box counts as
// no text at all.
async function skipAllDiscussionPossible() {
    const stored = await chrome.storage.local.get(["discussionReply"]);
    if (typeof stored.discussionReply === "string") return stored.discussionReply.trim().length > 0;
    return true;
}

// the scan the run starts with: how many items the modules own, how many are already done,
// how many are locked, and how many prompts are left alone because there is no reply text
function skipAllPlan(syllabus, progressItems, discussionPossible) {
    const linked = syllabus.linked || {};
    const items = linked["onDemandCourseMaterialItems.v2"] || [];
    const seen = new Set();
    const plan = { total: 0, already: 0, skipped: 0, discussionLeft: 0 };
    for (const item of items) {
        if (!item || !item.id || seen.has(item.id)) continue;
        seen.add(item.id);
        const type = item.contentSummary ? item.contentSummary.typeName : "";
        if (SKIP_ALL_TYPES.indexOf(type) < 0) continue;
        if (skipAllItemIsLocked(item)) {
            plan.skipped += 1;
            continue;
        }
        if (type === "discussionPrompt" && !discussionPossible) {
            plan.discussionLeft += 1;
            continue;
        }
        plan.total += 1;
        if (skipAllItemCompleted(progressItems, item.id)) plan.already += 1;
    }
    return plan;
}

// the modules in the order the run takes them, each with a start, a wait and a state reader.
// A module that is not on the page is simply not part of the run.
function skipAllScopes() {
    const scopes = [];
    if (typeof startVideoCompletion === "function" && typeof waitForVideoRun === "function" && typeof videoCurrentState === "function") {
        scopes.push({ start: () => startVideoCompletion(), wait: () => waitForVideoRun(), read: () => videoCurrentState() });
    }
    if (typeof startReadingCompletion === "function" && typeof waitForReadingRun === "function" && typeof readingCurrentState === "function") {
        scopes.push({ start: () => startReadingCompletion(), wait: () => waitForReadingRun(), read: () => readingCurrentState() });
    }
    if (typeof startDiscussionCompletion === "function" && typeof waitForDiscussionRun === "function" && typeof discussionCurrentState === "function") {
        scopes.push({ start: () => startDiscussionCompletion(), wait: () => waitForDiscussionRun(), read: () => discussionCurrentState() });
    }
    if (typeof startPluginCompletion === "function" && typeof waitForPluginRun === "function" && typeof pluginCurrentState === "function") {
        scopes.push({ start: () => startPluginCompletion("practice"), wait: () => waitForPluginRun(), read: () => pluginCurrentState() });
        scopes.push({ start: () => startPluginCompletion("labs"), wait: () => waitForPluginRun(), read: () => pluginCurrentState() });
        scopes.push({ start: () => startPluginCompletion("lti"), wait: () => waitForPluginRun(), read: () => pluginCurrentState() });
    }
    return scopes;
}

// the queue is slow on purpose, so the page can move on half way through
function skipAllPageMoved(slug, userId) {
    if (skipAllCourseSlug() !== slug) return true;
    const cookieUser = skipAllCookieUser();
    return Boolean(cookieUser) && cookieUser !== String(userId);
}

// a module that is already running is waited for instead of being asked again, because a
// second start would only answer busy
async function skipAllWaitBusy(scopes) {
    for (const scope of scopes) {
        const state = scope.read();
        if (state && state.phase === "running") await Promise.resolve(scope.wait()).catch(() => {});
    }
}

// add one finished module state to the running total
function skipAllAdd(total, state) {
    total.total += Number(state.total) || 0;
    total.done += Number(state.done) || 0;
    total.completed += Number(state.completed) || 0;
    total.already += Number(state.already) || 0;
    total.unverified += Number(state.unverified) || 0;
    total.failed += Number(state.failed) || 0;
    total.answered += Number(state.answered) || 0;
    return total;
}

// run every module in order and add up what they report
async function runSkipEverything() {
    const texts = skipAllTexts();
    const slug = skipAllCourseSlug();
    if (!slug) {
        skipAllState = { phase: "error", code: "notCourse", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, discussionLeft: 0, answered: 0, note: texts.notCourse };
        return skipAllState;
    }

    const userId = await skipAllUserId();
    if (!userId) {
        skipAllState = { phase: "error", code: "notLoggedIn", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, discussionLeft: 0, answered: 0, note: texts.notLoggedIn };
        return skipAllState;
    }

    // the cookie and the page state name the same account on a real course page, so a page
    // that names a different one is not a page this run should be writing for
    const cookieUser = skipAllCookieUser();
    if (cookieUser && cookieUser !== String(userId)) {
        skipAllState = { phase: "error", code: "identity", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, discussionLeft: 0, answered: 0, note: texts.identity };
        return skipAllState;
    }

    const syllabus = await skipAllSyllabus(slug);
    if (!syllabus) {
        skipAllState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, discussionLeft: 0, answered: 0, note: texts.failed };
        return skipAllState;
    }

    const courseId = skipAllCourseId(syllabus);
    const progressItems = courseId ? await skipAllCourseProgressItems(userId, courseId) : null;
    const discussionPossible = await skipAllDiscussionPossible();
    const plan = skipAllPlan(syllabus, progressItems, discussionPossible);

    if (plan.total === 0 && plan.skipped === 0 && plan.discussionLeft === 0) {
        skipAllState = { phase: "error", code: "none", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, discussionLeft: 0, answered: 0, note: texts.none };
        return skipAllState;
    }

    skipAllState = { phase: "running", code: "running", total: plan.total, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: plan.skipped, discussionLeft: plan.discussionLeft, answered: 0, note: "" };
    skipAllNotify(texts.started(plan.total, plan.already, plan.total - plan.already));

    const scopes = skipAllScopes();
    await skipAllWaitBusy(scopes);

    const totals = { total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: plan.skipped, discussionLeft: plan.discussionLeft, answered: 0 };
    let fatal = "";

    for (const scope of scopes) {
        if (skipAllPageMoved(slug, userId)) {
            fatal = "stopped";
            break;
        }
        scope.start();
        await Promise.resolve(scope.wait()).catch(() => {});
        let state = scope.read() || {};
        // a start that landed while another run of the same module was still going answers
        // busy; that run is waited for instead of being counted twice
        if (state.code === "busy" || state.phase === "running") {
            await Promise.resolve(scope.wait()).catch(() => {});
            state = scope.read() || {};
        }
        if (state.code === "noText") {
            totals.discussionLeft = Math.max(totals.discussionLeft, 1);
            continue;
        }
        skipAllAdd(totals, state);
        if (SKIP_ALL_FATAL.indexOf(state.code) >= 0) {
            fatal = state.code;
            break;
        }
        skipAllState = {
            phase: "running",
            code: "running",
            total: totals.total,
            done: totals.done,
            completed: totals.completed,
            already: totals.already,
            unverified: totals.unverified,
            failed: totals.failed,
            skipped: totals.skipped,
            discussionLeft: totals.discussionLeft,
            answered: totals.answered,
            note: ""
        };
        if (totals.total > 0) skipAllNotify(texts.progress(totals.done, totals.total));
    }

    if (fatal) {
        skipAllState = {
            phase: "error",
            code: fatal,
            total: totals.total,
            done: totals.done,
            completed: totals.completed,
            already: totals.already,
            unverified: totals.unverified,
            failed: totals.failed,
            skipped: totals.skipped,
            discussionLeft: totals.discussionLeft,
            answered: totals.answered,
            note: texts[fatal] || texts.failed
        };
        skipAllNotify(skipAllState.note);
        return skipAllState;
    }

    const tail = (totals.skipped > 0 ? texts.skipped(totals.skipped) : "")
        + (totals.answered > 0 ? texts.answered(totals.answered) : "")
        + (totals.discussionLeft > 0 ? texts.discussionLeft : "");
    let code;
    let note;
    if (totals.failed > 0) {
        code = "partial";
        note = texts.partial(totals.completed, totals.already, totals.failed) + tail;
    } else if (totals.unverified > 0) {
        code = "unverified";
        note = texts.unverified(totals.completed, totals.already, totals.unverified) + tail;
    } else {
        code = "done";
        note = texts.finished(totals.completed, totals.already) + tail;
    }

    skipAllState = {
        phase: "done",
        code,
        total: totals.total,
        done: totals.done,
        completed: totals.completed,
        already: totals.already,
        unverified: totals.unverified,
        failed: totals.failed,
        skipped: totals.skipped,
        discussionLeft: totals.discussionLeft,
        answered: totals.answered,
        note
    };
    skipAllNotify(note);
    return skipAllState;
}

// start the run in the background, the popup follows the state on its own
function startSkipEverything() {
    const texts = skipAllTexts();
    if (skipAllRunning) {
        // the busy answer is handed back without touching the state of the run that is
        // already going
        return Promise.resolve(Object.assign({}, skipAllState, { code: "busy", note: texts.busy }));
    }

    skipAllRunning = true;
    // Coursera can hand out a new csrf token while the tab stays open, so the page state is
    // read again for every run instead of once per page load
    skipAllBootstrapData = null;
    skipAllState = { phase: "running", code: "starting", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, discussionLeft: 0, answered: 0, note: "" };
    skipAllRunPromise = runSkipEverything()
        .catch(() => {
            skipAllState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, discussionLeft: 0, answered: 0, note: texts.failed };
        })
        .finally(() => {
            skipAllRunning = false;
        });
    return Promise.resolve(skipAllState);
}

// the promise of the run that is going, so the popup can wait for it
function waitForSkipAllRun() {
    return skipAllRunPromise;
}

// the current state, read directly by the popup poll
function skipAllCurrentState() {
    return skipAllState;
}

// show a notice on the page, the toast helper lives in content.js
function skipAllNotify(text) {
    if (typeof showToast === "function") showToast(text);
}

// read the saved language
function loadSkipAllLanguage() {
    return chrome.storage.local.get(["language"]).then((stored) => {
        skipAllLanguage = SKIP_ALL_TEXTS[stored.language] ? stored.language : "en";
    });
}

// answer the popup. The message is only ever a trigger: which course, which account and
// which modules to use all come from the page, never from the message.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || typeof request.action !== "string") return false;
    if (request.action === "skipEverything") {
        startSkipEverything().then((state) => sendResponse(state)).catch(() => sendResponse({ phase: "error" }));
        return true;
    }
    if (request.action === "skipAllStatus") {
        sendResponse(skipAllState);
        return true;
    }
    return false;
});

// keep the language in sync with the popup
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.language && SKIP_ALL_TEXTS[changes.language.newValue]) skipAllLanguage = changes.language.newValue;
});

loadSkipAllLanguage();
