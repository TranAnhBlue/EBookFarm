# 📱 Mobile Implementation Guide - Phase 1

## 🎯 Phase 1: Multi-Category Journal System

### Step 1: Update JournalListScreen với Category Support

#### 1.1 Add Category Constants

Create `mobile/src/constants/categories.js`:
```javascript
export const CATEGORIES = {
  VIETGAP: {
    key: 'vietgap',
    label: 'VietGAP',
    color: '#22c55e',
    icon: 'leaf',
  },
  ORGANIC: {
    key: 'organic',
    label: 'Hữu cơ',
    color: '#16a34a',
    icon: 'heart',
  },
  SMART: {
    key: 'smart',
    label: 'Thông minh',
    color: '#059669',
    icon: 'zap',
  },
};

export const SUB_CATEGORIES = {
  vietgap: [
    { key: 'trong-trot', label: 'Trồng trọt' },
    { key: 'chan-nuoi', label: 'Chăn nuôi' },
    { key: 'thuy-san', label: 'Thủy sản' },
  ],
  organic: [
    { key: 'cay-trong', label: 'Cây trồng' },
    { key: 'chan-nuoi', label: 'Chăn nuôi' },
    { key: 'thuy-san', label: 'Thủy sản' },
  ],
  smart: [
    { key: 'rau-cu-qua', label: 'Rau củ quả' },
    { key: 'lua', label: 'Lúa' },
    { key: 'chan-nuoi', label: 'Chăn nuôi' },
  ],
};

export const STATUS_OPTIONS = [
  { key: 'all', label: 'Tất cả', color: '#6b7280' },
  { key: 'Draft', label: 'Nháp', color: '#3b82f6' },
  { key: 'Submitted', label: 'Chờ duyệt', color: '#f59e0b' },
  { key: 'Verified', label: 'Đã duyệt', color: '#22c55e' },
  { key: 'Locked', label: 'Khóa', color: '#ef4444' },
];

export const SORT_OPTIONS = [
  { key: 'newest', label: 'Mới nhất', field: 'createdAt', order: 'desc' },
  { key: 'oldest', label: 'Cũ nhất', field: 'createdAt', order: 'asc' },
  { key: 'name-asc', label: 'Tên A-Z', field: 'schemaName', order: 'asc' },
  { key: 'name-desc', label: 'Tên Z-A', field: 'schemaName', order: 'desc' },
];
```

#### 1.2 Update JournalListScreen.js

```javascript
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';
import { CATEGORIES, SUB_CATEGORIES, STATUS_OPTIONS, SORT_OPTIONS } from '../constants/categories';

export default function JournalListScreen({ navigation }) {
  // State
  const [activeCategory, setActiveCategory] = useState('vietgap');
  const [activeSubCategory, setActiveSubCategory] = useState('trong-trot');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch schemas (filtered by category & subCategory)
  const { data: schemas, isLoading: schemasLoading } = useQuery({
    queryKey: ['schemas', activeCategory, activeSubCategory],
    queryFn: async () => {
      const { data } = await api.get('/schemas', {
        params: {
          category: activeCategory,
          subCategory: activeSubCategory,
        }
      });
      return data.data;
    },
  });

  // Fetch journals (with filters)
  const { 
    data: journals, 
    isLoading: journalsLoading,
    refetch,
    isRefreshing
  } = useQuery({
    queryKey: ['journals', activeCategory, activeSubCategory, statusFilter, sortBy, searchQuery],
    queryFn: async () => {
      const params = {
        category: activeCategory,
        subCategory: activeSubCategory,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      // Sort
      const sortOption = SORT_OPTIONS.find(s => s.key === sortBy);
      if (sortOption) {
        params.sortBy = sortOption.field;
        params.sortOrder = sortOption.order;
      }
      
      const { data } = await api.get('/journals', { params });
      return data.data;
    },
  });

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleCategoryChange = (categoryKey) => {
    setActiveCategory(categoryKey);
    setActiveSubCategory(SUB_CATEGORIES[categoryKey][0].key);
  };

  const handleCreateJournal = (schema) => {
    navigation.navigate('JournalEntry', {
      schemaId: schema._id,
      category: activeCategory,
      subCategory: activeSubCategory,
    });
  };

  const handleViewJournal = (journal) => {
    navigation.navigate('JournalEntry', {
      journalId: journal._id,
      schemaId: journal.schemaId?._id || journal.schemaId,
    });
  };

  const renderCategoryTab = (category) => {
    const isActive = activeCategory === category.key;
    return (
      <TouchableOpacity
        key={category.key}
        style={[
          styles.categoryTab,
          isActive && { ...styles.categoryTabActive, borderBottomColor: category.color }
        ]}
        onPress={() => handleCategoryChange(category.key)}
      >
        <Feather 
          name={category.icon} 
          size={18} 
          color={isActive ? category.color : '#9ca3af'} 
        />
        <Text style={[
          styles.categoryTabText,
          isActive && { ...styles.categoryTabTextActive, color: category.color }
        ]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSubCategoryChip = (subCat) => {
    const isActive = activeSubCategory === subCat.key;
    return (
      <TouchableOpacity
        key={subCat.key}
        style={[
          styles.subCategoryChip,
          isActive && styles.subCategoryChipActive
        ]}
        onPress={() => setActiveSubCategory(subCat.key)}
      >
        <Text style={[
          styles.subCategoryChipText,
          isActive && styles.subCategoryChipTextActive
        ]}>
          {subCat.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhật ký..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
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
          onPress={() => {
            // Cycle through sort options
            const currentIndex = SORT_OPTIONS.findIndex(s => s.key === sortBy);
            const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
            setSortBy(SORT_OPTIONS[nextIndex].key);
          }}
        >
          <Feather name="arrow-down" size={18} color="#6b7280" />
          <Text style={styles.filterButtonText}>
            {SORT_OPTIONS.find(s => s.key === sortBy)?.label}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFiltersPanel = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersPanel}>
        <Text style={styles.filtersPanelTitle}>Trạng thái</Text>
        <View style={styles.statusFilters}>
          {STATUS_OPTIONS.map(status => (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.statusFilterChip,
                statusFilter === status.key && {
                  ...styles.statusFilterChipActive,
                  backgroundColor: `${status.color}20`,
                  borderColor: status.color,
                }
              ]}
              onPress={() => setStatusFilter(status.key)}
            >
              <Text style={[
                styles.statusFilterText,
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
    );
  };

  const renderSchemaCard = ({ item: schema }) => (
    <TouchableOpacity
      style={styles.schemaCard}
      onPress={() => handleCreateJournal(schema)}
    >
      <View style={styles.schemaCardHeader}>
        <View style={[styles.schemaIcon, { backgroundColor: `${CATEGORIES[activeCategory]?.color}20` }]}>
          <Feather name="file-text" size={24} color={CATEGORIES[activeCategory]?.color} />
        </View>
        <View style={styles.schemaInfo}>
          <Text style={styles.schemaName} numberOfLines={2}>
            {schema.name}
          </Text>
          <Text style={styles.schemaCategory}>
            {CATEGORIES[activeCategory]?.label} - {SUB_CATEGORIES[activeCategory].find(s => s.key === activeSubCategory)?.label}
          </Text>
        </View>
        <Feather name="plus-circle" size={20} color="#22c55e" />
      </View>
    </TouchableOpacity>
  );

  const renderJournalCard = ({ item: journal }) => {
    const statusOption = STATUS_OPTIONS.find(s => s.key === journal.status);
    
    return (
      <TouchableOpacity
        style={styles.journalCard}
        onPress={() => handleViewJournal(journal)}
      >
        <View style={styles.journalCardHeader}>
          <View style={styles.journalIcon}>
            <Feather name="book-open" size={20} color="#6b7280" />
          </View>
          <View style={styles.journalInfo}>
            <Text style={styles.journalName} numberOfLines={2}>
              {journal.schemaId?.name || 'Không có tên'}
            </Text>
            <Text style={styles.journalCategory}>
              {CATEGORIES[activeCategory]?.label} - {SUB_CATEGORIES[activeCategory].find(s => s.key === activeSubCategory)?.label}
            </Text>
            <View style={styles.journalMeta}>
              <Feather name="calendar" size={12} color="#9ca3af" />
              <Text style={styles.journalDate}>
                {new Date(journal.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusOption?.color}20` }]}>
            <Text style={[styles.statusBadgeText, { color: statusOption?.color }]}>
              {statusOption?.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (schemasLoading || journalsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhật ký sản xuất</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {Object.values(CATEGORIES).map(renderCategoryTab)}
      </View>

      {/* Sub-Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.subCategoryScroll}
        contentContainerStyle={styles.subCategoryContent}
      >
        {SUB_CATEGORIES[activeCategory]?.map(renderSubCategoryChip)}
      </ScrollView>

      {/* Filter Bar */}
      {renderFilterBar()}

      {/* Filters Panel */}
      {renderFiltersPanel()}

      {/* Content */}
      <FlatList
        data={journals}
        keyExtractor={(item) => item._id}
        renderItem={renderJournalCard}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            colors={['#22c55e']}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tạo nhật ký mới</Text>
              <Text style={styles.sectionSubtitle}>Chọn biểu mẫu phù hợp</Text>
            </View>
            <FlatList
              data={schemas}
              keyExtractor={(item) => item._id}
              renderItem={renderSchemaCard}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Feather name="inbox" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyStateText}>Chưa có biểu mẫu nào</Text>
                </View>
              }
            />
            <View style={styles.sectionDivider} />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nhật ký của bạn</Text>
              <Text style={styles.sectionSubtitle}>
                {journals?.length || 0} nhật ký
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          schemas?.length > 0 && (
            <View style={styles.emptyState}>
              <Feather name="book" size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateText}>Chưa có nhật ký nào</Text>
              <Text style={styles.emptyStateSubtext}>
                Bắt đầu tạo nhật ký đầu tiên của bạn
              </Text>
            </View>
          )
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// Styles will be provided in next message...
```

Tôi đã tạo:
1. **Document phân tích chi tiết** (MOBILE_WEB_SYNC_ROADMAP.md) - 9 features chính cần implement
2. **Implementation guide** bắt đầu với Multi-Category Journal System

**Next steps**:
1. Tạo file constants/categories.js
2. Update JournalListScreen với đầy đủ styles
3. Test category filtering
4. Implement Phase 1.2: Reports Screen
5. Implement Phase 1.3: HTX features

Bạn muốn tôi tiếp tục implement không? Hoặc bạn muốn tôi giải thích chi tiết về roadmap trước?