# Hướng dẫn lấy Google Gemini API Key

## Bước 1: Truy cập Google AI Studio

1. Mở trình duyệt và truy cập: https://makersuite.google.com/app/apikey
2. Hoặc: https://aistudio.google.com/app/apikey
3. Đăng nhập bằng tài khoản Google của bạn

## Bước 2: Tạo API Key

1. Click vào nút **"Get API Key"** hoặc **"Create API Key"**
2. Chọn một trong hai tùy chọn:
   - **Create API key in new project**: Tạo project mới
   - **Create API key in existing project**: Sử dụng project có sẵn (nếu có)
3. Click **"Create API key in new project"** (khuyến nghị cho lần đầu)
4. Đợi vài giây để Google tạo API key

## Bước 3: Copy API Key

1. API Key sẽ hiển thị dạng: `AIzaSy...` (khoảng 39 ký tự)
2. Click vào icon **Copy** để copy API key
3. **LƯU Ý**: Lưu API key này cẩn thận, không chia sẻ công khai

## Bước 4: Cấu hình vào Project

1. Mở file `backend/.env`
2. Tìm dòng: `GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE`
3. Thay thế bằng API key vừa copy:
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. Lưu file

## Bước 5: Khởi động lại Server

```bash
cd backend
npm run dev
```

## Bước 6: Test API

### Test bằng Browser
Truy cập: http://localhost:5000/api/gemini/test

### Test bằng Postman/Thunder Client
```
GET http://localhost:5000/api/gemini/test
```

Kết quả thành công:
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

## Bước 7: Test Chat

### Test bằng Postman/Thunder Client
```
POST http://localhost:5000/api/gemini/chat
Content-Type: application/json

{
  "message": "Xin chào, bạn có thể giới thiệu về EBookFarm không?"
}
```

## Giới hạn Free Tier

Google Gemini API có các giới hạn sau cho tài khoản miễn phí:

### Gemini 1.5 Pro (Model đang dùng)
- **15 requests/phút** (RPM)
- **1 triệu tokens/phút** (TPM)
- **1,500 requests/ngày** (RPD)
- **Miễn phí hoàn toàn**

### Gemini 1.5 Flash (Nhanh hơn, nhẹ hơn)
- **15 requests/phút** (RPM)
- **1 triệu tokens/phút** (TPM)
- **1,500 requests/ngày** (RPD)
- **Miễn phí hoàn toàn**

## Nâng cấp lên Paid Plan

Nếu cần nhiều requests hơn:

1. Truy cập: https://console.cloud.google.com/
2. Chọn project của bạn
3. Vào **Billing** → **Enable Billing**
4. Thêm thông tin thanh toán

### Giá Paid Plan
- **Gemini 1.5 Pro**: $0.00125/1K characters input, $0.005/1K characters output
- **Gemini 1.5 Flash**: $0.000125/1K characters input, $0.0005/1K characters output

## Troubleshooting

### Lỗi: "API key not valid"
- Kiểm tra lại API key đã copy đúng chưa
- Đảm bảo không có khoảng trắng thừa
- API key phải bắt đầu bằng `AIzaSy`

### Lỗi: "Quota exceeded"
- Bạn đã vượt quá giới hạn 15 requests/phút
- Đợi 1 phút rồi thử lại
- Hoặc nâng cấp lên Paid Plan

### Lỗi: "API key not found"
- Kiểm tra file `.env` đã lưu chưa
- Khởi động lại server: `npm run dev`
- Kiểm tra biến môi trường: `console.log(process.env.GEMINI_API_KEY)`

### Lỗi: "Model not found"
- Đảm bảo đang dùng model đúng: `gemini-1.5-pro`
- Kiểm tra tài khoản Google có quyền truy cập model này

## Bảo mật API Key

### ✅ NÊN:
- Lưu API key trong file `.env`
- Thêm `.env` vào `.gitignore`
- Không commit API key lên Git
- Sử dụng biến môi trường trên server production

### ❌ KHÔNG NÊN:
- Hardcode API key trong code
- Commit API key lên GitHub/GitLab
- Chia sẻ API key công khai
- Để API key trong frontend code

## Monitoring Usage

1. Truy cập: https://aistudio.google.com/app/apikey
2. Click vào API key của bạn
3. Xem **Usage** để theo dõi:
   - Số requests đã dùng
   - Quota còn lại
   - Lịch sử sử dụng

## Tài liệu tham khảo

- **Google AI Studio**: https://aistudio.google.com/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **Quickstart**: https://ai.google.dev/tutorials/get_started_node

## Hỗ trợ

Nếu gặp vấn đề, liên hệ:
- Email: contact@ebookfarm.vn
- Hotline: 1900 xxxx
