# 🚀 Quick Start: Import/Export Nhật ký

## ⚡ Cài đặt nhanh (3 bước)

### 1️⃣ Cài package xlsx
```bash
cd backend
npm install xlsx
```

### 2️⃣ Kiểm tra
```bash
node check-xlsx-package.js
```

Kết quả mong đợi:
```
✅ Package xlsx đã được cài đặt!
```

### 3️⃣ Khởi động server
```bash
npm run dev
```

## 🎯 Sử dụng

### Export 1 nhật ký
1. Vào danh sách nhật ký
2. Chuyển sang xem bảng
3. Nhấn nút **Download** (màu xanh dương)

### Export nhiều nhật ký
1. Chuyển sang xem bảng
2. **Chọn checkbox** nhiều nhật ký
3. Nhấn **"Xuất X nhật ký"**

### Import nhật ký
1. Nhấn **"Import"**
2. Chọn loại sổ
3. Tải mẫu → Điền dữ liệu → Lưu
4. Upload file → Nhấn "Import"

## ⚠️ Lưu ý quan trọng

- ❌ KHÔNG sửa tên sheet
- ❌ KHÔNG sửa cột "Trường"
- ✅ CHỈ điền cột "Giá trị"
- Ngày: `DD/MM/YYYY` hoặc `YYYY-MM-DD`
- Boolean: `Có` hoặc `Không`

## 📚 Tài liệu đầy đủ

Xem file: `JOURNAL_IMPORT_EXPORT_COMPLETED.md`
