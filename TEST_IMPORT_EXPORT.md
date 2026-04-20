# 🧪 Test Import/Export - Lợn thịt

## ✅ Checklist Test

### 1. Test tải mẫu template
- [ ] Vào http://localhost:5173/vietgap/chan-nuoi
- [ ] Nhấn nút "Import"
- [ ] Chọn "Lợn thịt" từ dropdown
- [ ] Nhấn "Tải mẫu import cho loại sổ đã chọn"
- [ ] File Excel được tải về (không có lỗi)
- [ ] Mở file Excel
- [ ] Kiểm tra các sheet:
  - [ ] Sheet "Hướng dẫn" có nội dung
  - [ ] Sheet "Thông tin chung" có 15 trường
  - [ ] Sheet "Biểu 1- Mua-chuyển lợn giống" (không có `:` và `/`)
  - [ ] Sheet "Biểu 2- Nhập thức ăn-nguyên..." (tên đã sanitize)
  - [ ] Tất cả 13 biểu có đầy đủ

### 2. Test tạo nhật ký mới
- [ ] Nhấn "Tạo sổ nhật ký"
- [ ] Chọn "Lợn thịt"
- [ ] Nhấn "Tiếp tục"
- [ ] Điền thông tin:
  - Họ tên: Trần Văn Cường
  - Thôn: Thôn 4
  - Xã: Hòa Hải
  - Huyện: Hương Khê
  - Tỉnh: Hà Tĩnh
  - Ngày nhập: 17/02/2025
  - Giống: Lợn thịt siêu nạc
  - Số lượng: 500
  - Mã lô: 17.02.25
  - Trọng lượng: 1.2
  - Mật độ: 0.67
  - Diện tích chuồng: 2000
  - Diện tích toàn bộ: 3.8
- [ ] Nhấn "Lưu"
- [ ] Nhật ký xuất hiện trong danh sách

### 3. Test export 1 nhật ký
- [ ] Chuyển sang xem bảng
- [ ] Tìm nhật ký vừa tạo
- [ ] Nhấn nút Download (màu xanh dương)
- [ ] File Excel được tải về
- [ ] Mở file Excel
- [ ] Kiểm tra:
  - [ ] Sheet "Thông tin chung" có metadata
  - [ ] Sheet "Thông tin chung" có dữ liệu đã nhập
  - [ ] Các sheet khác có cấu trúc đúng
  - [ ] Không có lỗi mở file

### 4. Test import từ template
- [ ] Mở file template đã tải ở bước 1
- [ ] Điền dữ liệu vào sheet "Thông tin chung":
  - Họ tên: Nguyễn Văn A
  - Thôn: Thôn 1
  - Xã: Xã B
  - Huyện: Huyện C
  - Tỉnh: Tỉnh D
  - Ngày nhập: 01/03/2025
  - Giống: Lợn Yorkshire
  - Số lượng: 100
  - Mã lô: 01.03.25
  - Trọng lượng: 2.5
  - Mật độ: 0.5
  - Diện tích chuồng: 500
  - Diện tích toàn bộ: 1.5
- [ ] Lưu file Excel
- [ ] Quay lại modal Import
- [ ] Upload file vừa điền
- [ ] Nhấn "Import"
- [ ] Thấy thông báo "Import thành công"
- [ ] Trang reload
- [ ] Nhật ký mới xuất hiện
- [ ] Vào nhật ký, kiểm tra dữ liệu đúng

### 5. Test export nhiều nhật ký
- [ ] Chuyển sang xem bảng
- [ ] Chọn checkbox ở 2-3 nhật ký
- [ ] Toolbar hiện "Đã chọn: X"
- [ ] Nhấn "Xuất X nhật ký"
- [ ] File Excel được tải về
- [ ] Mở file Excel
- [ ] Kiểm tra:
  - [ ] Sheet "Tổng quan" có danh sách nhật ký
  - [ ] Các sheet khác có dữ liệu từng nhật ký
  - [ ] Tên sheet có format: "1-Biểu 1- Mua-chuyển..."

### 6. Test validation
- [ ] Tạo nhật ký mới
- [ ] Thử nhập số lượng: -10 → Thấy lỗi
- [ ] Thử nhập trọng lượng: 200 → Thấy lỗi
- [ ] Thử nhập mật độ: 10 → Thấy lỗi
- [ ] Nhập giá trị hợp lệ → Lưu thành công

## 📊 Kết quả mong đợi

### Tên sheet sau khi sanitize:

| Tên bảng gốc | Tên sheet trong Excel |
|--------------|----------------------|
| Thông tin chung | Thông tin chung |
| Biểu 1: Mua/chuyển lợn giống | Biểu 1- Mua-chuyển lợn giống |
| Biểu 2: Nhập thức ăn/nguyên liệu thô | Biểu 2- Nhập thức ăn-nguyê... |
| Biểu 3: Phối trộn thức ăn | Biểu 3- Phối trộn thức ăn |
| Biểu 4: Nhập thuốc thú y, vaccin | Biểu 4- Nhập thuốc thú y, v... |
| Biểu 5: Phân phối thức ăn | Biểu 5- Phân phối thức ăn |
| Biểu 6: Sử dụng vaccin/thuốc điều trị | Biểu 6- Sử dụng vaccin-thu... |
| Biểu 7: Sát trùng | Biểu 7- Sát trùng |
| Biểu 8: Xử lý vật nuôi chết | Biểu 8- Xử lý vật nuôi chết |
| Biểu 9: Thu gom rác thải | Biểu 9- Thu gom rác thải |
| Biểu 10: Diệt chuột và động vật gây hại | Biểu 10- Diệt chuột và động... |
| Biểu 11: Lấy mẫu xét nghiệm | Biểu 11- Lấy mẫu xét nghiệm |
| Biểu 12: Tiêu thụ, xuất bán | Biểu 12- Tiêu thụ, xuất bán |

## 🐛 Lỗi có thể gặp

### "Sheet name cannot contain..."
- ✅ ĐÃ FIX - Không còn lỗi này

### "Không tìm thấy sheet"
- Kiểm tra tên sheet trong file Excel
- Đảm bảo không sửa tên sheet
- Tên sheet phải khớp với tên đã sanitize

### "Invalid date format"
- Dùng format: DD/MM/YYYY hoặc YYYY-MM-DD
- Ví dụ: 17/02/2025 hoặc 2025-02-17

### "Validation error"
- Kiểm tra giá trị nhập vào
- Đảm bảo trong khoảng cho phép
- Xem validation rules trong schema

## ✅ Khi tất cả test pass

Chức năng Import/Export đã hoạt động hoàn hảo! 🎉

Bạn có thể:
- Import nhật ký Lợn thịt từ Excel
- Export nhật ký ra Excel
- Chia sẻ file Excel với người khác
- Backup dữ liệu

---

**Ngày test**: 21/04/2026  
**Status**: ⏳ READY TO TEST
