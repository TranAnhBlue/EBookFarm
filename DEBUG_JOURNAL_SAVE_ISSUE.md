# Debug: Dữ liệu không hiển thị sau khi lưu

## Vấn đề
Người dùng nhập đầy đủ dữ liệu vào tất cả các tab và nhấn "Lưu nhật ký" thành công, nhưng khi quay lại xem thì các trường lại trống.

## Kết quả kiểm tra Database
Chạy `node backend/check-specific-journal.js` cho thấy:
- ✅ Tab "Thông tin chung": CÓ dữ liệu (8 fields)
- ❌ Tab "Đánh giá chỉ tiêu ATTP": KHÔNG có dữ liệu
- ❌ Tab "Nhật ký mua vật tư nông nghiệp": KHÔNG có dữ liệu  
- ❌ Tab "Nhật ký thực hành sản xuất": KHÔNG có dữ liệu
- ❌ Tab "Nhật ký thu hoạch và bán sản phẩm": KHÔNG có dữ liệu

## Nguyên nhân có thể
1. **Validation errors**: Các validation rules quá strict đang chặn dữ liệu
2. **Form không collect values**: Ant Design Form không lấy được values từ các tab khác
3. **Tab switching**: Khi chuyển tab, form values có thể bị mất

## Các bước debug

### Bước 1: Kiểm tra Console Log
Đã thêm logging vào `frontend/src/pages/Journal/JournalEntry.jsx`:
- `console.log('🔍 Form values received:', values)` - Xem form nhận được gì
- `console.log('❌ Validation errors:', errors)` - Xem lỗi validation nào
- `console.log('📦 Payload entries:', entries)` - Xem payload gửi lên server

### Bước 2: Test lại
1. Mở trình duyệt
2. Mở Developer Tools (F12)
3. Vào tab Console
4. Tạo/edit một journal
5. Nhập dữ liệu vào NHIỀU tab (không chỉ "Thông tin chung")
6. Nhấn "Lưu nhật ký"
7. Xem console logs:
   - Nếu thấy `🔍 Form values received:` chỉ có "Thông tin chung" → Form không collect values từ tab khác
   - Nếu thấy `❌ Validation errors:` → Có lỗi validation đang chặn
   - Nếu thấy `📦 Payload entries:` có đầy đủ các tab → Backend có vấn đề

### Bước 3: Kiểm tra Form behavior
Vấn đề có thể là Ant Design Form không preserve values khi switch tabs. Cần kiểm tra:
- Form có `preserve={true}` không?
- Các Form.Item có `shouldUpdate` không?
- Tab switching có trigger form reset không?

## Giải pháp tạm thời
Nếu vấn đề là validation quá strict:
1. Comment out các validation rules trong `getValidationRules()`
2. Test lại xem dữ liệu có được lưu không
3. Nếu được, từ từ enable lại từng rule để tìm rule nào gây vấn đề

## Next Steps
Sau khi có console logs, sẽ biết chính xác vấn đề ở đâu và fix accordingly.
