# AI Chat Widget

Bong bóng chat AI thông minh cho Landing Page của EBookFarm.

## Tính năng

### 🤖 Trả lời tự động thông minh
- Nhận diện câu hỏi về tính năng, giá cả, liên hệ, hướng dẫn
- Hỗ trợ tiếng Việt tự nhiên
- Phản hồi nhanh với thông tin chi tiết

### 💬 Giao diện thân thiện
- Thiết kế hiện đại với gradient xanh lá - xanh dương
- Animation mượt mà
- Responsive trên mobile và desktop
- Typing indicator khi bot đang trả lời

### 🎯 Quick Replies
- 4 câu hỏi gợi ý nhanh:
  - 📋 Tính năng của hệ thống
  - 💰 Bảng giá dịch vụ
  - 📞 Liên hệ tư vấn
  - 🎓 Hướng dẫn sử dụng

### 🔔 Welcome Notification
- Hiển thị tooltip chào mừng sau 3 giây
- Badge notification khi có tin nhắn mới
- Pulse animation thu hút sự chú ý

## Cách sử dụng

### Import vào component
```jsx
import AIChatWidget from '../../components/AIChatWidget';

function YourPage() {
  return (
    <div>
      {/* Your content */}
      <AIChatWidget />
    </div>
  );
}
```

### Vị trí hiển thị
- Fixed position ở góc phải dưới màn hình
- Z-index: 9999 (luôn hiển thị trên cùng)
- Không ảnh hưởng đến layout của trang

## Câu hỏi được hỗ trợ

### 1. Chào hỏi
- "Xin chào", "Chào", "Hello", "Hi"
- → Hiển thị menu chính với các tùy chọn

### 2. Tính năng
- "Tính năng", "Chức năng", "Làm được gì", "Có gì"
- → Chi tiết về Nhật ký điện tử, Truy xuất QR, Quản lý chuỗi

### 3. Giá cả
- "Giá", "Chi phí", "Bao nhiêu", "Phí"
- → Bảng giá 3 gói: Cơ bản, Chuyên nghiệp, Doanh nghiệp

### 4. Liên hệ
- "Liên hệ", "Gọi", "Số điện thoại", "Email"
- → Hotline, Email, Địa chỉ, Giờ làm việc

### 5. Hướng dẫn
- "Hướng dẫn", "Cách dùng", "Sử dụng", "Tài liệu"
- → Video, PDF, Đào tạo, Hỗ trợ 24/7

### 6. Tiêu chuẩn TCVN
- "TCVN", "Tiêu chuẩn", "Chứng nhận"
- → Danh sách 35+ tiêu chuẩn TCVN

### 7. Demo
- "Demo", "Dùng thử", "Trải nghiệm"
- → Hướng dẫn đăng ký demo miễn phí

### 8. Cảm ơn
- "Cảm ơn", "Thanks", "Thank"
- → Lời cảm ơn và thông tin liên hệ

## Tùy chỉnh

### Thay đổi màu sắc
Chỉnh sửa trong `AIChatWidget.css`:
```css
/* Gradient chính */
background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);

/* Thay đổi thành màu khác */
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### Thêm câu trả lời mới
Chỉnh sửa object `botResponses` trong `AIChatWidget.jsx`:
```javascript
const botResponses = {
  'your-key': 'Your response text here...',
  // ...
};
```

Và thêm logic trong `getBotResponse()`:
```javascript
else if (message.includes('your-keyword')) {
  return botResponses['your-key'];
}
```

### Thay đổi thời gian typing
```javascript
setTimeout(() => {
  // Bot response
}, 1500); // Thay đổi số này (milliseconds)
```

## Responsive

### Desktop
- Width: 380px
- Height: 600px
- Bottom: 24px, Right: 24px

### Mobile
- Width: calc(100vw - 32px)
- Height: calc(100vh - 100px)
- Max-width: 380px
- Max-height: 600px

## Animation Effects

- ✨ Pulse animation cho button
- 🎯 Slide in animation cho chat window
- 💬 Message slide in từ dưới lên
- ⌨️ Typing indicator với 3 dots
- 🔔 Badge pulse cho notification
- 👋 Welcome tooltip slide in từ phải

## Performance

- Lightweight: ~15KB (minified)
- No external dependencies (chỉ dùng Ant Design có sẵn)
- Lazy load: Chỉ render khi cần thiết
- Smooth 60fps animations

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Future Enhancements

- [ ] Tích hợp API backend thật
- [ ] Lưu lịch sử chat vào localStorage
- [ ] Gửi email/SMS từ chat
- [ ] Voice input
- [ ] Multi-language support
- [ ] Analytics tracking
- [ ] File upload support
- [ ] Video call integration

## License

MIT License - EBookFarm 2024
