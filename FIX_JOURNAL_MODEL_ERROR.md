# ✅ Fixed: Journal Model Error

## 🐛 Lỗi gặp phải

```
Error: Cannot find module '../models/Journal'
```

## 🔍 Nguyên nhân

Controller `journalImportExportController.js` đang import:
```javascript
const Journal = require('../models/Journal');
```

Nhưng trong thư mục `backend/src/models/` không có file `Journal.js`, mà có file `FarmJournal.js`.

## ✅ Giải pháp

Đã sửa tất cả references từ `Journal` sang `FarmJournal`:

### 1. Import statement
```javascript
// Trước
const Journal = require('../models/Journal');

// Sau
const FarmJournal = require('../models/FarmJournal');
```

### 2. Tất cả usages trong controller
```javascript
// Trước
await Journal.findById(id)
new Journal({...})
await Journal.find({...})

// Sau
await FarmJournal.findById(id)
new FarmJournal({...})
await FarmJournal.find({...})
```

## 📦 Bonus: Cài đặt xlsx

Package `xlsx` đã được cài đặt thành công:
```
✅ Package xlsx đã được cài đặt!
📦 Version: 0.18.5
```

## ✅ Kết quả

Server bây giờ sẽ chạy bình thường mà không có lỗi `MODULE_NOT_FOUND`.

## 🚀 Tiếp theo

1. Khởi động server: `npm run dev`
2. Test chức năng Import/Export
3. Kiểm tra các endpoints hoạt động đúng

## 📝 Files đã sửa

- `backend/src/controllers/journalImportExportController.js`
  - Line 1: Import statement
  - Line 46: `Journal.findById` → `FarmJournal.findById`
  - Line 277: `new Journal` → `new FarmJournal`
  - Line 326: `Journal.find` → `FarmJournal.find`

## 🎯 Model Structure

FarmJournal model có cấu trúc:
```javascript
{
  userId: ObjectId (ref: User),
  schemaId: ObjectId (ref: FormSchema),
  qrCode: String (unique, auto-generated UUID),
  entries: Mixed (default: {}),
  status: String (enum: ['Draft', 'Completed']),
  timestamps: true (createdAt, updatedAt)
}
```

Hoàn toàn tương thích với controller đã viết! ✅
