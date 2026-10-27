# Coursera Copy Questions

Extension Chrome nhỏ, tách phần sao chép nội dung từ "Coursera Auto Solver" (https://github.com/Youssef-Ghafir/coursera-assignment-solver) thành một công cụ độc lập: lấy phần chữ của các câu hỏi đang hiển thị trên trang bài tập Coursera và đưa vào bảng nhớ tạm, để bạn dán vào ghi chú và tự luyện lại.

Toàn bộ xử lý chạy trong máy bạn. Extension không gọi API nào, không gửi nội dung đi đâu, không lưu gì ngoài 3 lựa chọn trong `chrome.storage.local`.

## Cài đặt

1. Mở `chrome://extensions/`, bật Developer mode.
2. Bấm Load unpacked và chọn thư mục repo.
3. Vào một trang bài tập trong `https://www.coursera.org/learn/...`.

## Dùng

Bấm icon extension để mở popup. Popup mặc định tiếng Anh, chọn Tiếng Việt trong dropdown Language (có cờ).

| Lựa chọn | Ý nghĩa |
| --- | --- |
| Auto copy / Tự động sao chép | Mỗi lần mở trang bài tập, nội dung câu hỏi được sao chép ngay, kèm thông báo trên trang. Mỗi URL chỉ sao chép một lần. Bật toggle trên trang đang mở cũng sao chép luôn, không cần reload. |
| Language | English hoặc Tiếng Việt. Lựa chọn này cũng đổi ngôn ngữ của thông báo trên trang. |
| Theme | Follow system (mặc định), Light hoặc Dark. Bảng màu là trắng đen đơn sắc. |
| Copy this page / Sao chép trang này | Sao chép thủ công trang đang mở. |

Nội dung bảng nhớ tạm luôn là JSON, không có lựa chọn format:

```json
[
  {
    "questionNumber": 1,
    "type": "single_answer",
    "question": "A type of artificial intelligence that outperforms humans in some defined task is known as",
    "options": ["AEI", "Special AI", "General AI", "Narrow AI"]
  }
]
```

`type` dùng đúng tên của source gốc: `single_answer`, `multiple_answer`, `essay`, `text_input`, `code_expression`, `unknown`.

## Cấu trúc

| File | Việc |
| --- | --- |
| `manifest.json` | MV3, chỉ xin `storage` + `clipboardWrite`, content script chỉ khớp `*.coursera.org/learn/*`. |
| `content.js` | Đọc DOM khối câu hỏi, dựng JSON, viết bảng nhớ tạm, thông báo trên trang, auto copy. |
| `popup.html` / `popup.js` / `popup.css` | GUI bo góc chữ nhật, dropdown ngôn ngữ có cờ SVG, dropdown theme, 1 nút sao chép. |
| `icons/` | 4 file PNG 16, 32, 48, 128 px cho toolbar và trang chi tiết extension. |
| `README.md` / `LICENSE` / `.gitignore` | Tài liệu này, MIT kèm ghi chú nguồn selector, và ignore file tạm. |

## so với extension gốc

Extension gốc có các phần mà bản này cố ý không có:

- AI solver: gửi câu hỏi tới Gemini/OpenAI/Claude... và tự tick đáp án vào bài.
- Complete Materials: gọi API Coursera để đánh dấu video và bài đọc đã hoàn thành.
- `intercept.js`: chặn fetch/XHR của Coursera để lấy CSRF token và user id.
- Course Requirements: gọi `onDemandCourseMaterials.v2` để lấy cấu trúc khóa học.
- Nhánh đọc Monaco editor, nên phần code khởi đầu của câu hỏi lập trình không được sao chép, chỉ có đề bài.

Nội dung sao chép cũng không chứa đáp án: trên trang bài tập thì đáp án đúng chưa hiển thị, nên kết quả chỉ là câu hỏi và các lựa chọn đang hiện trên màn hình.

## Giới hạn

- Chỉ đọc nội dung Coursera đã render trên trang. Trang chưa tải xong câu hỏi thì extension chờ tối đa 8 giây, không có câu hỏi thì nó bỏ qua.
- Coursera hay đổi class name và `data-testid`. Nếu một ngày không trích được câu nào, selectors trong `questionBlocks()` cần cập nhật theo DOM mới.
- Cờ trong dropdown là SVG vẽ đơn giản vì Windows không render flag emoji trong `<option>` của select thường.

## Credit

Mã nguồn gốc: [Youssef-Ghafir/coursera-assignment-solver](https://github.com/Youssef-Ghafir/coursera-assignment-solver). Repo đó không kèm file LICENSE, nên phần selector DOM Coursera kế thừa từ đó; toàn bộ code còn lại của repo này là tự viết, cấp theo MIT ở file `LICENSE`.
