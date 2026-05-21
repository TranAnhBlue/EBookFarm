# Changelog - Mobile App Updates

## v1.2.0 - Bổ sung các màn hình chính từ web app

### Màn hình mới được thêm

#### 1. **JournalEntryScreen** - Tạo/Sửa nhật ký sản xuất
- Form động dựa trên schema từ backend
- Hỗ trợ nhiều loại field: text, number, textarea, select, date
- Tab navigation cho các bảng khác nhau
- Lưu nháp và gửi duyệt
- Validation và error handling
- Loading states

#### 2. **ProductionTechScreen** - Tài liệu kỹ thuật VietGAP
- 3 danh mục chính: Trồng trọt, Chăn nuôi, Thủy sản
- Danh sách tài liệu hướng dẫn kỹ thuật
- Modal xem chi tiết tài liệu
- UI/UX với màu sắc phân biệt theo danh mục
- Thông báo lưu ý quan trọng

#### 3. **NotificationsScreen** - Thông báo hệ thống
- Danh sách thông báo với icon theo loại
- Phân biệt đã đọc/chưa đọc
- Format thời gian tương đối (vừa xong, X phút trước, v.v.)
- Pull-to-refresh
- Empty state

#### 4. **SettingsScreen** - Cài đặt ứng dụng
- Quản lý tài khoản (thông tin, đổi mật khẩu)
- Cài đặt thông báo (push, email)
- Giao diện (chế độ tối - đang phát triển)
- Thông tin ứng dụng
- Đăng xuất

### Cập nhật các màn hình hiện có

#### **ProfileScreen**
- Thêm navigation đến NotificationsScreen
- Thêm navigation đến ProductionTechScreen
- Thêm navigation đến SettingsScreen
- Cập nhật menu items với icon và màu sắc mới

#### **App.js**
- Thêm 4 màn hình mới vào Stack Navigator
- Import các component mới

## v1.1.0 - Bổ sung các màn hình News và Account

### Các màn hình đã có từ phiên bản trước

### 1. **Tin tức (News)**
- **NewsListScreen.js** - Danh sách tin tức với filter theo category
  - Hiển thị danh sách tin tức với ảnh thumbnail
  - Filter theo danh mục (Tất cả, Công nghệ, Thị trường, v.v.)
  - Pull-to-refresh để cập nhật tin tức mới
  - Navigation đến chi tiết tin tức

- **NewsDetailScreen.js** - Chi tiết tin tức
  - Hiển thị nội dung đầy đủ của bài viết
  - Ảnh featured và gallery
  - Thông tin tác giả
  - Chức năng like và share
  - Tags và metadata

### 2. **Quản lý tài khoản**
- **AccountInfoScreen.js** - Thông tin tài khoản chi tiết
  - Cập nhật thông tin cá nhân (họ tên, SĐT, địa chỉ)
  - Upload avatar
  - Thông tin tổ chức
  - Thông tin nông trại (cho Farmer/User)
  - Form validation

- **ChangePasswordScreen.js** - Đổi mật khẩu
  - Form đổi mật khẩu với validation
  - Show/hide password
  - Password strength requirements
  - Security notice

### 3. **Cập nhật ProfileScreen**
- Thêm menu navigation đến các màn hình mới
- Hiển thị avatar người dùng
- Quick access đến:
  - Thông tin tài khoản
  - Đổi mật khẩu
  - Tin tức
  - Cài đặt
- Footer với version info

### 4. **Cập nhật HomeScreen**
- Thêm section tin tức với horizontal scroll
- Link "Xem tất cả" đến NewsListScreen
- Click vào tin tức để xem chi tiết
- Hiển thị ảnh thumbnail tin tức

## Cấu trúc Navigation (Cập nhật)

```
MainTabs
├── Home (HomeScreen)
├── Journals (JournalListScreen)
│   └── JournalEntry (Stack) - MỚI
├── Inventory (InventoryScreen)
├── Supply (SupplyScreen)
├── AI (AIScreen)
├── TCVN (TCVNScreen)
└── Profile (ProfileScreen)
    ├── AccountInfo (Stack)
    ├── ChangePassword (Stack)
    ├── Notifications (Stack) - MỚI
    ├── NewsList (Stack)
    │   └── NewsDetail (Stack)
    ├── ProductionTech (Stack) - MỚI
    └── Settings (Stack) - MỚI

Stack Screens:
├── Scanner
├── TraceDetail
├── NewsList
├── NewsDetail
├── AccountInfo
├── ChangePassword
├── JournalEntry - MỚI
├── ProductionTech - MỚI
├── Notifications - MỚI
└── Settings - MỚI
```

## API Endpoints được sử dụng

### News
- `GET /news` - Lấy danh sách tin tức
- `GET /news/:id` - Lấy chi tiết tin tức

### User Profile
- `GET /users/profile` - Lấy thông tin user
- `PUT /users/profile` - Cập nhật thông tin user
- `POST /upload/avatar` - Upload avatar

### Journals
- `GET /journals` - Lấy danh sách nhật ký
- `GET /journals/:id` - Lấy chi tiết nhật ký
- `POST /journals` - Tạo nhật ký mới
- `PUT /journals/:id` - Cập nhật nhật ký

### Schemas
- `GET /schemas` - Lấy danh sách schema
- `GET /schemas/:id` - Lấy chi tiết schema

### Notifications
- `GET /notifications` - Lấy danh sách thông báo

## Features chính

### 1. Nhật ký sản xuất
- ✅ Tạo nhật ký mới từ schema
- ✅ Form động theo cấu trúc schema
- ✅ Lưu nháp và gửi duyệt
- ✅ Validation fields
- ✅ Tab navigation cho nhiều bảng

### 2. Tài liệu kỹ thuật
- ✅ 3 danh mục: Trồng trọt, Chăn nuôi, Thủy sản
- ✅ Danh sách tài liệu theo danh mục
- ✅ Xem chi tiết tài liệu
- ✅ UI phân biệt màu sắc

### 3. Thông báo
- ✅ Danh sách thông báo
- ✅ Phân loại theo type
- ✅ Đánh dấu đã đọc/chưa đọc
- ✅ Format thời gian

### 4. Cài đặt
- ✅ Quản lý tài khoản
- ✅ Cài đặt thông báo
- ✅ Thông tin ứng dụng
- ✅ Đăng xuất

### 5. Tin tức
- ✅ Danh sách tin tức với ảnh
- ✅ Filter theo category
- ✅ Chi tiết tin tức đầy đủ
- ✅ Like và share
- ✅ Gallery ảnh
- ✅ Pull-to-refresh

### 6. Quản lý tài khoản
- ✅ Cập nhật thông tin cá nhân
- ✅ Upload avatar
- ✅ Đổi mật khẩu
- ✅ Form validation
- ✅ Security features

### 7. UI/UX
- ✅ Modern design với shadows và rounded corners
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Responsive layout

## Dependencies

Các package đã được sử dụng:
- `@react-navigation/native` - Navigation
- `@react-navigation/native-stack` - Stack navigation
- `@react-navigation/bottom-tabs` - Tab navigation
- `@tanstack/react-query` - Data fetching
- `expo-image-picker` - Image picker
- `@expo/vector-icons` - Icons
- `axios` - HTTP client
- `zustand` - State management

## Các màn hình còn có thể bổ sung

### Admin Features
- [ ] Dashboard với charts và statistics
- [ ] User management
- [ ] System logs
- [ ] Reports

### HTX Features
- [ ] Farmer management
- [ ] Batch management
- [ ] Journal approval

### Farmer Features
- [ ] Weather forecast
- [ ] IoT sensors dashboard
- [ ] Certifications management

### Common Features
- [ ] Help & Support
- [ ] About
- [ ] Language settings
- [ ] Dark mode (đang phát triển)

## Testing

Để test các màn hình mới:

1. **Nhật ký sản xuất**
   - Vào Journals → Click nút "+" để tạo mới
   - Chọn loại schema
   - Điền thông tin vào các tab
   - Test lưu nháp và gửi duyệt

2. **Tài liệu kỹ thuật**
   - Vào Profile → Click "Tiêu chuẩn & Quy trình"
   - Chọn danh mục
   - Click vào tài liệu để xem chi tiết

3. **Thông báo**
   - Vào Profile → Click "Thông báo"
   - Test pull-to-refresh

4. **Cài đặt**
   - Vào Profile → Click "Cài đặt"
   - Test các toggle switches
   - Test navigation đến các màn hình con

5. **Tin tức**
   - Vào Home → Click "Xem tất cả" ở section tin tức
   - Hoặc vào Profile → Click "Tin tức"
   - Test filter categories
   - Test click vào tin tức để xem chi tiết
   - Test like và share

6. **Tài khoản**
   - Vào Profile → Click "Thông tin tài khoản"
   - Test update thông tin
   - Test upload avatar
   - Vào Profile → Click "Đổi mật khẩu"
   - Test đổi mật khẩu với validation

## Notes

- Tất cả màn hình đều có loading states
- Error handling với Alert
- Pull-to-refresh cho danh sách
- Form validation
- Responsive design
- Smooth navigation transitions
- Consistent UI/UX across all screens

## Version

**v1.2.0** - Bổ sung các màn hình JournalEntry, ProductionTech, Notifications, Settings và cập nhật navigation.

**v1.1.0** - Bổ sung các màn hình News, Account Info, Change Password và cập nhật Profile, Home screens.
