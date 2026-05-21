import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Alert, SafeAreaView, Modal, ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';

const STATUS_CONFIG = {
  Draft:    { label: 'Lưu nháp',   color: '#3b82f6', bg: '#eff6ff' },
  Submitted:{ label: 'Chờ duyệt',  color: '#f97316', bg: '#fff7ed' },
  Verified: { label: 'Đã duyệt',   color: '#16a34a', bg: '#f0fdf4' },
  Locked:   { label: 'Đã khóa',    color: '#6b7280', bg: '#f9fafb' },
};

function StatusBadge({ status, feedback }) {
  // "Cần sửa" nếu có feedback và đang nháp
  if (feedback && (status === 'Draft')) {
    return (
      <View style={[styles.badge, { backgroundColor: '#fef2f2' }]}>
        <Feather name="alert-circle" size={11} color="#ef4444" />
        <Text style={[styles.badgeText, { color: '#ef4444' }]}>CẦN SỬA LẠI</Text>
      </View>
    );
  }
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
    </View>
  );
}

export default function JournalListScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);

  const [journals, setJournals]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [typeFilter, setType]       = useState('all');

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailJournal, setDetailJournal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ─── Schemas for creating new journal ───
  const [schemas, setSchemas]             = useState([]);
  const [schemaModal, setSchemaModal]     = useState(false);
  const [creatingId, setCreatingId]       = useState(null);

  const fetchJournals = async () => {
    try {
      const { data } = await api.get('/journals');
      if (data.success) setJournals(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSchemas = async () => {
    try {
      const { data } = await api.get('/schemas');
      if (data.success) setSchemas(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJournals();
    fetchSchemas();
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchJournals(); };

  // ─── Filter ───
  const filtered = journals.filter(j => {
    const name  = (j.schemaId?.name || '').toLowerCase();
    const qr    = (j.qrCode || '').toLowerCase();
    const sText = search.toLowerCase();
    if (search && !name.includes(sText) && !qr.includes(sText)) return false;
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (typeFilter === 'personal' &&  j.htxJournalId) return false;
    if (typeFilter === 'htx'     && !j.htxJournalId) return false;
    return true;
  });

  // ─── Open Detail ───
  const openDetail = async (id) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/journals/${id}`);
      if (data.success) setDetailJournal(data.data);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết nhật ký');
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Submit for approval ───
  const handleSubmit = async (id) => {
    Alert.alert('Xác nhận', 'Gửi nhật ký lên để duyệt?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Gửi duyệt', style: 'default',
        onPress: async () => {
          try {
            await api.put(`/journals/${id}`, { status: 'Submitted' });
            Alert.alert('Thành công', 'Đã gửi nhật ký để duyệt!');
            fetchJournals();
          } catch (e) {
            Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi duyệt');
          }
        }
      }
    ]);
  };

  // ─── Create new journal ───
  const handleCreate = async (schemaId) => {
    setCreatingId(schemaId);
    try {
      const { data } = await api.post('/journals', { schemaId, status: 'Draft' });
      if (data.success) {
        Alert.alert('Thành công', 'Đã tạo sổ nhật ký mới!');
        setSchemaModal(false);
        fetchJournals();
      }
    } catch (e) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tạo sổ');
    } finally {
      setCreatingId(null);
    }
  };

  const CATEGORY_COLORS = {
    trongtrot:       { color: '#16a34a', label: 'VietGAP Trồng trọt' },
    channuoi:        { color: '#f97316', label: 'VietGAHP Chăn nuôi' },
    thuysan:         { color: '#3b82f6', label: 'VietGAP Thủy sản'   },
    huuco:           { color: '#8b5cf6', label: 'Hữu cơ'             },
    huuco_caytrong:  { color: '#7c3aed', label: 'Hữu cơ - Cây trồng' },
    huuco_channuoi:  { color: '#db2777', label: 'Hữu cơ - Chăn nuôi' },
    huuco_thuysan:   { color: '#0284c7', label: 'Hữu cơ - Thủy sản'  },
    thongminh:       { color: '#0891b2', label: 'Nông nghiệp Thông minh' },
  };

  const renderJournal = ({ item }) => {
    const cat = CATEGORY_COLORS[item.schemaId?.category] || { color: '#16a34a', label: '' };
    return (
      <TouchableOpacity style={styles.card} onPress={() => openDetail(item._id)} activeOpacity={0.85}>
        {/* Left accent bar */}
        <View style={[styles.cardAccent, { backgroundColor: cat.color }]} />

        <View style={styles.cardBody}>
          {/* Header row */}
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardSchemaName, { color: cat.color }]} numberOfLines={1}>
              {item.schemaId?.name || 'Nhật ký'}
            </Text>
            <StatusBadge status={item.status} feedback={item.feedback} />
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            <Feather name={item.htxJournalId ? 'users' : 'user'} size={12} color="#94a3b8" />
            <Text style={styles.metaText}>
              {item.htxJournalId ? 'Sổ HTX liên kết' : 'Sổ cá nhân'}
            </Text>
            <Text style={styles.metaDot}>·</Text>
            <Feather name="calendar" size={12} color="#94a3b8" />
            <Text style={styles.metaText}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          {/* Feedback warning */}
          {item.feedback && item.status === 'Draft' && (
            <View style={styles.feedbackBox}>
              <Feather name="alert-triangle" size={12} color="#ef4444" />
              <Text style={styles.feedbackText} numberOfLines={2}>{item.feedback}</Text>
            </View>
          )}

          {/* Progress bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${item.progress || 0}%`, backgroundColor: cat.color }]} />
            </View>
            <Text style={styles.progressLabel}>{item.progress || 0}%</Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {item.status === 'Draft' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#fef3c7' }]}
                onPress={() => handleSubmit(item._id)}
              >
                <Feather name="send" size={13} color="#d97706" />
                <Text style={[styles.actionBtnText, { color: '#d97706' }]}>Gửi duyệt</Text>
              </TouchableOpacity>
            )}
            {(item.status === 'Verified' || item.status === 'Locked') && item.qrCode && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#f0fdf4' }]}
                onPress={() => navigation.navigate('TraceDetail', { qrCode: item.qrCode })}
              >
                <Feather name="maximize" size={13} color="#16a34a" />
                <Text style={[styles.actionBtnText, { color: '#16a34a' }]}>QR Code</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#f1f5f9' }]}
              onPress={() => openDetail(item._id)}
            >
              <Feather name="eye" size={13} color="#64748b" />
              <Text style={[styles.actionBtnText, { color: '#64748b' }]}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Sổ nhật ký sản xuất</Text>
          <Text style={styles.headerSub}>{filtered.length} sổ · {user?.fullname || user?.username}</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => setSchemaModal(true)}>
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search + Filter row */}
      <View style={styles.filterArea}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên sổ, mã QR..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['all','Draft','Submitted','Verified','Locked'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, statusFilter === s && styles.chipActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
                {s === 'all' ? 'Tất cả' : STATUS_CONFIG[s]?.label || s}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={{ width: 16 }} />
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i._id}
          renderItem={renderJournal}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="book" size={48} color="#e2e8f0" />
              <Text style={styles.emptyText}>Chưa có sổ nhật ký nào</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setSchemaModal(true)}>
                <Text style={styles.emptyBtnText}>Tạo sổ đầu tiên</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* ── Schema picker modal ── */}
      <Modal visible={schemaModal} animationType="slide" transparent onRequestClose={() => setSchemaModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn loại sổ nhật ký</Text>
              <TouchableOpacity onPress={() => setSchemaModal(false)}>
                <Feather name="x" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={schemas}
              keyExtractor={s => s._id}
              renderItem={({ item: s }) => {
                const cat = CATEGORY_COLORS[s.category] || { color: '#16a34a' };
                return (
                  <TouchableOpacity
                    style={styles.schemaItem}
                    onPress={() => handleCreate(s._id)}
                    disabled={creatingId === s._id}
                  >
                    <View style={[styles.schemaIcon, { backgroundColor: cat.color + '18' }]}>
                      <Feather name="file-text" size={20} color={cat.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.schemaName}>{s.name}</Text>
                      <Text style={styles.schemaCat}>{cat.label || s.category || 'Quy trình canh tác'}</Text>
                    </View>
                    {creatingId === s._id
                      ? <ActivityIndicator size="small" color="#16a34a" />
                      : <Feather name="chevron-right" size={18} color="#cbd5e1" />
                    }
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ paddingBottom: 30 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 30 }}>
                  Không có mẫu quy trình nào.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* ── Detail modal ── */}
      <Modal visible={detailVisible} animationType="slide" transparent onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết nhật ký</Text>
              <TouchableOpacity onPress={() => { setDetailVisible(false); setDetailJournal(null); }}>
                <Feather name="x" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            {detailLoading ? (
              <ActivityIndicator size="large" color="#16a34a" style={{ margin: 40 }} />
            ) : detailJournal ? (
              <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Status */}
                <StatusBadge status={detailJournal.status} feedback={detailJournal.feedback} />

                {/* Info rows */}
                {[
                  { label: 'Quy trình', value: detailJournal.schemaId?.name },
                  { label: 'Mã QR', value: detailJournal.qrCode },
                  { label: 'Ngày tạo', value: new Date(detailJournal.createdAt).toLocaleDateString('vi-VN') },
                  { label: 'Số lần sửa', value: `${detailJournal.editCount || 0} lần` },
                  { label: 'Tiến độ', value: `${detailJournal.progress || 0}%` },
                ].map(row => (
                  <View key={row.label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text style={styles.detailValue}>{row.value || '---'}</Text>
                  </View>
                ))}

                {/* Feedback */}
                {detailJournal.feedback && (
                  <View style={styles.feedbackBoxLarge}>
                    <Feather name="alert-circle" size={16} color="#ef4444" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: 4 }}>Phản hồi từ Admin:</Text>
                      <Text style={{ color: '#dc2626' }}>{detailJournal.feedback}</Text>
                    </View>
                  </View>
                )}

                {/* Submit button if Draft */}
                {detailJournal.status === 'Draft' && (
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => { setDetailVisible(false); handleSubmit(detailJournal._id); }}
                  >
                    <Feather name="send" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>Gửi duyệt nhật ký</Text>
                  </TouchableOpacity>
                )}

                {/* QR trace button if verified */}
                {(detailJournal.status === 'Verified' || detailJournal.status === 'Locked') && detailJournal.qrCode && (
                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: '#3b82f6' }]}
                    onPress={() => { setDetailVisible(false); navigation.navigate('TraceDetail', { qrCode: detailJournal.qrCode }); }}
                  >
                    <Feather name="maximize" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>Xem truy xuất QR</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  /* Header */
  header: {
    padding: 20, paddingTop: 50, backgroundColor: '#fff',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  headerSub:   { fontSize: 12, color: '#94a3b8', marginTop: 3 },
  createBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },

  /* Filter */
  filterArea: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9',
    borderRadius: 10, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 12, height: 42,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1e293b' },
  chipScroll:  { paddingLeft: 16, paddingTop: 10 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#f1f5f9', marginRight: 8,
  },
  chipActive:     { backgroundColor: '#16a34a' },
  chipText:       { fontSize: 12, color: '#64748b', fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  /* Card */
  list: { padding: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 14,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardAccent: { width: 4 },
  cardBody:   { flex: 1, padding: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardSchemaName: { fontSize: 15, fontWeight: 'bold', flex: 1, marginRight: 8 },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: 'bold', marginLeft: 3 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metaText: { fontSize: 12, color: '#94a3b8', marginLeft: 4 },
  metaDot:  { fontSize: 12, color: '#cbd5e1', marginHorizontal: 6 },

  feedbackBox: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fef2f2',
    borderRadius: 8, padding: 8, marginBottom: 8,
  },
  feedbackText: { fontSize: 12, color: '#ef4444', marginLeft: 6, flex: 1, fontStyle: 'italic' },

  progressRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  progressTrack:{ flex: 1, height: 4, backgroundColor: '#f1f5f9', borderRadius: 2, marginRight: 8 },
  progressFill: { height: 4, borderRadius: 2 },
  progressLabel:{ fontSize: 11, color: '#94a3b8', fontWeight: '600', width: 30, textAlign: 'right' },

  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionBtnText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyBox:    { alignItems: 'center', marginTop: 60 },
  emptyText:   { color: '#94a3b8', fontSize: 15, marginTop: 12 },
  emptyBtn:    { marginTop: 16, backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText:{ color: '#fff', fontWeight: 'bold' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:  { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },

  schemaItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  schemaIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  schemaName: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  schemaCat:  { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  /* Detail */
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  detailLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#1e293b', fontWeight: 'bold', textAlign: 'right', flex: 1, marginLeft: 16 },

  feedbackBoxLarge: {
    flexDirection: 'row', backgroundColor: '#fef2f2', borderRadius: 12, padding: 14, marginTop: 16,
  },
  submitBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#16a34a', borderRadius: 14, padding: 16, marginTop: 16,
  },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
});
