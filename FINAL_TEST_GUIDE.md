# 🧪 Hướng dẫn test hệ thống phân quyền Chat AI

## 🚀 Chuẩn bị

### 1. Đảm bảo cả 2 server đang chạy:
- **Backend**: http://localhost:5000 ✅
- **Frontend**: http://localhost:5173 ✅

### 2. Kiểm tra Groq API:
```bash
cd backend
node test-groq.js
```

## 🧪 Test Cases

### **Test 1: Khách vãng lai (Guest)**

1. **Mở trình duyệt ẩn danh** (Ctrl+Shift+N)
2. **Truy cập**: http://localhost:5173
3. **Click bong bóng chat** ở góc dưới phải
4. **Kiểm tra UI**:
   - ✅ Hiển thị "Guest" với icon xám
   - ✅ Progress bar: 0/5 lượt
   - ✅ Nút "Đăng nhập"

5. **Gửi 5 tin nhắn**:
   ```
   1. "EBookFarm là gì?"
   2. "Có tính năng gì?"
   3. "Giá bao nhiêu?"
   4. "TCVN là gì?"
   5. "Làm sao trồng cà chua?"
   ```

6. **Kiểm tra phản hồi**:
   - ✅ AI trả lời chi tiết về EBookFarm
   - ✅ Không có giá cụ thể, chỉ nói "có nhiều gói"
   - ✅ Cuối mỗi câu có "💡 Đăng ký miễn phí..."
   - ✅ Progress bar tăng dần: 1/5, 2/5, 3/5, 4/5, 5/5

7. **Gửi tin nhắn thứ 6**:
   - ✅ Hiển thị alert "Đã hết lượt chat!"
   - ✅ Có nút "Đăng ký ngay"
   - ✅ Liệt kê quyền lợi User

### **Test 2: User đã đăng ký**

1. **Đăng nhập** với tài khoản user
2. **Mở chat widget**
3. **Kiểm tra UI**:
   - ✅ Hiển thị "User" với icon xanh
   - ✅ Progress bar: 0/50 lượt
   - ✅ Không có nút đăng nhập

4. **Gửi tin nhắn**: "Giá bao nhiêu cho 10ha?"
5. **Kiểm tra phản hồi**:
   - ✅ AI cung cấp báo giá sơ bộ
   - ✅ Gợi ý "Liên hệ sales để báo giá chính xác"
   - ✅ Không có "💡 Đăng ký miễn phí..."

### **Test 3: Admin**

1. **Đăng nhập** với tài khoản admin
2. **Mở chat widget**
3. **Kiểm tra UI**:
   - ✅ Hiển thị "Admin" với icon vàng
   - ✅ Không có progress bar (unlimited)

4. **Gửi tin nhắn**: "Báo giá chi tiết cho 100ha"
5. **Kiểm tra phản hồi**:
   - ✅ AI cung cấp báo giá chi tiết
   - ✅ Đề xuất ưu đãi và kết nối chuyên gia

### **Test 4: Thống kê Admin**

1. **Đăng nhập admin**
2. **Truy cập**: http://localhost:5173/admin/chat-stats
3. **Kiểm tra**:
   - ✅ Hiển thị tổng số chat
   - ✅ Biểu đồ theo ngày
   - ✅ Thống kê theo cấp độ
   - ✅ Cảnh báo và khuyến nghị

### **Test 5: Groq AI Test**

1. **Truy cập**: http://localhost:5173/admin/groq-test
2. **Click "Test Connection"**:
   - ✅ Kết nối thành công
   - ✅ Hiển thị model: llama-3.1-8b-instant
3. **Gửi test message**:
   - ✅ Phản hồi nhanh (< 2 giây)
   - ✅ Chất lượng tốt

## 📊 Kiểm tra Database

### MongoDB Collections:
```bash
# Kết nối MongoDB
mongo mongodb://localhost:27017/ebookfarm

# Xem chat usage
db.chatusages.find().sort({date: -1}).limit(10)

# Thống kê theo cấp độ
db.chatusages.aggregate([
  {$group: {_id: "$chatLevel", count: {$sum: 1}}}
])
```

## 🔧 Troubleshooting

### **Lỗi thường gặp:**

#### 1. "Cannot resolve AuthContext"
**Giải pháp**: ✅ Đã sửa - dùng localStorage thay vì AuthContext

#### 2. "Cannot resolve @ant-design/charts"
**Giải pháp**: ✅ Đã cài - `npm install @ant-design/charts`

#### 3. Chat không hoạt động
**Kiểm tra**:
- Backend server chạy: http://localhost:5000
- Groq API key đúng trong `.env`
- MongoDB kết nối thành công

#### 4. Không thấy giới hạn chat
**Kiểm tra**:
- Middleware được áp dụng đúng route
- Database ghi log chat usage
- Frontend hiển thị progress bar

#### 5. Thống kê không hiển thị
**Kiểm tra**:
- Đăng nhập với quyền admin
- API `/api/chat/stats` hoạt động
- Có dữ liệu chat trong database

## ✅ Checklist hoàn thành

### **Chức năng cốt lõi:**
- [ ] Guest: 5 lượt/ngày, thông tin cơ bản
- [ ] User: 50 lượt/ngày, tư vấn chi tiết
- [ ] Admin: Unlimited, tư vấn chuyên sâu
- [ ] Progress bar hiển thị đúng
- [ ] Alert nâng cấp khi hết lượt
- [ ] System prompt khác nhau theo cấp độ

### **UI/UX:**
- [ ] Chat widget responsive
- [ ] Icons và colors đúng theo cấp độ
- [ ] Buttons đăng nhập/nâng cấp hoạt động
- [ ] Thông báo rõ ràng và hữu ích

### **Admin Features:**
- [ ] Thống kê chat chi tiết
- [ ] Biểu đồ và metrics
- [ ] Test Groq AI
- [ ] Cảnh báo và khuyến nghị

### **Performance:**
- [ ] Phản hồi AI < 2 giây
- [ ] Database query tối ưu
- [ ] Frontend load nhanh
- [ ] Không memory leak

### **Security:**
- [ ] JWT token validation
- [ ] Rate limiting theo IP
- [ ] Input sanitization
- [ ] Error handling an toàn

## 🎯 Kết quả mong đợi

Sau khi test thành công:

1. **Conversion funnel hoạt động**:
   - Guest thấy giá trị → đăng ký
   - User muốn tư vấn → liên hệ sales

2. **Chi phí được kiểm soát**:
   - Groq API không bị abuse
   - Phân bổ requests hợp lý

3. **Dữ liệu thu thập được**:
   - Biết ai quan tâm gì
   - Phân tích nhu cầu khách hàng

4. **Chất lượng dịch vụ tốt**:
   - Phản hồi nhanh và chính xác
   - Tư vấn phù hợp từng cấp độ

## 🚀 Sẵn sàng Production!

Nếu tất cả test cases đều pass, hệ thống đã sẵn sàng đưa vào production với:

- ✅ Architecture scalable
- ✅ Cost-effective (Groq miễn phí)
- ✅ User experience tốt
- ✅ Business metrics tracking
- ✅ Admin tools đầy đủ

**Chúc mừng! Hệ thống phân quyền Chat AI hoàn thành! 🎉**