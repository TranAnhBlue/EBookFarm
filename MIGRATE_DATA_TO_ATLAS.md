# 📦 MIGRATE DATA TỪ LOCAL LÊN MONGODB ATLAS

## 🎯 Mục tiêu

Export tất cả data từ MongoDB local và import lên MongoDB Atlas để production app có data.

---

## 🚀 CÁCH 1: Dùng Scripts (Khuyến nghị)

### Bước 1: Export data từ local

```bash
cd backend
node export-local-data.js
```

**Kết quả:**
- Tạo folder `backend/data-export/`
- Chứa các file JSON: `users.json`, `formschemas.json`, `farmjournals.json`, etc.
- Mỗi file chứa data của 1 collection

### Bước 2: Import data lên Atlas

```bash
node import-to-atlas.js
```

**Kết quả:**
- Kết nối tới MongoDB Atlas
- Import tất cả data từ folder `data-export/`
- Hiển thị số lượng documents đã import

### Bước 3: Kiểm tra

1. Truy cập MongoDB Atlas: https://cloud.mongodb.com
2. Vào cluster → Browse Collections
3. Kiểm tra database `Ebook-Farm` có data

---

## 🔧 CÁCH 2: Dùng MongoDB Compass (GUI)

### Bước 1: Cài MongoDB Compass

Download: https://www.mongodb.com/try/download/compass

### Bước 2: Connect tới Local MongoDB

1. Mở MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click **Connect**
4. Chọn database `ebookfarm`

### Bước 3: Export từng collection

Với mỗi collection (users, formschemas, farmjournals, etc.):

1. Click vào collection
2. Click **Export Collection**
3. Chọn format: **JSON**
4. Click **Export**
5. Lưu file (ví dụ: `users.json`)

### Bước 4: Connect tới MongoDB Atlas

1. Trong MongoDB Compass, click **New Connection**
2. Connection string:
   ```
   mongodb+srv://trananhblue:TRANANHBLUE@ebook-farm.xgc0r6q.mongodb.net/
   ```
3. Click **Connect**
4. Chọn database `Ebook-Farm` (hoặc tạo mới)

### Bước 5: Import vào Atlas

Với mỗi file JSON đã export:

1. Click vào collection tương ứng (hoặc tạo mới)
2. Click **Add Data** → **Import JSON or CSV file**
3. Chọn file JSON
4. Click **Import**
5. Đợi import xong

---

## 🛠️ CÁCH 3: Dùng mongodump/mongorestore (Command Line)

### Bước 1: Export từ local

```bash
# Export toàn bộ database
mongodump --uri="mongodb://localhost:27017/ebookfarm" --out=./dump

# Hoặc export từng collection
mongodump --uri="mongodb://localhost:27017/ebookfarm" --collection=users --out=./dump
```

### Bước 2: Import lên Atlas

```bash
# Import toàn bộ database
mongorestore --uri="mongodb+srv://trananhblue:TRANANHBLUE@ebook-farm.xgc0r6q.mongodb.net/Ebook-Farm" ./dump/ebookfarm

# Hoặc import từng collection
mongorestore --uri="mongodb+srv://trananhblue:TRANANHBLUE@ebook-farm.xgc0r6q.mongodb.net/Ebook-Farm" --collection=users ./dump/ebookfarm/users.bson
```

---

## 📋 Danh sách Collections cần migrate

### Collections chính (bắt buộc):
- ✅ **users** - Tài khoản người dùng
- ✅ **formschemas** - Các mẫu form (VietGAP, TCVN, etc.)
- ✅ **farmjournals** - Nhật ký sản xuất
- ✅ **journalhistories** - Lịch sử chỉnh sửa journal

### Collections phụ (tùy chọn):
- **inventories** - Kho hàng
- **logs** - System logs
- **agrimodels** - Mô hình nông nghiệp
- **groups** - Nhóm người dùng
- **news** - Tin tức
- **consultations** - Tư vấn
- **chatmessages** - Tin nhắn chat AI
- **chatstats** - Thống kê chat

---

## ⚠️ Lưu ý quan trọng

### 1. Passwords
User passwords trong local đã được hash bằng bcrypt, có thể import trực tiếp.

### 2. ObjectIds
MongoDB sẽ giữ nguyên ObjectIds khi import, nên relationships vẫn hoạt động.

### 3. Indexes
Sau khi import, cần tạo lại indexes:

```javascript
// Trong MongoDB Atlas shell hoặc Compass
db.users.createIndex({ email: 1 }, { unique: true });
db.farmjournals.createIndex({ qrCode: 1 }, { unique: true });
db.formschemas.createIndex({ category: 1, name: 1 });
```

### 4. File uploads
Nếu có file uploads (images, documents):
- Local files trong `backend/uploads/` không được migrate
- Cần upload lại hoặc dùng Cloudinary (đã config)

---

## 🧪 Test sau khi migrate

### 1. Test đăng nhập
```
https://e-book-farm.vercel.app
```
- Đăng nhập bằng tài khoản từ local
- Nếu không đăng nhập được → Tạo tài khoản mới

### 2. Test schemas
- Vào **Quản lý mẫu form**
- Kiểm tra có các schemas: VietGAP, TCVN, etc.
- Nếu không có → Chạy scripts tạo schemas:
  ```bash
  node create-vietgap-shrimp-schema.js
  node create-tcvn-crop-schema.js
  node create-vietgahp-pig-schema.js
  node create-vietgahp-poultry-schema.js
  ```

### 3. Test journals
- Vào **Nhật ký sản xuất**
- Kiểm tra có journals từ local
- Thử tạo journal mới
- Test QR code

---

## 🔄 Nếu cần reset và import lại

### Xóa tất cả data trong Atlas:

```javascript
// Trong MongoDB Atlas shell
use Ebook-Farm
db.dropDatabase()
```

Sau đó chạy lại import.

---

## 📞 Troubleshooting

### Lỗi: "Authentication failed"
- Kiểm tra username/password trong connection string
- Kiểm tra IP whitelist trong MongoDB Atlas (phải có `0.0.0.0/0`)

### Lỗi: "Collection already exists"
- Script tự động skip collections đã có data
- Nếu muốn replace, xóa collection trong Atlas trước

### Lỗi: "Connection timeout"
- Kiểm tra internet connection
- Kiểm tra firewall/VPN

---

## 🎯 Tóm tắt nhanh

**Cách nhanh nhất:**
```bash
cd backend
node export-local-data.js
node import-to-atlas.js
```

**Kiểm tra:**
1. MongoDB Atlas dashboard → Browse Collections
2. Test app: https://e-book-farm.vercel.app
3. Đăng nhập và tạo journal

✅ **Xong!** Data đã được migrate lên production!
