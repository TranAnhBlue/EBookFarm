# Hướng dẫn cài đặt chức năng Import/Export nhật ký

## ✅ Đã hoàn thành

### Backend
1. ✅ Tạo controller `journalImportExportController.js` với 4 endpoints:
   - `GET /api/journals/export/:id` - Xuất 1 nhật ký ra Excel
   - `POST /api/journals/import` - Import nhật ký từ Excel
   - `POST /api/journals/export-multiple` - Xuất nhiều nhật ký
   - `GET /api/journals/template/:schemaId` - Tải mẫu import

2. ✅ Tạo routes `journalImportExportRoutes.js`

3. ✅ Cập nhật `server.js` để include routes mới

### Frontend
1. ✅ Cập nhật `JournalList.jsx`:
   - Thêm nút Import/Export vào toolbar
   - Thêm modal Import với 3 bước:
     - Bước 1: Chọn loại sổ
     - Bước 2: Tải mẫu Excel
     - Bước 3: Upload file đã điền
   - Thêm nút Export cho từng nhật ký trong bảng
   - Thêm checkbox để chọn nhiều nhật ký và xuất hàng loạt
   - Thêm các handler functions:
     - `handleExportSingle()` - Xuất 1 nhật ký
     - `handleExportMultiple()` - Xuất nhiều nhật ký
     - `handleDownloadTemplate()` - Tải mẫu
     - `handleImport()` - Import từ Excel

## 🔧 Cần thực hiện

### 1. Cài đặt package xlsx cho backend

Mở terminal trong thư mục `backend` và chạy:

```bash
cd backend
npm install xlsx
```

### 2. Tạo thư mục uploads (tự động tạo khi chạy)

Thư mục `backend/uploads/imports` sẽ được tạo tự động khi có file upload lần đầu.

### 3. Khởi động lại backend server

```bash
cd backend
npm run dev
```

### 4. Test chức năng

#### Test Export:
1. Vào trang danh sách nhật ký
2. Nhấn nút Download (icon mũi tên xuống) ở cột "Thao tác"
3. File Excel sẽ được tải về

#### Test Export nhiều:
1. Chuyển sang chế độ xem bảng
2. Chọn checkbox ở nhiều nhật ký
3. Nhấn nút "Xuất X nhật ký" ở toolbar
4. File Excel chứa tất cả nhật ký đã chọn sẽ được tải về

#### Test Import:
1. Nhấn nút "Import" ở toolbar
2. Chọn loại sổ nhật ký
3. Nhấn "Tải mẫu import cho loại sổ đã chọn"
4. Mở file Excel vừa tải, điền dữ liệu vào cột "Giá trị"
5. Lưu file Excel
6. Quay lại modal Import, upload file vừa điền
7. Nhấn "Import"
8. Kiểm tra nhật ký mới được tạo

## 📋 Cấu trúc file Excel

### File Export:
- **Sheet "Thông tin chung"**: Metadata của nhật ký
- **Các sheet khác**: Mỗi bảng trong schema tương ứng 1 sheet
  - Cột 1: Tên trường (label)
  - Cột 2: Giá trị
  - Cột 3: Loại dữ liệu

### File Template (mẫu import):
- **Sheet "Hướng dẫn"**: Hướng dẫn chi tiết cách điền
- **Các sheet khác**: Template cho từng bảng
  - Cột 1: Tên trường (KHÔNG được sửa)
  - Cột 2: Giá trị (điền vào đây)
  - Cột 3: Loại dữ liệu
  - Cột 4: Ghi chú/ví dụ

## 🔒 Bảo mật

- Chỉ cho phép file .xlsx, .xls, .csv
- Giới hạn kích thước file: 10MB
- User chỉ có thể export nhật ký của mình (trừ Admin)
- File upload được xóa sau khi import xong

## 🎨 Giao diện

### Toolbar:
- Nút "Import" (màu xanh lá, icon upload)
- Nút "Tạo sổ nhật ký" (primary button)
- Khi chọn nhiều nhật ký: hiện số lượng đã chọn và nút "Xuất X nhật ký"

### Bảng:
- Thêm cột checkbox để chọn nhiều
- Thêm nút Download ở cột "Thao tác" (màu xanh dương)

### Modal Import:
- 3 bước rõ ràng với số thứ tự
- Nút tải mẫu có border dashed
- Vùng upload file với drag & drop
- Hiển thị tên file đã chọn
- Hướng dẫn chi tiết ở cuối modal

## 🐛 Xử lý lỗi

- Nếu file không đúng định dạng: hiện thông báo lỗi
- Nếu sheet không tìm thấy: ghi vào warnings
- Nếu trường không tồn tại: ghi vào warnings
- Nếu dữ liệu không hợp lệ: ghi vào errors
- Sau import thành công: hiện modal với kết quả và warnings (nếu có)

## 📝 Validation

Import sẽ validate:
- Kiểu dữ liệu (number, date, boolean, text)
- Định dạng ngày tháng
- Giá trị boolean ("Có"/"Không")
- Các trường bắt buộc (theo schema)

## 🚀 Tính năng nâng cao (có thể thêm sau)

- [ ] Import nhiều nhật ký cùng lúc (1 file Excel nhiều nhật ký)
- [ ] Export với filter (theo ngày, theo trạng thái)
- [ ] Export sang PDF
- [ ] Preview dữ liệu trước khi import
- [ ] Undo import
- [ ] Import history/log
- [ ] Bulk edit qua Excel (export → edit → import update)

## 📞 Liên hệ

Nếu có lỗi, kiểm tra:
1. Console browser (F12) để xem lỗi frontend
2. Terminal backend để xem lỗi server
3. Kiểm tra file Excel có đúng format không
4. Kiểm tra quyền truy cập file/folder
