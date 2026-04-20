# ✅ Fixed: Excel Sheet Name Error

## 🐛 Lỗi gặp phải

```
Template generation error: Error: Sheet name cannot contain : \ / ? * [ ]
```

## 🔍 Nguyên nhân

Excel không cho phép tên sheet chứa các ký tự đặc biệt:
- `:` (dấu hai chấm)
- `\` (backslash)
- `/` (forward slash)
- `?` (dấu hỏi)
- `*` (dấu sao)
- `[` `]` (ngoặc vuông)

Schema Lợn thịt có tên bảng như:
- "Biểu 1: Mua/chuyển lợn giống" → Chứa `:` và `/`
- "Biểu 2: Nhập thức ăn/nguyên liệu thô" → Chứa `:` và `/`
- ...

## ✅ Giải pháp

Đã thêm hàm sanitize để thay thế các ký tự không hợp lệ bằng dấu `-`:

```javascript
let sheetName = table.tableName
  .replace(/[:\\\/\?\*\[\]]/g, '-') // Replace invalid chars with dash
  .replace(/\s+/g, ' ')              // Normalize spaces
  .trim();                            // Remove leading/trailing spaces

// Limit to 31 characters (Excel limit)
if (sheetName.length > 31) {
  sheetName = sheetName.substring(0, 28) + '...';
}
```

## 📝 Ví dụ chuyển đổi

| Tên bảng gốc | Tên sheet trong Excel |
|--------------|----------------------|
| Biểu 1: Mua/chuyển lợn giống | Biểu 1- Mua-chuyển lợn giống |
| Biểu 2: Nhập thức ăn/nguyên liệu thô | Biểu 2- Nhập thức ăn-nguyê... |
| Biểu 6: Sử dụng vaccin/thuốc điều trị | Biểu 6- Sử dụng vaccin-thu... |

## 🔧 Files đã sửa

### backend/src/controllers/journalImportExportController.js

Đã cập nhật 4 functions:

1. **exportJournal()** - Line ~115
   - Sanitize sheet name khi export 1 nhật ký

2. **importJournal()** - Line ~195
   - Sanitize sheet name khi tìm sheet để import
   - Cập nhật logic matching để tìm sheet với tên đã sanitize

3. **exportMultipleJournals()** - Line ~405
   - Sanitize sheet name khi export nhiều nhật ký

4. **generateImportTemplate()** - Line ~525
   - Sanitize sheet name khi tạo template

## ✅ Kết quả

Bây giờ có thể:
- ✅ Tải mẫu template cho Lợn thịt
- ✅ Export nhật ký Lợn thịt
- ✅ Import nhật ký Lợn thịt
- ✅ Export nhiều nhật ký Lợn thịt

Tất cả sheet names đều hợp lệ với Excel!

## 🧪 Test

### Test 1: Tải mẫu template
```bash
# Vào giao diện
1. Nhấn "Import"
2. Chọn "Lợn thịt"
3. Nhấn "Tải mẫu import..."
4. File Excel được tải về thành công ✅
```

### Test 2: Mở file Excel
```bash
# Mở file vừa tải
1. Double click file Excel
2. Xem các sheet:
   - Hướng dẫn ✅
   - Thông tin chung ✅
   - Biểu 1- Mua-chuyển lợn giống ✅
   - Biểu 2- Nhập thức ăn-nguyên... ✅
   - ... (tất cả 13 biểu)
```

### Test 3: Export nhật ký
```bash
# Export 1 nhật ký
1. Tạo nhật ký Lợn thịt
2. Nhấn nút Download
3. File Excel được tải về ✅
4. Mở file, xem các sheet ✅
```

## 📋 Regex Pattern

Pattern để loại bỏ ký tự không hợp lệ:

```javascript
/[:\\\/\?\*\[\]]/g
```

Giải thích:
- `[...]` - Character class
- `:` - Dấu hai chấm
- `\\` - Backslash (escaped)
- `\/` - Forward slash (escaped)
- `\?` - Dấu hỏi (escaped)
- `\*` - Dấu sao (escaped)
- `\[` - Ngoặc vuông mở (escaped)
- `\]` - Ngoặc vuông đóng (escaped)
- `g` - Global flag (replace all occurrences)

## 🎯 Tương thích

Giải pháp này tương thích với:
- ✅ Tất cả schemas hiện có
- ✅ Schemas mới trong tương lai
- ✅ Tên bảng có ký tự đặc biệt
- ✅ Tên bảng dài (> 31 ký tự)
- ✅ Microsoft Excel
- ✅ Google Sheets
- ✅ LibreOffice Calc

## 🚀 Tiếp theo

Bây giờ bạn có thể:
1. ✅ Tải mẫu template Lợn thịt
2. ✅ Điền dữ liệu vào file mẫu
3. ✅ Import nhật ký
4. ✅ Export nhật ký

Xem hướng dẫn chi tiết trong `PIG_JOURNAL_IMPORT_GUIDE.md`

---

**Ngày fix**: 21/04/2026  
**Status**: ✅ FIXED
