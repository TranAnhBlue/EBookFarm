# Sửa lỗi Encoding Tiếng Việt - Quick Guide

## ❌ Vấn đề
```
"Sẵn nhật ký HTX mới" → "Sáº¯n nhẫº¯t kÃ½ HTX máº›i"
```

## ✅ Giải pháp nhanh

### 1. Backup Database
```bash
mongodump --uri="YOUR_MONGO_URI" --out=./backup-$(date +%Y%m%d)
```

### 2. Kiểm tra vấn đề
```bash
cd backend
node check-encoding-issue.js
```

### 3. Sửa encoding
```bash
# Cài package cần thiết (nếu chưa có)
npm install iconv-lite

# Chạy script sửa
node fix-encoding.js
```

### 4. Restart backend
```bash
npm run dev
```

### 5. Clear cache & test
- `Ctrl + Shift + Delete` → Clear cache
- `Ctrl + F5` → Hard reload
- Kiểm tra lại các trang có tiếng Việt

## 📝 Đã sửa trong code

### Backend (`backend/src/server.js`)
```javascript
// ✅ ĐÃ THÊM - Force UTF-8 cho tất cả responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
```

### Frontend (`frontend/index.html`)
```html
<!-- ✅ ĐÃ CÓ -->
<meta charset="UTF-8" />
```

## ⚠️ Lưu ý
- **PHẢI BACKUP** trước khi chạy script sửa
- Script tự động sửa 11 collections chính
- Nếu vẫn lỗi, xem file `ENCODING_FIX_GUIDE.md` để debug chi tiết

## 🎯 Kết quả
✅ Tất cả tiếng Việt hiển thị đúng  
✅ Dữ liệu mới không bị lỗi encoding  
✅ API có header `charset=utf-8`  

---

**Chi tiết đầy đủ**: Xem file `ENCODING_FIX_GUIDE.md`
