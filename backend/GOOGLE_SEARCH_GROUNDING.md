# Google Search Grounding - Gemini API

## 🔍 Google Search Grounding là gì?

**Google Search Grounding** là tính năng cho phép Gemini AI tự động tìm kiếm thông tin từ Google Search khi trả lời câu hỏi.

### Lợi ích:
- ✅ Thông tin luôn cập nhật, chính xác
- ✅ Truy cập được thông tin thời gian thực
- ✅ Có thể trích dẫn nguồn
- ✅ Không cần hard-code data

## 🚀 Cách hoạt động

### 1. Khi người dùng hỏi:
```
"So sánh EBookFarm với các phần mềm quản lý nông trại khác?"
```

### 2. AI tự động:
1. **Phân tích câu hỏi**: Nhận diện cần so sánh
2. **Tìm kiếm Google**: Tìm thông tin về các phần mềm
3. **Lọc kết quả**: Chọn nguồn đáng tin cậy
4. **Tổng hợp**: Kết hợp thông tin từ nhiều nguồn
5. **Trả lời**: Đưa ra câu trả lời chi tiết với nguồn

### 3. Kết quả:
```
Dựa trên thông tin từ các nguồn, EBookFarm có những điểm nổi bật:

1. **Truy xuất nguồn gốc QR**: 
   - Tuân thủ 35+ tiêu chuẩn TCVN
   - Tích hợp Cổng TXNG Quốc gia
   
2. **So với các phần mềm khác**:
   - FarmOS: Mã nguồn mở, nhưng thiếu tính năng truy xuất
   - AgriApp: Tập trung vào quản lý, chưa có QR
   - EBookFarm: Kết hợp cả quản lý và truy xuất

Nguồn: [ebookfarm.vn], [tcvn.gov.vn]
```

## ⚙️ Cấu hình

### Trong code (đã cập nhật):

```javascript
const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    generationConfig: {
        temperature: 0.9,  // Cao để AI tự do tìm kiếm
        maxOutputTokens: 2048,
    },
    // Enable Google Search grounding
    tools: [{
        googleSearchRetrieval: {
            dynamicRetrievalConfig: {
                mode: 'MODE_DYNAMIC',  // Tự động quyết định khi nào tìm kiếm
                dynamicThreshold: 0.3  // Ngưỡng thấp = tìm kiếm nhiều hơn
            }
        }
    }]
});
```

### Các mode:

#### 1. MODE_DYNAMIC (Đang dùng)
- AI tự quyết định khi nào cần tìm kiếm
- Linh hoạt nhất
- **Khuyến nghị** cho chatbot

#### 2. MODE_UNSPECIFIED
- Không tự động tìm kiếm
- Chỉ dùng kiến thức có sẵn

### Dynamic Threshold:

| Threshold | Ý nghĩa | Khi nào dùng |
|-----------|---------|--------------|
| **0.1-0.3** | Tìm kiếm nhiều | Cần thông tin mới nhất |
| **0.4-0.6** | Cân bằng | Sử dụng chung |
| **0.7-0.9** | Tìm kiếm ít | Tiết kiệm quota |

**Đang dùng**: 0.3 (tìm kiếm nhiều)

## 📊 So sánh với/không có Grounding

### Không có Grounding:
```
User: "Giá lúa gạo hôm nay?"
AI: "Tôi không có thông tin cập nhật về giá lúa gạo. 
     Vui lòng liên hệ hotline: 1900 xxxx"
```

### Có Grounding:
```
User: "Giá lúa gạo hôm nay?"
AI: "Theo thông tin từ Sở NN&PTNT, giá lúa hôm nay:
     - IR 50404: 7,200đ/kg
     - OM 5451: 7,500đ/kg
     - Jasmine: 8,000đ/kg
     
     Nguồn: [sonongnghiep.gov.vn]"
```

## 🧪 Test Grounding

### Test 1: Thông tin thời gian thực
```bash
curl -X POST http://localhost:5000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Giá cà phê hôm nay bao nhiêu?",
    "conversationHistory": []
  }'
```

**Mong đợi**: AI tìm kiếm và trả về giá cà phê thực tế

### Test 2: Thông tin về tiêu chuẩn
```bash
curl -X POST http://localhost:5000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "TCVN 12827:2023 quy định gì?",
    "conversationHistory": []
  }'
```

**Mong đợi**: AI tìm kiếm và giải thích tiêu chuẩn

### Test 3: So sánh sản phẩm
```bash
curl -X POST http://localhost:5000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "So sánh EBookFarm với FarmOS?",
    "conversationHistory": []
  }'
```

**Mong đợi**: AI tìm kiếm và so sánh khách quan

## 💰 Chi phí

### Free Tier:
- ✅ **15 requests/phút**
- ✅ **1,500 requests/ngày**
- ⚠️ **Grounding tốn nhiều tokens hơn**

### Ước tính:
- Không Grounding: ~500 tokens/request
- Có Grounding: ~1,500 tokens/request (gấp 3 lần)

### Khuyến nghị:
- Development: Dùng Free Tier
- Production: Nâng cấp Paid Plan nếu > 1,500 requests/ngày

## 🔧 Troubleshooting

### AI vẫn không tìm kiếm?

#### Nguyên nhân 1: API key chưa enable Grounding
**Giải pháp**:
1. Truy cập: https://aistudio.google.com/app/apikey
2. Kiểm tra API key có quyền "Search Grounding"
3. Nếu không, tạo API key mới

#### Nguyên nhân 2: Threshold quá cao
**Giải pháp**:
```javascript
dynamicThreshold: 0.3  // Giảm xuống 0.1-0.3
```

#### Nguyên nhân 3: Câu hỏi không rõ ràng
**Giải pháp**:
- Hỏi cụ thể hơn
- Thêm từ khóa liên quan
- Yêu cầu tìm kiếm: "Hãy tìm kiếm thông tin về..."

### AI tìm kiếm nhưng kết quả sai?

#### Nguyên nhân: Nguồn không đáng tin cậy
**Giải pháp**:
- Thêm vào prompt: "Ưu tiên nguồn chính thức (.gov.vn, .edu.vn)"
- Yêu cầu trích dẫn nguồn

### AI tìm kiếm quá chậm?

#### Nguyên nhân: Tìm kiếm nhiều nguồn
**Giải pháp**:
```javascript
temperature: 0.7,  // Giảm xuống để AI tập trung hơn
dynamicThreshold: 0.5  // Tăng lên để tìm kiếm ít hơn
```

## 📚 Tài liệu tham khảo

- **Grounding Docs**: https://ai.google.dev/docs/grounding
- **Search Retrieval**: https://ai.google.dev/api/caching#search-grounding
- **Best Practices**: https://ai.google.dev/docs/best_practices

## ✅ Checklist

Để đảm bảo Grounding hoạt động:

- [x] API key có quyền Search Grounding
- [x] Thêm `tools: [{ googleSearchRetrieval: {...} }]` vào config
- [x] Temperature >= 0.8 (để AI linh hoạt)
- [x] dynamicThreshold <= 0.3 (để tìm kiếm nhiều)
- [x] System prompt khuyến khích AI tìm kiếm
- [x] Test với câu hỏi cần thông tin thời gian thực

## 🎯 Kết luận

Google Search Grounding giúp AI:
- ✅ Trả lời dựa trên thông tin thực tế
- ✅ Luôn cập nhật
- ✅ Không cần hard-code data
- ✅ Trích dẫn nguồn đáng tin cậy

**Chatbot AI thông minh thật sự!** 🎉🔍
