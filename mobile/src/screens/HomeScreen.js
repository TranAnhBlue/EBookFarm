import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Image, Dimensions, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [invCount, setInvCount] = useState(0);
  const [supplyPending, setSupplyPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);

  const fetchData = async () => {
    try {
      const [statsRes, newsRes, invRes, supplyRes] = await Promise.all([
        api.get('/reports/dashboard-stats'),
        api.get('/news'),
        api.get('/inventory').catch(() => ({ data: { data: [] } })),
        api.get('/supply-requests').catch(() => ({ data: { data: [] } })),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (newsRes.data?.success)  setNews(newsRes.data.data.slice(0, 5));
      if (invRes.data?.data)      setInvCount(invRes.data.data.length);
      if (supplyRes.data?.data)   setSupplyPending(supplyRes.data.data.filter(r => r.status === 'Pending').length);
    } catch (error) {
      console.error('Home Screen Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const quickActions = [
    { id: 'scan',      title: 'Tra cứu QR',     icon: 'maximize',       color: '#3b82f6', route: 'Scanner'   },
    { id: 'journals',  title: 'Nhật ký',         icon: 'book',           color: '#16a34a', route: 'Journals'  },
    { id: 'inventory', title: 'Kho vật tư',      icon: 'package',        color: '#f97316', route: 'Inventory' },
    { id: 'supply',    title: 'Xin cấp vật tư',  icon: 'shopping-bag',   color: '#8b5cf6', route: 'Supply'    },
    { id: 'ai',        title: 'Hỏi AI',          icon: 'cpu',            color: '#0891b2', route: 'AI'        },
  ];

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Upper Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.userName}>{user?.fullname || user?.username || 'Nông dân'}</Text>
          </View>
          <View style={styles.notificationBadge}>
            <Feather name="bell" size={24} color="#1e293b" />
          </View>
        </View>

        {/* Dynamic Weather Card */}
        <View style={styles.weatherCard}>
          <View>
            <Text style={styles.tempText}>31°C</Text>
            <Text style={styles.weatherCondition}>Nắng nhẹ • Thời tiết tốt cho thu hoạch</Text>
          </View>
          <Feather name="sun" size={40} color="#fbbf24" />
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Stats Section */}
        <Text style={styles.sectionTitle}>Tổng quan sản xuất</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats?.totalJournals || 0}</Text>
            <Text style={styles.statLabel}>Tổng nhật ký</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#f1f5f9' }]}>
            <Text style={[styles.statNumber, { color: '#16a34a' }]}>{stats?.completedJournals || 0}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#f1f5f9' }]}>
            <Text style={[styles.statNumber, { color: '#f97316' }]}>{invCount}</Text>
            <Text style={styles.statLabel}>Loại vật tư</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#f1f5f9' }]}>
            <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>{supplyPending}</Text>
            <Text style={styles.statLabel}>Đơn chờ</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Lối tắt nhanh</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={() => navigation.navigate(action.route)}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.color + '15' }]}>
                <Feather name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* News Feed Horizontal Section */}
        <View style={styles.newsHeader}>
          <Text style={styles.sectionTitle}>Tin tức nông nghiệp mới nhất</Text>
          <TouchableOpacity onPress={() => navigation.navigate('NewsList')}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        
        {news.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có tin tức nào được cập nhật.</Text>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={news}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.newsCard}
                onPress={() => navigation.navigate('NewsDetail', { newsId: item._id })}
              >
                <Image 
                  source={{ uri: item.image || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500' }} 
                  style={styles.newsImage} 
                />
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.newsMeta}>
                    {new Date(item.publishedAt || item.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.newsList}
          />
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerBlock: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 25,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  notificationBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#065f46',
  },
  weatherCondition: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 25,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  actionButton: {
    width: '18%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  newsList: {
    paddingRight: 20,
  },
  newsCard: {
    width: width * 0.65,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  newsImage: {
    width: '100%',
    height: 120,
  },
  newsContent: {
    padding: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 6,
  },
  newsMeta: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  }
});
