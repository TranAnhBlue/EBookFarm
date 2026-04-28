# 🚀 DEPLOY LÊN VERCEL - HƯỚNG DẪN CHI TIẾT

## 📋 Tổng quan
Deploy cả Frontend (React) và Backend (Node.js/Express) lên Vercel để QR code hoạt động mọi nơi.

---

## ⚡ PHẦN 1: CHUẨN BỊ

### Bước 1: Tạo tài khoản GitHub (nếu chưa có)
1. Truy cập: https://github.com
2. Sign up → Tạo tài khoản miễn phí

### Bước 2: Tạo tài khoản Vercel
1. Truy cập: https://vercel.com
2. Click **Sign Up**
3. Chọn **Continue with GitHub**
4. Authorize Vercel

### Bước 3: Cài Git (nếu chưa có)
```bash
# Kiểm tra đã có Git chưa
git --version

# Nếu chưa có, tải tại: https://git-scm.com/download/win
```

---

## 🔧 PHẦN 2: CHUẨN BỊ CODE

### Bước 1: Tạo file `.gitignore` (nếu chưa có)

**File: `.gitignore`** (ở root project)
```
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Environment variables
.env
.env.local
.env.production
backend/.env
frontend/.env.local

# Build
frontend/dist/
frontend/build/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### Bước 2: Tạo file `vercel.json` cho Backend

**File: `backend/vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Bước 3: Cập nhật `package.json` Backend

**File: `backend/package.json`**

Thêm/sửa phần `scripts`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "echo 'No build step required'"
  }
}
```

### Bước 4: Cập nhật CORS trong Backend

**File: `backend/src/server.js`**

Tìm phần CORS config và sửa:
```javascript
// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://your-frontend.vercel.app', // Sẽ cập nhật sau khi deploy frontend
    /\.vercel\.app$/ // Cho phép tất cả subdomain vercel.app
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Bước 5: Tạo file `.env.example` cho Backend

**File: `backend/.env.example`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ebookfarm
JWT_SECRET=your_jwt_secret_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend.vercel.app/api/auth/google/callback
SERVER_URL=https://your-backend.vercel.app
CLIENT_URL=https://your-frontend.vercel.app

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

CLOUDINARY_URL=your_cloudinary_url
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
XAI_API_KEY=your_xai_key
```

---

## 📤 PHẦN 3: PUSH CODE LÊN GITHUB

### Bước 1: Khởi tạo Git repository

```bash
# Di chuyển đến thư mục project
cd C:\EBookFarm

# Khởi tạo Git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit - Ready for Vercel deployment"
```

### Bước 2: Tạo repository trên GitHub

1. Truy cập: https://github.com/new
2. Repository name: `ebookfarm`
3. Chọn **Public** hoặc **Private**
4. **KHÔNG** chọn "Initialize with README"
5. Click **Create repository**

### Bước 3: Push code lên GitHub

```bash
# Thêm remote repository (thay YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ebookfarm.git

# Push code
git branch -M main
git push -u origin main
```

**Nhập username và password GitHub khi được hỏi**

---

## 🌐 PHẦN 4: DEPLOY BACKEND LÊN VERCEL

### Bước 1: Import Backend Project

1. Truy cập: https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Chọn repository **ebookfarm**
4. Click **Import**

### Bước 2: Cấu hình Backend

**Framework Preset:** Other
**Root Directory:** `backend`
**Build Command:** (để trống hoặc `npm install`)
**Output Directory:** (để trống)
**Install Command:** `npm install`

### Bước 3: Thêm Environment Variables

Click **Environment Variables** và thêm:

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ebookfarm
JWT_SECRET=super_secret_ebookfarm_jwt_key_2026

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://your-backend.vercel.app/api/auth/google/callback
SERVER_URL=https://your-backend.vercel.app
CLIENT_URL=https://your-frontend.vercel.app

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tranducanh220604@gmail.com
EMAIL_PASS=fgck gabs uqhs kane
FROM_NAME=Nhật ký sản xuất
FROM_EMAIL=noreply@ebookfarm.gov.vn

CLOUDINARY_URL=cloudinary://862141572453656:s-tS4gwmqXwekJQ8FZ-AfJX2tPc@djpnd5vb8
CLOUDINARY_CLOUD_NAME=djpnd5vb8
CLOUDINARY_API_KEY=862141572453656
CLOUDINARY_API_SECRET=s-tS4gwmqXwekJQ8FZ-AfJX2tPc

GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
XAI_API_KEY=your_xai_key
```

⚠️ **LƯU Ý:** Bạn cần MongoDB Atlas (cloud) thay vì localhost:
- Truy cập: https://www.mongodb.com/cloud/atlas
- Tạo cluster miễn phí
- Lấy connection string

### Bước 4: Deploy

Click **Deploy** → Đợi 2-3 phút

**Kết quả:** Backend URL: `https://ebookfarm-backend.vercel.app`

---

## 🎨 PHẦN 5: DEPLOY FRONTEND LÊN VERCEL

### Bước 1: Cập nhật API URL trong Frontend

**File: `frontend/src/services/api.js`**

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... rest of the code
```

### Bước 2: Tạo file `.env.production` cho Frontend

**File: `frontend/.env.production`**
```env
VITE_API_URL=https://ebookfarm-backend.vercel.app/api
VITE_APP_URL=https://ebookfarm-frontend.vercel.app
```

### Bước 3: Import Frontend Project

1. Vercel Dashboard → **Add New** → **Project**
2. Chọn repository **ebookfarm** (lần 2)
3. Click **Import**

### Bước 4: Cấu hình Frontend

**Framework Preset:** Vite
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### Bước 5: Thêm Environment Variables

```
VITE_API_URL=https://ebookfarm-backend.vercel.app/api
VITE_APP_URL=https://ebookfarm-frontend.vercel.app
```

⚠️ **Thay URL backend bằng URL thật từ Bước 4 phần Backend**

### Bước 6: Deploy

Click **Deploy** → Đợi 2-3 phút

**Kết quả:** Frontend URL: `https://ebookfarm-frontend.vercel.app`

---

## 🔄 PHẦN 6: CẬP NHẬT CORS VÀ CALLBACK URLs

### Bước 1: Cập nhật CORS Backend

Quay lại Backend project trên Vercel:
1. **Settings** → **Environment Variables**
2. Cập nhật:
   ```
   CLIENT_URL=https://ebookfarm-frontend.vercel.app
   GOOGLE_CALLBACK_URL=https://ebookfarm-backend.vercel.app/api/auth/google/callback
   ```
3. **Deployments** → Click **...** → **Redeploy**

### Bước 2: Cập nhật Google OAuth

1. Truy cập: https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. Chọn OAuth 2.0 Client ID
4. **Authorized redirect URIs** → Thêm:
   ```
   https://ebookfarm-backend.vercel.app/api/auth/google/callback
   ```
5. **Authorized JavaScript origins** → Thêm:
   ```
   https://ebookfarm-frontend.vercel.app
   ```
6. Save

---

## ✅ PHẦN 7: TEST DEPLOYMENT

### Test 1: Truy cập Frontend
```
https://ebookfarm-frontend.vercel.app
```
- ✅ Landing page hiển thị
- ✅ Đăng nhập hoạt động
- ✅ Tạo journal hoạt động

### Test 2: Test QR Code
1. Đăng nhập vào hệ thống
2. Tạo journal mới
3. Click icon QR
4. **Kiểm tra URL:**
   ```
   https://ebookfarm-frontend.vercel.app/trace/...
   ```
5. Tải QR PNG
6. Quét QR bằng điện thoại
7. ✅ Trang truy xuất mở thành công!

### Test 3: Test từ điện thoại
- Quét QR → Mở được từ mọi nơi (không cần cùng WiFi)
- Tra cứu trên landing page → Hoạt động
- Chia sẻ link → Bạn bè xem được

---

## 🎯 PHẦN 8: TÙY CHỈNH DOMAIN (Optional)

### Nếu bạn có domain riêng (ví dụ: ebookfarm.vn)

1. Vercel Dashboard → Frontend Project
2. **Settings** → **Domains**
3. Thêm domain: `ebookfarm.vn`
4. Cấu hình DNS theo hướng dẫn Vercel
5. Đợi DNS propagate (5-30 phút)

**Kết quả:** QR code sẽ chứa `https://ebookfarm.vn/trace/...`

---

## 🐛 TROUBLESHOOTING

### Lỗi 1: Build failed - Frontend
**Nguyên nhân:** Dependencies hoặc code lỗi

**Giải pháp:**
```bash
# Test build local trước
cd frontend
npm run build

# Nếu lỗi, fix code rồi push lại
git add .
git commit -m "Fix build errors"
git push
```

### Lỗi 2: Backend không kết nối MongoDB
**Nguyên nhân:** MongoDB URI sai hoặc dùng localhost

**Giải pháp:**
1. Tạo MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Lấy connection string: `mongodb+srv://...`
3. Cập nhật `MONGO_URI` trong Vercel Environment Variables
4. Redeploy

### Lỗi 3: CORS error
**Nguyên nhân:** Backend chưa cho phép frontend domain

**Giải pháp:**
- Kiểm tra `CLIENT_URL` trong Backend env vars
- Kiểm tra CORS config trong `backend/src/server.js`
- Redeploy backend

### Lỗi 4: Google Login không hoạt động
**Nguyên nhân:** Callback URL chưa cập nhật

**Giải pháp:**
1. Google Console → Credentials
2. Thêm redirect URI: `https://your-backend.vercel.app/api/auth/google/callback`
3. Cập nhật `GOOGLE_CALLBACK_URL` trong Vercel
4. Redeploy

---

## 📋 CHECKLIST DEPLOYMENT

### Chuẩn bị:
- [ ] Tạo tài khoản GitHub
- [ ] Tạo tài khoản Vercel
- [ ] Tạo MongoDB Atlas cluster
- [ ] Cài Git trên máy

### Backend:
- [ ] Tạo `backend/vercel.json`
- [ ] Cập nhật CORS config
- [ ] Push code lên GitHub
- [ ] Deploy backend lên Vercel
- [ ] Thêm Environment Variables
- [ ] Test API endpoint

### Frontend:
- [ ] Cập nhật `api.js` để dùng env vars
- [ ] Tạo `.env.production`
- [ ] Deploy frontend lên Vercel
- [ ] Thêm Environment Variables
- [ ] Test truy cập trang

### Tích hợp:
- [ ] Cập nhật CORS với frontend URL
- [ ] Cập nhật Google OAuth redirect URIs
- [ ] Test đăng nhập
- [ ] Test tạo journal
- [ ] Test QR code
- [ ] Quét QR bằng điện thoại

---

## 🎉 KẾT QUẢ

Sau khi deploy xong:
- ✅ Frontend: `https://ebookfarm-frontend.vercel.app`
- ✅ Backend: `https://ebookfarm-backend.vercel.app`
- ✅ QR code hoạt động mọi nơi
- ✅ Không cần cùng WiFi
- ✅ Chia sẻ được với mọi người
- ✅ Miễn phí (Vercel Free tier)

**Thời gian deploy:** 30-60 phút (lần đầu)
**Chi phí:** $0 (Free tier đủ dùng)
