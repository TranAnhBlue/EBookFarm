# 📱 EBookFarm Mobile App - Test Checklist

## 🎯 Hướng dẫn Test Chi tiết

---

## 1️⃣ **Home Screen - Dashboard Stats**

### ✅ Các bước test:
1. Mở app và đăng nhập
2. Xem màn hình Home (tab đầu tiên)
3. Kiểm tra các thông tin hiển thị:

### 📊 Cần kiểm tra:
- [ ] **User Info**
  - Avatar/Initial hiển thị đúng
  - Tên người dùng hiển thị
  - Organization/HTX hiển thị (nếu có)
  
- [ ] **Notification Button**
  - Nút chuông ở góc phải
  - Badge số thông báo (nếu có)
  - Click vào mở màn Notifications
  
- [ ] **Stats Cards**
  - "Tổng nhật ký" - hiển thị số
  - "Chờ duyệt" - hiển thị số
  - "Đã duyệt" - hiển thị số
  - "Hoàn thành" - hiển thị số (màu xanh)
  
- [ ] **Quick Actions**
  - Card "Thông báo" (màu vàng)
  - Card "Nhật ký sản xuất" (màu xanh)
  - Click vào navigate đúng màn hình
  
- [ ] **Information Access**
  - Card "Kho vật tư" (màu cyan)
  - Card "Xin cấp vật tư" (màu đỏ)
  - Card "Tài liệu kỹ thuật" (màu tím)
  
- [ ] **Reports**
  - Card "Truy xuất nguồn gốc" (màu xanh lá)
  - Card "Tiêu chuẩn TCVN" (màu vàng)
  
- [ ] **Pull to Refresh**
  - Kéo xuống để refresh
  - Loading indicator hiển thị
  - Data cập nhật

### ❌ Lỗi có thể gặp:
- Stats không load → Check API `/reports/dashboard-stats`
- Avatar không hiển thị → Check user profile data
- Cards không click được → Check navigation setup

---

## 2️⃣ **Journals - Tạo và Quản lý Nhật ký**

### ✅ Test Flow: Tạo nhật ký mới

#### Bước 1: Xem danh sách
- [ ] Click tab "Nhật ký" (tab 2)
- [ ] Xem danh sách nhật ký hiện có
- [ ] Kiểm tra filter: Tất cả, Lưu nháp, Chờ duyệt, Đã duyệt, Đã khóa
- [ ] Search box hoạt động

#### Bước 2: Tạo nhật ký mới
- [ ] Click nút "+" (góc phải header)
- [ ] Modal "Chọn loại sổ nhật ký" hiển thị
- [ ] Danh sách schemas hiển thị:
  - VietGAP Trồng trọt (màu xanh lá)
  - VietGAHP Chăn nuôi (màu cam)
  - VietGAP Thủy sản (màu xanh dương)
  - Hữu cơ (màu tím)
  - Nông nghiệp Thông minh (màu cyan)

#### Bước 3: Chọn schema và viết nhật ký
- [ ] Click vào một schema (VD: "Lợn thịt")
- [ ] Navigate to màn hình "Tạo nhật ký mới"
- [ ] Header hiển thị tên schema
- [ ] Tabs hiển thị các bảng:
  - "Thông tin chung"
  - "Biểu 1: PHIẾU NHẬP NGUYÊN LIỆU"
  - "Biểu 2: ..." (tùy schema)

#### Bước 4: Điền form
- [ ] Click vào tab đầu tiên
- [ ] **Kiểm tra fields hiển thị đúng**:
  - Text fields có placeholder rõ ràng
  - Number fields có keyboard số
  - Date fields có format DD/MM/YYYY
  - Select fields có options
  - Required fields có dấu * đỏ
  
- [ ] **Test nhập liệu**:
  - Nhập text → Lưu được
  - Nhập số → Validate đúng
  - Chọn date → Format đúng
  - Chọn options → Highlight đúng

#### Bước 5: Lưu nhật ký
- [ ] Click "Lưu nháp" → Lưu thành công
- [ ] Quay lại danh sách → Nhật ký mới xuất hiện
- [ ] Status: "Lưu nháp" (màu xanh dương)
- [ ] Progress: 0% hoặc % tương ứng

#### Bước 6: Sửa và gửi duyệt
- [ ] Click vào nhật ký vừa tạo
- [ ] Click nút "Viết" (màu xanh dương)
- [ ] Sửa thông tin
- [ ] Click "Gửi duyệt"
- [ ] Confirm dialog hiển thị
- [ ] Sau khi gửi: Status → "Chờ duyệt" (màu cam)

### ❌ Lỗi có thể gặp:
- **Không hiển thị fields** → Check console logs, có thể schema structure sai
- **Không lưu được** → Check API `/journals` POST/PUT
- **Progress không cập nhật** → Backend tính progress
- **Tabs không switch** → Check activeTab state

---

## 3️⃣ **Inventory - Quản lý Kho Vật tư**

### ✅ Test Flow: Xem và thêm vật tư

#### Bước 1: Xem kho
- [ ] Navigate to "Kho vật tư" (từ Home)
- [ ] Header: "Kho vật tư sản xuất"
- [ ] Stats hiển thị:
  - "Loại vật tư" (tổng số)
  - "Sắp hết" (số items sắp hết)

#### Bước 2: Xem tabs
- [ ] Tab "Tồn kho" (active mặc định)
  - Danh sách vật tư
  - Mỗi item: Tên, Phân loại, Số lượng, Đơn vị
  - Tag trạng thái: "Hết hàng" (đỏ), "Sắp hết" (cam), "Sẵn có" (xanh)
  
- [ ] Tab "Lịch sử"
  - Danh sách giao dịch
  - Mỗi tx: Type (Nhập/Xuất/Cấp phát), Số lượng, Ngày

#### Bước 3: Thêm vật tư mua ngoài
- [ ] Click nút "+" (góc phải)
- [ ] Modal "Khai báo vật tư mua ngoài" hiển thị
- [ ] **Điền form**:
  - Tên vật tư: "Phân NPK 20-20-15"
  - Phân loại: Chọn "Phân bón"
  - Đơn vị: Chọn "kg"
  - Số lượng: "50"
  
- [ ] Click "Lưu vào kho"
- [ ] Alert "Thành công"
- [ ] Quay lại → Item mới xuất hiện trong danh sách

#### Bước 4: Search
- [ ] Nhập tên vật tư vào search box
- [ ] Danh sách filter theo keyword
- [ ] Clear search → Hiển thị lại tất cả

### ❌ Lỗi có thể gặp:
- Không load được danh sách → Check API `/inventory`
- Không thêm được → Check API `/inventory/add`
- Stats không đúng → Backend tính toán

---

## 4️⃣ **Supply - Xin cấp Vật tư từ HTX**

### ✅ Test Flow: Tạo đơn yêu cầu

#### Bước 1: Xem danh sách đơn
- [ ] Navigate to "Xin cấp vật tư"
- [ ] Stats hiển thị:
  - "Đã nhận" (approved)
  - "Chờ duyệt" (pending)
  
- [ ] Filter chips: Tất cả, Chờ duyệt, Đã duyệt, Từ chối

#### Bước 2: Tạo đơn yêu cầu HTX
- [ ] Click "Tạo đơn yêu cầu" (nút xanh)
- [ ] Modal hiển thị
- [ ] **Nếu chưa có HTX**:
  - Hiển thị: "Bạn chưa được gán vào HTX nào"
  - Message: "Liên hệ HTX để được thêm vào"
  
- [ ] **Nếu có HTX**:
  - Chọn HTX (nếu có nhiều)
  - Thêm vật tư cần xin:
    * Tên vật tư
    * Số lượng
  - Click "+" để thêm vật tư khác
  - Nhập lý do (optional)
  - Click "Gửi yêu cầu ngay"

#### Bước 3: Khai báo mua ngoài
- [ ] Click "Khai báo mua ngoài" (nút cam)
- [ ] Modal hiển thị
- [ ] Điền form:
  - Tên vật tư
  - Phân loại
  - Số lượng
  - Đơn vị
- [ ] Click "Gửi khai báo"
- [ ] Alert "Đã gửi khai báo! Chờ HTX phê duyệt"

#### Bước 4: Xem chi tiết đơn
- [ ] Click vào một đơn trong danh sách
- [ ] Xem status badge:
  - "Chờ duyệt" (cam)
  - "Đã duyệt" (xanh)
  - "Từ chối" (đỏ)
- [ ] Xem danh sách items
- [ ] Xem feedback (nếu có)
- [ ] Nếu Pending: Có nút "Hủy đơn"

### ❌ Lỗi có thể gặp:
- Không tạo được đơn → Check user có htxId không
- Không load HTX list → Check API `/users/htx-list`
- Không gửi được → Check API `/supply-requests`

---

## 5️⃣ **TCVN - Tra cứu Tiêu chuẩn**

### ✅ Test Flow: Tìm kiếm tiêu chuẩn

#### Bước 1: Xem danh sách
- [ ] Navigate to "Tiêu chuẩn TCVN"
- [ ] Header: "Tiêu chuẩn Quốc gia (TCVN)"
- [ ] Subtitle: "Tra cứu nhanh 35+ tiêu chuẩn"
- [ ] Danh sách 35 tiêu chuẩn hiển thị

#### Bước 2: Search
- [ ] Nhập keyword: "cá"
- [ ] Click nút search (kính lúp)
- [ ] Kết quả filter theo keyword
- [ ] Mỗi card hiển thị:
  - Mã TCVN (badge xanh)
  - Tên tiêu chuẩn
  - Phạm vi áp dụng

#### Bước 3: Xem chi tiết
- [ ] Click vào một tiêu chuẩn
- [ ] (Hiện tại chỉ hiển thị trong card)
- [ ] Đọc được phạm vi áp dụng đầy đủ

### ❌ Lỗi có thể gặp:
- Không load được → Check API `/tcvn`
- Search không hoạt động → Check API `/tcvn?keyword=`

---

## 6️⃣ **Notifications - Xem Thông báo**

### ✅ Test Flow: Quản lý thông báo

#### Bước 1: Xem danh sách
- [ ] Click icon chuông (Home screen)
- [ ] Hoặc navigate từ menu
- [ ] Header: "Thông báo"
- [ ] Danh sách thông báo hiển thị

#### Bước 2: Phân loại thông báo
- [ ] **Thông báo chưa đọc**:
  - Background màu xanh nhạt
  - Border xanh
  - Có dot xanh bên phải
  
- [ ] **Thông báo đã đọc**:
  - Background trắng
  - Không có dot

#### Bước 3: Xem theo loại
- [ ] **Journal** (icon book, màu xanh dương)
- [ ] **Approved** (icon check-circle, màu xanh lá)
- [ ] **Rejected** (icon x-circle, màu đỏ)
- [ ] **System** (icon bell, màu vàng)
- [ ] **News** (icon file-text, màu tím)

#### Bước 4: Thời gian
- [ ] "Vừa xong" (< 1 phút)
- [ ] "X phút trước"
- [ ] "X giờ trước"
- [ ] "X ngày trước"
- [ ] DD/MM/YYYY (> 7 ngày)

#### Bước 5: Pull to refresh
- [ ] Kéo xuống
- [ ] Loading
- [ ] Danh sách cập nhật

### ❌ Lỗi có thể gặp:
- Không load được → Check API `/notifications`
- Màu không đúng → Check type mapping
- Thời gian sai → Check date formatting

---

## 7️⃣ **Profile - Cập nhật Thông tin**

### ✅ Test Flow: Quản lý tài khoản

#### Bước 1: Xem profile
- [ ] Click tab "Profile" (tab cuối)
- [ ] Avatar/Initial hiển thị
- [ ] Tên người dùng
- [ ] Email
- [ ] Role badge

#### Bước 2: Menu options
- [ ] **Thông tin tài khoản**
  - Click vào
  - Xem/sửa: Họ tên, Email, SĐT, Địa chỉ, Tổ chức
  - Click "Cập nhật"
  - Alert "Cập nhật thành công"
  
- [ ] **Đổi mật khẩu**
  - Click vào
  - Nhập: Mật khẩu cũ, Mật khẩu mới, Xác nhận
  - Click "Đổi mật khẩu"
  - Alert thành công
  
- [ ] **Tin tức**
  - Navigate to News list
  - Xem danh sách tin
  - Click vào đọc chi tiết
  
- [ ] **Kho vật tư** → Navigate to Inventory
- [ ] **Xin cấp vật tư** → Navigate to Supply
- [ ] **Tiêu chuẩn TCVN** → Navigate to TCVN
- [ ] **Cài đặt** → Navigate to Settings (nếu có)

#### Bước 3: Đăng xuất
- [ ] Click "Đăng xuất"
- [ ] Confirm dialog
- [ ] Logout thành công
- [ ] Navigate về Login screen

### ❌ Lỗi có thể gặp:
- Không cập nhật được → Check API `/users/profile`
- Đổi mật khẩu fail → Check API `/users/change-password`
- Logout không hoạt động → Check auth store

---

## 8️⃣ **Scanner - Quét QR Code**

### ✅ Test Flow: Truy xuất nguồn gốc

#### Bước 1: Mở scanner
- [ ] Click tab "Scanner" (tab 3)
- [ ] Hoặc click "Truy xuất nguồn gốc" từ Home
- [ ] Camera permission request
- [ ] Camera preview hiển thị

#### Bước 2: Quét QR
- [ ] Đưa QR code vào khung
- [ ] Scanner tự động detect
- [ ] Navigate to TraceDetail screen

#### Bước 3: Xem thông tin truy xuất
- [ ] **Thông tin sản phẩm**:
  - Tên sản phẩm
  - Mã QR
  - Ngày sản xuất
  - Hạn sử dụng
  
- [ ] **Thông tin nhà sản xuất**:
  - Tên nông dân/HTX
  - Địa chỉ
  - Liên hệ
  
- [ ] **Lịch sử sản xuất**:
  - Timeline các hoạt động
  - Ngày tháng
  - Mô tả công việc
  
- [ ] **Chứng nhận**:
  - VietGAP/VietGAHP
  - Hữu cơ
  - Khác

#### Bước 4: Test không có QR
- [ ] Nhập mã QR thủ công (nếu có input)
- [ ] Hoặc test với QR không tồn tại
- [ ] Hiển thị: "Không tìm thấy thông tin"

### ❌ Lỗi có thể gặp:
- Camera không mở → Check permissions
- Không scan được → Check QR format
- Không load data → Check API `/trace/:qrCode`

---

## 📊 **Tổng kết Test**

### ✅ Checklist tổng quan:

#### Core Features
- [ ] Authentication (Login/Register/Logout)
- [ ] Home Dashboard
- [ ] Journal Management
- [ ] Inventory Management
- [ ] Supply Requests
- [ ] TCVN Standards
- [ ] Notifications
- [ ] Profile Management
- [ ] QR Scanner

#### UI/UX
- [ ] Navigation hoạt động mượt
- [ ] Loading states hiển thị đúng
- [ ] Error messages rõ ràng
- [ ] Success alerts hiển thị
- [ ] Pull to refresh hoạt động
- [ ] Search/Filter hoạt động
- [ ] Forms validation đúng
- [ ] Placeholders hữu ích

#### Performance
- [ ] App khởi động nhanh
- [ ] API calls không bị lag
- [ ] Images load nhanh
- [ ] Scroll mượt mà
- [ ] No memory leaks

---

## 🐛 **Bug Report Template**

Nếu gặp lỗi, báo cáo theo format:

```
**Màn hình**: [Tên màn hình]
**Hành động**: [Những gì bạn làm]
**Kết quả mong đợi**: [Điều gì nên xảy ra]
**Kết quả thực tế**: [Điều gì đã xảy ra]
**Screenshots**: [Nếu có]
**Console logs**: [Nếu có]
```

---

## ✅ **Test Completed**

Sau khi test xong tất cả, điền vào đây:

- **Ngày test**: ___________
- **Tester**: ___________
- **Device**: ___________
- **OS Version**: ___________
- **App Version**: ___________

**Tổng số chức năng test**: 8
**Số chức năng PASS**: ___/8
**Số chức năng FAIL**: ___/8
**Số bugs tìm thấy**: ___

**Kết luận**: 
- [ ] App sẵn sàng sử dụng
- [ ] Cần fix bugs trước khi release
- [ ] Cần thêm features

---

**Happy Testing! 🚀**
