# La studio – Bản 5 (nâng cấp từ bản 2: trẻ trung, sang, ảnh lớn)

Trang HTML độc lập: CSS và JS nằm trong `index.html`, ảnh nằm trong `img/`. Có chế độ sáng và tối theo máy người xem.

## Ảnh tổng quan
- `man-hinh-chinh-v5.jpg`: màn hình đầu, thẻ concept + thanh đặt lịch dưới đáy, đặt lịch 3 bước (máy tính và điện thoại)
- `tong-quan-v5-may-tinh-1.jpg`, `-2.jpg`: toàn trang trên máy tính 1440px
- `tong-quan-v5-dien-thoai.jpg`: toàn trang trên điện thoại 390px, chia 3 cột, đọc từ trái sang phải
(Ảnh toàn trang chụp tĩnh, đã ẩn thanh đặt lịch nổi ở đáy.)

## Xem nhanh
Mở `index.html` bằng trình duyệt, hoặc: `python3 -m http.server 8000` rồi mở http://localhost:8000

## Cấu trúc
```
index.html        trang đã build, chạy được ngay
img/              51 ảnh của studio (webp, đã nén)
src/
  data.py         nội dung: SĐT, Zalo, Facebook, Maps, 9 concept, 3 gói giá, danh sách ảnh
  build.py        khung HTML: hero ảnh ghép, dải chữ, thẻ concept, dải ảnh, polaroid, quiz, bảng giá, ảnh,
                  hỏi đáp, đặt lịch 3 bước, liên hệ, quản lý, thanh đặt lịch dưới đáy
  style.css       giao diện: biến màu ở :root (hồng, xanh denim, vàng bơ; có bộ màu tối), chữ Bricolage Grotesque + Be Vietnam Pro
  _head.js        chữ tiêu đề hiện dần, lọc thẻ concept + ảnh tự chuyển khi rê chuột, polaroid kéo thả/xáo, thư viện ảnh
  _core.js        tính tạm tính, kiểm tra form, tin nhắn Zalo, lưu và quản lý đặt lịch – dùng chung với các bản trước
  _tail.js        cửa sổ chi tiết concept, đặt lịch 3 bước, đồng bộ thanh đặt lịch, quiz, pháo giấy, hiệu ứng xuất hiện
  app.js          = _head.js + _core.js + _tail.js (file được nhúng vào trang)
```

## Sửa và build lại
Cần Python 3 + Pillow (`pip install pillow`).
```
cat src/_head.js src/_core.js src/_tail.js > src/app.js
python3 src/build.py
```
- Câu hỏi quiz và concept gợi ý: `QUIZ` trong `build.py`.
- Ảnh ghép đầu trang: các thẻ `.cl-1`, `.cl-2`, `.cl-3` trong `build.py`.

## Đặt lịch và quản lý
Bản đăng trên Claude lưu yêu cầu vào cơ sở dữ liệu của Claude. Khi chạy ngoài Claude, trang tự lưu trên trình duyệt
(localStorage) để xem thử. Với website thật, thay đoạn lưu trong `form.addEventListener("submit", …)` và hàm `initAdmin`
ở `_core.js` bằng API backend (database, thông báo Zalo OA/email, trang quản lý có đăng nhập).

## Nội dung mẫu cần studio xác nhận
Giá 699k / 1.199k / 1.899k, phụ thu 300k/người, cọc 30%, giờ mở cửa 8:00–20:00, trả ảnh 5–7 ngày,
câu hỏi quiz, tên và mô tả 9 concept, địa chỉ cụ thể, logo.
