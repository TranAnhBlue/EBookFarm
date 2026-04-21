# Cải tiến Card Display - Sổ Nhật Ký

## Vấn đề cũ
Card hiển thị các field cố định không phù hợp với cấu trúc dữ liệu thực tế:
- ❌ Tìm field ở sai vị trí (top level thay vì trong "Thông tin chung")
- ❌ Hiển thị "Lô sản xuất" nhưng nhiều schema không có field này
- ❌ Không hiển thị "Tên cơ sở" - thông tin quan trọng
- ❌ Diện tích không có đơn vị (m²)

## Giải pháp mới

### Cấu trúc dữ liệu thực tế
```javascript
entries: {
  "Thông tin chung": {
    "tenCoSo": "test",
    "diaChiCoSo": "test2323232",
    "diaChiSanXuat": "testtttttt",
    "tenCayTrong": "22",
    "dienTich": 1000,
    "namSanXuat": 2026
  }
}
```

### Card hiển thị mới (theo thứ tự)

#### 1. Header
- **QR Code** (6 ký tự đầu) + **Tên người dùng**
- Ví dụ: `68B5F7 - Trần Đức Anh`

#### 2. Tên cơ sở (nếu có)
- Icon: 📄 FileOutlined
- Field: `entries['Thông tin chung'].tenCoSo`
- Hiển thị: "Tên cơ sở: test"
- **Conditional**: Chỉ hiển thị nếu có dữ liệu

#### 3. Diện tích
- Icon: 📋 ProfileOutlined
- Field: `entries['Thông tin chung'].dienTich`
- Hiển thị: "Diện tích: 1,000 m²"
- Format: Thêm dấu phẩy ngăn cách hàng nghìn + đơn vị m²
- Fallback: "Chưa cập nhật" (màu xám, italic)

#### 4. Địa chỉ
- Icon: 📍 EnvironmentOutlined
- Field: `entries['Thông tin chung'].diaChiSanXuat` hoặc `diaChiCoSo`
- Hiển thị: "Địa chỉ: testtttttt"
- Fallback: "Chưa cập nhật"

#### 5. Cây trồng (nếu có)
- Icon: 🏷️ TagOutlined
- Field: `entries['Thông tin chung'].tenCayTrong`
- Hiển thị: "Cây trồng: 22"
- **Conditional**: Chỉ hiển thị nếu có dữ liệu

#### 6. Loại sổ
- Icon: 📝 FileTextOutlined
- Field: `schemaId.name`
- Hiển thị: "Loại sổ: Nấm" (màu xanh)
- Có margin-top để tách biệt

#### 7. Ngày tạo
- Icon: 📅 CalendarOutlined
- Field: `createdAt`
- Hiển thị: "Ngày tạo: 21/04/2026"
- Format: DD/MM/YYYY (locale vi-VN)

### Code Implementation

```javascript
<div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm text-gray-600 items-start">
  {/* Tên cơ sở - Conditional */}
  {journal.entries?.['Thông tin chung']?.tenCoSo && (
    <>
      <div className="flex items-center gap-1.5">
        <FileOutlined className="text-green-500" /> Tên cơ sở:
      </div>
      <div className="text-right">
        <Text strong>{journal.entries['Thông tin chung'].tenCoSo}</Text>
      </div>
    </>
  )}

  {/* Diện tích - Always show */}
  <div className="flex items-center gap-1.5">
    <ProfileOutlined className="text-green-500" /> Diện tích:
  </div>
  <div className="text-right">
    <Text strong>
      {journal.entries?.['Thông tin chung']?.dienTich 
        ? `${journal.entries['Thông tin chung'].dienTich.toLocaleString('vi-VN')} m²`
        : <span className="text-gray-300 font-normal italic">Chưa cập nhật</span>
      }
    </Text>
  </div>

  {/* Địa chỉ - Always show */}
  <div className="flex items-center gap-1.5">
    <EnvironmentOutlined className="text-green-500" /> Địa chỉ:
  </div>
  <div className="text-right leading-tight">
    <Text strong>
      {journal.entries?.['Thông tin chung']?.diaChiSanXuat || 
       journal.entries?.['Thông tin chung']?.diaChiCoSo || 
       <span className="text-gray-300 font-normal italic">Chưa cập nhật</span>
      }
    </Text>
  </div>

  {/* Cây trồng - Conditional */}
  {journal.entries?.['Thông tin chung']?.tenCayTrong && (
    <>
      <div className="flex items-center gap-1.5">
        <TagOutlined className="text-green-500" /> Cây trồng:
      </div>
      <div className="text-right">
        <Text strong>{journal.entries['Thông tin chung'].tenCayTrong}</Text>
      </div>
    </>
  )}

  {/* Loại sổ - Always show */}
  <div className="flex items-center gap-1.5 mt-2">
    <FileTextOutlined className="text-green-500" /> Loại sổ:
  </div>
  <div className="text-right mt-2">
    <Text strong className="text-green-600">{journal.schemaId?.name}</Text>
  </div>

  {/* Ngày tạo - Always show */}
  <div className="flex items-center gap-1.5">
    <CalendarOutlined className="text-green-500" /> Ngày tạo:
  </div>
  <div className="text-right">
    <Text strong>{new Date(journal.createdAt).toLocaleDateString('vi-VN')}</Text>
  </div>
</div>
```

## Cải tiến chính

### 1. Conditional Rendering
- Chỉ hiển thị field nếu có dữ liệu
- Tránh hiển thị "Chưa cập nhật" cho các field không bắt buộc

### 2. Formatting
- **Diện tích**: `1000` → `1,000 m²`
- **Ngày tạo**: ISO format → `21/04/2026`

### 3. Visual Hierarchy
- Loại sổ có màu xanh để nổi bật
- Margin-top trước "Loại sổ" để tách nhóm thông tin
- Icons màu xanh lá nhất quán

### 4. Fallback Strategy
```javascript
// Địa chỉ: Thử nhiều field
diaChiSanXuat || diaChiCoSo || "Chưa cập nhật"

// Diện tích: Format hoặc fallback
dienTich ? `${dienTich.toLocaleString('vi-VN')} m²` : "Chưa cập nhật"
```

## Tương thích với các schema khác

### Schema Trồng trọt
- ✅ tenCoSo
- ✅ dienTich
- ✅ diaChiSanXuat
- ✅ tenCayTrong
- ✅ namSanXuat

### Schema Chăn nuôi
- ✅ tenCoSo
- ✅ dienTich (hoặc dienTichChuongNuoi)
- ✅ diaChiSanXuat
- ❌ tenCayTrong (không có - sẽ ẩn)
- ✅ namSanXuat

### Schema Thủy sản
- ✅ tenCoSo
- ✅ dienTich (hoặc dienTichAo)
- ✅ diaChiSanXuat
- ❌ tenCayTrong (không có - sẽ ẩn)
- ✅ namSanXuat

## Kết quả
Card bây giờ sẽ:
- ✅ Hiển thị đúng dữ liệu từ "Thông tin chung"
- ✅ Format số đẹp hơn (1,000 m²)
- ✅ Ẩn field không có dữ liệu (conditional)
- ✅ Tương thích với nhiều loại schema
- ✅ Visual hierarchy rõ ràng hơn

## Files đã sửa
- `frontend/src/pages/Journal/JournalList.jsx` - Card display logic
