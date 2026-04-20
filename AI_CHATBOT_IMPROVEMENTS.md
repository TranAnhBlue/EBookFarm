# AI Chatbot Improvements - EBookFarm

## Ngày cập nhật: 20/04/2026

## ✅ Đã hoàn thành

### 1. Cập nhật API Key mới
- **File**: `backend/.env`
- **API Key cũ**: `AIzaSyCzTQEWqPhRR9UMTmWyA51MLunGh4tEW2M` (hết quota)
- **API Key mới**: `AIzaSyAnnmvwD_DiCir4yDQE2ct2HSPf3c04eh8` ✅
- **Model**: `gemini-flash-latest` (có quota khả dụng)

### 2. Cải thiện System Prompt
**File**: `backend/src/controllers/geminiController.js`

#### Thay đổi chính:

**A. Làm rõ EBookFarm KHÔNG phải thư viện sách**
```
⚠️ QUAN TRỌNG - ĐỌC KỸ:
1. EBookFarm KHÔNG PHẢI là thư viện sách điện tử (ebook library)
2. EBookFarm LÀ hệ thống quản lý nông trại và truy xuất nguồn gốc nông sản
3. "EBook" trong tên có nghĩa là "Nhật ký điện tử" (Electronic Journal)
```

**B. Mô tả chi tiết về EBookFarm**
- Tên đầy đủ: EBookFarm - Hệ thống Nhật ký Sản xuất & Truy xuất Nguồn gốc Nông sản
- Lĩnh vực: Nông nghiệp số (Digital Agriculture), Truy xuất nguồn gốc (Traceability)
- Đối tượng: Nông dân, HTX, doanh nghiệp nông nghiệp, cơ quan quản lý

**C. Mở rộng hướng dẫn trả lời**
1. **Câu hỏi về EBookFarm**: Nhấn mạnh là hệ thống quản lý nông trại, giải thích chi tiết 4 tính năng chính
2. **Câu hỏi về giá cả**: Giải thích có nhiều gói, khuyến khích liên hệ
3. **Câu hỏi về TCVN, VietGAP**: Cung cấp kiến thức chi tiết dựa trên hiểu biết chung
4. **Câu hỏi về nông nghiệp**: Trả lời dựa trên kiến thức tổng hợp, không chỉ nói "liên hệ hotline"
5. **So sánh sản phẩm**: So sánh khách quan, nhấn mạnh điểm mạnh EBookFarm

**D. Thêm 5 ví dụ trả lời chi tiết**

1. **"EBookFarm là gì?"**
   - Làm rõ KHÔNG phải thư viện sách
   - Giải thích "EBook" = "Nhật ký điện tử"
   - Liệt kê 4 tính năng chính với icon

2. **"EBookFarm có tính năng gì?"**
   - 📝 Nhật ký sản xuất điện tử (chi tiết: ghi chép, quản lý phân bón/thuốc, lưu trữ, báo cáo)
   - 🔍 Truy xuất nguồn gốc QR (chi tiết: tạo QR, quét xem hành trình, tuân thủ TCVN)
   - ⛓️ Quản lý chuỗi cung ứng (chi tiết: kết nối các bên, kiểm soát chất lượng)
   - 📊 Báo cáo & Phân tích (chi tiết: thống kê, so sánh, dự báo)

3. **"TCVN 12827:2023 là gì?"**
   - Giải thích tiêu chuẩn truy xuất nguồn gốc rau quả
   - Nội dung chính: thông tin bắt buộc, quy trình, mã định danh
   - Lợi ích: tin cậy, xuất khẩu, quản lý, xử lý sự cố
   - Kết nối với EBookFarm

4. **"Làm sao để trồng cà chua an toàn?"**
   - Giai đoạn chuẩn bị: giống, xử lý đất, làm luống
   - Giai đoạn chăm sóc: tưới, bón phân, cắt tỉa
   - Phòng trừ sâu bệnh: sâu đục quả, bệnh héo xanh, bệnh đốm lá
   - Ghi chép với EBookFarm: nhật ký, cảnh báo, tạo QR
   - Hỏi thêm về điều kiện cụ thể

5. **"VietGAP khác GlobalGAP như thế nào?"**
   - So sánh chi tiết 2 tiêu chuẩn
   - Bảng so sánh: chi phí, độ khó, thị trường, thời gian
   - Khuyến nghị dựa trên quy mô và mục tiêu
   - EBookFarm hỗ trợ cả 2

### 3. Kết quả mong đợi

#### Trước khi cải thiện:
- AI hiểu nhầm EBookFarm là thư viện sách điện tử
- Trả lời chung chung, hay nói "liên hệ hotline"
- Không cung cấp kiến thức chuyên môn về nông nghiệp

#### Sau khi cải thiện:
- ✅ AI hiểu rõ EBookFarm là hệ thống quản lý nông trại
- ✅ Trả lời chi tiết, cung cấp kiến thức thực tế
- ✅ Giải thích về TCVN, VietGAP, GlobalGAP
- ✅ Tư vấn kỹ thuật canh tác (cà chua, rau, thủy sản...)
- ✅ So sánh khách quan các tiêu chuẩn
- ✅ Chỉ khuyến khích liên hệ khi thực sự cần tư vấn cá nhân hóa

## 🧪 Cách kiểm tra

### 1. Khởi động lại Backend Server
```bash
cd backend
npm run dev
```

### 2. Mở Frontend
```bash
cd frontend
npm run dev
```

### 3. Test qua Chat Widget
Mở trang web và click vào bong bóng chat AI ở góc dưới bên phải.

#### Test Cases:

**Test 1: Hiểu đúng về EBookFarm**
```
User: "EBookFarm là gì?"
Expected: AI giải thích là hệ thống quản lý nông trại, KHÔNG phải thư viện sách
```

**Test 2: Giải thích tính năng chi tiết**
```
User: "EBookFarm có tính năng gì?"
Expected: AI liệt kê 4 tính năng với mô tả chi tiết từng tính năng
```

**Test 3: Kiến thức về TCVN**
```
User: "TCVN 12827:2023 là gì?"
Expected: AI giải thích tiêu chuẩn truy xuất nguồn gốc rau quả, nội dung, lợi ích
```

**Test 4: Tư vấn kỹ thuật nông nghiệp**
```
User: "Làm sao để trồng cà chua an toàn?"
Expected: AI cung cấp hướng dẫn chi tiết từng giai đoạn, không chỉ nói "liên hệ hotline"
```

**Test 5: So sánh tiêu chuẩn**
```
User: "VietGAP khác GlobalGAP như thế nào?"
Expected: AI so sánh chi tiết, có bảng so sánh, khuyến nghị phù hợp
```

**Test 6: Câu hỏi về giá**
```
User: "Giá bao nhiêu?"
Expected: AI giải thích có nhiều gói, phụ thuộc quy mô, khuyến khích liên hệ để báo giá chính xác
```

**Test 7: Câu hỏi về thủy sản**
```
User: "Nuôi tôm cần chú ý gì?"
Expected: AI cung cấp kiến thức về nuôi tôm, không chỉ nói "liên hệ hotline"
```

### 4. Test qua Admin Panel
Truy cập: http://localhost:5173/admin/gemini-test

Gửi các câu hỏi test và xem phản hồi từ Gemini API.

## 📊 Đánh giá chất lượng

### Tiêu chí đánh giá:
- [ ] AI hiểu đúng EBookFarm là hệ thống quản lý nông trại
- [ ] AI KHÔNG nhầm lẫn với thư viện sách điện tử
- [ ] AI cung cấp kiến thức chi tiết về tính năng
- [ ] AI giải thích được TCVN, VietGAP, GlobalGAP
- [ ] AI tư vấn được kỹ thuật canh tác cơ bản
- [ ] AI chỉ khuyến khích liên hệ khi thực sự cần thiết
- [ ] Phản hồi nhanh (< 3 giây)
- [ ] Ngôn ngữ tự nhiên, dễ hiểu

## 🔧 Troubleshooting

### Lỗi: "Gemini API key chưa được cấu hình"
**Giải pháp**: Kiểm tra file `backend/.env`, đảm bảo có dòng:
```
GEMINI_API_KEY=AIzaSyAnnmvwD_DiCir4yDQE2ct2HSPf3c04eh8
```

### Lỗi: "Quota exceeded"
**Giải pháp**: API key đã hết quota, cần lấy key mới từ Google AI Studio

### Lỗi: "Model not found"
**Giải pháp**: Đổi model trong `geminiController.js`:
- Thử: `gemini-1.5-flash-latest`
- Hoặc: `gemini-1.5-pro-latest`

### AI vẫn trả lời chung chung
**Giải pháp**: 
1. Kiểm tra system prompt đã được cập nhật chưa
2. Khởi động lại backend server
3. Xóa cache trình duyệt và refresh

## 📝 Ghi chú

- Model đang dùng: `gemini-flash-latest` (nhanh, chi phí thấp)
- Có thể nâng cấp lên `gemini-1.5-pro` nếu cần phản hồi phức tạp hơn
- System prompt có thể tiếp tục mở rộng với nhiều ví dụ hơn
- Nên thêm RAG (Retrieval-Augmented Generation) để AI truy cập database thực tế

## 🚀 Cải tiến tiếp theo (tùy chọn)

1. **Tích hợp RAG**: AI truy vấn database để trả lời về dữ liệu thực tế (giá, tính năng mới nhất)
2. **Đa ngôn ngữ**: Hỗ trợ tiếng Anh, tiếng Trung cho xuất khẩu
3. **Voice input**: Nông dân có thể nói thay vì gõ
4. **Gợi ý thông minh**: AI phân tích câu hỏi và gợi ý câu hỏi liên quan
5. **Feedback loop**: Người dùng đánh giá câu trả lời để cải thiện
6. **Context awareness**: AI nhớ ngữ cảnh cuộc trò chuyện tốt hơn
