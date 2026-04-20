# ⚠️ Vấn đề với Gemini API Key

## 🔴 Vấn đề hiện tại

API key hiện tại (`AIzaSyAnnmvwD_DiCir4yDQE2ct2HSPf3c04eh8`) **KHÔNG hoạt động**.

Lỗi: `models/gemini-1.5-flash is not found for API version v1beta`

## 🔍 Nguyên nhân có thể

1. **API key đã hết hạn** hoặc bị vô hiệu hóa
2. **API key không có quyền** truy cập Gemini models
3. **API key được tạo từ tài khoản cũ** (trước khi Gemini ra mắt)
4. **Quota đã hết** (vượt quá 1,500 requests/ngày)

## ✅ Giải pháp: Tạo API Key mới

### Bước 1: Truy cập Google AI Studio
```
https://aistudio.google.com/app/apikey
```

### Bước 2: Đăng nhập
- Sử dụng tài khoản Google
- **Khuyến nghị**: Dùng tài khoản mới hoặc tài khoản chưa từng tạo Gemini API key

### Bước 3: Tạo API Key mới
1. Click **"Create API Key"**
2. Chọn **"Create API key in new project"**
3. Đợi vài giây
4. Copy API key (dạng: `AIzaSy...`)

### Bước 4: Cập nhật vào project
Mở file `backend/.env` và thay thế:

```env
# Cũ (KHÔNG hoạt động)
GEMINI_API_KEY=AIzaSyAnnmvwD_DiCir4yDQE2ct2HSPf3c04eh8

# Mới (Thay bằng API key vừa tạo)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Bước 5: Khởi động lại server
```bash
cd backend
npm run dev
```

### Bước 6: Test lại
```bash
# Test qua script
node test-grounding.js

# Hoặc test qua browser
http://localhost:5000/api/gemini/test
```

## 🧪 Kiểm tra API Key hoạt động

### Test nhanh với curl:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts":[{"text": "Xin chào"}]
    }]
  }'
```

**Kết quả mong đợi**:
```json
{
  "candidates": [{
    "content": {
      "parts": [{"text": "Xin chào! ..."}]
    }
  }]
}
```

**Nếu lỗi**:
```json
{
  "error": {
    "code": 400,
    "message": "API key not valid..."
  }
}
```
→ API key không hợp lệ, cần tạo mới

## 📝 Lưu ý quan trọng

### 1. API Key phải mới
- Tạo từ https://aistudio.google.com/app/apikey
- **KHÔNG** dùng API key từ Google Cloud Console cũ

### 2. Model names hiện tại
Các model đang hoạt động (tháng 1/2024):
- ✅ `gemini-1.5-flash` (Nhanh, miễn phí)
- ✅ `gemini-1.5-pro` (Mạnh hơn, miễn phí)
- ❌ `gemini-pro` (Đã deprecated)
- ❌ `gemini-1.5-pro-latest` (Không tồn tại)

### 3. Free Tier Limits
- **15 requests/phút**
- **1,500 requests/ngày**
- **1 triệu tokens/phút**

### 4. Nếu vẫn không hoạt động
Thử các bước sau:

#### A. Kiểm tra tài khoản Google
```
https://console.cloud.google.com/
```
- Đảm bảo có project
- Enable "Generative Language API"

#### B. Thử model khác
Trong `backend/src/controllers/geminiController.js`:
```javascript
// Thử model này
model: 'gemini-1.5-flash'

// Hoặc model này
model: 'gemini-1.5-pro'
```

#### C. Kiểm tra quota
```
https://aistudio.google.com/app/apikey
```
- Click vào API key
- Xem "Usage" → Kiểm tra còn quota không

## 🎯 Sau khi có API Key mới

### AI sẽ hoạt động như thế nào?

**Gemini 1.5 Flash** sử dụng **kiến thức tổng hợp** (training data) để trả lời:

#### ✅ AI có thể trả lời:
- Câu hỏi về EBookFarm (dựa trên prompt)
- Câu hỏi về TCVN, VietGAP (kiến thức chung)
- Câu hỏi về nông nghiệp (kiến thức chung)
- So sánh sản phẩm (dựa trên kiến thức)

#### ⚠️ AI KHÔNG thể:
- Tìm kiếm Google real-time (cần Gemini API Pro với Search Grounding - chưa khả dụng trong SDK Node.js)
- Truy cập website thực tế
- Lấy thông tin giá cả thời gian thực

#### 💡 Giải pháp:
AI sẽ trả lời dựa trên:
1. **Kiến thức tổng hợp** từ training data (cập nhật đến tháng 4/2024)
2. **System prompt** chi tiết (đã cung cấp ví dụ trả lời tốt)
3. **Context** từ lịch sử hội thoại

→ Vẫn rất hữu ích và thông minh, chỉ không phải "real-time search"

## 📚 Tài liệu tham khảo

- **Google AI Studio**: https://aistudio.google.com/
- **API Docs**: https://ai.google.dev/docs
- **Quickstart**: https://ai.google.dev/tutorials/get_started_node
- **Troubleshooting**: https://ai.google.dev/docs/troubleshooting

## 🆘 Cần hỗ trợ?

Nếu vẫn gặp vấn đề sau khi tạo API key mới:

1. Kiểm tra console log khi chạy server
2. Test trực tiếp với curl (như hướng dẫn trên)
3. Kiểm tra firewall/proxy có block không
4. Thử tài khoản Google khác

---

**Tóm lại**: Cần tạo API key mới từ https://aistudio.google.com/app/apikey và thay vào file `.env`
