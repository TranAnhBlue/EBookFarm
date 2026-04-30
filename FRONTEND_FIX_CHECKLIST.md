# ⚡ FRONTEND FIX - CHECKLIST NHANH

## ✅ Đã làm (tự động)
1. ✅ Tạo `frontend/vercel.json` cho SPA routing
2. ✅ Cập nhật `frontend/.env.production` với URLs đúng
3. ✅ Push lên GitHub
4. ⏳ Vercel đang redeploy frontend

---

## 🔧 BẠN CẦN LÀM (5 phút)

### Bước 1: Kiểm tra Environment Variables (2 phút)

1. Mở: https://vercel.com/dashboard
2. Chọn project **frontend** (e-book-farm)
3. Tab **Settings** → **Environment Variables**

**Kiểm tra có 2 biến này:**

```
VITE_API_URL = https://e-book-farm-backend.vercel.app/api
VITE_APP_URL = https://e-book-farm.vercel.app
```

**Nếu CHƯA có:**
- Click **Add New**
- Thêm từng biến
- Environment: Chọn **Production**, **Preview**, **Development**
- Click **Save**

### Bước 2: Redeploy (nếu đã thêm env vars) (1 phút)

1. Tab **Deployments**
2. Click **...** → **Redeploy**
3. Tắt **Use existing Build Cache**
4. Click **Redeploy**

### Bước 3: Đợi deployment (2 phút)

Đợi status **Ready** ✅

---

## 🧪 Test (2 phút)

### Test 1: Landing Page
```
https://e-book-farm.vercel.app
```
✅ Phải hiển thị landing page

### Test 2: Login
```
https://e-book-farm.vercel.app/login
```
✅ Phải hiển thị trang đăng nhập (KHÔNG còn 404)

### Test 3: Đăng nhập
- Email: (từ local)
- Password: (từ local)
✅ Phải đăng nhập được

### Test 4: Tạo Journal
- Vào "Nhật ký sản xuất"
- Tạo journal mới
✅ Phải tạo được

### Test 5: QR Code
- Click icon QR
- Quét bằng điện thoại
✅ Phải mở được trang truy xuất

---

## ✅ Nếu tất cả OK

🎉 **HOÀN THÀNH!** Hệ thống đã sẵn sàng!

**URLs:**
- Frontend: https://e-book-farm.vercel.app
- Backend: https://e-book-farm-backend.vercel.app

---

## ❌ Nếu vẫn lỗi

Cho tôi biết:
1. Screenshot lỗi
2. URL đang test
3. Đã thêm env vars chưa?
4. Đã redeploy chưa?

Tôi sẽ giúp debug!
