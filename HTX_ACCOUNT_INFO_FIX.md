# Sửa lỗi hiển thị thông tin HTX trong Quản lý tài khoản

## Vấn đề
Người dùng không thể thấy HTX liên kết của mình khi xem thông tin tài khoản cá nhân. Điều này áp dụng cho:
- **Nông dân/Người dùng** (Farmer/User): Không thấy HTX đang quản lý họ
- **Các vai trò HTX** (Ban Kỹ thuật, Phân phối, Kế toán, Kiểm soát): Không thấy HTX chính mà họ thuộc về

Trong phần **Danh sách tài khoản** (UserManagement), admin có thể thấy và gán HTX, nhưng trong phần **Thông tin tài khoản** (AccountInfo), người dùng không thấy thông tin này.

## Cấu trúc vai trò HTX

### HTX_DIRECTOR (Giám đốc HTX)
- Là **tổ chức HTX chính**
- **Không có** `htxId` (hoặc `htxId = null`)
- Là người đứng đầu tổ chức
- Có thể tạo và quản lý các vai trò HTX khác

### Các vai trò HTX khác
Tất cả đều **có `htxId`** trỏ đến **HTX_DIRECTOR** (tổ chức mẹ):
- **HTX_TECHNICAL** (Ban Kỹ thuật): Quản lý kỹ thuật, nhật ký HTX
- **HTX_DISTRIBUTION** (Ban Phân phối): Quản lý phân phối, xuất hàng
- **HTX_ACCOUNTANT** (Kế toán): Quản lý tài chính
- **HTX_SUPERVISOR** (Ban Kiểm soát): Giám sát, thanh tra

### Farmer/User
- Có `htxId` trỏ đến **HTX_DIRECTOR** (HTX quản lý họ)
- Hoặc `htxId = null` nếu độc lập/tự do

## Nguyên nhân
1. **Backend**: Middleware `protect` không populate trường `htxId` khi load thông tin user
2. **Frontend Web**: Trang `AccountInfo.jsx` không hiển thị thông tin HTX liên kết
3. **Mobile**: Màn hình `AccountInfoScreen.js` không hiển thị thông tin HTX liên kết

## Giải pháp

### 1. Backend - Populate htxId trong middleware (✅ Đã sửa)
**File**: `backend/src/middlewares/authMiddleware.js`

```javascript
// TRƯỚC
req.user = await User.findById(decoded.id).select('-password');

// SAU
req.user = await User.findById(decoded.id)
  .select('-password')
  .populate('htxId', 'fullname username email phone')
  .populate('groupId', 'name');
```

**Lợi ích**: 
- Mọi API endpoint sử dụng middleware `protect` đều tự động có thông tin HTX đầy đủ
- Không cần phải populate lại ở từng controller

### 2. Frontend Web - Hiển thị HTX trong AccountInfo (✅ Đã sửa)
**File**: `frontend/src/pages/Admin/AccountInfo.jsx`

Thêm section hiển thị HTX liên kết cho **tất cả vai trò có htxId**:

```jsx
{/* Thông tin HTX liên kết (Cho Farmer/User và các vai trò HTX) */}
{((['Farmer', 'User'].includes(user?.role)) || 
  ['HTX_TECHNICAL', 'HTX_DISTRIBUTION', 'HTX_ACCOUNTANT', 'HTX_SUPERVISOR'].includes(user?.role?.toUpperCase())) && (
  <>
    <Divider className="!my-2 border-gray-100" />
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-400">
        <ShopOutlined />
      </div>
      <div className="flex-1 min-w-0">
        <Text type="secondary" className="text-[9px] uppercase font-bold block opacity-60">
          HTX liên kết
        </Text>
        <Text strong className="text-sm block">
          {user?.htxId ? 
            (typeof user.htxId === 'object' ? (user.htxId.fullname || user.htxId.username) : user.htxId) 
            : 'Chưa liên kết HTX'}
        </Text>
      </div>
    </div>
  </>
)}
```

**Hiển thị**:
- Hiển thị cho: Farmer, User, HTX_TECHNICAL, HTX_DISTRIBUTION, HTX_ACCOUNTANT, HTX_SUPERVISOR
- **KHÔNG** hiển thị cho: Admin, HTX_DIRECTOR (vì họ không thuộc HTX nào)
- Icon màu vàng amber với biểu tượng cửa hàng
- Label: "HTX liên kết"
- Giá trị: Tên HTX hoặc "Chưa liên kết HTX"

### 3. Mobile - Hiển thị HTX trong AccountInfoScreen (✅ Đã sửa)
**File**: `mobile/src/screens/AccountInfoScreen.js`

Thêm trường chỉ đọc hiển thị HTX liên kết:

```javascript
{/* Hiển thị HTX liên kết cho Farmer/User và các vai trò HTX */}
{(isFarmerLike || 
  ['HTX_TECHNICAL', 'HTX_DISTRIBUTION', 'HTX_ACCOUNTANT', 'HTX_SUPERVISOR'].includes(user?.role?.toUpperCase())) && (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>HTX liên kết</Text>
    <View style={[styles.input, styles.inputDisabled, { justifyContent: 'center' }]}>
      <Text style={styles.inputDisabled}>
        {user?.htxId ? 
          (typeof user.htxId === 'object' ? (user.htxId.fullname || user.htxId.username) : user.htxId) 
          : 'Chưa liên kết HTX'}
      </Text>
    </View>
  </View>
)}
```

**Hiển thị**:
- Trường input bị disabled (màu xám)
- Hiển thị cho: Farmer, User và tất cả vai trò HTX (trừ HTX_DIRECTOR)
- Hiển thị tên HTX hoặc "Chưa liên kết HTX"

## Cải tiến phần UserManagement (✅ Đã sửa)

### 4. Hiển thị đầy đủ các vai trò HTX
**File**: `frontend/src/pages/Admin/UserManagement.jsx`

#### 4.1. Dropdown chọn vai trò với nhóm phân cấp
```jsx
<Select className="h-11 w-full" dropdownClassName="rounded-xl">
  <Select.Option value="Admin">Quản trị viên</Select.Option>
  <Select.OptGroup label="🏢 Vai trò HTX">
    <Select.Option value="HTX_DIRECTOR">Giám đốc HTX</Select.Option>
    <Select.Option value="HTX_TECHNICAL">Ban Kỹ thuật</Select.Option>
    <Select.Option value="HTX_DISTRIBUTION">Ban Phân phối</Select.Option>
    <Select.Option value="HTX_ACCOUNTANT">Kế toán</Select.Option>
    <Select.Option value="HTX_SUPERVISOR">Ban Kiểm soát</Select.Option>
  </Select.OptGroup>
  <Select.OptGroup label="👨‍🌾 Thành viên">
    <Select.Option value="Farmer">Nông dân</Select.Option>
    <Select.Option value="User">Người dùng</Select.Option>
  </Select.OptGroup>
</Select>
```

#### 4.2. Tag hiển thị vai trò với màu sắc phân biệt
```javascript
const roleMap = {
  'Admin': { label: 'Quản trị viên', color: 'purple' },
  'HTX_DIRECTOR': { label: 'Giám đốc HTX', color: 'gold' },
  'HTX': { label: 'Giám đốc HTX', color: 'gold' },
  'HTX_TECHNICAL': { label: 'Ban Kỹ thuật', color: 'blue' },
  'HTX_DISTRIBUTION': { label: 'Ban Phân phối', color: 'green' },
  'HTX_ACCOUNTANT': { label: 'Kế toán', color: 'volcano' },
  'HTX_SUPERVISOR': { label: 'Ban Kiểm soát', color: 'magenta' },
  'Farmer': { label: 'Nông dân', color: 'cyan' },
  'User': { label: 'Người dùng', color: 'blue' }
};
```

#### 4.3. Cột "Đơn vị / HTX" phân biệt rõ ràng
```javascript
render: (_, record) => {
  const roleUpper = record.role?.toUpperCase();
  
  // HTX_DIRECTOR là tổ chức chính
  if (roleUpper === 'HTX_DIRECTOR' || roleUpper === 'HTX') {
    return <Tag color="gold">Tổ chức HTX chính</Tag>;
  }
  
  // Các vai trò HTX khác thuộc HTX_DIRECTOR
  if (['HTX_TECHNICAL', 'HTX_DISTRIBUTION', 'HTX_ACCOUNTANT', 'HTX_SUPERVISOR'].includes(roleUpper)) {
    const htx = htxList?.find(h => h._id === (record.htxId?._id || record.htxId));
    return (
      <div className="flex items-center gap-2">
        <Tag color="orange">Thành viên ban</Tag>
        <Text italic className="text-xs">→ {htx ? htx.fullname : 'Chưa gán HTX'}</Text>
      </div>
    );
  }
  
  // Farmer/User
  const htx = htxList?.find(h => h._id === (record.htxId?._id || record.htxId));
  return <Text italic>{htx ? htx.fullname : 'Cá nhân / Tự do'}</Text>;
}
```

#### 4.4. Form chọn HTX thông minh
Tự động hiển thị dropdown chọn HTX khi:
- Chọn role = **Farmer**: Tùy chọn (không bắt buộc)
- Chọn role = **HTX_TECHNICAL, HTX_DISTRIBUTION, HTX_ACCOUNTANT, HTX_SUPERVISOR**: **Bắt buộc** phải chọn HTX

```javascript
<Form.Item
  noStyle
  shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
>
  {({ getFieldValue }) => {
    const currentRole = getFieldValue('role');
    const roleUpper = currentRole?.toUpperCase();
    
    const shouldShowHtxSelect = currentRole === 'Farmer' || 
      ['HTX_TECHNICAL', 'HTX_DISTRIBUTION', 'HTX_ACCOUNTANT', 'HTX_SUPERVISOR'].includes(roleUpper);
    
    if (!shouldShowHtxSelect) return null;
    
    const isHtxRole = ['HTX_TECHNICAL', 'HTX_DISTRIBUTION', 'HTX_ACCOUNTANT', 'HTX_SUPERVISOR'].includes(roleUpper);
    
    return (
      <Form.Item
        name="htxId"
        label={isHtxRole ? "HTX liên kết" : "Hợp tác xã liên kết"}
        rules={isHtxRole ? [{ required: true, message: 'Vui lòng chọn HTX!' }] : []}
      >
        <Select 
          placeholder={isHtxRole ? "Chọn HTX..." : "Chọn HTX quản lý..."} 
          allowClear={!isHtxRole}
        >
          {htxList?.map(h => (
            <Select.Option key={h._id} value={h._id}>{h.fullname || h.username}</Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  }}
</Form.Item>
```

## Kiểm tra sau khi sửa

### Backend
1. Restart server backend
2. Login với các loại tài khoản khác nhau:
   - **HTX_DIRECTOR**: Không có htxId
   - **HTX_TECHNICAL/DISTRIBUTION/ACCOUNTANT/SUPERVISOR**: Có htxId trỏ đến HTX_DIRECTOR
   - **Farmer/User**: Có htxId trỏ đến HTX_DIRECTOR hoặc null
3. Gọi API `GET /api/users/profile` và kiểm tra:
   - Trường `htxId` có được populate với object chứa `fullname`, `username`
   - Trường `groupId` cũng được populate

### Frontend Web - Quản lý tài khoản
1. Login với tài khoản Admin
2. Vào **Quản lý tài khoản** → **Danh sách**
3. Kiểm tra:
   - ✅ Cột "Quyền hạn" hiển thị đầy đủ tất cả vai trò HTX với màu sắc khác nhau
   - ✅ Cột "Đơn vị / HTX" hiển thị:
     - "Tổ chức HTX chính" (vàng) cho HTX_DIRECTOR
     - "Thành viên ban → Tên HTX" (cam) cho các vai trò HTX khác
     - Tên HTX hoặc "Cá nhân / Tự do" cho Farmer/User
4. Thử tạo/sửa tài khoản:
   - ✅ Chọn vai trò trong dropdown với nhóm phân cấp rõ ràng
   - ✅ Khi chọn vai trò HTX (trừ HTX_DIRECTOR), dropdown "HTX liên kết" xuất hiện và **bắt buộc**
   - ✅ Khi chọn Farmer, dropdown "HTX liên kết" xuất hiện nhưng **không bắt buộc**
   - ✅ Khi chọn Admin hoặc HTX_DIRECTOR, dropdown **không xuất hiện**

### Frontend Web - Thông tin tài khoản cá nhân
1. Login với các loại tài khoản:
   - **Ban Kỹ thuật HTX**: Vào **Thông tin tài khoản**
   - **Nông dân có HTX**: Vào **Thông tin tài khoản**
2. Kiểm tra sidebar bên trái:
   - ✅ Có section "HTX liên kết" hiển thị tên HTX
   - ✅ Icon màu amber (vàng cam)
3. Login với HTX_DIRECTOR hoặc Admin:
   - ✅ **KHÔNG** hiển thị section "HTX liên kết"

### Mobile
1. Login với các loại tài khoản:
   - **Ban Phân phối HTX**
   - **Nông dân có HTX**
2. Vào **Menu** → **Thông tin tài khoản**
3. Kiểm tra:
   - ✅ Trường "HTX liên kết" hiển thị tên HTX (disabled, màu xám)
   - ✅ Hiển thị ngay sau "Thông tin cá nhân"
4. Login với HTX_DIRECTOR:
   - ✅ **KHÔNG** hiển thị trường "HTX liên kết"

## Lưu ý bảo mật
- Người dùng **KHÔNG THỂ tự thay đổi** HTX của mình
- Chỉ **Admin** có quyền gán/thay đổi HTX cho người dùng qua trang **Danh sách tài khoản**
- Trường này chỉ để **hiển thị**, không có trong form chỉnh sửa

## Cấu trúc dữ liệu

### Model User
```javascript
htxId: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'User' 
}
```

### Sau khi populate
```javascript
{
  "_id": "user123",
  "username": "farmer001",
  "fullname": "Nguyễn Văn A",
  "role": "Farmer",
  "htxId": {
    "_id": "htx123",
    "fullname": "HTX Nông nghiệp Đồng Dư",
    "username": "htx_dongdu",
    "email": "htx@dongdu.vn",
    "phone": "0901234567"
  }
}
```

## Các file đã sửa
1. `backend/src/middlewares/authMiddleware.js` - Thêm populate htxId và groupId
2. `frontend/src/pages/Admin/AccountInfo.jsx` - Hiển thị HTX trong sidebar cho tất cả vai trò có htxId
3. `mobile/src/screens/AccountInfoScreen.js` - Hiển thị HTX trong form cho tất cả vai trò có htxId
4. `frontend/src/pages/Admin/UserManagement.jsx` - Cải tiến hiển thị và quản lý vai trò HTX:
   - Dropdown chọn vai trò với nhóm phân cấp
   - Tag màu sắc phân biệt cho từng vai trò
   - Cột "Đơn vị / HTX" phân biệt rõ HTX_DIRECTOR và các vai trò khác
   - Form chọn HTX thông minh (bắt buộc cho vai trò HTX, tùy chọn cho Farmer)

## Kết quả mong đợi
✅ **Tất cả vai trò có htxId** đều thấy HTX liên kết khi xem thông tin tài khoản:
  - Farmer/User: Thấy HTX đang quản lý họ
  - HTX_TECHNICAL/DISTRIBUTION/ACCOUNTANT/SUPERVISOR: Thấy HTX chính mà họ thuộc về
✅ Admin có thể **quản lý đầy đủ các vai trò HTX** trong UserManagement
✅ **Phân biệt rõ ràng** giữa HTX_DIRECTOR (tổ chức chính) và các vai trò HTX khác (thành viên ban)
✅ Form gán HTX **thông minh**: Bắt buộc cho vai trò HTX, tùy chọn cho Farmer
✅ Thông tin HTX được **populate đầy đủ** từ backend
✅ Giao diện **nhất quán** giữa web và mobile
✅ **Bảo mật**: Người dùng không thể tự thay đổi HTX
