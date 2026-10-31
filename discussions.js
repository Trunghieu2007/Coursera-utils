// Discussion reply completion.
//
// The module answers the discussion prompts of the current course. Coursera keeps a
// discussion prompt as a syllabus item whose content type is "discussionPrompt", and
// every one of those items is tied to a question in the course forum, so the module
// finds that question and posts the reply the student would have typed.
//
// The reply text is the student's own. It is read from the saved setting, and the popup
// has a box to change it, so nothing is posted that the student has not written.
//
// Two things make a run safe to start and to repeat. A prompt that already carries an
// answer from this account is left alone, so a second run does not double post. And a
// post is only counted as done when the answer can be read back from Coursera, so a
// bare HTTP 200 is never treated as success.
//
// Three more things hold when the page itself is not honest. The account named by the
// cookie and the account written into the page state have to agree, or the run refuses to
// start. An item id, course id or user id that is not a plain id never becomes part of a
// record key, because a key is built by joining ids with "~". And a queue that is still
// running stops when the page moves to another course or another account takes over.
//
// A reply is always posted to the forum of the course that is open in the tab. The prompt
// record does carry a course id of its own, but it is only read to prove the record is
// well formed: a wrong one could otherwise move the reply into another course's forum.
//
// The plumbing here is repeated on purpose from video.js and readings.js. All three
// files are loaded in the same isolated world, so a shared helper name would collide,
// and keeping the modules self contained means any one of them can be dropped without
// touching the others.
//
// Nothing runs on its own. The module only works when the popup asks it to.

const DISCUSSION_ITEM_DELAY = 3000;
const DISCUSSION_MAX_TEXT_LENGTH = 5000;

// the sentence the reply box starts with, in the language of the interface. The popup
// shows the same pair, so what the student sees is what gets posted.
const DISCUSSION_DEFAULT_REPLY = {
    en: "Thank you for the prompt. I am working through this week and will keep this in mind.",
    vi: "Cảm ơn bạn đã đặt câu hỏi. Mình đang học tuần này và sẽ ghi nhớ điều này."
};

const DISCUSSION_TEXTS = {
    en: {
        started: (total, already, remaining) => remaining === 0
            ? `All ${total} discussion prompt${total === 1 ? "" : "s"} are already complete.`
            : already > 0
                ? `Found ${total} discussion prompt${total === 1 ? "" : "s"}: ${already} already complete, replying to the other ${remaining}.`
                : `Replying to ${total} discussion prompt${total === 1 ? "" : "s"}, one at a time.`,
        progress: (done, total) => `Replied to ${done} of ${total} discussion prompts.`,
        finished: (completed, total) => `Replied to ${completed} of ${total} discussion prompts. Reload the page to see them.`,
        partial: (completed, total, failed) => `Replied to ${completed} of ${total} discussion prompts. ${failed} still ${failed === 1 ? "needs" : "need"} attention.`,
        unverified: (completed, total, unverified) => `${completed} of ${total} replies are confirmed, ${unverified} could not be read back.`,
        none: "No discussion prompt was found in this course.",
        noText: "Type the reply you want to send in the popup first.",
        failed: "The run stopped with an unexpected error. Check the browser console.",
        skipped: (count) => ` ${count} locked prompt${count === 1 ? "" : "s"} left alone.`,
        already: (count) => ` ${count} prompt${count === 1 ? " was" : "s were"} already complete.`,
        answered: (count) => ` ${count} prompt${count === 1 ? "" : "s"} already had your answer.`,
        notCourse: "Open a Coursera course page first.",
        notLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
        identity: "The page and Coursera name two different accounts, so nothing was posted. Reload the page.",
        stopped: "The page changed while the run was going on, so the rest of the list was left alone.",
        busy: "Discussion reply completion is already running."
    },
    vi: {
        started: (total, already, remaining) => remaining === 0
            ? `Cả ${total} thảo luận đều đã hoàn thành.`
            : already > 0
                ? `Tìm thấy ${total} thảo luận: ${already} đã xong, còn ${remaining} sẽ trả lời.`
                : `Đang trả lời ${total} thảo luận, từng thảo luận một.`,
        progress: (done, total) => `Đã trả lời ${done}/${total} thảo luận.`,
        finished: (completed, total) => `Đã trả lời ${completed}/${total} thảo luận. Reload trang để xem.`,
        partial: (completed, total, failed) => `Đã trả lời ${completed}/${total} thảo luận. ${failed} thảo luận chưa được.`,
        unverified: (completed, total, unverified) => `${completed}/${total} câu trả lời đã xác minh, còn ${unverified} câu đã đăng nhưng không đọc lại được.`,
        none: "Không tìm thấy thảo luận nào trong khoá học này.",
        noText: "Hãy nhập nội dung trả lời trong popup trước.",
        failed: "Lần chạy dừng vì một lỗi bất ngờ. Xem console của trình duyệt.",
        skipped: (count) => ` ${count} thảo luận bị khoá được bỏ qua.`,
        already: (count) => ` ${count} thảo luận đã hoàn thành từ trước.`,
        answered: (count) => ` ${count} thảo luận đã có câu trả lời của bạn.`,
        notCourse: "Hãy mở một trang khoá học Coursera trước.",
        notLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
        identity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đăng. Hãy reload trang.",
        stopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
        busy: "Hoàn thành thảo luận đang chạy."
    }
};

let discussionRunning = false;
let discussionLanguage = "en";
let discussionRequestMode = "sequential";
let discussionState = { phase: "idle", code: "idle", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, answered: 0, note: "" };
let discussionBootstrapData = null;
let discussionRunPromise = Promise.resolve();

// pick the string table for the saved language
function discussionTexts() {
    return DISCUSSION_TEXTS[discussionLanguage] || DISCUSSION_TEXTS.en;
}

// wait for a number of milliseconds
function discussionSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// instant mode removes the deliberate pause between posts; the requests still go one at a
// time and in the same order
function discussionPace(ms) {
    return discussionRequestMode === "instant" ? 0 : ms;
}

// the page writes its own start-up state into an inline script, and that state already
// holds the signed-in user id and the csrf token, so neither needs a request
function loadDiscussionBootstrap() {
    if (discussionBootstrapData) return discussionBootstrapData;
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
    discussionBootstrapData = found;
    return found;
}

// a token only reaches a request header when it is plain text. Chrome refuses a value
// holding a line break, and a cookie that is not URL encoded has to survive the decode
// attempt rather than throw
function discussionUsableToken(value) {
    let text = String(value || "");
    try {
        text = decodeURIComponent(text);
    } catch {
        /* keep the raw value when it is not URL encoded */
    }
    return /^[\x20-\x7E]*$/.test(text) ? text : "";
}

// CSRF token from the course cookie, or from the page state when the cookie is hidden
function discussionCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)CSRF3-Token=([^;]+)/) || document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    if (match && match[1]) return discussionUsableToken(match[1]);
    return discussionUsableToken(loadDiscussionBootstrap().csrf);
}

// headers every API call needs
function discussionHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = discussionCsrfToken();
    if (token) headers["X-CSRF3-Token"] = token;
    return headers;
}

// call the Coursera API, dropping the CSRF header when the server rejects it
async function discussionRequest(url, options = {}) {
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
async function discussionJson(response) {
    return response.json().catch(() => ({}));
}

// the course slug of the current page, empty when the page is not a course page
function discussionCourseSlug() {
    const match = window.location.pathname.match(/\/learn\/([^/]+)/);
    return match && match[1] ? match[1] : "";
}

// the account the cookie names, empty when it names nothing usable. Coursera writes a
// plain number here, so anything else is treated as no answer at all
function discussionCookieUser() {
    const cookie = document.cookie.match(/(?:^|;\s*)c_user=([^;]+)/);
    return cookie && /^\d+$/.test(cookie[1]) ? cookie[1] : "";
}

// the signed-in user id, empty when the page and Coursera both stay silent
async function discussionUserId() {
    const fromPage = loadDiscussionBootstrap().userId;
    if (fromPage) return fromPage;
    const fromCookie = discussionCookieUser();
    if (fromCookie) return fromCookie;
    // Coursera answers this finder with 405 today, so it is only a last try
    const response = await discussionRequest("/api/users.v1?q=me");
    if (response.ok) {
        const data = await discussionJson(response);
        const me = data.elements && data.elements[0];
        if (me && /^\d+$/.test(String(me.id))) return String(me.id);
    }
    return "";
}

// the reply the student wrote. An empty box is left empty on purpose so the run can
// refuse, only a course that never opened the popup falls back to the default sentence
async function discussionReplyText() {
    const stored = await chrome.storage.local.get(["discussionReply"]);
    if (typeof stored.discussionReply === "string") {
        return stored.discussionReply.trim().slice(0, DISCUSSION_MAX_TEXT_LENGTH);
    }
    const fallback = DISCUSSION_DEFAULT_REPLY[discussionLanguage] || DISCUSSION_DEFAULT_REPLY.en;
    return fallback.slice(0, DISCUSSION_MAX_TEXT_LENGTH);
}

// the whole course tree, with the item list Coursera uses for the outline. Locked items
// are asked for on purpose: they have to be seen to be left alone.
async function discussionSyllabus(slug) {
    const url = "/api/onDemandCourseMaterials.v2/?q=slug&slug=" + encodeURIComponent(slug)
        + "&includes=modules,lessons,items,gradingParameters"
        + "&fields=moduleIds,onDemandCourseMaterialModules.v1(lessonIds,optional),"
        + "onDemandCourseMaterialLessons.v1(elementIds,optional,itemIds),"
        + "onDemandCourseMaterialItems.v2(name,slug,isLocked,lockedStatus,itemLockedReasonCode,itemClass,timeCommitment,contentSummary)"
        + "&showLockedItems=true";
    const response = await discussionRequest(url);
    if (!response.ok) return null;
    return discussionJson(response);
}

// the internal course id, used by the forum question and the answer record
function discussionCourseId(syllabus) {
    const linked = syllabus.linked || {};
    const grading = linked["onDemandGradingParameters.v1"];
    if (grading && grading[0] && grading[0].id) return grading[0].id;
    const elements = syllabus.elements || [];
    if (elements[0] && elements[0].id) return elements[0].id;
    return "";
}

// the per-course progress list, the same one the outline page reads. It is the scan the
// run takes before it writes anything, so a prompt Coursera already reports as done is
// never answered a second time.
async function discussionCourseProgressItems(userId, courseId) {
    const key = encodeURIComponent(userId + "~" + courseId);
    const response = await discussionRequest("/api/onDemandCoursesProgress.v1/" + key + "?fields=items", { cache: "no-store" });
    if (!response.ok) return null;
    const data = await discussionJson(response);
    const record = (data.elements || [])[0];
    const items = record && record.items;
    if (!items || typeof items !== "object") return null;
    return items;
}

// true when Coursera's own progress list already reports the prompt as done
function discussionItemCompleted(items, itemId) {
    if (!items || !Object.prototype.hasOwnProperty.call(items, itemId)) return false;
    const entry = items[itemId];
    return Boolean(entry && entry.progressState === "Completed");
}

// a prompt the course will not let the student open yet
function discussionItemIsLocked(item) {
    if (item.isLocked === true) return true;
    const status = String(item.lockedStatus || "").trim().toLowerCase();
    return status === "locked" || status.indexOf("locked_") === 0 || status.indexOf("hard_locked") === 0;
}

// the discussion prompts of the course, every other item type is left alone
function discussionItems(syllabus) {
    const linked = syllabus.linked || {};
    const items = linked["onDemandCourseMaterialItems.v2"] || [];
    return items
        .filter((item) => {
            const type = item && item.contentSummary ? item.contentSummary.typeName : "";
            return item && item.id && type === "discussionPrompt";
        })
        .map((item) => ({ id: item.id, name: item.name || item.id, locked: discussionItemIsLocked(item) }));
}

// an id that can be joined into a composite key: Coursera's own ids are plain, short and
// carry no separator, so anything else is never sent as part of a key
function discussionIsKeyId(value) {
    return /^[A-Za-z0-9._-]{1,64}$/.test(String(value));
}

// the three parts of one record key, checked together
function discussionKeyIsSafe(userId, courseId, itemId) {
    return discussionIsKeyId(userId) && discussionIsKeyId(courseId) && discussionIsKeyId(itemId);
}

// the queue is slow on purpose, so the page can move on half way through. When it does,
// or when another account takes over the tab, the rest of the list is left alone.
function discussionPageMoved(slug, userId) {
    if (discussionCourseSlug() !== slug) return true;
    const cookieUser = discussionCookieUser();
    return Boolean(cookieUser) && cookieUser !== String(userId);
}

// the forum question behind one prompt: the prompt record is keyed by the student, the
// course and the item, and it carries the question id as authorId~courseId~questionId
async function discussionQuestionId(userId, courseId, itemId) {
    const key = encodeURIComponent(userId + "~" + courseId + "~" + itemId);
    const response = await discussionRequest("/api/onDemandDiscussionPrompts.v1/" + key + "?fields=promptType");
    if (!response.ok) return null;
    const data = await discussionJson(response);
    const elements = data.elements || [];
    const definition = elements[0] && elements[0].promptType && elements[0].promptType.definition;
    const composite = definition && definition.courseItemForumQuestionId;
    if (!composite) return null;
    const parts = String(composite).split("~").filter(Boolean);
    // only the last part is used: it is the question id, and the answer is always posted
    // to the forum of the course this page names, never to a course the record claims
    if (parts.length < 2) return null;
    const question = parts[parts.length - 1];
    return discussionIsKeyId(question) ? { question } : null;
}

// true when this account already answered the question, so a second run leaves it alone
async function discussionAlreadyAnswered(courseId, question, userId) {
    const target = courseId + "~" + question;
    const url = "/api/onDemandCourseForumAnswers.v1/?q=courseForumQuestionId&courseForumQuestionId="
        + encodeURIComponent(target) + "&limit=100&fields=creatorId";
    const response = await discussionRequest(url);
    if (!response.ok) return false;
    const data = await discussionJson(response);
    const elements = data.elements || [];
    return elements.some((element) => element && String(element.creatorId) === String(userId));
}

// the markup Coursera stores an answer in: a cml document of the discussion dialect
function discussionAnswerMarkup(text) {
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return "<co-content><text>" + escaped + "</text></co-content>";
}

// post one answer and read it back, so only a reply that really exists is counted
async function postDiscussionAnswer(courseId, question, text) {
    const target = courseId + "~" + question;
    const url = "/api/onDemandCourseForumAnswers.v1/?fields=id,creatorId,state,courseForumQuestionId,createdAt,content";
    const body = {
        content: {
            typeName: "cml",
            definition: { dtdId: "discussion/1", value: discussionAnswerMarkup(text) }
        },
        courseForumQuestionId: target
    };
    const response = await discussionRequest(url, { method: "POST", headers: discussionHeaders(), body: JSON.stringify(body) });
    if (!response.ok) return "failed";

    const created = await discussionJson(response);
    const id = created && created.id;
    if (!id) return "unverified";

    const check = await discussionRequest("/api/onDemandCourseForumAnswers.v1/" + encodeURIComponent(id));
    if (!check.ok) return "unverified";
    const record = await discussionJson(check);
    return record && (record.id || record.courseForumQuestionId) ? "completed" : "unverified";
}

// answer one prompt: find its question, skip it when already answered, then post. The
// course id used for the answer is the one this page and its outline name, so a prompt
// record that names another course cannot move the reply into that course's forum.
async function completeDiscussion(userId, courseId, item, text) {
    const found = await discussionQuestionId(userId, courseId, item.id);
    if (!found) return "failed";
    if (!discussionIsKeyId(courseId)) return "failed";
    if (await discussionAlreadyAnswered(courseId, found.question, userId)) return "answered";
    return postDiscussionAnswer(courseId, found.question, text);
}

// run the whole course, one prompt at a time
async function runDiscussionCompletion() {
    const texts = discussionTexts();
    const slug = discussionCourseSlug();
    if (!slug) {
        discussionState = { phase: "error", code: "notCourse", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, answered: 0, note: texts.notCourse };
        return discussionState;
    }

    const userId = await discussionUserId();
    if (!userId) {
        discussionState = { phase: "error", code: "notLoggedIn", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, answered: 0, note: texts.notLoggedIn };
        return discussionState;
    }

    // the cookie and the page state name the same account on a real course page, so a
    // page that names a different one is not a page this run should be writing for
    const cookieUser = discussionCookieUser();
    if (cookieUser && cookieUser !== String(userId)) {
        discussionState = { phase: "error", code: "identity", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, answered: 0, note: texts.identity };
        return discussionState;
    }

    const syllabus = await discussionSyllabus(slug);
    if (!syllabus) {
        discussionState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, answered: 0, note: texts.failed };
        return discussionState;
    }

    const courseId = discussionCourseId(syllabus);
    const allPrompts = discussionItems(syllabus);
    const prompts = allPrompts.filter((item) => !item.locked);
    const skipped = allPrompts.length - prompts.length;
    if (allPrompts.length === 0) {
        discussionState = { phase: "error", code: "none", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped, answered: 0, note: texts.none };
        return discussionState;
    }

    const text = await discussionReplyText();
    if (!text) {
        discussionState = { phase: "error", code: "noText", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped, answered: 0, note: texts.noText };
        return discussionState;
    }

    const progressItems = await discussionCourseProgressItems(userId, courseId);
    const alreadyCount = prompts.filter((item) => discussionItemCompleted(progressItems, item.id)).length;
    const remaining = prompts.length - alreadyCount;

    discussionState = { phase: "running", code: "running", total: prompts.length, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped, answered: 0, note: "" };
    discussionNotify(texts.started(prompts.length, alreadyCount, remaining));
    let stopped = false;

    for (const item of prompts) {
        if (discussionPageMoved(slug, userId)) {
            stopped = true;
            break;
        }
        // the scan already said this prompt is done, so it costs no request at all
        if (discussionItemCompleted(progressItems, item.id)) {
            discussionState.already += 1;
            discussionState.done += 1;
            discussionNotify(texts.progress(discussionState.done, discussionState.total));
            continue;
        }
        // an id the record key cannot hold is reported as a failure and never sent, so a
        // syllabus that lies about its own ids cannot move an answer into another key
        if (!discussionKeyIsSafe(userId, courseId, item.id)) {
            discussionState.failed += 1;
            discussionState.done += 1;
            discussionNotify(texts.progress(discussionState.done, discussionState.total));
            continue;
        }
        const result = await completeDiscussion(userId, courseId, item, text);
        discussionState.done += 1;
        if (result === "completed") discussionState.completed += 1;
        else if (result === "unverified") discussionState.unverified += 1;
        else if (result === "answered") discussionState.answered += 1;
        else discussionState.failed += 1;

        discussionNotify(texts.progress(discussionState.done, discussionState.total));
        // only a real post needs the pause, a skipped prompt costs nothing
        if (result === "completed" || result === "unverified") await discussionSleep(discussionPace(DISCUSSION_ITEM_DELAY));
    }

    // a run that lost its page or its account keeps what it already posted and writes
    // nothing more
    if (stopped) {
        discussionState = {
            phase: "error",
            code: "stopped",
            total: discussionState.total,
            done: discussionState.done,
            completed: discussionState.completed,
            already: discussionState.already,
            unverified: discussionState.unverified,
            failed: discussionState.failed,
            skipped,
            answered: discussionState.answered,
            note: texts.stopped
        };
        discussionNotify(texts.stopped);
        return discussionState;
    }

    const tail = (skipped > 0 ? texts.skipped(skipped) : "")
        + (discussionState.already > 0 ? texts.already(discussionState.already) : "")
        + (discussionState.answered > 0 ? texts.answered(discussionState.answered) : "");
    let note;
    let code;
    if (discussionState.failed > 0) {
        code = "partial";
        note = texts.partial(discussionState.completed, discussionState.total, discussionState.failed) + tail;
    } else if (discussionState.unverified > 0) {
        code = "unverified";
        note = texts.unverified(discussionState.completed, discussionState.total, discussionState.unverified) + tail;
    } else {
        code = "done";
        note = texts.finished(discussionState.completed, discussionState.total) + tail;
    }

    discussionState = {
        phase: "done",
        code,
        total: discussionState.total,
        done: discussionState.done,
        completed: discussionState.completed,
        already: discussionState.already,
        unverified: discussionState.unverified,
        failed: discussionState.failed,
        skipped,
        answered: discussionState.answered,
        note
    };
    discussionNotify(note);
    return discussionState;
}

// start the run in the background, the popup follows the state on its own
function startDiscussionCompletion() {
    const texts = discussionTexts();
    if (discussionRunning) {
        discussionState = {
            phase: "running",
            code: "busy",
            total: discussionState.total,
            done: discussionState.done,
            completed: discussionState.completed,
            already: discussionState.already,
            unverified: discussionState.unverified,
            failed: discussionState.failed,
            skipped: discussionState.skipped,
            answered: discussionState.answered,
            note: texts.busy
        };
        return Promise.resolve(discussionState);
    }

    discussionRunning = true;
    // Coursera can hand out a new csrf token while the tab stays open, so the page state
    // is read again for every run instead of once per page load
    discussionBootstrapData = null;
    discussionState = { phase: "running", code: "starting", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, answered: 0, note: "" };
    discussionRunPromise = runDiscussionCompletion()
        .catch(() => {
            discussionState = { phase: "error", code: "failed", total: 0, done: 0, completed: 0, already: 0, unverified: 0, failed: 0, skipped: 0, answered: 0, note: texts.failed };
        })
        .finally(() => {
            discussionRunning = false;
        });
    return Promise.resolve(discussionState);
}

// the promise of the run that is going, so the skip-all step can wait for it
function waitForDiscussionRun() {
    return discussionRunPromise;
}

// the current state, so the skip-all step can read the counts directly
function discussionCurrentState() {
    return discussionState;
}

// show a notice on the page, the toast helper lives in content.js
function discussionNotify(text) {
    if (typeof showToast === "function") showToast(text);
}

// read the saved language and request mode
function loadDiscussionLanguage() {
    return chrome.storage.local.get(["language", "requestMode"]).then((stored) => {
        discussionLanguage = DISCUSSION_TEXTS[stored.language] ? stored.language : "en";
        discussionRequestMode = stored.requestMode === "instant" ? "instant" : "sequential";
    });
}

// answer the popup while the run is going on. The message is only ever a trigger: which
// course, which account and which text to use all come from the page and from storage,
// never from the message.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || typeof request.action !== "string") return false;
    if (request.action === "completeDiscussions") {
        startDiscussionCompletion().then((state) => sendResponse(state)).catch(() => sendResponse({ phase: "error" }));
        return true;
    }
    if (request.action === "discussionStatus") {
        sendResponse(discussionState);
        return true;
    }
    return false;
});

// keep the language in sync with the popup
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.language && DISCUSSION_TEXTS[changes.language.newValue]) discussionLanguage = changes.language.newValue;
    if (changes.requestMode) discussionRequestMode = changes.requestMode.newValue === "instant" ? "instant" : "sequential";
});

loadDiscussionLanguage();
