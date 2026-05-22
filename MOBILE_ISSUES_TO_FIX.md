# 🐛 Mobile App - Issues to Fix

## Vấn đề đã phát hiện:

### 1. ✅ **Tabs quá to (đã fix)**
**Vấn đề**: Tabs "Thông tin dân dẻ" và "Thức ăn & Dinh dưỡng" chiếm quá nhiều không gian

**Giải pháp đã áp dụng**:
- Giảm fontSize từ 14 → 13
- Thêm minWidth: 100, maxWidth: 180
- Tăng paddingVertical từ 8 → 10 để cân đối

**File đã sửa**: `mobile/src/screens/JournalEntryScreen.js`

---

### 2. ⚠️ **Dữ liệu không đồng bộ với web**

**Vấn đề**: Dữ liệu nhập trên mobile không hiển thị đúng trên web (hoặc ngược lại)

**Nguyên nhân có thể**:
1. **Cấu trúc data khác nhau**:
   - Mobile lưu: `{ tableName: { fieldName: value } }`
   - Web có thể lưu khác format

2. **Field names không khớp**:
   - Mobile dùng `field.name` từ schema
   - Web có thể dùng field names khác

3. **Data nesting level khác**:
   - Mobile: `journal.data[tableName][fieldName]`
   - Web: Có thể có structure khác

**Cần kiểm tra**:
```javascript
// Mobile saves:
{
  data: {
    "Thông tin dân dẻ": {
      "tenTrai": "ABC Farm",
      "diaChi": "123 Street"
    },
    "Thức ăn & Dinh dưỡng": {
      "loaiThucAn": "Concentrate",
      "soLuong": 100
    }
  }
}

// Web expects: ???
```

**Giải pháp**:
1. So sánh payload khi mobile POST vs web POST
2. Kiểm tra backend controller xử lý data như thế nào
3. Đảm bảo cả mobile và web dùng cùng structure

---

### 3. 🔍 **Cần kiểm tra thêm**:

#### A. Login field name
- Backend expect: `identifier`
- Mobile đang dùng: `username` hoặc `email`?
- **Action**: Cần update LoginScreen.js

#### B. Journal data structure
- Kiểm tra xem mobile và web có dùng cùng format không
- Test: Tạo journal trên mobile → Xem trên web
- Test: Tạo journal trên web → Xem trên mobile

#### C. Multi-row tables
- Schema có `isMultiRow: true` (như "Biểu 1: PHIẾU NHẬP")
- Mobile có handle được không?
- Cần thêm UI để add/remove rows

---

## 🔧 **Action Items**:

### Priority 1 (Critical):
- [ ] Fix data structure để đồng bộ mobile ↔ web
- [ ] Update LoginScreen để dùng `identifier` field
- [ ] Test create journal: mobile → view on web
- [ ] Test create journal: web → view on mobile

### Priority 2 (Important):
- [ ] Add support cho multi-row tables
- [ ] Add date picker thay vì text input cho date fields
- [ ] Add validation cho required fields
- [ ] Show error messages khi save fail

### Priority 3 (Nice to have):
- [ ] Add image upload cho fields
- [ ] Add signature field
- [ ] Add auto-save draft
- [ ] Add offline support

---

## 📝 **Test Plan**:

### Test Case 1: Data Sync Mobile → Web
1. Login trên mobile với user X
2. Tạo nhật ký "Dê thịt"
3. Điền form:
   - Tab 1: Tên trại, Địa chỉ
   - Tab 2: Loại thức ăn, Số lượng
4. Click "Lưu nháp"
5. Login trên web với cùng user X
6. Mở nhật ký vừa tạo
7. **Expected**: Tất cả data hiển thị đúng
8. **Actual**: ???

### Test Case 2: Data Sync Web → Mobile
1. Login trên web với user Y
2. Tạo nhật ký "Lợn thịt"
3. Điền đầy đủ thông tin
4. Lưu nháp
5. Login trên mobile với user Y
6. Mở nhật ký vừa tạo
7. **Expected**: Tất cả data hiển thị đúng
8. **Actual**: ???

---

## 🐛 **Debug Steps**:

### Step 1: Check Mobile POST payload
```javascript
// Add console.log in JournalEntryScreen.js
const handleSave = (status = 'Draft') => {
  console.log('=== MOBILE SAVE PAYLOAD ===');
  console.log('Schema ID:', schemaId);
  console.log('Form Data:', JSON.stringify(formData, null, 2));
  console.log('Status:', status);
  
  saveMutation.mutate({ data: formData, status });
};
```

### Step 2: Check Web POST payload
```javascript
// Add console.log in frontend JournalEntry.jsx
// Compare với mobile payload
```

### Step 3: Check Backend receives
```javascript
// Add console.log in backend journalController.js
exports.createJournal = async (req, res) => {
  console.log('=== BACKEND RECEIVED ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  // ...
};
```

### Step 4: Compare structures
- Mobile payload
- Web payload  
- Backend expects
- Database stores

---

## 💡 **Suspected Root Cause**:

Dựa trên code đã đọc, tôi nghi ngờ:

1. **Mobile đang lưu đúng format** ✓
   ```javascript
   {
     schemaId: "xxx",
     data: {
       "Thông tin dân dẻ": { ... },
       "Thức ăn & Dinh dưỡng": { ... }
     },
     status: "Draft"
   }
   ```

2. **Web có thể đang dùng format khác** ⚠️
   - Cần kiểm tra frontend/src/pages/Journal/JournalEntry.jsx
   - Xem nó build payload như thế nào

3. **Backend có thể không validate structure** ⚠️
   - Lưu bất kỳ data nào vào
   - Không có schema validation

**Recommendation**: 
- Thêm data structure validation ở backend
- Đảm bảo mobile và web dùng cùng format
- Add migration script nếu cần convert old data

---

## ✅ **Next Steps**:

1. **Immediate** (Bây giờ):
   - Chạy app sau khi fix tabs
   - Test xem tabs đã nhỏ gọn hơn chưa

2. **Short-term** (Hôm nay):
   - Debug data structure issue
   - So sánh mobile vs web payload
   - Fix để đồng bộ

3. **Medium-term** (Tuần này):
   - Add multi-row table support
   - Add proper date picker
   - Add validation

4. **Long-term** (Tháng này):
   - Add image upload
   - Add signature
   - Add offline mode

---

**Status**: 🟡 In Progress
**Last Updated**: 2024
**Priority**: High
