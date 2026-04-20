# Chiến lược phân quyền Chat AI cho EBookFarm

## 🎯 Mục tiêu
- Cân bằng giữa trải nghiệm người dùng và bảo mật
- Khuyến khích đăng ký mà không tạo rào cản
- Kiểm soát chi phí và chất lượng dịch vụ

## 📊 Phân cấp người dùng

### 1. 👤 **Khách vãng lai** (Chưa đăng nhập)
**Giới hạn:**
- ✅ 5 tin nhắn/ngày (theo IP)
- ✅ Câu hỏi cơ bản về EBookFarm
- ✅ Thông tin TCVN, VietGAP
- ❌ Không có giá chi tiết
- ❌ Không có tư vấn cá nhân hóa
- ❌ Không lưu lịch sử chat

**Phản hồi mẫu:**
```
"Để được tư vấn chi tiết về giá và giải pháp phù hợp, 
vui lòng đăng ký tài khoản miễn phí hoặc liên hệ hotline: 1900 xxxx"
```

### 2. 🔐 **Người dùng đã đăng ký** (User role)
**Quyền lợi:**
- ✅ 50 tin nhắn/ngày
- ✅ Tư vấn chi tiết về tính năng
- ✅ Báo giá sơ bộ theo quy mô
- ✅ Lưu lịch sử chat
- ✅ Tư vấn kỹ thuật cơ bản
- ❌ Không có giá chính xác
- ❌ Không có demo trực tiếp

### 3. 👑 **Khách hàng VIP** (Premium/Admin)
**Quyền lợi:**
- ✅ Không giới hạn tin nhắn
- ✅ Tư vấn chuyên sâu
- ✅ Báo giá chính xác
- ✅ Hỗ trợ kỹ thuật nâng cao
- ✅ Ưu tiên phản hồi
- ✅ Kết nối với chuyên gia

## 🛠️ Cách triển khai

### 1. Middleware kiểm tra quyền
```javascript
// backend/src/middlewares/chatPermissionMiddleware.js
const checkChatPermission = async (req, res, next) => {
    const userIP = req.ip;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Khách vãng lai
    if (!userId) {
        const dailyCount = await getChatCountByIP(userIP);
        if (dailyCount >= 5) {
            return res.json({
                success: false,
                message: 'Bạn đã hết lượt chat miễn phí hôm nay. Vui lòng đăng ký để tiếp tục.',
                requireLogin: true
            });
        }
        req.chatLevel = 'guest';
        req.dailyLimit = 5;
    }
    // User đã đăng ký
    else if (userRole === 'user') {
        const dailyCount = await getChatCountByUser(userId);
        if (dailyCount >= 50) {
            return res.json({
                success: false,
                message: 'Bạn đã hết lượt chat hôm nay. Nâng cấp VIP để không giới hạn.',
                requireUpgrade: true
            });
        }
        req.chatLevel = 'user';
        req.dailyLimit = 50;
    }
    // VIP/Admin
    else {
        req.chatLevel = 'vip';
        req.dailyLimit = -1; // Không giới hạn
    }

    next();
};
```

### 2. System prompt theo cấp độ
```javascript
const getSystemPromptByLevel = (chatLevel) => {
    const basePrompt = `Bạn là trợ lý AI của EBookFarm...`;
    
    switch (chatLevel) {
        case 'guest':
            return basePrompt + `
            
            GIỚI HẠN CHO KHÁCH VÃNG LAI:
            - Chỉ trả lời thông tin cơ bản về EBookFarm
            - KHÔNG cung cấp giá chi tiết
            - Khuyến khích đăng ký để được tư vấn đầy đủ
            - Khi hỏi về giá: "Vui lòng đăng ký để nhận báo giá chi tiết"`;
            
        case 'user':
            return basePrompt + `
            
            QUYỀN LỢI USER:
            - Tư vấn chi tiết về tính năng
            - Báo giá sơ bộ theo quy mô
            - Tư vấn kỹ thuật cơ bản
            - Khi cần giá chính xác: "Liên hệ sales để nhận báo giá chính xác"`;
            
        case 'vip':
            return basePrompt + `
            
            QUYỀN LỢI VIP:
            - Tư vấn chuyên sâu không giới hạn
            - Báo giá chi tiết và chính xác
            - Hỗ trợ kỹ thuật nâng cao
            - Ưu tiên phản hồi`;
    }
};
```

### 3. UI thông báo phân quyền
```jsx
// Trong AIChatWidget.jsx
{chatLevel === 'guest' && (
    <div className="bg-blue-50 p-3 rounded mb-3">
        <div className="text-sm text-blue-700">
            👋 Bạn đang dùng thử miễn phí (còn {5 - dailyUsed} lượt)
        </div>
        <Button size="small" type="link" onClick={() => navigate('/register')}>
            Đăng ký để không giới hạn
        </Button>
    </div>
)}

{chatLevel === 'user' && (
    <div className="bg-green-50 p-3 rounded mb-3">
        <div className="text-sm text-green-700">
            ✅ Tài khoản đã xác thực (còn {50 - dailyUsed} lượt)
        </div>
    </div>
)}
```

## 📈 Lợi ích kinh doanh

### 1. Tăng conversion rate
- Khách vãng lai trải nghiệm → Muốn biết thêm → Đăng ký
- User thấy giá trị → Muốn tư vấn chính xác → Liên hệ sales

### 2. Kiểm soát chi phí
- Groq miễn phí nhưng có giới hạn 14,400 requests/ngày
- Phân bổ hợp lý: 70% cho user, 20% cho guest, 10% cho VIP

### 3. Dữ liệu người dùng
- Biết ai quan tâm gì
- Phân tích nhu cầu theo từng nhóm
- Cải thiện sản phẩm dựa trên feedback

## 🎨 Trải nghiệm người dùng

### Khách vãng lai:
```
User: "EBookFarm có tính năng gì?"
AI: "EBookFarm cung cấp 4 tính năng chính: [chi tiết]
     
     💡 Đăng ký miễn phí để được tư vấn chi tiết hơn!"

User: "Giá bao nhiêu?"
AI: "EBookFarm có nhiều gói linh hoạt từ 500k-2tr/tháng.
     
     📝 Đăng ký để nhận báo giá chi tiết theo nhu cầu của bạn!"
```

### User đã đăng ký:
```
User: "Giá bao nhiêu?"
AI: "Dựa trên quy mô của bạn:
     - Dưới 5ha: Gói Basic 500k/tháng
     - 5-50ha: Gói Pro 2tr/tháng
     - Trên 50ha: Gói Enterprise (báo giá riêng)
     
     📞 Liên hệ sales để nhận báo giá chính xác: 1900 xxxx"
```

### VIP:
```
User: "Giá bao nhiêu cho 100ha?"
AI: "Cho quy mô 100ha, chúng tôi khuyến nghị:
     - Gói Enterprise: 8-12tr/tháng
     - Bao gồm: Setup miễn phí, đào tạo, hỗ trợ 24/7
     - Ưu đãi đặc biệt: Giảm 20% năm đầu
     
     Tôi sẽ kết nối bạn với chuyên gia để demo và báo giá chính xác."
```

## 🔧 Cài đặt nhanh

### Bước 1: Thêm middleware
```bash
# Tạo middleware
touch backend/src/middlewares/chatPermissionMiddleware.js
```

### Bước 2: Cập nhật routes
```javascript
// backend/src/routes/groqRoutes.js
const { checkChatPermission } = require('../middlewares/chatPermissionMiddleware');

router.post('/chat', checkChatPermission, chatWithGroq);
```

### Bước 3: Cập nhật frontend
```jsx
// Thêm logic hiển thị giới hạn và khuyến khích đăng ký
```

## 📊 Metrics cần theo dõi

1. **Conversion Rate**: Guest → User → Customer
2. **Chat Usage**: Phân bố theo nhóm người dùng
3. **Popular Questions**: Câu hỏi phổ biến từng nhóm
4. **Drop-off Rate**: Tỷ lệ bỏ cuộc khi hết lượt
5. **Satisfaction**: Đánh giá chất lượng phản hồi

## 🎯 Kết luận

**Khuyến nghị: Triển khai phân quyền thông minh**

- ✅ Cho phép trải nghiệm miễn phí (5 lượt/ngày)
- ✅ Khuyến khích đăng ký bằng giá trị gia tăng
- ✅ Tạo động lực nâng cấp VIP
- ✅ Kiểm soát chi phí và chất lượng

Cách này vừa bảo vệ lợi ích doanh nghiệp, vừa tạo trải nghiệm tốt cho người dùng.