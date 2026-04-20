# ✅ TODO Checklist - Import/Export Feature

## 🔧 Cài đặt (BẮT BUỘC)

- [x] Mở terminal trong thư mục `backend`
- [x] Chạy: `npm install xlsx`
- [x] Chạy: `node check-xlsx-package.js` (phải thấy ✅)
- [x] Fix lỗi model: `Journal` → `FarmJournal`
- [ ] Chạy: `npm run dev` (khởi động server)

## 🧪 Test chức năng

### Export
- [ ] Vào trang danh sách nhật ký
- [ ] Chuyển sang xem bảng
- [ ] Nhấn nút Download (màu xanh dương) ở 1 nhật ký
- [ ] File Excel được tải về
- [ ] Mở file Excel, kiểm tra dữ liệu

### Export nhiều
- [ ] Chọn checkbox ở 2-3 nhật ký
- [ ] Toolbar hiện "Đã chọn: X"
- [ ] Nhấn "Xuất X nhật ký"
- [ ] File Excel được tải về
- [ ] Mở file, kiểm tra có đủ nhật ký

### Import
- [ ] Nhấn nút "Import"
- [ ] Chọn loại sổ (ví dụ: Lúa hữu cơ)
- [ ] Nhấn "Tải mẫu import..."
- [ ] File template được tải về
- [ ] Mở file, đọc sheet "Hướng dẫn"
- [ ] Điền dữ liệu vào cột "Giá trị" (các sheet khác)
- [ ] Lưu file Excel
- [ ] Quay lại modal Import
- [ ] Upload file vừa điền
- [ ] Nhấn "Import"
- [ ] Thấy thông báo "Import thành công"
- [ ] Trang reload, nhật ký mới xuất hiện

## 📝 Kiểm tra validation

### Ngày tháng
- [ ] Điền ngày đúng format: `01/01/2025`
- [ ] Điền ngày sai format → Xem có báo lỗi không

### Boolean
- [ ] Điền "Có" hoặc "Không"
- [ ] Điền giá trị khác → Xem có báo lỗi không

### Number
- [ ] Điền số hợp lệ
- [ ] Điền chữ → Xem có báo lỗi không

## 🐛 Kiểm tra lỗi

- [ ] F12 → Console: Không có lỗi đỏ
- [ ] Backend terminal: Không có error
- [ ] Upload file > 10MB → Thấy báo lỗi
- [ ] Upload file .txt → Thấy báo lỗi
- [ ] Sửa tên sheet trong Excel → Import → Thấy warning

## 📚 Documentation

- [ ] Đọc `QUICK_START_IMPORT_EXPORT.md`
- [ ] Đọc `JOURNAL_IMPORT_EXPORT_COMPLETED.md` (nếu cần chi tiết)
- [ ] Đọc `PROJECT_SUMMARY.md` (tổng quan toàn bộ)

## ✨ Hoàn thành

- [ ] Tất cả test cases pass
- [ ] Không có lỗi trong console
- [ ] UI hoạt động mượt mà
- [ ] File Excel đúng format
- [ ] Validation hoạt động đúng

---

**Khi tất cả checkbox được tick ✅, chức năng đã sẵn sàng sử dụng!**
