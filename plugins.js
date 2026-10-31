// Practice item, lab and app item completion.
//
// Coursera keeps every practice item that is not a video, a reading or a discussion
// prompt as a syllabus item with its own content type: "ungradedWidget" for the
// interactive widgets, "ungradedLti" for the external hands-on labs that are launched
// through an LTI tool, "ungradedLab" for the notebook and sandpit labs, and
// "interactivePlugin" or "dialogue" for the rest. None of them has a grade attached, and
// all of them are marked done by a small record on the server rather than by real
// interaction.
//
// The module serves three completion buttons and one read-only check, and a run finishes
// only the items of its own scope. The practice button takes the widget and plain-record
// items. The app button takes only the ungraded LTI items, which Coursera labels "Ungraded
// App Item" in the syllabus, and the lab button only the items Coursera labels "Lab",
// because those two live on their own progress services and a student may want to finish
// one without touching the rest.
//
// The read-only check looks at the graded app items of the course - the "gradedLti" items
// Coursera labels "Graded App Item", such as an AI graded final project - and reports how
// many are complete. It writes nothing, submits nothing and never ticks an honor code.
//
// The module writes that record for each item of the current course, one item at a time.
// A widget is completed the way the web client does it: a progress record keyed by the
// student, the course and the item, carrying the session the widget runs in. An app item is
// completed by asking Coursera for a launch that marks it done, because that launch is the
// only write Coursera itself uses for those items. A lab is completed through the same two
// GraphQL mutations the lab page sends: the started mutation its launch button sends, then
// the completion mutation its "Mark as completed" button sends. That gateway answers 200
// even when it refuses the field, so the answer body decides there and never the status.
// Everything else gets the plain completion record. The launch is asked of
// Coursera and stops there: the external tool is never opened,
// so the student's name and email never reach the tool provider, and the agreement box on
// the cover page of an app item is never ticked — that box is the student consenting to hand
// those details over, which this module has no business doing on their behalf.
//
// Two things make a run safe to start and to repeat. An item that Coursera already
// reports as completed is left alone, so a second run writes nothing. And a write is only
// counted as done when it can be read back, so a bare HTTP 200 is never treated as
// success; a write that was accepted but cannot be read back is reported separately.
//
// Three more things hold when the page itself is not honest. The account named by the
// cookie and the account written into the page state have to agree, or the run refuses to
// start. An item id, course id or user id that is not a plain id never becomes part of a
// record key, because a key is built by joining three ids with "~". And a queue that is
// still running stops when the page moves to another course or another account takes over.
//
// Graded work is out of scope on purpose: quizzes, exams, graded labs (the "gradedLab"
// content type), assignments and peer reviews are never matched by a completion run. The
// graded app check only reads that last type and never writes. Neither is the AI coach item
// (the "coach" content type) matched, because that one is a conversation with the coach
// rather than a completion record, and a "plugin" content type is not in Coursera's own
// strings, so it is not guessed at either.
//
// The plumbing here is repeated on purpose from video.js, readings.js and discussions.js.
// All of these files are loaded in the same isolated world, so a shared helper name would
// collide, and keeping the modules self contained means any one of them can be dropped
// without touching the others.
//
// Nothing runs on its own. The module only works when the popup asks it to.

const PLUGIN_ITEM_DELAY = 3000;
// instant mode keeps a short second look at a write that is not readable yet, because the
// progress list trails the write either way
const PLUGIN_INSTANT_READBACK_DELAYS = [1000];
// the per-course progress list can trail a write by a few seconds, so a write that is not
// visible on the first read gets a few slower second looks before it is called unreadable
const PLUGIN_READBACK_DELAYS = [1500, 2500, 4000];

// the content types this module knows how to finish, and how
const PLUGIN_WIDGET_TYPES = ["ungradedWidget"];
// Coursera labels an ungradedLti item "Ungraded App Item" in the syllabus and "Practice App
// Item" on its cover page: an external lab (Skills Network and the like) that the student
// opens through a signed LTI form. The item has no progress record of its own, so the
// launch request is the only write.
const PLUGIN_LTI_TYPES = ["ungradedLti"];
// an ungradedLab item - the Jupyter notebook labs and the "sandpit" style exercises, which
// Coursera labels "Lab" in the syllabus - has its own progress service behind Coursera's
// GraphQL gateway. The lab page's "Mark as completed" button sends exactly the mutation
// below, and the gateway answers HTTP 200 both when the field runs and when it is refused,
// so a reply only counts when its body carries the field.
const PLUGIN_LAB_TYPES = ["ungradedLab"];
const PLUGIN_LAB_URL = "/graphql-gateway?opname=MarkUngradedLabComplete";
const PLUGIN_LAB_QUERY = "mutation MarkUngradedLabComplete($input: UngradedLabProgress_MarkItemCompleteInput!) {"
    + " UngradedLabProgress_MarkItemComplete(input: $input) { _ } }";
// Coursera marks a lab started when the launch button is pressed, and the lab page only
// offers "Mark as completed" once that happened. The complete mutation is therefore sent
// after this one; the started answer is best effort and decides nothing on its own.
const PLUGIN_LAB_STARTED_URL = "/graphql-gateway?opname=MarkUngradedLabStarted";
const PLUGIN_LAB_STARTED_QUERY = "mutation MarkUngradedLabStarted($input: UngradedLabProgress_MarkItemStartedInput!) {"
    + " UngradedLabProgress_MarkItemStarted(input: $input) { _ } }";
// a graded app item - Coursera's "Graded App Item", the AI graded final project and the
// like - is graded work. It is read here, never written: no completion record, no launch,
// no honor code and no submission.
const PLUGIN_GRADED_TYPES = ["gradedLti"];
const PLUGIN_RECORD_TYPES = ["interactivePlugin", "dialogue"];

const PLUGIN_TEXTS = {
    en: {
        started: (total, already, remaining) => remaining === 0
            ? `All ${total} practice item${total === 1 ? "" : "s"} are already done.`
            : already > 0
                ? `Found ${total} practice item${total === 1 ? "" : "s"}: ${already} already done, marking the other ${remaining}.`
                : `Marking ${total} practice item${total === 1 ? "" : "s"} as done, one at a time.`,
        progress: (done, total) => `Marked ${done} of ${total} practice items.`,
        finished: (completed, total) => `Marked ${completed} of ${total} practice items as done. Reload the page to see the checkmarks.`,
        partial: (completed, total, failed) => `Marked ${completed} of ${total} practice items. ${failed} still ${failed === 1 ? "needs" : "need"} attention.`,
        unverified: (completed, total, unverified) => `${completed} of ${total} items are confirmed, ${unverified} could not be read back.`,
        none: "No ungraded practice item was found in this course.",
        failed: "The run stopped with an unexpected error. Check the browser console.",
        skipped: (count) => ` ${count} locked item${count === 1 ? "" : "s"} left alone.`,
        already: (count) => ` ${count} item${count === 1 ? " was" : "s were"} already done.`,
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        identity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
        stopped: "The page changed while the run was going on, so the rest of the list was left alone.",
        busy: "Practice item completion is already running."
    },
    vi: {
        started: (total, already, remaining) => remaining === 0
            ? `Cả ${total} bài thực hành đều đã xong.`
            : already > 0
                ? `Tìm thấy ${total} bài thực hành: ${already} đã xong, còn ${remaining} bài sẽ đánh dấu.`
                : `Đang đánh dấu ${total} bài thực hành là đã xong, từng bài một.`,
        progress: (done, total) => `Đã đánh dấu ${done}/${total} bài thực hành.`,
        finished: (completed, total) => `Đã đánh dấu ${completed}/${total} bài thực hành là đã xong. Reload trang để thấy dấu tick.`,
        partial: (completed, total, failed) => `Đã đánh dấu ${completed}/${total} bài thực hành. ${failed} bài chưa được.`,
        unverified: (completed, total, unverified) => `${completed}/${total} bài đã xác minh, còn ${unverified} bài đã ghi nhưng không đọc lại được.`,
        none: "Không tìm thấy bài thực hành nào trong khoá học này.",
        failed: "Lần chạy dừng vì một lỗi bất ngờ. Xem console của trình duyệt.",
        skipped: (count) => ` ${count} bài bị khoá được bỏ qua.`,
        already: (count) => ` ${count} bài đã được đánh dấu xong từ trước.`,
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        identity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
        stopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
        busy: "Hoàn thành bài thực hành đang chạy."
    }
};

// the lab button has its own wording, because a run of that scope only ever touches the
// items Coursera labels "Lab"
const LAB_TEXTS = {
    en: {
        started: (total, already, remaining) => remaining === 0
            ? `All ${total} lab${total === 1 ? "" : "s"} are already done.`
            : already > 0
                ? `Found ${total} lab${total === 1 ? "" : "s"}: ${already} already done, marking the other ${remaining}.`
                : `Marking ${total} lab${total === 1 ? "" : "s"} as done, one at a time.`,
        progress: (done, total) => `Marked ${done} of ${total} labs.`,
        finished: (completed, total) => `Marked ${completed} of ${total} labs as done. Reload the page to see the checkmarks.`,
        partial: (completed, total, failed) => `Marked ${completed} of ${total} labs. ${failed} still ${failed === 1 ? "needs" : "need"} attention.`,
        unverified: (completed, total, unverified) => `${completed} of ${total} labs are confirmed, ${unverified} could not be read back.`,
        none: "No lab was found in this course.",
        failed: "The run stopped with an unexpected error. Check the browser console.",
        skipped: (count) => ` ${count} locked lab${count === 1 ? "" : "s"} left alone.`,
        already: (count) => ` ${count} lab${count === 1 ? " was" : "s were"} already done.`,
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        identity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
        stopped: "The page changed while the run was going on, so the rest of the list was left alone.",
        busy: "Lab completion is already running."
    },
    vi: {
        started: (total, already, remaining) => remaining === 0
            ? `Cả ${total} lab đều đã xong.`
            : already > 0
                ? `Tìm thấy ${total} lab: ${already} đã xong, còn ${remaining} bài sẽ đánh dấu.`
                : `Đang đánh dấu ${total} lab là đã xong, từng bài một.`,
        progress: (done, total) => `Đã đánh dấu ${done}/${total} lab.`,
        finished: (completed, total) => `Đã đánh dấu ${completed}/${total} lab là đã xong. Reload trang để thấy dấu tick.`,
        partial: (completed, total, failed) => `Đã đánh dấu ${completed}/${total} lab. ${failed} bài chưa được.`,
        unverified: (completed, total, unverified) => `${completed}/${total} lab đã xác minh, còn ${unverified} bài đã ghi nhưng không đọc lại được.`,
        none: "Không tìm thấy lab nào trong khoá học này.",
        failed: "Lần chạy dừng vì một lỗi bất ngờ. Xem console của trình duyệt.",
        skipped: (count) => ` ${count} lab bị khoá được bỏ qua.`,
        already: (count) => ` ${count} lab đã được đánh dấu xong từ trước.`,
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        identity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
        stopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
        busy: "Hoàn thành lab đang chạy."
    }
};

// the app item button has its own wording too: that scope only ever touches the external
// labs Coursera labels "Ungraded App Item"
const LTI_TEXTS = {
    en: {
        started: (total, already, remaining) => remaining === 0
            ? `All ${total} ungraded lab${total === 1 ? "" : "s"} are already done.`
            : already > 0
                ? `Found ${total} ungraded lab${total === 1 ? "" : "s"}: ${already} already done, marking the other ${remaining}.`
                : `Marking ${total} ungraded lab${total === 1 ? "" : "s"} as done, one at a time.`,
        progress: (done, total) => `Marked ${done} of ${total} ungraded labs.`,
        finished: (completed, total) => `Marked ${completed} of ${total} ungraded labs as done. Reload the page to see the checkmarks.`,
        partial: (completed, total, failed) => `Marked ${completed} of ${total} ungraded labs. ${failed} still ${failed === 1 ? "needs" : "need"} attention.`,
        unverified: (completed, total, unverified) => `${completed} of ${total} ungraded labs are confirmed, ${unverified} could not be read back.`,
        none: "No ungraded lab was found in this course.",
        failed: "The run stopped with an unexpected error. Check the browser console.",
        skipped: (count) => ` ${count} locked ungraded lab${count === 1 ? "" : "s"} left alone.`,
        already: (count) => ` ${count} ungraded lab${count === 1 ? " was" : "s were"} already done.`,
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        identity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
        stopped: "The page changed while the run was going on, so the rest of the list was left alone.",
        busy: "Ungraded lab completion is already running."
    },
    vi: {
        started: (total, already, remaining) => remaining === 0
            ? `Cả ${total} lab chưa cho điểm đều đã xong.`
            : already > 0
                ? `Tìm thấy ${total} lab chưa cho điểm: ${already} đã xong, còn ${remaining} bài sẽ đánh dấu.`
                : `Đang đánh dấu ${total} lab chưa cho điểm là đã xong, từng bài một.`,
        progress: (done, total) => `Đã đánh dấu ${done}/${total} lab chưa cho điểm.`,
        finished: (completed, total) => `Đã đánh dấu ${completed}/${total} lab chưa cho điểm là đã xong. Reload trang để thấy dấu tick.`,
        partial: (completed, total, failed) => `Đã đánh dấu ${completed}/${total} lab chưa cho điểm. ${failed} bài chưa được.`,
        unverified: (completed, total, unverified) => `${completed}/${total} lab chưa cho điểm đã xác minh, còn ${unverified} bài đã ghi nhưng không đọc lại được.`,
        none: "Không tìm thấy lab chưa cho điểm nào trong khoá học này.",
        failed: "Lần chạy dừng vì một lỗi bất ngờ. Xem console của trình duyệt.",
        skipped: (count) => ` ${count} lab chưa cho điểm bị khoá được bỏ qua.`,
        already: (count) => ` ${count} lab chưa cho điểm đã được đánh dấu xong từ trước.`,
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        identity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
        stopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
        busy: "Hoàn thành lab chưa cho điểm đang chạy."
    }
};

// the graded app check has its own wording too: it reports a count and says plainly that
// nothing is submitted or changed
const GRADED_TEXTS = {
    en: {
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        identity: "The page and Coursera name two different accounts, so nothing was read. Reload the page.",
        none: "No graded app item was found in this course.",
        failed: "The graded app items could not be read. Check the browser console.",
        read: (completed, total) => `Graded app items completed: ${completed} of ${total}. This extension never submits or changes graded work.`
    },
    vi: {
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        identity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đọc. Hãy reload trang.",
        none: "Không tìm thấy app chấm điểm nào trong khoá học này.",
        failed: "Không đọc được các app chấm điểm. Xem console của trình duyệt.",
        read: (completed, total) => `App chấm điểm đã hoàn thành: ${completed}/${total}. Extension này không nộp hay sửa bài chấm điểm.`
    }
};

let pluginRunning = false;
let pluginLanguage = "en";
let pluginRequestMode = "sequential";
let pluginState = { phase: "idle", code: "idle", scope: "practice", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: "" };
let pluginBootstrapData = null;
let pluginRunPromise = Promise.resolve();

// pick the string table of a run scope in the saved language
function pluginTexts(scope) {
    const table = scope === "labs" ? LAB_TEXTS : scope === "lti" ? LTI_TEXTS : PLUGIN_TEXTS;
    return table[pluginLanguage] || table.en;
}

// wait for a number of milliseconds
function pluginSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// instant mode removes the deliberate pause between items; the requests still go one at a
// time and in the same order
function pluginPace(ms) {
    return pluginRequestMode === "instant" ? 0 : ms;
}

// the second looks a write gets when the progress list has not caught up yet
function pluginReadbackDelays() {
    return pluginRequestMode === "instant" ? PLUGIN_INSTANT_READBACK_DELAYS : PLUGIN_READBACK_DELAYS;
}

// the page writes its own start-up state into an inline script, and that state already
// holds the signed-in user id and the csrf token, so neither needs a request
function loadPluginBootstrap() {
    if (pluginBootstrapData) return pluginBootstrapData;
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
    pluginBootstrapData = found;
    return found;
}

// a token read out of a cookie or out of the page is only usable if the browser is
// allowed to put it in a header: a line break or a control character makes fetch throw,
// and a cookie that is not valid URL encoding makes decodeURIComponent throw, so both
// cases drop the token instead of sending it, and the request then goes without a header
// the server was going to refuse anyway
function pluginUsableToken(value) {
    let text = String(value || "");
    try {
        text = decodeURIComponent(text);
    } catch {
        /* keep the raw value when it is not URL encoded */
    }
    return /^[\x20-\x7E]*$/.test(text) ? text : "";
}

// CSRF token from the course cookie, or from the page state when the cookie is hidden
function pluginCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)CSRF3-Token=([^;]+)/) || document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    if (match && match[1]) return pluginUsableToken(match[1]);
    return pluginUsableToken(loadPluginBootstrap().csrf);
}

// headers every API call needs
function pluginHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = pluginCsrfToken();
    if (token) headers["X-CSRF3-Token"] = token;
    return headers;
}

// call the Coursera API, dropping the CSRF header when the server rejects it
async function pluginRequest(url, options = {}) {
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
async function pluginJson(response) {
    return response.json().catch(() => ({}));
}

// the course slug of the current page, empty when the page is not a course page
function pluginCourseSlug() {
    const match = window.location.pathname.match(/\/learn\/([^/]+)/);
    return match && match[1] ? match[1] : "";
}

// the account the cookie names, "" when the page carries no such cookie
function pluginCookieUser() {
    const cookie = document.cookie.match(/(?:^|;\s*)c_user=([^;]+)/);
    return cookie && /^\d+$/.test(cookie[1]) ? cookie[1] : "";
}

// the signed-in user id, empty when the page and Coursera both stay silent
async function pluginUserId() {
    const fromPage = loadPluginBootstrap().userId;
    if (fromPage) return fromPage;
    const fromCookie = pluginCookieUser();
    if (fromCookie) return fromCookie;
    // Coursera answers this finder with 405 today, so it is only a last try
    const response = await pluginRequest("/api/users.v1?q=me");
    if (response.ok) {
        const data = await pluginJson(response);
        const me = data.elements && data.elements[0];
        if (me && /^\d+$/.test(String(me.id))) return String(me.id);
    }
    return "";
}

// the whole course tree, with the item list Coursera uses for the outline. Locked items
// are asked for on purpose: they have to be seen to be left alone.
async function pluginSyllabus(slug) {
    const url = "/api/onDemandCourseMaterials.v2/?q=slug&slug=" + encodeURIComponent(slug)
        + "&includes=modules,lessons,items,gradingParameters"
        + "&fields=moduleIds,onDemandCourseMaterialModules.v1(lessonIds,optional),"
        + "onDemandCourseMaterialLessons.v1(elementIds,optional,itemIds),"
        + "onDemandCourseMaterialItems.v2(name,slug,isLocked,lockedStatus,itemLockedReasonCode,itemClass,timeCommitment,contentSummary)"
        + "&showLockedItems=true";
    const response = await pluginRequest(url);
    if (!response.ok) return null;
    return pluginJson(response);
}

// the internal course id, used by every completion record
function pluginCourseId(syllabus) {
    const linked = syllabus.linked || {};
    const grading = linked["onDemandGradingParameters.v1"];
    if (grading && grading[0] && grading[0].id) return grading[0].id;
    const elements = syllabus.elements || [];
    if (elements[0] && elements[0].id) return elements[0].id;
    return "";
}

// an item the course will not let the student open yet
function pluginItemIsLocked(item) {
    if (item.isLocked === true) return true;
    const status = String(item.lockedStatus || "").trim().toLowerCase();
    return status === "locked" || status.indexOf("locked_") === 0 || status.indexOf("hard_locked") === 0;
}

// which write an item type needs, empty when this module must not touch it
function pluginRoute(typeName) {
    if (PLUGIN_WIDGET_TYPES.indexOf(typeName) >= 0) return "widget";
    if (PLUGIN_LTI_TYPES.indexOf(typeName) >= 0) return "lti";
    if (PLUGIN_LAB_TYPES.indexOf(typeName) >= 0) return "lab";
    if (PLUGIN_RECORD_TYPES.indexOf(typeName) >= 0) return "record";
    return "";
}

// the items of one run scope: videos, readings, prompts and graded work are left to their
// own modules or to the student, and each button only takes the routes it owns. The graded
// check is the exception: it takes exactly the graded app items and reads them, never marks
// them.
function pluginItems(syllabus, scope) {
    const linked = syllabus.linked || {};
    const items = linked["onDemandCourseMaterialItems.v2"] || [];
    const seen = new Set();
    const found = [];
    for (const item of items) {
        if (!item || !item.id) continue;
        const type = item.contentSummary ? item.contentSummary.typeName : "";
        if (scope === "graded") {
            if (PLUGIN_GRADED_TYPES.indexOf(type) < 0) continue;
            if (seen.has(item.id)) continue;
            seen.add(item.id);
            found.push({ id: item.id, name: item.name || item.id, type, route: "graded", locked: pluginItemIsLocked(item) });
            continue;
        }
        const route = pluginRoute(type);
        if (!route) continue;
        // the lab button takes only the "Lab" items, the app button only the "Ungraded App
        // Item" ones, and the practice button neither of those
        if (scope === "labs" && route !== "lab") continue;
        if (scope === "lti" && route !== "lti") continue;
        if (scope === "practice" && (route === "lab" || route === "lti")) continue;
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        found.push({ id: item.id, name: item.name || item.id, type, route, locked: pluginItemIsLocked(item) });
    }
    return found;
}

// the key every completion record of an item is stored under
function pluginKey(userId, courseId, itemId) {
    return encodeURIComponent(userId + "~" + courseId + "~" + itemId);
}

// a record key is three ids joined by "~", so a part carrying a separator, a slash or a
// query mark would put the record somewhere the course never asked for. Coursera's own
// ids are plain, so a part that is not plain is never sent at all.
function pluginIsKeyId(value) {
    return /^[A-Za-z0-9._-]{1,64}$/.test(String(value));
}

// the three parts of one record key, checked together
function pluginKeyIsSafe(userId, courseId, itemId) {
    return pluginIsKeyId(userId) && pluginIsKeyId(courseId) && pluginIsKeyId(itemId);
}

// the queue is slow on purpose, so the page can move on half way through. When it does,
// or when another account takes over the tab, the rest of the list is left alone.
function pluginPageMoved(slug, userId) {
    if (pluginCourseSlug() !== slug) return true;
    const cookieUser = pluginCookieUser();
    return Boolean(cookieUser) && cookieUser !== String(userId);
}

// the per-course progress list: one record holding the state of every item of the course,
// which is what the outline checkmark is read from. It is keyed by the student and the course
// rather than by the item, the way the course page's own bundle pairs a course with its
// progress record, and the state of each item sits in an "items" map inside that record. A
// list that does not answer is read as no answer at all, never as an item that is not done.
// The map is returned whole for callers that need the state of many items at once.
async function pluginCourseProgressItems(userId, courseId) {
    const key = encodeURIComponent(userId + "~" + courseId);
    const response = await pluginRequest("/api/onDemandCoursesProgress.v1/" + key + "?fields=items", { cache: "no-store" });
    if (!response.ok) return null;
    const data = await pluginJson(response);
    const record = (data.elements || [])[0];
    const items = record && record.items;
    if (!items || typeof items !== "object") return null;
    return items;
}

async function pluginCourseProgressState(userId, courseId, itemId) {
    const items = await pluginCourseProgressItems(userId, courseId);
    if (!items || !Object.prototype.hasOwnProperty.call(items, itemId)) return "";
    const entry = items[itemId];
    return entry && entry.progressState ? String(entry.progressState) : "";
}

// true when a progress list already read into memory reports the item as done
function pluginProgressItemCompleted(items, itemId) {
    if (!items || !Object.prototype.hasOwnProperty.call(items, itemId)) return false;
    const entry = items[itemId];
    return Boolean(entry && entry.progressState === "Completed");
}

// what Coursera says about one item, read from the records that can hold it. The widget
// progress record and the completion record are both keyed by student, course and item, so
// those two GETs are on a resource this module has just written to. An app item has neither:
// its state only shows up in the per-course list, so for that route the list is asked first
// and the other two are skipped, because writing nothing means there is nothing to read back
// there. An ungraded lab keeps its state in that same list. When none of them answers, the
// caller reports the item as unconfirmed rather than as done.
async function pluginReadBack(userId, courseId, itemId, route) {
    if (route === "lti" || route === "lab") return await pluginCourseProgressState(userId, courseId, itemId);

    const key = pluginKey(userId, courseId, itemId);

    const progress = await pluginRequest("/api/onDemandWidgetProgress.v1/" + key + "?fields=progressState");
    if (progress.ok) {
        const data = await pluginJson(progress);
        const record = (data.elements || [])[0];
        if (record && record.progressState) return String(record.progressState);
    }

    const completed = await pluginRequest("/api/onDemandCompletedItems.v1/" + key);
    if (completed.ok) {
        const data = await pluginJson(completed);
        if ((data.elements || []).length > 0 || data.id) return "Completed";
    }

    // the completion record can be kept elsewhere for an item type this module only knows
    // by name, so the course list gets one last say before the item counts as unread
    return await pluginCourseProgressState(userId, courseId, itemId);
}

// the session a widget runs in. Coursera keeps one active session per student and course,
// so a single lookup covers every widget of the run; the per-item record is asked only
// when that lookup comes back empty.
async function pluginCourseSession(userId, courseId) {
    const url = "/api/onDemandSessionMemberships.v1?courseId=" + encodeURIComponent(courseId)
        + "&userId=" + encodeURIComponent(userId)
        + "&q=activeByUserAndCourse&fields=id,createdAt,sessionId,userId";
    const response = await pluginRequest(url);
    if (!response.ok) return "";
    const data = await pluginJson(response);
    const record = (data.elements || [])[0];
    return record && record.sessionId ? String(record.sessionId) : "";
}

// the branch a lab progress record belongs to. Coursera's own lab hook takes the active
// session's branch and falls back to the course id, which is what every course that is not
// run in cohorts uses. A lookup that fails keeps that fallback rather than failing the run.
async function pluginLabBranchId(userId, courseId) {
    const url = "/api/onDemandSessionMemberships.v1?courseId=" + encodeURIComponent(courseId)
        + "&userId=" + encodeURIComponent(userId)
        + "&q=activeByUserAndCourse&includes=sessions"
        + "&fields=onDemandSessions.v1(branchId)";
    const response = await pluginRequest(url);
    if (!response.ok) return courseId;
    const data = await pluginJson(response);
    const linked = data.linked || {};
    const sessions = linked["onDemandSessions.v1"] || [];
    const session = sessions[0];
    return session && session.branchId ? String(session.branchId) : courseId;
}

// the same session, looked up for one item instead of for the whole course
async function pluginItemSession(userId, courseId, itemId) {
    const key = pluginKey(userId, courseId, itemId);
    const response = await pluginRequest("/api/onDemandWidgetSessions.v1/" + key + "?fields=session,sessionId");
    if (!response.ok) return "";
    const data = await pluginJson(response);
    const record = (data.elements || [])[0];
    if (!record) return "";
    if (record.sessionId) return String(record.sessionId);
    if (record.session && record.session.id) return String(record.session.id);
    return "";
}

// the widget progress record: the same PUT the web client sends when a widget reports
// that the student reached its end
async function pluginPutProgress(userId, courseId, itemId, sessionId) {
    const key = pluginKey(userId, courseId, itemId);
    const body = { progressState: "Completed" };
    if (sessionId) body.sessionId = sessionId;
    const response = await pluginRequest("/api/onDemandWidgetProgress.v1/" + key, {
        method: "PUT",
        headers: pluginHeaders(),
        body: JSON.stringify(body)
    });
    return response.ok;
}

// the plain completion record, which is what Coursera keeps for an item that has no
// progress of its own
async function pluginPostCompleted(userId, courseId, itemId) {
    const response = await pluginRequest("/api/onDemandCompletedItems.v1", {
        method: "POST",
        headers: pluginHeaders(),
        body: JSON.stringify({ userId: String(userId), courseId, itemId })
    });
    return response.ok;
}

// the started mutation the lab page sends when its launch button is pressed. The start is
// what lets Coursera offer the complete button, so it is always sent first for a lab that is
// not done yet; its own answer is not read back, because only the final state matters.
async function pluginPostLabStarted(courseId, branchId, itemId) {
    const response = await pluginRequest(PLUGIN_LAB_STARTED_URL, {
        method: "POST",
        headers: pluginHeaders(),
        body: JSON.stringify({
            operationName: "MarkUngradedLabStarted",
            variables: { input: { courseId, branchId, itemId } },
            query: PLUGIN_LAB_STARTED_QUERY
        })
    });
    const data = await pluginJson(response);
    return Boolean(data && data.data && data.data.UngradedLabProgress_MarkItemStarted);
}

// an ungraded lab is finished by the mutation the lab page's own "Mark as completed" button
// sends. That gateway answers 200 with an "errors" array when it refuses the field - an
// anonymous tab is refused with PERMISSION_DENIED and a 200 - so the body decides here, and a
// reply that carries no field is a refusal no matter what the status said. A branch is a
// property of the enrollment session, not of the course material, and Coursera's own hook
// falls back to the course id when the session has none, which is the case for every course
// that is not run in cohorts.
async function pluginPostLabComplete(courseId, branchId, itemId) {
    const response = await pluginRequest(PLUGIN_LAB_URL, {
        method: "POST",
        headers: pluginHeaders(),
        body: JSON.stringify({
            operationName: "MarkUngradedLabComplete",
            variables: { input: { courseId, branchId, itemId } },
            query: PLUGIN_LAB_QUERY
        })
    });
    const data = await pluginJson(response);
    if (data && data.data && data.data.UngradedLabProgress_MarkItemComplete) return "written";
    // an endpoint that is not there at all is the one case where the older plain record is
    // asked instead, the way the app item route treats a missing launch path; a refusal that
    // came back as an answer is final, because another write would be a second attempt at the
    // same item
    if (response.status === 404 || response.status === 405) return "absent";
    return "refused";
}

// one launch attempt, reported back with its status so the caller can tell a missing
// endpoint from a refused request
async function pluginPostLaunch(url, body) {
    const response = await pluginRequest(url, {
        method: "POST",
        headers: pluginHeaders(),
        body: JSON.stringify(body)
    });
    return { ok: response.ok, status: response.status };
}

// an ungraded app item is finished by asking Coursera for a launch that marks it done,
// because that launch is the only write the item has. The first request below is the one the
// course page's own bundle makes, body and all, including the literal token that bundle sends
// when the course does not ask for a captcha. A third-party build names the same operation
// under its older resource name, so that alias is asked only when the client path reports it
// is not there at all. Any other refusal - a captcha this tool will not solve, a course that
// is closed, a body the server does not like - is final, because a second attempt on the
// other path would be a second launch asked for one item.
async function pluginPostLtiLaunch(userId, courseId, itemId) {
    // both endpoints take the learner as a number, and a Coursera user id is digits
    if (!/^\d+$/.test(String(userId))) return false;
    const learnerId = Number(userId);

    const client = await pluginPostLaunch("/api/rest/v1/lti/ungradedLaunches", {
        courseId,
        itemId,
        learnerId,
        recaptchaToken: "token-not-required",
        launchAs: "LEARNER",
        markItemCompleted: true
    });
    if (client.ok) return true;
    if (client.status !== 404 && client.status !== 405) return false;

    const alias = await pluginPostLaunch("/api/onDemandLtiUngradedLaunches.v1/?fields=endpointUrl%2CauthRequestUrl%2CsignedProperties", {
        courseId,
        itemId,
        learnerId,
        markItemCompleted: true
    });
    return alias.ok;
}

// finish one item and read the result back, so the count only ever holds what Coursera
// can be shown to agree with
async function completePluginItem(item, context, sessionId) {
    let written = false;

    if (item.route === "widget") {
        const session = sessionId || await pluginItemSession(context.userId, context.courseId, item.id);
        written = await pluginPutProgress(context.userId, context.courseId, item.id, session);
        // the coarse record is written as well, the way the client does after a widget
        // ends: a widget that only got its progress record can still show as open
        await pluginPostCompleted(context.userId, context.courseId, item.id);
    } else if (item.route === "lti") {
        written = await pluginPostLtiLaunch(context.userId, context.courseId, item.id);
    } else if (item.route === "lab") {
        // the lab page starts an item from its launch button and only then offers the
        // complete button, so a lab Coursera has never seen started is started first here
        await pluginPostLabStarted(context.courseId, context.branchId, item.id);
        const attempt = await pluginPostLabComplete(context.courseId, context.branchId, item.id);
        if (attempt === "absent") written = await pluginPostCompleted(context.userId, context.courseId, item.id);
        else written = attempt === "written";
    } else {
        written = await pluginPostCompleted(context.userId, context.courseId, item.id);
    }

    const state = await pluginReadBack(context.userId, context.courseId, item.id, item.route);
    if (state === "Completed") return "completed";
    return written ? "unverified" : "failed";
}

// run the whole course, one item of the chosen scope at a time
async function runPluginCompletion(scope) {
    const texts = pluginTexts(scope);
    const slug = pluginCourseSlug();
    if (!slug) {
        pluginState = { phase: "error", code: "notCourse", scope, total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.notCourse };
        return pluginState;
    }

    const userId = await pluginUserId();
    if (!userId) {
        pluginState = { phase: "error", code: "notLoggedIn", scope, total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.notLoggedIn };
        return pluginState;
    }

    // the cookie and the page state name the same account on a real course page, so a
    // page that names a different one is not a page this run should be writing for
    const cookieUser = pluginCookieUser();
    if (cookieUser && cookieUser !== String(userId)) {
        pluginState = { phase: "error", code: "identity", scope, total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.identity };
        return pluginState;
    }

    const syllabus = await pluginSyllabus(slug);
    if (!syllabus) {
        pluginState = { phase: "error", code: "failed", scope, total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.failed };
        return pluginState;
    }

    const courseId = pluginCourseId(syllabus);
    const allItems = pluginItems(syllabus, scope);
    const items = allItems.filter((item) => !item.locked);
    const skipped = allItems.length - items.length;

    if (allItems.length === 0) {
        pluginState = { phase: "error", code: "none", scope, total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped, already: 0, note: texts.none };
        return pluginState;
    }

    // one read of the course progress list before anything is written, so the run knows
    // how many of its items Coursera already reports as done
    const scannedItems = await pluginCourseProgressItems(userId, courseId);
    const alreadyCount = items.filter((item) => pluginProgressItemCompleted(scannedItems, item.id)).length;
    const remaining = items.length - alreadyCount;

    pluginState = { phase: "running", code: "running", scope, total: items.length, done: 0, completed: 0, unverified: 0, failed: 0, skipped, already: 0, note: "" };
    pluginNotify(texts.started(items.length, alreadyCount, remaining));

    // one session lookup for the whole run, but only when the course actually has a
    // widget: every other item type writes its record without one. The branch a lab belongs
    // to is looked up the same way, and only when the course has a lab.
    const hasWidget = items.some((item) => item.route === "widget");
    const sessionId = hasWidget ? await pluginCourseSession(userId, courseId) : "";
    const hasLab = items.some((item) => item.route === "lab");
    const branchId = hasLab ? await pluginLabBranchId(userId, courseId) : "";
    const context = { userId, courseId, slug, branchId };
    const pendingReads = [];
    let stopped = false;

    for (const item of items) {
        if (pluginPageMoved(slug, userId)) {
            stopped = true;
            break;
        }
        // an id the record key cannot hold is reported as a failure and never sent, so a
        // syllabus that lies about its own ids cannot move a record into another key
        if (!pluginKeyIsSafe(userId, courseId, item.id)) {
            pluginState.failed += 1;
            pluginState.done += 1;
            pluginNotify(texts.progress(pluginState.done, pluginState.total));
            continue;
        }
        // the scan already said this item is done, so it costs no request at all
        if (pluginProgressItemCompleted(scannedItems, item.id)) {
            pluginState.already += 1;
            pluginState.done += 1;
            pluginNotify(texts.progress(pluginState.done, pluginState.total));
            continue;
        }
        const before = await pluginReadBack(userId, courseId, item.id, item.route);
        if (before === "Completed") {
            pluginState.already += 1;
        } else {
            const result = await completePluginItem(item, context, sessionId);
            if (result === "completed") pluginState.completed += 1;
            else if (result === "unverified") {
                pluginState.unverified += 1;
                pendingReads.push(item);
            } else pluginState.failed += 1;
            // only a real write needs the pause, an item already done costs nothing
            await pluginSleep(pluginPace(PLUGIN_ITEM_DELAY));
        }

        pluginState.done += 1;
        pluginNotify(texts.progress(pluginState.done, pluginState.total));
    }

    // a run that lost its page or its account keeps what it already confirmed and writes
    // nothing more
    if (stopped) {
        pluginState = {
            phase: "error",
            code: "stopped",
            scope,
            total: pluginState.total,
            done: pluginState.done,
            completed: pluginState.completed,
            unverified: pluginState.unverified,
            failed: pluginState.failed,
            skipped,
            already: pluginState.already,
            note: texts.stopped
        };
        pluginNotify(texts.stopped);
        return pluginState;
    }

    // a progress list that is still catching up is asked again a few times, so a write that
    // landed is counted as done instead of being reported as written but unreadable
    for (const delay of pluginReadbackDelays()) {
        if (pluginState.unverified === 0) break;
        await pluginSleep(delay);
        for (let i = pendingReads.length - 1; i >= 0; i--) {
            const item = pendingReads[i];
            const state = await pluginReadBack(userId, courseId, item.id, item.route);
            if (state !== "Completed") continue;
            pendingReads.splice(i, 1);
            pluginState.unverified -= 1;
            pluginState.completed += 1;
        }
    }

    const tail = (skipped > 0 ? texts.skipped(skipped) : "") + (pluginState.already > 0 ? texts.already(pluginState.already) : "");
    let note;
    let code;
    if (pluginState.failed > 0) {
        code = "partial";
        note = texts.partial(pluginState.completed, pluginState.total, pluginState.failed) + tail;
    } else if (pluginState.unverified > 0) {
        code = "unverified";
        note = texts.unverified(pluginState.completed, pluginState.total, pluginState.unverified) + tail;
    } else {
        code = "done";
        note = texts.finished(pluginState.completed, pluginState.total) + tail;
    }

    pluginState = {
        phase: "done",
        code,
        scope,
        total: pluginState.total,
        done: pluginState.done,
        completed: pluginState.completed,
        unverified: pluginState.unverified,
        failed: pluginState.failed,
        skipped,
        already: pluginState.already,
        note
    };
    pluginNotify(note);
    return pluginState;
}

// the read-only graded app check. It asks for the course outline and the per-course progress
// list once each, counts the graded app items that Coursera reports as complete, and reports
// that count. No write of any kind follows, so there is nothing to read back and nothing to
// retry: a failed read is reported as a failed read, and a 200 is never treated as a result.
async function runGradedCheck() {
    const texts = GRADED_TEXTS[pluginLanguage] || GRADED_TEXTS.en;
    const base = { scope: "graded", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0 };

    // the page state is read again for every check, so an account change between a run and
    // this check is seen rather than hidden behind the cache of the earlier read
    pluginBootstrapData = null;
    const slug = pluginCourseSlug();
    if (!slug) return Object.assign({}, base, { phase: "error", code: "notCourse", note: texts.notCourse });

    const userId = await pluginUserId();
    if (!userId) return Object.assign({}, base, { phase: "error", code: "notLoggedIn", note: texts.notLoggedIn });

    const cookieUser = pluginCookieUser();
    if (cookieUser && cookieUser !== String(userId)) {
        return Object.assign({}, base, { phase: "error", code: "identity", note: texts.identity });
    }

    const syllabus = await pluginSyllabus(slug);
    if (!syllabus) return Object.assign({}, base, { phase: "error", code: "failed", note: texts.failed });

    const courseId = pluginCourseId(syllabus);
    const items = pluginItems(syllabus, "graded");
    if (!items.length) return Object.assign({}, base, { phase: "error", code: "none", note: texts.none });

    const progress = await pluginCourseProgressItems(userId, courseId);
    if (!progress) {
        return Object.assign({}, base, { phase: "error", code: "failed", total: items.length, note: texts.failed });
    }

    let completed = 0;
    for (const item of items) {
        const entry = progress[item.id];
        if (entry && entry.progressState === "Completed") completed += 1;
    }

    const note = texts.read(completed, items.length);
    pluginNotify(note);
    return {
        phase: "done",
        code: "graded",
        scope: "graded",
        total: items.length,
        done: completed,
        completed,
        unverified: 0,
        failed: items.length - completed,
        skipped: 0,
        already: 0,
        note
    };
}

// start the run in the background, the popup follows the state on its own
function startPluginCompletion(scope = "practice") {
    const texts = pluginTexts(scope);
    if (pluginRunning) {
        // the busy answer is handed back without touching the state of the run that is
        // already going, so that run keeps reporting its own progress to its own button
        return Promise.resolve(Object.assign({}, pluginState, { code: "busy", note: texts.busy }));
    }

    pluginRunning = true;
    // Coursera can hand out a new csrf token while the tab stays open, so the page state
    // is read again for every run instead of once per page load
    pluginBootstrapData = null;
    pluginState = { phase: "running", code: "starting", scope, total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: "" };
    pluginRunPromise = runPluginCompletion(scope)
        .catch(() => {
            pluginState = { phase: "error", code: "failed", scope, total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.failed };
        })
        .finally(() => {
            pluginRunning = false;
        });
    return Promise.resolve(pluginState);
}

// the promise of the run that is going, so the skip-all step can wait for it
function waitForPluginRun() {
    return pluginRunPromise;
}

// the current state, so the skip-all step can read the counts directly
function pluginCurrentState() {
    return pluginState;
}

// show a notice on the page, the toast helper lives in content.js
function pluginNotify(text) {
    if (typeof showToast === "function") showToast(text);
}

// read the saved language and request mode
function loadPluginLanguage() {
    return chrome.storage.local.get(["language", "requestMode"]).then((stored) => {
        pluginLanguage = PLUGIN_TEXTS[stored.language] ? stored.language : "en";
        pluginRequestMode = stored.requestMode === "instant" ? "instant" : "sequential";
    });
}

// answer the popup. The message is only ever a trigger: which course, which account and
// which text to use all come from the page and from storage, never from the message.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || typeof request.action !== "string") return false;
    if (request.action === "completePlugins" || request.action === "completeLabs" || request.action === "completeLti") {
        const scope = request.action === "completeLabs" ? "labs" : request.action === "completeLti" ? "lti" : "practice";
        startPluginCompletion(scope).then((state) => sendResponse(state)).catch(() => sendResponse({ phase: "error" }));
        return true;
    }
    if (request.action === "pluginStatus" || request.action === "labStatus" || request.action === "ltiStatus") {
        sendResponse(pluginState);
        return true;
    }
    if (request.action === "checkGraded") {
        runGradedCheck().then((state) => sendResponse(state)).catch(() => sendResponse({ phase: "error", code: "failed", scope: "graded" }));
        return true;
    }
    return false;
});

// keep the language in sync with the popup
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.language && PLUGIN_TEXTS[changes.language.newValue]) pluginLanguage = changes.language.newValue;
    if (changes.requestMode) pluginRequestMode = changes.requestMode.newValue === "instant" ? "instant" : "sequential";
});

loadPluginLanguage();
