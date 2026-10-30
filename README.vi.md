<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="Biểu tượng Coursera Questions Copy" />
  <h1>Coursera Questions Copy</h1>
  <p>Tiện ích mở rộng trình duyệt giúp trích xuất câu hỏi từ các bài kiểm tra và bài tập trên Coursera, sau đó sao chép vào bảng nhớ tạm dưới dạng JSON có cấu trúc để ghi chú và ôn tập. Tiện ích cũng có thể đánh dấu đã hoàn thành video, bài đọc, thảo luận và bài thực hành của khoá học thông qua API của chính Coursera.</p>

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
- **Công thức và hình ảnh:** Công thức được sao chép dưới dạng mã LaTeX nằm giữa hai dấu `$`, còn hình ảnh được sao chép dưới dạng liên kết markdown trỏ tới tệp gốc, nên những câu hỏi chứa phương trình hoặc hình minh họa không bị mất nội dung. Đường link giữ nguyên địa chỉ, và bảng được sao chép theo từng hàng.
- **Code và câu trả lời đã gõ:** Phần code mà câu hỏi đưa sẵn được sao chép thành một khối có đánh dấu ngôn ngữ và giữ nguyên thụt lề, nên một khung code để làm bài vẫn dùng được sau khi dán. Code hiển thị bên trong câu hỏi được chép cùng câu hỏi, và những gì bạn đã gõ vào ô trả lời cũng được lấy theo.
- **Tương thích với nhiều LLM:** Giúp bạn dễ dàng dán nội dung đã trích xuất vào các mô hình ngôn ngữ lớn hoặc công cụ ghi chú mà không cần sử dụng ảnh chụp màn hình.
- **Hỗ trợ song ngữ:** Hỗ trợ tiếng Anh và tiếng Việt trên giao diện popup lẫn các thông báo trực tiếp trên trang.
- **Tùy chỉnh giao diện:** Tự động theo giao diện hệ thống hoặc cho phép lựa chọn thủ công chế độ Sáng/Tối.
- **Hoàn thành video bài giảng:** Đánh dấu các video bài giảng của khoá học đang mở là đã hoàn thành. Tiện ích gửi đúng các sự kiện phát video mà trình phát của trang tự gửi, từng video một, kiểm tra câu trả lời của Coursera trước khi tính là hoàn thành, ghi thêm một bản hoàn thành trực tiếp cho video chưa bám, và bỏ qua video mà khoá học đang khoá.
- **Hoàn thành bài đọc:** Đánh dấu các bài đọc của khoá học đang mở là đã hoàn thành. Tiện ích tạo đúng bản ghi hoàn thành mà trang tạo khi bạn mở một bài đọc, từng bài một, tách riêng bài đã xác minh được với bài chỉ mới ghi, và bỏ qua bài đọc đang bị khoá.
- **Trả lời thảo luận:** Đăng một nội dung trả lời vào các thảo luận của khoá học đang mở. Tiện ích lấy câu hỏi đứng sau từng thảo luận, đăng từng câu một, đọc lại câu trả lời trước khi tính là hoàn thành, bỏ qua thảo luận bạn đã trả lời để một lần chạy sau không đăng trùng, và bỏ qua thảo luận đang bị khoá. Nội dung đăng là của bạn và có thể sửa ngay trong popup.
- **Hoàn thành bài thực hành:** Đánh dấu các lab chưa cho điểm, widget, notebook và mục ứng dụng của khoá học đang mở là đã xong. Mỗi loại bài nhận đúng bản ghi mà trang web ghi cho loại đó, từng bài một, và bản ghi được đọc lại trước khi bài được tính là hoàn thành. Mục ứng dụng là một lab bên ngoài mà Coursera mở bằng một yêu cầu khởi động, và yêu cầu đó là thao tác ghi duy nhất của loại bài này, nên tiện ích chỉ hỏi Coursera rồi dừng lại: công cụ bên ngoài không được mở, và không có thông tin nào được gửi cho nhà cung cấp công cụ. Bài mà Coursera đã báo là xong sẽ được giữ nguyên, nên một lần chạy sau không ghi gì thêm, còn bài đang bị khoá thì không bị mở ra.
- **Bài kiểm tra dạng widget:** Một số bài kiểm tra chỉ hiện câu hỏi trên trang, còn các phương án được vẽ trong một khung nhỏ mà Coursera tải từ máy chủ nội dung riêng. Trang vì vậy không chứa phương án nào. Tiện ích hỏi chính khung đó lấy các phương án nó đã vẽ, giữ đúng thứ tự hiển thị, và lấy kiểu câu hỏi từ các ô chọn bên trong. Câu hỏi nào không nhận được trả lời sẽ giữ nguyên dạng không có phương án kèm một trường `note` nói rõ, thay vì đoán.
- **Không dùng máy chủ bên thứ ba:** Không có gì được gửi ra ngoài Coursera. Phần sao chép câu hỏi hoạt động trong trang, còn phần hoàn thành video, bài đọc, thảo luận và bài thực hành gọi API của chính Coursera bằng phiên đăng nhập của bạn, lấy user id và token có sẵn trong trang. Địa chỉ duy nhất ngoài coursera.org mà tiện ích được nạp vào là `d10o6em2qtnr4q.cloudfront.net`, máy chủ mà chính Coursera dùng để tải khung widget của bài kiểm tra; ở đó tiện ích chỉ đọc các phương án mà khung đã vẽ trên màn hình của bạn và không gửi gì tới khung, đó là lý do Chrome liệt kê thêm máy chủ này khi bạn cài tiện ích.

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
| **Complete readings** | Đánh dấu các bài đọc của khoá học trong tab hiện tại là đã hoàn thành. |
| **Complete discussions** | Đăng nội dung trả lời của bạn vào các thảo luận của khoá học trong tab hiện tại. |
| **Complete practice items** | Đánh dấu các lab chưa cho điểm, widget, notebook và mục ứng dụng của khoá học trong tab hiện tại là đã xong. |
| **Discussion reply** | Đúng đoạn văn sẽ được đăng. Viết lại theo ý bạn, hoặc xoá trắng thì không có gì được đăng. |

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
- `numeric_input`
- `code_expression`
- `file_upload`
- `widget`
- `off_platform`

Loại câu hỏi lấy từ tên thành phần câu hỏi mà chính Coursera gắn lên trang, nên một câu hỏi nhập số có kèm đoạn code trong đề vẫn là `numeric_input`. Chỉ khi trang không có tên thành phần thì loại mới được suy ra từ ô trả lời.

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

Câu hỏi code mang thêm trường của riêng khung trả lời, kèm ngôn ngữ mà trình soạn khai báo và phần thụt lề nó hiển thị:

```json
[
  {
    "questionNumber": 1,
    "type": "code_expression",
    "question": "The function and two of the derivatives are defined for you. Set up the other two by replacing the question marks in the following code.",
    "options": [],
    "language": "python",
    "code": "# First we define the functions,\ndef f (x, y) :\n    return np.exp(-(2*x*x + y*y - x*y) / 2)\n\ndef g (x, y) :\n    return x*x + 3*(y+1)**2 - 1\n\ndef dgdx (x, y) :\n    return ???"
  }
]
```

`code` là phần code trong ô trả lời của câu hỏi đó. Khi khung code cao hơn nội dung nó hiển thị, phần đọc được chỉ là phần đang hiện ra, và câu hỏi khi ấy có thêm `"codeWindow": true` để báo rằng code chỉ là một cửa sổ chứ không phải toàn bộ tệp. Trường `answer` chứa những gì bạn đã gõ vào ô trả lời dạng text, số hoặc bài viết, và được bỏ ra khi ô còn trống. Trường `note` cũng được bỏ ra, trừ khi có phần nào của câu hỏi không đọc được, khi đó nó nói rõ đang thiếu gì trong một dòng. Câu hỏi có phương án do widget của khoá học vẽ sẽ mang kiểu mà khung đó trả lời, thường là `single_answer`; nó chỉ ở dạng `widget` không có phương án khi khung đó không trả lời, và trường note là thứ cho biết điều đó.

Địa chỉ ảnh thuộc hệ thống phân phối nội dung của Coursera và chỉ được phục vụ cho phiên đăng nhập, nên việc mở liên kết đã sao chép cần trình duyệt đang đăng nhập vào khóa học.

Dữ liệu đầu ra có thể được dán vào các giao diện LLM tương thích, trình soạn thảo văn bản hoặc ứng dụng ghi chú để phục vụ việc học tập và ôn tập.

---

## Cấu trúc thư mục

```text
icons/             Các tệp biểu tượng tiện ích
pics/              Hình ảnh xem trước giao diện
manifest.json      Tệp cấu hình tiện ích (MV3)
content.js         Phân tích DOM, cầu nối khung widget, xử lý clipboard và thông báo
video.js           Module hoàn thành video bài giảng
readings.js        Module hoàn thành bài đọc
discussions.js     Module trả lời thảo luận
plugins.js         Module hoàn thành bài thực hành
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

Tính năng hoàn thành video bài giảng, bài đọc và bài thực hành đánh dấu nội dung là đã xong mà không cần xem video, mở bài đọc hay làm lab. Phần trả lời thảo luận đăng cùng một câu vào mọi thảo luận còn mở, nên đó là một đoạn lặp lại chứ không phải câu trả lời cho từng câu hỏi. Tất cả đều là cách tự động hoá việc làm bài trong khoá học và không đáp ứng được Quy tắc Danh dự Coursera, vì vậy chỉ dùng khi nơi đó cho phép. Những nội dung mà khoá học còn khoá sẽ được bỏ qua, nên một lần chạy chỉ chạm tới những bài bạn đã mở được. Một lần chạy cũng từ chối bắt đầu khi trang chỉ tài khoản khác với tài khoản mà Coursera ghi nhận, và hàng đợi đang chạy sẽ tự dừng khi tab chuyển sang khoá học khác hoặc khi một tài khoản khác tiếp quản. Bài có chấm điểm, AI coach và bất cứ gì khoá học coi là bài thi đều không bị chạm tới. Một số trang quiz còn có những khung ẩn giấu viết cho một trợ lý tự động chứ không viết cho bạn, kèm một nút yêu cầu trợ lý đó xác nhận một quy định: chữ trong những khung ấy không bao giờ được đưa vào bản sao và nút kia không bao giờ được bấm, vì một khung trên trang là nội dung chứ không phải lệnh dành cho công cụ. Với mục ứng dụng, tiện ích chỉ hỏi Coursera đánh dấu bài đã xong, không mở công cụ bên ngoài, và không tick ô đồng ý hay ô Quy tắc Danh dự trên trang của bài đó, vì ô ấy là sự đồng ý của chính bạn để giao tên và email cho nhà cung cấp công cụ. Dự án này nhằm mục đích học tập và nghiên cứu, không ủng hộ việc gian lận, và không đi kèm hỗ trợ: nếu một lần chạy không khởi động được hoặc để lại trang khoá học ở trạng thái lỗi thì bạn tự xử lý.

---

## Giấy phép

Dự án được phát hành theo [Giấy phép MIT](LICENSE).
