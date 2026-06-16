# Hướng dẫn sửa lỗi Encoding UTF-8

## 🔍 Vấn đề
Chữ tiếng Việt hiển thị sai dấu trong database và ứng dụng:
```
"Sẵn nhật ký HTX mới" → "Sáº¯n nhẫº¯t kÃ½ HTX máº›i"
"Hợp tác xã" → "Háº£p tĂ¡c xĂŁ"
"Bò mua hè" → "BĂ² mua hĂš"
```

## 🎯 Nguyên nhân
1. **Database encoding sai**: Dữ liệu được lưu với encoding không phải UTF-8
2. **Double encoding**: Dữ liệu được encode 2 lần (UTF-8 → Latin1 → UTF-8)
3. **Response headers thiếu charset**: API không chỉ định `charset=utf-8`
4. **Form submission không đúng encoding**: Dữ liệu gửi lên không đúng định dạng

## ✅ Giải pháp

### Bước 1: Kiểm tra vấn đề hiện tại

```bash
cd backend
node check-encoding-issue.js
```

**Output mẫu:**
```
🔍 Đang kiểm tra collection: htxmanagementrecords

   ❌ Phát hiện lỗi encoding trong document _id: 67899abc...
      Field "title": Sáº¯n nhẫº¯t kÃ½ HTX máº›i
      Field "description": Háº£p tĂ¡c xĂŁ vĂ  tĂ¡o sĂ¡ng...

📊 KẾT QUẢ:
   Tổng số collections: 15
   Documents có vấn đề: 8

⚠️  CÓ VẤN ĐỀ ENCODING!
```

### Bước 2: Backup Database (QUAN TRỌNG!)

```bash
# Nếu dùng MongoDB Atlas
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" --out=./backup-$(date +%Y%m%d)

# Nếu dùng local MongoDB
mongodump --db=ebookfarm --out=./backup-$(date +%Y%m%d)
```

### Bước 3: Chạy script sửa encoding

```bash
cd backend
node fix-encoding.js
```

**Output mẫu:**
```
🔧 Đang sửa collection: htxmanagementrecords

   ✅ Đã sửa document _id: 67899abc...
      "title": "Sáº¯n nhẫº¯t kÃ½ HTX máº›i" → "Sẵn nhật ký HTX mới"
      "description": "Háº£p tĂ¡c xĂŁ" → "Hợp tác xã"
   
   📊 Kết quả: 8/150 documents đã được sửa

📊 KẾT QUẢ TỔNG HỢP:
   Tổng documents: 1250
   Đã sửa: 45
   Lỗi: 0

✅ Đã sửa xong!
```

### Bước 4: Cập nhật Backend (ĐÃ SỬA)

**File: `backend/src/server.js`**

Đã thêm middleware force UTF-8 cho tất cả responses:

```javascript
// Middleware: Force UTF-8 encoding for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
```

### Bước 5: Restart Backend

```bash
cd backend
npm run dev
```

### Bước 6: Clear Cache và Test

1. **Clear browser cache**:
   - Chrome: `Ctrl + Shift + Delete` → Clear cache
   - Firefox: `Ctrl + Shift + Delete` → Clear cache
   
2. **Hard reload trang**:
   - `Ctrl + F5` hoặc `Ctrl + Shift + R`

3. **Kiểm tra lại**:
   - Login vào hệ thống
   - Kiểm tra các trang có tiếng Việt
   - Tạo data mới và xem có hiển thị đúng không

## 🔧 Các sửa đổi đã thực hiện

### 1. Backend Response Headers
**File**: `backend/src/server.js`
```javascript
// ✅ ĐÃ THÊM
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
```

### 2. Frontend HTML Meta
**File**: `frontend/index.html`
```html
<!-- ✅ ĐÃ CÓ SẴN -->
<meta charset="UTF-8" />
```

### 3. MongoDB Connection
**File**: `backend/src/config/db.js`

Connection string nên có:
```javascript
// Đảm bảo MongoDB connection string có các options này
const uri = process.env.MONGO_URI + "?retryWrites=true&w=majority";
```

MongoDB mặc định đã hỗ trợ UTF-8, không cần thêm options.

## 📝 Scripts đã tạo

### 1. `backend/check-encoding-issue.js`
Kiểm tra và phát hiện các documents có vấn đề encoding.

**Chạy:**
```bash
cd backend
node check-encoding-issue.js
```

### 2. `backend/fix-encoding.js`
Tự động sửa lỗi encoding trong database.

**Chạy:**
```bash
cd backend
node fix-encoding.js
```

**Lưu ý**: Script này cần package `iconv-lite`:
```bash
npm install iconv-lite
```

## 🚨 Lưu ý quan trọng

### 1. Backup trước khi sửa
⚠️ **LUÔN LUÔN** backup database trước khi chạy script sửa!

### 2. Test trên staging trước
Nếu có môi trường staging, test trên đó trước khi chạy trên production.

### 3. Rollback nếu cần
Nếu có vấn đề sau khi fix, restore từ backup:

```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." --drop ./backup-20250116/
```

### 4. Kiểm tra sau khi fix
- ✅ Login vào hệ thống
- ✅ Xem các trang có tiếng Việt
- ✅ Tạo dữ liệu mới
- ✅ Sửa dữ liệu cũ
- ✅ Kiểm tra mobile app
- ✅ Kiểm tra notifications
- ✅ Kiểm tra PDF exports (nếu có)

## 🔍 Debug nếu vẫn có vấn đề

### 1. Kiểm tra API Response Headers

```bash
curl -I https://your-api.com/api/users
```

Phải có:
```
Content-Type: application/json; charset=utf-8
```

### 2. Kiểm tra Database Encoding

```javascript
// Trong MongoDB shell
db.users.findOne()

// Nếu vẫn thấy ký tự lỗi → chạy lại fix-encoding.js
```

### 3. Kiểm tra Browser Console

Mở DevTools → Console, xem có lỗi encoding không:
```
Failed to decode response: encoding error
```

### 4. Kiểm tra Form Submission

Trong DevTools → Network → Chọn một POST request:
- Headers tab → Content-Type phải có `charset=utf-8`
- Payload tab → Xem data có hiển thị đúng không

## 📊 Các collections cần kiểm tra

Script `fix-encoding.js` sẽ tự động sửa các collections này:

1. ✅ `users` - Thông tin người dùng
2. ✅ `farmjournals` - Nhật ký nông trại
3. ✅ `htxjournals` - Nhật ký HTX
4. ✅ `formschemas` - Form động
5. ✅ `groups` - Nhóm sản xuất
6. ✅ `news` - Tin tức
7. ✅ `products` - Sản phẩm
8. ✅ `productionbatches` - Lô sản xuất
9. ✅ `htxmanagementrecords` - Hồ sơ quản lý HTX
10. ✅ `consultations` - Tư vấn
11. ✅ `notifications` - Thông báo

## 🎯 Kết quả mong đợi

Sau khi hoàn tất:

✅ Tất cả chữ tiếng Việt hiển thị đúng  
✅ Dấu thanh, dấu hỏi, dấu ngã hiển thị chính xác  
✅ Dữ liệu mới tạo ra không bị lỗi encoding  
✅ Database lưu trữ đúng định dạng UTF-8  
✅ API responses có header `charset=utf-8`  
✅ Mobile app hiển thị đúng tiếng Việt  

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề sau khi làm theo hướng dẫn:

1. Kiểm tra console logs có lỗi gì không
2. Chạy lại `check-encoding-issue.js` để xem còn vấn đề không
3. Kiểm tra file `.env` có đúng MONGO_URI không
4. Đảm bảo đã restart backend sau khi sửa code

## ⚡ Quick Fix Checklist

- [ ] Backup database
- [ ] Chạy `check-encoding-issue.js`
- [ ] Chạy `fix-encoding.js` nếu có vấn đề
- [ ] Restart backend server
- [ ] Clear browser cache
- [ ] Hard reload trang web
- [ ] Test tạo/sửa dữ liệu mới
- [ ] Kiểm tra mobile app
- [ ] Xác nhận tất cả OK

---

**Lưu ý**: Vấn đề encoding thường xuất hiện khi:
- Import dữ liệu từ Excel
- Copy/paste từ Word
- Migrate data từ hệ thống cũ
- Nhập liệu qua API không có charset header

Đảm bảo tất cả nguồn nhập liệu đều sử dụng UTF-8!
