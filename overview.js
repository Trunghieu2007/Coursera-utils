// The learning overview reads Coursera's own start-up cache, so the popup can show the mean
// progress of the courses in progress without asking Coursera for anything. On a course page
// it shows that course instead: its name, how many of its items are complete, and how many
// items of each type it holds. The name comes from the cached course query, while the item
// list and the per-course progress list come from two read-only GETs to Coursera. Nothing is
// stored and nothing is written: no completion record, no launch, no grade.

const OVERVIEW_STATE_LIMIT = 3000000;

// the text of an inline script that carries one of Coursera's start-up objects, skipped when
// it is too large to parse
function overviewInlineText(needle) {
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i += 1) {
        const text = scripts[i].textContent || "";
        if (text.length > OVERVIEW_STATE_LIMIT) continue;
        if (text.indexOf(needle) < 0) continue;
        return text;
    }
    return "";
}

// the text of the inline script that carries the cache
function overviewScriptText() {
    return overviewInlineText("window.__APOLLO_STATE__");
}

// the object literal that follows the assignment, read with a brace and quote aware scan so a
// cache the page never finished writing is simply skipped
function overviewCacheState(text) {
    const at = text.indexOf("window.__APOLLO_STATE__");
    if (at < 0) return null;
    const open = text.indexOf("{", text.indexOf("=", at));
    if (open < 0) return null;
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let i = open; i < text.length; i += 1) {
        const ch = text[i];
        if (quoted) {
            if (escaped) escaped = false;
            else if (ch === "\\") escaped = true;
            else if (ch === '"') quoted = false;
            continue;
        }
        if (ch === '"') {
            quoted = true;
            continue;
        }
        if (ch === "{") depth += 1;
        else if (ch === "}") {
            depth -= 1;
            if (depth === 0) {
                try {
                    return JSON.parse(text.slice(open, i + 1));
                } catch {
                    return null;
                }
            }
        }
    }
    return null;
}

// the cache stores each query under a key that also carries its arguments
function overviewCacheEntry(object, prefix) {
    if (!object || typeof object !== "object") return null;
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i += 1) {
        if (keys[i].indexOf(prefix) === 0) return object[keys[i]];
    }
    return null;
}

// a percentage Coursera reports, kept only inside 0..100
function overviewPercentValue(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return Math.max(0, Math.min(100, value));
}

// every course in the in-progress tab, one entry per course even when it also sits in a
// specialization card
function overviewCoursePercentages(state) {
    const query = overviewCacheEntry(overviewCacheEntry(state, "UnifiedHomeQueries"),
        "queryEnrolledProductCardsByTab");
    if (!query || !Array.isArray(query.elements)) return [];
    const percentages = [];
    const seen = new Set();
    const consider = (card) => {
        if (!card || typeof card !== "object") return;
        const percent = overviewPercentValue(card.courseProgressPercentage);
        if (percent === null) return;
        const course = card.course && typeof card.course === "object" ? card.course : null;
        const id = course && typeof course.id === "string" ? course.id : "";
        if (id) {
            if (seen.has(id)) return;
            seen.add(id);
        }
        percentages.push(percent);
    };
    for (let i = 0; i < query.elements.length; i += 1) {
        const element = query.elements[i];
        if (!element || typeof element !== "object") continue;
        if (Array.isArray(element.coursesInS12n)) {
            for (let j = 0; j < element.coursesInS12n.length; j += 1) consider(element.coursesInS12n[j]);
        } else {
            consider(element);
        }
    }
    return percentages;
}

// the mean progress of every course in progress, or none when the page carries no such list
function overviewFromPage() {
    const state = overviewCacheState(overviewScriptText());
    if (!state) return { kind: "none" };
    const percentages = overviewCoursePercentages(state);
    if (!percentages.length) return { kind: "none" };
    let total = 0;
    for (let i = 0; i < percentages.length; i += 1) total += percentages[i];
    return {
        kind: "ok",
        percent: Math.round(total / percentages.length),
        count: percentages.length
    };
}

// the course slug the page is open on, empty on every other Coursera page
function overviewCourseSlug() {
    const match = window.location.pathname.match(/^\/learn\/([^/]+)/);
    return match && match[1] ? match[1] : "";
}

// the signed-in user id from the same start-up state the other modules read. It only
// addresses the read-only progress list of the current course.
function overviewPageUserId() {
    const text = overviewInlineText("window.App");
    const user = text.match(/"userData"\s*:\s*\{\s*"id"\s*:\s*"?(\d+)"?/);
    return user ? user[1] : "";
}

// the course name from the cached course query, so the card can name the course without a
// third request. The cache key carries the query arguments, so the slug is not re-parsed.
function overviewCourseName(state) {
    const queries = overviewCacheEntry(state, "CourseQueries");
    if (!queries || typeof queries !== "object") return "";
    const keys = Object.keys(queries);
    for (let i = 0; i < keys.length; i += 1) {
        if (keys[i].indexOf("queryBySlug") !== 0) continue;
        const course = queries[keys[i]];
        if (course && typeof course.name === "string") return course.name.slice(0, 120);
    }
    return "";
}

// a read-only GET against Coursera, answered as JSON or null. There is no method and no body.
async function overviewJson(url) {
    try {
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

// the same course outline request the completion modules make, kept whole so the answer
// carries the item list and the course id this card needs
function overviewSyllabusUrl(slug) {
    return "/api/onDemandCourseMaterials.v2/?q=slug&slug=" + encodeURIComponent(slug)
        + "&includes=modules,lessons,items,gradingParameters"
        + "&fields=moduleIds,onDemandCourseMaterialModules.v1(lessonIds,optional),"
        + "onDemandCourseMaterialLessons.v1(elementIds,optional,itemIds),"
        + "onDemandCourseMaterialItems.v2(name,slug,isLocked,lockedStatus,itemLockedReasonCode,itemClass,timeCommitment,contentSummary)"
        + "&showLockedItems=true";
}

// the internal course id, read the way the completion modules read it
function overviewCourseId(syllabus) {
    const linked = syllabus.linked || {};
    const grading = linked["onDemandGradingParameters.v1"];
    if (grading && grading[0] && grading[0].id) return grading[0].id;
    const elements = syllabus.elements || [];
    if (elements[0] && elements[0].id) return elements[0].id;
    return "";
}

// the item types Coursera puts in a course outline. The card lists the type labels the page
// itself shows, read from the outline links, so no item is folded into a bucket of this
// module's own invention. A type whose rows are not in the page falls back to the label the
// page gives another item of that type, and then to the type name itself, so nothing is lost.
function overviewCleanLabel(value) {
    return String(value || "")
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 40);
}

// the visible type label of each outline item, keyed by item id. Coursera writes the label
// into the outline link's aria-label ("Reading, Name, Completed, 10 min", with "selected
// link, " in front on the open item), and the link's path carries the item id, so the two
// can be paired without guessing from the item name.
function overviewOutlineLabels(slug, ids) {
    const labels = new Map();
    const prefix = "/learn/" + slug + "/";
    const anchors = document.getElementsByTagName("a");
    for (let i = 0; i < anchors.length; i += 1) {
        const anchor = anchors[i];
        const href = anchor.getAttribute("href") || "";
        const at = href.indexOf(prefix);
        if (at < 0) continue;
        const rest = href.slice(at + prefix.length).split("?")[0].split("#")[0].split("/");
        const itemId = rest.length >= 2 ? rest[1] : "";
        if (!itemId || !ids.has(itemId) || labels.has(itemId)) continue;
        let label = anchor.getAttribute("aria-label") || "";
        if (label.indexOf("selected link, ") === 0) label = label.slice("selected link, ".length);
        const comma = label.indexOf(",");
        if (comma < 0) continue;
        const type = overviewCleanLabel(label.slice(0, comma));
        if (type) labels.set(itemId, type);
    }
    return labels;
}

// the card for one course: the name from the cached course query, the item count and types
// from the outline, and the completed count from the per-course progress list. A missing
// answer at any step leaves the card hidden instead of showing a number that would be made up.
async function overviewCourseCard() {
    const slug = overviewCourseSlug();
    const userId = overviewPageUserId();
    if (!slug || !userId) return { kind: "none" };

    const syllabus = await overviewJson(overviewSyllabusUrl(slug));
    if (!syllabus) return { kind: "none" };
    const courseId = overviewCourseId(syllabus);
    if (!courseId) return { kind: "none" };

    const progress = await overviewJson("/api/onDemandCoursesProgress.v1/"
        + encodeURIComponent(userId + "~" + courseId) + "?fields=items");
    if (!progress) return { kind: "none" };
    const record = (progress.elements || [])[0];
    const states = record && record.items;
    if (!states || typeof states !== "object") return { kind: "none" };

    const items = (syllabus.linked || {})["onDemandCourseMaterialItems.v2"] || [];
    const seen = new Set();
    const listed = [];
    for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (!item || !item.id || seen.has(item.id)) continue;
        const type = item.contentSummary && typeof item.contentSummary.typeName === "string"
            ? item.contentSummary.typeName : "";
        if (!type) continue;
        seen.add(item.id);
        listed.push({ id: item.id, type });
    }
    if (!listed.length) return { kind: "none" };

    const pageLabels = overviewOutlineLabels(slug, seen);
    const typeLabels = new Map();
    for (let i = 0; i < listed.length; i += 1) {
        const entry = listed[i];
        if (!pageLabels.has(entry.id) || typeLabels.has(entry.type)) continue;
        typeLabels.set(entry.type, pageLabels.get(entry.id));
    }

    const counts = new Map();
    let total = 0;
    let done = 0;
    for (let i = 0; i < listed.length; i += 1) {
        const entry = listed[i];
        total += 1;
        const label = pageLabels.get(entry.id)
            || typeLabels.get(entry.type)
            || overviewCleanLabel(entry.type)
            || "Other";
        counts.set(label, (counts.get(label) || 0) + 1);
        const state = states[entry.id];
        if (state && state.progressState === "Completed") done += 1;
    }

    const types = Array.from(counts.entries()).map((pair) => ({ label: pair[0], count: pair[1] }));
    types.sort((a, b) => b.count - a.count || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));

    const elements = syllabus.elements || [];
    const fallbackName = elements[0] && typeof elements[0].name === "string" ? elements[0].name : "";
    const name = overviewCourseName(overviewCacheState(overviewScriptText())) || fallbackName || slug;

    return {
        kind: "course",
        name: name.slice(0, 120),
        percent: Math.round((done / total) * 100),
        done,
        total,
        types
    };
}

// the answer for the popup: the course card on a course page, the home list everywhere else
function overviewInfo() {
    if (overviewCourseSlug()) return overviewCourseCard();
    return Promise.resolve(overviewFromPage());
}

// answer the popup. Nothing is stored and nothing is written.
function startOverviewChannel() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!request || typeof request.action !== "string") return false;
        if (request.action === "overviewInfo") {
            overviewInfo().then(sendResponse).catch(() => sendResponse({ kind: "none" }));
            return true;
        }
        return false;
    });
}

startOverviewChannel();
