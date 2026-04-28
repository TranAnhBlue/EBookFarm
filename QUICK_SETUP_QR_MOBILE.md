# 🚀 SETUP NHANH: QR CODE CHO ĐIỆN THOẠI

## ⚡ 3 Bước để QR hoạt động trên điện thoại

### Bước 1: Lấy IP máy tính (30 giây)

**Windows - Mở CMD (Win+R → cmd):**
```bash
ipconfig
```
Tìm dòng `IPv4 Address` → Ví dụ: **192.168.1.100**

**Mac - Mở Terminal:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Ghi lại IP này:** `192.168.1.100` (ví dụ)

---

### Bước 2: Tạo file .env.local (1 phút)

**File: `frontend/.env.local`** (tạo mới)
```env
VITE_APP_URL=http://192.168.1.100:5173
```
⚠️ **Thay `192.168.1.100` bằng IP của bạn ở Bước 1**

---

### Bước 3: Khởi động lại Frontend (30 giây)

```bash
# Stop frontend (Ctrl+C nếu đang chạy)
cd frontend
npm run dev
```

**Kiểm tra output:**
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/  ← Phải có dòng này!
```

✅ **Xong!** Bây giờ QR code sẽ chứa IP thay vì localhost.

---

## 📱 Test ngay

### 1. Trên máy tính:
- Truy cập: http://192.168.1.100:5173 (thay IP của bạn)
- Đăng nhập: `farmer@gmail.com` / `123`
- Vào "Danh sách sổ nhật ký"
- Click icon QR (🔍) trên bất kỳ journal nào
- Click "Tải PNG (In tem)"

### 2. Trên điện thoại:
- **Đảm bảo cùng WiFi với máy tính**
- Mở Camera
- Quét QR code trên màn hình máy tính
- Tap vào notification
- ✅ Trang truy xuất sẽ mở!

---

## 🐛 Nếu không hoạt động

### Lỗi 1: Điện thoại không quét được
**Kiểm tra:**
- [ ] Điện thoại và máy tính **cùng WiFi** (quan trọng!)
- [ ] QR code rõ nét (không bị mờ)
- [ ] Ánh sáng đủ

### Lỗi 2: Quét được nhưng không mở trang
**Kiểm tra:**
- [ ] File `.env.local` đã tạo đúng chưa?
- [ ] IP trong `.env.local` đúng chưa?
- [ ] Frontend đã khởi động lại chưa?
- [ ] Output có dòng "Network: http://192.168.x.x:5173/" chưa?

### Lỗi 3: Trang mở nhưng lỗi "Cannot connect"
**Kiểm tra:**
- [ ] Backend có đang chạy không? (port 5000)
- [ ] Firewall có chặn không? (tắt tạm thời để test)

---

## 🎯 Checklist hoàn chỉnh

- [ ] Lấy IP máy tính: `ipconfig` (Windows) hoặc `ifconfig` (Mac)
- [ ] Tạo file `frontend/.env.local` với IP của bạn
- [ ] Khởi động lại frontend: `npm run dev`
- [ ] Kiểm tra output có dòng "Network: http://..."
- [ ] Điện thoại và máy tính cùng WiFi
- [ ] Truy cập `http://[IP]:5173` từ điện thoại để test
- [ ] Tạo QR code mới
- [ ] Quét QR bằng camera điện thoại
- [ ] Trang truy xuất mở thành công

---

## 💡 Lưu ý

**Development (Test):**
- Dùng IP máy tính: `http://192.168.1.100:5173`
- Chỉ hoạt động trong mạng LAN (cùng WiFi)
- Mỗi lần đổi WiFi phải cập nhật IP mới

**Production (Thật):**
- Deploy lên server: `https://ebookfarm.vn`
- QR hoạt động mọi nơi, không cần cùng WiFi
- Khuyến nghị cho môi trường thực tế

---

## 🚀 Nếu muốn deploy Production

### Option 1: Vercel (Miễn phí, 5 phút)
```bash
# 1. Push code lên GitHub
git add .
git commit -m "Add QR traceability"
git push

# 2. Truy cập vercel.com
# 3. Import repository
# 4. Deploy → Nhận domain: https://your-app.vercel.app
```

### Option 2: VPS (Chuyên nghiệp)
- Thuê VPS (DigitalOcean, AWS, etc.)
- Cài Nginx + Node.js + MongoDB
- Deploy backend + frontend
- Cấu hình domain: `https://ebookfarm.vn`

---

## ✅ Kết quả mong đợi

Sau khi setup xong:
- ✅ QR code chứa IP thay vì localhost
- ✅ Điện thoại quét được QR
- ✅ Trang truy xuất mở thành công
- ✅ Hiển thị đầy đủ thông tin sản phẩm
- ✅ View count tăng mỗi lần quét

**Thời gian setup:** < 5 phút
**Độ khó:** ⭐⭐☆☆☆ (Dễ)
