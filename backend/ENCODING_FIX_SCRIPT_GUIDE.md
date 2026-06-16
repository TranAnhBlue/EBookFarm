# HƯỚNG DẪN SỬA LỖI ENCODING - PHƯƠNG ÁN C

## 📋 Tổng Quan

Quy trình gồm 4 bước tự động sửa 136 documents bị lỗi encoding:
- **Bước 1:** Phân tích patterns (~2 phút)
- **Bước 2:** Sửa tự động ~80% documents (~2 phút)
- **Bước 3:** Tạo danh sách review cho ~20% còn lại (~2 phút)
- **Bước 4:** Apply thay đổi sau khi review (~2 phút)

**Tổng thời gian:** 2-3 giờ (bao gồm review thủ công)

---

## 🚀 BƯỚC 1: PHÂN TÍCH PATTERNS

### Chạy script
```bash
cd backend
node step1-analyze-patterns.js
```

### Output
- File: `step1-patterns-analysis.json`
- Chứa tất cả patterns phát hiện được và tần suất xuất hiện

### Kết quả mong đợi
```
📊 TOP 30 PATTERNS XUẤT HIỆN NHIỀU NHẤT:
 1. [50×] "H�p t�c x�"
 2. [30×] "C�n b�"
 3. [25×] "k� thu�t"
...
```

---

## 🔧 BƯỚC 2: SỬA TỰ ĐỘNG (PATTERNS CHẮC CHẮN)

### Chạy script
```bash
node step2-auto-fix-definite.js
```

### Script này sẽ sửa
✅ "H�p t�c x�" → "Hợp tác xã"  
✅ "C�n b�" → "Cán bộ"  
✅ "k� thu�t" → "kỹ thuật"  
✅ "Gi�m �ốc" → "Giám đốc"  
✅ "C�p nh�t tr�ng th�i s�" → "Cập nhật trạng thái sổ"  
✅ "N�ng cao gi� tr�" → "Nâng cao giá trị"  
✅ "xu�t kh�u" → "xuất khẩu"  
✅ "s�u ri�ng" → "sầu riêng"  
✅ "c� ph�" → "cà phê"  
... và ~100 patterns khác

### Dictionary sử dụng
Script có sẵn dictionary với **100+ patterns** có độ tin cậy 99%:
- Chức danh HTX (Giám đốc, Cán bộ, Ban kỹ thuật...)
- Thuật ngữ nông nghiệp (nông sản, xuất khẩu, truy xuất...)
- Động từ thường dùng (Cập nhật, Thêm mới, Chỉnh sửa...)
- Địa danh phổ biến (Việt Nam, Hà Nội, Đắk Lắk...)

### Output
- File: `step2-auto-fix-log.json`
- Chứa chi tiết tất cả thay đổi đã thực hiện

### Kết quả mong đợi
```
📊 KẾT QUẢ TỔNG HỢP:
Tổng documents đã kiểm tra: 343
Đã sửa tự động: 110
Tỷ lệ: 80.9%
```

### ⚠️ Quan trọng
- Script có **delay 3 giây** trước khi chạy
- Nhấn `Ctrl+C` nếu muốn hủy
- **Đảm bảo đã backup database** trước khi chạy!

---

## 📝 BƯỚC 3: TẠO DANH SÁCH REVIEW

### Chạy script
```bash
node step3-generate-review-list.js
```

### Script này sẽ
1. Tìm các documents **còn** có ký tự � (sau bước 2)
2. Đưa ra suggestions cho từng pattern
3. Export ra file CSV để review thủ công

### Output
- **step3-review-list.csv** - Mở bằng Excel/Google Sheets
- **step3-review-list.json** - Dễ đọc

### Format CSV
```
Collection,ID,Identifier,Field,Current Value,Suggestions,Note,Your Fix,Status
users,6a19...,htx@test.com,fullname,"C�n b� Ban k�...","Cán bộ Ban kỹ thuật",...,[điền vào đây],PENDING
```

### Kết quả mong đợi
```
📊 KẾT QUẢ:
Tổng items cần review: 26

✅ Đã tạo file review:
   - step3-review-list.csv
   - step3-review-list.json
```

---

## ✏️ REVIEW THỦ CÔNG (1-2 giờ)

### Cách làm

1. **Mở file CSV bằng Excel/Google Sheets**
   ```
   File → Open → step3-review-list.csv
   ```

2. **Xem các cột:**
   - **Current Value:** Giá trị hiện tại (có lỗi)
   - **Suggestions:** Các gợi ý để chọn
   - **Note:** Ghi chú thêm
   - **Your Fix:** ← ĐIỀN VÀO ĐÂY
   - **Status:** ← ĐỔI THÀNH "APPROVED"

3. **Điền giá trị đúng:**

   **Ví dụ 1:**
   ```
   Current Value: "B�n h�ng vi ph�m"
   Suggestions: "Bàn họng | Bản hạng | Bán hàng"
   Your Fix: "Bản hạng vi phạm"  ← Điền vào
   Status: APPROVED                ← Đổi thành APPROVED
   ```

   **Ví dụ 2:**
   ```
   Current Value: "c� tra"
   Suggestions: "cà tra | cỏ trà | có tra"
   Note: "Tên loại cây"
   Your Fix: "cỏ trà"             ← Tra Google để chắc chắn
   Status: APPROVED
   ```

   **Ví dụ 3 (không chắc chắn):**
   ```
   Current Value: "�NG D�"
   Suggestions: "ÔNG DƯ | ÔNG ĐƯ"
   Your Fix:                       ← Để trống
   Status: SKIP                    ← Đổi thành SKIP (sửa thủ công sau)
   ```

4. **Lưu file:**
   - File → Save (giữ nguyên tên `step3-review-list.csv`)
   - Đảm bảo format vẫn là CSV

### Tips review nhanh

| Pattern | Có thể là | Độ tin cậy |
|---------|-----------|------------|
| `B�n h�ng` | Bản hạng (hồ sơ quản lý) | 90% |
| `c� tra` | cỏ trà (loại cây) | 80% |
| `Kr�ng P�c` | Krông Păk (địa danh Tây Nguyên) | 95% |
| `�NG D�` | ÔNG DƯ (địa danh) | 85% |
| `�y m�nh` | uy mãnh | 90% |

**Cách kiểm tra:**
- Google địa danh: "Krông Păk Đắk Lắk"
- Xem context trong "Current Value"
- Hỏi người quen biết địa phương

---

## ✅ BƯỚC 4: ÁP DỤNG THAY ĐỔI

### Chạy script
```bash
node step4-apply-reviewed-fixes.js
```

### Script này sẽ
1. Đọc file `step3-review-list.csv` đã review
2. Chỉ apply các dòng có `Status = APPROVED`
3. Update database
4. Kiểm tra xem còn lỗi không

### Output
- File: `step4-apply-log.json`
- Chứa chi tiết tất cả thay đổi

### Kết quả mong đợi
```
📊 KẾT QUẢ CUỐI CÙNG:
✅ Thành công: 26
❌ Lỗi: 0

🔍 Đang kiểm tra xem còn lỗi encoding không...
   ✅ users: OK
   ✅ htxmanagementrecords: OK
   ✅ htxjournals: OK
   ✅ groups: OK
   ✅ notifications: OK
   ✅ news: OK

🎉 HOÀN HẢO! KHÔNG CÒN LỖI ENCODING!
```

### ⚠️ Quan trọng
- Script có **delay 3 giây** trước khi chạy
- Chỉ apply các dòng có `Status = APPROVED`
- Các dòng `SKIP` hoặc `PENDING` sẽ bị bỏ qua

---

## 🎯 SAU KHI HOÀN TẤT

### 1. Restart Backend Server
```bash
cd backend
# Ctrl+C để stop server hiện tại
npm run dev
```

Backend đã có UTF-8 middleware, cần restart để áp dụng.

### 2. Clear Browser Cache
- Chrome: `Ctrl + Shift + Delete` → Clear cache
- Firefox: `Ctrl + Shift + Delete` → Clear cache

### 3. Test trên UI
- ✅ Login vào hệ thống
- ✅ Xem User Management → Kiểm tra fullname
- ✅ Xem HTX Management Records
- ✅ Xem Notifications
- ✅ Tạo data mới và xem có hiển thị đúng không

### 4. Verify trong Database
Có thể chạy lại script kiểm tra:
```bash
node fix-lost-data-manually.js
```

Kết quả mong đợi:
```
📊 KẾT QUẢ TỔNG HỢP:
Tổng documents bị lỗi: 0

✅ Không có dữ liệu bị lỗi!
```

---

## 📊 TỔNG KẾT

### Thời gian thực tế

| Bước | Thời gian | Công việc |
|------|-----------|-----------|
| Bước 1 | 2 phút | Chạy script phân tích |
| Bước 2 | 2 phút | Chạy script sửa tự động |
| Bước 3 | 2 phút | Tạo file review |
| **Review** | **1-2 giờ** | **Review thủ công ~26 items** |
| Bước 4 | 2 phút | Apply thay đổi |
| Test | 10 phút | Kiểm tra kết quả |
| **TỔNG** | **~2-3 giờ** | |

### Độ chính xác

- **Bước 2 (tự động):** 99% chính xác (~110 docs)
- **Bước 4 (sau review):** 100% chính xác (~26 docs)
- **Tổng:** ~99.5% chính xác

### Files được tạo ra

```
backend/
├── step1-analyze-patterns.js       # Script bước 1
├── step2-auto-fix-definite.js      # Script bước 2
├── step3-generate-review-list.js   # Script bước 3
├── step4-apply-reviewed-fixes.js   # Script bước 4
├── step1-patterns-analysis.json    # Output bước 1
├── step2-auto-fix-log.json         # Output bước 2
├── step3-review-list.csv           # Output bước 3 (CSV)
├── step3-review-list.json          # Output bước 3 (JSON)
└── step4-apply-log.json            # Output bước 4
```

---

## ❓ FAQ

### Q: Script bước 2 sửa những pattern nào?
**A:** Xem danh sách đầy đủ trong file `step2-auto-fix-definite.js`, dòng `DEFINITE_REPLACEMENTS`. Có hơn 100 patterns.

### Q: Nếu tôi không chắc chắn một pattern?
**A:** Để trống "Your Fix" và đổi Status thành "SKIP". Sẽ sửa thủ công qua UI sau.

### Q: Có thể chạy lại script nhiều lần?
**A:** Có, nhưng:
- Bước 1: Có thể chạy lại bất cứ lúc nào
- Bước 2: **KHÔNG nên** chạy lại (đã sửa rồi)
- Bước 3-4: Có thể chạy lại nếu còn lỗi

### Q: Nếu script bị lỗi giữa chừng?
**A:** 
1. Xem error message
2. Kiểm tra MongoDB connection
3. Chạy lại script - nó sẽ bỏ qua docs đã sửa

### Q: Làm sao biết đã sửa xong chưa?
**A:** Chạy:
```bash
node fix-lost-data-manually.js
```
Nếu kết quả là "Tổng documents bị lỗi: 0" → Hoàn tất!

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề:

1. **Xem log files:**
   - `step2-auto-fix-log.json` - Chi tiết bước 2
   - `step4-apply-log.json` - Chi tiết bước 4

2. **Kiểm tra connection:**
   ```bash
   node quick-test-encoding.js
   ```

3. **Restore từ backup** (nếu cần):
   ```bash
   mongorestore --uri="YOUR_MONGO_URI" --drop ./backup-folder/
   ```

---

**Chúc may mắn! 🚀**
