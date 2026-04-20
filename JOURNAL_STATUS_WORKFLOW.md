# 📋 Quy trình quản lý trạng thái Nhật ký

## 🎯 Mục tiêu

Đảm bảo:
1. ✅ Linh hoạt cho người dùng
2. ✅ Minh bạch, có thể kiểm tra
3. ✅ Phù hợp với tiêu chuẩn VietGAP/VietGAHP
4. ✅ Tăng độ tin cậy khi truy xuất nguồn gốc

## 📊 Các trạng thái nhật ký

### 1. Draft (Nháp)
- **Mô tả**: Đang soạn thảo, chưa hoàn thiện
- **Quyền**: Chỉnh sửa tự do, không giới hạn
- **Hiển thị**: Không hiện trên QR Code công khai
- **Icon**: 📝 (màu xám)

### 2. Submitted (Đã gửi)
- **Mô tả**: Đã gửi, chờ xác nhận
- **Quyền**: Có thể chỉnh sửa nhưng lưu lịch sử
- **Hiển thị**: Hiện trên QR Code với cảnh báo "Đang chờ xác nhận"
- **Icon**: 📤 (màu vàng)

### 3. Verified (Đã xác minh)
- **Mô tả**: Đã được xác minh bởi cơ quan có thẩm quyền
- **Quyền**: Chỉ Admin/Verifier có thể sửa, lưu lịch sử
- **Hiển thị**: Hiện trên QR Code với dấu xác minh
- **Icon**: ✅ (màu xanh)

### 4. Locked (Đã khóa)
- **Mô tả**: Đã khóa, không thể sửa
- **Quyền**: Không ai có thể sửa (trừ Super Admin)
- **Hiển thị**: Hiện trên QR Code với dấu khóa
- **Icon**: 🔒 (màu đỏ)

### 5. Archived (Đã lưu trữ)
- **Mô tả**: Đã hoàn thành, lưu trữ lâu dài
- **Quyền**: Chỉ xem, không sửa
- **Hiển thị**: Hiện trên QR Code, chỉ đọc
- **Icon**: 📦 (màu xám)

## 🔄 Quy trình chuyển trạng thái

```
Draft → Submitted → Verified → Locked → Archived
  ↓         ↓          ↓
  └─────────┴──────────┴─→ (Có thể quay lại Draft nếu cần sửa)
```

### Luồng chuẩn:

1. **Tạo mới**: Draft
2. **Người dùng nhập xong**: Draft → Submitted
3. **Cơ quan xác minh**: Submitted → Verified
4. **Sau 30 ngày**: Verified → Locked (tự động)
5. **Sau 1 năm**: Locked → Archived (tự động)

### Luồng đặc biệt:

- **Cần sửa**: Submitted/Verified → Draft (Admin approve)
- **Hủy**: Any → Draft
- **Khẩn cấp khóa**: Any → Locked (Admin only)

## 📝 Lịch sử chỉnh sửa (Audit Trail)

Mỗi lần chỉnh sửa lưu:

```javascript
{
  timestamp: Date,
  userId: ObjectId,
  userName: String,
  action: 'create' | 'update' | 'status_change' | 'delete',
  changes: {
    field: String,
    oldValue: Any,
    newValue: Any
  }[],
  reason: String, // Lý do sửa
  ipAddress: String,
  userAgent: String
}
```

## 🎨 Giao diện

### Badge trạng thái:

```jsx
Draft      → 📝 Nháp (màu xám)
Submitted  → 📤 Đã gửi (màu vàng)
Verified   → ✅ Đã xác minh (màu xanh)
Locked     → 🔒 Đã khóa (màu đỏ)
Archived   → 📦 Lưu trữ (màu xám)
```

### Nút hành động theo trạng thái:

**Draft:**
- [Lưu nháp] [Gửi xác nhận] [Xóa]

**Submitted:**
- [Chỉnh sửa] [Rút lại] [Xem lịch sử]

**Verified:**
- [Xem] [Yêu cầu sửa] [Xem lịch sử] [Khóa]

**Locked:**
- [Xem] [Xem lịch sử]

**Archived:**
- [Xem] [Xem lịch sử] [Tải về]

## 🔐 Quyền hạn

### Farmer (Nông dân):
- ✅ Tạo, sửa, xóa Draft
- ✅ Gửi Submitted
- ✅ Chỉnh sửa Submitted (lưu lịch sử)
- ❌ Không sửa Verified/Locked/Archived

### Technician (Kỹ thuật viên):
- ✅ Tất cả quyền của Farmer
- ✅ Xác minh: Submitted → Verified
- ✅ Yêu cầu sửa: Verified → Draft

### Admin:
- ✅ Tất cả quyền
- ✅ Khóa/Mở khóa bất kỳ nhật ký
- ✅ Xem tất cả lịch sử
- ✅ Khôi phục từ Archived

## 📊 Thống kê

Dashboard hiển thị:
- Số nhật ký Draft (cần hoàn thiện)
- Số nhật ký Submitted (chờ xác minh)
- Số nhật ký Verified (đã xác minh)
- Số nhật ký Locked (đã khóa)
- Số nhật ký Archived (lưu trữ)

## 🔔 Thông báo

### Gửi thông báo khi:
1. Nhật ký được gửi (Submitted) → Thông báo cho Technician
2. Nhật ký được xác minh (Verified) → Thông báo cho Farmer
3. Nhật ký bị yêu cầu sửa → Thông báo cho Farmer
4. Nhật ký sắp bị khóa (25 ngày) → Thông báo cho Farmer
5. Nhật ký đã khóa → Thông báo cho Farmer

## 🎯 Lợi ích

### Cho Nông dân:
- ✅ Linh hoạt sửa lỗi
- ✅ Biết trạng thái nhật ký
- ✅ Tăng độ tin cậy

### Cho Cơ quan quản lý:
- ✅ Kiểm soát chất lượng
- ✅ Audit trail đầy đủ
- ✅ Phát hiện gian lận

### Cho Người tiêu dùng:
- ✅ Tin cậy thông tin
- ✅ Biết nhật ký đã xác minh
- ✅ Truy xuất minh bạch

## 🚀 Triển khai

### Phase 1: Cơ bản (Hiện tại)
- ✅ 2 trạng thái: Draft, Completed
- ✅ Cho phép sửa tự do

### Phase 2: Nâng cao (Đề xuất)
- [ ] 5 trạng thái: Draft, Submitted, Verified, Locked, Archived
- [ ] Lưu lịch sử chỉnh sửa
- [ ] Quyền hạn theo role
- [ ] Thông báo tự động

### Phase 3: Chuyên nghiệp
- [ ] Chữ ký số
- [ ] Blockchain integration
- [ ] AI phát hiện bất thường
- [ ] Export PDF có watermark

## 📝 Ví dụ thực tế

### Kịch bản 1: Nhập sai số liệu
1. Nông dân tạo nhật ký (Draft)
2. Nhập xong, gửi (Submitted)
3. Phát hiện sai số lượng thức ăn
4. Nhấn "Chỉnh sửa" → Hệ thống lưu lịch sử
5. Sửa lại số liệu
6. Lưu → Lịch sử ghi: "Sửa số lượng thức ăn từ 100kg → 120kg"

### Kịch bản 2: Xác minh
1. Kỹ thuật viên nhận thông báo có nhật ký mới
2. Xem nhật ký, kiểm tra
3. Nếu OK: Nhấn "Xác minh" → Verified
4. Nếu sai: Nhấn "Yêu cầu sửa" → Draft, gửi comment

### Kịch bản 3: Khóa tự động
1. Nhật ký Verified được 30 ngày
2. Hệ thống tự động chuyển → Locked
3. Gửi thông báo cho nông dân
4. Không ai có thể sửa (trừ Super Admin)

## ⚠️ Lưu ý

### Khi triển khai:
1. Giải thích rõ cho người dùng về quy trình
2. Có hướng dẫn chi tiết
3. Thông báo trước khi khóa
4. Cho phép export trước khi khóa

### Tuân thủ pháp luật:
- Lưu lịch sử tối thiểu 5 năm
- Bảo mật thông tin cá nhân
- Cho phép người dùng xóa dữ liệu (GDPR)
- Audit trail không thể xóa

---

**Khuyến nghị**: Triển khai Phase 2 để cân bằng giữa linh hoạt và minh bạch.

**Ưu tiên**: 
1. Thêm trạng thái Submitted, Verified
2. Lưu lịch sử chỉnh sửa
3. Quyền hạn theo role
4. Thông báo cơ bản
