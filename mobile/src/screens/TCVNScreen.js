import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/api';

export default function TCVNScreen() {
  const [tcvns, setTcvns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTCVNs = async (keyword = '') => {
    try {
      setLoading(true);
      const { data } = await api.get(`/tcvn?keyword=${keyword}`);
      if (data.success) {
        setTcvns(data.data || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải tài liệu tiêu chuẩn TCVN.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTCVNs();
  }, []);

  const handleSearch = () => {
    fetchTCVNs(search);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.code}>{item.code}</Text>
        <Feather name="file-text" size={18} color="#16a34a" />
      </View>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.scope} numberOfLines={3}>
        <Text style={{ fontWeight: 'bold' }}>Phạm vi: </Text>
        {item.scope || 'Không có mô tả phạm vi áp dụng.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tiêu chuẩn Quốc gia (TCVN)</Text>
        <Text style={styles.headerSubtitle}>Tra cứu nhanh 35+ tiêu chuẩn truy xuất nguồn gốc</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập mã hoặc tên tiêu chuẩn..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Feather name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Standard List */}
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
      ) : (
        <FlatList
          data={tcvns}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy tiêu chuẩn nào phù hợp.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    height: 46,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#1e293b',
  },
  searchButton: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 22,
  },
  scope: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 50,
    fontSize: 16,
  }
});
