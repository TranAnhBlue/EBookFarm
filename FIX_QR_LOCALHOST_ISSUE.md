# 🔧 FIX: QR CODE KHÔNG QUÉT ĐƯỢC DO LOCALHOST

## ❌ Vấn đề
QR code chứa link `http://localhost:5173/trace/...` → Điện thoại không thể truy cập `localhost` của máy tính.

---

## ✅ Giải pháp 1: Dùng IP máy tính (Nhanh - Test ngay)

### Bước 1: Lấy địa chỉ IP máy tính

**Windows:**
```bash
ipconfig
```
Tìm dòng `IPv4 Address` → Ví dụ: `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig | grep inet
```

### Bước 2: Cấu hình Vite để accept connections từ mạng LAN

**File: `frontend/vite.config.js`**

Thêm cấu hình `server`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ mạng LAN
    port: 5173,
  }
})
```

### Bước 3: Khởi động lại Frontend

```bash
cd frontend
npm run dev
```

Bạn sẽ thấy output:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/  ← Dùng link này
```

### Bước 4: Cập nhật code tạo QR

**File: `frontend/src/pages/Journal/JournalList.jsx`**

Tìm dòng:
```javascript
setCurrentQr(`${window.location.origin}/trace/${record.qrCode}`);
```

Thay bằng:
```javascript
// Tự động dùng IP hiện tại thay vì localhost
const baseUrl = window.location.origin.replace('localhost', window.location.hostname);
setCurrentQr(`${baseUrl}/trace/${record.qrCode}`);
```

### Bước 5: Test

1. Đảm bảo điện thoại và máy tính **cùng mạng WiFi**
2. Trên máy tính: Truy cập `http://192.168.1.100:5173` (thay IP của bạn)
3. Tạo QR code mới
4. Quét QR bằng điện thoại → Sẽ mở được!

---

## ✅ Giải pháp 2: Dùng biến môi trường (Chuyên nghiệp)

### Bước 1: Tạo file `.env` trong frontend

**File: `frontend/.env.local`**
```env
VITE_APP_URL=http://192.168.1.100:5173
VITE_API_URL=http://192.168.1.100:5000
```

### Bước 2: Cập nhật code

**File: `frontend/src/pages/Journal/JournalList.jsx`**
```javascript
// Dùng biến môi trường
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

// Khi tạo QR
setCurrentQr(`${APP_URL}/trace/${record.qrCode}`);
```

### Bước 3: Khởi động lại

```bash
cd frontend
npm run dev
```

---

## ✅ Giải pháp 3: Deploy lên Server thật (Production)

### Option A: Deploy lên Vercel (Miễn phí)

1. Push code lên GitHub
2. Truy cập: https://vercel.com
3. Import repository
4. Deploy → Nhận domain: `https://your-app.vercel.app`
5. QR code sẽ chứa link production

### Option B: Deploy lên VPS

1. Thuê VPS (DigitalOcean, AWS, etc.)
2. Cài Nginx + Node.js
3. Deploy backend + frontend
4. Cấu hình domain: `https://ebookfarm.vn`
5. QR code sẽ chứa link domain thật

---

## 🔧 Code Fix Chi tiết

### Fix 1: Tự động detect IP

**File: `frontend/src/pages/Journal/JournalList.jsx`**

Tìm dòng (khoảng line 323):
```javascript
onClick={() => {
  setCurrentQr(`${window.location.origin}/trace/${record.qrCode}`);
  setQrModalVisible(true);
}}
```

Thay bằng:
```javascript
onClick={() => {
  // Tự động dùng IP thay vì localhost
  let baseUrl = window.location.origin;
  
  // Nếu đang chạy localhost, thử dùng IP
  if (baseUrl.includes('localhost')) {
    // Lấy IP từ network interfaces (nếu có)
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      baseUrl = `${window.location.protocol}//${hostname}:${window.location.port}`;
    }
  }
  
  setCurrentQr(`${baseUrl}/trace/${record.qrCode}`);
  setQrModalVisible(true);
}}
```

### Fix 2: Thêm option chọn URL

Thêm state để user có thể chọn URL:
```javascript
const [qrBaseUrl, setQrBaseUrl] = useState(window.location.origin);

// Trong modal QR, thêm input để user nhập IP
<Form.Item label="Base URL (để quét từ điện thoại)">
  <Input
    value={qrBaseUrl}
    onChange={(e) => setQrBaseUrl(e.target.value)}
    placeholder="http://192.168.1.100:5173"
  />
</Form.Item>
```

---

## 📱 Hướng dẫn Test với IP

### Bước 1: Lấy IP máy tính

**Windows - Mở CMD:**
```bash
ipconfig
```
Tìm `IPv4 Address`: `192.168.1.100` (ví dụ)

**Mac - Mở Terminal:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Bước 2: Cấu hình Vite

**File: `frontend/vite.config.js`**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ← Thêm dòng này
    port: 5173,
  }
})
```

### Bước 3: Khởi động lại

```bash
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

Output sẽ hiện:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/  ← Copy link này
```

### Bước 4: Test trên điện thoại

1. Đảm bảo điện thoại và máy tính **cùng WiFi**
2. Mở browser trên điện thoại
3. Truy cập: `http://192.168.1.100:5173` (thay IP của bạn)
4. Đăng nhập và tạo QR
5. Quét QR → Sẽ hoạt động!

---

## 🐛 Troubleshooting

### Lỗi: Điện thoại không truy cập được IP

**Nguyên nhân:**
- Không cùng mạng WiFi
- Firewall chặn
- Vite chưa cấu hình `host: '0.0.0.0'`

**Giải pháp:**
```bash
# 1. Kiểm tra cùng WiFi
# Điện thoại: Settings → WiFi → Tên mạng
# Máy tính: Phải cùng tên WiFi

# 2. Tắt Firewall tạm thời (Windows)
# Control Panel → Windows Defender Firewall → Turn off

# 3. Kiểm tra Vite config
# File: frontend/vite.config.js
# Phải có: server: { host: '0.0.0.0' }
```

### Lỗi: QR vẫn chứa localhost

**Nguyên nhân:**
- Code chưa cập nhật
- Browser cache

**Giải pháp:**
```bash
# 1. Hard refresh browser
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 2. Clear cache
F12 → Application → Clear storage → Clear site data

# 3. Tạo QR mới
# Xóa QR cũ, tạo journal mới
```

### Lỗi: Backend không kết nối được

**Nguyên nhân:**
- Backend chỉ listen localhost

**Giải pháp:**

**File: `backend/src/server.js`**
```javascript
// Thay
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Bằng
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
```

---

## 📋 Checklist

### Cấu hình:
- [ ] Lấy IP máy tính: `ipconfig` (Windows) hoặc `ifconfig` (Mac)
- [ ] Cập nhật `vite.config.js`: `server: { host: '0.0.0.0' }`
- [ ] Khởi động lại frontend: `npm run dev`
- [ ] Kiểm tra output có hiện Network URL

### Test:
- [ ] Điện thoại và máy tính cùng WiFi
- [ ] Truy cập `http://[IP]:5173` từ điện thoại
- [ ] Đăng nhập thành công
- [ ] Tạo QR code mới
- [ ] QR chứa IP thay vì localhost
- [ ] Quét QR bằng camera điện thoại
- [ ] Trang truy xuất mở thành công

---

## 🎯 Kết luận

**Để QR code hoạt động khi quét:**

1. **Development (Test):**
   - Dùng IP máy tính: `http://192.168.1.100:5173`
   - Cấu hình Vite: `host: '0.0.0.0'`
   - Cùng mạng WiFi

2. **Production (Thật):**
   - Deploy lên server có domain
   - QR chứa link: `https://ebookfarm.vn/trace/...`
   - Quét được từ mọi nơi

**Khuyến nghị:**
- Development: Dùng IP để test
- Production: Deploy lên Vercel/VPS với domain thật
