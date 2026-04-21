# Sửa lỗi: Google Login ghi đè Họ và Tên

## Vấn đề
Người dùng login bằng Google, sau đó đổi "Họ và tên" trong trang Account Info. Nhưng khi login lại bằng Google, tên lại về tên cũ (hoặc không hiển thị).

## Nguyên nhân

### 1. Response thiếu fullname
Khi login bằng Google, backend response **KHÔNG bao gồm `fullname`**:

```javascript
// TRƯỚC (SAI)
res.json({
  success: true,
  data: {
    _id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    token: generateToken(user.id, user.role),
    // ❌ Thiếu fullname!
  }
});
```

So sánh với login thường (có fullname):
```javascript
// Login thường (ĐÚNG)
res.json({
  success: true,
  data: {
    _id: user.id,
    username: user.username,
    fullname: user.fullname, // ✅ Có fullname
    email: user.email,
    role: user.role,
    token: generateToken(user.id, user.role),
  }
});
```

### 2. Tạo user mới thiếu fullname
Khi user login Google lần đầu, code tạo user mới nhưng **không set `fullname`**:

```javascript
// TRƯỚC (SAI)
user = await User.create({
  username: name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
  email,
  googleId: sub,
  role: 'User',
  status: 'Active'
  // ❌ Thiếu fullname!
});
```

## Giải pháp

### Fix 1: Thêm fullname vào response
```javascript
// SAU (ĐÚNG)
res.json({
  success: true,
  data: {
    _id: user.id,
    username: user.username,
    fullname: user.fullname, // ✅ Thêm fullname
    email: user.email,
    role: user.role,
    token: generateToken(user.id, user.role),
  }
});
```

### Fix 2: Set fullname khi tạo user mới
```javascript
// SAU (ĐÚNG)
user = await User.create({
  username: name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
  fullname: name, // ✅ Set fullname từ Google
  email,
  googleId: sub,
  role: 'User',
  status: 'Active'
});
```

## Luồng hoạt động

### Trường hợp 1: User mới login Google lần đầu
1. Google trả về `name`, `email`, `sub` (Google ID)
2. Backend tạo user mới với:
   - `username`: tự động generate từ name
   - `fullname`: lấy từ Google `name` ✅
   - `email`: từ Google
   - `googleId`: từ Google `sub`
3. Response bao gồm `fullname` ✅
4. Frontend lưu vào localStorage và hiển thị

### Trường hợp 2: User đã tồn tại, login Google lại
1. Backend tìm user theo `googleId` hoặc `email`
2. **KHÔNG cập nhật** fullname (giữ nguyên fullname đã chỉnh sửa) ✅
3. Response bao gồm `fullname` từ database ✅
4. Frontend hiển thị fullname đã chỉnh sửa

### Trường hợp 3: User đổi fullname trong Account Info
1. User vào trang Account Info
2. Đổi "Họ và tên" thành "Nguyễn Văn A"
3. Backend cập nhật `user.fullname = "Nguyễn Văn A"`
4. Lần login Google tiếp theo:
   - Backend tìm user (đã có googleId)
   - Response trả về `fullname: "Nguyễn Văn A"` ✅
   - Frontend hiển thị "Nguyễn Văn A"

## Điểm quan trọng

### ✅ KHÔNG ghi đè fullname khi login lại
Code hiện tại **đúng** - không cập nhật fullname khi user đã tồn tại:

```javascript
let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });

if (!user) {
  // Tạo mới - set fullname từ Google
  user = await User.create({ fullname: name, ... });
} else if (!user.googleId) {
  // Link Google account - KHÔNG cập nhật fullname
  user.googleId = sub;
  await user.save();
}
// else: User đã tồn tại và đã có googleId - KHÔNG làm gì cả ✅
```

### ✅ Response luôn bao gồm fullname
Dù user mới hay cũ, response đều có `fullname`:
- User mới: fullname từ Google
- User cũ: fullname từ database (có thể đã chỉnh sửa)

## Kết quả

### Trước khi sửa
1. Login Google lần đầu → Tên: "Trần Đức Anh" (từ Google)
2. Đổi tên thành "Nguyễn Văn A" trong Account Info
3. Login Google lại → ❌ Tên: undefined hoặc "Trần Đức Anh"

### Sau khi sửa
1. Login Google lần đầu → Tên: "Trần Đức Anh" (từ Google) ✅
2. Đổi tên thành "Nguyễn Văn A" trong Account Info ✅
3. Login Google lại → ✅ Tên: "Nguyễn Văn A" (từ database)

## Files đã sửa
- `backend/src/controllers/authController.js`:
  - Thêm `fullname: name` khi tạo user mới từ Google
  - Thêm `fullname: user.fullname` vào response

## Cách test

### Test 1: User mới
1. Logout nếu đang login
2. Login bằng Google với tài khoản chưa từng dùng
3. Kiểm tra: Tên hiển thị phải là tên từ Google account

### Test 2: Đổi tên và login lại
1. Login bằng Google
2. Vào Account Info → Đổi "Họ và tên" thành "Test User"
3. Logout
4. Login lại bằng Google
5. Kiểm tra: Tên hiển thị phải là "Test User" (không phải tên Google)

### Test 3: Kiểm tra database
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: 'your-email@gmail.com' });
  console.log('Fullname:', user.fullname);
  console.log('GoogleId:', user.googleId);
  process.exit(0);
});
"
```

## Lưu ý
- Google login **KHÔNG bao giờ** ghi đè fullname của user đã tồn tại
- Chỉ set fullname khi tạo user mới lần đầu
- User có thể tự do đổi fullname trong Account Info mà không lo bị ghi đè
