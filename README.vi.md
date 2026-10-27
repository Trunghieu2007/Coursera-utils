<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="Biểu tượng Coursera Questions Copy" />
  <h1>Coursera Questions Copy</h1>
  <p>Tiện ích mở rộng trình duyệt giúp trích xuất câu hỏi từ các trang bài tập, trắc nghiệm trên Coursera và sao chép vào bảng nhớ tạm dưới dạng JSON có cấu trúc để ghi chú và ôn tập.</p>

  <p>
    <a href="README.md"><b>English</b></a> | <a href="README.vi.md"><b>Tiếng Việt</b></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Manifest-V3-1f2937?style=flat-square" alt="Manifest V3" />
    <img src="https://img.shields.io/badge/Storage-Ch%E1%BB%89%20l%C6%B0u%20c%E1%BB%A5c%20b%E1%BB%99-1f2937?style=flat-square" alt="Lưu trữ nội bộ" />
    <img src="https://img.shields.io/badge/Gi%E1%BA%A5y%20ph%C3%A9p-MIT-1f2937?style=flat-square" alt="Giấy phép MIT" />
  </p>
</div>

---

## Giao diện

<div align="center">
  <table>
    <tr>
      <td align="center">
        <b>Chế độ Sáng</b><br/><br/>
        <img src="pics/Lightmode.png" alt="Chế độ Sáng" width="280" />
      </td>
      <td align="center">
        <b>Chế độ Tối</b><br/><br/>
        <img src="pics/Darkmode.png" alt="Chế độ Tối" width="280" />
      </td>
    </tr>
  </table>
</div>

---

## Tính năng

- **Tự động sao chép:** Tự động sao chép câu hỏi vào bảng nhớ tạm ngay khi trang bài tập tải xong.
- **Sao chép thủ công:** Sao chép chủ động thông qua nút bấm trong giao diện popup.
- **Định dạng JSON:** Chuẩn hóa câu hỏi, phương án trả lời và phân loại câu hỏi thành chuỗi JSON rõ ràng.
- **Hỗ trợ song ngữ:** Hỗ trợ tiếng Anh và tiếng Việt cho giao diện popup lẫn thông báo trên trang.
- **Tùy biến giao diện:** Theo hệ thống hoặc chọn thủ công chế độ Sáng/Tối.
- **Xử lý nội bộ:** Toàn bộ tác vụ chạy cục bộ trong trình duyệt, không gửi yêu cầu qua mạng ra bên ngoài.

---

## Cài đặt

1. Tải về hoặc clone kho mã nguồn này.
2. Mở trình duyệt Chrome hoặc các trình duyệt nhân Chromium và truy cập `chrome://extensions/`.
3. Bật **Chế độ dành cho nhà phát triển** (Developer mode) ở góc trên bên phải.
4. Bấm **Tải tiện ích đã giải nén** (Load unpacked) và chọn thư mục tiện ích.
5. Truy cập trang bài tập bất kỳ trên Coursera (`https://www.coursera.org/learn/...`).

---

## Thiết lập

Bấm vào biểu tượng tiện ích trên thanh công cụ để mở menu cài đặt:

| Thiết lập | Mô tả |
| :--- | :--- |
| **Auto copy** | Tự động sao chép câu hỏi khi mở trang bài tập. |
| **Language** | Chuyển đổi ngôn ngữ hiển thị và thông báo giữa tiếng Anh và tiếng Việt. |
| **Theme** | Lựa chọn giao diện Theo hệ thống, Sáng hoặc Tối. |
| **Copy this page** | Thực hiện sao chép câu hỏi trên tab hiện tại. |

---

## Cấu trúc dữ liệu JSON

Dữ liệu sao chép vào bảng nhớ tạm có định dạng như sau:

```json
[
  {
    "questionNumber": 1,
    "type": "single_answer",
    "question": "A type of artificial intelligence that outperforms humans in some defined task is known as",
    "options": [
      "AEI",
      "Special AI",
      "General AI",
      "Narrow AI"
    ]
  }
]
```

Các dạng câu hỏi được phân loại:
- `single_answer`
- `multiple_answer`
- `essay`
- `text_input`
- `code_expression`

---

## Cấu trúc thư mục

```text
icons/             Tập tin biểu tượng tiện ích
pics/              Hình ảnh giao diện
manifest.json      Tập tin cấu hình tiện ích (MV3)
content.js         Trích xuất DOM, xử lý clipboard và hiển thị thông báo
popup.html         Cấu trúc giao diện popup
popup.css          Định dạng giao diện popup
popup.js           Xử lý sự kiện popup và lưu trữ cấu hình
README.md          Tài liệu tiếng Anh
README.vi.md       Tài liệu tiếng Việt
```

---

## Giấy phép

Phát hành theo giấy phép [MIT](LICENSE).
