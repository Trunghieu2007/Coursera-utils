const STRINGS = {
  en: {
    docTitle: "Copy Questions",
    title: "Copy Questions",
    subtitle: "Copy the visible questions, with their options, code and formulas, to your clipboard.",
    autoCopy: "Auto copy",
    autoCopyHint: "Copy questions when a lesson page opens.",
    language: "Language",
    theme: "Theme",
    requestMode: "Request mode",
    requestModeHint: "Sequential waits a little between items. Instantly sends the same one-at-a-time requests with no pause.",
    requestModeNames: { sequential: "Sequential", instant: "Instantly" },
    copyButton: "Copy this page",
    copyButtonBusy: "Copying…",
    skipAllButton: "Skip everything",
    skipAllBusy: "Skipping…",
    skipAllStarting: "Scanning the course, then skipping every item that can be skipped…",
    skipAllRunning: (params) => `Skipped ${params.done} of ${params.total} items.`,
    skipAllDone: (params) => `Skip finished: ${params.completed} newly marked, ${params.already} already done. Reload the page to see the checkmarks.` + skipAllTails(params),
    skipAllPartial: (params) => `Skip finished: ${params.completed} newly marked, ${params.already} already done, ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skipAllTails(params),
    skipAllUnverified: (params) => `Skip finished: ${params.completed} newly marked, ${params.already} already done, ${params.unverified} could not be read back.` + skipAllTails(params),
    skipAllSkipped: (params) => ` ${params.skipped} locked item${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    skipAllAnswered: (params) => ` ${params.answered} discussion prompt${params.answered === 1 ? "" : "s"} already had your answer.`,
    skipAllDiscussionLeft: " Discussion prompts were left alone because no reply text is set.",
    skipAllNone: "No item that can be skipped was found in this course.",
    skipAllNotCourse: "Open a Coursera course page first.",
    skipAllNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    skipAllIdentity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
    skipAllStopped: "The page changed while the run was going on, so the rest of the list was left alone.",
    skipAllFailed: "The run failed. Check the browser console for the reason.",
    idle: "Open a Coursera lesson page to copy its questions.",
    reading: "Reading the page…",
    copied: (count) => `Copied ${count} question${count === 1 ? "" : "s"}!`,
    blocked: "Clipboard blocked: click the page, then copy again.",
    noQuestions: "No question is visible on this page yet. Wait for it to load, then copy again.",
    wrongPage: "Current tab is not a Coursera lesson page, or reload it after installing.",
    accountFallbackName: "Coursera account",
    accountUnknown: "The signed-in Coursera account could not be read. Reload the page.",
    accountOffPage: "Open a Coursera page to see the signed-in account.",
    overviewTitle: "Learning progress",
    overviewCaption: (params) => `Average across ${params.count} course${params.count === 1 ? "" : "s"} in progress.`,
    courseProgressTitle: "Course progress",
    courseCaption: (params) => `${params.done} of ${params.total} items completed.`,
    completeVideosButton: "Complete lecture videos",
    completeVideosBusy: "Completing…",
    videoStarting: "Looking for the lecture videos of this course…",
    videoRunning: (params) => `Completed ${params.done} of ${params.total} lecture videos.`,
    videoDone: (params) => `Completed ${params.completed} of ${params.total} lecture videos. Reload the page to see the checkmarks.` + skippedTail("videoSkipped", params) + alreadyTail("videoAlready", params),
    videoPartial: (params) => `Completed ${params.completed} of ${params.total} lecture videos. ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skippedTail("videoSkipped", params) + alreadyTail("videoAlready", params),
    videoSkipped: (params) => ` ${params.skipped} locked lecture${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    videoAlready: (params) => ` ${params.already} lecture${params.already === 1 ? " was" : "s were"} already done.`,
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
    readingDone: (params) => `Completed ${params.completed} of ${params.total} readings. Reload the page to see the checkmarks.` + skippedTail("readingSkipped", params) + alreadyTail("readingAlready", params),
    readingPartial: (params) => `Completed ${params.completed} of ${params.total} readings. ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skippedTail("readingSkipped", params) + alreadyTail("readingAlready", params),
    readingUnverified: (params) => `${params.completed} of ${params.total} readings are confirmed, ${params.unverified} could not be read back.` + skippedTail("readingSkipped", params) + alreadyTail("readingAlready", params),
    readingSkipped: (params) => ` ${params.skipped} locked reading${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    readingAlready: (params) => ` ${params.already} reading${params.already === 1 ? " was" : "s were"} already done.`,
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
    discussionDone: (params) => `Replied to ${params.completed} of ${params.total} discussion prompts. Reload the page to see them.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params) + alreadyTail("discussionAlready", params),
    discussionPartial: (params) => `Replied to ${params.completed} of ${params.total} discussion prompts. ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params) + alreadyTail("discussionAlready", params),
    discussionUnverified: (params) => `${params.completed} of ${params.total} replies are confirmed, ${params.unverified} could not be read back.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params) + alreadyTail("discussionAlready", params),
    discussionSkipped: (params) => ` ${params.skipped} locked prompt${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    discussionAlready: (params) => ` ${params.already} prompt${params.already === 1 ? " was" : "s were"} already complete.`,
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
    pluginNone: "No ungraded practice item was found in this course.",
    pluginNotCourse: "Open a Coursera course page first.",
    pluginNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    pluginIdentity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
    pluginStopped: "The page changed while the run was going on, so the rest of the list was left alone.",
    pluginFailed: "The run failed. Check the browser console for the reason.",
    completeLabsButton: "Complete labs",
    completeLabsBusy: "Completing…",
    labStarting: "Looking for the labs of this course…",
    labRunning: (params) => `Marked ${params.done} of ${params.total} labs.`,
    labDone: (params) => `Marked ${params.completed} of ${params.total} labs as done. Reload the page to see the checkmarks.` + skippedTail("labSkipped", params) + alreadyTail("labAlready", params),
    labPartial: (params) => `Marked ${params.completed} of ${params.total} labs. ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skippedTail("labSkipped", params) + alreadyTail("labAlready", params),
    labUnverified: (params) => `${params.completed} of ${params.total} labs are confirmed, ${params.unverified} could not be read back.` + skippedTail("labSkipped", params) + alreadyTail("labAlready", params),
    labSkipped: (params) => ` ${params.skipped} locked lab${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    labAlready: (params) => ` ${params.already} lab${params.already === 1 ? " was" : "s were"} already done.`,
    labBusy: "Lab completion is already running.",
    labNone: "No lab was found in this course.",
    labNotCourse: "Open a Coursera course page first.",
    labNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    labIdentity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
    labStopped: "The page changed while the run was going on, so the rest of the list was left alone.",
    labFailed: "The run failed. Check the browser console for the reason.",
    completeLtiButton: "Complete ungraded labs",
    completeLtiBusy: "Completing…",
    ltiStarting: "Looking for the ungraded labs of this course…",
    ltiRunning: (params) => `Marked ${params.done} of ${params.total} ungraded labs.`,
    ltiDone: (params) => `Marked ${params.completed} of ${params.total} ungraded labs as done. Reload the page to see the checkmarks.` + skippedTail("ltiSkipped", params) + alreadyTail("ltiAlready", params),
    ltiPartial: (params) => `Marked ${params.completed} of ${params.total} ungraded labs. ${params.failed} still ${params.failed === 1 ? "needs" : "need"} attention.` + skippedTail("ltiSkipped", params) + alreadyTail("ltiAlready", params),
    ltiUnverified: (params) => `${params.completed} of ${params.total} ungraded labs are confirmed, ${params.unverified} could not be read back.` + skippedTail("ltiSkipped", params) + alreadyTail("ltiAlready", params),
    ltiSkipped: (params) => ` ${params.skipped} locked ungraded lab${params.skipped === 1 ? " was left alone." : "s were left alone."}`,
    ltiAlready: (params) => ` ${params.already} ungraded lab${params.already === 1 ? " was" : "s were"} already done.`,
    ltiBusy: "Ungraded lab completion is already running.",
    ltiNone: "No ungraded lab was found in this course.",
    ltiNotCourse: "Open a Coursera course page first.",
    ltiNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    ltiIdentity: "The page and Coursera name two different accounts, so nothing was marked. Reload the page.",
    ltiStopped: "The page changed while the run was going on, so the rest of the list was left alone.",
    ltiFailed: "The run failed. Check the browser console for the reason.",
    checkGradedButton: "Check graded app items",
    checkGradedBusy: "Checking…",
    gradedStarting: "Looking for the graded app items of this course…",
    gradedDone: (params) => `Graded app items completed: ${params.completed} of ${params.total}. This extension never submits or changes graded work.`,
    gradedNone: "No graded app item was found in this course.",
    gradedNotCourse: "Open a Coursera course page first.",
    gradedNotLoggedIn: "Coursera did not return a signed-in user. Log in and reload the page.",
    gradedIdentity: "The page and Coursera name two different accounts, so nothing was read. Reload the page.",
    gradedFailed: "The graded app items could not be read. Check the browser console.",
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
    requestMode: "Chế độ gửi",
    requestModeHint: "Sequential chờ một chút giữa các bài. Instantly gửi các yêu cầu tuần tự nhưng không chờ.",
    requestModeNames: { sequential: "Sequential", instant: "Instantly" },
    copyButton: "Sao chép trang này",
    copyButtonBusy: "Đang sao chép…",
    skipAllButton: "Skip mọi bài có thể",
    skipAllBusy: "Đang skip…",
    skipAllStarting: "Đang quét khoá học rồi skip mọi bài có thể…",
    skipAllRunning: (params) => `Đã skip ${params.done}/${params.total} bài.`,
    skipAllDone: (params) => `Đã skip xong: ${params.completed} bài vừa đánh dấu, ${params.already} bài đã xong từ trước. Reload trang để thấy dấu tick.` + skipAllTails(params),
    skipAllPartial: (params) => `Đã skip xong: ${params.completed} bài vừa đánh dấu, ${params.already} bài đã xong từ trước, còn ${params.failed} bài chưa được.` + skipAllTails(params),
    skipAllUnverified: (params) => `Đã skip xong: ${params.completed} bài vừa đánh dấu, ${params.already} bài đã xong từ trước, còn ${params.unverified} bài đã ghi nhưng không đọc lại được.` + skipAllTails(params),
    skipAllSkipped: (params) => ` ${params.skipped} bài bị khoá được bỏ qua.`,
    skipAllAnswered: (params) => ` ${params.answered} thảo luận đã có câu trả lời của bạn.`,
    skipAllDiscussionLeft: " Các thảo luận được bỏ qua vì chưa có nội dung trả lời.",
    skipAllNone: "Không tìm thấy bài nào có thể skip trong khoá học này.",
    skipAllNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    skipAllNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    skipAllIdentity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
    skipAllStopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
    skipAllFailed: "Lần chạy thất bại. Xem console của trình duyệt để biết lý do.",
    idle: "Mở một trang bài tập Coursera để sao chép câu hỏi.",
    reading: "Đang đọc trang…",
    copied: (count) => `Đã sao chép ${count} câu hỏi!`,
    blocked: "Bảng nhớ tạm bị chặn: click vào trang rồi sao chép lại.",
    noQuestions: "Trang này chưa hiển thị câu hỏi nào. Đợi trang tải xong rồi sao chép lại.",
    wrongPage: "Tab hiện tại không phải trang bài tập Coursera, hoặc reload trang sau khi cài.",
    accountFallbackName: "Tài khoản Coursera",
    accountUnknown: "Không đọc được tài khoản Coursera đang đăng nhập. Hãy reload trang.",
    accountOffPage: "Mở một trang Coursera để xem tài khoản đang đăng nhập.",
    overviewTitle: "Tiến độ học tập",
    overviewCaption: (params) => `Trung bình trên ${params.count} khoá đang học.`,
    courseProgressTitle: "Tiến độ khoá học",
    courseCaption: (params) => `Đã hoàn thành ${params.done}/${params.total} mục.`,
    completeVideosButton: "Hoàn thành video bài giảng",
    completeVideosBusy: "Đang hoàn thành…",
    videoStarting: "Đang tìm video bài giảng của khoá học này…",
    videoRunning: (params) => `Đã hoàn thành ${params.done}/${params.total} video bài giảng.`,
    videoDone: (params) => `Đã hoàn thành ${params.completed}/${params.total} video bài giảng. Reload trang để thấy dấu tick.` + skippedTail("videoSkipped", params) + alreadyTail("videoAlready", params),
    videoPartial: (params) => `Đã hoàn thành ${params.completed}/${params.total} video bài giảng. ${params.failed} video chưa được.` + skippedTail("videoSkipped", params) + alreadyTail("videoAlready", params),
    videoSkipped: (params) => ` ${params.skipped} bài giảng bị khoá đã được bỏ qua.`,
    videoAlready: (params) => ` ${params.already} bài giảng đã xong từ trước.`,
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
    readingDone: (params) => `Đã hoàn thành ${params.completed}/${params.total} bài đọc. Reload trang để thấy dấu tick.` + skippedTail("readingSkipped", params) + alreadyTail("readingAlready", params),
    readingPartial: (params) => `Đã hoàn thành ${params.completed}/${params.total} bài đọc. ${params.failed} bài chưa được.` + skippedTail("readingSkipped", params) + alreadyTail("readingAlready", params),
    readingUnverified: (params) => `${params.completed}/${params.total} bài đọc đã xác minh, còn ${params.unverified} bài đã ghi nhưng không đọc lại được.` + skippedTail("readingSkipped", params) + alreadyTail("readingAlready", params),
    readingSkipped: (params) => ` ${params.skipped} bài đọc bị khoá đã được bỏ qua.`,
    readingAlready: (params) => ` ${params.already} bài đọc đã xong từ trước.`,
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
    discussionDone: (params) => `Đã trả lời ${params.completed}/${params.total} thảo luận. Reload trang để xem.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params) + alreadyTail("discussionAlready", params),
    discussionPartial: (params) => `Đã trả lời ${params.completed}/${params.total} thảo luận. ${params.failed} thảo luận chưa được.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params) + alreadyTail("discussionAlready", params),
    discussionUnverified: (params) => `${params.completed}/${params.total} câu trả lời đã xác minh, còn ${params.unverified} câu đã đăng nhưng không đọc lại được.` + skippedTail("discussionSkipped", params) + answeredTail("discussionAnswered", params) + alreadyTail("discussionAlready", params),
    discussionSkipped: (params) => ` ${params.skipped} thảo luận bị khoá đã được bỏ qua.`,
    discussionAlready: (params) => ` ${params.already} thảo luận đã hoàn thành từ trước.`,
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
    pluginNone: "Không tìm thấy bài thực hành nào trong khoá học này.",
    pluginNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    pluginNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    pluginIdentity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
    pluginStopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
    pluginFailed: "Lần chạy thất bại. Xem console của trình duyệt để biết lý do.",
    completeLabsButton: "Hoàn thành lab",
    completeLabsBusy: "Đang hoàn thành…",
    labStarting: "Đang tìm lab của khoá học này…",
    labRunning: (params) => `Đã đánh dấu ${params.done}/${params.total} lab.`,
    labDone: (params) => `Đã đánh dấu ${params.completed}/${params.total} lab là đã xong. Reload trang để thấy dấu tick.` + skippedTail("labSkipped", params) + alreadyTail("labAlready", params),
    labPartial: (params) => `Đã đánh dấu ${params.completed}/${params.total} lab. ${params.failed} bài chưa được.` + skippedTail("labSkipped", params) + alreadyTail("labAlready", params),
    labUnverified: (params) => `${params.completed}/${params.total} lab đã xác minh, còn ${params.unverified} bài đã ghi nhưng không đọc lại được.` + skippedTail("labSkipped", params) + alreadyTail("labAlready", params),
    labSkipped: (params) => ` ${params.skipped} lab bị khoá được bỏ qua.`,
    labAlready: (params) => ` ${params.already} lab đã được đánh dấu xong từ trước.`,
    labBusy: "Hoàn thành lab đang chạy.",
    labNone: "Không tìm thấy lab nào trong khoá học này.",
    labNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    labNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    labIdentity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
    labStopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
    labFailed: "Lần chạy thất bại. Xem console của trình duyệt để biết lý do.",
    completeLtiButton: "Hoàn thành lab chưa cho điểm",
    completeLtiBusy: "Đang hoàn thành…",
    ltiStarting: "Đang tìm lab chưa cho điểm của khoá học này…",
    ltiRunning: (params) => `Đã đánh dấu ${params.done}/${params.total} lab chưa cho điểm.`,
    ltiDone: (params) => `Đã đánh dấu ${params.completed}/${params.total} lab chưa cho điểm là đã xong. Reload trang để thấy dấu tick.` + skippedTail("ltiSkipped", params) + alreadyTail("ltiAlready", params),
    ltiPartial: (params) => `Đã đánh dấu ${params.completed}/${params.total} lab chưa cho điểm. ${params.failed} bài chưa được.` + skippedTail("ltiSkipped", params) + alreadyTail("ltiAlready", params),
    ltiUnverified: (params) => `${params.completed}/${params.total} lab chưa cho điểm đã xác minh, còn ${params.unverified} bài đã ghi nhưng không đọc lại được.` + skippedTail("ltiSkipped", params) + alreadyTail("ltiAlready", params),
    ltiSkipped: (params) => ` ${params.skipped} lab chưa cho điểm bị khoá được bỏ qua.`,
    ltiAlready: (params) => ` ${params.already} lab chưa cho điểm đã được đánh dấu xong từ trước.`,
    ltiBusy: "Hoàn thành lab chưa cho điểm đang chạy.",
    ltiNone: "Không tìm thấy lab chưa cho điểm nào trong khoá học này.",
    ltiNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    ltiNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    ltiIdentity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đánh dấu. Hãy reload trang.",
    ltiStopped: "Trang đã thay đổi khi đang chạy, nên phần còn lại được giữ nguyên.",
    ltiFailed: "Lần chạy thất bại. Xem console của trình duyệt để biết lý do.",
    checkGradedButton: "Kiểm tra app chấm điểm",
    checkGradedBusy: "Đang kiểm tra…",
    gradedStarting: "Đang tìm app chấm điểm của khoá học này…",
    gradedDone: (params) => `App chấm điểm đã hoàn thành: ${params.completed}/${params.total}. Extension này không nộp hay sửa bài chấm điểm.`,
    gradedNone: "Không tìm thấy app chấm điểm nào trong khoá học này.",
    gradedNotCourse: "Hãy mở một trang khoá học Coursera trước.",
    gradedNotLoggedIn: "Coursera không trả về tài khoản đã đăng nhập. Hãy đăng nhập rồi reload trang.",
    gradedIdentity: "Trang và Coursera chỉ hai tài khoản khác nhau, nên không có gì được đọc. Hãy reload trang.",
    gradedFailed: "Không đọc được các app chấm điểm. Xem console của trình duyệt.",
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
  dark: '<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  sequential: '<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/><path d="M9 6h12M9 12h12M9 18h12"/></svg>',
  instant: '<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>'
};

const CHEVRON = '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

const elements = {
  account: document.getElementById("account"),
  accountPhoto: document.getElementById("accountPhoto"),
  accountFallback: document.getElementById("accountFallback"),
  accountName: document.getElementById("accountName"),
  accountEmail: document.getElementById("accountEmail"),
  overview: document.getElementById("overview"),
  overviewTitle: document.getElementById("overviewTitle"),
  overviewPercent: document.getElementById("overviewPercent"),
  overviewName: document.getElementById("overviewName"),
  overviewCaption: document.getElementById("overviewCaption"),
  overviewTypes: document.getElementById("overviewTypes"),
  overviewBar: document.getElementById("overviewBar"),
  overviewFill: document.getElementById("overviewFill"),
  autoCopy: document.getElementById("autoCopy"),
  languagePicker: document.getElementById("languagePicker"),
  themePicker: document.getElementById("themePicker"),
  requestModePicker: document.getElementById("requestModePicker"),
  copyNow: document.getElementById("copyNow"),
  skipEverything: document.getElementById("skipEverything"),
  completeVideos: document.getElementById("completeVideos"),
  completeReadings: document.getElementById("completeReadings"),
  completeDiscussions: document.getElementById("completeDiscussions"),
  completePlugins: document.getElementById("completePlugins"),
  completeLabs: document.getElementById("completeLabs"),
  completeLti: document.getElementById("completeLti"),
  checkGraded: document.getElementById("checkGraded"),
  discussionReply: document.getElementById("discussionReply"),
  badge: document.getElementById("badge"),
  status: document.getElementById("status")
};

const accountGlyph = elements.accountFallback.firstElementChild;

// the sentence the reply box starts with, the same pair discussions.js falls back to
const DEFAULT_REPLY = {
  en: "Thank you for the prompt. I am working through this week and will keep this in mind.",
  vi: "Cảm ơn bạn đã đặt câu hỏi. Mình đang học tuần này và sẽ ghi nhớ điều này."
};

let settings = { autoCopy: false, language: "en", theme: "system", requestMode: "sequential", discussionReply: "" };
let lastStatus = { key: "idle", params: 0, kind: "default" };
let accountView = { kind: "idle", account: null };
let overviewView = { kind: "idle", percent: 0, count: 0 };
const COURSE_TYPE_LIMIT = 60;
let videoPolling = false;
let readingPolling = false;
let discussionPolling = false;
let pluginPolling = false;
let labPolling = false;
let ltiPolling = false;
let skipAllPolling = false;
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

// the extra sentences of the skip-all status: locked items, prompts this account already
// answered, and an empty reply box
function skipAllTails(params) {
  return skippedTail("skipAllSkipped", params)
    + answeredTail("skipAllAnswered", params)
    + (params.discussionLeft ? strings().skipAllDiscussionLeft : "");
}

// hand an action button back to the student. The skip-all run keeps every action button
// disabled until its own poll ends, so a run that finishes inside it does not re-open them.
function releaseActionButton(button, text) {
  if (skipAllPolling) return;
  button.disabled = false;
  button.textContent = text;
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

// options for the request mode dropdown, the setting every skip step follows
function requestModeOptions() {
  const text = strings();
  return ["sequential", "instant"].map((value) => ({
    value,
    label: text.requestModeNames[value],
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
  if (!elements.skipEverything.disabled) elements.skipEverything.textContent = text.skipAllButton;
  if (!elements.completeVideos.disabled) elements.completeVideos.textContent = text.completeVideosButton;
  if (!elements.completeReadings.disabled) elements.completeReadings.textContent = text.completeReadingsButton;
  if (!elements.completeDiscussions.disabled) elements.completeDiscussions.textContent = text.completeDiscussionsButton;
  if (!elements.completePlugins.disabled) elements.completePlugins.textContent = text.completePluginsButton;
  if (!elements.completeLabs.disabled) elements.completeLabs.textContent = text.completeLabsButton;
  if (!elements.completeLti.disabled) elements.completeLti.textContent = text.completeLtiButton;
  if (!elements.checkGraded.disabled) elements.checkGraded.textContent = text.checkGradedButton;

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
  renderAccount();
  renderOverview();
}

// save the settings
async function saveSettings() {
  await chrome.storage.local.set(settings);
}

// read the settings and build the two dropdowns when the popup opens
async function initialize() {
  const stored = await chrome.storage.local.get(["autoCopy", "language", "theme", "requestMode", "discussionReply"]);
  settings = {
    autoCopy: stored.autoCopy === true,
    language: STRINGS[stored.language] ? stored.language : "en",
    theme: ["system", "light", "dark"].includes(stored.theme) ? stored.theme : "system",
    requestMode: stored.requestMode === "instant" ? "instant" : "sequential",
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

  buildPicker(elements.requestModePicker, requestModeOptions,
    () => settings.requestMode,
    async (value) => {
      settings.requestMode = value;
      await saveSettings();
      pickers.forEach((picker) => picker.refresh());
    });

  applyTheme();
  await applyLanguage();
  loadAccount();
  loadOverview();
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

// the two letters the avatar falls back to when Coursera has no photo for this account
function accountInitials(value) {
  const words = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const first = Array.from(words[0])[0] || "";
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] || "" : "";
  return (first + last).toUpperCase();
}

// the initials, or the person glyph when there are none
function showAccountFallback(initials) {
  elements.accountFallback.textContent = initials;
  if (!initials && accountGlyph) elements.accountFallback.append(accountGlyph);
}

// draw the account card. The page values are written as text and the photo only as an https
// source, so a page that lies about its own account gains nothing here
function renderAccount() {
  if (accountView.kind === "idle") {
    elements.account.hidden = true;
    return;
  }
  const text = strings();
  elements.account.hidden = false;
  elements.accountName.classList.toggle("missing", accountView.kind !== "account");
  elements.accountPhoto.hidden = true;
  elements.accountPhoto.removeAttribute("src");
  elements.accountEmail.hidden = true;
  elements.accountEmail.textContent = "";
  elements.accountEmail.title = "";

  if (accountView.kind !== "account") {
    elements.accountName.textContent = accountView.kind === "unknown" ? text.accountUnknown : text.accountOffPage;
    showAccountFallback("");
    return;
  }

  const account = accountView.account;
  elements.accountName.textContent = account.name || text.accountFallbackName;
  if (account.email) {
    elements.accountEmail.textContent = account.email;
    elements.accountEmail.title = account.email;
    elements.accountEmail.hidden = false;
  }
  showAccountFallback(accountInitials(account.name || account.email));
  if (account.photo) {
    elements.accountPhoto.onload = () => { elements.accountPhoto.hidden = false; };
    elements.accountPhoto.onerror = () => { elements.accountPhoto.hidden = true; };
    elements.accountPhoto.src = account.photo;
  }
}

// ask the page for the account it is signed in as. Nothing is stored: the answer lives only in
// this popup, and a tab without the content script only gets a hint to open a course page
async function loadAccount() {
  try {
    const answer = await sendToActiveTab({ action: "accountInfo" });
    const name = answer && typeof answer.name === "string" ? answer.name.slice(0, 80) : "";
    const email = answer && typeof answer.email === "string" ? answer.email.slice(0, 120) : "";
    const photo = answer && /^https:\/\//i.test(String(answer.photo || "")) ? String(answer.photo).slice(0, 500) : "";
    accountView = name || email || photo
      ? { kind: "account", account: { name, email, photo } }
      : { kind: "unknown" };
  } catch {
    accountView = { kind: "offpage" };
  }
  renderAccount();
}

// draw the card. On the home page it is the mean progress of the courses in progress; inside
// a course it is that course's name, its completed item count and a count per item type. Every
// value is clamped here again, and everything is written as text, never as markup
function renderOverview() {
  if (overviewView.kind !== "ok" && overviewView.kind !== "course") {
    elements.overview.hidden = true;
    return;
  }
  const text = strings();
  const course = overviewView.kind === "course";
  elements.overview.hidden = false;
  elements.overviewPercent.textContent = `${overviewView.percent}%`;
  elements.overviewFill.style.width = `${overviewView.percent}%`;
  elements.overviewBar.setAttribute("aria-valuenow", String(overviewView.percent));
  elements.overviewTitle.textContent = course ? text.courseProgressTitle : text.overviewTitle;
  elements.overviewBar.setAttribute("aria-label", elements.overviewTitle.textContent);
  elements.overviewName.hidden = !course || !overviewView.name;
  elements.overviewName.textContent = course ? overviewView.name : "";
  elements.overviewName.title = course ? overviewView.name : "";
  elements.overviewTypes.hidden = !course;
  elements.overviewTypes.replaceChildren();
  if (course) {
    elements.overviewCaption.textContent = text.courseCaption({ done: overviewView.done, total: overviewView.total });
    overviewView.types.forEach((type) => {
      const chip = document.createElement("span");
      chip.className = "type-chip";
      chip.textContent = `${type.label} ${type.count}`;
      elements.overviewTypes.append(chip);
    });
  } else {
    elements.overviewCaption.textContent = text.overviewCaption({ count: overviewView.count });
  }
}

// read one overview answer into the shape renderOverview draws. A course answer is kept only
// when it carries a total and at least one type row; labels are page text, so they are cut
// down and written as text, never parsed
function readOverviewAnswer(answer) {
  if (!answer || typeof answer !== "object") return { kind: "none" };
  const percent = Number.isFinite(answer.percent)
    ? Math.max(0, Math.min(100, Math.round(answer.percent)))
    : 0;
  if (answer.kind === "course") {
    const total = Number.isFinite(answer.total)
      ? Math.max(0, Math.min(10000, Math.round(answer.total)))
      : 0;
    const done = Number.isFinite(answer.done)
      ? Math.max(0, Math.min(total, Math.round(answer.done)))
      : 0;
    const name = typeof answer.name === "string" ? answer.name.slice(0, 120) : "";
    const types = [];
    if (Array.isArray(answer.types)) {
      answer.types.slice(0, COURSE_TYPE_LIMIT).forEach((type) => {
        if (!type || typeof type.label !== "string") return;
        const label = type.label
          .replace(/[\u0000-\u001F\u007F]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 40);
        if (!label || !Number.isFinite(type.count) || type.count <= 0) return;
        types.push({ label, count: Math.min(10000, Math.round(type.count)) });
      });
    }
    return total > 0 ? { kind: "course", percent, done, total, name, types } : { kind: "none" };
  }
  const count = Number.isFinite(answer.count)
    ? Math.max(0, Math.min(500, Math.round(answer.count)))
    : 0;
  return answer.kind === "ok" && count > 0 ? { kind: "ok", percent, count } : { kind: "none" };
}

// ask the page for the progress list. A page without it, or a tab without the content
// script, leaves the card hidden instead of showing a number that would be made up
async function loadOverview() {
  try {
    overviewView = readOverviewAnswer(await sendToActiveTab({ action: "overviewInfo" }));
  } catch {
    overviewView = { kind: "none" };
  }
  renderOverview();
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
    releaseActionButton(elements.completeVideos, strings().completeVideosButton);
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
    releaseActionButton(elements.completeReadings, strings().completeReadingsButton);
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
    releaseActionButton(elements.completeDiscussions, strings().completeDiscussionsButton);
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
    releaseActionButton(elements.completePlugins, strings().completePluginsButton);
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
    if (response.phase === "running" && response.code !== "busy") {
      followPluginRun();
      return;
    }
  } catch {
    setStatus("pluginNotCourse", 0, "error");
  }
  elements.completePlugins.disabled = false;
  elements.completePlugins.textContent = strings().completePluginsButton;
}

// translate the state the content script reports for the lab button
function showLabState(state) {
  const params = {
    done: state.done || 0,
    total: state.total || 0,
    completed: state.completed || 0,
    unverified: state.unverified || 0,
    failed: state.failed || 0,
    skipped: state.skipped || 0,
    already: state.already || 0
  };
  if (state.code === "starting") setStatus("labStarting");
  else if (state.code === "running") setStatus("labRunning", params);
  else if (state.code === "done") setStatus("labDone", params);
  else if (state.code === "partial") setStatus("labPartial", params, "warn");
  else if (state.code === "unverified") setStatus("labUnverified", params, "warn");
  else if (state.code === "busy") setStatus("labBusy", 0, "warn");
  else if (state.code === "none") setStatus("labNone", 0, "warn");
  else if (state.code === "notCourse") setStatus("labNotCourse", 0, "error");
  else if (state.code === "notLoggedIn") setStatus("labNotLoggedIn", 0, "error");
  else if (state.code === "identity") setStatus("labIdentity", 0, "error");
  else if (state.code === "stopped") setStatus("labStopped", 0, "warn");
  else setStatus("labFailed", 0, "error");
}

// follow the lab run while the popup stays open
async function followLabRun() {
  if (labPolling) return;
  labPolling = true;
  try {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const state = await sendToActiveTab({ action: "labStatus" }).catch(() => null);
      if (!state) break;
      showLabState(state);
      if (state.phase !== "running") break;
    }
  } finally {
    labPolling = false;
    releaseActionButton(elements.completeLabs, strings().completeLabsButton);
  }
}

// mark the labs done and watch their progress
async function startLabRun() {
  elements.completeLabs.disabled = true;
  elements.completeLabs.textContent = strings().completeLabsBusy;
  setStatus("labStarting");
  try {
    const response = await sendToActiveTab({ action: "completeLabs" });
    if (!response) throw new Error("no answer");
    showLabState(response);
    if (response.phase === "running" && response.code !== "busy") {
      followLabRun();
      return;
    }
  } catch {
    setStatus("labNotCourse", 0, "error");
  }
  elements.completeLabs.disabled = false;
  elements.completeLabs.textContent = strings().completeLabsButton;
}

// translate the state the content script reports for the ungraded lab button
function showLtiState(state) {
  const params = {
    done: state.done || 0,
    total: state.total || 0,
    completed: state.completed || 0,
    unverified: state.unverified || 0,
    failed: state.failed || 0,
    skipped: state.skipped || 0,
    already: state.already || 0
  };
  if (state.code === "starting") setStatus("ltiStarting");
  else if (state.code === "running") setStatus("ltiRunning", params);
  else if (state.code === "done") setStatus("ltiDone", params);
  else if (state.code === "partial") setStatus("ltiPartial", params, "warn");
  else if (state.code === "unverified") setStatus("ltiUnverified", params, "warn");
  else if (state.code === "busy") setStatus("ltiBusy", 0, "warn");
  else if (state.code === "none") setStatus("ltiNone", 0, "warn");
  else if (state.code === "notCourse") setStatus("ltiNotCourse", 0, "error");
  else if (state.code === "notLoggedIn") setStatus("ltiNotLoggedIn", 0, "error");
  else if (state.code === "identity") setStatus("ltiIdentity", 0, "error");
  else if (state.code === "stopped") setStatus("ltiStopped", 0, "warn");
  else setStatus("ltiFailed", 0, "error");
}

// follow the ungraded lab run while the popup stays open
async function followLtiRun() {
  if (ltiPolling) return;
  ltiPolling = true;
  try {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const state = await sendToActiveTab({ action: "ltiStatus" }).catch(() => null);
      if (!state) break;
      showLtiState(state);
      if (state.phase !== "running") break;
    }
  } finally {
    ltiPolling = false;
    releaseActionButton(elements.completeLti, strings().completeLtiButton);
  }
}

// mark the ungraded labs done and watch their progress
async function startLtiRun() {
  elements.completeLti.disabled = true;
  elements.completeLti.textContent = strings().completeLtiBusy;
  setStatus("ltiStarting");
  try {
    const response = await sendToActiveTab({ action: "completeLti" });
    if (!response) throw new Error("no answer");
    showLtiState(response);
    if (response.phase === "running" && response.code !== "busy") {
      followLtiRun();
      return;
    }
  } catch {
    setStatus("ltiNotCourse", 0, "error");
  }
  elements.completeLti.disabled = false;
  elements.completeLti.textContent = strings().completeLtiButton;
}

// translate the read-only graded app answer. Nothing was written, so there is no progress to
// follow and no run to poll
function showGradedState(state) {
  const params = {
    total: state.total || 0,
    completed: state.completed || 0
  };
  if (state.code === "starting") setStatus("gradedStarting");
  else if (state.code === "graded") setStatus("gradedDone", params);
  else if (state.code === "none") setStatus("gradedNone", 0, "warn");
  else if (state.code === "notCourse") setStatus("gradedNotCourse", 0, "error");
  else if (state.code === "notLoggedIn") setStatus("gradedNotLoggedIn", 0, "error");
  else if (state.code === "identity") setStatus("gradedIdentity", 0, "error");
  else setStatus("gradedFailed", 0, "error");
}

// the buttons that start a write. They are all disabled while the skip-all run owns the
// page, so two queues never write at the same time
const SKIP_ACTION_BUTTONS = ["completeVideos", "completeReadings", "completeDiscussions", "completePlugins", "completeLabs", "completeLti", "checkGraded"];

function setSkipActionsDisabled(disabled) {
  SKIP_ACTION_BUTTONS.forEach((name) => {
    elements[name].disabled = disabled;
  });
}

// translate the state the skip-all run reports
function showSkipAllState(state) {
  const params = {
    done: state.done || 0,
    total: state.total || 0,
    completed: state.completed || 0,
    already: state.already || 0,
    unverified: state.unverified || 0,
    failed: state.failed || 0,
    skipped: state.skipped || 0,
    answered: state.answered || 0,
    discussionLeft: state.discussionLeft || 0
  };
  if (state.code === "starting") setStatus("skipAllStarting");
  else if (state.code === "running") setStatus("skipAllRunning", params);
  else if (state.code === "done") setStatus("skipAllDone", params);
  else if (state.code === "partial") setStatus("skipAllPartial", params, "warn");
  else if (state.code === "unverified") setStatus("skipAllUnverified", params, "warn");
  else if (state.code === "busy") setStatus("skipAllBusy", 0, "warn");
  else if (state.code === "none") setStatus("skipAllNone", 0, "warn");
  else if (state.code === "notCourse") setStatus("skipAllNotCourse", 0, "error");
  else if (state.code === "notLoggedIn") setStatus("skipAllNotLoggedIn", 0, "error");
  else if (state.code === "identity") setStatus("skipAllIdentity", 0, "error");
  else if (state.code === "stopped") setStatus("skipAllStopped", 0, "warn");
  else setStatus("skipAllFailed", 0, "error");
}

// follow the skip-all run while the popup stays open
async function followSkipAllRun() {
  if (skipAllPolling) return;
  skipAllPolling = true;
  try {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const state = await sendToActiveTab({ action: "skipAllStatus" }).catch(() => null);
      if (!state) break;
      showSkipAllState(state);
      if (state.phase !== "running") break;
    }
  } finally {
    skipAllPolling = false;
    elements.skipEverything.disabled = false;
    elements.skipEverything.textContent = strings().skipAllButton;
    setSkipActionsDisabled(false);
  }
}

// skip every item that can be skipped, then watch the run
async function startSkipAllRun() {
  if (skipAllPolling) return;
  elements.skipEverything.disabled = true;
  elements.skipEverything.textContent = strings().skipAllBusy;
  setSkipActionsDisabled(true);
  setStatus("skipAllStarting");
  try {
    const response = await sendToActiveTab({ action: "skipEverything" });
    if (!response) throw new Error("no answer");
    showSkipAllState(response);
    if (response.phase === "running") {
      followSkipAllRun();
      return;
    }
  } catch {
    setStatus("skipAllNotCourse", 0, "error");
  }
  elements.skipEverything.disabled = false;
  elements.skipEverything.textContent = strings().skipAllButton;
  setSkipActionsDisabled(false);
}

// look at the graded app items without touching them
async function startGradedCheck() {
  elements.checkGraded.disabled = true;
  elements.checkGraded.textContent = strings().checkGradedBusy;
  setStatus("gradedStarting");
  try {
    const response = await sendToActiveTab({ action: "checkGraded" });
    if (!response) throw new Error("no answer");
    showGradedState(response);
  } catch {
    setStatus("gradedNotCourse", 0, "error");
  }
  elements.checkGraded.disabled = false;
  elements.checkGraded.textContent = strings().checkGradedButton;
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

elements.skipEverything.addEventListener("click", () => {
  startSkipAllRun();
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

elements.completeLabs.addEventListener("click", () => {
  startLabRun();
});

elements.completeLti.addEventListener("click", () => {
  startLtiRun();
});

elements.checkGraded.addEventListener("click", () => {
  startGradedCheck();
});

// the reply box is saved as it is typed, the page reads it back when a run starts
elements.discussionReply.addEventListener("input", async () => {
  settings.discussionReply = elements.discussionReply.value;
  await saveSettings();
});

initialize();
