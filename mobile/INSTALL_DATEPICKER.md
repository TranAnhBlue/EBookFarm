# Cài đặt Date Picker cho Mobile App

## Bước 1: Cài đặt thư viện

Chạy lệnh sau trong folder `mobile`:

```bash
npx expo install @react-native-community/datetimepicker
```

## Bước 2: Code đã được cập nhật

File `mobile/src/screens/JournalEntryScreen.js` đã được cập nhật để sử dụng date picker.

## Bước 3: Restart app

```bash
npx expo start --clear
```

## Cách sử dụng:

Khi có field type `date`, app sẽ hiển thị:
- Nút "Chọn ngày" với icon calendar
- Click vào sẽ mở date picker native
- Chọn ngày → Hiển thị format DD/MM/YYYY
- Có thể clear date bằng nút X

## Tính năng:

✅ Native date picker (iOS/Android)
✅ Format ngày Việt Nam (DD/MM/YYYY)
✅ Icon calendar rõ ràng
✅ Có thể clear date
✅ Placeholder hướng dẫn
