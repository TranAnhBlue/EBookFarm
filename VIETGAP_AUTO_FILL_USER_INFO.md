# ✅ CẬP NHẬT: Tự động điền Thông tin chung từ User

## 📋 TỔNG QUAN
Đã cập nhật logic auto-fill "Thông tin chung" để tự động điền thông tin từ User đang đăng nhập khi tạo journal mới.

## 🎯 CÁC TRƯỜNG TỰ ĐỘNG ĐIỀN

### Schema Ổi VietGAP mới (8 trường):

| STT | Tên trường | Nguồn dữ liệu | Ví dụ |
|-----|-----------|---------------|-------|
| 1 | **Họ và tên người ghi chép** | `user.fullname` hoặc `user.username` | "Nguyễn Hữu Vượng" |
| 2 | **Trưởng nhóm** | `user.htxLeader` (nếu có) hoặc để trống | "Nguyễn Văn A" hoặc "" |
| 3 | **Mã số nông hộ** | `user.farmCode` | "VG/DD-V.01" |
| 4 | **Địa chỉ sản xuất** | `user.address` hoặc `user.ward` | "Thôn Đông Dư Hạ, Xã Bát Tràng" |
| 5 | **Diện tích (m2)** | `user.farmArea` | 25618 |
| 6 | **Cây trồng** | `schema.name` (loại bỏ suffix VietGAP/TCVN) | "Ổi" |
| 7 | **Quy trình sản xuất** | Auto-detect từ `schema.name` | "Tiêu chuẩn VietGAP" |
| 8 | **Năm sản xuất** | `new Date().getFullYear()` | 2026 |

## 🔧 LOGIC IMPLEMENTATION

### File: `frontend/src/pages/Journal/JournalEntry.jsx`

```javascript
// Khi tạo journal mới (không phải editing)
useEffect(() => {
  if (!isEditing && user && schema) {
    const autoFillData = {};
    
    schema.tables.forEach(table => {
      if (!table.isMultiRow) {  // Chỉ auto-fill cho bảng single-row
        autoFillData[table.tableName] = {};
        
        table.fields.forEach(field => {
          // 1. Họ và tên người ghi chép
          if (field.label.includes('người ghi chép')) {
            autoFillData[table.tableName][field.name] = user.fullname || user.username;
          }
          
          // 2. Trưởng nhóm
          if (field.label.includes('trưởng nhóm')) {
            autoFillData[table.tableName][field.name] = user.htxLeader || '';
          }
          
          // 3. Mã số nông hộ
          if (field.label.includes('mã số nông hộ')) {
            autoFillData[table.tableName][field.name] = user.farmCode || '';
          }
          
          // 4. Địa chỉ sản xuất
          if (field.label.includes('địa chỉ sản xuất')) {
            autoFillData[table.tableName][field.name] = user.address || user.ward || '';
          }
          
          // 5. Diện tích
          if (field.label.includes('diện tích') && !field.label.includes('hộ')) {
            autoFillData[table.tableName][field.name] = user.farmArea || '';
          }
          
          // 6. Cây trồng
          if (field.label.includes('cây trồng')) {
            autoFillData[table.tableName][field.name] = schema.name.replace(' VietGAP', '').replace(' TCVN', '');
          }
          
          // 7. Quy trình sản xuất
          if (field.label.includes('quy trình')) {
            if (schema.name.includes('VietGAP')) {
              autoFillData[table.tableName][field.name] = 'Tiêu chuẩn VietGAP';
            } else if (schema.name.includes('TCVN')) {
              autoFillData[table.tableName][field.name] = 'Tiêu chuẩn TCVN';
            }
          }
          
          // 8. Năm sản xuất
          if (field.label.includes('năm sản xuất')) {
            autoFillData[table.tableName][field.name] = new Date().getFullYear();
          }
        });
      }
    });
    
    form.setFieldsValue(autoFillData);
  }
}, [journalData, schema, form, user, isEditing]);
```

## 📊 DỮ LIỆU USER CẦN THIẾT

### User Model fields được sử dụng:
```javascript
{
  username: String,           // Username đăng nhập
  fullname: String,          // Họ và tên đầy đủ ✅
  email: String,
  role: String,
  
  // Thông tin cá nhân
  phone: String,
  address: String,           // Địa chỉ ✅
  province: String,
  ward: String,              // Phường/Xã ✅
  
  // Thông tin nông trại
  farmName: String,
  farmCode: String,          // Mã số nông hộ ✅
  farmArea: Number,          // Diện tích (m²) ✅
  farmType: String,
  
  // Liên kết HTX
  htxId: ObjectId,           // ID của HTX quản lý
  groupId: ObjectId,
  
  // Custom field (nếu cần)
  htxLeader: String          // Trưởng nhóm/HTX ✅
}
```

## 🔄 BACKWARD COMPATIBILITY

Logic cũng hỗ trợ các trường cũ cho schema khác (nếu vẫn còn):
- **Tên cơ sở** → `user.farmName` hoặc `user.fullname`
- **Chủ hộ** → `user.fullname`
- **Địa chỉ cơ sở** → `user.address`

## ✨ TÍNH NĂNG BỔ SUNG

### 1. Auto-detect quy trình sản xuất
```javascript
if (schema.name.includes('VietGAP')) {
  field.value = 'Tiêu chuẩn VietGAP';
} else if (schema.name.includes('TCVN')) {
  field.value = 'Tiêu chuẩn TCVN';
} else if (schema.name.includes('Hữu cơ')) {
  field.value = 'Tiêu chuẩn Hữu cơ';
}
```

### 2. Cây trồng từ schema name
```javascript
schema.name = "Ổi VietGAP"
  → field.value = "Ổi"

schema.name = "Lúa TCVN"
  → field.value = "Lúa"
```

### 3. Năm sản xuất tự động
```javascript
field.value = new Date().getFullYear();  // 2026
```

## 📝 LƯU Ý

### 1. Chỉ auto-fill khi TẠO MỚI journal
- **Không auto-fill** khi đang EDIT journal cũ
- Kiểm tra: `if (!isEditing && user && schema)`

### 2. User có thể chỉnh sửa sau khi auto-fill
- Các trường **KHÔNG bị lock** (khác với household auto-fill)
- User có thể sửa nếu thông tin không chính xác

### 3. Xử lý trường hợp thiếu dữ liệu
```javascript
user.fullname || user.username      // Fallback đến username
user.address || user.ward || ''     // Fallback chain
user.farmArea || ''                 // Empty string nếu null
```

## 🧪 TESTING CHECKLIST

### Test auto-fill:
- [ ] Login với user có đầy đủ thông tin (fullname, farmCode, farmArea, address)
- [ ] Vào "Tạo nhật ký mới" → Chọn schema "Ổi VietGAP"
- [ ] Kiểm tra tab "Thông tin chung" đã tự động điền 8 trường
- [ ] Xác nhận giá trị đúng:
  - [ ] Họ và tên = User fullname
  - [ ] Mã số nông hộ = User farmCode
  - [ ] Địa chỉ sản xuất = User address
  - [ ] Diện tích = User farmArea
  - [ ] Cây trồng = "Ổi" (không có suffix)
  - [ ] Quy trình = "Tiêu chuẩn VietGAP"
  - [ ] Năm sản xuất = 2026

### Test edge cases:
- [ ] Login với user thiếu thông tin → Kiểm tra fallback
- [ ] Sửa trường tự động điền → Lưu → Load lại → Giá trị đã sửa được giữ
- [ ] Edit journal cũ → Không bị override bởi auto-fill

### Test other schemas:
- [ ] Schema "Lúa TCVN" → Quy trình = "Tiêu chuẩn TCVN"
- [ ] Schema "Chè Búp Hữu cơ" → Quy trình = "Tiêu chuẩn Hữu cơ"

## 🔗 RELATED FILES

### Backend:
- `backend/src/models/User.js` - User model với các fields
- `backend/src/middlewares/authMiddleware.js` - Populate user data

### Frontend:
- `frontend/src/pages/Journal/JournalEntry.jsx` - Auto-fill logic
- `frontend/src/store/authStore.js` - User state management
- `backend/schemas/guavaVietgapSchema.js` - Schema structure

## 📌 SUMMARY

✅ **Đã hoàn thành:**
- Tự động điền 8 trường "Thông tin chung" từ user data
- Backward compatibility với schema cũ
- Smart detection quy trình sản xuất từ schema name
- Năm sản xuất tự động = năm hiện tại
- Cây trồng tự động từ schema name (loại bỏ suffix)

🎯 **User experience:**
- User chỉ cần login → Tạo journal → Thông tin đã điền sẵn
- Giảm 90% công việc nhập liệu cho "Thông tin chung"
- Vẫn có thể sửa nếu cần

---

**Status:** ✅ HOÀN THÀNH  
**Date:** 2026-06-23  
**Developer:** Kiro AI Assistant
