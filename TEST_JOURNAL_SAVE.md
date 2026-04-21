# Hướng dẫn Test Lưu Nhật Ký

## Vấn đề đã sửa
Đã thêm logging và debugging vào form để tìm nguyên nhân dữ liệu không được lưu vào các tab khác ngoài "Thông tin chung".

## Các thay đổi đã thực hiện

### 1. Thêm logging vào saveMutation
- Log form values nhận được
- Log validation errors (nếu có)
- Log payload trước khi gửi lên server

### 2. Thêm Form props
- `preserve={true}` - Đảm bảo form values không bị mất khi unmount
- `onValuesChange` - Log mỗi khi có thay đổi để debug

### 3. Fix status field
- Tách `status` ra khỏi `entries` để tránh lưu sai cấu trúc

## Cách test

### Bước 1: Mở Developer Tools
1. Mở trình duyệt (Chrome/Edge)
2. Nhấn F12 để mở Developer Tools
3. Chuyển sang tab "Console"

### Bước 2: Tạo/Edit Journal
1. Vào trang danh sách nhật ký (ví dụ: /vietgap/trong-trot)
2. Nhấn "Tạo sổ nhật ký" hoặc "Edit" một sổ có sẵn
3. Chọn loại sổ (ví dụ: "Chè búp")

### Bước 3: Nhập dữ liệu vào NHIỀU tab
**QUAN TRỌNG**: Phải nhập dữ liệu vào ít nhất 2-3 tab, không chỉ tab đầu tiên!

Ví dụ với sổ "Chè búp":
1. **Tab "Thông tin chung"**:
   - Tên cơ sở: "Nông trại ABC"
   - Địa chỉ cơ sở: "123 Đường XYZ"
   - Họ tên người ghi chép: "Nguyễn Văn A"
   - Mã số nông hộ: "NH001"
   - Địa chỉ sản xuất: "Xã ABC, Huyện XYZ"
   - Tên cây trồng: "Chè búp"
   - Diện tích: 5000
   - Năm sản xuất: 2026

2. **Tab "Đánh giá chỉ tiêu ATTP"**:
   - Ngày đánh giá: Chọn một ngày
   - Điều kiện đánh giá: "Đạt"
   - Tác nhân gây ô nhiễm: "Không có"
   - Kết quả đánh giá: "Đạt"

3. **Tab "Nhật ký mua vật tư nông nghiệp"**:
   - Thời gian mua: Chọn một ngày
   - Tên vật tư: "Phân bón hữu cơ"
   - Đơn vị tính: "kg"
   - Số lượng: 100
   - Tên và địa chỉ mua vật tư: "Cửa hàng ABC"
   - Hạn sử dụng: Chọn ngày trong tương lai

### Bước 4: Xem Console Logs
Khi bạn nhập dữ liệu, console sẽ hiển thị:
```
🔄 Form values changed: {Thông tin chung: {tenCoSo: "Nông trại ABC"}}
📊 All form values: {Thông tin chung: {tenCoSo: "Nông trại ABC", ...}, ...}
```

### Bước 5: Nhấn "Lưu nhật ký"
Console sẽ hiển thị:
```
📝 Form onFinish triggered with values: {...}
🔍 Form values received: {...}
✅ Validation passed, preparing payload...
📦 Payload entries: {...}
📦 Payload status: Draft
```

### Bước 6: Kiểm tra kết quả

#### Trong Console:
- ✅ **ĐÚNG**: `Form values received` có TẤT CẢ các tab bạn đã nhập
  ```javascript
  {
    "Thông tin chung": {...},
    "Đánh giá chỉ tiêu ATTP": {...},
    "Nhật ký mua vật tư nông nghiệp": {...}
  }
  ```

- ❌ **SAI**: `Form values received` chỉ có 1 tab
  ```javascript
  {
    "Thông tin chung": {...}
  }
  ```

#### Trong Database:
Chạy script kiểm tra:
```bash
cd backend
node check-specific-journal.js
```

Kết quả mong đợi:
```
1. Thông tin chung
   ✅ Has data: 8 fields

2. Đánh giá chỉ tiêu ATTP
   ✅ Has data: 4 fields  ← Phải có dữ liệu!

3. Nhật ký mua vật tư nông nghiệp
   ✅ Has data: 6 fields  ← Phải có dữ liệu!
```

## Các trường hợp lỗi và cách xử lý

### Trường hợp 1: Console log chỉ hiển thị 1 tab
**Nguyên nhân**: Form không collect values từ các tab khác
**Giải pháp**: 
- Kiểm tra xem có chuyển tab trước khi lưu không
- Thử nhập dữ liệu vào tab cuối cùng rồi lưu ngay (không chuyển tab)

### Trường hợp 2: Console log hiển thị validation errors
**Nguyên nhân**: Dữ liệu nhập không đúng format hoặc validation quá strict
**Giải pháp**:
- Đọc error message để biết field nào bị lỗi
- Sửa dữ liệu cho đúng format
- Hoặc báo lại để điều chỉnh validation rules

### Trường hợp 3: Console log OK nhưng database không có dữ liệu
**Nguyên nhân**: Backend không lưu đúng
**Giải pháp**:
- Kiểm tra backend logs
- Kiểm tra network tab trong DevTools để xem response từ server

## Báo cáo kết quả
Sau khi test, hãy chụp màn hình:
1. Console logs khi nhấn "Lưu nhật ký"
2. Kết quả chạy `node check-specific-journal.js`
3. Màn hình form sau khi reload (để xem dữ liệu có hiển thị lại không)

Gửi cho developer để phân tích và fix tiếp.
