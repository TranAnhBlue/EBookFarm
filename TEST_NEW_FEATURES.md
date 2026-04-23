# Hướng dẫn Test Tính năng Mới

## ✅ Backend đã restart thành công!

Server đang chạy trên port 5000 với model mới.

## 🧪 Cách test từng tính năng

### 1. Test Lượt xem (View Count)

#### Bước 1: Mở trang truy xuất nguồn gốc
1. Vào trang danh sách nhật ký: `http://localhost:5173/vietgap/trong-trot`
2. Click nút QR icon (📱) ở một journal bất kỳ
3. Copy URL trong modal (ví dụ: `http://localhost:5173/trace/68b5f730-c532-4f2a-8a6c-dd5bbeeff44e`)
4. Mở URL đó trong tab mới

#### Bước 2: Kiểm tra lượt xem
- Xem card "Lượt xem" với icon 👁️
- Số lượt xem sẽ là 1 (lần đầu)
- Refresh trang → Số tăng lên 2
- Mỗi lần refresh = 1 lượt xem mới

#### Kết quả mong đợi:
```
┌─────────────────┐
│ 👁️ Lượt xem    │
│     2          │
└─────────────────┘
```

---

### 2. Test Nút Chia sẻ (Social Sharing)

#### Bước 1: Click card "Chia sẻ"
- Ở trang truy xuất nguồn gốc
- Click vào card màu cam "Chia sẻ"
- Modal sẽ hiện ra

#### Bước 2: Test từng nút
1. **Facebook**:
   - Click "Chia sẻ lên Facebook"
   - Cửa sổ Facebook mở ra
   - Có thể share (cần login Facebook)

2. **Zalo**:
   - Click "Chia sẻ qua Zalo"
   - Cửa sổ Zalo mở ra
   - Có thể gửi cho bạn bè

3. **Copy link**:
   - Click "Copy link"
   - Toast "Đã copy link!" hiện ra
   - Paste vào notepad → URL đầy đủ

#### Kết quả mong đợi:
```
┌─────────────────────────┐
│ 🔗 Chia sẻ sản phẩm     │
├─────────────────────────┤
│ [Facebook] Chia sẻ lên  │
│ [Zalo] Chia sẻ qua      │
│ [Copy] Copy link        │
├─────────────────────────┤
│ Link: http://...        │
└─────────────────────────┘
```

---

### 3. Test Badges Chứng nhận (Certifications)

**LƯU Ý**: Tính năng này cần có dữ liệu trong database.

#### Cách thêm dữ liệu test:
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const journal = await FarmJournal.findOne().sort({ createdAt: -1 });
  
  journal.certifications = [
    {
      name: 'VietGAP',
      issuer: 'Bộ Nông nghiệp và Phát triển Nông thôn',
      number: 'VG-2026-001234',
      issueDate: new Date('2026-01-15'),
      expiryDate: new Date('2028-01-15')
    },
    {
      name: 'Organic',
      issuer: 'Control Union Vietnam',
      number: 'ORG-VN-2026-5678',
      issueDate: new Date('2026-02-01'),
      expiryDate: new Date('2027-02-01')
    }
  ];
  
  await journal.save();
  console.log('✅ Đã thêm chứng nhận!');
  process.exit(0);
});
"
```

#### Sau khi thêm dữ liệu:
1. Refresh trang truy xuất nguồn gốc
2. Sẽ thấy section "Chứng nhận"
3. 2 badges: VietGAP (🌿) và Organic (🍃)
4. Mỗi badge hiển thị:
   - Tổ chức cấp
   - Số chứng nhận
   - Ngày cấp
   - Hiệu lực đến

#### Kết quả mong đợi:
```
┌─────────────────────────────────┐
│ 🏆 Chứng nhận                   │
├─────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐       │
│ │ 🌿      │  │ 🍃      │       │
│ │ VietGAP │  │ Organic │       │
│ │ Bộ NN   │  │ Control │       │
│ │ VG-2026 │  │ ORG-VN  │       │
│ └─────────┘  └─────────┘       │
└─────────────────────────────────┘
```

---

### 4. Test Hình ảnh Sản phẩm (Product Images)

**LƯU Ý**: Tính năng này cũng cần có dữ liệu trong database.

#### Cách thêm dữ liệu test:
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const journal = await FarmJournal.findOne().sort({ createdAt: -1 });
  
  journal.images = [
    {
      url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
      caption: 'Vườn chè xanh mướt',
      uploadedAt: new Date()
    },
    {
      url: 'https://images.unsplash.com/photo-1563789031959-4c02bcb41319?w=400',
      caption: 'Thu hoạch búp chè',
      uploadedAt: new Date()
    },
    {
      url: 'https://images.unsplash.com/photo-1587080266227-677cc2a4e76e?w=400',
      caption: 'Chè sau khi chế biến',
      uploadedAt: new Date()
    }
  ];
  
  await journal.save();
  console.log('✅ Đã thêm hình ảnh!');
  process.exit(0);
});
"
```

#### Sau khi thêm dữ liệu:
1. Refresh trang truy xuất nguồn gốc
2. Sẽ thấy section "Hình ảnh sản phẩm"
3. Gallery với 3 ảnh
4. Hover vào ảnh → Overlay đen + icon mắt
5. Click vào ảnh → Modal full size

#### Kết quả mong đợi:
```
┌─────────────────────────────────┐
│ 📸 Hình ảnh sản phẩm            │
├─────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐           │
│ │Img1│ │Img2│ │Img3│           │
│ │    │ │    │ │    │           │
│ └────┘ └────┘ └────┘           │
│ Vườn   Thu    Chè sau          │
│ chè    hoạch  chế biến         │
└─────────────────────────────────┘
```

---

## 🎯 Checklist Test

### Tính năng cơ bản (Không cần data)
- [ ] Lượt xem tăng khi refresh
- [ ] Card "Chia sẻ" click được
- [ ] Modal chia sẻ hiện ra
- [ ] Button Facebook mở cửa sổ mới
- [ ] Button Zalo mở cửa sổ mới
- [ ] Button Copy link → Toast "Đã copy link!"
- [ ] Paste link vào notepad → URL đúng

### Tính năng nâng cao (Cần thêm data)
- [ ] Section "Chứng nhận" hiện ra (sau khi thêm data)
- [ ] Badges hiển thị đúng icon và màu
- [ ] Thông tin chứng nhận đầy đủ
- [ ] Section "Hình ảnh sản phẩm" hiện ra (sau khi thêm data)
- [ ] Gallery ảnh hiển thị đúng
- [ ] Hover ảnh → Overlay effect
- [ ] Click ảnh → Modal preview

---

## 🐛 Troubleshooting

### Vấn đề 1: Không thấy tính năng mới
**Nguyên nhân**: Frontend chưa refresh
**Giải pháp**: 
```bash
# Hard refresh
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Vấn đề 2: Lượt xem không tăng
**Nguyên nhân**: Backend chưa restart
**Giải pháp**:
```bash
# Đã restart rồi, nếu vẫn lỗi:
cd backend
npm run dev
```

### Vấn đề 3: Modal chia sẻ không hiện
**Nguyên nhân**: JavaScript error
**Giải pháp**:
1. Mở Console (F12)
2. Xem error message
3. Báo lại để fix

### Vấn đề 4: Không thấy chứng nhận/ảnh
**Nguyên nhân**: Chưa có data trong database
**Giải pháp**:
- Chạy script thêm data ở trên
- Hoặc đợi thêm form upload trong JournalEntry

---

## 📸 Screenshots mong đợi

### 1. Statistics Row
```
┌─────────┬─────────┬─────────┬─────────┐
│ 📊 1000 │ 📅 2026 │ 👁️ 5   │ 🔗      │
│ m²      │         │ lượt    │ Chia sẻ │
└─────────┴─────────┴─────────┴─────────┘
```

### 2. Share Modal
```
┌─────────────────────────────┐
│ 🔗 Chia sẻ sản phẩm         │
├─────────────────────────────┤
│ [🔵 Facebook]               │
│ [💬 Zalo]                   │
│ [🔗 Copy link]              │
├─────────────────────────────┤
│ http://localhost:5173/...   │
└─────────────────────────────┘
```

### 3. Certifications (Nếu có data)
```
┌─────────────────────────────┐
│ 🏆 Chứng nhận               │
├─────────────────────────────┤
│ [🌿 VietGAP] [🍃 Organic]  │
└─────────────────────────────┘
```

### 4. Images (Nếu có data)
```
┌─────────────────────────────┐
│ 📸 Hình ảnh sản phẩm        │
├─────────────────────────────┤
│ [Img1] [Img2] [Img3]        │
└─────────────────────────────┘
```

---

## ✅ Kết luận

Sau khi test xong, bạn sẽ thấy:
1. ✅ Lượt xem tăng mỗi lần truy cập
2. ✅ Nút chia sẻ hoạt động (Facebook, Zalo, Copy)
3. ✅ Chứng nhận hiển thị đẹp (nếu có data)
4. ✅ Gallery ảnh đẹp (nếu có data)

**Next step**: Thêm form upload ảnh và chứng nhận trong JournalEntry để nông dân có thể tự thêm!

Bạn test thử và cho tôi biết kết quả nhé! 🚀
