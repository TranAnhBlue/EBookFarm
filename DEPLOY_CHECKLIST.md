# ✅ CHECKLIST DEPLOY LÊN VERCEL

## 📝 BƯỚC 1: CHUẨN BỊ (5 phút)

- [ ] Tạo tài khoản GitHub: https://github.com
- [ ] Tạo tài khoản Vercel: https://vercel.com (dùng GitHub login)
- [ ] Tạo MongoDB Atlas: https://www.mongodb.com/cloud/atlas (Free tier)
  - Tạo cluster
  - Tạo database user
  - Whitelist IP: `0.0.0.0/0` (cho phép tất cả)
  - Copy connection string

---

## 📤 BƯỚC 2: PUSH CODE LÊN GITHUB (5 phút)

```bash
# 1. Khởi tạo Git
cd C:\EBookFarm
git init

# 2. Add files
git add .

# 3. Commit
git commit -m "Initial commit for Vercel deployment"

# 4. Tạo repo trên GitHub
# Truy cập: https://github.com/new
# Tên: ebookfarm
# Public hoặc Private
# KHÔNG chọn "Initialize with README"

# 5. Push code (thay YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ebookfarm.git
git branch -M main
git push -u origin main
```

---

## 🚀 BƯỚC 3: DEPLOY BACKEND (10 phút)

### 3.1. Import Project
- [ ] Truy cập: https://vercel.com/dashboard
- [ ] Click **Add New** → **Project**
- [ ] Chọn repo **ebookfarm**
- [ ] Click **Import**

### 3.2. Cấu hình
- [ ] **Framework Preset:** Other
- [ ] **Root Directory:** `backend`
- [ ] **Build Command:** (để trống)
- [ ] **Output Directory:** (để trống)
- [ ] **Install Command:** `npm install`

### 3.3. Environment Variables

Click **Environment Variables** và thêm từng dòng:

```
PORT=5000
```

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ebookfarm
```
⚠️ **Thay bằng connection string từ MongoDB Atlas**

```
JWT_SECRET=super_secret_ebookfarm_jwt_key_2026
```

```
GOOGLE_CLIENT_ID=your_google_client_id_here
```

```
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

```
GOOGLE_CALLBACK_URL=https://your-backend.vercel.app/api/auth/google/callback
```
⚠️ **Sẽ cập nhật sau khi có URL**

```
SERVER_URL=https://your-backend.vercel.app
```
⚠️ **Sẽ cập nhật sau khi có URL**

```
CLIENT_URL=https://your-frontend.vercel.app
```
⚠️ **Sẽ cập nhật sau khi deploy frontend**

```
EMAIL_HOST=smtp.gmail.com
```

```
EMAIL_PORT=587
```

```
EMAIL_USER=tranducanh220604@gmail.com
```

```
EMAIL_PASS=fgck gabs uqhs kane
```

```
FROM_NAME=Nhật ký sản xuất
```

```
FROM_EMAIL=noreply@ebookfarm.gov.vn
```

```
CLOUDINARY_URL=cloudinary://862141572453656:s-tS4gwmqXwekJQ8FZ-AfJX2tPc@djpnd5vb8
```

```
CLOUDINARY_CLOUD_NAME=djpnd5vb8
```

```
CLOUDINARY_API_KEY=862141572453656
```

```
CLOUDINARY_API_SECRET=s-tS4gwmqXwekJQ8FZ-AfJX2tPc
```

```
GEMINI_API_KEY=AIzaSyAnnmvwD_DiCir4yDQE2ct2HSPf3c04eh8
```

```
OPENAI_API_KEY=your_openai_api_key_here
```

```
GROQ_API_KEY=your_groq_api_key_here
```

```
XAI_API_KEY=your_xai_api_key_here
```

### 3.4. Deploy
- [ ] Click **Deploy**
- [ ] Đợi 2-3 phút
- [ ] **Copy Backend URL:** `https://ebookfarm-backend-xxx.vercel.app`

### 3.5. Cập nhật Environment Variables
- [ ] Quay lại **Settings** → **Environment Variables**
- [ ] Sửa `GOOGLE_CALLBACK_URL`: `https://[BACKEND_URL]/api/auth/google/callback`
- [ ] Sửa `SERVER_URL`: `https://[BACKEND_URL]`
- [ ] **Deployments** → Click **...** → **Redeploy**

---

## 🎨 BƯỚC 4: DEPLOY FRONTEND (10 phút)

### 4.1. Import Project (lần 2)
- [ ] Vercel Dashboard → **Add New** → **Project**
- [ ] Chọn repo **ebookfarm** (lần 2)
- [ ] Click **Import**

### 4.2. Cấu hình
- [ ] **Framework Preset:** Vite
- [ ] **Root Directory:** `frontend`
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `dist`
- [ ] **Install Command:** `npm install`

### 4.3. Environment Variables

```
VITE_API_URL=https://[BACKEND_URL]/api
```
⚠️ **Thay [BACKEND_URL] bằng URL backend từ Bước 3**

```
VITE_APP_URL=https://your-frontend.vercel.app
```
⚠️ **Sẽ cập nhật sau khi có URL**

### 4.4. Deploy
- [ ] Click **Deploy**
- [ ] Đợi 2-3 phút
- [ ] **Copy Frontend URL:** `https://ebookfarm-frontend-xxx.vercel.app`

### 4.5. Cập nhật Environment Variables
- [ ] Quay lại **Settings** → **Environment Variables**
- [ ] Sửa `VITE_APP_URL`: `https://[FRONTEND_URL]`
- [ ] **Deployments** → Click **...** → **Redeploy**

---

## 🔄 BƯỚC 5: CẬP NHẬT BACKEND (5 phút)

### 5.1. Cập nhật CLIENT_URL
- [ ] Vào Backend project trên Vercel
- [ ] **Settings** → **Environment Variables**
- [ ] Sửa `CLIENT_URL`: `https://[FRONTEND_URL]`
- [ ] **Deployments** → **Redeploy**

### 5.2. Cập nhật Google OAuth
- [ ] Truy cập: https://console.cloud.google.com
- [ ] **APIs & Services** → **Credentials**
- [ ] Chọn OAuth 2.0 Client ID
- [ ] **Authorized redirect URIs** → Thêm:
  ```
  https://[BACKEND_URL]/api/auth/google/callback
  ```
- [ ] **Authorized JavaScript origins** → Thêm:
  ```
  https://[FRONTEND_URL]
  ```
- [ ] **Save**

---

## ✅ BƯỚC 6: TEST (5 phút)

### Test Frontend
- [ ] Truy cập: `https://[FRONTEND_URL]`
- [ ] Landing page hiển thị đúng
- [ ] Đăng nhập hoạt động
- [ ] Tạo journal hoạt động

### Test QR Code
- [ ] Tạo journal mới
- [ ] Click icon QR
- [ ] URL phải là: `https://[FRONTEND_URL]/trace/...`
- [ ] Tải QR PNG
- [ ] Quét QR bằng điện thoại
- [ ] ✅ Trang truy xuất mở thành công!

### Test từ điện thoại
- [ ] Quét QR → Mở được (không cần cùng WiFi)
- [ ] Tra cứu trên landing page → Hoạt động
- [ ] Chia sẻ link cho bạn bè → Xem được

---

## 🎯 KẾT QUẢ

Sau khi hoàn thành:
- ✅ Backend: `https://ebookfarm-backend-xxx.vercel.app`
- ✅ Frontend: `https://ebookfarm-frontend-xxx.vercel.app`
- ✅ QR code hoạt động mọi nơi
- ✅ Miễn phí (Vercel Free tier)

---

## 🐛 NẾU CÓ LỖI

### Backend build failed
```bash
# Test build local
cd backend
npm install
npm start

# Nếu OK, check vercel.json
```

### Frontend build failed
```bash
# Test build local
cd frontend
npm install
npm run build

# Nếu lỗi, fix code rồi push lại
```

### CORS error
- Kiểm tra `CLIENT_URL` trong Backend env vars
- Kiểm tra CORS config trong `backend/src/server.js`
- Redeploy backend

### MongoDB connection error
- Kiểm tra `MONGO_URI` đúng format
- Kiểm tra IP whitelist: `0.0.0.0/0`
- Kiểm tra database user có quyền

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, cung cấp:
1. URL backend và frontend
2. Error message từ Vercel logs
3. Screenshot lỗi

Tôi sẽ giúp bạn debug!
