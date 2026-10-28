const TOAST_ID = "ccq-toast";
const WAIT_LIMIT = 8000;
const WAIT_STEP = 250;
const BLOCK_TAGS = ["p", "div", "li", "ul", "ol", "figure", "table", "tr", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "section"];

const TEXTS = {
    en: {
        copied: (count) => `Copied ${count} question${count === 1 ? "" : "s"} to clipboard!`,
        empty: "No question is visible on this page",
        blocked: "Clipboard blocked: click the page, then copy again"
    },
    vi: {
        copied: (count) => `Đã sao chép ${count} câu hỏi vào bảng nhớ tạm!`,
        empty: "Trang này không có câu hỏi nào đang hiển thị",
        blocked: "Bảng nhớ tạm bị chặn: click vào trang rồi sao chép lại"
    }
};

let lastAutoCopyUrl = "";
let settings = { autoCopy: false, language: "en" };

// read the saved settings once per page and keep them in memory
function loadSettings() {
    return chrome.storage.local.get(["autoCopy", "language"]).then((stored) => {
        settings = {
            autoCopy: stored.autoCopy === true,
            language: TEXTS[stored.language] ? stored.language : "en"
        };
    });
}

// pick the string table for the saved language
function textsFor(language) {
    return TEXTS[language] || TEXTS.en;
}

// list the question blocks currently visible on the page
function questionBlocks() {
    const semanticBlocks = Array.from(
        document.querySelectorAll('[data-testid^="part-Submission_"]')
    ).filter((block) => block.querySelector('[id^="prompt-"] [data-testid="cml-viewer"]'));
    if (semanticBlocks.length > 0) return semanticBlocks;

    const fallbackBlocks = Array.from(
        document.querySelectorAll(".css-1erl2aq, .css-12u8wr5")
    ).filter((block) => block.querySelector('[data-testid="cml-viewer"]'));
    return fallbackBlocks;
}

// question type, keeping the English names used by the original source
function questionType(block, options) {
    if (options.length > 0) {
        const firstInput = block.querySelector('input[type="radio"], input[type="checkbox"]');
        if (firstInput && firstInput.type === "checkbox") return "multiple_answer";
        return "single_answer";
    }
    if (block.querySelector(".monaco-editor, [data-mode-id]")) return "code_expression";
    if (block.querySelector('[data-slate-editor="true"], [contenteditable="true"], textarea')) {
        return "essay";
    }
    if (block.querySelector('input[type="text"], input[type="number"]')) {
        return "text_input";
    }
    return "unknown";
}

// read a node's text, empty string when the node is missing
function nodeText(node) {
    if (!node) return "";
    return tidyLines(collectText(node));
}

// walk the DOM by hand: innerText of KaTeX repeats every formula three times
function collectText(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();
    if (tag === "br") return "\n";
    if (tag === "script" || tag === "style" || tag === "noscript") return "";
    if (node.getAttribute("data-testid") === "visually-hidden") return "";
    if (tag === "img") return imageText(node);

    const formula = mathSource(node);
    if (formula) return "$" + formula + "$";

    let text = "";
    for (const child of node.childNodes) text += collectText(child);
    return BLOCK_TAGS.includes(tag) ? "\n" + text + "\n" : text;
}

// LaTeX source of a formula, empty when the node is not rendered math
function mathSource(node) {
    const tag = node.tagName.toLowerCase();
    if (!node.classList.contains("katex") && tag !== "mjx-container") return "";
    const annotation = node.querySelector('annotation[encoding="application/x-tex"]');
    const source = annotation ? annotation.textContent : node.getAttribute("data-latex") || "";
    return source.trim();
}

// markdown picture with the real URL, so a diagram survives the paste
function imageText(node) {
    const alt = (node.getAttribute("alt") || "").trim();
    const src = node.currentSrc || node.src || "";
    if (!src) return alt ? "[image: " + alt + "]" : "";
    if (src.startsWith("data:")) return "[embedded image" + (alt ? ": " + alt : "") + "]";
    return "![" + alt + "](" + src + ")";
}

// drop the blank lines the block walk leaves behind, keeping at most one
function tidyLines(text) {
    const kept = [];
    for (const raw of text.replace(/\r/g, "").split("\n")) {
        const line = raw.replace(/[ \t\u00a0]+/g, " ").trim();
        if (line.length > 0 || kept[kept.length - 1] !== "") kept.push(line);
    }
    return kept.join("\n").trim();
}

// turn one page block into a question + options object
function readQuestion(block, index) {
    const promptNode = block.querySelector('[id^="prompt-"] [data-testid="cml-viewer"]')
        || block.querySelector('[data-testid="cml-viewer"]');
    const question = nodeText(promptNode);
    if (!question) return null;

    const options = Array.from(block.querySelectorAll(".rc-Option"))
        .map((option) => nodeText(option.querySelector('[data-testid="cml-viewer"]')))
        .filter((text) => text.length > 0);

    return {
        questionNumber: index + 1,
        type: questionType(block, options),
        question,
        options
    };
}

// wait until Coursera renders the question blocks (the SPA loads content late)
async function waitForQuestions() {
    const startedAt = Date.now();
    while (true) {
        const blocks = questionBlocks();
        if (blocks.length > 0) return blocks;
        if (Date.now() - startedAt > WAIT_LIMIT) return [];
        await new Promise((resolve) => setTimeout(resolve, WAIT_STEP));
    }
}

// extract every question visible on the current page
async function extractQuestions() {
    const blocks = await waitForQuestions();
    const questions = [];
    blocks.forEach((block) => {
        const question = readQuestion(block, questions.length);
        if (question) questions.push(question);
    });
    return questions;
}

// questions to JSON {questionNumber, type, question, options}
function buildText(questions) {
    return JSON.stringify(questions, null, 2);
}

// write text to the clipboard, with an execCommand fallback when the clipboard API is blocked
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.top = "-1000px";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        area.setSelectionRange(0, area.value.length);
        let ok = false;
        try {
            ok = document.execCommand("copy");
        } catch {
            ok = false;
        }
        area.remove();
        return ok;
    }
}

// read the applied theme so the toast matches the page
async function resolvedTheme() {
    const stored = await chrome.storage.local.get(["theme"]);
    const mode = ["light", "dark"].includes(stored.theme) ? stored.theme : "system";
    if (mode !== "system") return mode;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// show a rounded notice on the page, then hide it
async function showToast(text, isError = false) {
    const theme = await resolvedTheme();
    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
        toast = document.createElement("div");
        toast.id = TOAST_ID;
        toast.style.position = "fixed";
        toast.style.bottom = "28px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.zIndex = "2147483647";
        toast.style.maxWidth = "min(80vw, 420px)";
        toast.style.padding = "12px 18px";
        toast.style.borderRadius = "12px";
        toast.style.font = "600 13px ui-sans-serif, system-ui, -apple-system, sans-serif";
        toast.style.lineHeight = "1.4";
        toast.style.textAlign = "center";
        toast.style.transition = "opacity 0.3s ease";
        document.body.appendChild(toast);
    }

    const base = theme === "dark" ? "#ffffff" : "#0a0a0a";
    const opposite = theme === "dark" ? "#0a0a0a" : "#ffffff";
    toast.style.backgroundColor = isError ? opposite : base;
    toast.style.color = isError ? base : opposite;
    toast.style.border = `2px solid ${isError ? base : "transparent"}`;
    toast.style.boxShadow = "0 10px 28px rgba(0,0,0,0.25)";
    toast.textContent = text;
    toast.style.opacity = "1";

    clearTimeout(showToast.hideTimer);
    showToast.hideTimer = setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 320);
    }, isError ? 4200 : 2600);
}

// manual copy when the user clicks the button
async function copyNow() {
    const strings = textsFor(settings.language);
    const questions = await extractQuestions();

    if (questions.length === 0) {
        await showToast(strings.empty, true);
        return { count: 0, copied: false };
    }

    const copied = await copyToClipboard(buildText(questions));
    if (copied) {
        await showToast(strings.copied(questions.length));
    } else {
        await showToast(strings.blocked, true);
    }
    return { count: questions.length, copied };
}

// auto copy, runs once per URL
async function autoCopy() {
    if (!settings.autoCopy) return;
    if (lastAutoCopyUrl === window.location.href) return;

    const blocks = await waitForQuestions();
    if (blocks.length === 0) return;

    lastAutoCopyUrl = window.location.href;
    await copyNow();
}

// listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "copyNow") {
        copyNow()
            .then((result) => sendResponse(result))
            .catch((error) => sendResponse({ error: error.message || "Copy failed." }));
        return true;
    }
    if (request.action === "ping") {
        sendResponse({ ok: true, url: window.location.href });
        return true;
    }
    return true;
});

// update settings as soon as the popup changes them, no page reload needed
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.autoCopy) settings.autoCopy = changes.autoCopy.newValue === true;
    if (changes.language && TEXTS[changes.language.newValue]) settings.language = changes.language.newValue;

    if (settings.autoCopy && changes.autoCopy && changes.autoCopy.newValue === true) {
        lastAutoCopyUrl = "";
        autoCopy();
    }
});

// catch Coursera SPA navigation (pushState does not fire popstate) so auto copy runs again
function watchNavigation() {
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href === currentUrl) return;
        currentUrl = window.location.href;
        autoCopy();
    }, 700);
    window.addEventListener("popstate", () => setTimeout(autoCopy, 400));
}

watchNavigation();
loadSettings().then(autoCopy);
