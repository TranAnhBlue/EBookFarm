# ✅ HOÀN THÀNH: Hệ thống Lịch sử Chỉnh sửa Nhật ký

## 🎯 Tổng quan

Đã triển khai đầy đủ hệ thống lưu lịch sử chỉnh sửa nhật ký với:
- ✅ Lưu mọi thay đổi
- ✅ Phân quyền theo trạng thái
- ✅ API xem lịch sử
- ✅ So sánh phiên bản

## 📁 Files đã tạo/cập nhật

### Backend - Models
1. **backend/src/models/JournalHistory.js** (MỚI)
   - Model lưu lịch sử chỉnh sửa
   - Fields: journalId, userId, action, changes, reason, metadata
   - Methods: getFormattedChanges()

2. **backend/src/models/FarmJournal.js** (CẬP NHẬT)
   - Thêm trạng thái: Draft, Submitted, Verified, Locked, Archived
   - Thêm fields: submittedAt, verifiedAt, verifiedBy, lockedAt
   - Thêm fields: editCount, lastEditedAt, lastEditedBy

### Backend - Middlewares
3. **backend/src/middlewares/journalHistoryMiddleware.js** (MỚI)
   - `trackJournalChanges()` - Lưu lịch sử khi update
   - `trackJournalCreation()` - Lưu lịch sử khi tạo mới
   - `checkEditPermission()` - Kiểm tra quyền chỉnh sửa
   - `checkPermission()` - Logic phân quyền
   - `getPermissionMessage()` - Thông báo quyền

### Backend - Controllers
4. **backend/src/controllers/journalHistoryController.js** (MỚI)
   - `getJournalHistory()` - Lấy lịch sử với pagination
   - `getHistorySummary()` - Tóm tắt lịch sử
   - `compareVersions()` - So sánh 2 phiên bản

### Backend - Routes
5. **backend/src/routes/journalHistoryRoutes.js** (MỚI)
   - GET `/api/journals/:id/history` - Lấy lịch sử
   - GET `/api/journals/:id/history/summary` - Tóm tắt
   - GET `/api/journals/:id/history/compare` - So sánh

6. **backend/src/routes/journalRoutes.js** (CẬP NHẬT)
   - Thêm middleware tracking vào POST và PUT

7. **backend/src/server.js** (CẬP NHẬT)
   - Include journalHistoryRoutes

## 🔄 Quy trình hoạt động

### 1. Tạo nhật ký mới
```
User → POST /api/journals
  ↓
trackJournalCreation middleware
  ↓
createJournal controller
  ↓
Response với journal._id
  ↓
Middleware lưu history (action: 'create')
```

### 2. Cập nhật nhật ký
```
User → PUT /api/journals/:id
  ↓
checkEditPermission middleware
  ├─ Kiểm tra status
  ├─ Kiểm tra role
  └─ Yêu cầu reason nếu cần
  ↓
trackJournalChanges middleware
  ├─ Lấy journal gốc
  ├─ So sánh changes
  └─ Lưu history
  ↓
updateJournal controller
  ├─ Cập nhật journal
  └─ Tăng editCount
```

### 3. Xem lịch sử
```
User → GET /api/journals/:id/history
  ↓
Kiểm tra quyền (owner/admin/tech)
  ↓
Lấy history từ DB
  ↓
Format và trả về
```

## 📊 Cấu trúc dữ liệu

### JournalHistory Document
```javascript
{
  _id: ObjectId,
  journalId: ObjectId,
  userId: ObjectId,
  action: 'create' | 'update' | 'status_change',
  changes: [
    {
      table: 'Thông tin chung',
      field: 'soLuongCon',
      fieldLabel: 'Số lượng con',
      oldValue: 500,
      newValue: 520
    }
  ],
  reason: 'Nhập thiếu 20 con',
  metadata: {
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome/120.0',
    previousStatus: 'Draft',
    newStatus: 'Submitted'
  },
  createdAt: Date,
  updatedAt: Date
}
```

### FarmJournal (Updated)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  schemaId: ObjectId,
  qrCode: String,
  entries: Mixed,
  status: 'Draft' | 'Submitted' | 'Verified' | 'Locked' | 'Archived',
  submittedAt: Date,
  verifiedAt: Date,
  verifiedBy: ObjectId,
  lockedAt: Date,
  editCount: Number,
  lastEditedAt: Date,
  lastEditedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Phân quyền

### Quyền chỉnh sửa theo trạng thái:

| Trạng thái | Farmer (Owner) | Technician | Admin |
|------------|----------------|------------|-------|
| Draft | ✅ Tự do | ✅ Tự do | ✅ Tự do |
| Submitted | ✅ Cần lý do | ✅ Cần lý do | ✅ Cần lý do |
| Verified | ❌ Không | ✅ Cần lý do | ✅ Cần lý do |
| Locked | ❌ Không | ❌ Không | ✅ Cần lý do |
| Archived | ❌ Không | ❌ Không | ❌ Không |

### Quyền xem lịch sử:

- ✅ Owner (người tạo nhật ký)
- ✅ Technician (kỹ thuật viên)
- ✅ Admin (quản trị viên)

## 🎨 API Endpoints

### 1. Lấy lịch sử nhật ký
```http
GET /api/journals/:id/history?page=1&limit=20
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "history": [
      {
        "_id": "...",
        "action": "update",
        "actionLabel": "Cập nhật",
        "user": {
          "id": "...",
          "name": "Trần Văn Cường",
          "email": "cuong@example.com"
        },
        "changes": [
          {
            "table": "Thông tin chung",
            "field": "Số lượng con",
            "oldValue": "500",
            "newValue": "520"
          }
        ],
        "reason": "Nhập thiếu 20 con",
        "timestamp": "2025-02-20T10:30:00Z",
        "metadata": {
          "ipAddress": "192.168.1.100",
          "userAgent": "Chrome/120.0"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    },
    "journal": {
      "id": "...",
      "qrCode": "...",
      "status": "Submitted",
      "editCount": 5,
      "lastEditedAt": "2025-02-20T10:30:00Z"
    }
  }
}
```

### 2. Lấy tóm tắt lịch sử
```http
GET /api/journals/:id/history/summary
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalEdits": 5,
    "statusChanges": 2,
    "uniqueEditors": 2,
    "lastEdit": {
      "user": "Trần Văn Cường",
      "timestamp": "2025-02-20T10:30:00Z",
      "action": "Cập nhật"
    },
    "journal": {
      "status": "Submitted",
      "createdAt": "2025-02-17T09:00:00Z",
      "editCount": 5
    }
  }
}
```

### 3. So sánh phiên bản
```http
GET /api/journals/:id/history/compare?from=2025-02-17&to=2025-02-20
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-02-17T00:00:00Z",
      "to": "2025-02-20T23:59:59Z"
    },
    "totalChanges": 5,
    "changes": [
      {
        "table": "Thông tin chung",
        "field": "Số lượng con",
        "firstValue": 500,
        "lastValue": 520,
        "changeCount": 2,
        "editors": ["Trần Văn Cường", "Admin"]
      }
    ]
  }
}
```

### 4. Cập nhật nhật ký (với lịch sử)
```http
PUT /api/journals/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "entries": {
    "Thông tin chung": {
      "soLuongCon": 520
    }
  },
  "reason": "Nhập thiếu 20 con"
}

Response:
{
  "success": true,
  "message": "Cập nhật nhật ký thành công",
  "data": {
    "_id": "...",
    "editCount": 6,
    "lastEditedAt": "2025-02-20T10:30:00Z"
  }
}
```

## 🧪 Test Cases

### Test 1: Tạo nhật ký mới
```bash
# Tạo nhật ký
POST /api/journals
Body: { schemaId, entries }

# Kiểm tra history
GET /api/journals/:id/history

# Expect: 1 record với action='create'
```

### Test 2: Cập nhật Draft
```bash
# Update nhật ký Draft
PUT /api/journals/:id
Body: { entries: {...} }

# Kiểm tra history
GET /api/journals/:id/history

# Expect: 2 records (create + update)
```

### Test 3: Cập nhật Submitted (cần lý do)
```bash
# Update không có reason
PUT /api/journals/:id
Body: { entries: {...} }

# Expect: 400 - Yêu cầu nhập lý do

# Update có reason
PUT /api/journals/:id
Body: { entries: {...}, reason: "Sửa lỗi" }

# Expect: 200 - Success
```

### Test 4: Quyền chỉnh sửa
```bash
# Farmer update Verified journal
PUT /api/journals/:id (status=Verified, owner=farmer)

# Expect: 403 - Không có quyền

# Technician update Verified journal
PUT /api/journals/:id (status=Verified, role=Technician)

# Expect: 200 - Success (nếu có reason)
```

### Test 5: Xem lịch sử
```bash
# Owner xem lịch sử
GET /api/journals/:id/history

# Expect: 200 - Danh sách lịch sử

# User khác xem lịch sử
GET /api/journals/:id/history (not owner)

# Expect: 403 - Không có quyền
```

## 📝 Migration Script

Để cập nhật các nhật ký cũ:

```javascript
// backend/migrate-journal-status.js
const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
require('dotenv').config();

async function migrateJournals() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Update old journals
  await FarmJournal.updateMany(
    { status: 'Completed' },
    { 
      $set: { 
        status: 'Submitted',
        editCount: 0
      } 
    }
  );
  
  console.log('✅ Migration completed');
  process.exit(0);
}

migrateJournals();
```

## 🚀 Triển khai

### Bước 1: Chạy migration (nếu có dữ liệu cũ)
```bash
cd backend
node migrate-journal-status.js
```

### Bước 2: Khởi động server
```bash
npm run dev
```

### Bước 3: Test API
```bash
# Test tạo nhật ký
curl -X POST http://localhost:5000/api/journals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"schemaId":"...","entries":{...}}'

# Test xem lịch sử
curl http://localhost:5000/api/journals/JOURNAL_ID/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Monitoring

### Logs cần theo dõi:
```
📝 Saved history for journal {id}: {count} changes
📝 Saved creation history for journal {id}
```

### Metrics cần track:
- Số lần chỉnh sửa trung bình/nhật ký
- Nhật ký có > 5 lần sửa (cần kiểm tra)
- Thời gian từ Draft → Submitted
- Thời gian từ Submitted → Verified

## ⚠️ Lưu ý

1. **Performance**: History có thể lớn, cần index tốt
2. **Storage**: Cân nhắc archive history cũ (> 1 năm)
3. **Privacy**: Không lưu thông tin nhạy cảm trong metadata
4. **Backup**: History rất quan trọng, cần backup riêng

## 🎯 Next Steps

### Frontend (Cần làm tiếp):
- [ ] UI hiển thị lịch sử
- [ ] Modal xác nhận khi sửa Submitted/Verified
- [ ] Badge hiển thị số lần sửa
- [ ] Timeline view cho lịch sử
- [ ] Compare view cho 2 phiên bản

### Backend (Có thể thêm):
- [ ] API restore từ history
- [ ] API export history to PDF
- [ ] Webhook khi có thay đổi
- [ ] Email notification

---

**Status**: ✅ BACKEND COMPLETED  
**Next**: Frontend Implementation  
**Date**: 21/04/2026
