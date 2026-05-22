import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

export default function NewsDetailScreen({ route, navigation }) {
  const { newsId } = route.params;
  const [liked, setLiked] = useState(false);

  const { data: news, isLoading } = useQuery({
    queryKey: ['news', newsId],
    queryFn: async () => {
      const { data } = await api.get(`/news/${newsId}`);
      return data.data;
    },
  });

  const getFallbackImage = (category) => {
    if (category === 'Công nghệ') return 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80';
    if (category === 'Thị trường') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${news.title}\n\nĐọc thêm tại EBookFarm`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!news) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={64} color="#d1d5db" />
        <Text style={styles.errorText}>Không tìm thấy tin tức</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Feather name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Feather name="share-2" size={20} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.headerButton}>
            <Feather name={liked ? 'heart' : 'heart'} size={20} color={liked ? '#ef4444' : '#1f2937'} fill={liked ? '#ef4444' : 'none'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Featured Image */}
        <Image
          source={{ uri: news.image || getFallbackImage(news.category) }}
          style={styles.featuredImage}
          resizeMode="cover"
        />

        {/* Article Content */}
        <View style={styles.article}>
          {/* Category & Date */}
          <View style={styles.meta}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{news.category}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(news.publishedAt)}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{news.title}</Text>

          {/* Author */}
          <View style={styles.authorSection}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {typeof news.author === 'object' 
                  ? (news.author?.fullname || news.author?.username || 'E')[0].toUpperCase()
                  : 'E'}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {typeof news.author === 'object' 
                  ? (news.author?.fullname || news.author?.username || 'EBookFarm Editor')
                  : (news.author || 'EBookFarm Editor')}
              </Text>
              <Text style={styles.readTime}>6 phút đọc</Text>
            </View>
          </View>

          {/* Summary */}
          <Text style={styles.summary}>{news.summary}</Text>

          {/* Content */}
          <View style={styles.contentSection}>
            {news.content ? (
              news.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <Text key={index} style={styles.paragraph}>
                    {paragraph}
                  </Text>
                )
              ))
            ) : (
              <Text style={styles.noContent}>Nội dung đang được cập nhật...</Text>
            )}
          </View>

          {/* Gallery */}
          {news.gallery && news.gallery.length > 0 && (
            <View style={styles.gallery}>
              {news.gallery.map((imgUrl, idx) => (
                <Image
                  key={idx}
                  source={{ uri: imgUrl }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          {/* Tags */}
          <View style={styles.tags}>
            {['nongnghiepsach', 'congngheso', news.category?.toLowerCase()].map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, liked && styles.actionButtonLiked]}
          onPress={() => setLiked(!liked)}
        >
          <Feather name="heart" size={20} color={liked ? '#fff' : '#22c55e'} fill={liked ? '#fff' : 'none'} />
          <Text style={[styles.actionButtonText, liked && styles.actionButtonTextLiked]}>
            {liked ? 'Đã thích' : 'Thích bài viết'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Feather name="share-2" size={20} color="#22c55e" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: 190,
    backgroundColor: '#f3f4f6',
  },
  article: {
    padding: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 29,
    marginBottom: 16,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInitial: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  readTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  summary: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 23,
    marginBottom: 18,
    fontWeight: '500',
  },
  contentSection: {
    marginBottom: 18,
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 23,
    marginBottom: 12,
  },
  noContent: {
    fontSize: 16,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  gallery: {
    marginBottom: 18,
    gap: 12,
  },
  galleryImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  actionButtonLiked: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  actionButtonTextLiked: {
    color: '#fff',
  },
  shareButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  backButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
