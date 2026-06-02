# 🔍 HTX Sidebar Analysis

## Tổng quan:

Hệ thống đã có **đầy đủ cấu trúc HTX** với nhiều sub-roles và permissions. Cả frontend và backend đều đã được implement.

---

## ✅ Cấu trúc HTX đã có:

### 1. **HTX Roles** (5 vai trò):

```javascript
// Frontend & Backend
ROLES = {
  HTX_DIRECTOR: 'HTX_DIRECTOR',      // Giám đốc HTX
  HTX_TECHNICAL: 'HTX_TECHNICAL',     // Ban kỹ thuật
  HTX_DISTRIBUTION: 'HTX_DISTRIBUTION', // Ban phân phối
  HTX_ACCOUNTANT: 'HTX_ACCOUNTANT',   // Kế toán
  HTX_SUPERVISOR: 'HTX_SUPERVISOR',   // Ban kiểm soát
}
```

### 2. **Legacy Role Mapping**:

```javascript
// Hỗ trợ backward compatibility
LEGACY_ROLE_MAP = {
  'HTX' => 'HTX_DIRECTOR',  // Role cũ 'HTX' tự động map sang HTX_DIRECTOR
}
```

---

## 📊 HTX Sidebar Menu (Layout.jsx):

### Menu chính:

```javascript
getHtxItems() {
  return [
    // ✅ 1. Tổng quan HTX
    { key: '/dashboard', label: 'Tổng quan HTX' },
    
    // ✅ 2. Báo cáo & Thống kê
    { key: '/reports', label: 'Báo cáo & Thống kê' },
    
    // ✅ 3. Quản lý nông dân
    { key: '/htx/farmers', label: 'Quản lý nông dân' },
    
    // ✅ 4. Quản lý sổ HTX
    { key: '/htx/journals', label: 'Quản lý sổ HTX' },
    
    // ✅ 5. Phê duyệt nhật ký
    { key: '/htx/approvals', label: 'Phê duyệt nhật ký' },
    
    // ✅ 6. Phê duyệt vật tư
    { key: '/htx/supplies', label: 'Phê duyệt vật tư' },
    
    // ✅ 7. Truy xuất nguồn gốc (Submenu)
    {
      key: 'htx-traceability',
      label: 'Truy xuất nguồn gốc',
      children: [
        { key: '/htx/products', label: 'Danh mục sản phẩm' },
        { key: '/htx/batches', label: 'Quản lý lô & TXNG' },
        { key: '/htx/portal-settings', label: 'Cấu hình Cổng QG' },
      ]
    },
    
    // ✅ 8. Kho vật tư tập trung
    { key: '/inventory', label: 'Kho vật tư tập trung' },
  ];
}
```

---

## 🔐 Permission Functions:

### Frontend (utils/roles.js):

```javascript
// View permissions
canViewHtxJournals(role) 
  => ADMIN, HTX_DIRECTOR, HTX_TECHNICAL, HTX_SUPERVISOR

canViewHtxMembers(role)
  => All HTX roles + ADMIN

canViewInventory(role)
  => All HTX roles + ADMIN + FARMER

canViewTraceability(role)
  => ADMIN, HTX_DIRECTOR, HTX_TECHNICAL, HTX_SUPERVISOR

canViewHtxReports(role)
  => ADMIN, HTX_DIRECTOR, HTX_SUPERVISOR

// Manage permissions
canManageHtxJournals(role)
  => ADMIN, HTX_DIRECTOR, HTX_TECHNICAL

canAccessHtxFarmerManagement(role)
  => ADMIN, HTX_DIRECTOR, HTX_TECHNICAL, HTX_SUPERVISOR

canManageTraceability(role)
  => ADMIN, HTX_DIRECTOR

canManageSupplies(role)
  => ADMIN, HTX_DIRECTOR

canManageFinance(role)
  => ADMIN, HTX_DIRECTOR, HTX_ACCOUNTANT

canManageTechnicalOperations(role)
  => ADMIN, HTX_DIRECTOR, HTX_TECHNICAL

canManageDistributionOperations(role)
  => ADMIN, HTX_DIRECTOR, HTX_DISTRIBUTION

canManageAccountingOperations(role)
  => ADMIN, HTX_DIRECTOR, HTX_ACCOUNTANT

canHandleFarmerSubmissions(role)
  => ADMIN, HTX_DIRECTOR, HTX_TECHNICAL
```

### Backend (utils/roles.js):

Backend có **cùng logic** với frontend (đã sync).

---

## 🛣️ HTX Routes (App.jsx):

### Core Routes (Accessible by all HTX roles):

```javascript
/dashboard          => Dashboard
/reports            => Reports & Stats
/htx/journals       => HtxJournalMgmt (View)
/inventory          => HtxInventoryMgmt
```

### Management Routes (Restricted by permissions):

```javascript
// Farmer Management
/htx/farmers        => HtxFarmerMgmt
  Permission: canAccessHtxFarmerManagement
  Allowed: ADMIN, HTX_DIRECTOR, HTX_TECHNICAL, HTX_SUPERVISOR

// Journal Approval
/htx/approvals      => HtxJournalApproval
  Permission: canManageHtxJournals
  Allowed: ADMIN, HTX_DIRECTOR, HTX_TECHNICAL

// Supply Management
/htx/supplies       => HtxSupplyMgmt
  Permission: canManageSupplies
  Allowed: ADMIN, HTX_DIRECTOR

// Traceability
/htx/products       => HtxProductMgmt
/htx/batches        => HtxBatchMgmt
/htx/portal-settings => HtxPortalSettings
  Permission: canViewTraceability (view)
  Permission: canManageTraceability (edit)
  Allowed: ADMIN, HTX_DIRECTOR, HTX_TECHNICAL, HTX_SUPERVISOR
```

### Role-specific Console Routes:

```javascript
/htx/director       => HtxDirectorConsole
  Permission: isHtxDirector
  
/htx/technical      => HtxTechnicalConsole
  Permission: isHtxTechnical
  
/htx/distribution   => HtxDistributionConsole
  Permission: isHtxDistribution
  
/htx/accounting     => HtxAccountingConsole
  Permission: isHtxAccountant
```

### Advanced Management Modules (50+ routes):

```javascript
// Director Module
/htx/documents, /htx/tasks, /htx/finance, /htx/partners, /htx/training

// Technical Module
/htx/technical-guidance, /htx/technical-training, /htx/pest-control
/htx/product-inspections, /htx/nonconformities, /htx/material-supervision
/htx/technical-proposals, /htx/technical-reports

// Farmer Submissions
/htx/farmer-reports, /htx/farmer-suggestions
/htx/farmer-equipment-requests, /htx/farmer-duty-confirmations

// Distribution Module
/htx/distribution-orders, /htx/distribution-shipments
/htx/market-development, /htx/customer-feedback
/htx/product-finalization, /htx/distribution-finance

// Accounting Module
/htx/accounting-transactions, /htx/accounting-receivables
/htx/accounting-payables, /htx/accounting-reports
/htx/tax-obligations, /htx/financial-recommendations
```

---

## 🔍 Phát hiện vấn đề:

### ⚠️ **Vấn đề 1: Sidebar chỉ hiển thị menu cơ bản**

**Hiện trạng**: 
- Sidebar chỉ có 8 menu items
- Không có console routes cho từng role
- Không có advanced management modules

**Nguyên nhân**:
- `getHtxItems()` trong Layout.jsx chỉ return menu cơ bản
- Các console routes (/htx/director, /htx/technical, etc.) đã có trong App.jsx nhưng không có trong sidebar

**Giải pháp**:
```javascript
// Option 1: Thêm vào sidebar dựa trên role
const getHtxItems = () => {
  const role = normalizeRole(user?.role);
  const baseItems = [...]; // Menu cơ bản
  
  // Add role-specific items
  if (isHtxDirector(role)) {
    baseItems.push({
      key: 'htx-director',
      label: 'Quản lý giám đốc',
      children: [
        { key: '/htx/director', label: 'Console giám đốc' },
        { key: '/htx/documents', label: 'Tài liệu' },
        { key: '/htx/tasks', label: 'Công việc' },
        { key: '/htx/finance', label: 'Tài chính' },
        // ...
      ]
    });
  }
  
  if (isHtxTechnical(role)) {
    baseItems.push({
      key: 'htx-technical',
      label: 'Ban kỹ thuật',
      children: [
        { key: '/htx/technical', label: 'Console kỹ thuật' },
        { key: '/htx/technical-guidance', label: 'Hướng dẫn kỹ thuật' },
        // ...
      ]
    });
  }
  
  // ... similar for other roles
  
  return baseItems;
};

// Option 2: Gộp chung menu và dùng permission check
const getHtxItems = () => [
  // Basic items (visible to all HTX)
  ...,
  
  // Advanced items (conditional based on permissions)
  {
    key: 'htx-management',
    label: 'Quản lý nâng cao',
    children: [
      canManageTechnicalOperations(user?.role) && {
        key: '/htx/technical',
        label: 'Ban kỹ thuật'
      },
      canManageDistributionOperations(user?.role) && {
        key: '/htx/distribution',
        label: 'Ban phân phối'
      },
      // ...
    ].filter(Boolean) // Remove null items
  }
];
```

---

### ⚠️ **Vấn đề 2: Duplicate routes trong App.jsx**

**Phát hiện**:
```javascript
// Line 202
<Route path="farmers" element={<ProtectedRoute ...><HtxFarmerMgmt /></ProtectedRoute>} />

// Line 263 (Duplicate!)
<Route path="htx/farmers" element={<ProtectedRoute ...><HtxFarmerMgmt /></ProtectedRoute>} />
```

**Impact**: 
- Có 2 routes dẫn đến cùng 1 component
- Route đầu tiên (line 202) là `/farmers` (không có prefix `/htx/`)
- Route thứ hai (line 263) là `/htx/farmers`
- Sidebar link đến `/htx/farmers` (đúng)

**Giải pháp**: Xóa duplicate route ở line 202.

---

### ⚠️ **Vấn đề 3: Role home path mismatch**

**Phát hiện**:
```javascript
// utils/roles.js
getRoleHomePath(role) {
  if (normalized === ROLES.HTX_DIRECTOR) return '/htx/director';
  if (normalized === ROLES.HTX_TECHNICAL) return '/htx/technical';
  // ...
}
```

**Vấn đề**:
- User login với role HTX_DIRECTOR → redirect to `/htx/director`
- Nhưng `/htx/director` là console route (advanced), không phải trang chính
- Sidebar menu đầu tiên là `/dashboard`

**Giải pháp**:
```javascript
getRoleHomePath(role) {
  const normalized = normalizeRole(role);
  // All HTX roles should go to dashboard first
  if (isHtx(normalized)) return '/dashboard';
  if (normalized === ROLES.ADMIN) return '/dashboard';
  return '/dashboard';
}
```

---

### ⚠️ **Vấn đề 4: Backend role check có thể chưa consistent**

**Cần kiểm tra**:
- Backend controllers có dùng đúng permission functions không?
- Legacy role 'HTX' có được map đúng thành 'HTX_DIRECTOR' không?

**Test case**:
```bash
# Test với user có role='HTX' (legacy)
curl -H "Authorization: Bearer <token>" https://ebookfarm.onrender.com/api/htx/farmers

# Should work because 'HTX' maps to 'HTX_DIRECTOR'
# canAccessHtxFarmerManagement includes HTX_DIRECTOR
```

---

## 🎯 Action Items:

### Priority 1 (Critical):

- [ ] **Fix duplicate routes** trong App.jsx (xóa line 202)
- [ ] **Fix getRoleHomePath** để HTX roles redirect to `/dashboard`
- [ ] **Test legacy role mapping**: User với role='HTX' có access được không?

### Priority 2 (Important):

- [ ] **Expand sidebar menu** cho từng HTX role:
  - HTX_DIRECTOR: Thêm console + management modules
  - HTX_TECHNICAL: Thêm technical console + operations
  - HTX_DISTRIBUTION: Thêm distribution console
  - HTX_ACCOUNTANT: Thêm accounting console
  - HTX_SUPERVISOR: Menu hiện tại đã đủ

- [ ] **Test permissions** cho tất cả routes:
  - HTX_TECHNICAL có access được `/htx/technical-guidance` không?
  - HTX_DISTRIBUTION có access được `/htx/distribution-orders` không?
  - HTX_ACCOUNTANT có access được `/htx/accounting-transactions` không?

### Priority 3 (Nice to have):

- [ ] **Add breadcrumbs** để user biết đang ở đâu trong hierarchy
- [ ] **Add role badge** trong sidebar (hiển thị vai trò hiện tại)
- [ ] **Add quick access** to console route trong header dropdown
- [ ] **Documentation**: Tạo guide cho từng HTX role

---

## 🧪 Test Script:

```javascript
// test-htx-permissions.js

const testCases = [
  {
    role: 'HTX_DIRECTOR',
    shouldAccess: [
      '/dashboard',
      '/reports',
      '/htx/farmers',
      '/htx/journals',
      '/htx/approvals',
      '/htx/supplies',
      '/htx/products',
      '/htx/batches',
      '/htx/director',
    ],
    shouldNotAccess: [
      '/admin/users',
      '/form-builder',
    ]
  },
  {
    role: 'HTX_TECHNICAL',
    shouldAccess: [
      '/dashboard',
      '/reports',
      '/htx/farmers',
      '/htx/journals',
      '/htx/approvals',
      '/htx/technical',
      '/htx/technical-guidance',
    ],
    shouldNotAccess: [
      '/htx/supplies', // Only Director can manage
      '/htx/accounting', // Accountant only
    ]
  },
  {
    role: 'HTX_DISTRIBUTION',
    shouldAccess: [
      '/dashboard',
      '/inventory',
      '/htx/distribution',
      '/htx/distribution-orders',
    ],
    shouldNotAccess: [
      '/htx/approvals', // Technical only
      '/htx/farmers', // No permission
    ]
  },
  {
    role: 'HTX_ACCOUNTANT',
    shouldAccess: [
      '/dashboard',
      '/htx/accounting',
      '/htx/accounting-transactions',
      '/htx/financial-recommendations',
    ],
    shouldNotAccess: [
      '/htx/farmers',
      '/htx/approvals',
    ]
  },
  {
    role: 'HTX_SUPERVISOR',
    shouldAccess: [
      '/dashboard',
      '/reports',
      '/htx/farmers',
      '/htx/journals',
      '/htx/batches',
    ],
    shouldNotAccess: [
      '/htx/approvals', // Cannot manage, only view
      '/htx/supplies', // Cannot manage
    ]
  },
  {
    role: 'HTX', // Legacy role
    shouldAccess: [
      '/dashboard',
      '/htx/farmers',
      '/htx/approvals',
      '/htx/director', // Should map to HTX_DIRECTOR
    ],
    shouldNotAccess: [
      '/admin/users',
    ]
  }
];

// Run tests for each role
testCases.forEach(async ({ role, shouldAccess, shouldNotAccess }) => {
  console.log(`\nTesting role: ${role}`);
  console.log('='.repeat(60));
  
  // Login with this role
  const token = await loginWithRole(role);
  
  // Test allowed routes
  for (const route of shouldAccess) {
    const result = await testRoute(route, token);
    console.log(`  ${result ? '✅' : '❌'} ${route}`);
  }
  
  // Test forbidden routes
  for (const route of shouldNotAccess) {
    const result = await testRoute(route, token);
    console.log(`  ${!result ? '✅' : '❌'} ${route} (should be forbidden)`);
  }
});
```

---

## 📝 Recommendations:

### 1. **Simplify sidebar** (Recommended):

Thay vì hiển thị tất cả 50+ routes, nhóm theo modules:

```javascript
const getHtxItems = () => {
  const role = user?.role;
  
  return [
    { key: '/dashboard', label: 'Tổng quan' },
    { key: '/reports', label: 'Báo cáo' },
    
    // Core functions (visible to all)
    { key: '/htx/farmers', label: 'Nông dân' },
    { key: '/htx/journals', label: 'Nhật ký' },
    
    // Role-specific console (only show if has permission)
    ...(isHtxDirector(role) ? [{
      key: '/htx/director',
      label: 'Console giám đốc',
      icon: <DashboardIcon />
    }] : []),
    
    ...(isHtxTechnical(role) ? [{
      key: '/htx/technical',
      label: 'Console kỹ thuật',
      icon: <SettingsIcon />
    }] : []),
    
    // ... similar for other roles
  ];
};
```

### 2. **Use tabs within pages** thay vì tất cả trong sidebar:

Ví dụ: `/htx/technical` page có tabs:
- Hướng dẫn kỹ thuật
- Đào tạo
- Kiểm soát sâu bệnh
- Kiểm định sản phẩm
- ...

### 3. **Add role switching** nếu user có nhiều roles:

```javascript
// Header dropdown
[
  { label: 'Giám đốc HTX', onClick: () => switchRole('HTX_DIRECTOR') },
  { label: 'Ban kỹ thuật', onClick: () => switchRole('HTX_TECHNICAL') },
]
```

---

**Status**: 🟡 Needs Review
**Priority**: High
**Last Updated**: 2024

