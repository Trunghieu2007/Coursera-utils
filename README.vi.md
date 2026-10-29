<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="Biểu tượng Coursera Questions Copy" />
  <h1>Coursera Questions Copy</h1>
  <p>Tiện ích mở rộng trình duyệt giúp trích xuất câu hỏi từ các bài kiểm tra và bài tập trên Coursera, sau đó sao chép vào bảng nhớ tạm dưới dạng JSON có cấu trúc để ghi chú và ôn tập.</p>

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

## Giới thiệu

Tôi phát triển dự án này với mong muốn giúp việc xử lý nội dung câu hỏi trên Coursera trở nên thuận tiện và hiệu quả hơn, đặc biệt khi ghi chú và ôn tập kiến thức trong khóa học.

Thay vì phải chụp ảnh màn hình, tiện ích chuyển câu hỏi thành văn bản có cấu trúc, giúp bạn dễ dàng sao chép, tổ chức và sử dụng với nhiều mô hình ngôn ngữ lớn (LLM) khác nhau. Tùy thuộc vào mô hình và ngữ cảnh, đầu vào dạng văn bản cũng có thể tiết kiệm token hơn so với đầu vào bằng hình ảnh.

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

- **Tự động sao chép:** Tự động sao chép câu hỏi vào bảng nhớ tạm khi trang bài tập được hỗ trợ tải xong.
- **Sao chép thủ công:** Cho phép sao chép câu hỏi theo yêu cầu thông qua nút bấm trong giao diện popup.
- **Dữ liệu JSON có cấu trúc:** Chuẩn hóa câu hỏi, các phương án trả lời và loại câu hỏi thành dữ liệu JSON rõ ràng, dễ đọc.
- **Công thức và hình ảnh:** Công thức được sao chép dưới dạng mã LaTeX nằm giữa hai dấu `$`, còn hình ảnh được sao chép dưới dạng liên kết markdown trỏ tới tệp gốc, nên những câu hỏi chứa phương trình hoặc hình minh họa không bị mất nội dung.
- **Tương thích với nhiều LLM:** Giúp bạn dễ dàng dán nội dung đã trích xuất vào các mô hình ngôn ngữ lớn hoặc công cụ ghi chú mà không cần sử dụng ảnh chụp màn hình.
- **Hỗ trợ song ngữ:** Hỗ trợ tiếng Anh và tiếng Việt trên giao diện popup lẫn các thông báo trực tiếp trên trang.
- **Tùy chỉnh giao diện:** Tự động theo giao diện hệ thống hoặc cho phép lựa chọn thủ công chế độ Sáng/Tối.
- **Hoàn thành video bài giảng:** Đánh dấu các video bài giảng của khoá học đang mở là đã hoàn thành. Tiện ích đọc danh sách bài học, sau đó gửi đúng các sự kiện phát video mà trình phát của trang web tự gửi, từng video một, rồi kiểm tra lại câu trả lời của Coursera trước khi tính là hoàn thành.
- **Không dùng máy chủ bên thứ ba:** Không có gì được gửi ra ngoài Coursera. Phần sao chép câu hỏi hoạt động hoàn toàn trong trang, còn phần hoàn thành video gọi API của chính Coursera bằng phiên đăng nhập của bạn.

---

## Cài đặt

1. Tải về hoặc clone kho mã nguồn này.
2. Mở Chrome hoặc trình duyệt sử dụng nhân Chromium và truy cập `chrome://extensions/`.
3. Bật **Chế độ dành cho nhà phát triển** (Developer mode) ở góc trên bên phải.
4. Nhấn **Tải tiện ích đã giải nén** (Load unpacked) và chọn thư mục tiện ích.
5. Mở một trang bài tập được hỗ trợ trên Coursera.

---

## Thiết lập

Nhấn vào biểu tượng tiện ích trên thanh công cụ để truy cập các tùy chọn cấu hình.

| Thiết lập | Mô tả |
| :--- | :--- |
| **Auto copy** | Tự động sao chép câu hỏi khi trang bài học hoặc bài tập được hỗ trợ tải xong. |
| **Language** | Chuyển đổi ngôn ngữ giao diện và thông báo giữa tiếng Anh và tiếng Việt. |
| **Theme** | Lựa chọn giao diện Theo hệ thống, Sáng hoặc Tối. |
| **Copy this page** | Sao chép thủ công câu hỏi từ tab đang hoạt động. |
| **Complete lecture videos** | Đánh dấu các video bài giảng của khoá học trong tab hiện tại là đã hoàn thành. |

---

## Cấu trúc dữ liệu JSON

Các câu hỏi được sao chép vào bảng nhớ tạm theo định dạng sau:

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

Các dạng câu hỏi được nhận diện:

- `single_answer`
- `multiple_answer`
- `essay`
- `text_input`
- `code_expression`

Câu hỏi chứa công thức hoặc hình ảnh cũng được sao chép theo cùng cách, với mã công thức và địa chỉ ảnh được giữ nguyên tại vị trí xuất hiện:

```json
[
  {
    "questionNumber": 3,
    "type": "single_answer",
    "question": "Are the following vectors linearly independent?\n\n$\\mathbf{a} = \\begin{bmatrix} 1 \\\\ 0 \\\\ 1 \\end{bmatrix}$, $\\mathbf{b} = \\begin{bmatrix} 2 \\\\ -1 \\\\ 1 \\end{bmatrix}$\n\n![](https://d3c33hcgiwev3.cloudfront.net/imageassetproxy.v1/abc123_diagram.png)",
    "options": [
      "Yes",
      "No"
    ]
  }
]
```

Địa chỉ ảnh thuộc hệ thống phân phối nội dung của Coursera và chỉ được phục vụ cho phiên đăng nhập, nên việc mở liên kết đã sao chép cần trình duyệt đang đăng nhập vào khóa học.

Dữ liệu đầu ra có thể được dán vào các giao diện LLM tương thích, trình soạn thảo văn bản hoặc ứng dụng ghi chú để phục vụ việc học tập và ôn tập.

---

## Cấu trúc thư mục

```text
icons/             Các tệp biểu tượng tiện ích
pics/              Hình ảnh xem trước giao diện
manifest.json      Tệp cấu hình tiện ích (MV3)
content.js         Phân tích DOM, xử lý clipboard và thông báo
video.js           Module hoàn thành video bài giảng
popup.html         Cấu trúc giao diện popup
popup.css          Định dạng giao diện popup
popup.js           Xử lý logic popup và lưu cấu hình
README.md          Tài liệu tiếng Anh
README.vi.md       Tài liệu tiếng Việt
```

---

## Phát triển và đóng góp

Dự án được phát triển với sự hỗ trợ của AI theo phương pháp *vibe coding* và hiện vẫn đang được duy trì, cập nhật.

Tôi hướng đến việc giữ cho dự án luôn được cập nhật. Các tính năng và cải tiến mới có thể được bổ sung trong những phiên bản tương lai.

Nếu gặp lỗi hoặc có ý tưởng cải tiến, vui lòng tạo **Pull Request**, kèm theo thông tin liên quan để tôi có thể điều tra và tìm hướng xử lý.

Mọi đóng góp, đề xuất và phản hồi đều được hoan nghênh.

---

## Ghi chú

Tính năng hoàn thành video bài giảng đánh dấu video là đã hoàn thành mà không cần xem. Đây là cách tự động hoá việc làm bài trong khoá học và không đáp ứng được Quy tắc Danh dự Coursera, vì vậy chỉ dùng khi nơi đó cho phép. Dự án này nhằm mục đích học tập và nghiên cứu, không ủng hộ việc gian lận, và không đi kèm hỗ trợ: nếu một lần chạy không khởi động được hoặc để lại trang khoá học ở trạng thái lỗi thì bạn tự xử lý.

---

## Giấy phép

Dự án được phát hành theo [Giấy phép MIT](LICENSE).
