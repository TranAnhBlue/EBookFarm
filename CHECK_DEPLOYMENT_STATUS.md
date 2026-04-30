# 🔍 KIỂM TRA TRẠNG THÁI DEPLOYMENT

## ✅ Đã thực hiện

1. ✅ Downgrade uuid từ v13 → v9 (CommonJS compatible)
2. ✅ Xóa node_modules và cài đặt lại sạch
3. ✅ Test local thành công
4. ✅ Xóa các file chứa API keys nhạy cảm
5. ✅ Push code lên GitHub
6. ⏳ Vercel đang tự động rebuild backend

---

## 📊 BƯỚC 1: Kiểm tra Vercel Deployment

### Truy cập Vercel Dashboard
1. Mở: https://vercel.com/dashboard
2. Chọn project **backend** (e-book-farm-backend)
3. Xem tab **Deployments**

### Tìm deployment mới nhất
- Commit message: "Force rebuild: clean install with uuid v9 and updated dependencies"
- Thời gian: Vừa mới (trong vài phút gần đây)
- Status: 
  - 🟡 **Building** - Đang build (đợi 2-3 phút)
  - ✅ **Ready** - Build thành công!
  - ❌ **Error** - Build thất bại (xem logs)

---

## 🧪 BƯỚC 2: Test Backend API

### Sau khi status là **Ready** ✅

#### Test 1: Health Check
Mở trình duyệt hoặc dùng curl:
```
https://e-book-farm-backend.vercel.app/
```

**Kết quả mong đợi:**
```
EBook Farm API is running.
```

#### Test 2: API Endpoint
```
https://e-book-farm-backend.vercel.app/api/schemas
```

**Kết quả mong đợi:**
- JSON response (có thể là lỗi auth nhưng KHÔNG phải 500 error)
- Không còn thấy "This Serverless Function has crashed"

---

## 🎨 BƯỚC 3: Test Frontend

### Truy cập Frontend
```
https://e-book-farm.vercel.app
```

### Test đăng nhập
1. Click **Đăng nhập**
2. Nhập email/password
3. Nếu đăng nhập được → Backend hoạt động! ✅

### Test tạo journal
1. Sau khi đăng nhập
2. Vào **Nhật ký sản xuất**
3. Tạo journal mới
4. Nếu tạo được → Backend API hoạt động hoàn toàn! ✅

---

## 📱 BƯỚC 4: Test QR Code

### Tạo QR Code
1. Đăng nhập vào frontend
2. Tạo journal mới (hoặc chọn journal có sẵn)
3. Click icon QR code
4. Kiểm tra URL trong modal: phải là `https://e-book-farm.vercel.app/trace/...`

### Tải QR Code
1. Click **Tải QR PNG**
2. Lưu file về máy

### Quét QR Code
1. Mở camera điện thoại
2. Quét QR code vừa tải
3. ✅ Trang truy xuất phải mở được!
4. ✅ Không cần cùng WiFi với máy tính

### Test tra cứu
1. Vào landing page: https://e-book-farm.vercel.app
2. Scroll xuống phần "Tra cứu nguồn gốc"
3. Nhập mã QR (ví dụ: `abc123...`)
4. Click **Tra cứu**
5. ✅ Thông tin sản phẩm hiển thị

---

## ❌ NẾU VẪN LỖI

### Lỗi: "This Serverless Function has crashed"

#### Bước 1: Xem Logs
1. Vercel Dashboard → Backend project
2. Tab **Deployments** → Click deployment mới nhất
3. Tab **Functions** → Click function
4. Xem **Logs** để tìm lỗi cụ thể

#### Bước 2: Kiểm tra Environment Variables
1. Vercel Dashboard → Backend project
2. Tab **Settings** → **Environment Variables**
3. Đảm bảo có đủ các biến:
   - ✅ `MONGO_URI` - MongoDB connection string
   - ✅ `JWT_SECRET` - Secret key
   - ✅ `CLIENT_URL` - Frontend URL
   - ✅ `GOOGLE_CLIENT_ID` - Google OAuth ID
   - ✅ `GOOGLE_CLIENT_SECRET` - Google OAuth Secret
   - ✅ `GEMINI_API_KEY` - Gemini API key

#### Bước 3: Force Redeploy
1. Tab **Deployments**
2. Click **...** bên cạnh deployment mới nhất
3. Click **Redeploy**
4. Chọn **Use existing Build Cache** = OFF
5. Click **Redeploy**

---

## 🐛 Các lỗi thường gặp

### 1. MongoDB Connection Error
**Triệu chứng:** Lỗi "MongooseError: ..."

**Giải pháp:**
- Kiểm tra `MONGO_URI` đúng format
- Kiểm tra MongoDB Atlas:
  - Network Access → IP Whitelist: `0.0.0.0/0`
  - Database Access → User có quyền đọc/ghi

### 2. CORS Error
**Triệu chứng:** Frontend không gọi được API

**Giải pháp:**
- Kiểm tra `CLIENT_URL` trong backend env vars
- Phải là: `https://e-book-farm.vercel.app`
- Redeploy backend sau khi sửa

### 3. Google OAuth Error
**Triệu chứng:** Đăng nhập Google không hoạt động

**Giải pháp:**
- Truy cập: https://console.cloud.google.com
- APIs & Services → Credentials
- Thêm Authorized redirect URIs:
  ```
  https://e-book-farm-backend.vercel.app/api/auth/google/callback
  ```
- Thêm Authorized JavaScript origins:
  ```
  https://e-book-farm.vercel.app
  ```

---

## 📞 Cần hỗ trợ?

Nếu vẫn gặp lỗi, cung cấp:
1. ✅ Screenshot Vercel deployment status
2. ✅ Screenshot error message từ Vercel logs
3. ✅ Screenshot lỗi trên trình duyệt (F12 → Console)
4. ✅ URL backend và frontend

Tôi sẽ giúp bạn debug chi tiết!

---

## 🎯 Checklist cuối cùng

Sau khi mọi thứ hoạt động:

- [ ] Backend deploy thành công (status Ready)
- [ ] Frontend mở được
- [ ] Đăng nhập hoạt động
- [ ] Tạo journal hoạt động
- [ ] QR code tạo được
- [ ] QR code quét được từ điện thoại
- [ ] Tra cứu trên landing page hoạt động
- [ ] Chia sẻ link cho người khác xem được

✅ **Hoàn thành!** Hệ thống đã sẵn sàng sử dụng!
