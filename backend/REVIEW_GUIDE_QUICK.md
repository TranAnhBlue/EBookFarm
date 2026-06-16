# HƯỚNG DẪN REVIEW NHANH - 127 ITEMS

## 📊 Tổng quan
Sau khi chạy script tự động, còn **127 items** cần review thủ công.

## 🎯 Các patterns còn lỗi phổ biến

### 1. Patterns đơn giản (sửa nhanh)

| Lỗi | Đúng | Ví dụ |
|-----|------|-------|
| `Bòn` | `Bản` | "Bòn tin" → "Bản tin", "Bòn hạng" → "Bản hạng" |
| `B òt` | `Bát` | "x� Bòt Tràng" → "xã Bát Tràng" |
| `Bòi` | `Bãi` | "Ông Dừ Bòi" → "Ông Dừ Bãi" |
| `thảnh hưởng ph�` | `thành phố` | "thảnh hưởng ph� Hà Nội" → "thành phố Hà Nội" |
| `sảng` | `sông` | "ven sảng" → "ven sông" |
| `x�` | `xã` | "x� Bát Tràng" → "xã Bát Tràng" |
| `�ng` | `Ông` hoặc `ông` | "�ng Dừ" → "Ông Dừ", "�ng ngoài" → "ông ngoài" |
| `ph�` | `phố` | "thành ph�" → "thành phố" |
| `h�a` | `hóa` | "hạng h�a" → "hạng hóa" |
| `ri�ng` | `riêng` | "sầu ri�ng" → "sầu riêng" |
| `Qu�c` | `Quốc` | "Trung Qu�c" → "Trung Quốc" |
| `Nguy�n` | `Nguyễn` | "HTX Nguy�n Quang Huy" → "HTX Nguyễn Quang Huy" |
| `m�:i` | `mới` | "sổ mới" → "sổ mới" |
| `sổ"` | `sổ` | "sổ" nhật ký" → "sổ nhật ký" |
| `soít` | `soát` | "kiểm soít" → "kiểm soát" |
| `mảnh hưởng` | `mạnh` | "uy mảnh hưởng" → "uy mạnh" |
| `n�ng` | `nông` | "n�ng sản" → "nông sản" |

### 2. Địa chỉ đầy đủ (copy-paste)

**Pattern thường gặp:**
```
Lỗi: Thôn Ông Dừ Hạ, x� Bòt Tràng, thảnh hưởng ph� Hà Nội
Đúng: Thôn Ông Dừ Hạ, xã Bát Tràng, thành phố Hà Nội
```

```
Lỗi: Thôn 1, x� �ng Bòi ven sảng, x� Bòt Tràng, thảnh hưởng ph� Hà Nội
Đúng: Thôn 1, xã Ông Bãi ven sông, xã Bát Tràng, thành phố Hà Nội
```

```
Lỗi: X� �ng ngoài Bòi, Ông Dừ Hạ, x� Bòt Tràng, thảnh hưởng ph� Hà Nội
Đúng: Xã Ông ngoài Bãi, Ông Dừ Hạ, xã Bát Tràng, thành phố Hà Nội
```

### 3. Tên tin tức

```
Lỗi: Bòn tin thị trường: Giá cà phê và sầu ri�ng ít ảnh hưởng trong tuần qua
Đúng: Bản tin thị trường: Giá cà phê và sầu riêng ít ảnh hưởng trong tuần qua
```

```
Lỗi: Hợp tác xã Krông Păk uy mảnh hưởng xuất khẩu sầu ri�ng sang thị trường Trung Qu�c
Đúng: Hợp tác xã Krông Păk uy mạnh xuất khẩu sầu riêng sang thị trường Trung Quốc
```

```
Lỗi: Nâng cao giá trị n�ng sản qua tem truy xuất nguồn gốc QR Code
Đúng: Nâng cao giá trị nông sản qua tem truy xuất nguồn gốc QR Code
```

### 4. Notifications

```
Lỗi: Sổ" nhật ký HTX m�:i
Đúng: Sổ nhật ký HTX mới
```

```
Lỗi: HTX Nguy�n Quang Huy vừa tạo sổ" kế hoạch m�:i: Bo mua he
Đúng: HTX Nguyễn Quang Huy vừa tạo sổ kế hoạch mới: Bò mua hè
```

### 5. HTX Management Records

```
Lỗi: Bòn hạng h�a
T�o t� �i soít phân phối: 6a1e413994c16bba4198b47d
Đúng: Bản hạng hóa
Tạo tờ trình kiểm soát phân phối: 6a1e413994c16bba4198b47d
```

## 🚀 Workflow Review Nhanh

### Bước 1: Mở file CSV
```bash
# File nằm tại: backend/step3-review-list.csv
# Mở bằng Excel hoặc Google Sheets
```

### Bước 2: Tìm-Thay hàng loạt trong Excel

Sử dụng Find & Replace (Ctrl+H) để sửa nhanh:

1. `Bòn` → `Bản`
2. `Bòt` → `Bát`
3. `Bòi` → `Bãi`
4. `thảnh hưởng ph�` → `thành phố`
5. `sảng` → `sông`
6. `x�` → `xã`
7. `ph�` → `phố`
8. `h�a` → `hóa`
9. `ri�ng` → `riêng`
10. `Qu�c` → `Quốc`
11. `Nguy�n` → `Nguyễn`
12. `m�:i` → `mới`
13. `sổ"` → `sổ`
14. `soít` → `soát`
15. `mảnh hưởng` → `mạnh`
16. `n�ng` → `nông`
17. `T�o t�` → `Tạo tờ`
18. `�i` → `trình`
19. `�ng` → `Ông` (hoặc `ông` nếu đứng giữa câu)

### Bước 3: Review từng dòng

- Xem cột "Current Value"
- Copy và paste vào cột "Your Fix"
- Sửa theo bảng trên
- Đổi "Status" thành "APPROVED"

### Bước 4: Lưu file
- File → Save
- Giữ nguyên tên `step3-review-list.csv`
- Format: CSV UTF-8

### Bước 5: Chạy script apply
```bash
cd backend
node step4-apply-reviewed-fixes.js
```

## 📝 Mẫu review (3 dòng đầu tiên)

### Dòng 1
```
Collection: users
ID: 6a1957245045e4a3a18ed00c
Field: address
Current Value: Thôn Ông Dừ Hạ, x� Bòt Tràng, thảnh hưởng ph� Hà Nội
Your Fix: Thôn Ông Dừ Hạ, xã Bát Tràng, thành phố Hà Nội
Status: APPROVED
```

### Dòng 2
```
Collection: users
ID: 6a1957245045e4a3a18ed011
Field: address
Current Value: X� �ng ngoài Bòi, Ông Dừ Hạ, x� Bòt Tràng, thảnh hưởng ph� Hà Nội
Your Fix: Xã Ông ngoài Bãi, Ông Dừ Hạ, xã Bát Tràng, thành phố Hà Nội
Status: APPROVED
```

### Dòng 3
```
Collection: users
ID: 6a195dc0275b92db49dac5c3
Field: address
Current Value: Thôn 1, x� �ng Bòi ven sảng, x� Bòt Tràng, thảnh hưởng ph� Hà Nội
Your Fix: Thôn 1, xã Ông Bãi ven sông, xã Bát Tràng, thành phố Hà Nội
Status: APPROVED
```

## ⏱️ Thời gian ước tính

- **Tìm-Thay hàng loạt:** 10 phút (19 patterns)
- **Review các dòng còn lại:** 30-60 phút
- **TỔNG:** 40-70 phút

## ✅ Sau khi hoàn tất

```bash
cd backend
node step4-apply-reviewed-fixes.js
```

Kết quả mong đợi:
```
🎉 HOÀN HẢO! KHÔNG CÒN LỖI ENCODING!
✅ Tất cả 136 documents đã được sửa thành công!
```

## 🆘 Nếu gặp khó khăn

- **Không chắc một pattern?** → Để trống "Your Fix" và Status = "SKIP"
- **Quá nhiều để review?** → Sửa những gì chắc chắn, để lại những gì không chắc
- **Muốn sửa thủ công sau?** → OK, có thể sửa qua UI sau

---

**💡 Tip:** Sử dụng tính năng Find & Replace trong Excel sẽ tiết kiệm rất nhiều thời gian!
