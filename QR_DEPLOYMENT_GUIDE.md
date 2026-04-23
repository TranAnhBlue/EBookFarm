# Hướng dẫn Triển khai QR Code cho Người tiêu dùng

## Quy trình đầy đủ: Từ Web → Bao bì sản phẩm → Người tiêu dùng

### Bước 1: Nông dân tạo sổ nhật ký trên Web
1. Nông dân login vào hệ thống
2. Tạo sổ nhật ký cho sản phẩm (Chè búp, Nấm, Lúa, v.v.)
3. Nhập đầy đủ thông tin:
   - Thông tin chung (tên cơ sở, địa chỉ, diện tích)
   - Đánh giá ATTP
   - Nhật ký mua vật tư
   - Nhật ký thực hành sản xuất
   - Nhật ký thu hoạch
4. Lưu nhật ký → Hệ thống tự động tạo QR Code

### Bước 2: Lấy QR Code từ hệ thống

#### Cách 1: Nông dân tự lấy (Đơn giản)
1. Vào trang danh sách nhật ký
2. Click nút QR icon (📱) ở sổ nhật ký vừa tạo
3. **Chụp màn hình** QR Code
4. Gửi ảnh cho cơ sở in ấn

#### Cách 2: Admin hỗ trợ (Chất lượng cao)
1. Admin login vào `/admin/journals`
2. Tìm sổ nhật ký của nông dân
3. Click "Tải QR Code"
4. File PNG 500x500px chất lượng cao
5. Gửi file cho nông dân hoặc cơ sở in ấn

### Bước 3: In QR Code lên vật liệu

#### Option 1: Tem dán (Sticker) - PHỔ BIẾN NHẤT ⭐
**Ưu điểm**: Rẻ, nhanh, dễ dán
**Quy trình**:
1. Thiết kế tem với:
   - QR Code (kích thước 3x3cm đến 5x5cm)
   - Logo EBookFarm
   - Text: "Quét mã để xem nguồn gốc"
   - Thông tin cơ bản: Tên sản phẩm, Tên cơ sở
2. In tem tại cơ sở in ấn:
   - Giá: 500-1,000 VNĐ/tem (in số lượng lớn)
   - Chất liệu: Decal chống nước
   - Kích thước: 5x7cm hoặc 7x10cm
3. Dán tem lên:
   - Bao bì sản phẩm
   - Hộp đựng
   - Túi nilon

**File mẫu thiết kế tem**: Tạo file Photoshop/Illustrator với:
```
┌─────────────────────┐
│   [LOGO EBOOKFARM]  │
│                     │
│   ┌─────────────┐   │
│   │             │   │
│   │  QR CODE    │   │
│   │             │   │
│   └─────────────┘   │
│                     │
│ Quét mã để xem      │
│ nguồn gốc sản phẩm  │
│                     │
│ Chè búp hữu cơ      │
│ Nông trại ABC       │
└─────────────────────┘
```

#### Option 2: In trực tiếp lên bao bì
**Ưu điểm**: Chuyên nghiệp, không bong tróc
**Quy trình**:
1. Gửi file QR Code cho nhà sản xuất bao bì
2. Họ in QR Code trực tiếp lên:
   - Hộp giấy
   - Túi zip
   - Bao bì nhựa
3. Chi phí: Cao hơn, phù hợp sản xuất số lượng lớn

#### Option 3: Thẻ treo (Hang tag)
**Ưu điểm**: Sang trọng, dễ thay đổi
**Quy trình**:
1. In QR Code lên thẻ giấy cứng
2. Đục lỗ, xỏ dây
3. Treo vào sản phẩm (chai, túi, hộp)

#### Option 4: Nhãn chai/lọ
**Ưu điểm**: Phù hợp sản phẩm dạng lỏng
**Quy trình**:
1. Thiết kế nhãn với QR Code
2. In nhãn decal chống nước
3. Dán lên chai/lọ

### Bước 4: Phân phối sản phẩm có QR Code

#### Kênh 1: Bán trực tiếp tại trang trại
- Sản phẩm đã có tem QR
- Khách hàng mua → Quét ngay tại chỗ
- Nông dân giải thích cách quét

#### Kênh 2: Siêu thị / Cửa hàng
- Sản phẩm trên kệ có tem QR
- Khách hàng quét trước khi mua
- Biển hiệu: "Quét mã QR để xem nguồn gốc"

#### Kênh 3: Chợ truyền thống
- Sản phẩm có tem QR
- Biển hiệu lớn: "Sản phẩm có truy xuất nguồn gốc"
- Hướng dẫn khách hàng quét

#### Kênh 4: Giao hàng online
- Đóng gói sản phẩm với tem QR
- Ghi chú trong đơn hàng: "Quét QR để xem nguồn gốc"

### Bước 5: Người tiêu dùng quét QR Code

#### Cách quét (Hướng dẫn cho người tiêu dùng):

**Trên iPhone**:
1. Mở app **Camera**
2. Hướng camera vào QR Code
3. Chờ 1-2 giây
4. Xuất hiện thông báo ở trên màn hình
5. Chạm vào thông báo → Mở trang web

**Trên Android**:
1. Mở app **Camera** hoặc **Google Lens**
2. Hướng camera vào QR Code
3. Chạm vào icon QR xuất hiện
4. Mở trang web

**Trên Zalo** (Phổ biến ở VN):
1. Mở Zalo
2. Chạm vào icon **Quét mã QR** (góc trên bên phải)
3. Hướng camera vào QR Code
4. Mở trang web

**Trên Facebook Messenger**:
1. Mở Messenger
2. Chạm vào icon camera
3. Chọn "Quét mã"
4. Quét QR Code

### Bước 6: Xem thông tin truy xuất nguồn gốc

Sau khi quét, người tiêu dùng sẽ thấy trang web với:
- ✅ Tên sản phẩm (Chè búp, Nấm, v.v.)
- ✅ Tên người sản xuất
- ✅ Địa chỉ cơ sở sản xuất
- ✅ Diện tích canh tác
- ✅ Quy trình sản xuất chi tiết:
  - Thông tin chung
  - Đánh giá an toàn thực phẩm
  - Nhật ký mua vật tư (phân bón, thuốc BVTV)
  - Nhật ký thực hành sản xuất
  - Nhật ký thu hoạch
- ✅ Ngày tạo sổ nhật ký
- ✅ Trạng thái (Draft/Completed)

## Chi phí ước tính

### In tem QR Code (Decal)
- **Số lượng nhỏ** (100-500 tem): 1,000-2,000 VNĐ/tem
- **Số lượng vừa** (500-2,000 tem): 500-1,000 VNĐ/tem
- **Số lượng lớn** (>2,000 tem): 300-500 VNĐ/tem

### In trực tiếp lên bao bì
- **Setup phí**: 500,000-2,000,000 VNĐ (một lần)
- **Chi phí in**: Tùy số lượng và loại bao bì

### Thẻ treo
- **Giá**: 2,000-5,000 VNĐ/thẻ (bao gồm dây)

## Mẫu thiết kế tem QR (Có thể dùng ngay)

### Mẫu 1: Đơn giản (5x7cm)
```
┌─────────────────────────┐
│  🌿 EBOOKFARM           │
│                         │
│    ┌─────────────┐      │
│    │             │      │
│    │  [QR CODE]  │      │
│    │             │      │
│    └─────────────┘      │
│                         │
│  Quét mã xem nguồn gốc  │
│  Scan to trace origin   │
└─────────────────────────┘
```

### Mẫu 2: Chi tiết (7x10cm)
```
┌─────────────────────────────┐
│  🌿 EBOOKFARM TRACEABILITY  │
│  ───────────────────────    │
│                             │
│      ┌─────────────┐        │
│      │             │        │
│      │  [QR CODE]  │        │
│      │             │        │
│      └─────────────┘        │
│                             │
│  📱 Quét mã để xem:         │
│  • Nguồn gốc sản phẩm       │
│  • Quy trình sản xuất       │
│  • Chứng nhận an toàn       │
│                             │
│  Sản phẩm: Chè búp hữu cơ   │
│  Cơ sở: Nông trại ABC       │
│  Địa chỉ: Xã XYZ, Huyện ABC │
└─────────────────────────────┘
```

### Mẫu 3: Sang trọng (10x10cm)
```
┌─────────────────────────────────┐
│                                 │
│     [LOGO EBOOKFARM LỚN]        │
│                                 │
│  ═══════════════════════════    │
│                                 │
│        ┌─────────────┐          │
│        │             │          │
│        │  [QR CODE]  │          │
│        │   5x5cm     │          │
│        │             │          │
│        └─────────────┘          │
│                                 │
│  TRUY XUẤT NGUỒN GỐC SẢN PHẨM   │
│  PRODUCT TRACEABILITY           │
│                                 │
│  ───────────────────────────    │
│  Chè búp hữu cơ VietGAP         │
│  Nông trại ABC - Hà Tĩnh        │
│  ───────────────────────────    │
│                                 │
│  📱 Quét mã QR để xem chi tiết  │
│  🌿 100% Hữu cơ - An toàn       │
│  ✓ Chứng nhận VietGAP           │
└─────────────────────────────────┘
```

## Biển hiệu tại điểm bán

### Biển nhỏ (A4) - Đặt trên quầy
```
┌─────────────────────────────────┐
│                                 │
│   🌿 SẢN PHẨM CÓ TRUY XUẤT      │
│      NGUỒN GỐC                  │
│                                 │
│   ┌─────────────┐               │
│   │             │               │
│   │  [QR DEMO]  │               │
│   │             │               │
│   └─────────────┘               │
│                                 │
│   📱 CÁCH QUÉT:                 │
│   1. Mở Camera trên điện thoại  │
│   2. Hướng vào mã QR            │
│   3. Chạm vào thông báo         │
│   4. Xem thông tin sản phẩm     │
│                                 │
│   Hoặc quét bằng Zalo, Messenger│
└─────────────────────────────────┘
```

### Biển lớn (A3/A2) - Treo tại cửa hàng
```
┌─────────────────────────────────────────┐
│                                         │
│   🌿 EBOOKFARM                          │
│   TRUY XUẤT NGUỒN GỐC SẢN PHẨM          │
│                                         │
│   ═══════════════════════════════       │
│                                         │
│   TẤT CẢ SẢN PHẨM TẠI ĐÂY ĐỀU CÓ       │
│   MÃ QR TRUY XUẤT NGUỒN GỐC             │
│                                         │
│   ┌─────────────┐                       │
│   │             │                       │
│   │  [QR DEMO]  │  ← Quét thử ngay!    │
│   │   10x10cm   │                       │
│   │             │                       │
│   └─────────────┘                       │
│                                         │
│   📱 HƯỚNG DẪN QUÉT:                    │
│   • Mở Camera hoặc Zalo                 │
│   • Hướng vào mã QR trên sản phẩm       │
│   • Xem đầy đủ thông tin:               │
│     ✓ Tên cơ sở sản xuất                │
│     ✓ Địa chỉ, diện tích                │
│     ✓ Quy trình sản xuất                │
│     ✓ Chứng nhận an toàn                │
│                                         │
│   🌿 AN TOÀN - MINH BẠCH - UY TÍN       │
└─────────────────────────────────────────┘
```

## Checklist triển khai

### Cho Nông dân:
- [ ] Tạo sổ nhật ký đầy đủ trên hệ thống
- [ ] Lấy QR Code (chụp màn hình hoặc tải file)
- [ ] Thiết kế tem QR (hoặc dùng mẫu có sẵn)
- [ ] Liên hệ cơ sở in ấn
- [ ] In tem số lượng cần thiết
- [ ] Dán tem lên sản phẩm
- [ ] Test quét QR trước khi bán
- [ ] Hướng dẫn khách hàng cách quét

### Cho Admin/Hệ thống:
- [ ] Chuẩn bị file mẫu thiết kế tem
- [ ] Hướng dẫn nông dân cách lấy QR
- [ ] Hỗ trợ tải QR chất lượng cao
- [ ] Cung cấp danh sách cơ sở in ấn uy tín
- [ ] Tạo video hướng dẫn quét QR
- [ ] Chuẩn bị biển hiệu mẫu

### Cho Điểm bán:
- [ ] Nhận sản phẩm có tem QR
- [ ] Treo biển hiệu "Sản phẩm có truy xuất nguồn gốc"
- [ ] Hướng dẫn nhân viên giải thích cho khách
- [ ] Đặt biển hướng dẫn quét QR tại quầy
- [ ] Test quét QR định kỳ

## Video hướng dẫn (Nên làm)

### Video 1: Cho nông dân (3-5 phút)
1. Cách tạo sổ nhật ký
2. Cách lấy QR Code
3. Cách in tem
4. Cách dán tem lên sản phẩm

### Video 2: Cho người tiêu dùng (1-2 phút)
1. Tại sao nên quét QR?
2. Cách quét QR trên iPhone
3. Cách quét QR trên Android
4. Cách quét QR bằng Zalo
5. Xem thông tin gì sau khi quét

### Video 3: Cho điểm bán (2-3 phút)
1. Cách trưng bày sản phẩm có QR
2. Cách giải thích cho khách hàng
3. Cách xử lý khi khách hỏi

## Kết luận

Quy trình triển khai QR Code:
1. **Web** → Nông dân tạo sổ nhật ký
2. **Lấy QR** → Chụp màn hình hoặc tải file
3. **In tem** → Cơ sở in ấn (500-2,000 VNĐ/tem)
4. **Dán lên sản phẩm** → Bao bì, hộp, túi
5. **Phân phối** → Siêu thị, chợ, online
6. **Người tiêu dùng quét** → Camera, Zalo, Messenger
7. **Xem thông tin** → Trang web truy xuất nguồn gốc

Chi phí: **500-2,000 VNĐ/sản phẩm** (tùy số lượng in)
Thời gian: **2-3 ngày** (từ lấy QR đến có tem)
