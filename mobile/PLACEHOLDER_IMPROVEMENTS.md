# EBookFarm Mobile - Placeholder Text Improvements

## 📝 Tổng quan

Đã cải thiện placeholder text trong tất cả các màn hình có form input để người dùng dễ hiểu và biết cần nhập gì. Thay vì placeholder chung chung như "Nhập...", giờ đây có các ví dụ cụ thể và hướng dẫn rõ ràng.

## 🎯 Nguyên tắc thiết kế Placeholder

### 1. **Cung cấp ví dụ cụ thể**
- ❌ Trước: "Nhập email"
- ✅ Sau: "Ví dụ: nongdan@gmail.com"

### 2. **Hướng dẫn format và yêu cầu**
- ❌ Trước: "Nhập mật khẩu"
- ✅ Sau: "Tối thiểu 6 ký tự, nên có chữ và số"

### 3. **Ngữ cảnh phù hợp với nông nghiệp**
- ❌ Trước: "Nhập tên tổ chức"
- ✅ Sau: "Ví dụ: HTX Nông nghiệp ABC"

### 4. **Màu sắc nhất quán**
- Tất cả placeholder đều sử dụng `placeholderTextColor="#9ca3af"` (xám nhạt)

## 📱 Màn hình đã cải thiện

### 1. **JournalEntryScreen.js**
#### Thêm function `getPlaceholderText()` thông minh:

```javascript
const getPlaceholderText = (field) => {
  const fieldType = field.fieldType;
  const label = field.label.toLowerCase();
  
  switch (fieldType) {
    case 'text':
      if (label.includes('tên')) return `Ví dụ: ${field.label} ABC`;
      if (label.includes('địa chỉ')) return 'Ví dụ: 123 Đường ABC, Phường XYZ';
      if (label.includes('mã')) return 'Ví dụ: ABC123';
      return `Nhập ${label}...`;
      
    case 'number':
      if (label.includes('số lượng')) return 'Ví dụ: 100';
      if (label.includes('diện tích')) return 'Ví dụ: 1000 (m²)';
      if (label.includes('khối lượng')) return 'Ví dụ: 50 (kg)';
      if (label.includes('giá')) return 'Ví dụ: 100000 (VNĐ)';
      if (label.includes('nhiệt độ')) return 'Ví dụ: 25 (°C)';
      if (label.includes('độ ẩm')) return 'Ví dụ: 80 (%)';
      if (label.includes('ph')) return 'Ví dụ: 6.5';
      return `Nhập ${label}...`;
      
    case 'textarea':
      if (label.includes('mô tả')) return `Mô tả chi tiết về ${label}...`;
      if (label.includes('ghi chú')) return 'Ghi chú thêm thông tin (nếu có)...';
      return `Nhập ${label} chi tiết...`;
      
    case 'date':
      return 'Chọn ngày (DD/MM/YYYY)';
  }
};
```

#### Lợi ích:
- **Tự động**: Placeholder thay đổi theo loại field và label
- **Thông minh**: Nhận diện từ khóa để đưa ra gợi ý phù hợp
- **Đơn vị rõ ràng**: Hiển thị đơn vị đo lường (kg, m², °C, %)

### 2. **LoginScreen.js**
| Field | Trước | Sau |
|-------|-------|-----|
| Username | "Email / Số điện thoại" | "Nhập email hoặc tên đăng nhập" |
| Password | "Mật khẩu" | "Nhập mật khẩu của bạn" |

### 3. **RegisterScreen.js**
| Field | Trước | Sau |
|-------|-------|-----|
| Username | "Nhập tên đăng nhập" | "Ví dụ: nongdan123" |
| Email | "Nhập email" | "Ví dụ: nongdan@gmail.com" |
| Fullname | "Nhập họ và tên" | "Ví dụ: Nguyễn Văn A" |
| Phone | "Nhập số điện thoại" | "Ví dụ: 0901234567" |
| Organization | "Nhập tên tổ chức" | "Ví dụ: HTX Nông nghiệp ABC" |
| Password | "Nhập mật khẩu" | "Tối thiểu 6 ký tự" |
| Confirm | "Nhập lại mật khẩu" | "Nhập lại mật khẩu để xác nhận" |

### 4. **ForgotPasswordScreen.js**
| Field | Trước | Sau |
|-------|-------|-----|
| Email | "Nhập email của bạn" | "Ví dụ: nongdan@gmail.com" |

### 5. **ResetPasswordScreen.js**
| Field | Trước | Sau |
|-------|-------|-----|
| New Password | "Nhập mật khẩu mới" | "Tối thiểu 6 ký tự, nên có chữ và số" |
| Confirm | "Nhập lại mật khẩu mới" | "Nhập lại mật khẩu để xác nhận" |

### 6. **AccountInfoScreen.js**
| Field | Trước | Sau |
|-------|-------|-----|
| Fullname | "Nhập họ và tên" | "Ví dụ: Nguyễn Văn A" |
| Phone | "Nhập số điện thoại" | "Ví dụ: 0901234567" |
| Organization | "Nhập tên tổ chức" | "Ví dụ: HTX Nông nghiệp ABC" |
| Bio | "Viết vài dòng về bạn..." | "Ví dụ: Nông dân có 10 năm kinh nghiệm trồng lúa..." |
| Province | "Nhập tỉnh/thành phố" | "Ví dụ: Hà Nội, TP.HCM, An Giang..." |
| Ward | "Nhập phường/xã" | "Ví dụ: Phường Đống Đa, Xã Tân Phú..." |
| Address | "Nhập địa chỉ chi tiết" | "Ví dụ: 123 Đường ABC, Khu vực XYZ" |
| Farm Name | "Nhập tên nông trại" | "Ví dụ: Nông trại Xanh, Vườn Hữu cơ ABC" |
| Farm Code | "Nhập mã nông trại" | "Ví dụ: NT001, FARM-ABC-2024" |
| Farm Area | "Nhập diện tích" | "Ví dụ: 5000 (m²)" |

### 7. **ChangePasswordScreen.js**
| Field | Trước | Sau |
|-------|-------|-----|
| Current | "Nhập mật khẩu hiện tại" | "Nhập mật khẩu đang sử dụng" |
| New | "Nhập mật khẩu mới" | "Tối thiểu 6 ký tự, nên có chữ và số" |
| Confirm | "Nhập lại mật khẩu mới" | "Nhập lại mật khẩu để xác nhận" |

## 🎨 Cải thiện UX

### 1. **Giảm Cognitive Load**
- Người dùng không cần suy nghĩ format
- Ví dụ cụ thể giúp hiểu ngay cần nhập gì

### 2. **Giảm lỗi nhập liệu**
- Placeholder rõ ràng về yêu cầu (độ dài, format)
- Ví dụ đúng format giúp tránh lỗi validation

### 3. **Phù hợp ngữ cảnh**
- Ví dụ liên quan đến nông nghiệp
- Tên tổ chức, nông trại phù hợp với người dùng

### 4. **Nhất quán về mặt thiết kế**
- Tất cả placeholder đều có màu `#9ca3af`
- Format "Ví dụ: ..." nhất quán
- Ngôn ngữ thân thiện, dễ hiểu

## 📊 Tác động

### Trước khi cải thiện:
- ❌ Placeholder chung chung: "Nhập email"
- ❌ Không có ví dụ cụ thể
- ❌ Người dùng phải đoán format
- ❌ Dễ nhập sai định dạng

### Sau khi cải thiện:
- ✅ Placeholder cụ thể: "Ví dụ: nongdan@gmail.com"
- ✅ Có ví dụ rõ ràng cho mọi field
- ✅ Hướng dẫn format và yêu cầu
- ✅ Giảm thiểu lỗi nhập liệu

## 🚀 Kế hoạch tiếp theo

### Phase 2: Advanced Placeholder Features
- [ ] **Dynamic Placeholder**: Thay đổi theo context (VD: role của user)
- [ ] **Localization**: Hỗ trợ đa ngôn ngữ cho placeholder
- [ ] **Smart Suggestions**: Gợi ý dựa trên dữ liệu đã nhập trước đó
- [ ] **Validation Hints**: Placeholder thay đổi khi có lỗi validation

### Phase 3: Interactive Enhancements
- [ ] **Floating Labels**: Label di chuyển lên trên khi focus
- [ ] **Input Masks**: Format tự động (số điện thoại, ngày tháng)
- [ ] **Auto-complete**: Gợi ý từ database cho các field phổ biến
- [ ] **Voice Input**: Placeholder hướng dẫn sử dụng voice input

## 💡 Best Practices đã áp dụng

### 1. **Accessibility**
- Placeholder không thay thế label
- Màu contrast đủ để đọc được
- Nội dung mô tả rõ ràng

### 2. **Usability**
- Ví dụ thực tế, không abstract
- Ngắn gọn nhưng đầy đủ thông tin
- Phù hợp với mental model của user

### 3. **Consistency**
- Format nhất quán across app
- Tone of voice thân thiện
- Visual hierarchy rõ ràng

### 4. **Performance**
- Function `getPlaceholderText()` optimize cho speed
- Không impact render performance
- Reusable và maintainable

---

**Kết luận**: Việc cải thiện placeholder text tuy nhỏ nhưng có tác động lớn đến user experience. Người dùng giờ đây có thể dễ dàng hiểu và điền form một cách chính xác, giảm thiểu friction trong quá trình sử dụng app.