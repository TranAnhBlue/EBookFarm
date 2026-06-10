# 📝 JournalListScreen Update Summary

## 🎯 Objective:
Update JournalListScreen.js để support multi-category system với 3 category groups và 8 categories.

---

## 🔄 Changes Overview:

### 1. **Import New Constants** ✅
```javascript
import {
  CATEGORY_GROUPS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  getCategoryGroup,
  getFullCategoryName,
  getCategoryLabel,
} from '../constants/categories';
```

### 2. **New State Variables** ✅
```javascript
// Category selection
const [activeGroup, setActiveGroup] = useState('vietgap'); // 'vietgap' | 'organic' | 'smart'
const [activeCategory, setActiveCategory] = useState('trongtrot'); // Backend category key

// Enhanced filters (already have statusFilter)
const [sortBy, setSortBy] = useState('newest');
const [showFilters, setShowFilters] = useState(false);
```

### 3. **Updated API Calls** ✅
```javascript
// Fetch schemas with category filter
const { data: schemas } = useQuery({
  queryKey: ['schemas', activeCategory],
  queryFn: async () => {
    const { data } = await api.get('/schemas', {
      params: { category: activeCategory }
    });
    return data.data;
  },
});

// Fetch journals with category filter
const { data: journals } = useQuery({
  queryKey: ['journals', activeCategory, statusFilter, sortBy],
  queryFn: async () => {
    const params = { category: activeCategory };
    if (statusFilter !== 'all') params.status = statusFilter;
    if (sortBy) {
      const sortOption = SORT_OPTIONS.find(s => s.key === sortBy);
      params.sortBy = sortOption.field;
      params.sortOrder = sortOption.order;
    }
    const { data } = await api.get('/journals', { params });
    return data.data;
  },
});
```

### 4. **New UI Components** ✅

#### A. Category Group Tabs
```javascript
const renderCategoryGroupTab = (group) => {
  const isActive = activeGroup === group.key;
  return (
    <TouchableOpacity
      key={group.key}
      style={[
        styles.groupTab,
        isActive && { borderBottomColor: group.color, borderBottomWidth: 3 }
      ]}
      onPress={() => handleGroupChange(group.key)}
    >
      <Feather name={group.icon} size={18} color={isActive ? group.color : '#9ca3af'} />
      <Text style={[
        styles.groupTabText,
        isActive && { color: group.color, fontWeight: '700' }
      ]}>
        {group.label}
      </Text>
    </TouchableOpacity>
  );
};

// Usage
<View style={styles.groupTabsContainer}>
  {Object.values(CATEGORY_GROUPS).map(renderCategoryGroupTab)}
</View>
```

#### B. Category Chips (Sub-categories)
```javascript
const renderCategoryChip = (category) => {
  const isActive = activeCategory === category.key;
  const group = CATEGORY_GROUPS[activeGroup];
  
  return (
    <TouchableOpacity
      key={category.key}
      style={[
        styles.categoryChip,
        isActive && { 
          backgroundColor: `${group.color}20`,
          borderColor: group.color 
        }
      ]}
      onPress={() => setActiveCategory(category.key)}
    >
      <Text style={[
        styles.categoryChipText,
        isActive && { color: group.color, fontWeight: '700' }
      ]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
};

// Usage
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {CATEGORY_GROUPS[activeGroup].categories.map(renderCategoryChip)}
</ScrollView>
```

#### C. Enhanced Filter Bar
```javascript
<View style={styles.filterBar}>
  <View style={styles.searchBox}>
    <Feather name="search" size={16} color="#94a3b8" />
    <TextInput
      style={styles.searchInput}
      placeholder="Tìm kiếm..."
      value={search}
      onChangeText={setSearch}
    />
  </View>
  
  <View style={styles.filterButtons}>
    <TouchableOpacity 
      style={styles.filterButton}
      onPress={() => setShowFilters(!showFilters)}
    >
      <Feather name="filter" size={18} color="#6b7280" />
      <Text style={styles.filterButtonText}>Lọc</Text>
      {statusFilter !== 'all' && <View style={styles.filterBadge} />}
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.filterButton}
      onPress={cycleSortOption}
    >
      <Feather name="arrow-down" size={18} color="#6b7280" />
      <Text style={styles.filterButtonText}>Sắp xếp</Text>
    </TouchableOpacity>
  </View>
</View>
```

#### D. Filters Panel (Collapsible)
```javascript
{showFilters && (
  <View style={styles.filtersPanel}>
    <Text style={styles.filtersPanelTitle}>Trạng thái</Text>
    <View style={styles.statusFilters}>
      {STATUS_OPTIONS.map(status => (
        <TouchableOpacity
          key={status.key}
          style={[
            styles.statusChip,
            statusFilter === status.key && {
              backgroundColor: `${status.color}20`,
              borderColor: status.color
            }
          ]}
          onPress={() => setStatusFilter(status.key)}
        >
          <Text style={[
            styles.statusChipText,
            statusFilter === status.key && { 
              color: status.color,
              fontWeight: '700'
            }
          ]}>
            {status.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)}
```

### 5. **Updated Journal Card** ✅
```javascript
const renderJournal = ({ item }) => {
  const group = getCategoryGroup(item.schemaId?.category);
  const statusInfo = getStatusInfo(item.status);
  const categoryName = getFullCategoryName(item.schemaId?.category);
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => openDetail(item._id)}
    >
      {/* Category color accent */}
      <View style={[
        styles.cardAccent, 
        { backgroundColor: group?.color || '#22c55e' }
      ]} />
      
      <View style={styles.cardBody}>
        {/* Schema name + Status badge */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Feather name="book-open" size={20} color={group?.color} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.schemaId?.name || 'Nhật ký'}
            </Text>
            <Text style={styles.cardCategory}>{categoryName}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: `${statusInfo.color}15` }
          ]}>
            <Text style={[
              styles.statusBadgeText,
              { color: statusInfo.color }
            ]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
        
        {/* Meta info */}
        <View style={styles.cardMeta}>
          <Feather name="calendar" size={12} color="#9ca3af" />
          <Text style={styles.cardMetaText}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
          
          {item.htxJournalId && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Feather name="users" size={12} color="#9ca3af" />
              <Text style={styles.cardMetaText}>Sổ HTX</Text>
            </>
          )}
        </View>
        
        {/* Actions */}
        <View style={styles.cardActions}>
          {item.status === 'Draft' && (
            <TouchableOpacity
              style={[styles.cardActionButton, { backgroundColor: '#dbeafe' }]}
              onPress={() => navigation.navigate('JournalEntry', {
                journalId: item._id,
                schemaId: item.schemaId?._id,
                category: item.schemaId?.category
              })}
            >
              <Feather name="edit-3" size={14} color="#3b82f6" />
              <Text style={[styles.cardActionText, { color: '#3b82f6' }]}>
                Viết
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.cardActionButton, { backgroundColor: '#f3f4f6' }]}
            onPress={() => openDetail(item._id)}
          >
            <Feather name="eye" size={14} color="#6b7280" />
            <Text style={[styles.cardActionText, { color: '#6b7280' }]}>
              Xem
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};
```

### 6. **Helper Functions** ✅
```javascript
// Handle category group change
const handleGroupChange = (groupKey) => {
  setActiveGroup(groupKey);
  // Set first category of the group as default
  const firstCategory = CATEGORY_GROUPS[groupKey].categories[0].key;
  setActiveCategory(firstCategory);
};

// Cycle through sort options
const cycleSortOption = () => {
  const currentIndex = SORT_OPTIONS.findIndex(s => s.key === sortBy);
  const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
  setSortBy(SORT_OPTIONS[nextIndex].key);
};

// Navigate to create with category context
const handleCreate = (schemaId) => {
  setSchemaModal(false);
  navigation.navigate('JournalEntry', { 
    schemaId,
    category: activeCategory,
    group: activeGroup
  });
};
```

---

## 🎨 New Styles to Add:

```javascript
// Category Group Tabs
groupTabsContainer: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#f3f4f6',
  paddingHorizontal: 16,
},
groupTab: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 14,
  gap: 8,
  borderBottomWidth: 3,
  borderBottomColor: 'transparent',
},
groupTabText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#9ca3af',
},

// Category Chips
categoryChipsScroll: {
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#f3f4f6',
  paddingVertical: 12,
},
categoryChipsContent: {
  paddingHorizontal: 16,
  gap: 8,
},
categoryChip: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: '#f3f4f6',
  borderWidth: 2,
  borderColor: 'transparent',
},
categoryChipText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#6b7280',
},

// Filter Bar
filterBar: {
  backgroundColor: '#fff',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#f3f4f6',
  gap: 12,
},
filterButtons: {
  flexDirection: 'row',
  gap: 8,
},
filterButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
  paddingHorizontal: 12,
  backgroundColor: '#f3f4f6',
  borderRadius: 12,
  gap: 6,
},
filterButtonText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#6b7280',
},
filterBadge: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: '#22c55e',
  marginLeft: 4,
},

// Filters Panel
filtersPanel: {
  backgroundColor: '#f9fafb',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#e5e7eb',
},
filtersPanelTitle: {
  fontSize: 12,
  fontWeight: '700',
  color: '#6b7280',
  textTransform: 'uppercase',
  marginBottom: 10,
  letterSpacing: 0.5,
},
statusFilters: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},
statusChip: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 16,
  backgroundColor: '#fff',
  borderWidth: 1.5,
  borderColor: '#e5e7eb',
},
statusChipText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#6b7280',
},

// Updated Card Styles
cardIcon: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: '#f3f4f6',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},
cardInfo: {
  flex: 1,
  marginRight: 12,
},
cardTitle: {
  fontSize: 15,
  fontWeight: '700',
  color: '#1f2937',
  marginBottom: 4,
},
cardCategory: {
  fontSize: 12,
  color: '#9ca3af',
  fontWeight: '600',
},
cardMeta: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
  marginBottom: 12,
},
cardMetaText: {
  fontSize: 12,
  color: '#9ca3af',
  marginLeft: 4,
},
cardActions: {
  flexDirection: 'row',
  gap: 8,
},
cardActionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 10,
  gap: 6,
},
cardActionText: {
  fontSize: 12,
  fontWeight: '700',
},
```

---

## 📱 UI Layout Structure:

```
┌─────────────────────────────────────┐
│  Sổ nhật ký sản xuất          [+]   │ ← Header
├─────────────────────────────────────┤
│ [VietGAP] [Hữu cơ] [Thông minh]    │ ← Group Tabs
├─────────────────────────────────────┤
│ [Trồng trọt] [Chăn nuôi] [Thủy sản]│ ← Category Chips
├─────────────────────────────────────┤
│ 🔍 Tìm kiếm...                      │ ← Search
│ [Lọc ●]  [Sắp xếp]                  │ ← Filter Buttons
├─────────────────────────────────────┤
│ [All] [Nháp] [Chờ duyệt] [Đã duyệt]│ ← Filters Panel (collapsible)
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │●│📖 Nhật ký dê thịt             │ │ ← Journal Card
│ │ │  VietGAP - Chăn nuôi          │ │
│ │ │  📅 05/12/2024  ⏰ Nháp       │ │
│ │ │  [Viết] [Xem]                 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │●│📖 Sổ lúa hữu cơ               │ │
│ │ │  Hữu cơ - Cây trồng           │ │
│ │ │  📅 03/12/2024  ✅ Đã duyệt   │ │
│ │ │  [Xem]                        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## ✅ Testing Checklist:

### Functionality:
- [ ] Can switch between 3 category groups
- [ ] Can switch between sub-categories
- [ ] API calls include correct category param
- [ ] Schemas filtered by category
- [ ] Journals filtered by category
- [ ] Status filter works
- [ ] Search works
- [ ] Sort works
- [ ] Can create journal with category context
- [ ] Can edit journal preserving category

### UI/UX:
- [ ] Tabs highlight correctly
- [ ] Chips highlight correctly
- [ ] Filter panel shows/hides
- [ ] Status badges show correct colors
- [ ] Category colors match design
- [ ] Smooth scrolling
- [ ] Pull-to-refresh works
- [ ] Empty states display correctly

### Edge Cases:
- [ ] No schemas in category → show empty state
- [ ] No journals in category → show empty state
- [ ] Network error → show error message
- [ ] Loading states → show skeleton/spinner
- [ ] Search with no results → show empty state

---

## 🚀 Implementation Steps:

### Step 1: Backup current file
```bash
cp mobile/src/screens/JournalListScreen.js mobile/src/screens/JournalListScreen.backup.js
```

### Step 2: Update imports
- Add category constants

### Step 3: Add new state variables
- activeGroup, activeCategory
- sortBy, showFilters

### Step 4: Update API calls
- Add category param to queries
- Add sort param

### Step 5: Add UI components
- Group tabs
- Category chips
- Filter bar
- Filters panel

### Step 6: Update card rendering
- Use category colors
- Show full category name

### Step 7: Add styles
- All new styles from above

### Step 8: Test thoroughly
- All 8 categories
- All filters
- Create/Edit flow

---

## 📦 Files to Update:

```
mobile/src/screens/
  └── JournalListScreen.js ← UPDATE

mobile/src/screens/ (create backup)
  └── JournalListScreen.backup.js ← BACKUP

mobile/src/constants/
  └── categories.js ← ALREADY CREATED
```

---

## 🎯 Success Criteria:

- ✅ All 8 categories accessible via UI
- ✅ API calls include category filter
- ✅ Schemas/journals filtered correctly
- ✅ Status filter works
- ✅ Search works
- ✅ Sort works
- ✅ Create/Edit flow includes category
- ✅ UI matches design
- ✅ No crashes or bugs
- ✅ Good performance

---

**Status**: 📝 Ready to implement  
**Next**: Update JournalListScreen.js file  
**Estimated Time**: 2-3 hours  
**Risk**: Low (clear requirements, existing code to reference)

