import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/api';

export default function TraceDetailScreen({ route, navigation }) {
  const { qrCode } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraceData = async () => {
      try {
        const res = await api.get(`/journals/qr/${qrCode}`);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy thông tin lô hàng tương ứng.');
          navigation.goBack();
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Không thể kết nối máy chủ để truy xuất.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchTraceData();
  }, [qrCode]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin truy xuất</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Verification Status */}
        <View style={styles.statusBox}>
          <View style={styles.badgeContainer}>
            <Feather name="check-circle" size={40} color="#16a34a" />
            <Text style={styles.badgeText}>Sản Phẩm Đã Được Xác Minh</Text>
          </View>
          <Text style={styles.subtext}>Mã QR nguồn gốc hợp lệ & an toàn</Text>
        </View>

        {/* Product Meta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lô hàng</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Tên nhật ký:</Text>
              <Text style={styles.value}>{data?.title || data?.name || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Hợp tác xã:</Text>
              <Text style={styles.value}>
                {data?.htxJournalId?.htxId?.organization || 'Nhật ký nông hộ cá nhân'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Người canh tác:</Text>
              <Text style={styles.value}>{data?.userId?.fullname || 'Ẩn danh'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ngày bắt đầu:</Text>
              <Text style={styles.value}>
                {data?.startDate ? new Date(data.startDate).toLocaleDateString('vi-VN') : '---'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mã truy xuất:</Text>
              <Text style={[styles.value, { fontFamily: 'monospace', color: '#64748b' }]}>{qrCode}</Text>
            </View>
          </View>
        </View>

        {/* Journey Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành trình canh tác & sản xuất</Text>
          <View style={styles.timelineContainer}>
            {/* Step 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Gieo trồng & Làm đất</Text>
                <Text style={styles.timelineDesc}>Xử lý giá thể, bón lót hữu cơ chuẩn kỹ thuật quốc gia.</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Chăm sóc & Theo dõi</Text>
                <Text style={styles.timelineDesc}>Bón phân vi sinh đúng liều lượng, kiểm soát sâu bệnh sinh học.</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={[styles.timelineItem, { borderLeftColor: 'transparent' }]}>
              <View style={[styles.timelineDot, styles.completedDot]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: '#16a34a' }]}>Thu hoạch & Kiểm định</Text>
                <Text style={styles.timelineDesc}>Thu hoạch đạt chỉ số an toàn thực phẩm, tiến hành đóng gói xuất xưởng.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    paddingRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    padding: 20,
  },
  statusBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 10,
  },
  subtext: {
    fontSize: 13,
    color: '#64748b',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
    marginLeft: 15,
  },
  timelineContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  timelineItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
    paddingLeft: 20,
    paddingBottom: 25,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    position: 'absolute',
    left: -7,
    top: 4,
  },
  completedDot: {
    backgroundColor: '#16a34a',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 5,
  },
  timelineDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});
