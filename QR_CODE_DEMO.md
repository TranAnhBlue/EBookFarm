# 📱 DEMO QR CODE - TRY XUẤT NGUỒN GỐC

## 🎯 Mục đích
File này chứa QR code mẫu để test tính năng quét QR bằng camera điện thoại.

---

## 📋 Hướng dẫn Test QR Code

### Bước 1: Khởi động Server
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Bước 2: Lấy QR Code
1. Đăng nhập vào hệ thống: http://localhost:5173/login
   - Email: `farmer@gmail.com`
   - Password: `123`

2. Vào trang "Danh sách sổ nhật ký"

3. Click icon QR (🔍) trên bất kỳ journal nào

4. Trong modal QR:
   - Click "Tải PNG (In tem)" để tải QR về máy
   - Hoặc screenshot QR code

### Bước 3: Test Quét QR

#### Cách 1: Quét bằng Camera Điện thoại 📱

**iPhone:**
1. Mở app **Camera**
2. Hướng camera vào QR code trên màn hình máy tính
3. Xuất hiện notification → Tap vào
4. Safari sẽ mở link: `http://localhost:5173/trace/{qrCode}`

**Android:**
1. Mở app **Camera** hoặc **Google Lens**
2. Hướng camera vào QR code
3. Tap vào link hiển thị
4. Chrome sẽ mở trang truy xuất

**Zalo:**
1. Mở Zalo → Tab **Khám phá**
2. Click icon **QR Code** (góc trên bên phải)
3. Quét QR code
4. Tap "Mở link"

**Messenger:**
1. Mở Messenger → Tab **Khám phá**
2. Click icon **QR Code**
3. Quét QR code
4. Tap "Mở link"

#### Cách 2: Nhập Mã Thủ công 🔤

1. Truy cập: http://localhost:5173
2. Scroll xuống section "Tra cứu nguồn gốc sản phẩm"
3. Nhập mã QR: `1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7`
4. Click "Tra cứu ngay"

---

## 🖨️ In QR Code để Test Thực tế

### Option 1: In trên giấy A4
1. Tải QR code PNG từ modal
2. Mở file PNG
3. In ra giấy A4 (kích thước: 5x5cm)
4. Cắt và dán lên sản phẩm mẫu

### Option 2: In tem nhãn decal
1. Tải QR code PNG
2. Đưa file cho tiệm in tem
3. Yêu cầu in tem decal kích thước 3x3cm hoặc 5x5cm
4. Dán tem lên bao bì sản phẩm

### Option 3: In trực tiếp lên bao bì
1. Tải QR code PNG (độ phân giải cao)
2. Đưa cho nhà in bao bì
3. In trực tiếp lên bao bì/thùng carton

---

## 📊 Danh sách QR Code Mẫu

### QR Code 1: Dưa lưới
```
Mã: 1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7
Link: http://localhost:5173/trace/1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7
Sản phẩm: Dưa lưới
Trạng thái: Draft
```

### QR Code 2: Nấm
```
Mã: 68b5f730-c532-4f2a-8a6c-dd5bbeeff44e
Link: http://localhost:5173/trace/68b5f730-c532-4f2a-8a6c-dd5bbeeff44e
Sản phẩm: Nấm
Trạng thái: Draft
```

### QR Code 3: Chè búp
```
Mã: f352206e-ab68-448e-98b2-e29d52fa13b8
Link: http://localhost:5173/trace/f352206e-ab68-448e-98b2-e29d52fa13b8
Sản phẩm: Chè búp
Trạng thái: Draft
```

---

## 🎨 Thiết kế Tem Nhãn Đề xuất

### Mẫu 1: Tem đơn giản (3x3cm)
```
┌─────────────────┐
│                 │
│   [QR CODE]     │
│                 │
│  Quét để xem    │
│  nguồn gốc      │
└─────────────────┘
```

### Mẫu 2: Tem có thông tin (5x5cm)
```
┌─────────────────────────┐
│  🌿 EBookFarm           │
│                         │
│     [QR CODE]           │
│                         │
│  Truy xuất nguồn gốc    │
│  Sản phẩm: Dưa lưới     │
│  Ngày SX: 21/04/2026    │
└─────────────────────────┘
```

### Mẫu 3: Tem chuyên nghiệp (7x7cm)
```
┌───────────────────────────────┐
│  🌿 EBookFarm                 │
│  Truy xuất nguồn gốc          │
│                               │
│       [QR CODE LARGE]         │
│                               │
│  📱 Quét mã để xem:           │
│  ✓ Nguồn gốc sản phẩm         │
│  ✓ Quy trình sản xuất         │
│  ✓ Chứng nhận chất lượng      │
│                               │
│  Hotline: 1900 xxxx           │
└───────────────────────────────┘
```

---

## ✅ Checklist Test QR Code

### Test trên Desktop:
- [ ] Modal QR hiển thị đúng
- [ ] QR code rõ nét, màu xanh
- [ ] Nút "Tải PNG" hoạt động
- [ ] Nút "Xem trang truy xuất" mở tab mới
- [ ] Hướng dẫn sử dụng hiển thị đầy đủ
- [ ] Link truy xuất hiển thị đúng

### Test quét QR bằng điện thoại:
- [ ] iPhone Camera quét được
- [ ] Android Camera quét được
- [ ] Zalo quét được
- [ ] Messenger quét được
- [ ] Link mở đúng trang truy xuất
- [ ] Trang truy xuất hiển thị đúng thông tin

### Test in QR:
- [ ] Tải QR PNG thành công
- [ ] File PNG rõ nét, không bị vỡ
- [ ] In ra giấy A4 rõ ràng
- [ ] Quét QR trên giấy in được
- [ ] Kích thước 3x3cm vẫn quét được
- [ ] Kích thước 5x5cm quét tốt hơn

---

## 🔧 Troubleshooting

### Lỗi: Không quét được QR
**Nguyên nhân:**
- QR code quá nhỏ
- Độ phân giải thấp
- Ánh sáng kém
- Camera không focus

**Giải pháp:**
- In QR lớn hơn (5x5cm trở lên)
- Tải QR ở độ phân giải cao
- Quét ở nơi có ánh sáng tốt
- Giữ camera cách QR 10-15cm

### Lỗi: Quét được nhưng link không mở
**Nguyên nhân:**
- Link localhost không truy cập được từ điện thoại
- Điện thoại và máy tính không cùng mạng WiFi

**Giải pháp:**
- Đảm bảo điện thoại và máy tính cùng mạng WiFi
- Thay `localhost` bằng IP máy tính (ví dụ: `192.168.1.100`)
- Hoặc deploy lên server thật để test

### Lỗi: Tải QR không thành công
**Nguyên nhân:**
- Canvas chưa render xong
- Browser block download

**Giải pháp:**
- Đợi QR hiển thị đầy đủ rồi mới click tải
- Cho phép browser download file
- Thử lại hoặc screenshot QR

---

## 📸 Demo Screenshots

### 1. Modal QR Code
```
┌────────────────────────────────────┐
│  🔍 Mã QR Truy xuất nguồn gốc     │
│  Dành cho người tiêu dùng quét     │
├────────────────────────────────────┤
│                                    │
│         [QR CODE 280x280]          │
│                                    │
│  📱 Quét mã để xem hồ sơ công khai │
│                                    │
│  ┌──────────────┐ ┌──────────────┐│
│  │ Tải PNG      │ │ Xem trang    ││
│  └──────────────┘ └──────────────┘│
│                                    │
│  💡 Hướng dẫn sử dụng:             │
│  1. Click "Tải PNG"...             │
│  2. In QR code ra giấy...          │
│  3. Dán tem QR lên bao bì...       │
│  4. Người tiêu dùng quét...        │
└────────────────────────────────────┘
```

### 2. Trang Truy xuất (sau khi quét)
```
┌────────────────────────────────────┐
│  ✅ Truy xuất nguồn gốc            │
│  ID: 1A83CA5C                      │
├────────────────────────────────────┤
│  📋 Dưa lưới                       │
│  🏠 Tên cơ sở: ...                 │
│  📍 Địa chỉ: ...                   │
│  📅 Ngày tạo: 21/04/2026           │
│  👁️ Lượt xem: 5                    │
│                                    │
│  ⏱️ Quy trình sản xuất:            │
│  ✓ Thông tin chung                 │
│  ✓ Chuẩn bị đất                    │
│  ✓ Gieo trồng                      │
│  ...                               │
└────────────────────────────────────┘
```

---

## 🎯 Kết luận

Sau khi test xong, bạn sẽ có:
- ✅ QR code chất lượng cao để in tem
- ✅ Người tiêu dùng quét được bằng camera điện thoại
- ✅ Trang truy xuất hiển thị đầy đủ thông tin
- ✅ Hệ thống truy xuất nguồn gốc hoàn chỉnh

**Lưu ý quan trọng:**
- QR code phải rõ nét, kích thước tối thiểu 3x3cm
- In trên nền trắng, mực đen để quét tốt nhất
- Test quét trước khi in hàng loạt
- Dán QR ở vị trí dễ thấy trên bao bì
