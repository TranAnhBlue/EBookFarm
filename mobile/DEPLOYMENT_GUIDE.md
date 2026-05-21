# Mobile App Deployment Guide

## ✅ Hoàn thành

Mobile app đã được cấu hình và sẵn sàng sử dụng với backend production trên Render.

## 🌐 API Configuration

**Backend URL:** `https://ebookfarm.onrender.com/api`

File cấu hình: `mobile/.env`
```env
EXPO_PUBLIC_API_URL=https://ebookfarm.onrender.com/api
```

## 🚀 Cách chạy Mobile App

### 1. Khởi động Expo
```bash
cd mobile
npx expo start --clear
```

### 2. Mở app trên điện thoại

**Android:**
- Cài đặt **Expo Go** từ Google Play Store
- Quét QR code từ terminal

**iOS:**
- Cài đặt **Expo Go** từ App Store
- Quét QR code bằng Camera app hoặc Expo Go

**Web:**
- Nhấn phím `w` trong terminal
- Hoặc mở `http://localhost:8081`

## 📱 Các màn hình đã có

### Core Screens (v1.0.0)
1. ✅ LoginScreen - Đăng nhập
2. ✅ HomeScreen - Trang chủ
3. ✅ JournalListScreen - Danh sách nhật ký
4. ✅ InventoryScreen - Kho vật tư
5. ✅ SupplyScreen - Xin cấp vật tư
6. ✅ AIScreen - Hỏi AI
7. ✅ TCVNScreen - Tiêu chuẩn TCVN
8. ✅ ProfileScreen - Tài khoản
9. ✅ ScannerScreen - Quét QR
10. ✅ TraceDetailScreen - Chi tiết truy xuất

### News & Account (v1.1.0)
11. ✅ NewsListScreen - Danh sách tin tức
12. ✅ NewsDetailScreen - Chi tiết tin tức
13. ✅ AccountInfoScreen - Thông tin tài khoản
14. ✅ ChangePasswordScreen - Đổi mật khẩu

### New Features (v1.2.0)
15. ✅ JournalEntryScreen - Tạo/sửa nhật ký
16. ✅ ProductionTechScreen - Tài liệu kỹ thuật VietGAP
17. ✅ NotificationsScreen - Thông báo hệ thống
18. ✅ SettingsScreen - Cài đặt ứng dụng

**Tổng cộng: 18 screens**

## 🔧 Troubleshooting

### Lỗi Network Error
**Nguyên nhân:** Backend trên Render đang sleep (free tier)

**Giải pháp:**
1. Mở browser và truy cập `https://ebookfarm.onrender.com`
2. Đợi 30-60 giây để backend wake up
3. Reload app (nhấn `r` trong terminal hoặc shake điện thoại)

### Lỗi Module Resolution
**Nguyên nhân:** Cache cũ hoặc dependencies chưa đúng

**Giải pháp:**
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

### Lỗi Cannot resolve entry file
**Nguyên nhân:** Entry point không đúng

**Giải pháp:**
- Đảm bảo `package.json` có `"main": "index.js"`
- Đảm bảo file `index.js` tồn tại ở root của mobile folder

## 📦 Dependencies

Tất cả dependencies đã được cài đặt:
```json
{
  "@react-navigation/native": "^7.2.4",
  "@react-navigation/native-stack": "^7.15.1",
  "@react-navigation/bottom-tabs": "^7.15.5",
  "@tanstack/react-query": "^5.62.14",
  "axios": "^1.16.1",
  "expo": "^54.0.0",
  "expo-image-picker": "~16.0.3",
  "zustand": "^5.0.13"
}
```

## 🔐 Authentication

App sử dụng JWT token authentication:
- Token được lưu trong AsyncStorage
- Tự động attach vào mọi API request
- Auto logout khi token expired (401)

## 📊 API Endpoints được sử dụng

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký

### Journals
- `GET /journals` - Danh sách nhật ký
- `GET /journals/:id` - Chi tiết nhật ký
- `POST /journals` - Tạo nhật ký mới
- `PUT /journals/:id` - Cập nhật nhật ký

### Schemas
- `GET /schemas` - Danh sách schema
- `GET /schemas/:id` - Chi tiết schema

### News
- `GET /news` - Danh sách tin tức
- `GET /news/:id` - Chi tiết tin tức

### User
- `GET /users/profile` - Thông tin user
- `PUT /users/profile` - Cập nhật thông tin
- `PUT /users/change-password` - Đổi mật khẩu

### Notifications
- `GET /notifications` - Danh sách thông báo

### Reports
- `GET /reports/dashboard-stats` - Thống kê dashboard

## 🎨 UI/UX Features

- ✅ Modern design với shadows và rounded corners
- ✅ Smooth animations và transitions
- ✅ Loading states cho mọi API calls
- ✅ Error handling với Alert messages
- ✅ Empty states với friendly messages
- ✅ Pull-to-refresh cho danh sách
- ✅ Form validation
- ✅ Responsive layout
- ✅ Consistent color scheme (Green primary: #22c55e)

## 🔄 Development vs Production

### Development (Local Backend)
Uncomment trong `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.0.109:5000/api
```

### Production (Render Backend)
Default trong `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://ebookfarm.onrender.com/api
```

## 📝 Notes

1. **Render Free Tier:** Backend có thể sleep sau 15 phút không hoạt động. Lần request đầu tiên sẽ mất 30-60 giây để wake up.

2. **Expo Go Limitations:** 
   - Không thể test native modules ngoài Expo SDK
   - Để test full features, cần build standalone app

3. **Network Security:**
   - iOS yêu cầu HTTPS cho production
   - Android cho phép HTTP trong development

4. **Image Upload:**
   - Sử dụng `expo-image-picker`
   - Hỗ trợ camera và gallery
   - Auto resize trước khi upload

## 🚢 Next Steps

### Build Standalone App

**Android APK:**
```bash
cd mobile
eas build --platform android --profile preview
```

**iOS IPA:**
```bash
cd mobile
eas build --platform ios --profile preview
```

### Publish to Stores

**Google Play Store:**
```bash
eas build --platform android --profile production
eas submit --platform android
```

**Apple App Store:**
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## 📞 Support

Nếu gặp vấn đề:
1. Check terminal logs
2. Check Expo Go app logs (shake device → Show Dev Menu → Debug)
3. Check backend logs trên Render dashboard
4. Clear cache: `npx expo start --clear`

## ✨ Version History

- **v1.0.0** - Initial release với 10 screens cơ bản
- **v1.1.0** - Thêm News và Account management (4 screens)
- **v1.2.0** - Thêm Journal Entry, Production Tech, Notifications, Settings (4 screens)

**Current Version:** v1.2.0
**Total Screens:** 18
**Backend:** https://ebookfarm.onrender.com
**Status:** ✅ Production Ready
