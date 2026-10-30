// Plugin, lab and notebook completion.
//
// Coursera keeps every practice item that is not a video, a reading or a discussion
// prompt as a syllabus item with its own content type: "ungradedWidget" for the
// interactive widgets, "ungradedLti" for the external notebooks and cloud labs that are
// launched through an LTI tool, and "interactivePlugin", "ungradedLab" or "dialogue" for
// the rest. None of them has a grade attached, and all of them are marked done by a small
// record on the server rather than by real interaction.
//
// The module writes that record for each item of the current course, one item at a time.
// A widget is completed the way the web client does it: a progress record keyed by the
// student, the course and the item, carrying the session the widget runs in. An app item is
// completed by asking Coursera for a launch that marks it done, because that launch is the
// only write Coursera itself uses for those items. Everything else gets the plain completion
// record. The launch is asked of Coursera and stops there: the external tool is never opened,
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
// Graded work is out of scope on purpose: quizzes, exams, graded labs, assignments and
// peer reviews are never matched here. Neither is the AI coach item (the "coach" content
// type), because that one is a conversation with the coach rather than a completion
// record, and a "plugin" content type is not in Coursera's own strings, so it is not
// guessed at either.
//
// The plumbing here is repeated on purpose from video.js, readings.js and discussions.js.
// All of these files are loaded in the same isolated world, so a shared helper name would
// collide, and keeping the modules self contained means any one of them can be dropped
// without touching the others.
//
// Nothing runs on its own. The module only works when the popup asks it to.

const PLUGIN_ITEM_DELAY = 3000;

// the content types this module knows how to finish, and how
const PLUGIN_WIDGET_TYPES = ["ungradedWidget"];
// Coursera labels an ungradedLti item "Practice App Item" on its cover page: an external
// lab (Skills Network and the like) that the student opens through a signed LTI form. The
// item has no progress record of its own, so the launch request is the only write.
const PLUGIN_LTI_TYPES = ["ungradedLti"];
const PLUGIN_RECORD_TYPES = ["interactivePlugin", "ungradedLab", "dialogue"];

const PLUGIN_TEXTS = {
    en: {
        started: (count) => `Marking ${count} practice item${count === 1 ? "" : "s"} as done, one at a time.`,
        progress: (done, total) => `Marked ${done} of ${total} practice items.`,
        finished: (completed, total) => `Marked ${completed} of ${total} practice items as done. Reload the page to see the checkmarks.`,
        partial: (completed, total, failed) => `Marked ${completed} of ${total} practice items. ${failed} still ${failed === 1 ? "needs" : "need"} attention.`,
        unverified: (completed, total, unverified) => `${completed} of ${total} items are confirmed, ${unverified} could not be read back.`,
        none: "No ungraded lab, widget, notebook or app item was found in this course.",
        failed: "The run stopped with an unexpected error. Check the browser console.",
        skipped: (count) => ` ${count} locked item${count === 1 ? "" : "s"} left alone.`,
        already: (count) => ` ${count} item${count === 1 ? " was" : "s were"} already done.`,
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        identity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
        stopped: "The page changed while the run was going on, so the rest of the list was left alone.",
        busy: "Plugin completion is already running."
    },
    vi: {
        started: (count) => `Đang đánh dấu ${count} bài thực hành là đã xong, từng bài một.`,
        progress: (done, total) => `Đã đánh dấu ${done}/${total} bài thực hành.`,
        finished: (completed, total) => `Đã đánh dấu ${completed}/${total} bài thực hành là đã xong. Reload trang để thấy dấu tick.`,
        partial: (completed, total, failed) => `Đã đánh dấu ${completed}/${total} bài thực hành. ${failed} bài chưa được.`,
        unverified: (completed, total, unverified) => `${completed}/${total} bài đã xác minh, còn ${unverified} bài đã ghi nhưng không đọc lại được.`,
        none: "Không tìm thấy bài thực hành, widget, notebook hay mục ứng dụng nào trong khoá học này.",
        failed: "Lần chạy dừng vì một lỗi bất ngờ. Xem console của trình duyệt.",
        skipped: (count) => ` ${count} bài bị khoá được bỏ qua.`,
        already: (count) => ` ${count} bài đã được đánh dấu xong từ trước.`,
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        identity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
        stopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
        busy: "Hoàn thành plugin đang chạy."
    }
};

let pluginRunning = false;
let pluginLanguage = "en";
let pluginState = { phase: "idle", code: "idle", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: "" };
let pluginBootstrapData = null;

// pick the string table for the saved language
function pluginTexts() {
    return PLUGIN_TEXTS[pluginLanguage] || PLUGIN_TEXTS.en;
}

// wait for a number of milliseconds
function pluginSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    if (PLUGIN_RECORD_TYPES.indexOf(typeName) >= 0) return "record";
    return "";
}

// the practice items of the course: videos, readings, prompts and graded work are left
// to their own modules or to the student
function pluginItems(syllabus) {
    const linked = syllabus.linked || {};
    const items = linked["onDemandCourseMaterialItems.v2"] || [];
    const seen = new Set();
    const found = [];
    for (const item of items) {
        const type = item && item.contentSummary ? item.contentSummary.typeName : "";
        if (!item || !item.id || !pluginRoute(type)) continue;
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        found.push({ id: item.id, name: item.name || item.id, type, route: pluginRoute(type), locked: pluginItemIsLocked(item) });
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
async function pluginCourseProgressState(userId, courseId, itemId) {
    const key = encodeURIComponent(userId + "~" + courseId);
    const response = await pluginRequest("/api/onDemandCoursesProgress.v1/" + key + "?fields=items");
    if (!response.ok) return "";
    const data = await pluginJson(response);
    const record = (data.elements || [])[0];
    const items = record && record.items;
    if (!items || typeof items !== "object" || !Object.prototype.hasOwnProperty.call(items, itemId)) return "";
    const entry = items[itemId];
    return entry && entry.progressState ? String(entry.progressState) : "";
}

// what Coursera says about one item, read from the records that can hold it. The widget
// progress record and the completion record are both keyed by student, course and item, so
// those two GETs are on a resource this module has just written to. An app item has neither:
// its state only shows up in the per-course list, so for that route the list is asked first
// and the other two are skipped, because writing nothing means there is nothing to read back
// there. When none of them answers, the caller reports the item as unconfirmed rather than
// as done.
async function pluginReadBack(userId, courseId, itemId, route) {
    if (route === "lti") return await pluginCourseProgressState(userId, courseId, itemId);

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
    } else {
        written = await pluginPostCompleted(context.userId, context.courseId, item.id);
    }

    const state = await pluginReadBack(context.userId, context.courseId, item.id, item.route);
    if (state === "Completed") return "completed";
    return written ? "unverified" : "failed";
}

// run the whole course, one practice item at a time
async function runPluginCompletion() {
    const texts = pluginTexts();
    const slug = pluginCourseSlug();
    if (!slug) {
        pluginState = { phase: "error", code: "notCourse", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.notCourse };
        return pluginState;
    }

    const userId = await pluginUserId();
    if (!userId) {
        pluginState = { phase: "error", code: "notLoggedIn", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.notLoggedIn };
        return pluginState;
    }

    // the cookie and the page state name the same account on a real course page, so a
    // page that names a different one is not a page this run should be writing for
    const cookieUser = pluginCookieUser();
    if (cookieUser && cookieUser !== String(userId)) {
        pluginState = { phase: "error", code: "identity", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.identity };
        return pluginState;
    }

    const syllabus = await pluginSyllabus(slug);
    if (!syllabus) {
        pluginState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.failed };
        return pluginState;
    }

    const courseId = pluginCourseId(syllabus);
    const allItems = pluginItems(syllabus);
    const items = allItems.filter((item) => !item.locked);
    const skipped = allItems.length - items.length;

    if (allItems.length === 0) {
        pluginState = { phase: "error", code: "none", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped, already: 0, note: texts.none };
        return pluginState;
    }

    pluginState = { phase: "running", code: "running", total: items.length, done: 0, completed: 0, unverified: 0, failed: 0, skipped, already: 0, note: "" };
    pluginNotify(texts.started(items.length));

    // one session lookup for the whole run, but only when the course actually has a
    // widget: every other item type writes its record without one
    const hasWidget = items.some((item) => item.route === "widget");
    const sessionId = hasWidget ? await pluginCourseSession(userId, courseId) : "";
    const context = { userId, courseId, slug };
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
        const before = await pluginReadBack(userId, courseId, item.id, item.route);
        if (before === "Completed") {
            pluginState.already += 1;
        } else {
            const result = await completePluginItem(item, context, sessionId);
            if (result === "completed") pluginState.completed += 1;
            else if (result === "unverified") pluginState.unverified += 1;
            else pluginState.failed += 1;
            // only a real write needs the pause, an item already done costs nothing
            await pluginSleep(PLUGIN_ITEM_DELAY);
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

// start the run in the background, the popup follows the state on its own
function startPluginCompletion() {
    const texts = pluginTexts();
    if (pluginRunning) {
        pluginState = {
            phase: "running",
            code: "busy",
            total: pluginState.total,
            done: pluginState.done,
            completed: pluginState.completed,
            unverified: pluginState.unverified,
            failed: pluginState.failed,
            skipped: pluginState.skipped,
            already: pluginState.already,
            note: texts.busy
        };
        return Promise.resolve(pluginState);
    }

    pluginRunning = true;
    // Coursera can hand out a new csrf token while the tab stays open, so the page state
    // is read again for every run instead of once per page load
    pluginBootstrapData = null;
    pluginState = { phase: "running", code: "starting", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: "" };
    runPluginCompletion()
        .catch(() => {
            pluginState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, unverified: 0, failed: 0, skipped: 0, already: 0, note: texts.failed };
        })
        .finally(() => {
            pluginRunning = false;
        });
    return Promise.resolve(pluginState);
}

// show a notice on the page, the toast helper lives in content.js
function pluginNotify(text) {
    if (typeof showToast === "function") showToast(text);
}

// read the saved language
function loadPluginLanguage() {
    return chrome.storage.local.get(["language"]).then((stored) => {
        pluginLanguage = PLUGIN_TEXTS[stored.language] ? stored.language : "en";
    });
}

// answer the popup. The message is only ever a trigger: which course, which account and
// which text to use all come from the page and from storage, never from the message.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || typeof request.action !== "string") return false;
    if (request.action === "completePlugins") {
        startPluginCompletion().then((state) => sendResponse(state)).catch(() => sendResponse({ phase: "error" }));
        return true;
    }
    if (request.action === "pluginStatus") {
        sendResponse(pluginState);
        return true;
    }
    return false;
});

// keep the language in sync with the popup
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.language && PLUGIN_TEXTS[changes.language.newValue]) pluginLanguage = changes.language.newValue;
});

loadPluginLanguage();
