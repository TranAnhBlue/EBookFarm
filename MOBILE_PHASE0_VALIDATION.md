# ✅ Phase 0: Validation Complete - Action Plan

## 🔍 Findings:

### 1. Backend Structure ✅

**FormSchema Model**:
```javascript
category: { 
  type: String, 
  enum: [
    'trongtrot',        // VietGAP Trồng trọt
    'channuoi',         // VietGAP Chăn nuôi
    'thuysan',          // VietGAP Thủy sản
    'huuco',            // Hữu cơ (generic)
    'huuco_caytrong',   // Hữu cơ - Cây trồng
    'huuco_channuoi',   // Hữu cơ - Chăn nuôi
    'huuco_thuysan',    // Hữu cơ - Thủy sản
    'thongminh',        // Nông nghiệp thông minh
  ]
}
```

**Observations**:
- ✅ Category field exists
- ❌ No `subCategory` field (using combined naming)
- ✅ API supports: `/api/schemas?category=trongtrot`
- ✅ API supports: `/api/journals?category=channuoi`

---

### 2. Web Frontend Structure ✅

**URL-based Categories**:
```
/vietgap/trong-trot  → category: 'trongtrot'
/vietgap/chan-nuoi   → category: 'channuoi'
/vietgap/thuy-san    → category: 'thuysan'
/huuco/cay-trong     → category: 'huuco_caytrong'
/huuco/chan-nuoi     → category: 'huuco_channuoi'
/huuco/thuy-san      → category: 'huuco_thuysan'
/thongminh/*         → category: 'thongminh'
```

**Category Mapping Function**:
```javascript
getCategoryFromPath(path) {
  if (path.startsWith('/vietgap')) {
    if (path.includes('chan-nuoi')) return 'channuoi';
    if (path.includes('thuy-san')) return 'thuysan';
    return 'trongtrot';
  }
  if (path.startsWith('/huuco')) {
    if (path.includes('cay-trong')) return 'huuco_caytrong';
    if (path.includes('chan-nuoi')) return 'huuco_channuoi';
    if (path.includes('thuy-san')) return 'huuco_thuysan';
    return 'huuco';
  }
  if (path.startsWith('/thongminh')) return 'thongminh';
  return null; // All categories
}
```

---

### 3. Data Model Alignment 🎯

**Current Backend Categories** → **Mobile App Mapping**:

```javascript
// Group 1: VietGAP
'trongtrot'   → VietGAP / Trồng trọt
'channuoi'    → VietGAP / Chăn nuôi
'thuysan'     → VietGAP / Thủy sản

// Group 2: Hữu cơ
'huuco'           → Hữu cơ / (generic - all)
'huuco_caytrong'  → Hữu cơ / Cây trồng
'huuco_channuoi'  → Hữu cơ / Chăn nuôi
'huuco_thuysan'   → Hữu cơ / Thủy sản

// Group 3: Thông minh
'thongminh'   → Thông minh / (all - no sub)
```

**Decision**: 
- ✅ Use **flat category structure** (no separate subCategory field)
- ✅ Map backend categories to UI groups
- ✅ Support filtering by main group (VietGAP, Hữu cơ, Thông minh)

---

## 📋 Revised Mobile Implementation:

### Mobile Category Structure:

```javascript
// constants/categories.js

export const CATEGORY_GROUPS = {
  VIETGAP: {
    key: 'vietgap',
    label: 'VietGAP',
    color: '#22c55e',
    icon: 'leaf',
    categories: [
      { key: 'trongtrot', label: 'Trồng trọt' },
      { key: 'channuoi', label: 'Chăn nuôi' },
      { key: 'thuysan', label: 'Thủy sản' },
    ]
  },
  ORGANIC: {
    key: 'organic',
    label: 'Hữu cơ',
    color: '#16a34a',
    icon: 'heart',
    categories: [
      { key: 'huuco_caytrong', label: 'Cây trồng' },
      { key: 'huuco_channuoi', label: 'Chăn nuôi' },
      { key: 'huuco_thuysan', label: 'Thủy sản' },
    ]
  },
  SMART: {
    key: 'smart',
    label: 'Thông minh',
    color: '#059669',
    icon: 'zap',
    categories: [
      { key: 'thongminh', label: 'Tất cả' },
      // Note: Backend chỉ có 1 category 'thongminh'
      // Nếu muốn sub-categories, cần update backend
    ]
  },
};

// Helper functions
export const getCategoryGroup = (categoryKey) => {
  if (['trongtrot', 'channuoi', 'thuysan'].includes(categoryKey)) {
    return CATEGORY_GROUPS.VIETGAP;
  }
  if (['huuco_caytrong', 'huuco_channuoi', 'huuco_thuysan', 'huuco'].includes(categoryKey)) {
    return CATEGORY_GROUPS.ORGANIC;
  }
  if (categoryKey === 'thongminh') {
    return CATEGORY_GROUPS.SMART;
  }
  return null;
};

export const getCategoryLabel = (categoryKey) => {
  const labels = {
    'trongtrot': 'Trồng trọt',
    'channuoi': 'Chăn nuôi',
    'thuysan': 'Thủy sản',
    'huuco_caytrong': 'Cây trồng',
    'huuco_channuoi': 'Chăn nuôi',
    'huuco_thuysan': 'Thủy sản',
    'thongminh': 'Thông minh',
  };
  return labels[categoryKey] || categoryKey;
};
```

---

## ✅ Validated APIs:

### Available Endpoints:

```bash
✅ GET /api/schemas
✅ GET /api/schemas?category=trongtrot
✅ GET /api/journals
✅ GET /api/journals?category=channuoi
✅ POST /api/journals
✅ PUT /api/journals/:id
✅ GET /api/reports/dashboard-stats
✅ GET /api/reports/journal-status
✅ GET /api/reports/activity-timeline
```

### Need to Create/Check:

```bash
❓ GET /api/htx/farmer-assignments
❓ PUT /api/htx/farmer-assignments/:id
❓ POST /api/htx/farmer-feedback
❓ GET /api/htx/farmer-feedback
❓ GET /api/journals/:id/history
```

---

## 🎯 Final Implementation Plan:

### Phase 1: Multi-Category System (3 days)

#### Day 1: Setup & Constants
- ✅ Create `constants/categories.js`
- ✅ Update API calls to support category filter
- ✅ Test with backend

#### Day 2: UI Components
- ✅ Update JournalListScreen
- ✅ Add category group tabs (VietGAP, Hữu cơ, Thông minh)
- ✅ Add category chips (Trồng trọt, Chăn nuôi, etc.)
- ✅ Filter schemas by category

#### Day 3: Integration & Testing
- ✅ Test all 8 categories
- ✅ Test create/edit journal with category
- ✅ Fix bugs

---

### Phase 2: Filter & Search (1 day)

#### Day 4: Filters
- ✅ Add status filter (Draft, Submitted, Verified, Locked)
- ✅ Add search bar
- ✅ Add sort options
- ✅ Test filtering

---

### Phase 3: Reports Screen (2-3 days)

#### Day 5-6: Reports UI
- ✅ Create ReportsScreen
- ✅ Integrate dashboard stats API
- ✅ Add stats cards
- ✅ Install chart library: `react-native-chart-kit`

#### Day 7: Charts
- ✅ Add Pie chart (journal status)
- ✅ Add Area chart (activity timeline)
- ✅ Add AI analysis button (optional)
- ✅ Test performance

---

### Phase 4: HTX Features (4 days)

#### Day 8-9: HTX Assignments
- ⏳ Check backend API
- ⏳ Create mock data if needed
- ⏳ Create HtxAssignmentsScreen
- ⏳ Test

#### Day 10-11: HTX Feedback
- ⏳ Check backend API
- ⏳ Create HtxFeedbackScreen
- ⏳ Test

---

### Phase 5: Enhancements (3 days)

#### Day 12: Inventory
- ✅ Add filter & search
- ✅ Add CRUD if allowed

#### Day 13: Supply
- ✅ Add create request form
- ✅ Add status tracking

#### Day 14: Polish
- ✅ Journal history
- ✅ News navigation
- ✅ UI polish

---

### Phase 6: Testing (5 days)

#### Day 15-17: Testing
- ✅ End-to-end testing
- ✅ Performance optimization
- ✅ Bug fixes

#### Day 18-19: Final Polish
- ✅ UI/UX refinements
- ✅ Documentation
- ✅ Prepare for release

---

## 🚀 Starting Tomorrow:

### Tomorrow (Day 1): Setup

**Morning** (3 hours):
1. Create `mobile/src/constants/categories.js`
2. Update `mobile/src/api/api.js` (if needed)
3. Test API calls with Postman

**Afternoon** (4 hours):
4. Start updating `JournalListScreen.js`
5. Add category group tabs
6. Test basic navigation

**End of Day**:
- ✅ Categories defined
- ✅ API integration working
- ✅ Basic UI skeleton

---

### Files to Create/Update:

```
Create:
  mobile/src/constants/
    └── categories.js ✅ NEW

Update:
  mobile/src/screens/
    ├── JournalListScreen.js ✅ MAJOR UPDATE
    ├── JournalEntryScreen.js ⚠️ Minor (add category param)
    └── HomeScreen.js ⚠️ Minor (update navigation)

Later:
  mobile/src/screens/
    ├── ReportsScreen.js ✅ NEW
    ├── HtxAssignmentsScreen.js ✅ NEW
    ├── HtxFeedbackScreen.js ✅ NEW
    └── HtxAssignmentDetailScreen.js ✅ NEW
```

---

## 📦 Dependencies to Install:

```bash
cd mobile

# Phase 3: Charts
npm install react-native-chart-kit react-native-svg

# Phase 4: HTX features
npx expo install expo-image-picker
npx expo install expo-document-picker

# Already installed (verify):
# - @react-native-community/datetimepicker
# - @tanstack/react-query
# - @expo/vector-icons
```

---

## ✅ Validation Checklist:

- [x] Backend has `category` field in FormSchema
- [x] Backend API supports `?category=X` filter
- [x] Web uses URL-based category mapping
- [x] Categories match: 8 categories identified
- [x] No `subCategory` field (using flat structure)
- [x] Mobile can use same API as web
- [x] Chart library chosen: `react-native-chart-kit`
- [x] UI design approach: Tabs + Chips
- [ ] HTX APIs exist (to be checked)
- [x] Timeline realistic: 4 weeks confirmed
- [x] Resources available: Approved

---

## 🎉 Ready to Implement!

**Status**: ✅ Validation Complete  
**Next**: Start Day 1 implementation  
**Confidence**: High (backend structure confirmed)  
**Risks**: Low (clear path forward)

**Let's code! 🚀**

