# Sửa lỗi: Địa chỉ và Diện tích không hiển thị trên card

## Vấn đề
Người dùng đã nhập "Địa chỉ" và "Diện tích" trong form nhật ký, nhưng trên trang danh sách (card view) hiển thị "Chưa cập nhật".

## Nguyên nhân
**Mismatch giữa cấu trúc dữ liệu và code hiển thị**

### Cấu trúc dữ liệu thực tế trong database:
```javascript
entries: {
  "Thông tin chung": {
    "dienTich": 1000,
    "diaChiSanXuat": "testtttttt",
    "diaChiCoSo": "test2323232",
    "loSanXuat": "..."
  }
}
```

### Code cũ (SAI):
```javascript
journal.entries?.['Diện tích']  // ❌ Tìm ở top level
journal.entries?.['Địa chỉ']    // ❌ Tìm ở top level
```

### Code mới (ĐÚNG):
```javascript
journal.entries?.['Thông tin chung']?.dienTich           // ✅ Tìm trong table
journal.entries?.['Thông tin chung']?.diaChiSanXuat      // ✅ Tìm trong table
journal.entries?.['Thông tin chung']?.diaChiCoSo         // ✅ Fallback
```

## Giải pháp
Sửa file `frontend/src/pages/Journal/JournalList.jsx` để lấy dữ liệu từ nested structure:

### 1. Diện tích
```javascript
// TRƯỚC
journal.entries?.['Diện tích']

// SAU
journal.entries?.['Thông tin chung']?.dienTich || journal.entries?.['Diện tích']
```

### 2. Địa chỉ
```javascript
// TRƯỚC
journal.entries?.['Địa chỉ'] || journal.entries?.['Dia chi']

// SAU
journal.entries?.['Thông tin chung']?.diaChiSanXuat || 
journal.entries?.['Thông tin chung']?.diaChiCoSo || 
journal.entries?.['Địa chỉ'] || 
journal.entries?.['Dia chi']
```

### 3. Lô sản xuất
```javascript
// TRƯỚC
journal.entries?.['Lô sản xuất'] || journal.entries?.['Lo san xuat']

// SAU
journal.entries?.['Thông tin chung']?.loSanXuat || 
journal.entries?.['Lô sản xuất'] || 
journal.entries?.['Lo san xuat']
```

## Lý do có nhiều fallbacks
1. **Nested structure** (`['Thông tin chung']?.dienTich`) - Cấu trúc mới, đúng theo schema
2. **Flat structure** (`['Diện tích']`) - Cấu trúc cũ, để tương thích với dữ liệu cũ
3. **Multiple field names** - Các schema khác nhau có thể dùng tên field khác nhau:
   - `diaChiSanXuat` - Địa chỉ sản xuất
   - `diaChiCoSo` - Địa chỉ cơ sở
   - `loSanXuat` - Lô sản xuất

## Kết quả
Sau khi sửa, card sẽ hiển thị:
- ✅ **Diện tích**: 1000 (thay vì "Chưa cập nhật")
- ✅ **Địa chỉ**: testtttttt (thay vì "Chưa cập nhật")
- ✅ **Lô sản xuất**: Giá trị thực tế (nếu có)

## Cách test
1. Refresh trang danh sách nhật ký (Ctrl + Shift + R)
2. Xem card view
3. Kiểm tra các trường:
   - Diện tích phải hiển thị số (ví dụ: 1000)
   - Địa chỉ phải hiển thị text đã nhập
   - Lô sản xuất phải hiển thị text đã nhập (nếu có)

## Files đã sửa
- `frontend/src/pages/Journal/JournalList.jsx` - Sửa logic lấy dữ liệu cho card display

## Lưu ý
Vấn đề này chỉ ảnh hưởng đến **hiển thị trên card**, không ảnh hưởng đến:
- ✅ Dữ liệu trong database (vẫn lưu đúng)
- ✅ Hiển thị trong form edit (vẫn load đúng)
- ✅ Table view (nếu có)
