# 🔧 FIX FRONTEND DEPLOYMENT

## 🐛 Vấn đề

Frontend đang bị lỗi **404 NOT_FOUND** khi truy cập `/login` và các routes khác.

**Nguyên nhân:**
1. ❌ Vercel.json chưa có config cho SPA routing
2. ❌ Environment variables chưa được set đúng trên Vercel
3. ❌ Frontend chưa biết backend URL

---

## ✅ Đã fix

### 1. Tạo `frontend/vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Giải thích:** 
- React Router sử dụng client-side routing
- Tất cả routes phải redirect về `index.html`
- React Router sẽ xử lý routing

### 2. Cập nhật `frontend/.env.production`
```env
VITE_API_URL=https://e-book-farm-backend.vercel.app/api
VITE_APP_URL=https://e-book-farm.vercel.app
```

### 3. Push lên GitHub
- Vercel sẽ tự động redeploy frontend
- Đợi 2-3 phút

---

## 🔍 Kiểm tra Environment Variables trên Vercel

### Bước 1: Truy cập Vercel Dashboard
1. Mở: https://vercel.com/dashboard
2. Chọn project **frontend** (e-book-farm)
3. Click tab **Settings**
4. Click **Environment Variables**

### Bước 2: Kiểm tra có 2 biến này chưa

#### VITE_API_URL
```
https://e-book-farm-backend.vercel.app/api
```

#### VITE_APP_URL
```
https://e-book-farm.vercel.app
```

### Bước 3: Nếu chưa có, thêm vào

1. Click **Add New**
2. **Key:** `VITE_API_URL`
3. **Value:** `https://e-book-farm-backend.vercel.app/api`
4. **Environment:** Chọn **Production**, **Preview**, **Development**
5. Click **Save**

6. Click **Add New** lần nữa
7. **Key:** `VITE_APP_URL`
8. **Value:** `https://e-book-farm.vercel.app`
9. **Environment:** Chọn **Production**, **Preview**, **Development**
10. Click **Save**

### Bước 4: Redeploy

Sau khi thêm env vars:
1. Vào tab **Deployments**
2. Click **...** bên cạnh deployment mới nhất
3. Click **Redeploy**
4. Chọn **Use existing Build Cache** = OFF
5. Click **Redeploy**

---

## 🧪 Test sau khi redeploy

### Test 1: Landing Page
```
https://e-book-farm.vercel.app
```

**Thành công:** Landing page hiển thị đúng

### Test 2: Login Page
```
https://e-book-farm.vercel.app/login
```

**Thành công:** Trang đăng nhập hiển thị (không còn 404)

### Test 3: Đăng nhập
1. Nhập email/password từ local
2. Click **Đăng nhập**
3. **Thành công:** Redirect về dashboard

### Test 4: Tạo Journal
1. Vào **Nhật ký sản xuất**
2. Click **Tạo nhật ký mới**
3. Chọn schema
4. Điền thông tin
5. Click **Lưu**
6. **Thành công:** Journal được tạo

### Test 5: QR Code
1. Mở journal vừa tạo
2. Click icon QR
3. Kiểm tra URL: `https://e-book-farm.vercel.app/trace/...`
4. Tải QR PNG
5. Quét bằng điện thoại
6. **Thành công:** Trang truy xuất mở được

---

## ❌ Nếu vẫn lỗi

### Lỗi: Vẫn 404 NOT_FOUND

**Kiểm tra:**
1. Vercel.json đã được deploy chưa?
   - Xem trong Vercel dashboard → Source
   - Phải có file `vercel.json`

2. Redeploy lại:
   - Tab Deployments → Redeploy
   - Tắt Build Cache

### Lỗi: Cannot connect to backend

**Kiểm tra:**
1. Environment variables đã set đúng chưa?
   - `VITE_API_URL` phải có `/api` ở cuối
   - Không có trailing slash

2. Backend có hoạt động không?
   - Test: https://e-book-farm-backend.vercel.app/
   - Phải thấy: "EBook Farm API is running."

3. CORS có được config đúng không?
   - Backend phải allow origin từ frontend
   - Kiểm tra `CLIENT_URL` trong backend env vars

### Lỗi: Đăng nhập không được

**Kiểm tra:**
1. MongoDB Atlas có data chưa?
   - Vào MongoDB Atlas dashboard
   - Browse Collections
   - Kiểm tra collection `users`

2. Backend có kết nối được MongoDB không?
   - Xem Vercel logs của backend
   - Tìm "MongoDB connection SUCCESS"

---

## 📝 Checklist

Sau khi fix:

- [ ] Frontend deploy thành công
- [ ] Landing page mở được
- [ ] Login page mở được (không còn 404)
- [ ] Đăng nhập hoạt động
- [ ] Dashboard hiển thị
- [ ] Tạo journal hoạt động
- [ ] QR code tạo được
- [ ] QR code quét được từ điện thoại
- [ ] Tra cứu trên landing page hoạt động

---

## 🎯 Tóm tắt

**Vấn đề:** Frontend 404 NOT_FOUND  
**Nguyên nhân:** Thiếu vercel.json và env vars  
**Giải pháp:**
1. ✅ Thêm `frontend/vercel.json` cho SPA routing
2. ✅ Cập nhật `frontend/.env.production`
3. ✅ Push lên GitHub
4. ⏳ Đợi Vercel redeploy (2-3 phút)
5. ✅ Kiểm tra env vars trên Vercel dashboard
6. ✅ Redeploy nếu cần

**Trạng thái:** ⏳ Đang đợi Vercel redeploy frontend
