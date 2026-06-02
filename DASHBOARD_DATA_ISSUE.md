# 🐛 Dashboard Data Issue - "0 hộ nông dân"

## Vấn đề:
Dashboard/Reports hiển thị **0** cho tất cả các metrics:
- TỔNG NHẬT KÝ: 0
- HOÀN THÀNH: 0
- NÔNG DÂN QUẢN LÝ: 0
- CHỜ PHÊ DUYỆT: 0

## Root Cause:

### 1. API Response (Đã test):
```bash
GET /api/reports/dashboard-stats
Authorization: Bearer <farmer_token>

Response:
{
  "success": true,
  "data": {
    "totalUsers": 0,          ← Vấn đề: Luôn 0 với Farmer
    "totalGroups": 0,
    "totalJournals": 2,       ← Có data!
    "completedJournals": 0,
    "verifiedJournals": 0,
    "pendingApprovalsCount": 1, ← Có data!
    "pendingJournals": 1,
    "inventoryCount": 0
  }
}
```

### 2. Backend Logic (reportController.js):
```javascript
const getDashboardStats = async (req, res) => {
  // ...
  const [totalUsers, ...] = await Promise.all([
    isAdmin ? User.countDocuments() : 
    (isHtx ? User.countDocuments({ role: /^farmer$/i, htxId: ... }) : 
    0),  // ← Farmer role luôn trả về 0
    // ...
  ]);
}
```

**Vấn đề**: Logic backend chỉ đếm `totalUsers` khi:
- **Admin**: Đếm tất cả users
- **HTX**: Đếm farmers thuộc HTX
- **Farmer**: Luôn trả về 0 (không có logic đếm)

### 3. Frontend Display:
- **Mobile (HomeScreen.js)**: Hiển thị đúng vì dùng `normalizedStats` với fallback
- **Web (Reports.jsx)**: Hiển thị 0 vì dùng trực tiếp `stats.totalUsers`

## Giải pháp:

### Option 1: Fix Backend Logic (Recommended)
Thêm logic đếm cho Farmer role:

```javascript
// backend/src/controllers/reportController.js
const getDashboardStats = async (req, res) => {
  // ...
  const [totalUsers, ...] = await Promise.all([
    isAdmin 
      ? User.countDocuments() 
      : isHtx 
        ? User.countDocuments({ role: /^farmer$/i, htxId: getHtxOwnerId(req.user) })
        : 1,  // ← Farmer: Đếm chính mình = 1
    // ...
  ]);
  
  // Hoặc nếu muốn đếm farmers trong cùng group:
  const [totalUsers, ...] = await Promise.all([
    isAdmin 
      ? User.countDocuments() 
      : isHtx 
        ? User.countDocuments({ role: /^farmer$/i, htxId: getHtxOwnerId(req.user) })
        : User.countDocuments({ 
            role: /^farmer$/i, 
            groupId: req.user.groupId 
          }),  // ← Đếm farmers trong cùng group
    // ...
  ]);
}
```

### Option 2: Fix Frontend Display
Thêm fallback trong Reports.jsx:

```javascript
// frontend/src/pages/Admin/Reports.jsx
const displayStats = {
  totalUsers: stats?.totalUsers || (isAdmin || isHtx ? 0 : 1),
  totalJournals: stats?.totalJournals || 0,
  completedJournals: stats?.completedJournals || 0,
  pendingJournals: stats?.pendingJournals || 0,
};
```

### Option 3: Rename Field
Thay đổi label dựa trên role:

```javascript
// Frontend
const userLabel = isAdmin 
  ? 'Tổng người dùng' 
  : isHtx 
    ? 'Nông dân quản lý' 
    : 'Thành viên';  // ← Không hiển thị số lượng với Farmer
```

## Recommendation:

**Chọn Option 1** - Fix backend logic vì:
1. ✅ Nhất quán giữa mobile và web
2. ✅ Data chính xác từ source
3. ✅ Không cần thay đổi nhiều nơi ở frontend

## Test Plan:

### Test Case 1: Admin User
```bash
Login: admin@ebookfarm.com
Expected: totalUsers = tổng số users trong DB
```

### Test Case 2: HTX User
```bash
Login: htx@ebookfarm.com
Expected: totalUsers = số farmers thuộc HTX
```

### Test Case 3: Farmer User
```bash
Login: nongdan@gmail.com
Expected: totalUsers = 1 (hoặc số farmers trong cùng group)
```

## Implementation Steps:

1. **Update Backend**:
   ```bash
   # Edit file
   backend/src/controllers/reportController.js
   
   # Test locally
   npm run dev
   
   # Deploy to Render
   git push origin main
   ```

2. **Test API**:
   ```bash
   node test-dashboard-stats.js
   ```

3. **Verify Frontend**:
   - Login as Farmer
   - Navigate to Reports page
   - Check metrics display correctly

## Files to Edit:

- `backend/src/controllers/reportController.js` (Line 37-40)
- Optional: `frontend/src/pages/Admin/Reports.jsx` (Add fallback)

## Status: 🔴 Not Fixed

**Priority**: High
**Impact**: User Experience - Dashboard shows incorrect data
**Effort**: Low (5-10 minutes)

---

**Created**: 2024
**Last Updated**: 2024
