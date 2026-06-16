# Hướng dẫn Migration: Cập nhật Role HTX

## Vấn đề
Hệ thống cũ chỉ có role **HTX** (với các biến thể: HTX, Htx, htx).  
Hệ thống mới có **6 vai trò HTX** với phân quyền rõ ràng:
- **HTX_DIRECTOR** (Giám đốc HTX - tổ chức chính)
- **HTX_TECHNICAL** (Ban Kỹ thuật)
- **HTX_DISTRIBUTION** (Ban Phân phối)
- **HTX_ACCOUNTANT** (Kế toán)
- **HTX_SUPERVISOR** (Ban Kiểm soát)

## Giải pháp

### Bước 1: Chạy Migration Script
Script sẽ tự động chuyển đổi tất cả role HTX cũ thành **HTX_DIRECTOR**:

```bash
cd backend
node migrate-htx-role-to-htx-director.js
```

**Output mẫu:**
```
✅ Đã kết nối MongoDB

📊 Tìm thấy 3 user có role HTX cũ

Danh sách user sẽ được cập nhật:
1. HTX Nông nghiệp Đồng Dư (htx@dongdu.vn) - Role hiện tại: HTX
2. HTX Dịch vụ Nông nghiệp Đông Dư (dongdu@ebookfarm.test) - Role hiện tại: Htx
3. HỢP TÁC XÃ DỊCH VỤ NÔNG NGHIỆP ĐỒNG DƯ (htx123@example.com) - Role hiện tại: htx

🔄 Bắt đầu cập nhật...

✅ [1/3] Cập nhật thành công: HTX Nông nghiệp Đồng Dư (HTX → HTX_DIRECTOR)
✅ [2/3] Cập nhật thành công: HTX Dịch vụ Nông nghiệp Đông Dư (Htx → HTX_DIRECTOR)
✅ [3/3] Cập nhật thành công: HỢP TÁC XÃ DỊCH VỤ NÔNG NGHIỆP ĐỒNG DƯ (htx → HTX_DIRECTOR)

📊 KẾT QUẢ MIGRATION:
   ✅ Thành công: 3/3

✅ Migration hoàn tất!
🔌 Đã ngắt kết nối MongoDB
```

### Bước 2: Restart Backend
Sau khi migration, restart backend server để áp dụng các thay đổi:

```bash
# Nếu đang chạy
Ctrl + C

# Chạy lại
npm run dev
```

### Bước 3: Kiểm tra
1. Login vào hệ thống với tài khoản Admin
2. Vào **Quản lý tài khoản** → **Danh sách**
3. Kiểm tra:
   - ✅ Các user HTX cũ đã chuyển thành "Giám đốc HTX" (tag vàng)
   - ✅ Cột "Đơn vị / HTX" hiển thị "Tổ chức HTX chính"
4. Thử tạo user mới với các vai trò:
   - ✅ Chọn "Ban Kỹ thuật" → Dropdown "HTX liên kết" xuất hiện (bắt buộc)
   - ✅ Danh sách HTX hiển thị các HTX_DIRECTOR

### Bước 4: Tạo các vai trò HTX mới (nếu cần)
Sau khi migration, bạn có thể tạo thêm các thành viên ban cho HTX:

1. Vào **Quản lý tài khoản** → **Thêm tài khoản mới**
2. Chọn vai trò: **Ban Kỹ thuật / Ban Phân phối / Kế toán / Ban Kiểm soát**
3. Chọn **HTX liên kết** (bắt buộc): Chọn HTX tổ chức chính
4. Điền thông tin và **Tạo tài khoản**

## Các thay đổi Backend

### 1. API lấy danh sách HTX
**File**: `backend/src/controllers/userController.js`

```javascript
// TRƯỚC
const htxs = await User.find({ 
  role: { $regex: /^htx$/i }, 
  status: 'Active' 
})

// SAU
const htxs = await User.find({ 
  role: { $in: ['HTX', 'Htx', 'htx', 'HTX_DIRECTOR'] },
  status: 'Active' 
})
```

### 2. Permission checks
**Files**: 
- `backend/src/controllers/productController.js`
- `backend/src/controllers/portalController.js`
- `backend/src/controllers/batchController.js`

```javascript
// TRƯỚC
if (role !== 'HTX' && role !== 'ADMIN') { ... }

// SAU
const isHtxDirector = role === 'HTX' || role === 'HTX_DIRECTOR';
if (!isHtxDirector && role !== 'ADMIN') { ... }
```

### 3. Filter danh sách
```javascript
// TRƯỚC
if (role === 'HTX') {
  filter.createdBy = req.user._id;
}

// SAU
const isHtxDirector = role === 'HTX' || role === 'HTX_DIRECTOR';
if (isHtxDirector) {
  filter.createdBy = req.user._id;
}
```

## Các thay đổi Frontend

### File: `frontend/src/pages/Admin/UserManagement.jsx`

```javascript
// TRƯỚC: Chỉ lấy role 'HTX'
const htxList = useMemo(() => {
  return users?.filter(u => u.role?.toUpperCase() === 'HTX') || [];
}, [users]);

// SAU: Lấy cả 'HTX' và 'HTX_DIRECTOR'
const htxList = useMemo(() => {
  return users?.filter(u => {
    const roleUpper = u.role?.toUpperCase();
    return roleUpper === 'HTX' || roleUpper === 'HTX_DIRECTOR';
  }) || [];
}, [users]);
```

## Lưu ý quan trọng

### Backward Compatibility
Backend vẫn **tương thích ngược** với role 'HTX' cũ:
- ✅ Các query tìm kiếm HTX bao gồm cả `'HTX'` và `'HTX_DIRECTOR'`
- ✅ Permission checks kiểm tra cả hai giá trị
- ✅ Hệ thống vẫn hoạt động ngay cả khi chưa chạy migration

### Khuyến nghị
- ✅ Chạy migration script **ngay sau khi deploy** code mới
- ✅ Backup database **trước khi chạy migration**
- ✅ Test kỹ các tính năng HTX sau khi migration
- ✅ Thông báo cho các HTX về các vai trò mới

### Rollback (nếu cần)
Nếu cần quay lại role cũ:

```javascript
// Trong MongoDB shell hoặc script
db.users.updateMany(
  { role: 'HTX_DIRECTOR' },
  { $set: { role: 'HTX' } }
)
```

## Checklist sau Migration

- [ ] Chạy migration script thành công
- [ ] Restart backend server
- [ ] Login với tài khoản HTX cũ → Kiểm tra vẫn truy cập được
- [ ] Kiểm tra UserManagement hiển thị đúng "Giám đốc HTX"
- [ ] Thử tạo user mới với vai trò "Ban Kỹ thuật"
- [ ] Kiểm tra dropdown "HTX liên kết" hiển thị đủ HTX
- [ ] Login với tài khoản mới tạo → Kiểm tra thấy "HTX liên kết" trong AccountInfo
- [ ] Test các tính năng HTX: Tạo sản phẩm, tạo lô, đồng bộ cổng

## Kết quả mong đợi

✅ Tất cả user HTX cũ đã chuyển thành **HTX_DIRECTOR**  
✅ Dropdown chọn HTX hiển thị đầy đủ tất cả HTX  
✅ Có thể tạo các vai trò HTX mới (Ban Kỹ thuật, Phân phối, v.v.)  
✅ Tất cả tính năng HTX vẫn hoạt động bình thường  
✅ Phân quyền rõ ràng cho từng vai trò HTX  
