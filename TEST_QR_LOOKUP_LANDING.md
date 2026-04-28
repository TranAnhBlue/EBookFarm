# 🧪 TEST QR LOOKUP TRÊN LANDING PAGE

## 📋 Tổng quan
Tính năng mới cho phép người tiêu dùng (guest - không cần đăng nhập) tra cứu nguồn gốc sản phẩm ngay từ landing page.

---

## 🎯 Mục tiêu Test

### ✅ Kiểm tra:
1. Form nhập mã QR hiển thị đúng trên landing page
2. Nhập mã QR hợp lệ → Chuyển đến trang truy xuất
3. Nhập mã QR không hợp lệ → Hiển thị thông báo lỗi
4. Loading state khi đang tra cứu
5. Responsive design trên mobile
6. UI/UX animations và effects

---

## 🚀 Bước 1: Khởi động Server

### Backend (Port 5000):
```bash
cd backend
npm run dev
```

### Frontend (Port 5173):
```bash
cd frontend
npm run dev
```

**Kiểm tra:**
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:5173

---

## 🧪 Bước 2: Test Cases

### Test Case 1: Truy cập Landing Page
**Thao tác:**
1. Mở trình duyệt
2. Truy cập: http://localhost:5173
3. Scroll xuống sau Hero section

**Kết quả mong đợi:**
- ✅ Thấy section "Tra cứu nguồn gốc sản phẩm"
- ✅ Có icon QR code lớn ở giữa
- ✅ Có form input với placeholder
- ✅ Có button "Tra cứu ngay" màu xanh gradient
- ✅ Có phần "HOẶC" với hướng dẫn quét QR
- ✅ Có 3 tags hướng dẫn: iPhone, Android, Zalo/Messenger
- ✅ Có 3 badges: Minh bạch, Uy tín, An toàn

---

### Test Case 2: Tra cứu với Mã QR Hợp lệ ✅

**Mã QR test (có sẵn trong database):**
```
1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7
```

**Thao tác:**
1. Nhập mã QR vào ô input: `1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7`
2. Click button "Tra cứu ngay"

**Kết quả mong đợi:**
- ✅ Button hiển thị loading spinner
- ✅ Tự động chuyển đến: http://localhost:5173/trace/1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7
- ✅ Trang truy xuất hiển thị đầy đủ thông tin:
  - Hero header với icon check
  - Thông tin sản phẩm: Dưa lưới
  - Thông tin cơ sở sản xuất
  - Timeline quy trình sản xuất
  - View count tăng lên 1

---

### Test Case 3: Tra cứu với Mã QR Không hợp lệ ❌

**Mã QR test (không tồn tại):**
```
invalid-qr-code-12345
```

**Thao tác:**
1. Nhập mã QR không hợp lệ: `invalid-qr-code-12345`
2. Click button "Tra cứu ngay"

**Kết quả mong đợi:**
- ✅ Button hiển thị loading spinner
- ✅ Hiển thị message lỗi màu đỏ: "Không tìm thấy sản phẩm với mã này. Vui lòng kiểm tra lại!"
- ✅ Không chuyển trang
- ✅ Form vẫn giữ nguyên giá trị đã nhập

---

### Test Case 4: Tra cứu với Input Rỗng ⚠️

**Thao tác:**
1. Để trống ô input
2. Click button "Tra cứu ngay"

**Kết quả mong đợi:**
- ✅ Hiển thị message warning: "Vui lòng nhập mã truy xuất!"
- ✅ Không gọi API
- ✅ Không chuyển trang

---

### Test Case 5: Test Nhiều Mã QR Khác nhau

**Danh sách mã QR có sẵn:**

| Mã QR | Sản phẩm | Trạng thái |
|-------|----------|------------|
| `1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7` | Dưa lưới | Draft |
| `68b5f730-c532-4f2a-8a6c-dd5bbeeff44e` | Nấm | Draft |
| `f352206e-ab68-448e-98b2-e29d52fa13b8` | Chè búp | Draft |
| `14df7a56-4e2e-4a54-bdf0-ebf46507b572` | Lợn thịt | Draft |
| `4ef669e6-225f-4de6-9772-22b6b504caa7` | Lợn thịt | Draft |

**Thao tác:**
1. Test lần lượt từng mã QR ở trên
2. Kiểm tra trang truy xuất hiển thị đúng thông tin

**Kết quả mong đợi:**
- ✅ Mỗi mã QR đều chuyển đến trang riêng
- ✅ Thông tin sản phẩm khác nhau
- ✅ View count tăng mỗi lần truy cập

---

### Test Case 6: Responsive Design 📱

**Thao tác:**
1. Mở DevTools (F12)
2. Chuyển sang chế độ mobile (iPhone 12, Samsung Galaxy)
3. Test lại các case trên

**Kết quả mong đợi:**
- ✅ Form hiển thị đẹp trên mobile
- ✅ Button "Tra cứu ngay" full width trên mobile
- ✅ Tags hướng dẫn wrap xuống dòng
- ✅ Card không bị tràn màn hình
- ✅ Animations vẫn hoạt động mượt

---

### Test Case 7: UI/UX Effects 🎨

**Kiểm tra animations:**
- ✅ Scroll reveal effect khi scroll đến section
- ✅ Hover effect trên card
- ✅ Pulse glow effect trên icon QR
- ✅ Shine effect trên button
- ✅ Background decorative icons (QR, Search)
- ✅ Gradient background (green → blue → purple)

---

## 🔍 Bước 3: Test API Trực tiếp

### Test API endpoint:
```bash
# Test với mã hợp lệ
curl http://localhost:5000/api/journals/qr/1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7

# Test với mã không hợp lệ
curl http://localhost:5000/api/journals/qr/invalid-code
```

**Kết quả mong đợi:**
```json
// Mã hợp lệ:
{
  "success": true,
  "data": {
    "_id": "...",
    "qrCode": "1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7",
    "schemaId": { "name": "Dưa lưới", ... },
    "entries": { ... },
    "viewCount": 1,
    "lastViewedAt": "2026-04-23T..."
  }
}

// Mã không hợp lệ:
{
  "success": false,
  "message": "Journal not found"
}
```

---

## 📊 Bước 4: Kiểm tra View Count

**Thao tác:**
1. Tra cứu mã QR: `1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7`
2. Xem view count trên trang truy xuất
3. Quay lại landing page
4. Tra cứu lại cùng mã QR
5. Kiểm tra view count đã tăng

**Kết quả mong đợi:**
- ✅ View count tăng mỗi lần truy cập
- ✅ Hiển thị số lượt xem chính xác
- ✅ Icon mắt (EyeOutlined) hiển thị bên cạnh số

---

## 🎯 Bước 5: Test User Flow Hoàn chỉnh

### Kịch bản: Người tiêu dùng mua sản phẩm và tra cứu

**Bước 1: Người tiêu dùng nhận sản phẩm**
- Sản phẩm có nhãn QR code
- Mã QR: `1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7`

**Bước 2: Tra cứu trên web**
1. Truy cập: http://localhost:5173
2. Scroll xuống section "Tra cứu nguồn gốc sản phẩm"
3. Nhập mã: `1a83ca5c-fa92-4fd2-9ca5-9ece4d5cf7d7`
4. Click "Tra cứu ngay"

**Bước 3: Xem thông tin truy xuất**
- ✅ Thấy tên sản phẩm: Dưa lưới
- ✅ Thấy tên cơ sở sản xuất
- ✅ Thấy địa chỉ sản xuất
- ✅ Thấy timeline quy trình sản xuất
- ✅ Thấy view count
- ✅ Có thể chia sẻ lên Facebook/Zalo

**Bước 4: Chia sẻ (optional)**
1. Click button "Chia sẻ"
2. Chọn Facebook hoặc Zalo
3. Chia sẻ link với bạn bè

---

## ✅ Checklist Tổng hợp

### Frontend:
- [ ] Section QR Lookup hiển thị trên landing page
- [ ] Form input hoạt động đúng
- [ ] Button loading state
- [ ] Validation input rỗng
- [ ] Chuyển trang khi mã hợp lệ
- [ ] Hiển thị lỗi khi mã không hợp lệ
- [ ] Responsive trên mobile
- [ ] Animations mượt mà

### Backend:
- [ ] API `/api/journals/qr/:qrCode` hoạt động
- [ ] Trả về đúng data khi mã hợp lệ
- [ ] Trả về 404 khi mã không hợp lệ
- [ ] View count tăng mỗi lần truy cập
- [ ] lastViewedAt được cập nhật

### Integration:
- [ ] Frontend gọi API đúng endpoint
- [ ] Xử lý response thành công
- [ ] Xử lý response lỗi
- [ ] Navigate đến trang trace đúng URL

---

## 🐛 Troubleshooting

### Lỗi: "Không thể kết nối đến server"
**Nguyên nhân:** Backend chưa chạy hoặc sai port
**Giải pháp:**
```bash
cd backend
npm run dev
# Kiểm tra: http://localhost:5000
```

### Lỗi: Section không hiển thị
**Nguyên nhân:** Frontend chưa build lại
**Giải pháp:**
```bash
# Hard refresh browser
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Lỗi: "Journal not found" với mã hợp lệ
**Nguyên nhân:** Database chưa có dữ liệu
**Giải pháp:**
```bash
cd backend
node check-journals.js
# Lấy mã QR có sẵn từ output
```

---

## 📸 Screenshots Mong đợi

### 1. Landing Page - QR Lookup Section
```
┌─────────────────────────────────────────┐
│  🔍 Tra cứu nguồn gốc sản phẩm          │
│                                         │
│  ┌───────────────────┐  ┌──────────┐   │
│  │ Nhập mã truy xuất │  │ Tra cứu  │   │
│  └───────────────────┘  └──────────┘   │
│                                         │
│           ──── HOẶC ────                │
│                                         │
│  📷 Quét mã QR bằng camera              │
│  📱 iPhone | 📷 Android | 💬 Zalo       │
└─────────────────────────────────────────┘
```

### 2. Trang Truy xuất
```
┌─────────────────────────────────────────┐
│  ✅ Truy xuất nguồn gốc                 │
│  ID: 1A83CA5C                           │
│                                         │
│  📋 Dưa lưới                            │
│  🏠 Tên cơ sở: ...                      │
│  📍 Địa chỉ: ...                        │
│  👁️ Lượt xem: 5                         │
│                                         │
│  ⏱️ Timeline quy trình sản xuất         │
└─────────────────────────────────────────┘
```

---

## 🎉 Kết luận

Sau khi test xong tất cả các case trên, bạn sẽ có:
- ✅ Tính năng tra cứu QR hoàn chỉnh cho người tiêu dùng
- ✅ UI/UX chuyên nghiệp với animations
- ✅ Responsive design trên mọi thiết bị
- ✅ View tracking hoạt động đúng
- ✅ Error handling tốt

**Landing page giờ đã phục vụ đầy đủ 3 đối tượng:**
1. 👨‍🌾 Nông dân/HTX → Đăng ký sử dụng
2. 🛒 Người tiêu dùng → Tra cứu nguồn gốc
3. 🏢 Doanh nghiệp → Đăng ký tư vấn
