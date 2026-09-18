# Thiệp Mời Lễ Tốt Nghiệp 🎓

Website thiệp mời đếm ngược đến ngày tốt nghiệp — thuần HTML/CSS/JS, không cần build tool.

## Thông tin buổi lễ (chỉnh trong `index.html` / `script.js` nếu cần)

- **Thời gian:** 15:00, Thứ Bảy, 26/09/2026
- **Địa điểm:** Học viện Công nghệ Bưu chính Viễn thông (PTIT), Km10 Nguyễn Trãi, Hà Đông, Hà Nội

## Cách xem thử

Mở trực tiếp `index.html` bằng trình duyệt, hoặc chạy local server:

```bash
python3 -m http.server 8080
# rồi mở http://localhost:8080
```

## Tùy chỉnh

- `[Tên của bạn]` trong `index.html` → sửa thành tên thật của bạn.
- Đổi mốc thời gian đếm ngược trong `script.js` (`EVENT_DATE`).
- Đổi campus PTIT (nếu tổ chức ở cơ sở TP.HCM) → sửa địa chỉ trong phần `.details-list` và link Google Maps trong `index.html`.
