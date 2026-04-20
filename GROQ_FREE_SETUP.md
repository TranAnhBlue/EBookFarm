# 🚀 Hướng dẫn lấy Groq API Key MIỄN PHÍ

## Tại sao chọn Groq?

### ✅ Ưu điểm vượt trội:
- **100% MIỄN PHÍ** - Không cần thẻ tín dụng
- **Siêu nhanh** - Phản hồi trong 0.5-1 giây
- **Mạnh mẽ** - Llama-3.1-70B (tương đương GPT-4)
- **Ổn định** - 99.9% uptime
- **Tiếng Việt tốt** - Hiểu và trả lời tự nhiên

### 📊 So sánh:
| Tiêu chí | Gemini | OpenAI | **Groq** |
|----------|---------|---------|----------|
| **Chi phí** | Miễn phí (giới hạn) | $15/tháng | **🆓 MIỄN PHÍ** |
| **Tốc độ** | Chậm (3-5s) | Trung bình (2-3s) | **⚡ Siêu nhanh (0.5s)** |
| **Ổn định** | ❌ Hay lỗi | ✅ Ổn định | **✅ Rất ổn định** |
| **Thiết lập** | Phức tạp | Cần billing | **✅ Đơn giản** |

## 📝 Cách lấy Groq API Key (2 phút)

### Bước 1: Truy cập Groq Console
🔗 **Link**: https://console.groq.com/

### Bước 2: Đăng ký tài khoản
- Click **"Sign Up"**
- Dùng email hoặc Google/GitHub
- **KHÔNG CẦN** thẻ tín dụng

### Bước 3: Tạo API Key
1. Sau khi đăng nhập, vào **"API Keys"**
2. Click **"Create API Key"**
3. Đặt tên: `EBookFarm-Chatbot`
4. Copy key (dạng: `gsk_...`)

### Bước 4: Cập nhật EBookFarm
Mở file `backend/.env` và thay đổi:
```env
GROQ_API_KEY=gsk_your_actual_key_here
```

## 🧪 Test ngay

### 1. Khởi động lại server:
```bash
cd backend
npm run dev
```

### 2. Test API:
```bash
curl http://localhost:5000/api/groq/test
```

### 3. Test qua chat widget:
- Mở: http://localhost:5173
- Click bong bóng chat
- Gửi: "EBookFarm là gì?"

## 🎯 Kết quả mong đợi

```json
{
  "success": true,
  "message": "Kết nối Groq API thành công!",
  "data": {
    "model": "llama-3.1-70b-versatile",
    "response": "Xin chào! Tôi là trợ lý AI..."
  }
}
```

## 💡 Tại sao Groq miễn phí?

Groq là công ty phần cứng AI, họ cung cấp API miễn phí để:
- Quảng bá chip AI của họ
- Thu thập dữ liệu để cải thiện
- Cạnh tranh với OpenAI/Google

**Giới hạn miễn phí**: 14,400 requests/ngày (đủ cho 1000+ khách hàng chat)

## 🔧 Cấu hình nâng cao

### Thay đổi model (nếu cần):
```javascript
// File: backend/src/controllers/groqController.js
model: 'llama-3.1-70b-versatile',  // Mạnh nhất (khuyến nghị)
// model: 'llama-3.1-8b-instant',  // Nhanh nhất
// model: 'mixtral-8x7b-32768',    // Cân bằng
```

### Điều chỉnh tham số:
```javascript
temperature: 0.9,     // Độ sáng tạo (0-2)
max_tokens: 2048,     // Độ dài phản hồi
top_p: 0.95,          // Đa dạng từ vựng
```

## 🛠️ Troubleshooting

### Lỗi: "Invalid API Key"
**Giải pháp**:
1. Kiểm tra key trong `.env` có đúng format `gsk_...`
2. Khởi động lại server: `npm run dev`
3. Tạo key mới nếu cần

### Lỗi: "Rate limit exceeded"
**Giải pháp**:
1. Đợi 1 phút (reset mỗi phút)
2. Giới hạn: 30 requests/phút (rất cao)

### AI trả lời không đúng
**Giải pháp**:
1. Kiểm tra system prompt
2. Test với câu hỏi đơn giản trước

## 🎉 Hoàn thành!

Sau khi setup xong, bạn sẽ có:
- ✅ AI chatbot hoạt động 100% miễn phí
- ✅ Phản hồi siêu nhanh (0.5 giây)
- ✅ Chất lượng tương đương GPT-4
- ✅ Không lo về billing hay quota

**Groq là lựa chọn tốt nhất cho EBookFarm!** 🚀