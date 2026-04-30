# 🔐 SETUP GOOGLE OAUTH CHO PRODUCTION

## 🐛 Vấn đề hiện tại

Google Login không hoạt động vì:
1. ❌ Authorized redirect URIs chưa có production URLs
2. ❌ Authorized JavaScript origins chưa có production URLs
3. ❌ Popup bị chặn bởi browser

---

## ✅ BƯỚC 1: Cập nhật Google Cloud Console (5 phút)

### 1.1. Truy cập Google Cloud Console

1. Mở: https://console.cloud.google.com
2. Đăng nhập bằng tài khoản Google của bạn
3. Chọn project (hoặc tạo mới nếu chưa có)

### 1.2. Vào Credentials

1. Menu bên trái → **APIs & Services**
2. Click **Credentials**
3. Tìm OAuth 2.0 Client ID đang dùng
4. Click vào để edit

### 1.3. Thêm Authorized JavaScript origins

Trong phần **Authorized JavaScript origins**, thêm:

```
https://e-book-farm.vercel.app
```

Click **+ ADD URI** nếu cần thêm nhiều:
```
https://e-book-farm.vercel.app
http://localhost:5173
http://localhost:5174
```

### 1.4. Thêm Authorized redirect URIs

Trong phần **Authorized redirect URIs**, thêm:

```
https://e-book-farm-backend.vercel.app/api/auth/google/callback
```

Click **+ ADD URI** nếu cần thêm nhiều:
```
https://e-book-farm-backend.vercel.app/api/auth/google/callback
http://localhost:5000/api/auth/google/callback
```

### 1.5. Save

Click **SAVE** ở cuối trang

---

## ✅ BƯỚC 2: Kiểm tra Backend Environment Variables

### 2.1. Truy cập Vercel Backend

1. Mở: https://vercel.com/dashboard
2. Chọn project **backend** (e-book-farm-backend)
3. Tab **Settings** → **Environment Variables**

### 2.2. Kiểm tra các biến sau

#### GOOGLE_CLIENT_ID
```
Your Google Client ID
```

#### GOOGLE_CLIENT_SECRET
```
Your Google Client Secret
```

#### GOOGLE_CALLBACK_URL
```
https://e-book-farm-backend.vercel.app/api/auth/google/callback
```

#### CLIENT_URL
```
https://e-book-farm.vercel.app
```

#### SERVER_URL
```
https://e-book-farm-backend.vercel.app
```

### 2.3. Nếu sai, sửa lại

1. Click vào biến cần sửa
2. Click **Edit**
3. Sửa value
4. Click **Save**

### 2.4. Redeploy Backend

Sau khi sửa env vars:
1. Tab **Deployments**
2. Click **...** → **Redeploy**
3. Click **Redeploy**

---

## ✅ BƯỚC 3: Kiểm tra Frontend Code

### 3.1. Kiểm tra Login.jsx

File: `frontend/src/pages/Auth/Login.jsx`

Đảm bảo Google Login button gọi đúng API:

```javascript
const handleGoogleLogin = () => {
  // Redirect to backend Google OAuth
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
};
```

### 3.2. Kiểm tra .env.production

File: `frontend/.env.production`

```env
VITE_API_URL=https://e-book-farm-backend.vercel.app/api
VITE_APP_URL=https://e-book-farm.vercel.app
```

---

## 🧪 BƯỚC 4: Test Google Login

### 4.1. Clear Browser Cache

1. Mở DevTools (F12)
2. Right-click vào Refresh button
3. Chọn **Empty Cache and Hard Reload**

### 4.2. Test Login

1. Mở: https://e-book-farm.vercel.app/login
2. Click **Đăng nhập với Google**
3. Chọn tài khoản Google
4. Cho phép quyền truy cập
5. ✅ Redirect về dashboard

---

## ❌ Troubleshooting

### Lỗi: "Popup blocked by the browser"

**Giải pháp:**
1. Cho phép popup cho domain `e-book-farm.vercel.app`
2. Hoặc sửa code để dùng redirect thay vì popup

**Sửa code (nếu cần):**

File: `frontend/src/pages/Auth/Login.jsx`

```javascript
// Thay vì dùng popup, dùng redirect
const handleGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
};
```

### Lỗi: "redirect_uri_mismatch"

**Nguyên nhân:** Redirect URI không khớp với Google Console

**Giải pháp:**
1. Copy chính xác URL từ error message
2. Thêm vào Google Console → Authorized redirect URIs
3. Save và đợi vài phút

### Lỗi: "Access blocked: This app's request is invalid"

**Nguyên nhân:** JavaScript origin không được authorize

**Giải pháp:**
1. Thêm `https://e-book-farm.vercel.app` vào Authorized JavaScript origins
2. Save và đợi vài phút

### Lỗi: "Invalid client"

**Nguyên nhân:** GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET sai

**Giải pháp:**
1. Kiểm tra lại trong Google Console
2. Copy lại Client ID và Client Secret
3. Cập nhật trong Vercel backend env vars
4. Redeploy backend

---

## 📋 Checklist

- [ ] Thêm production URLs vào Google Console
  - [ ] Authorized JavaScript origins: `https://e-book-farm.vercel.app`
  - [ ] Authorized redirect URIs: `https://e-book-farm-backend.vercel.app/api/auth/google/callback`
- [ ] Kiểm tra backend env vars
  - [ ] GOOGLE_CLIENT_ID
  - [ ] GOOGLE_CLIENT_SECRET
  - [ ] GOOGLE_CALLBACK_URL
  - [ ] CLIENT_URL
  - [ ] SERVER_URL
- [ ] Redeploy backend (nếu sửa env vars)
- [ ] Clear browser cache
- [ ] Test Google Login
- [ ] ✅ Đăng nhập thành công!

---

## 🎯 Tóm tắt

**Vấn đề:** Google Login không hoạt động  
**Nguyên nhân:** Chưa config production URLs trong Google Console  
**Giải pháp:**
1. Thêm production URLs vào Google Console
2. Kiểm tra backend env vars
3. Redeploy backend
4. Test lại

**Thời gian:** ~5-10 phút

---

## 📞 Nếu cần hỗ trợ

Cho tôi biết:
1. Screenshot error từ Console
2. Đã thêm URLs vào Google Console chưa?
3. Backend env vars có đúng không?
4. Đã redeploy backend chưa?

Tôi sẽ giúp debug!
