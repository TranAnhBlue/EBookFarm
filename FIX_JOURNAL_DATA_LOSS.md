# Sửa lỗi: Dữ liệu nhật ký không hiển thị sau khi lưu

## Vấn đề
Người dùng nhập đầy đủ dữ liệu vào tất cả các tab của sổ nhật ký và nhấn "Lưu nhật ký" thành công, nhưng khi quay lại xem thì các trường lại trống.

## Nguyên nhân
Sau khi kiểm tra database, phát hiện:
- ✅ Tab đầu tiên ("Thông tin chung") có dữ liệu
- ❌ Các tab còn lại KHÔNG có dữ liệu trong database

→ **Dữ liệu từ các tab khác không được gửi lên server khi lưu**

## Các thay đổi đã thực hiện

### 1. Fix lỗi status field (HOÀN THÀNH)
- **Vấn đề**: Field `status` bị lưu vào `entries` dưới dạng object thay vì string
- **Giải pháp**: Tách `status` ra khỏi `entries` trước khi tạo payload
- **File**: `frontend/src/pages/Journal/JournalEntry.jsx`

### 2. Thêm debugging logs (HOÀN THÀNH)
- Log form values khi submit
- Log validation errors
- Log payload trước khi gửi
- Log form values changes
- **Mục đích**: Xác định chính xác dữ liệu có được collect từ form không

### 3. Thêm Form props (HOÀN THÀNH)
- `preserve={true}` - Đảm bảo values không bị mất
- `onValuesChange` - Track mọi thay đổi

## Cách test

### Bước 1: Refresh trình duyệt
```
Ctrl + Shift + R (hard refresh)
```

### Bước 2: Mở Console (F12)
Chuyển sang tab "Console" trong Developer Tools

### Bước 3: Tạo/Edit journal và nhập dữ liệu vào NHIỀU tab
**QUAN TRỌNG**: Phải nhập vào ít nhất 2-3 tab khác nhau!

### Bước 4: Nhấn "Lưu nhật ký" và xem Console
Sẽ thấy các log:
- `🔄 Form values changed` - Mỗi khi nhập dữ liệu
- `📝 Form onFinish triggered` - Khi nhấn Lưu
- `🔍 Form values received` - Dữ liệu form nhận được
- `📦 Payload entries` - Dữ liệu sẽ gửi lên server

### Bước 5: Kiểm tra database
```bash
cd backend
node check-specific-journal.js
```

## Kết quả mong đợi
- Console log phải hiển thị dữ liệu từ TẤT CẢ các tab đã nhập
- Database phải có dữ liệu ở tất cả các tab đã nhập
- Khi reload trang edit, dữ liệu phải hiển thị lại đầy đủ

## Nếu vẫn còn lỗi
Chụp màn hình console logs và gửi lại để phân tích tiếp. Logs sẽ cho biết chính xác vấn đề ở đâu:
- Form không collect values? → Fix form structure
- Validation chặn? → Điều chỉnh validation rules
- Backend không lưu? → Fix backend controller

## Files đã sửa
1. `frontend/src/pages/Journal/JournalEntry.jsx` - Thêm logging và fix status field
2. `backend/fix-corrupted-status.js` - Script dọn dẹp dữ liệu cũ
3. `backend/check-specific-journal.js` - Script kiểm tra dữ liệu chi tiết

## Tài liệu tham khảo
- `TEST_JOURNAL_SAVE.md` - Hướng dẫn test chi tiết
- `DEBUG_JOURNAL_SAVE_ISSUE.md` - Phân tích vấn đề
- `JOURNAL_SAVE_FIX.md` - Fix status field issue
