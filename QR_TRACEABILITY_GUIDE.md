# Hướng dẫn sử dụng QR Truy xuất nguồn gốc

## ✅ Tính năng đã có

Web của bạn **ĐÃ CÓ ĐẦY ĐỦ** tính năng QR truy xuất nguồn gốc sản phẩm nông nghiệp!

## Các tính năng chính

### 1. Tự động tạo QR Code
- Mỗi sổ nhật ký được tạo sẽ tự động có một **QR Code duy nhất**
- QR Code được lưu trong field `qrCode` (UUID format)
- Ví dụ: `68b5f730-c532-4f2a-8a6c-dd5bbeeff44e`

### 2. Xem QR Code trong danh sách
**Vị trí**: Trang danh sách nhật ký (JournalList)

**Cách xem**:
1. Vào trang danh sách nhật ký (ví dụ: `/vietgap/trong-trot`)
2. Ở mỗi journal card/row, có nút QR icon (📱)
3. Click vào nút QR → Hiện modal với:
   - QR Code lớn (220x220px)
   - URL truy xuất: `https://yourdomain.com/trace/{qrCode}`
   - Có thể click vào URL để mở trang truy xuất

**Code location**: `frontend/src/pages/Journal/JournalList.jsx`

### 3. Tải QR Code (Admin)
**Vị trí**: Trang quản lý nhật ký Admin (`/admin/journals`)

**Cách tải**:
1. Vào `/admin/journals`
2. Click vào một journal
3. Click nút "Tải QR Code"
4. QR Code sẽ được tải về dưới dạng PNG

**Tính năng**:
- QR Code size: 500x500px
- Format: PNG
- Tên file: `qr-{qrCode}.png`
- Sử dụng API: `https://api.qrserver.com/v1/create-qr-code/`

**Code location**: `frontend/src/pages/Admin/AdminJournalMgmt.jsx`

### 4. Trang truy xuất công khai
**URL**: `/trace/{qrCode}`

**Ví dụ**: `http://localhost:5173/trace/68b5f730-c532-4f2a-8a6c-dd5bbeeff44e`

**Tính năng**:
- ✅ **Công khai** - Không cần login
- ✅ Hiển thị thông tin sản phẩm đầy đủ
- ✅ Timeline sản xuất (Steps)
- ✅ Tất cả dữ liệu từ các bảng
- ✅ Responsive design
- ✅ Professional UI với header xanh

**Thông tin hiển thị**:
- Header: "EBookFarm Traceability"
- QR Code ID
- Tên sản phẩm (schema name)
- Tên người sản xuất
- Trạng thái (Draft/Completed)
- Timeline sản xuất với tất cả các bảng:
  - Thông tin chung
  - Đánh giá ATTP
  - Nhật ký mua vật tư
  - Nhật ký thực hành sản xuất
  - Nhật ký thu hoạch

**Code location**: `frontend/src/pages/Journal/JournalTrace.jsx`

## Cách sử dụng

### Cho Nông dân (Farmer)

#### Bước 1: Tạo sổ nhật ký
1. Login vào hệ thống
2. Vào trang danh sách nhật ký
3. Click "Tạo sổ nhật ký"
4. Chọn loại sổ (Chè búp, Nấm, Lúa hữu cơ, v.v.)
5. Nhập đầy đủ thông tin vào các tab
6. Click "Lưu nhật ký"

#### Bước 2: Lấy QR Code
1. Quay lại trang danh sách
2. Tìm sổ nhật ký vừa tạo
3. Click nút QR icon (📱)
4. Chụp màn hình QR Code hoặc copy URL

#### Bước 3: In QR Code lên bao bì
1. Chụp màn hình QR Code
2. In ra giấy dán lên bao bì sản phẩm
3. Hoặc liên hệ Admin để tải QR Code chất lượng cao

### Cho Người tiêu dùng (Consumer)

#### Cách 1: Quét QR Code
1. Mở app quét QR (Camera trên iPhone, Google Lens, Zalo, v.v.)
2. Quét QR Code trên bao bì sản phẩm
3. Click vào link hiện ra
4. Xem thông tin truy xuất nguồn gốc

#### Cách 2: Nhập URL thủ công
1. Mở trình duyệt
2. Nhập: `https://yourdomain.com/trace/{QR_CODE}`
3. Xem thông tin sản phẩm

### Cho Admin

#### Tải QR Code chất lượng cao
1. Login với tài khoản Admin
2. Vào `/admin/journals`
3. Click vào journal cần tải QR
4. Click "Tải QR Code"
5. File PNG 500x500px sẽ được tải về

#### In hàng loạt
1. Vào `/admin/journals`
2. Chọn nhiều journals
3. Click "Xuất nhiều nhật ký" (nếu cần)
4. Hoặc tải từng QR Code một

## API Endpoints

### 1. Lấy thông tin journal theo QR Code
```
GET /api/journals/qr/{qrCode}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "qrCode": "68b5f730-c532-4f2a-8a6c-dd5bbeeff44e",
    "schemaId": {
      "name": "Chè búp",
      "tables": [...]
    },
    "userId": {
      "username": "tranducanh581"
    },
    "entries": {
      "Thông tin chung": {...},
      "Đánh giá chỉ tiêu ATTP": {...}
    },
    "status": "Draft",
    "createdAt": "2026-04-21T04:02:50.512Z"
  }
}
```

**Code location**: `backend/src/controllers/journalController.js` - `getJournalByQr()`

## Cấu trúc URL

### Development
```
http://localhost:5173/trace/{qrCode}
```

### Production
```
https://yourdomain.com/trace/{qrCode}
```

## Ví dụ thực tế

### Ví dụ 1: Chè búp
**QR Code**: `68b5f730-c532-4f2a-8a6c-dd5bbeeff44e`
**URL**: `http://localhost:5173/trace/68b5f730-c532-4f2a-8a6c-dd5bbeeff44e`

**Thông tin hiển thị**:
- Sản phẩm: Chè búp
- Người sản xuất: Trần Đức Anh
- Tên cơ sở: test
- Địa chỉ: testtttttt
- Diện tích: 1,000 m²
- Năm sản xuất: 2026
- Đánh giá ATTP: Không đạt (Dư lượng thuốc BVTV)

### Ví dụ 2: Nấm
**QR Code**: `f352206e-ab68-448e-98b2-e29d52fa13b8`
**URL**: `http://localhost:5173/trace/f352206e-ab68-448e-98b2-e29d52fa13b8`

## Tính năng nâng cao (có thể thêm)

### 1. QR Code với logo
- Thêm logo EBookFarm vào giữa QR Code
- Sử dụng thư viện `qrcode.react` với option `imageSettings`

### 2. QR Code động
- Thêm thống kê số lượt quét
- Tracking vị trí quét (nếu có permission)
- Lịch sử quét

### 3. Chia sẻ mạng xã hội
- Nút chia sẻ Facebook, Zalo
- Meta tags cho preview đẹp khi share

### 4. Xuất PDF với QR
- Tạo PDF chứa thông tin sản phẩm + QR Code
- In trực tiếp từ web

### 5. Batch QR Code generation
- Tạo nhiều QR Code cùng lúc
- Xuất file ZIP chứa tất cả QR

## Troubleshooting

### Vấn đề 1: QR Code không hiển thị
**Nguyên nhân**: API qrserver.com bị chặn hoặc chậm
**Giải pháp**: 
- Sử dụng thư viện `qrcode.react` để generate QR local
- Hoặc cache QR Code sau lần đầu tải

### Vấn đề 2: Trang trace không load
**Nguyên nhân**: Backend API không chạy hoặc CORS
**Giải pháp**:
- Kiểm tra backend đang chạy: `http://localhost:5000`
- Kiểm tra CORS settings trong backend

### Vấn đề 3: Dữ liệu không đầy đủ
**Nguyên nhân**: Journal chưa nhập đủ thông tin
**Giải pháp**:
- Nhắc nông dân nhập đầy đủ các tab
- Validation khi submit

## Files liên quan

### Frontend
- `frontend/src/pages/Journal/JournalTrace.jsx` - Trang truy xuất công khai
- `frontend/src/pages/Journal/JournalList.jsx` - Modal xem QR
- `frontend/src/pages/Admin/AdminJournalMgmt.jsx` - Tải QR Code

### Backend
- `backend/src/controllers/journalController.js` - API `getJournalByQr()`
- `backend/src/models/FarmJournal.js` - Model với field `qrCode`

### Routes
- `frontend/src/App.jsx` - Route `/trace/:qrCode`
- `backend/src/routes/journalRoutes.js` - Route `/api/journals/qr/:qrCode`

## Kết luận

✅ Web của bạn **ĐÃ CÓ ĐẦY ĐỦ** tính năng QR truy xuất nguồn gốc!

Bạn có thể:
1. Tạo sổ nhật ký → Tự động có QR Code
2. Xem QR Code trong danh sách
3. Tải QR Code chất lượng cao (Admin)
4. Người tiêu dùng quét QR → Xem thông tin công khai
5. Tất cả dữ liệu hiển thị đầy đủ và đẹp mắt

Chỉ cần deploy lên production và thay đổi URL từ `localhost` sang domain thật là có thể sử dụng ngay!
