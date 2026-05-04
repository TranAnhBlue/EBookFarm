# Test AI với Real-time Search

## 🧪 Các câu hỏi test để kiểm tra AI tìm kiếm thông tin thực tế

### 1. Thông tin thời gian thực

#### Test 1.1: Giá cả nông sản
```
Câu hỏi: "Giá lúa gạo hôm nay bao nhiêu?"
Mong đợi: AI tìm kiếm giá lúa gạo thực tế từ Google
Kết quả: Giá cụ thể theo thời gian thực
```

#### Test 1.2: Tin tức nông nghiệp
```
Câu hỏi: "Có tin tức gì mới về nông nghiệp Việt Nam không?"
Mong đợi: AI tìm kiếm tin tức mới nhất
Kết quả: Tóm tắt tin tức trong vài ngày gần đây
```

#### Test 1.3: Thời tiết
```
Câu hỏi: "Thời tiết hôm nay ở Đồng Tháp thế nào?"
Mong đợi: AI tìm kiếm thông tin thời tiết
Kết quả: Thông tin thời tiết cụ thể
```

### 2. Thông tin về tiêu chuẩn

#### Test 2.1: TCVN
```
Câu hỏi: "TCVN 12827:2023 là gì?"
Mong đợi: AI tìm kiếm thông tin về tiêu chuẩn TCVN
Kết quả: Giải thích chi tiết về tiêu chuẩn
```

#### Test 2.2: VietGAP
```
Câu hỏi: "VietGAP là gì và có những yêu cầu gì?"
Mong đợi: AI tìm kiếm thông tin về VietGAP
Kết quả: Định nghĩa và yêu cầu cụ thể
```

#### Test 2.3: GlobalGAP
```
Câu hỏi: "Khác biệt giữa VietGAP và GlobalGAP?"
Mong đợi: AI tìm kiếm và so sánh
Kết quả: Bảng so sánh hoặc giải thích chi tiết
```

### 3. Thông tin về EBookFarm

#### Test 3.1: Tính năng
```
Câu hỏi: "EBookFarm có những tính năng gì?"
Mong đợi: AI tìm kiếm từ website ebookfarm.vn
Kết quả: Danh sách tính năng thực tế
```

#### Test 3.2: Giá cả
```
Câu hỏi: "Bảng giá của EBookFarm như thế nào?"
Mong đợi: AI khuyến khích liên hệ trực tiếp
Kết quả: "Để biết giá chính xác, vui lòng liên hệ hotline: 1900 xxxx"
```

#### Test 3.3: So sánh
```
Câu hỏi: "So sánh EBookFarm với các phần mềm quản lý nông trại khác?"
Mong đợi: AI tìm kiếm thông tin về các phần mềm
Kết quả: So sánh khách quan (không nói xấu đối thủ)
```

### 4. Câu hỏi kỹ thuật

#### Test 4.1: Truy xuất nguồn gốc
```
Câu hỏi: "Truy xuất nguồn gốc hoạt động như thế nào?"
Mong đợi: AI giải thích quy trình
Kết quả: Giải thích chi tiết, dễ hiểu
```

#### Test 4.2: Mã QR
```
Câu hỏi: "Làm sao để tạo mã QR truy xuất nguồn gốc?"
Mong đợi: AI giải thích quy trình tạo QR
Kết quả: Hướng dẫn từng bước
```

#### Test 4.3: Blockchain
```
Câu hỏi: "Blockchain có vai trò gì trong truy xuất nguồn gốc?"
Mong đợi: AI tìm kiếm và giải thích
Kết quả: Giải thích về blockchain trong nông nghiệp
```

### 5. Câu hỏi về nông nghiệp

#### Test 5.1: Kỹ thuật canh tác
```
Câu hỏi: "Cách trồng cà phê Arabica ở Tây Nguyên?"
Mong đợi: AI tìm kiếm kỹ thuật canh tác
Kết quả: Hướng dẫn chi tiết
```

#### Test 5.2: Sâu bệnh
```
Câu hỏi: "Cách phòng trừ sâu đục thân lúa?"
Mong đợi: AI tìm kiếm biện pháp phòng trừ
Kết quả: Các biện pháp cụ thể
```

#### Test 5.3: Phân bón
```
Câu hỏi: "Nên bón phân gì cho lúa giai đoạn đẻ nhánh?"
Mong đợi: AI tìm kiếm khuyến cáo kỹ thuật
Kết quả: Loại phân và liều lượng cụ thể
```

## 📊 Đánh giá kết quả

### Tiêu chí đánh giá

| Tiêu chí | Mô tả | Điểm |
|----------|-------|------|
| **Độ chính xác** | Thông tin có chính xác không? | /10 |
| **Độ cập nhật** | Thông tin có mới nhất không? | /10 |
| **Độ liên quan** | Câu trả lời có liên quan đến câu hỏi? | /10 |
| **Độ chi tiết** | Câu trả lời có đủ chi tiết? | /10 |
| **Nguồn tin** | Có trích dẫn nguồn không? | /10 |
| **Tổng điểm** | | /50 |

### Kết quả mong đợi

- **40-50 điểm**: Xuất sắc - AI hoạt động tốt
- **30-39 điểm**: Tốt - Cần cải thiện một số điểm
- **20-29 điểm**: Trung bình - Cần điều chỉnh prompt
- **< 20 điểm**: Kém - Cần xem xét lại cấu hình

## 🔍 Cách test

### Bước 1: Test qua Admin Panel

1. Đăng nhập admin: http://localhost:5173/login
2. Vào menu **"Test Gemini AI"**
3. Nhập từng câu hỏi test ở trên
4. Đánh giá kết quả theo tiêu chí

### Bước 2: Test qua Chat Widget

1. Truy cập Landing Page: http://localhost:5173
2. Click vào bong bóng chat
3. Nhập từng câu hỏi test
4. So sánh với kết quả từ Admin Panel

### Bước 3: Test qua API

```bash
# Test với curl
curl -X POST http://localhost:5000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Giá lúa gạo hôm nay bao nhiêu?",
    "conversationHistory": []
  }'
```

### Bước 4: Test với Postman

```
POST http://localhost:5000/api/gemini/chat
Content-Type: application/json

{
  "message": "TCVN 12827:2023 là gì?",
  "conversationHistory": []
}
```

## 📝 Ghi chú kết quả test

### Test Date: [Ngày test]

#### Test 1: Giá lúa gạo
- **Câu hỏi**: "Giá lúa gạo hôm nay bao nhiêu?"
- **Kết quả**: [Ghi kết quả]
- **Đánh giá**: [Điểm số]
- **Nhận xét**: [Ghi chú]

#### Test 2: TCVN 12827:2023
- **Câu hỏi**: "TCVN 12827:2023 là gì?"
- **Kết quả**: [Ghi kết quả]
- **Đánh giá**: [Điểm số]
- **Nhận xét**: [Ghi chú]

[Tiếp tục với các test khác...]

## 🎯 Kết luận

### Điểm mạnh
- [Liệt kê điểm mạnh]

### Điểm yếu
- [Liệt kê điểm yếu]

### Đề xuất cải thiện
- [Đề xuất 1]
- [Đề xuất 2]
- [Đề xuất 3]

## 📚 Tài liệu tham khảo

- **Gemini API Docs**: https://ai.google.dev/docs
- **Grounding with Google Search**: https://ai.google.dev/docs/grounding
- **Best Practices**: https://ai.google.dev/docs/best_practices
