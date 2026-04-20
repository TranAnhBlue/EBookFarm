# 📦 Import/Export Nhật ký - EBookFarm

> Chức năng import/export nhật ký sản xuất nông nghiệp từ/ra file Excel

## 🎯 Tính năng

- ✅ **Export 1 nhật ký** ra file Excel
- ✅ **Export nhiều nhật ký** cùng lúc (bulk export)
- ✅ **Import nhật ký** từ file Excel
- ✅ **Tải mẫu template** Excel để điền dữ liệu
- ✅ **Validation** dữ liệu theo schema
- ✅ **Bảo mật**: Giới hạn file type, size, quyền truy cập

## ⚡ Quick Start

### 1. Cài đặt (BẮT BUỘC)

```bash
cd backend
npm install xlsx
node check-xlsx-package.js  # Kiểm tra
npm run dev                   # Khởi động
```

### 2. Sử dụng

#### Export 1 nhật ký
1. Vào danh sách nhật ký → Xem bảng
2. Nhấn nút **Download** (màu xanh dương)
3. File Excel tải về

#### Export nhiều
1. Chọn checkbox nhiều nhật ký
2. Nhấn **"Xuất X nhật ký"**
3. File Excel tải về

#### Import
1. Nhấn **"Import"**
2. Chọn loại sổ → Tải mẫu
3. Điền dữ liệu → Upload → Import

## 📚 Tài liệu

| File | Mô tả |
|------|-------|
| `QUICK_START_IMPORT_EXPORT.md` | Hướng dẫn nhanh 3 bước |
| `JOURNAL_IMPORT_EXPORT_COMPLETED.md` | Hướng dẫn đầy đủ, chi tiết |
| `TODO_CHECKLIST.md` | Checklist test chức năng |
| `PROJECT_SUMMARY.md` | Tổng quan toàn bộ dự án |
| `IMPORT_EXPORT_SETUP.md` | Chi tiết kỹ thuật |

## 🎨 Screenshots

### Toolbar với nút Import/Export
```
┌────────────────────────────────────────────┐
│ Đã chọn: 3  [Xuất 3 nhật ký]  [Bỏ chọn]   │
│                        [Import] [+ Tạo sổ] │
└────────────────────────────────────────────┘
```

### Modal Import
```
┌─────────────────────────────────────┐
│ 🗂️ Import nhật ký từ Excel          │
├─────────────────────────────────────┤
│ 1️⃣ Chọn loại sổ                     │
│ 2️⃣ Tải mẫu Excel                    │
│ 3️⃣ Upload file đã điền              │
│ 📌 Lưu ý...                         │
└─────────────────────────────────────┘
```

## 🔧 API Endpoints

```
GET  /api/journals/export/:id           # Export 1 nhật ký
POST /api/journals/import               # Import từ Excel
POST /api/journals/export-multiple      # Export nhiều
GET  /api/journals/template/:schemaId   # Tải mẫu
```

## 📊 Cấu trúc Excel

### Export/Template
```
Sheet: Thông tin chung
┌──────────────┬─────────┬──────────┐
│ Trường       │ Giá trị │ Loại DL  │
├──────────────┼─────────┼──────────┤
│ Tên cơ sở    │ ABC     │ text     │
│ Diện tích    │ 1200    │ number   │
│ Ngày bắt đầu │ 1/1/25  │ date     │
└──────────────┴─────────┴──────────┘
```

## ⚠️ Lưu ý quan trọng

### Khi điền Excel
- ❌ KHÔNG sửa tên sheet
- ❌ KHÔNG sửa cột "Trường"
- ✅ CHỈ điền cột "Giá trị"

### Format dữ liệu
- **Ngày**: `DD/MM/YYYY` hoặc `YYYY-MM-DD`
- **Boolean**: `Có` hoặc `Không`
- **Number**: Chỉ số, không có chữ

## 🔒 Bảo mật

- File types: `.xlsx`, `.xls`, `.csv`
- Max size: 10MB
- User chỉ export nhật ký của mình
- Admin export tất cả
- File tự động xóa sau import

## 🐛 Troubleshooting

### "Package xlsx not found"
```bash
cd backend
npm install xlsx
```

### "Không tìm thấy sheet"
→ Tải lại mẫu mới, không sửa tên sheet

### "Invalid date format"
→ Dùng format: `DD/MM/YYYY` hoặc `YYYY-MM-DD`

### Kiểm tra lỗi
- Frontend: `F12` → Console
- Backend: Terminal logs

## 📞 Support

### Test API
```bash
# Export
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/journals/export/ID \
  --output test.xlsx

# Template
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/journals/template/SCHEMA_ID \
  --output template.xlsx
```

## 🚀 Roadmap

- [ ] Import nhiều nhật ký từ 1 file
- [ ] Export sang PDF
- [ ] Preview trước khi import
- [ ] Undo import
- [ ] Import history
- [ ] Bulk edit qua Excel

## 📝 Changelog

### v1.0.0 (2026-04-21)
- ✅ Export single journal
- ✅ Export multiple journals
- ✅ Import from Excel
- ✅ Template generation
- ✅ Data validation
- ✅ UI with 3-step modal
- ✅ Checkbox selection
- ✅ Error handling

## 👥 Contributors

- Kiro AI Assistant

## 📄 License

MIT

---

**Status**: ✅ COMPLETED  
**Version**: 1.0.0  
**Last Updated**: 21/04/2026
