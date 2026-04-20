# Hướng dẫn cài đặt OpenAI API cho EBookFarm

## 🚀 Tại sao chuyển sang OpenAI?

### ❌ Vấn đề với Gemini API:
- Model `gemini-1.5-pro` không tồn tại hoặc bị giới hạn
- API key thường xuyên hết quota
- Lỗi 404 khi gọi API
- Không ổn định cho production

### ✅ Ưu điểm của OpenAI GPT:
- **Ổn định**: API hoạt động 99.9% thời gian
- **Nhanh**: Phản hồi trong 1-3 giây
- **Tiếng Việt tốt**: Hiểu và trả lời tiếng Việt tự nhiên
- **Chi phí hợp lý**: $0.15/1M tokens (rất rẻ)
- **Tài liệu rõ ràng**: Dễ tích hợp và debug

## 📝 Cách lấy OpenAI API Key

### Bước 1: Tạo tài khoản OpenAI
1. Truy cập: https://platform.openai.com/signup
2. Đăng ký bằng email hoặc Google/Microsoft
3. Xác thực email

### Bước 2: Thêm phương thức thanh toán
1. Vào **Settings** → **Billing**
2. Thêm thẻ tín dụng/debit
3. Nạp tối thiểu $5 (đủ dùng vài tháng)

### Bước 3: Tạo API Key
1. Vào **API Keys**: https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Đặt tên: `EBookFarm-Chatbot`
4. Copy key (dạng: `sk-proj-...`)

### Bước 4: Cấu hình trong EBookFarm
1. Mở file `backend/.env`
2. Thay đổi:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```
3. Khởi động lại backend server:
   ```bash
   cd backend
   npm run dev
   ```

## 🧪 Kiểm tra hoạt động

### 1. Test qua Admin Panel
- Truy cập: http://localhost:5173/admin/openai-test
- Click **"Test Connection"**
- Gửi tin nhắn test

### 2. Test qua Chat Widget
- Mở trang chủ: http://localhost:5173
- Click bong bóng chat ở góc dưới phải
- Gửi tin nhắn: "EBookFarm là gì?"

### 3. Kết quả mong đợi
```
✅ AI hiểu EBookFarm là hệ thống quản lý nông trại
✅ Trả lời chi tiết về tính năng
✅ Giải thích TCVN, VietGAP
✅ Tư vấn kỹ thuật nông nghiệp
✅ Phản hồi nhanh (< 3 giây)
```

## 💰 Chi phí sử dụng

### GPT-4o-mini (khuyến nghị):
- **Input**: $0.15 / 1M tokens
- **Output**: $0.60 / 1M tokens
- **Ước tính**: ~1000 tin nhắn = $0.50

### Ví dụ thực tế:
- 100 khách hàng chat/ngày
- Mỗi người 5 tin nhắn
- Chi phí/tháng: ~$15-25

## 🔧 Cấu hình nâng cao

### 1. Thay đổi model (nếu cần)
File: `backend/src/controllers/openaiController.js`
```javascript
// Thay đổi model
model: 'gpt-4o-mini',  // Nhanh, rẻ (khuyến nghị)
// model: 'gpt-4o',     // Mạnh hơn, đắt hơn
// model: 'gpt-3.5-turbo', // Rẻ nhất
```

### 2. Điều chỉnh tham số
```javascript
temperature: 0.9,     // Độ sáng tạo (0-2)
max_tokens: 2048,     // Độ dài phản hồi
top_p: 0.95,          // Đa dạng từ vựng
```

### 3. Giới hạn chi phí
- Vào **Usage limits** trong OpenAI dashboard
- Đặt giới hạn: $10/tháng
- Cảnh báo khi đạt 80%

## 🛠️ Troubleshooting

### Lỗi: "API key chưa được cấu hình"
**Giải pháp**:
1. Kiểm tra file `.env` có đúng key không
2. Khởi động lại server: `npm run dev`
3. Xóa cache: Ctrl+Shift+R

### Lỗi: "Insufficient quota"
**Giải pháp**:
1. Kiểm tra billing trong OpenAI dashboard
2. Thêm tiền vào tài khoản
3. Đợi 5-10 phút để cập nhật

### Lỗi: "Rate limit exceeded"
**Giải pháp**:
1. Đợi 1 phút rồi thử lại
2. Nâng cấp tier trong OpenAI (nếu cần)

### AI trả lời không đúng về EBookFarm
**Giải pháp**:
1. Kiểm tra system prompt trong `openaiController.js`
2. Đảm bảo prompt nhấn mạnh EBookFarm là hệ thống nông trại
3. Test với câu hỏi cụ thể

## 📊 So sánh Gemini vs OpenAI

| Tiêu chí | Gemini | OpenAI GPT |
|----------|---------|------------|
| **Ổn định** | ❌ Hay lỗi | ✅ Rất ổn định |
| **Tốc độ** | ⚠️ Chậm | ✅ Nhanh (1-3s) |
| **Tiếng Việt** | ✅ Tốt | ✅ Rất tốt |
| **Chi phí** | ✅ Miễn phí (có giới hạn) | ⚠️ Có phí ($15/tháng) |
| **API** | ❌ Phức tạp | ✅ Đơn giản |
| **Tài liệu** | ⚠️ Ít | ✅ Đầy đủ |
| **Production** | ❌ Không khuyến nghị | ✅ Sẵn sàng |

## 🎯 Kết luận

**OpenAI GPT-4o-mini** là lựa chọn tốt nhất cho EBookFarm vì:
- Ổn định và đáng tin cậy
- Chi phí hợp lý cho doanh nghiệp
- Chất lượng phản hồi cao
- Dễ bảo trì và nâng cấp

**Chi phí**: ~$15-25/tháng cho 100 khách hàng chat/ngày là hoàn toàn hợp lý so với giá trị mang lại.

## 📞 Hỗ trợ

Nếu gặp vấn đề khi cài đặt:
1. Kiểm tra file `OPENAI_SETUP_GUIDE.md` này
2. Test qua admin panel: `/admin/openai-test`
3. Xem log server trong terminal
4. Liên hệ developer để hỗ trợ

---

**Cập nhật**: 20/04/2026
**Trạng thái**: ✅ Sẵn sàng sử dụng