import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

export default function NewsListScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [refreshing, setRefreshing] = useState(false);

  const { data: newsItems = [], isLoading, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data } = await api.get('/news');
      return data.data;
    },
  });

  const categories = ['Tất cả', ...new Set(newsItems.map(item => item.category))];
  const filteredNews = selectedCategory !== 'Tất cả'
    ? newsItems.filter(n => n.category === selectedCategory)
    : newsItems;

  const getFallbackImage = (category) => {
    if (category === 'Công nghệ') return 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80';
    if (category === 'Thị trường') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (isLoading) {
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin tức</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.categoryTab,
              selectedCategory === cat && styles.categoryTabActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News List */}
      <ScrollView
        style={styles.newsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22c55e']} />
        }
      >
        {filteredNews.length > 0 ? (
          filteredNews.map((news, index) => (
            <TouchableOpacity
              key={news._id || index}
              style={styles.newsCard}
              onPress={() => navigation.navigate('NewsDetail', { newsId: news._id })}
            >
              <Image
                source={{ uri: news.image || getFallbackImage(news.category) }}
                style={styles.newsImage}
                resizeMode="cover"
              />
              <View style={styles.newsContent}>
                <View style={styles.newsHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{news.category}</Text>
                  </View>
                  <Text style={styles.newsDate}>{formatDate(news.publishedAt)}</Text>
                </View>
                <Text style={styles.newsTitle} numberOfLines={2}>
                  {news.title}
                </Text>
                <Text style={styles.newsSummary} numberOfLines={3}>
                  {news.summary}
                </Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.readMore}>Đọc thêm</Text>
                  <Feather name="arrow-right" size={16} color="#22c55e" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Chưa có tin tức nào</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    height: 48,
    maxHeight: 48,
  },
  categoryContent: {
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 8,
  },
  categoryTab: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#22c55e',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#fff',
  },
  newsList: {
    flex: 1,
    padding: 14,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 148,
    backgroundColor: '#f3f4f6',
  },
  newsContent: {
    padding: 12,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  newsDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 21,
  },
  newsSummary: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});
