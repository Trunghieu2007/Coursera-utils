const STRINGS = {
  en: {
    docTitle: "Copy Questions",
    title: "Copy Questions",
    subtitle: "Copy the visible question text to your clipboard.",
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
    videoDone: (params) => `Completed ${params.completed} of ${params.total} lecture videos. Reload the page to see the checkmarks.`,
    videoPartial: (params) => `Completed ${params.completed} of ${params.total} lecture videos. ${params.failed} still need attention.`,
    videoBusy: "Lecture video completion is already running.",
    videoNone: "No lecture videos were found in this course.",
    videoNotCourse: "Open a Coursera course page first.",
    videoNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    videoFailed: "The run failed. Check the browser console for the reason.",
    themeNames: { system: "Follow system", light: "Light", dark: "Dark" },
    languageNames: { en: "English", vi: "Tiếng Việt" }
  },
  vi: {
    docTitle: "Sao chép câu hỏi",
    title: "Sao chép câu hỏi",
    subtitle: "Sao chép nội dung câu hỏi đang hiển thị vào bảng nhớ tạm.",
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
    videoDone: (params) => `Đã hoàn thành ${params.completed}/${params.total} video bài giảng. Reload trang để thấy dấu tick.`,
    videoPartial: (params) => `Đã hoàn thành ${params.completed}/${params.total} video bài giảng. ${params.failed} video chưa được.`,
    videoBusy: "Hoàn thành video bài giảng đang chạy.",
    videoNone: "Không tìm thấy video bài giảng nào trong khoá học này.",
    videoNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    videoNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    videoFailed: "Lần chạy thất bại. Xem console của trình duyệt để biết lý do.",
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
  badge: document.getElementById("badge"),
  status: document.getElementById("status")
};

let settings = { autoCopy: false, language: "en", theme: "system" };
let lastStatus = { key: "idle", params: 0, kind: "default" };
let videoPolling = false;
const pickers = [];

// string table for the current language
function strings() {
  return STRINGS[settings.language] || STRINGS.en;
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
function applyLanguage() {
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
  pickers.forEach((picker) => picker.refresh());
  renderStatus();
}

// save the settings
async function saveSettings() {
  await chrome.storage.local.set(settings);
}

// read the settings and build the two dropdowns when the popup opens
async function initialize() {
  const stored = await chrome.storage.local.get(["autoCopy", "language", "theme"]);
  settings = {
    autoCopy: stored.autoCopy === true,
    language: STRINGS[stored.language] ? stored.language : "en",
    theme: ["system", "light", "dark"].includes(stored.theme) ? stored.theme : "system"
  };
  elements.autoCopy.checked = settings.autoCopy;
  elements.badge.textContent = "v" + chrome.runtime.getManifest().version;

  buildPicker(elements.languagePicker, languageOptions,
    () => settings.language,
    async (value) => {
      settings.language = value;
      await saveSettings();
      applyLanguage();
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
  applyLanguage();
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
    failed: state.failed || 0
  };
  if (state.code === "starting") setStatus("videoStarting");
  else if (state.code === "running") setStatus("videoRunning", params);
  else if (state.code === "done") setStatus("videoDone", params);
  else if (state.code === "partial") setStatus("videoPartial", params, "warn");
  else if (state.code === "busy") setStatus("videoBusy", 0, "warn");
  else if (state.code === "none") setStatus("videoNone", 0, "warn");
  else if (state.code === "notCourse") setStatus("videoNotCourse", 0, "error");
  else if (state.code === "notLoggedIn") setStatus("videoNotLoggedIn", 0, "error");
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

initialize();
