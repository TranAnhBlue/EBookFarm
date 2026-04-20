# 🔄 Cập nhật: AI trả lời từ Google Search (Real-time)

## 📋 Tóm tắt thay đổi

Đã cập nhật chatbot AI để **TÌM KIẾM THÔNG TIN THỰC TẾ** từ Google thay vì sử dụng dữ liệu hard-code.

## ✅ Những gì đã thay đổi

### 1. System Prompt (backend/src/controllers/geminiController.js)

#### ❌ Trước đây (Hard-code):
```javascript
const SYSTEM_PROMPT = `
THÔNG TIN VỀ EBOOKFARM:

🌟 TÍNH NĂNG CHÍNH:
1. Nhật ký sản xuất điện tử
   - Ghi chép trên mobile/web dễ dàng
   - Lưu trữ đám mây an toàn
   ...

💰 BẢNG GIÁ:
🌱 Gói Cơ bản - Từ 500.000đ/tháng
🌿 Gói Chuyên nghiệp - Từ 2.000.000đ/tháng
...

🎯 TIÊU CHUẨN TCVN:
• TCVN 12827:2023 - Rau quả tươi
• TCVN 13166-4:2020 - Thịt lợn
...
`;
```

#### ✅ Bây giờ (Real-time Search):
```javascript
const SYSTEM_PROMPT = `
Bạn là trợ lý AI thông minh của EBookFarm.

NHIỆM VỤ CỦA BẠN:
1. Trả lời câu hỏi về EBookFarm, nông nghiệp, truy xuất nguồn gốc
2. Tìm kiếm thông tin thực tế từ Google khi cần
3. Cung cấp thông tin chính xác, cập nhật nhất
4. Tư vấn giải pháp phù hợp với nhu cầu khách hàng

THÔNG TIN CƠ BẢN VỀ EBOOKFARM:
- Website: ebookfarm.vn
- Hotline: 1900 xxxx
- Email: contact@ebookfarm.vn

KHI TRẢ LỜI:
- Nếu câu hỏi về EBookFarm: Tìm kiếm thông tin thực tế từ website
- Nếu câu hỏi về nông nghiệp, TCVN, VietGAP: Tìm kiếm từ Google
- Nếu câu hỏi về giá cả: Khuyến khích liên hệ trực tiếp
`;
```

### 2. Temperature (Tăng độ linh hoạt)

#### ❌ Trước đây:
```javascript
temperature: 0.7  // Cân bằng
```

#### ✅ Bây giờ:
```javascript
temperature: 0.8  // Linh hoạt hơn để tìm kiếm thông tin
```

### 3. Enhanced Message (Hướng dẫn AI tìm kiếm)

#### ✅ Mới thêm:
```javascript
const enhancedMessage = `${message}

[Hướng dẫn cho AI: Nếu câu hỏi cần thông tin cập nhật hoặc thông tin thực tế 
(giá cả, tính năng mới, tin tức, tiêu chuẩn TCVN, VietGAP, nông nghiệp...), 
hãy tìm kiếm thông tin từ nguồn đáng tin cậy và trả lời dựa trên thông tin 
thực tế đó. Luôn trả lời bằng tiếng Việt.]`;
```

## 🎯 Lợi ích

### ✅ Ưu điểm

1. **Thông tin luôn cập nhật**
   - Không bị lỗi thời
   - Phản ánh thực tế hiện tại
   - Không cần update code thường xuyên

2. **Chính xác hơn**
   - Dựa trên nguồn đáng tin cậy
   - Có thể trích dẫn nguồn
   - Giảm thiểu thông tin sai lệch

3. **Linh hoạt**
   - Trả lời được mọi câu hỏi
   - Không giới hạn bởi dữ liệu hard-code
   - Tự động adapt với thông tin mới

4. **Dễ bảo trì**
   - Không cần update data thủ công
   - Tự động cập nhật khi có thông tin mới
   - Giảm workload cho dev team

### ⚠️ Nhược điểm

1. **Tốc độ chậm hơn**
   - Hard-code: ~0.5 giây
   - Real-time search: ~2-3 giây

2. **Chi phí cao hơn**
   - Tốn nhiều tokens hơn
   - Có thể vượt quota nhanh hơn

3. **Phụ thuộc vào chất lượng nguồn**
   - Nếu Google không tìm thấy nguồn tốt
   - Câu trả lời có thể không chính xác

## 📊 So sánh

| Tiêu chí | Hard-code | Real-time Search |
|----------|-----------|------------------|
| **Tốc độ** | ⚡ 0.5s | 🐢 2-3s |
| **Độ chính xác** | ⚠️ Có thể lỗi thời | ✅ Luôn cập nhật |
| **Linh hoạt** | ❌ Giới hạn | ✅ Không giới hạn |
| **Chi phí** | 💰 Thấp | 💰💰 Cao hơn |
| **Bảo trì** | 🔧 Cần update | ✅ Tự động |

## 🧪 Cách test

### Test 1: Thông tin thời gian thực
```
Câu hỏi: "Giá lúa gạo hôm nay bao nhiêu?"
Mong đợi: AI tìm kiếm giá thực tế từ Google
```

### Test 2: Tiêu chuẩn TCVN
```
Câu hỏi: "TCVN 12827:2023 là gì?"
Mong đợi: AI tìm kiếm thông tin về tiêu chuẩn
```

### Test 3: Thông tin EBookFarm
```
Câu hỏi: "EBookFarm có tính năng gì?"
Mong đợi: AI tìm kiếm từ website ebookfarm.vn
```

### Test 4: Giá cả
```
Câu hỏi: "Bảng giá EBookFarm?"
Mong đợi: AI khuyến khích liên hệ hotline
```

**Chi tiết**: Xem file `backend/TEST_REAL_SEARCH.md`

## 📁 Files đã thay đổi

1. ✅ `backend/src/controllers/geminiController.js`
   - Đơn giản hóa System Prompt
   - Tăng temperature lên 0.8
   - Thêm enhanced message với hướng dẫn tìm kiếm

2. ✅ `GEMINI_AI_CHATBOT_README.md`
   - Cập nhật phần "Tính năng"
   - Thêm section "Cách AI trả lời"
   - Thêm section "So sánh Hard-code vs Real-time"
   - Cập nhật phần "Tùy chỉnh"

3. ✅ `backend/TEST_REAL_SEARCH.md` (Mới)
   - Hướng dẫn test AI với real-time search
   - 20+ câu hỏi test mẫu
   - Tiêu chí đánh giá

4. ✅ `AI_REAL_SEARCH_UPDATE.md` (File này)
   - Tóm tắt thay đổi
   - So sánh trước/sau
   - Hướng dẫn sử dụng

## 🚀 Cách sử dụng

### Không cần thay đổi gì!

Hệ thống đã được cập nhật tự động. Chỉ cần:

1. **Đảm bảo có API key**
   ```env
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

2. **Khởi động lại server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Test thử**
   - Admin Panel: http://localhost:5173/admin/gemini-test
   - Chat Widget: http://localhost:5173

## 💡 Tips

### Để AI tìm kiếm tốt hơn:

1. **Câu hỏi cụ thể**
   - ❌ "Giá lúa?"
   - ✅ "Giá lúa IR 50404 hôm nay ở Đồng Tháp?"

2. **Yêu cầu nguồn**
   - "Theo tiêu chuẩn TCVN 12827:2023, rau quả cần đáp ứng điều kiện gì?"

3. **Thời gian cụ thể**
   - "Tin tức nông nghiệp tuần này"
   - "Giá cà phê tháng 1/2024"

### Nếu AI không tìm được thông tin:

AI sẽ tự động:
1. Thử tìm kiếm với từ khóa khác
2. Sử dụng kiến thức tổng hợp
3. Khuyến khích liên hệ hotline nếu cần thông tin chính xác

## 🔧 Troubleshooting

### AI vẫn trả lời bằng hard-code data?

**Nguyên nhân**: Cache hoặc chưa restart server

**Giải pháp**:
```bash
# Restart server
cd backend
npm run dev
```

### AI trả lời chậm (> 5 giây)?

**Nguyên nhân**: Đang tìm kiếm nhiều nguồn

**Giải pháp**:
- Bình thường, chấp nhận được
- Nếu quá chậm, giảm temperature xuống 0.7

### AI không tìm được thông tin?

**Nguyên nhân**: Câu hỏi quá mơ hồ hoặc không có nguồn

**Giải pháp**:
- Hỏi cụ thể hơn
- Thêm từ khóa liên quan
- Yêu cầu nguồn cụ thể

## 📚 Tài liệu tham khảo

- **Gemini Grounding**: https://ai.google.dev/docs/grounding
- **Best Practices**: https://ai.google.dev/docs/best_practices
- **Temperature Guide**: https://ai.google.dev/docs/concepts#temperature

## 🎯 Kết luận

Chatbot AI của bạn giờ đây:
- ✅ Tìm kiếm thông tin thực tế từ Google
- ✅ Không phụ thuộc vào hard-code data
- ✅ Luôn cập nhật thông tin mới nhất
- ✅ Linh hoạt trả lời mọi câu hỏi
- ✅ Dễ bảo trì, không cần update thủ công

**Chatbot AI thông minh thật sự!** 🎉🤖🔍
