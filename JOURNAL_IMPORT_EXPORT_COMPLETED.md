# ✅ HOÀN THÀNH: Chức năng Import/Export Nhật ký

## 📋 Tổng quan

Đã hoàn thành việc xây dựng chức năng Import/Export nhật ký từ/ra file Excel cho hệ thống EBookFarm.

## 🎯 Các tính năng đã triển khai

### 1. Export nhật ký
- ✅ Xuất 1 nhật ký ra file Excel
- ✅ Xuất nhiều nhật ký cùng lúc (bulk export)
- ✅ Tải mẫu template Excel để import

### 2. Import nhật ký
- ✅ Import dữ liệu từ file Excel
- ✅ Validation dữ liệu theo schema
- ✅ Hiển thị warnings và errors sau khi import

### 3. Giao diện người dùng
- ✅ Nút Import/Export trên toolbar
- ✅ Checkbox chọn nhiều nhật ký để export hàng loạt
- ✅ Modal import với 3 bước rõ ràng
- ✅ Nút export cho từng nhật ký trong bảng

## 📁 Files đã tạo/cập nhật

### Backend
1. **backend/src/controllers/journalImportExportController.js** (MỚI)
   - `exportJournal()` - Xuất 1 nhật ký
   - `importJournal()` - Import từ Excel
   - `exportMultipleJournals()` - Xuất nhiều nhật ký
   - `generateImportTemplate()` - Tạo mẫu import

2. **backend/src/routes/journalImportExportRoutes.js** (MỚI)
   - GET `/api/journals/export/:id`
   - POST `/api/journals/import`
   - POST `/api/journals/export-multiple`
   - GET `/api/journals/template/:schemaId`

3. **backend/src/server.js** (CẬP NHẬT)
   - Đã include routes mới

4. **backend/check-xlsx-package.js** (MỚI)
   - Script kiểm tra package xlsx

### Frontend
1. **frontend/src/pages/Journal/JournalList.jsx** (CẬP NHẬT)
   - Thêm state cho import/export
   - Thêm handler functions
   - Thêm nút Import/Export
   - Thêm modal Import
   - Thêm checkbox selection cho table

## 🔧 BƯỚC CÀI ĐẶT (QUAN TRỌNG!)

### Bước 1: Cài đặt package xlsx

Mở terminal và chạy:

```bash
cd backend
npm install xlsx
```

### Bước 2: Kiểm tra cài đặt

```bash
node check-xlsx-package.js
```

Nếu thành công, bạn sẽ thấy:
```
✅ Package xlsx đã được cài đặt!
📦 Version: x.x.x
```

### Bước 3: Khởi động lại server

```bash
npm run dev
```

## 🎨 Cách sử dụng

### A. Export 1 nhật ký

1. Vào trang danh sách nhật ký (VietGAP/Hữu cơ/...)
2. Chuyển sang chế độ xem bảng (nút "Xem ở dạng bảng")
3. Nhấn nút **Download** (icon mũi tên xuống màu xanh dương) ở cột "Thao tác"
4. File Excel sẽ được tải về máy

**Cấu trúc file Excel:**
- Sheet "Thông tin chung": Metadata của nhật ký
- Các sheet khác: Dữ liệu từng bảng (Trường | Giá trị | Loại dữ liệu)

### B. Export nhiều nhật ký

1. Vào trang danh sách nhật ký
2. Chuyển sang chế độ xem bảng
3. **Chọn checkbox** ở các nhật ký muốn xuất
4. Toolbar sẽ hiện: "Đã chọn: X" và nút "Xuất X nhật ký"
5. Nhấn nút "Xuất X nhật ký"
6. File Excel chứa tất cả nhật ký đã chọn sẽ được tải về

**Cấu trúc file Excel:**
- Sheet "Tổng quan": Danh sách các nhật ký
- Các sheet khác: Dữ liệu từng nhật ký (đánh số 1-, 2-, ...)

### C. Import nhật ký từ Excel

#### Bước 1: Chọn loại sổ
1. Nhấn nút **"Import"** (màu xanh lá) ở toolbar
2. Modal "Import nhật ký từ Excel" sẽ hiện ra
3. Chọn loại sổ nhật ký từ dropdown (ví dụ: Lúa hữu cơ, Bò thịt, Tôm...)

#### Bước 2: Tải mẫu Excel
1. Nhấn nút **"Tải mẫu import cho loại sổ đã chọn"**
2. File Excel mẫu sẽ được tải về
3. Mở file Excel:
   - Sheet "Hướng dẫn": Đọc kỹ hướng dẫn
   - Các sheet khác: Điền dữ liệu vào cột "Giá trị"

**LƯU Ý KHI ĐIỀN:**
- ❌ KHÔNG thay đổi tên sheet
- ❌ KHÔNG thay đổi cột "Trường"
- ✅ CHỈ điền vào cột "Giá trị"
- Định dạng ngày: `DD/MM/YYYY` hoặc `YYYY-MM-DD`
- Định dạng boolean: `Có` hoặc `Không`

#### Bước 3: Upload file đã điền
1. Lưu file Excel sau khi điền xong
2. Quay lại modal Import
3. Nhấn vào vùng upload hoặc kéo thả file vào
4. Chọn file Excel vừa điền
5. Nhấn nút **"Import"**

#### Bước 4: Kiểm tra kết quả
- Nếu thành công: Modal thông báo "Import thành công"
- Nếu có warnings: Sẽ hiển thị danh sách cảnh báo
- Nếu có errors: Sẽ hiển thị lỗi chi tiết
- Trang sẽ tự động reload và hiển thị nhật ký mới

## 📊 Cấu trúc dữ liệu Excel

### File Export/Template

```
Sheet: Hướng dẫn (chỉ có trong template)
┌─────────────────────────────────────────┐
│ HƯỚNG DẪN IMPORT DỮ LIỆU                │
│ 1. Mỗi sheet tương ứng với một bảng...  │
│ ...                                      │
└─────────────────────────────────────────┘

Sheet: Thông tin chung
┌──────────────────┬─────────────┬──────────────┐
│ Trường           │ Giá trị     │ Loại dữ liệu │
├──────────────────┼─────────────┼──────────────┤
│ Tên cơ sở        │ ABC Farm    │ text         │
│ Diện tích        │ 1200        │ number       │
│ Ngày bắt đầu     │ 01/01/2025  │ date         │
│ Sử dụng hóa chất │ Không       │ boolean      │
└──────────────────┴─────────────┴──────────────┘

Sheet: Bảng 1 - Đánh giá ATTP
┌──────────────────┬─────────────┬──────────────┐
│ Trường           │ Giá trị     │ Loại dữ liệu │
├──────────────────┼─────────────┼──────────────┤
│ Kim loại nặng    │ Đạt         │ select       │
│ pH đất           │ 6.5         │ number       │
└──────────────────┴─────────────┴──────────────┘
```

## 🔒 Bảo mật & Giới hạn

### Upload file
- ✅ Chỉ chấp nhận: `.xlsx`, `.xls`, `.csv`
- ✅ Kích thước tối đa: 10MB
- ✅ File tự động xóa sau khi import

### Quyền truy cập
- ✅ User chỉ export được nhật ký của mình
- ✅ Admin export được tất cả nhật ký
- ✅ Import tạo nhật ký mới thuộc về user hiện tại

### Validation
- ✅ Kiểm tra kiểu dữ liệu (text, number, date, boolean, select)
- ✅ Kiểm tra định dạng ngày tháng
- ✅ Kiểm tra giá trị boolean
- ✅ Kiểm tra trường bắt buộc (theo schema)

## 🐛 Xử lý lỗi

### Lỗi thường gặp

1. **"Chỉ hỗ trợ file Excel (.xlsx, .xls) và CSV (.csv)"**
   - Nguyên nhân: File không đúng định dạng
   - Giải pháp: Chọn file Excel hoặc CSV

2. **"Không tìm thấy sheet cho bảng: XXX"**
   - Nguyên nhân: Tên sheet bị thay đổi
   - Giải pháp: Tải lại mẫu mới, không sửa tên sheet

3. **"Không tìm thấy trường: XXX trong bảng YYY"**
   - Nguyên nhân: Tên trường trong cột "Trường" bị sửa
   - Giải pháp: Tải lại mẫu mới, không sửa cột "Trường"

4. **"Invalid date format: XXX"**
   - Nguyên nhân: Định dạng ngày không đúng
   - Giải pháp: Dùng định dạng DD/MM/YYYY hoặc YYYY-MM-DD

5. **"Package xlsx not found"**
   - Nguyên nhân: Chưa cài package xlsx
   - Giải pháp: Chạy `npm install xlsx` trong thư mục backend

## 📝 Ví dụ thực tế

### Ví dụ 1: Export nhật ký Lúa hữu cơ

1. Vào "Nông nghiệp Hữu cơ" → "Cây trồng"
2. Tìm nhật ký "Lúa X33 - Xuân 2025"
3. Nhấn nút Download
4. File `nhat-ky-Lua-huu-co-2025-04-21.xlsx` được tải về

### Ví dụ 2: Import nhật ký Bò thịt

1. Nhấn "Import"
2. Chọn "Bò thịt" từ dropdown
3. Tải mẫu → File `mau-import-Bo-thit.xlsx` được tải về
4. Mở file, điền:
   - Sheet "Biểu 1": Số hiệu: BT001, Giới tính: Đực, ...
   - Sheet "Biểu 2": Ngày mua: 01/01/2025, Số lượng: 10, ...
   - ...
5. Lưu file
6. Upload file vào modal Import
7. Nhấn "Import"
8. Nhật ký mới xuất hiện trong danh sách

## 🚀 Tính năng nâng cao (có thể thêm sau)

- [ ] Import nhiều nhật ký từ 1 file Excel
- [ ] Export sang PDF
- [ ] Preview dữ liệu trước khi import
- [ ] Undo import
- [ ] Import history/log
- [ ] Bulk edit (export → edit → import update)
- [ ] Export với filter (theo ngày, trạng thái)
- [ ] Drag & drop file vào modal
- [ ] Progress bar khi import file lớn

## 📞 Hỗ trợ

### Kiểm tra lỗi

**Frontend (Browser):**
```
F12 → Console tab
Xem lỗi JavaScript
```

**Backend (Terminal):**
```
Xem log trong terminal đang chạy npm run dev
Tìm dòng có "error" hoặc "Error"
```

### Test API trực tiếp

**Export:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/journals/export/JOURNAL_ID \
  --output test.xlsx
```

**Template:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/journals/template/SCHEMA_ID \
  --output template.xlsx
```

**Import:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.xlsx" \
  -F "schemaId=SCHEMA_ID" \
  http://localhost:5000/api/journals/import
```

## ✅ Checklist hoàn thành

- [x] Backend controller với 4 endpoints
- [x] Backend routes
- [x] Frontend UI với nút Import/Export
- [x] Frontend modal Import 3 bước
- [x] Frontend handlers cho export/import
- [x] Checkbox selection cho bulk export
- [x] Validation dữ liệu import
- [x] Error handling
- [x] File upload với multer
- [x] Excel generation với xlsx
- [x] Template generation
- [x] Security (file type, size limit)
- [x] Documentation

## 🎉 Kết luận

Chức năng Import/Export nhật ký đã hoàn thành! 

**Bước tiếp theo:**
1. ✅ Chạy `npm install xlsx` trong thư mục backend
2. ✅ Khởi động lại server
3. ✅ Test các tính năng
4. ✅ Báo lỗi nếu có

Chúc bạn sử dụng tốt! 🚀
