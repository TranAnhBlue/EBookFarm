# 🔍 TEST KẾT NỐI MẠNG - DEBUG QR CODE

## ✅ Đã fix code
- ✅ `JournalList.jsx` - Đọc từ `VITE_APP_URL`
- ✅ `AdminJournalMgmt.jsx` - Đọc từ `VITE_APP_URL`
- ✅ `vite.config.js` - Thêm `host: '0.0.0.0'`
- ✅ `.env.local` - Có IP: `192.168.1.103`

---

## 🧪 BƯỚC 1: Kiểm tra Frontend đã khởi động đúng chưa

### Khởi động lại Frontend:
```bash
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

### Kiểm tra output PHẢI có:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.103:5173/  ← PHẢI CÓ DÒNG NÀY!
```

⚠️ **Nếu KHÔNG có dòng "Network:"** → Vite config chưa đúng

---

## 🧪 BƯỚC 2: Test truy cập từ điện thoại

### Test 1: Mở browser trên điện thoại
1. Mở **Chrome** hoặc **Safari** trên điện thoại
2. Nhập: `http://192.168.1.103:5173`
3. Xem có mở được không?

**Kết quả mong đợi:**
- ✅ Trang landing page hiển thị
- ❌ Không mở được → Có vấn đề về network

### Test 2: Ping từ điện thoại
1. Tải app **Ping Tools** (Android) hoặc **Network Analyzer** (iOS)
2. Ping địa chỉ: `192.168.1.103`
3. Xem có phản hồi không?

**Kết quả mong đợi:**
- ✅ Có phản hồi (Reply) → Network OK
- ❌ Timeout → Firewall hoặc không cùng mạng

---

## 🧪 BƯỚC 3: Kiểm tra QR code có đúng URL không

### Trên máy tính:
1. Truy cập: http://192.168.1.103:5173/login
2. Đăng nhập: `farmer@gmail.com` / `123`
3. Vào "Danh sách sổ nhật ký"
4. Click icon QR (🔍)
5. **Kiểm tra URL trong modal:**

**URL phải là:**
```
http://192.168.1.103:5173/trace/1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7
```

**KHÔNG PHẢI:**
```
http://localhost:5173/trace/...  ← SAI!
```

### Nếu vẫn là localhost:
```bash
# 1. Xóa cache browser
Ctrl + Shift + Delete → Clear cache

# 2. Hard refresh
Ctrl + Shift + R

# 3. Kiểm tra .env.local
cat frontend/.env.local
# Phải có: VITE_APP_URL=http://192.168.1.103:5173

# 4. Khởi động lại frontend
cd frontend
npm run dev
```

---

## 🧪 BƯỚC 4: Test QR code thủ công

### Không dùng camera, test bằng cách:

1. **Copy URL từ modal QR**
   - URL: `http://192.168.1.103:5173/trace/1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7`

2. **Gửi URL qua Zalo/Messenger cho chính mình**

3. **Mở link trên điện thoại**
   - Click vào link trong Zalo/Messenger
   - Xem có mở được trang truy xuất không?

**Kết quả:**
- ✅ Mở được → QR code sẽ hoạt động
- ❌ Không mở được → Vấn đề về network/firewall

---

## 🧪 BƯỚC 5: Kiểm tra Firewall

### Windows Firewall có thể chặn kết nối từ mạng LAN

**Tắt tạm thời để test:**
1. Mở **Control Panel**
2. **Windows Defender Firewall**
3. **Turn Windows Defender Firewall on or off**
4. Chọn **Turn off** cho cả Private và Public
5. Test lại

**Hoặc thêm rule cho phép:**
1. **Windows Defender Firewall** → **Advanced settings**
2. **Inbound Rules** → **New Rule**
3. **Port** → **TCP** → **5173**
4. **Allow the connection**
5. Áp dụng cho **Private** network

---

## 🧪 BƯỚC 6: Kiểm tra cùng WiFi

### Trên máy tính:
```bash
ipconfig
```
Tìm dòng:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.103
```

### Trên điện thoại:
- **Settings** → **WiFi**
- Xem tên WiFi và IP
- Ví dụ: `192.168.1.150`

**Kiểm tra:**
- ✅ Cùng dải IP (192.168.1.x) → OK
- ❌ Khác dải (192.168.0.x vs 192.168.1.x) → Không cùng mạng

---

## 🐛 Các lỗi thường gặp

### Lỗi 1: QR vẫn chứa localhost
**Nguyên nhân:** Code chưa đọc `.env.local`

**Giải pháp:**
```bash
# 1. Kiểm tra file .env.local
cat frontend/.env.local

# 2. Phải có dòng này:
VITE_APP_URL=http://192.168.1.103:5173

# 3. Khởi động lại frontend
cd frontend
npm run dev

# 4. Hard refresh browser
Ctrl + Shift + R
```

### Lỗi 2: Điện thoại không truy cập được IP
**Nguyên nhân:** Firewall chặn hoặc không cùng WiFi

**Giải pháp:**
```bash
# 1. Kiểm tra cùng WiFi
# Máy tính và điện thoại phải cùng tên WiFi

# 2. Tắt Firewall tạm thời
# Control Panel → Windows Defender Firewall → Turn off

# 3. Test ping từ điện thoại
# Dùng app Ping Tools → Ping 192.168.1.103
```

### Lỗi 3: Quét QR không mở link
**Nguyên nhân:** Camera không nhận diện QR hoặc QR bị mờ

**Giải pháp:**
```bash
# 1. Tăng kích thước QR
# Trong modal, QR đã là 280x280px

# 2. Tăng độ sáng màn hình
# Để QR rõ hơn

# 3. Thử quét bằng app khác
# Zalo → Khám phá → QR Code
# Google Lens
```

---

## ✅ Checklist Debug

### Network:
- [ ] Frontend output có dòng "Network: http://192.168.1.103:5173/"
- [ ] Điện thoại truy cập được `http://192.168.1.103:5173` bằng browser
- [ ] Máy tính và điện thoại cùng WiFi (cùng dải IP 192.168.1.x)
- [ ] Firewall đã tắt hoặc có rule cho phép port 5173

### Code:
- [ ] File `.env.local` có `VITE_APP_URL=http://192.168.1.103:5173`
- [ ] Frontend đã khởi động lại sau khi tạo `.env.local`
- [ ] Browser đã hard refresh (Ctrl+Shift+R)
- [ ] QR code URL là `http://192.168.1.103:5173/trace/...` (không phải localhost)

### QR Code:
- [ ] Modal QR hiển thị URL đúng (có IP, không phải localhost)
- [ ] Copy URL và gửi qua Zalo → Click link → Mở được trang
- [ ] Quét QR bằng camera → Hiện notification với link
- [ ] Click notification → Mở được trang truy xuất

---

## 🎯 Nếu tất cả đều OK nhưng vẫn không quét được

### Thử phương án cuối:

**1. Dùng ngrok (Tạo URL public tạm thời):**
```bash
# Cài ngrok: https://ngrok.com/download
ngrok http 5173
```
Output:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5173
```

Cập nhật `.env.local`:
```env
VITE_APP_URL=https://abc123.ngrok.io
```

Khởi động lại frontend → QR sẽ chứa link ngrok → Quét được từ mọi nơi!

**2. Deploy lên Vercel (Production):**
```bash
# Push code lên GitHub
git add .
git commit -m "Add QR feature"
git push

# Deploy lên Vercel
# https://vercel.com → Import repo → Deploy
# Nhận domain: https://your-app.vercel.app
```

---

## 📞 Nếu vẫn không được

Hãy cho tôi biết:
1. Output của `npm run dev` (có dòng Network không?)
2. Điện thoại mở `http://192.168.1.103:5173` có được không?
3. QR code URL là gì? (localhost hay IP?)
4. Lỗi gì khi quét QR? (không nhận diện hay không mở link?)
