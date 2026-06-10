# 📱 Mobile-Web Sync Roadmap (Farmer Role)

## 🎯 Mục tiêu:
Đồng bộ 100% chức năng từ web xuống mobile cho role Farmer/Hộ nông dân

---

## 📊 So sánh Web vs Mobile:

### ✅ Web Features (Farmer Sidebar):

1. **Tổng quan** (`/dashboard`)
2. **Báo cáo & Thống kê** (`/reports`)
3. **Sản xuất VietGAP** (Submenu)
   - VietGAP Trồng trọt (`/vietgap/trong-trot`)
   - VietGAHP Chăn nuôi (`/vietgap/chan-nuoi`)
   - VietGAP Thủy sản (`/vietgap/thuy-san`)
4. **Nông nghiệp hữu cơ** (Submenu)
   - Cây trồng (`/huuco/cay-trong`)
   - Chăn nuôi (`/huuco/chan-nuoi`)
   - Thủy sản (`/huuco/thuy-san`)
5. **Nông nghiệp thông minh** (Submenu)
   - Rau củ quả (`/thongminh/rau-cu-qua`)
   - Lúa (`/thongminh/lua`)
   - Chăn nuôi (`/thongminh/chan-nuoi`)
6. **Yêu cầu từ HTX** (`/htx-assignments`)
7. **Báo cáo & đề xuất** (`/htx-feedback`)
8. **Tồn kho vật tư** (`/inventory/farmer`)
9. **Xin cấp vật tư** (`/supplies/farmer`)
10. **Tiêu chuẩn & Quy trình** (Submenu)
    - Quy trình kỹ thuật (`/docs`)
    - Tra cứu TCVN (`/tcvn`)

---

### 📱 Mobile Current Features (Bottom Tabs):

1. **Home** - HomeScreen (Dashboard) ✅
2. **Journals** - JournalListScreen (Chỉ có 1 category) ⚠️
3. **Scanner** - ScannerScreen (QR Trace) ✅
4. **AI** - AIScreen (Chat AI) ✅
5. **Profile** - ProfileScreen ✅
   - Account Info ✅
   - Change Password ✅
   - Inventory ✅
   - Supply ✅
   - TCVN ✅
   - Production Tech ✅
   - Notifications ✅

---

## 🔍 Gap Analysis:

### ❌ Missing Features (Chưa có trên mobile):

#### 1. **Multi-Category Journal System** ⭐⭐⭐
**Vấn đề**: 
- Web có 3 categories chính: VietGAP, Hữu cơ, Thông minh
- Mỗi category có 3 sub-categories
- Tổng: 9 loại sổ nhật ký
- Mobile chỉ có 1 màn hình JournalList chung

**Impact**: High - Core feature

**Giải pháp**:
```javascript
// Option 1: Thêm Category Selector trong JournalList
<CategoryTabs>
  <Tab name="VietGAP">
    <SubCategory>Trồng trọt</SubCategory>
    <SubCategory>Chăn nuôi</SubCategory>
    <SubCategory>Thủy sản</SubCategory>
  </Tab>
  <Tab name="Hữu cơ">
    <SubCategory>Cây trồng</SubCategory>
    <SubCategory>Chăn nuôi</SubCategory>
    <SubCategory>Thủy sản</SubCategory>
  </Tab>
  <Tab name="Thông minh">
    <SubCategory>Rau củ quả</SubCategory>
    <SubCategory>Lúa</SubCategory>
    <SubCategory>Chăn nuôi</SubCategory>
  </Tab>
</CategoryTabs>

// Option 2: Separate Screens cho mỗi category
- VietGAPScreen → 3 tabs (Trồng trọt, Chăn nuôi, Thủy sản)
- HuuCoScreen → 3 tabs
- ThongMinhScreen → 3 tabs
```

**Files to create/modify**:
- `mobile/src/screens/JournalListScreen.js` - Add category filter
- `mobile/src/components/CategorySelector.js` - New component
- `mobile/src/api/api.js` - Add category filter to API calls

---

#### 2. **Reports & Statistics** ⭐⭐⭐
**Vấn đề**: 
- Web có trang Reports với charts, stats, AI analysis
- Mobile không có

**Impact**: High - Important feature

**Giải pháp**:
```javascript
// Create ReportsScreen.js
- Dashboard stats (same as web Reports page)
- Pie chart (Journal status distribution)
- Area chart (Activity timeline)
- AI Analysis button
- Export PDF/Excel buttons (optional for mobile)
```

**Files to create**:
- `mobile/src/screens/ReportsScreen.js`
- Install chart library: `react-native-chart-kit` or `victory-native`

**API endpoints** (already available):
- `GET /api/reports/dashboard-stats`
- `GET /api/reports/journal-status`
- `GET /api/reports/activity-timeline`

---

#### 3. **HTX Assignments & Feedback** ⭐⭐
**Vấn đề**: 
- Web có 2 màn hình:
  - `/htx-assignments` - Xem yêu cầu từ HTX
  - `/htx-feedback` - Gửi báo cáo & đề xuất
- Mobile không có

**Impact**: Medium - Quan trọng cho collaboration với HTX

**Giải pháp**:
```javascript
// 1. HtxAssignmentsScreen.js
- List các task/request từ HTX
- Filter: Chưa làm, Đang làm, Hoàn thành
- Chi tiết task
- Update trạng thái
- Upload ảnh/file đính kèm

// 2. HtxFeedbackScreen.js
- Form gửi báo cáo
- Form gửi đề xuất
- Lịch sử báo cáo đã gửi
- Phản hồi từ HTX
```

**Files to create**:
- `mobile/src/screens/HtxAssignmentsScreen.js`
- `mobile/src/screens/HtxFeedbackScreen.js`

**API endpoints to check**:
- `GET /api/htx/farmer-assignments` (?)
- `POST /api/htx/farmer-feedback` (?)
- Need to check backend if these exist

---

#### 4. **News List** ⭐
**Vấn đề**:
- Mobile có NewsDetailScreen nhưng chưa có cách access
- Web có News section trong Dashboard và dedicated News page

**Impact**: Low-Medium

**Giải pháp**:
```javascript
// Already have NewsListScreen.js & NewsDetailScreen.js
// Just need to add navigation
- Add "Tin tức" trong Profile menu
- Or add banner in HomeScreen
```

---

### ⚠️ Partial Features (Có nhưng chưa đủ):

#### 1. **Journal Management** ⚠️
**Hiện tại**:
- ✅ List journals
- ✅ Create journal
- ✅ Edit journal
- ✅ View journal detail
- ❌ Filter by status (Draft, Submitted, Verified, Locked)
- ❌ Filter by date range
- ❌ Search journals
- ❌ Sort journals
- ❌ View journal history (changes log)
- ❌ Multi-row table support (partially done)

**Cần thêm**:
```javascript
// JournalListScreen improvements:
- Add filter dropdown: Tất cả | Nháp | Chờ duyệt | Đã duyệt | Khóa
- Add date range picker
- Add search bar
- Add sort options: Mới nhất | Cũ nhất | Tên A-Z
- Add pull-to-refresh
- Add infinite scroll / pagination
```

---

#### 2. **Inventory Management** ⚠️
**Hiện tại**:
- ✅ View inventory list
- ✅ Basic UI
- ❌ Add new inventory item
- ❌ Update inventory quantity
- ❌ Filter by category
- ❌ Search items
- ❌ View usage history

**Cần thêm**:
```javascript
// InventoryScreen improvements:
- Add "Thêm vật tư" button (nếu farmer được phép)
- Add quantity update
- Add filter by category
- Add search
- Add usage log view
```

---

#### 3. **Supply Management** ⚠️
**Hiện tại**:
- ✅ View supply requests (?)
- ❌ Create new supply request
- ❌ View request status
- ❌ Update request
- ❌ Cancel request

**Cần thêm**:
```javascript
// SupplyScreen improvements:
- Add "Xin cấp vật tư mới" button
- Form: Loại vật tư, Số lượng, Lý do, Ngày cần
- List requests với status: Chờ duyệt | Đã duyệt | Từ chối
- View chi tiết request
- Có thể hủy request (nếu chưa duyệt)
```

---

### ✅ Completed Features:

1. **Dashboard/Home** ✅
   - Weather widget
   - Stats cards
   - Quick access
   - Sensors (mock data)

2. **Authentication** ✅
   - Login
   - Register
   - Forgot password
   - Reset password

3. **Profile Management** ✅
   - Account info
   - Change password
   - Avatar

4. **QR Scanner** ✅
   - Scan QR
   - View trace detail

5. **AI Chat** ✅
   - Chat interface
   - History

6. **TCVN Reference** ✅
   - Search standards
   - View details

7. **Production Tech** ✅
   - View technical docs

8. **Notifications** ✅
   - List notifications
   - Mark as read

---

## 🎯 Implementation Roadmap:

### Phase 1: Core Features (Week 1-2) 🔥

#### Priority 1.1: Multi-Category Journal System
**Effort**: Medium (2-3 days)

**Tasks**:
1. ✅ Update JournalListScreen với category tabs
2. ✅ Add category filter to API calls
3. ✅ Update navigation params
4. ✅ Test all 9 sub-categories

**Files**:
```
mobile/src/screens/JournalListScreen.js
mobile/src/components/CategoryTabs.js (new)
mobile/src/api/api.js
```

---

#### Priority 1.2: Journal Filtering & Search
**Effort**: Small (1 day)

**Tasks**:
1. ✅ Add status filter dropdown
2. ✅ Add search bar
3. ✅ Add date range picker
4. ✅ Add sort options

**Files**:
```
mobile/src/screens/JournalListScreen.js
mobile/src/components/JournalFilters.js (new)
```

---

#### Priority 1.3: Reports & Statistics
**Effort**: Medium (2-3 days)

**Tasks**:
1. ✅ Create ReportsScreen
2. ✅ Integrate dashboard stats API
3. ✅ Add charts (Pie + Area)
4. ✅ Add AI analysis integration
5. ✅ Add to bottom navigation or profile menu

**Files**:
```
mobile/src/screens/ReportsScreen.js (new)
mobile/App.js (update navigation)
```

**Dependencies**:
```bash
npm install react-native-chart-kit react-native-svg
# or
npm install victory-native
```

---

### Phase 2: HTX Integration (Week 3)

#### Priority 2.1: HTX Assignments
**Effort**: Medium (2 days)

**Tasks**:
1. ✅ Check backend endpoints
2. ✅ Create HtxAssignmentsScreen
3. ✅ List view + detail view
4. ✅ Status update functionality
5. ✅ Add to navigation

**Files**:
```
mobile/src/screens/HtxAssignmentsScreen.js (new)
mobile/src/screens/HtxAssignmentDetailScreen.js (new)
```

---

#### Priority 2.2: HTX Feedback
**Effort**: Medium (2 days)

**Tasks**:
1. ✅ Check backend endpoints
2. ✅ Create HtxFeedbackScreen
3. ✅ Form submission
4. ✅ History view
5. ✅ Add to navigation

**Files**:
```
mobile/src/screens/HtxFeedbackScreen.js (new)
```

---

### Phase 3: Enhancement & Polish (Week 4)

#### Priority 3.1: Inventory Enhancements
**Effort**: Small (1 day)

**Tasks**:
1. ✅ Add filter & search
2. ✅ Add quantity update (if allowed)
3. ✅ Add usage history view

---

#### Priority 3.2: Supply Enhancements
**Effort**: Small (1 day)

**Tasks**:
1. ✅ Create supply request form
2. ✅ Add status tracking
3. ✅ Add cancel functionality

---

#### Priority 3.3: News Integration
**Effort**: Small (0.5 day)

**Tasks**:
1. ✅ Add News to Profile menu
2. ✅ Test navigation flow

---

#### Priority 3.4: Journal History
**Effort**: Medium (1-2 days)

**Tasks**:
1. ✅ Create JournalHistoryModal component
2. ✅ Integrate with JournalEntry
3. ✅ Show changes log
4. ✅ Show who made changes

---

### Phase 4: Testing & Optimization (Week 5)

#### Priority 4.1: End-to-End Testing
**Effort**: Medium (2-3 days)

**Tasks**:
1. ✅ Test all screens
2. ✅ Test all API integrations
3. ✅ Test offline handling
4. ✅ Test error scenarios
5. ✅ Performance optimization

---

#### Priority 4.2: UI/UX Polish
**Effort**: Small (1 day)

**Tasks**:
1. ✅ Consistent styling
2. ✅ Loading states
3. ✅ Empty states
4. ✅ Error messages
5. ✅ Success feedback

---

## 📋 Detailed Feature Specs:

### 1. Multi-Category Journal System

#### UI Design:
```
┌─────────────────────────────────┐
│  Nhật ký sản xuất          [+]  │
├─────────────────────────────────┤
│ [VietGAP] [Hữu cơ] [Thông minh]│ ← Category Tabs
├─────────────────────────────────┤
│ ┌────────────┬────────────────┐ │
│ │ Trồng trọt │ Chăn nuôi │... │ │ ← Sub-category Chips
│ └────────────┴────────────────┘ │
├─────────────────────────────────┤
│ 🔍 Tìm kiếm...   [Filter] [Sort]│
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ 📋 Nhật ký dê thịt        │   │
│ │ VietGAHP Chăn nuôi        │   │
│ │ 📅 05/12/2024  ⏰ Nháp    │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ 📋 Nhật ký lúa hữu cơ     │   │
│ │ Hữu cơ - Cây trồng        │   │
│ │ 📅 03/12/2024  ✅ Đã duyệt│   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

#### API Structure:
```javascript
// GET /api/schemas
// Response includes `category` and `subCategory`
{
  data: [
    {
      _id: '...',
      name: 'Dê thịt',
      category: 'VietGAP',      // New field
      subCategory: 'chan-nuoi',  // New field
      tables: [...]
    },
    {
      _id: '...',
      name: 'Lúa hữu cơ',
      category: 'Organic',       // Hữu cơ
      subCategory: 'cay-trong',
      tables: [...]
    }
  ]
}

// GET /api/journals?category=VietGAP&subCategory=chan-nuoi
```

#### Navigation Flow:
```
HomeScreen
  ├─> [Journals Tab]
  │     ├─> JournalListScreen
  │     │     ├─> Select Category (VietGAP/Hữu cơ/Thông minh)
  │     │     ├─> Select SubCategory (Trồng trọt/Chăn nuôi/Thủy sản)
  │     │     ├─> Filter (Status, Date)
  │     │     ├─> Search
  │     │     └─> Sort
  │     │
  │     ├─> [+ Create Button]
  │     │     ├─> Select Schema (filtered by category)
  │     │     └─> JournalEntryScreen (new)
  │     │
  │     └─> [Journal Item Click]
  │           └─> JournalEntryScreen (edit/view)
  │
  └─> [Profile Tab]
        └─> Can also access specific categories
```

---

### 2. Reports & Statistics Screen

#### UI Design:
```
┌─────────────────────────────────┐
│  Báo cáo & Thống kê        [🤖] │ ← AI Analysis
├─────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┐ │
│ │ Tổng SĐ │ Hoàn TT │ Chờ PD  │ │
│ │   12    │    8    │    3    │ │
│ └─────────┴─────────┴─────────┘ │
├─────────────────────────────────┤
│ Biểu đồ trạng thái              │
│ ┌─────────────────────────────┐ │
│ │      [Pie Chart]            │ │
│ │   ┌────┐                    │ │
│ │   │ 🟢 │ Đã duyệt: 67%     │ │
│ │   │ 🟡 │ Chờ duyệt: 25%    │ │
│ │   │ 🔵 │ Nháp: 8%          │ │
│ │   └────┘                    │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Hoạt động 6 tháng gần đây       │
│ ┌─────────────────────────────┐ │
│ │      [Area Chart]           │ │
│ │        /\    /\             │ │
│ │       /  \  /  \            │ │
│ │      /    \/    \           │ │
│ │     /            \          │ │
│ │  T7  T8  T9  T10 T11 T12   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### Features:
- **Stats Cards**: Total, Completed, Pending, Verified
- **Pie Chart**: Journal status distribution
- **Area Chart**: Activity timeline (6 months)
- **AI Analysis Button**: Analyze stats with AI
- **Refresh**: Pull-to-refresh
- **Export** (optional): PDF/Excel

---

### 3. HTX Assignments Screen

#### UI Design:
```
┌─────────────────────────────────┐
│  Yêu cầu từ HTX                 │
├─────────────────────────────────┤
│ [Tất cả] [Chưa làm] [Đang làm] │
│ [Hoàn thành]                    │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ 🔴 Kiểm tra chuồng trại   │   │
│ │ Từ: Ban kỹ thuật HTX      │   │
│ │ 📅 Hạn: 10/12/2024        │   │
│ │ 🏷️ Chưa làm               │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ 🟡 Báo cáo sản lượng tháng│   │
│ │ Từ: Ban quản lý           │   │
│ │ 📅 Hạn: 15/12/2024        │   │
│ │ 🏷️ Đang làm               │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

#### Features:
- **List view**: Tất cả assignments
- **Filter by status**: Chưa làm, Đang làm, Hoàn thành, Quá hạn
- **Detail view**: Chi tiết task, mô tả, files đính kèm
- **Update status**: Cập nhật tiến độ
- **Upload**: Upload ảnh/file hoàn thành
- **Comments**: Chat với HTX về task

---

### 4. HTX Feedback Screen

#### UI Design:
```
┌─────────────────────────────────┐
│  Báo cáo & Đề xuất              │
├─────────────────────────────────┤
│ [Gửi mới]  [Lịch sử]            │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Loại:                       │ │
│ │ ( ) Báo cáo vấn đề          │ │
│ │ (•) Đề xuất cải tiến        │ │
│ │ ( ) Yêu cầu hỗ trợ          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Tiêu đề:                    │ │
│ │ [________________]          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Nội dung:                   │ │
│ │ [________________]          │ │
│ │ [________________]          │ │
│ │ [________________]          │ │
│ └─────────────────────────────┘ │
│ [📷 Đính kèm ảnh]               │
│                                 │
│ [Gửi]                           │
└─────────────────────────────────┘
```

#### Features:
- **Form gửi**: Loại, Tiêu đề, Nội dung
- **Attach**: Ảnh, file
- **History**: Xem các feedback đã gửi
- **Status**: Chờ xử lý, Đang xử lý, Đã xử lý
- **Reply**: Xem phản hồi từ HTX

---

## 🛠️ Technical Implementation:

### 1. Update Navigation Structure

```javascript
// mobile/App.js

// Add to Stack Navigator
<Stack.Screen name="Reports" component={ReportsScreen} />
<Stack.Screen name="HtxAssignments" component={HtxAssignmentsScreen} />
<Stack.Screen name="HtxAssignmentDetail" component={HtxAssignmentDetailScreen} />
<Stack.Screen name="HtxFeedback" component={HtxFeedbackScreen} />
<Stack.Screen name="NewsList" component={NewsListScreen} />

// Update Bottom Tabs (Optional: Add Reports tab)
// Or keep Reports in Profile menu
```

---

### 2. Update ProfileScreen Menu

```javascript
// mobile/src/screens/ProfileScreen.js

const menuItems = [
  // ... existing items
  {
    id: 'reports',
    title: 'Báo cáo & Thống kê',
    icon: 'bar-chart-2',
    screen: 'Reports',
    color: '#3b82f6'
  },
  {
    id: 'htx-assignments',
    title: 'Yêu cầu từ HTX',
    icon: 'clipboard',
    screen: 'HtxAssignments',
    color: '#f59e0b',
    badge: unreadAssignmentsCount // Show count
  },
  {
    id: 'htx-feedback',
    title: 'Báo cáo & Đề xuất',
    icon: 'message-square',
    screen: 'HtxFeedback',
    color: '#8b5cf6'
  },
  {
    id: 'news',
    title: 'Tin tức',
    icon: 'newspaper',
    screen: 'NewsList',
    color: '#22c55e'
  },
  // ... rest
];
```

---

### 3. Backend API Checklist

```javascript
// APIs needed (check if exist in backend)

// ✅ Already exist:
GET /api/reports/dashboard-stats
GET /api/reports/journal-status
GET /api/reports/activity-timeline
GET /api/schemas
GET /api/journals
POST /api/journals
PUT /api/journals/:id
GET /api/inventory/farmer
GET /api/supplies/farmer
POST /api/supplies/farmer
GET /api/tcvn
GET /api/news
GET /api/notifications

// ❓ Need to check:
GET /api/htx/farmer-assignments  // HTX tasks for farmer
PUT /api/htx/farmer-assignments/:id  // Update task status
POST /api/htx/farmer-feedback  // Submit feedback
GET /api/htx/farmer-feedback  // Get feedback history

// If not exist, need to create in backend
```

---

## 📦 Dependencies to Install:

```bash
cd mobile

# Charts
npm install react-native-chart-kit react-native-svg

# Or Victory (alternative)
npm install victory-native

# Image picker (for HTX feedback)
npx expo install expo-image-picker

# Document picker (for attachments)
npx expo install expo-document-picker

# Date picker (already installed?)
npx expo install @react-native-community/datetimepicker
```

---

## ✅ Success Criteria:

### Phase 1 Complete:
- [ ] Mobile has all 9 journal categories
- [ ] Filter, search, sort works
- [ ] Reports screen shows all stats & charts
- [ ] AI analysis integration works

### Phase 2 Complete:
- [ ] HTX assignments list & detail
- [ ] Status update works
- [ ] HTX feedback form works
- [ ] History view works

### Phase 3 Complete:
- [ ] Inventory filter & search
- [ ] Supply request creation
- [ ] News accessible from Profile
- [ ] Journal history modal

### Phase 4 Complete:
- [ ] All features tested
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] UI polished

---

## 📝 Notes:

1. **Backward Compatibility**: Ensure existing features still work
2. **Error Handling**: Add proper error messages for all API calls
3. **Loading States**: Add skeleton screens for all list views
4. **Offline Support**: Cache data when possible
5. **Push Notifications**: For HTX assignments & approvals
6. **Analytics**: Track feature usage

---

**Status**: 🟡 Ready to implement
**Priority**: High
**Estimated Time**: 4-5 weeks
**Last Updated**: 2024

