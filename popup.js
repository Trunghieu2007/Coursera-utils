const STRINGS = {
  en: {
    docTitle: "Copy Questions",
    title: "Copy Questions",
    subtitle: "Copy the visible questions, with their options, code and formulas, to your clipboard.",
    autoCopy: "Auto copy",
    autoCopyHint: "Copy questions when a lesson page opens.",
    language: "Language",
    theme: "Theme",
    copyButton: "Copy this page",
    copyButtonBusy: "Copying…",
    idle: "Open a Coursera lesson page to copy its questions.",
    reading: "Reading the page…",
    copied: (count) => `Copied ${count} question${count === 1 ? "" : "s"}!`,
    blocked: "Clipboard blocked: click the page, then copy again.",
    noQuestions: "No question is visible on this page yet. Wait for it to load, then copy again.",
    wrongPage: "Current tab is not a Coursera lesson page, or reload it after installing.",
    completeVideosButton: "Complete lecture videos",
    completeVideosBusy: "Completing…",
    videoStarting: "Looking for the lecture videos of this course…",
    videoRunning: (params) => `Completed ${params.done} of ${params.total} lecture videos.`,
    videoDone: (params) => `Completed ${params.completed} of ${params.total} lecture videos. Reload the page to see the checkmarks.` + skippedTail("videoSkipped", params),
    videoPartial: (params) => `Completed ${params.completed} of ${params.total} lecture videos. ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skippedTail("videoSkipped", params),
    videoSkipped: (params) => ` ${params.skipped} locked lecture${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    videoBusy: "Lecture video completion is already running.",
    videoNone: "No lecture videos were found in this course.",
    videoNotCourse: "Open a Coursera course page first.",
    videoNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    videoIdentity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
    videoStopped: "The page changed while the run was going on, so the rest of the list was left alone.",
    videoFailed: "The run failed. Check the browser console for the reason.",
    completeReadingsButton: "Complete readings",
    completeReadingsBusy: "Completing…",
    readingStarting: "Looking for the readings of this course…",
    readingRunning: (params) => `Completed ${params.done} of ${params.total} readings.`,
    readingDone: (params) => `Completed ${params.completed} of ${params.total} readings. Reload the page to see the checkmarks.` + skippedTail("readingSkipped", params),
    readingPartial: (params) => `Completed ${params.completed} of ${params.total} readings. ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skippedTail("readingSkipped", params),
    readingUnverified: (params) => `${params.completed} of ${params.total} readings are confirmed, ${params.unverified} could not be read back.` + skippedTail("readingSkipped", params),
    readingSkipped: (params) => ` ${params.skipped} locked reading${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    readingBusy: "Reading completion is already running.",
    readingNone: "No reading material was found in this course.",
    readingNotCourse: "Open a Coursera course page first.",
    readingNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    readingIdentity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
    readingStopped: "The page changed while the run was going on, so the rest of the list was left alone.",
    readingFailed: "The run failed. Check the browser console for the reason.",
    completeDiscussionsButton: "Complete discussions",
    completeDiscussionsBusy: "Replying…",
    discussionStarting: "Looking for the discussion prompts of this course…",
    discussionRunning: (params) => `Replied to ${params.done} of ${params.total} discussion prompts.`,
    discussionDone: (params) => `Replied to ${params.completed} of ${params.total} discussion prompts. Reload the page to see them.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params),
    discussionPartial: (params) => `Replied to ${params.completed} of ${params.total} discussion prompts. ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params),
    discussionUnverified: (params) => `${params.completed} of ${params.total} replies are confirmed, ${params.unverified} could not be read back.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params),
    discussionSkipped: (params) => ` ${params.skipped} locked prompt${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    discussionAnswered: (params) => ` ${params.answered} prompt${params.answered === 1 ? "" : "s"} already had your answer.`,
    discussionBusy: "Discussion reply completion is already running.",
    discussionNone: "No discussion prompt was found in this course.",
    discussionNoText: "Type the reply you want to send before running the discussion step.",
    discussionNotCourse: "Open a Coursera course page first.",
    discussionNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    discussionIdentity: "The page and Coursera name two different accounts, so nothing was posted. Reload the page.",
    discussionStopped: "The page changed while the run was going on, so the rest of the list was left alone.",
    discussionFailed: "The run failed. Check the browser console for the reason.",
    discussionReply: "Discussion reply",
    discussionReplyHint: "This exact text is posted to every discussion prompt you have not answered yet.",
    completePluginsButton: "Complete practice items",
    completePluginsBusy: "Completing…",
    pluginStarting: "Looking for the practice items of this course…",
    pluginRunning: (params) => `Marked ${params.done} of ${params.total} practice items.`,
    pluginDone: (params) => `Marked ${params.completed} of ${params.total} practice items as done. Reload the page to see the checkmarks.` + skippedTail("pluginSkipped", params) + alreadyTail("pluginAlready", params),
    pluginPartial: (params) => `Marked ${params.completed} of ${params.total} practice items. ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skippedTail("pluginSkipped", params) + alreadyTail("pluginAlready", params),
    pluginUnverified: (params) => `${params.completed} of ${params.total} items are confirmed, ${params.unverified} could not be read back.` + skippedTail("pluginSkipped", params) + alreadyTail("pluginAlready", params),
    pluginSkipped: (params) => ` ${params.skipped} locked item${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    pluginAlready: (params) => ` ${params.already} item${params.already === 1 ? " was" : "s were"} already done.`,
    pluginBusy: "Practice item completion is already running.",
    pluginNone: "No ungraded lab, widget, notebook or app item was found in this course.",
    pluginNotCourse: "Open a Coursera course page first.",
    pluginNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    pluginIdentity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
    pluginStopped: "The page changed while the run was going on, so the rest of the list was left alone.",
    pluginFailed: "The run failed. Check the browser console for the reason.",
    themeNames: { system: "Follow system", light: "Light", dark: "Dark" },
    languageNames: { en: "English", vi: "Tiếng Việt" }
  },
  vi: {
    docTitle: "Sao chép câu hỏi",
    title: "Sao chép câu hỏi",
    subtitle: "Sao chép câu hỏi đang hiển thị, kèm lựa chọn, code và công thức, vào bảng nhớ tạm.",
    autoCopy: "Tự động sao chép",
    autoCopyHint: "Sao chép câu hỏi ngay khi mở trang bài tập.",
    language: "Ngôn ngữ",
    theme: "Giao diện",
    copyButton: "Sao chép trang này",
    copyButtonBusy: "Đang sao chép…",
    idle: "Mở một trang bài tập Coursera để sao chép câu hỏi.",
    reading: "Đang đọc trang…",
    copied: (count) => `Đã sao chép ${count} câu hỏi!`,
    blocked: "Bảng nhớ tạm bị chặn: click vào trang rồi sao chép lại.",
    noQuestions: "Trang này chưa hiển thị câu hỏi nào. Đợi trang tải xong rồi sao chép lại.",
    wrongPage: "Tab hiện tại không phải trang bài tập Coursera, hoặc reload trang sau khi cài.",
    completeVideosButton: "Hoàn thành video bài giảng",
    completeVideosBusy: "Đang hoàn thành…",
    videoStarting: "Đang tìm video bài giảng của khoá học này…",
    videoRunning: (params) => `Đã hoàn thành ${params.done}/${params.total} video bài giảng.`,
    videoDone: (params) => `Đã hoàn thành ${params.completed}/${params.total} video bài giảng. Reload trang để thấy dấu tick.` + skippedTail("videoSkipped", params),
    videoPartial: (params) => `Đã hoàn thành ${params.completed}/${params.total} video bài giảng. ${params.failed} video chưa được.` + skippedTail("videoSkipped", params),
    videoSkipped: (params) => ` ${params.skipped} bài giảng bị khoá đã được bỏ qua.`,
    videoBusy: "Hoàn thành video bài giảng đang chạy.",
    videoNone: "Không tìm thấy video bài giảng nào trong khoá học này.",
    videoNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    videoNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    videoIdentity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
    videoStopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
    videoFailed: "Lần chạy thất bại. Xem console của trình duyệt để biết lý do.",
    completeReadingsButton: "Hoàn thành bài đọc",
    completeReadingsBusy: "Đang hoàn thành…",
    readingStarting: "Đang tìm bài đọc của khoá học này…",
    readingRunning: (params) => `Đã hoàn thành ${params.done}/${params.total} bài đọc.`,
    readingDone: (params) => `Đã hoàn thành ${params.completed}/${params.total} bài đọc. Reload trang để thấy dấu tick.` + skippedTail("readingSkipped", params),
    readingPartial: (params) => `Đã hoàn thành ${params.completed}/${params.total} bài đọc. ${params.failed} bài chưa được.` + skippedTail("readingSkipped", params),
    readingUnverified: (params) => `${params.completed}/${params.total} bài đọc đã xác minh, còn ${params.unverified} bài đã ghi nhưng không đọc lại được.` + skippedTail("readingSkipped", params),
    readingSkipped: (params) => ` ${params.skipped} bài đọc bị khoá đã được bỏ qua.`,
    readingBusy: "Hoàn thành bài đọc đang chạy.",
    readingNone: "Không tìm thấy bài đọc nào trong khoá học này.",
    readingNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    readingNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    readingIdentity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
    readingStopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
    readingFailed: "Lần chạy thất bại. Xem console của trình duyệt để biết lý do.",
    completeDiscussionsButton: "Hoàn thành thảo luận",
    completeDiscussionsBusy: "Đang trả lời…",
    discussionStarting: "Đang tìm thảo luận của khoá học này…",
    discussionRunning: (params) => `Đã trả lời ${params.done}/${params.total} thảo luận.`,
    discussionDone: (params) => `Đã trả lời ${params.completed}/${params.total} thảo luận. Reload trang để xem.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params),
    discussionPartial: (params) => `Đã trả lời ${params.completed}/${params.total} thảo luận. ${params.failed} thảo luận chưa được.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params),
    discussionUnverified: (params) => `${params.completed}/${params.total} câu trả lời đã xác minh, còn ${params.unverified} câu đã đăng nhưng không đọc lại được.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params),
    discussionSkipped: (params) => ` ${params.skipped} thảo luận bị khoá đã được bỏ qua.`,
    discussionAnswered: (params) => ` ${params.answered} thảo luận đã có câu trả lời của bạn.`,
    discussionBusy: "Hoàn thành thảo luận đang chạy.",
    discussionNone: "Không tìm thấy thảo luận nào trong khoá học này.",
    discussionNoText: "Hãy nhập nội dung trả lời trước khi chạy bước thảo luận.",
    discussionNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    discussionNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    discussionIdentity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đăng. Hãy reload trang.",
    discussionStopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
    discussionFailed: "Lần chạy thất bại. Xem console của trình duyệt để biết lý do.",
    discussionReply: "Nội dung trả lời thảo luận",
    discussionReplyHint: "Đúng đoạn này sẽ được đăng vào mọi thảo luận bạn chưa trả lời.",
    completePluginsButton: "Hoàn thành bài thực hành",
    completePluginsBusy: "Đang hoàn thành…",
    pluginStarting: "Đang tìm bài thực hành của khoá học này…",
    pluginRunning: (params) => `Đã đánh dấu ${params.done}/${params.total} bài thực hành.`,
    pluginDone: (params) => `Đã đánh dấu ${params.completed}/${params.total} bài thực hành là đã xong. Reload trang để thấy dấu tick.` + skippedTail("pluginSkipped", params) + alreadyTail("pluginAlready", params),
    pluginPartial: (params) => `Đã đánh dấu ${params.completed}/${params.total} bài thực hành. ${params.failed} bài chưa được.` + skippedTail("pluginSkipped", params) + alreadyTail("pluginAlready", params),
    pluginUnverified: (params) => `${params.completed}/${params.total} bài đã xác minh, còn ${params.unverified} bài đã ghi nhưng không đọc lại được.` + skippedTail("pluginSkipped", params) + alreadyTail("pluginAlready", params),
    pluginSkipped: (params) => ` ${params.skipped} bài bị khoá đã được bỏ qua.`,
    pluginAlready: (params) => ` ${params.already} bài đã được đánh dấu xong từ trước.`,
    pluginBusy: "Hoàn thành bài thực hành đang chạy.",
    pluginNone: "Không tìm thấy bài thực hành, widget, notebook hay mục ứng dụng nào trong khoá học này.",
    pluginNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    pluginNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    pluginIdentity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
    pluginStopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
    pluginFailed: "Lần chạy thất bại. Xem console của trình duyệt để biết lý do.",
    themeNames: { system: "Theo hệ thống", light: "Sáng", dark: "Tối" },
    languageNames: { en: "English", vi: "Tiếng Việt" }
  }
};

const FLAG_SVGS = {
  en: '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#012169"/><path d="M0 0 30 20M30 0 0 20" stroke="#fff" stroke-width="4"/><path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" stroke-width="2"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="4"/></svg>',
  vi: '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#DA251D"/><polygon points="15,4 16.35,8.15 20.71,8.15 17.18,10.71 18.53,14.85 15,12.29 11.47,14.85 12.82,10.71 9.29,8.15 13.65,8.15" fill="#ffff00"/></svg>'
};

const GLYPH_SVGS = {
  system: '<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  light: '<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9 6.3 6.3M17.7 17.7l1.4 1.4M19.1 4.9 17.7 6.3M6.3 17.7 4.9 19.1"/></svg>',
  dark: '<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>'
};

const CHEVRON = '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

const elements = {
  autoCopy: document.getElementById("autoCopy"),
  languagePicker: document.getElementById("languagePicker"),
  themePicker: document.getElementById("themePicker"),
  copyNow: document.getElementById("copyNow"),
  completeVideos: document.getElementById("completeVideos"),
  completeReadings: document.getElementById("completeReadings"),
  completeDiscussions: document.getElementById("completeDiscussions"),
  completePlugins: document.getElementById("completePlugins"),
  discussionReply: document.getElementById("discussionReply"),
  badge: document.getElementById("badge"),
  status: document.getElementById("status")
};

// the sentence the reply box starts with, the same pair discussions.js falls back to
const DEFAULT_REPLY = {
  en: "Thank you for the prompt. I am working through this week and will keep this in mind.",
  vi: "Cảm ơn bạn đã đặt câu hỏi. Mình đang học tuần này và sẽ ghi nhớ điều này."
};

let settings = { autoCopy: false, language: "en", theme: "system", discussionReply: "" };
let lastStatus = { key: "idle", params: 0, kind: "default" };
let videoPolling = false;
let readingPolling = false;
let discussionPolling = false;
let pluginPolling = false;
const pickers = [];

// string table for the current language
function strings() {
  return STRINGS[settings.language] || STRINGS.en;
}

// the extra sentence about items the course keeps locked, read from the current table so
// it changes language together with the rest of the status
function skippedTail(key, params) {
  return params.skipped ? strings()[key](params) : "";
}

// the extra sentence about prompts this account already answered
function answeredTail(key, params) {
  return params.answered ? strings()[key](params) : "";
}

// the extra sentence about practice items Coursera already reports as done
function alreadyTail(key, params) {
  return params.already ? strings()[key](params) : "";
}

// build a custom dropdown with an icon (flag or glyph)
function buildPicker(container, getOptions, getValue, onPick) {
  container.innerHTML = `
    <button type="button" class="picker-button" aria-haspopup="listbox" aria-expanded="false">
      <span class="picker-icon"></span><span class="picker-value"></span>${CHEVRON}
    </button>
    <ul class="picker-list" role="listbox" tabindex="-1"></ul>`;

  const button = container.querySelector(".picker-button");
  const iconSlot = container.querySelector(".picker-icon");
  const valueSlot = container.querySelector(".picker-value");
  const list = container.querySelector(".picker-list");

  // redraw the button and the list when the value or the language changes
  function refresh() {
    const options = getOptions();
    const current = options.find((option) => option.value === getValue()) || options[0];
    iconSlot.innerHTML = current.icon;
    valueSlot.textContent = current.label;
    list.replaceChildren();
    options.forEach((option) => {
      const item = document.createElement("li");
      item.setAttribute("role", "option");
      item.dataset.value = option.value;
      item.setAttribute("aria-selected", String(option.value === current.value));
      item.innerHTML = `${option.icon}<span>${option.label}</span>`
        + (option.value === current.value ? '<span class="tick">&#10003;</span>' : "");
      item.addEventListener("click", () => {
        close();
        onPick(option.value);
      });
      list.append(item);
    });
  }

  // close the dropdown
  function close() {
    container.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
  }

  button.addEventListener("click", () => {
    const isOpen = container.classList.contains("open");
    pickers.forEach((picker) => picker.close());
    if (isOpen) return;
    container.classList.add("open");
    button.setAttribute("aria-expanded", "true");
  });

  // open and navigate with the keyboard
  button.addEventListener("keydown", (event) => {
    if (["ArrowDown", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      container.classList.add("open");
      button.setAttribute("aria-expanded", "true");
      const selected = list.querySelector('li[aria-selected="true"]') || list.firstElementChild;
      if (selected) selected.classList.add("active");
    }
    if (event.key === "Escape") close();
  });

  list.addEventListener("keydown", (event) => {
    const items = Array.from(list.children);
    const activeIndex = items.findIndex((item) => item.classList.contains("active"));
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      items.forEach((item) => item.classList.remove("active"));
      const next = event.key === "ArrowDown" ? activeIndex + 1 : activeIndex - 1;
      const target = items[Math.max(0, Math.min(items.length - 1, next))];
      if (target) target.classList.add("active");
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      items[activeIndex].click();
      button.focus();
    }
    if (event.key === "Escape") close();
  });

  refresh();
  const picker = { refresh, close };
  pickers.push(picker);
  return picker;
}

// options for the language dropdown
function languageOptions() {
  const text = strings();
  return Object.keys(STRINGS).map((value) => ({
    value,
    label: text.languageNames[value],
    icon: FLAG_SVGS[value]
  }));
}

// options for the theme dropdown
function themeOptions() {
  const text = strings();
  return ["system", "light", "dark"].map((value) => ({
    value,
    label: text.themeNames[value],
    icon: GLYPH_SVGS[value]
  }));
}

// store the status as a key so it can be re-translated when the language changes
function setStatus(key, params = 0, kind = "default") {
  lastStatus = { key, params, kind };
  renderStatus();
}

// print the status in the current language
function renderStatus() {
  const text = strings();
  const value = text[lastStatus.key] || lastStatus.key;
  elements.status.textContent = typeof value === "function" ? value(lastStatus.params) : value;
  elements.status.className = `status ${lastStatus.kind}`;
}

// apply the theme, follow system listens to matchMedia
function applyTheme() {
  const dark = settings.theme === "dark"
    || (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

// translate the whole popup into the chosen language
async function applyLanguage() {
  const text = strings();
  document.documentElement.lang = settings.language;
  document.title = text.docTitle;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = text[node.dataset.i18n];
    if (typeof value === "string") node.textContent = value;
  });
  elements.autoCopy.setAttribute("aria-label", text.autoCopy);
  if (!elements.copyNow.disabled) elements.copyNow.textContent = text.copyButton;
  if (!elements.completeVideos.disabled) elements.completeVideos.textContent = text.completeVideosButton;
  if (!elements.completeReadings.disabled) elements.completeReadings.textContent = text.completeReadingsButton;
  if (!elements.completeDiscussions.disabled) elements.completeDiscussions.textContent = text.completeDiscussionsButton;

  // a reply box the student never rewrote follows the interface language, so nobody sends
  // a sentence in a language they did not choose
  const written = elements.discussionReply.value.trim();
  const untouched = Object.values(DEFAULT_REPLY).some((value) => value === written);
  if (untouched && written !== DEFAULT_REPLY[settings.language]) {
    settings.discussionReply = DEFAULT_REPLY[settings.language];
    elements.discussionReply.value = settings.discussionReply;
    await saveSettings();
  }

  pickers.forEach((picker) => picker.refresh());
  renderStatus();
}

// save the settings
async function saveSettings() {
  await chrome.storage.local.set(settings);
}

// read the settings and build the two dropdowns when the popup opens
async function initialize() {
  const stored = await chrome.storage.local.get(["autoCopy", "language", "theme", "discussionReply"]);
  settings = {
    autoCopy: stored.autoCopy === true,
    language: STRINGS[stored.language] ? stored.language : "en",
    theme: ["system", "light", "dark"].includes(stored.theme) ? stored.theme : "system",
    // an empty box stays empty: it means the student cleared it on purpose
    discussionReply: typeof stored.discussionReply === "string"
      ? stored.discussionReply
      : DEFAULT_REPLY[STRINGS[stored.language] ? stored.language : "en"]
  };
  elements.autoCopy.checked = settings.autoCopy;
  elements.discussionReply.value = settings.discussionReply;
  elements.badge.textContent = "v" + chrome.runtime.getManifest().version;
  // a first open also stores the sentence the box shows, so the page and the popup agree
  await saveSettings();

  buildPicker(elements.languagePicker, languageOptions,
    () => settings.language,
    async (value) => {
      settings.language = value;
      await saveSettings();
      await applyLanguage();
    });

  buildPicker(elements.themePicker, themeOptions,
    () => settings.theme,
    async (value) => {
      settings.theme = value;
      await saveSettings();
      applyTheme();
      pickers.forEach((picker) => picker.refresh());
    });

  applyTheme();
  await applyLanguage();
}

// send a message to the content script of the active tab
function sendToActiveTab(message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab || !tab.id) {
        reject(new Error("No active tab."));
        return;
      }
      chrome.tabs.sendMessage(tab.id, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    });
  });
}

// translate the state the content script reports
function showVideoState(state) {
  const params = {
    done: state.done || 0,
    total: state.total || 0,
    completed: state.completed || 0,
    failed: state.failed || 0,
    skipped: state.skipped || 0
  };
  if (state.code === "starting") setStatus("videoStarting");
  else if (state.code === "running") setStatus("videoRunning", params);
  else if (state.code === "done") setStatus("videoDone", params);
  else if (state.code === "partial") setStatus("videoPartial", params, "warn");
  else if (state.code === "busy") setStatus("videoBusy", 0, "warn");
  else if (state.code === "none") setStatus("videoNone", 0, "warn");
  else if (state.code === "notCourse") setStatus("videoNotCourse", 0, "error");
  else if (state.code === "notLoggedIn") setStatus("videoNotLoggedIn", 0, "error");
  else if (state.code === "identity") setStatus("videoIdentity", 0, "error");
  else if (state.code === "stopped") setStatus("videoStopped", 0, "warn");
  else setStatus("videoFailed", 0, "error");
}

// follow the run while the popup stays open
async function followVideoRun() {
  if (videoPolling) return;
  videoPolling = true;
  try {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const state = await sendToActiveTab({ action: "videoStatus" }).catch(() => null);
      if (!state) break;
      showVideoState(state);
      if (state.phase !== "running") break;
    }
  } finally {
    videoPolling = false;
    elements.completeVideos.disabled = false;
    elements.completeVideos.textContent = strings().completeVideosButton;
  }
}

// start the lecture video completion and watch its progress
async function startVideoRun() {
  elements.completeVideos.disabled = true;
  elements.completeVideos.textContent = strings().completeVideosBusy;
  setStatus("videoStarting");
  try {
    const response = await sendToActiveTab({ action: "completeVideos" });
    if (!response) throw new Error("no answer");
    showVideoState(response);
    if (response.phase === "running") {
      followVideoRun();
      return;
    }
  } catch {
    setStatus("videoNotCourse", 0, "error");
  }
  elements.completeVideos.disabled = false;
  elements.completeVideos.textContent = strings().completeVideosButton;
}

// translate the state the content script reports
function showReadingState(state) {
  const params = {
    done: state.done || 0,
    total: state.total || 0,
    completed: state.completed || 0,
    unverified: state.unverified || 0,
    failed: state.failed || 0,
    skipped: state.skipped || 0
  };
  if (state.code === "starting") setStatus("readingStarting");
  else if (state.code === "running") setStatus("readingRunning", params);
  else if (state.code === "done") setStatus("readingDone", params);
  else if (state.code === "partial") setStatus("readingPartial", params, "warn");
  else if (state.code === "unverified") setStatus("readingUnverified", params, "warn");
  else if (state.code === "busy") setStatus("readingBusy", 0, "warn");
  else if (state.code === "none") setStatus("readingNone", 0, "warn");
  else if (state.code === "notCourse") setStatus("readingNotCourse", 0, "error");
  else if (state.code === "notLoggedIn") setStatus("readingNotLoggedIn", 0, "error");
  else if (state.code === "identity") setStatus("readingIdentity", 0, "error");
  else if (state.code === "stopped") setStatus("readingStopped", 0, "warn");
  else setStatus("readingFailed", 0, "error");
}

// follow the run while the popup stays open
async function followReadingRun() {
  if (readingPolling) return;
  readingPolling = true;
  try {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const state = await sendToActiveTab({ action: "readingStatus" }).catch(() => null);
      if (!state) break;
      showReadingState(state);
      if (state.phase !== "running") break;
    }
  } finally {
    readingPolling = false;
    elements.completeReadings.disabled = false;
    elements.completeReadings.textContent = strings().completeReadingsButton;
  }
}

// start the reading completion and watch its progress
async function startReadingRun() {
  elements.completeReadings.disabled = true;
  elements.completeReadings.textContent = strings().completeReadingsBusy;
  setStatus("readingStarting");
  try {
    const response = await sendToActiveTab({ action: "completeReadings" });
    if (!response) throw new Error("no answer");
    showReadingState(response);
    if (response.phase === "running") {
      followReadingRun();
      return;
    }
  } catch {
    setStatus("readingNotCourse", 0, "error");
  }
  elements.completeReadings.disabled = false;
  elements.completeReadings.textContent = strings().completeReadingsButton;
}

// translate the state the content script reports
function showDiscussionState(state) {
  const params = {
    done: state.done || 0,
    total: state.total || 0,
    completed: state.completed || 0,
    unverified: state.unverified || 0,
    failed: state.failed || 0,
    skipped: state.skipped || 0,
    answered: state.answered || 0
  };
  if (state.code === "starting") setStatus("discussionStarting");
  else if (state.code === "running") setStatus("discussionRunning", params);
  else if (state.code === "done") setStatus("discussionDone", params);
  else if (state.code === "partial") setStatus("discussionPartial", params, "warn");
  else if (state.code === "unverified") setStatus("discussionUnverified", params, "warn");
  else if (state.code === "busy") setStatus("discussionBusy", 0, "warn");
  else if (state.code === "none") setStatus("discussionNone", 0, "warn");
  else if (state.code === "noText") setStatus("discussionNoText", 0, "error");
  else if (state.code === "notCourse") setStatus("discussionNotCourse", 0, "error");
  else if (state.code === "notLoggedIn") setStatus("discussionNotLoggedIn", 0, "error");
  else if (state.code === "identity") setStatus("discussionIdentity", 0, "error");
  else if (state.code === "stopped") setStatus("discussionStopped", 0, "warn");
  else setStatus("discussionFailed", 0, "error");
}

// follow the run while the popup stays open
async function followDiscussionRun() {
  if (discussionPolling) return;
  discussionPolling = true;
  try {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const state = await sendToActiveTab({ action: "discussionStatus" }).catch(() => null);
      if (!state) break;
      showDiscussionState(state);
      if (state.phase !== "running") break;
    }
  } finally {
    discussionPolling = false;
    elements.completeDiscussions.disabled = false;
    elements.completeDiscussions.textContent = strings().completeDiscussionsButton;
  }
}

// start the discussion replies and watch their progress
async function startDiscussionRun() {
  elements.completeDiscussions.disabled = true;
  elements.completeDiscussions.textContent = strings().completeDiscussionsBusy;
  setStatus("discussionStarting");
  try {
    const response = await sendToActiveTab({ action: "completeDiscussions" });
    if (!response) throw new Error("no answer");
    showDiscussionState(response);
    if (response.phase === "running") {
      followDiscussionRun();
      return;
    }
  } catch {
    setStatus("discussionNotCourse", 0, "error");
  }
  elements.completeDiscussions.disabled = false;
  elements.completeDiscussions.textContent = strings().completeDiscussionsButton;
}

// translate the state the content script reports
function showPluginState(state) {
  const params = {
    done: state.done || 0,
    total: state.total || 0,
    completed: state.completed || 0,
    unverified: state.unverified || 0,
    failed: state.failed || 0,
    skipped: state.skipped || 0,
    already: state.already || 0
  };
  if (state.code === "starting") setStatus("pluginStarting");
  else if (state.code === "running") setStatus("pluginRunning", params);
  else if (state.code === "done") setStatus("pluginDone", params);
  else if (state.code === "partial") setStatus("pluginPartial", params, "warn");
  else if (state.code === "unverified") setStatus("pluginUnverified", params, "warn");
  else if (state.code === "busy") setStatus("pluginBusy", 0, "warn");
  else if (state.code === "none") setStatus("pluginNone", 0, "warn");
  else if (state.code === "notCourse") setStatus("pluginNotCourse", 0, "error");
  else if (state.code === "notLoggedIn") setStatus("pluginNotLoggedIn", 0, "error");
  else if (state.code === "identity") setStatus("pluginIdentity", 0, "error");
  else if (state.code === "stopped") setStatus("pluginStopped", 0, "warn");
  else setStatus("pluginFailed", 0, "error");
}

// follow the run while the popup stays open
async function followPluginRun() {
  if (pluginPolling) return;
  pluginPolling = true;
  try {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const state = await sendToActiveTab({ action: "pluginStatus" }).catch(() => null);
      if (!state) break;
      showPluginState(state);
      if (state.phase !== "running") break;
    }
  } finally {
    pluginPolling = false;
    elements.completePlugins.disabled = false;
    elements.completePlugins.textContent = strings().completePluginsButton;
  }
}

// mark the practice items done and watch their progress
async function startPluginRun() {
  elements.completePlugins.disabled = true;
  elements.completePlugins.textContent = strings().completePluginsBusy;
  setStatus("pluginStarting");
  try {
    const response = await sendToActiveTab({ action: "completePlugins" });
    if (!response) throw new Error("no answer");
    showPluginState(response);
    if (response.phase === "running") {
      followPluginRun();
      return;
    }
  } catch {
    setStatus("pluginNotCourse", 0, "error");
  }
  elements.completePlugins.disabled = false;
  elements.completePlugins.textContent = strings().completePluginsButton;
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".picker")) return;
  pickers.forEach((picker) => picker.close());
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

elements.autoCopy.addEventListener("change", async () => {
  settings.autoCopy = elements.autoCopy.checked;
  await saveSettings();
});

elements.copyNow.addEventListener("click", async () => {
  elements.copyNow.disabled = true;
  elements.copyNow.textContent = strings().copyButtonBusy;
  setStatus("reading");
  try {
    const response = await sendToActiveTab({ action: "copyNow" });
    if (response?.error) throw new Error(response.error);
    if (!response?.count) {
      setStatus("noQuestions", 0, "warn");
    } else if (response.copied) {
      setStatus("copied", response.count);
    } else {
      setStatus("blocked", 0, "warn");
    }
  } catch {
    setStatus("wrongPage", 0, "error");
  } finally {
    elements.copyNow.disabled = false;
    elements.copyNow.textContent = strings().copyButton;
  }
});

elements.completeVideos.addEventListener("click", () => {
  startVideoRun();
});

elements.completeReadings.addEventListener("click", () => {
  startReadingRun();
});

elements.completeDiscussions.addEventListener("click", () => {
  startDiscussionRun();
});

elements.completePlugins.addEventListener("click", () => {
  startPluginRun();
});

// the reply box is saved as it is typed, the page reads it back when a run starts
elements.discussionReply.addEventListener("input", async () => {
  settings.discussionReply = elements.discussionReply.value;
  await saveSettings();
});

initialize();
