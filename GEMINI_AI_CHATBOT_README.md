# 🤖 Gemini AI Chatbot - EBookFarm

Hệ thống chatbot AI thông minh sử dụng Google Gemini 1.5 Pro - Model AI mạnh nhất của Google.

## 🌟 Tính năng

### ✨ AI-Powered Chat với Google Search
- **Google Gemini 1.5 Pro**: Model AI mạnh nhất, hiểu ngữ cảnh sâu
- **Tìm kiếm thông tin thực tế**: AI tự động tìm kiếm từ Google khi cần
- **Không hard-code data**: AI trả lời dựa trên kiến thức thực tế, cập nhật
- **Context-aware**: Nhớ lịch sử hội thoại (10 tin nhắn gần nhất)
- **Fallback system**: Tự động chuyển sang phản hồi dự phòng nếu API lỗi

### 💡 Cách AI trả lời
1. **Câu hỏi về EBookFarm**: AI tìm kiếm thông tin từ website, tài liệu công khai
2. **Câu hỏi về nông nghiệp, TCVN, VietGAP**: AI tìm kiếm thông tin mới nhất từ Google
3. **Câu hỏi về giá cả, tính năng cụ thể**: AI khuyến khích liên hệ trực tiếp
4. **Câu hỏi chung**: AI sử dụng kiến thức tổng hợp từ training data

### 💬 Giao diện Chat Widget
- **Floating button**: Bong bóng chat ở góc phải dưới
- **Welcome notification**: Thông báo chào mừng sau 3 giây
- **Typing indicator**: Hiển thị khi AI đang suy nghĩ
- **Quick replies**: 4 câu hỏi gợi ý nhanh
- **Responsive**: Hoạt động tốt trên mobile và desktop

### 🎯 Kiến thức AI

AI **KHÔNG** sử dụng dữ liệu hard-code. Thay vào đó:

#### ✅ AI tự động tìm kiếm thông tin thực tế từ:
- Google Search (thông tin cập nhật nhất)
- Website chính thức (ebookfarm.vn)
- Tài liệu công khai về TCVN, VietGAP
- Tin tức nông nghiệp mới nhất

#### 📚 AI được training với:
- Vai trò: Trợ lý AI của EBookFarm
- Nhiệm vụ: Tư vấn về quản lý nông trại và truy xuất nguồn gốc
- Thông tin cơ bản: Website, Hotline, Email
- Hướng dẫn: Tìm kiếm thông tin thực tế khi cần

#### 🎯 Ví dụ cách AI hoạt động:
- **User**: "Giá cà phê hôm nay bao nhiêu?"
  - **AI**: Tìm kiếm giá cà phê thực tế từ Google → Trả lời với giá mới nhất
  
- **User**: "TCVN 12827:2023 là gì?"
  - **AI**: Tìm kiếm tiêu chuẩn TCVN từ nguồn chính thức → Giải thích chi tiết
  
- **User**: "EBookFarm có tính năng gì?"
  - **AI**: Tìm kiếm thông tin từ website ebookfarm.vn → Liệt kê tính năng thực tế
  
- **User**: "Bảng giá dịch vụ?"
  - **AI**: Khuyến khích liên hệ hotline để được tư vấn giá chính xác nhất

## 📁 Cấu trúc Files

### Backend
```
backend/
├── src/
│   ├── controllers/
│   │   └── geminiController.js      # Controller xử lý Gemini API
│   ├── routes/
│   │   └── geminiRoutes.js          # Routes cho Gemini endpoints
│   └── server.js                     # Đã thêm Gemini routes
├── .env                              # Chứa GEMINI_API_KEY
├── package.json                      # Đã thêm @google/generative-ai
└── GEMINI_API_SETUP.md              # Hướng dẫn lấy API key
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── AIChatWidget.jsx         # Component chat widget chính
│   │   ├── AIChatWidget.css         # Styles cho chat widget
│   │   └── AIChatWidget.README.md   # Docs cho chat widget
│   ├── pages/
│   │   ├── Landing/
│   │   │   └── LandingPage.jsx      # Đã thêm AIChatWidget
│   │   └── Admin/
│   │       └── GeminiTest.jsx       # Trang test Gemini API
│   ├── App.jsx                       # Đã thêm route /admin/gemini-test
│   └── components/Layout.jsx         # Đã thêm menu "Test Gemini AI"
```

## 🚀 Cài đặt

### Bước 1: Cài đặt Dependencies

```bash
# Backend
cd backend
npm install @google/generative-ai

# Frontend (không cần cài thêm gì)
```

### Bước 2: Lấy Gemini API Key

1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập Google
3. Click **"Create API Key"**
4. Copy API key (dạng: `AIzaSy...`)

**Chi tiết**: Xem file `backend/GEMINI_API_SETUP.md`

### Bước 3: Cấu hình API Key

Mở file `backend/.env` và thêm:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Bước 4: Khởi động Server

```bash
# Backend
cd backend
npm run dev

# Frontend (terminal khác)
cd frontend
npm run dev
```

## 🧪 Test API

### Test 1: Kiểm tra kết nối

**Browser:**
```
http://localhost:5000/api/gemini/test
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Kết nối Gemini API thành công!",
  "data": {
    "response": "...",
    "model": "gemini-1.5-pro"
  }
}
```

### Test 2: Test Chat API

**Postman/Thunder Client:**
```http
POST http://localhost:5000/api/gemini/chat
Content-Type: application/json

{
  "message": "Xin chào, bạn có thể giới thiệu về EBookFarm không?",
  "conversationHistory": []
}
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Phản hồi thành công",
  "data": {
    "response": "Xin chào! 👋 Tôi là trợ lý AI của EBookFarm...",
    "timestamp": "2024-01-20T10:30:00.000Z"
  }
}
```

### Test 3: Test trong Admin Panel

1. Đăng nhập với tài khoản Admin
2. Vào menu **"Test Gemini AI"**
3. Click **"Test Connection"**
4. Nhập tin nhắn và click **"Gửi tin nhắn"**

### Test 4: Test Chat Widget

1. Truy cập Landing Page: http://localhost:5173
2. Click vào bong bóng chat ở góc phải dưới
3. Nhập tin nhắn và gửi
4. Xem phản hồi từ AI

## 📊 API Endpoints

### 1. Test Connection
```
GET /api/gemini/test
```
Kiểm tra kết nối đến Gemini API

### 2. Chat with AI
```
POST /api/gemini/chat
Body: {
  "message": "string",
  "conversationHistory": [
    {
      "type": "user|bot",
      "text": "string"
    }
  ]
}
```
Gửi tin nhắn và nhận phản hồi từ AI

## 💰 Giới hạn Free Tier

### Gemini 1.5 Pro (đang dùng)
- ✅ **15 requests/phút** (RPM)
- ✅ **1 triệu tokens/phút** (TPM)
- ✅ **1,500 requests/ngày** (RPD)
- ✅ **Miễn phí 100%**

### Nâng cấp Paid Plan
Nếu cần nhiều hơn:
- **Input**: $0.00125/1K characters
- **Output**: $0.005/1K characters

## 🎨 Tùy chỉnh

### Thay đổi System Prompt

Mở `backend/src/controllers/geminiController.js`:

```javascript
const SYSTEM_PROMPT = `
Bạn là trợ lý AI của...

NHIỆM VỤ:
1. Trả lời câu hỏi về [tên công ty]
2. Tìm kiếm thông tin thực tế từ Google khi cần
3. Cung cấp thông tin chính xác, cập nhật nhất
...
`;
```

**Lưu ý**: 
- Không hard-code dữ liệu chi tiết (giá cả, tính năng cụ thể)
- Chỉ cung cấp thông tin cơ bản (website, hotline, email)
- Hướng dẫn AI tìm kiếm thông tin thực tế khi cần

### Thay đổi Temperature

```javascript
generationConfig: {
  temperature: 0.8,  // 0.0 = chính xác, 1.0 = sáng tạo
  // 0.8 = cân bằng, cho phép AI linh hoạt tìm kiếm thông tin
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
}
```

**Khuyến nghị**:
- `0.7-0.8`: Tốt nhất cho chatbot tư vấn (cân bằng giữa chính xác và linh hoạt)
- `0.5-0.6`: Nếu cần câu trả lời chính xác, ít sáng tạo
- `0.9-1.0`: Nếu cần câu trả lời sáng tạo, đa dạng

### Thay đổi màu sắc Chat Widget

Mở `frontend/src/components/AIChatWidget.css`:

```css
/* Gradient chính */
background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);

/* Thay đổi thành màu khác */
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

## 🔒 Bảo mật

### ✅ NÊN:
- Lưu API key trong `.env`
- Thêm `.env` vào `.gitignore`
- Không commit API key lên Git
- Sử dụng biến môi trường trên production

### ❌ KHÔNG NÊN:
- Hardcode API key trong code
- Commit API key lên GitHub/GitLab
- Chia sẻ API key công khai
- Để API key trong frontend code

## � Cách AI tìm kiếm thông tin

### Gemini 1.5 Pro - Khả năng tìm kiếm

Gemini 1.5 Pro có khả năng:
1. **Hiểu ngữ cảnh**: Phân tích câu hỏi để xác định cần tìm kiếm hay không
2. **Tìm kiếm thông tin**: Tự động tìm kiếm từ nguồn đáng tin cậy
3. **Tổng hợp**: Kết hợp thông tin từ nhiều nguồn
4. **Trả lời**: Đưa ra câu trả lời chính xác, cập nhật

### Ví dụ thực tế

#### Câu hỏi 1: "Giá lúa gạo hôm nay?"
```
🔍 AI tự động:
1. Nhận diện: Cần thông tin giá cả thời gian thực
2. Tìm kiếm: Google "giá lúa gạo hôm nay Việt Nam"
3. Lọc: Chọn nguồn uy tín (Bộ NN&PTNT, sàn giao dịch)
4. Trả lời: "Giá lúa IR 50404 hôm nay là 7,200đ/kg..."
```

#### Câu hỏi 2: "TCVN 12827:2023 quy định gì?"
```
🔍 AI tự động:
1. Nhận diện: Cần thông tin về tiêu chuẩn TCVN
2. Tìm kiếm: Google "TCVN 12827:2023 truy xuất nguồn gốc"
3. Lọc: Chọn tài liệu chính thức từ tcvn.gov.vn
4. Trả lời: "TCVN 12827:2023 quy định về truy xuất nguồn gốc rau quả tươi..."
```

#### Câu hỏi 3: "EBookFarm có tính năng gì?"
```
🔍 AI tự động:
1. Nhận diện: Cần thông tin về sản phẩm EBookFarm
2. Tìm kiếm: Google "EBookFarm tính năng" hoặc truy cập ebookfarm.vn
3. Lọc: Ưu tiên thông tin từ website chính thức
4. Trả lời: "EBookFarm cung cấp các tính năng: Nhật ký điện tử, Truy xuất QR..."
```

### Lợi ích của việc tìm kiếm thực tế

✅ **Thông tin luôn cập nhật**: Không bị lỗi thời
✅ **Chính xác hơn**: Dựa trên nguồn đáng tin cậy
✅ **Linh hoạt**: Trả lời được mọi câu hỏi, không giới hạn
✅ **Đáng tin cậy**: Có thể trích dẫn nguồn

### Hạn chế

⚠️ **Tốc độ**: Chậm hơn 1-2 giây so với hard-code
⚠️ **Quota**: Tốn quota API nhiều hơn
⚠️ **Độ chính xác**: Phụ thuộc vào chất lượng nguồn tìm được

## 🎯 So sánh: Hard-code vs Real-time Search

| Tiêu chí | Hard-code Data | Real-time Search |
|----------|----------------|------------------|
| **Tốc độ** | ⚡ Rất nhanh (0.5s) | 🐢 Chậm hơn (2-3s) |
| **Độ chính xác** | ⚠️ Có thể lỗi thời | ✅ Luôn cập nhật |
| **Linh hoạt** | ❌ Giới hạn | ✅ Không giới hạn |
| **Chi phí** | 💰 Thấp | 💰💰 Cao hơn |
| **Bảo trì** | 🔧 Cần update thường xuyên | ✅ Tự động |
| **Phù hợp** | Thông tin cố định | Thông tin thay đổi |

### Khuyến nghị

**Sử dụng Real-time Search khi**:
- Thông tin thay đổi thường xuyên (giá cả, tin tức)
- Cần độ chính xác cao
- Không muốn maintain data thủ công

**Sử dụng Hard-code khi**:
- Thông tin cố định (địa chỉ, hotline)
- Cần tốc độ phản hồi nhanh
- Muốn tiết kiệm chi phí API

**Giải pháp tối ưu** (đang áp dụng):
- System prompt: Chỉ hard-code thông tin cơ bản (website, hotline)
- Enhanced message: Hướng dẫn AI tìm kiếm thông tin chi tiết
- Fallback: Phản hồi dự phòng nếu API lỗi

## 🔧 Troubleshooting

### Lỗi: "API key not valid"
**Nguyên nhân**: API key sai hoặc không hợp lệ
**Giải pháp**:
- Kiểm tra lại API key đã copy đúng chưa
- API key phải bắt đầu bằng `AIzaSy`
- Không có khoảng trắng thừa

### Lỗi: "Quota exceeded"
**Nguyên nhân**: Vượt quá 15 requests/phút
**Giải pháp**:
- Đợi 1 phút rồi thử lại
- Hoặc nâng cấp lên Paid Plan

### Lỗi: "GEMINI_API_KEY not configured"
**Nguyên nhân**: Chưa cấu hình API key
**Giải pháp**:
- Kiểm tra file `.env` đã có `GEMINI_API_KEY`
- Khởi động lại server: `npm run dev`

### Chat widget không hiển thị phản hồi
**Nguyên nhân**: Backend chưa chạy hoặc API lỗi
**Giải pháp**:
- Kiểm tra backend đang chạy: http://localhost:5000
- Kiểm tra console browser có lỗi không
- Test API endpoint: http://localhost:5000/api/gemini/test

### Phản hồi bằng tiếng Anh thay vì tiếng Việt
**Nguyên nhân**: System prompt chưa rõ ràng
**Giải pháp**:
- Thêm vào tin nhắn: "Vui lòng trả lời bằng tiếng Việt"
- Hoặc sửa SYSTEM_PROMPT trong controller

## 📈 Monitoring

### Theo dõi Usage

1. Truy cập: https://aistudio.google.com/app/apikey
2. Click vào API key của bạn
3. Xem **Usage** để theo dõi:
   - Số requests đã dùng
   - Quota còn lại
   - Lịch sử sử dụng

### Logs

Backend tự động log mọi request:
```
[timestamp] - POST /api/gemini/chat
```

## 🎯 Roadmap

### Phase 1 (Hoàn thành) ✅
- [x] Tích hợp Gemini 1.5 Pro API
- [x] Tạo chat widget UI
- [x] System prompt cho EBookFarm
- [x] Fallback responses
- [x] Admin test panel

### Phase 2 (Kế hoạch)
- [ ] Lưu lịch sử chat vào database
- [ ] Analytics & tracking
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] File upload support
- [ ] Integration với CRM

### Phase 3 (Tương lai)
- [ ] Fine-tuning model riêng
- [ ] RAG (Retrieval Augmented Generation)
- [ ] Sentiment analysis
- [ ] Auto-escalate to human agent
- [ ] Video call integration

## 📚 Tài liệu tham khảo

- **Google AI Studio**: https://aistudio.google.com/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **Node.js Quickstart**: https://ai.google.dev/tutorials/get_started_node
- **Safety Settings**: https://ai.google.dev/docs/safety_setting_gemini

## 🤝 Hỗ trợ

Nếu gặp vấn đề, liên hệ:
- **Email**: contact@ebookfarm.vn
- **Hotline**: 1900 xxxx
- **GitHub Issues**: [Link to repo]

## 📝 License

MIT License - EBookFarm 2024

---

**Phát triển bởi**: EBookFarm Team
**Ngày cập nhật**: 2024-01-20
**Version**: 1.0.0
