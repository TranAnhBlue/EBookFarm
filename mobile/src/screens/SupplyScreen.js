import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, Alert, SafeAreaView, Modal,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';

const CATEGORIES = ['Phân bón', 'Thuốc BVTV', 'Giống', 'Dụng cụ', 'Khác'];

const STATUS_CFG = {
  Pending:  { label: 'Chờ duyệt', color: '#f97316', bg: '#fff7ed', icon: 'clock' },
  Approved: { label: 'Đã duyệt',  color: '#16a34a', bg: '#f0fdf4', icon: 'check-circle' },
  Rejected: { label: 'Từ chối',   color: '#ef4444', bg: '#fef2f2', icon: 'x-circle' },
};

export default function SupplyScreen() {
  const user = useAuthStore((state) => state.user);

  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setFilter]   = useState('all');

  // HTX Request modal
  const [htxModal, setHtxModal]   = useState(false);
  const [htxList, setHtxList]     = useState([]);
  const [items, setItems]         = useState([{ itemName: '', category: '', quantity: '', unit: '' }]);
  const [reason, setReason]       = useState('');
  const [selectedHtx, setSelectedHtx] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  // External declare modal
  const [extModal, setExtModal]         = useState(false);
  const [extForm, setExtForm]           = useState({ name: '', category: '', quantity: '', unit: '' });
  const [extSubmitting, setExtSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/supply-requests');
      if (data.success) setRequests(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchHtxList = async () => {
    try {
      const [profileRes, htxRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/htx-list'),
      ]);
      const myHtxId = profileRes.data?.data?.htxId;
      if (myHtxId && htxRes.data?.success) {
        const myHtx = htxRes.data.data.filter(h =>
          h._id.toString() === (typeof myHtxId === 'object' ? myHtxId._id : myHtxId).toString()
        );
        setHtxList(myHtx);
        if (myHtx.length > 0) setSelectedHtx(myHtx[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchHtxList();
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchRequests(); };

  const filtered = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  const approved = requests.filter(r => r.status === 'Approved').length;
  const pending  = requests.filter(r => r.status === 'Pending').length;

  // ── Add item row ──
  const addItemRow = () => setItems(p => [...p, { itemName: '', category: '', quantity: '', unit: '' }]);
  const removeItemRow = (idx) => setItems(p => p.filter((_, i) => i !== idx));
  const updateItem = (idx, field, val) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, [field]: val } : it));

  // ── Submit HTX Request ──
  const handleHtxSubmit = async () => {
    if (!selectedHtx) { Alert.alert('Lỗi', 'Bạn chưa được gán vào HTX nào.'); return; }
    const invalid = items.some(i => !i.itemName || !i.category || !i.quantity);
    if (invalid) { Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ vật tư cần xin.'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/supply-requests', {
        htxId: selectedHtx,
        reason,
        items: items.map(i => ({ ...i, quantity: Number(i.quantity) })),
      });
      if (data.success) {
        Alert.alert('Thành công', 'Đã gửi đơn yêu cầu tới HTX!');
        setHtxModal(false);
        setItems([{ itemName: '', category: '', quantity: '', unit: '' }]);
        setReason('');
        fetchRequests();
      }
    } catch (e) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi đơn');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit External ──
  const handleExtSubmit = async () => {
    if (!extForm.name || !extForm.category || !extForm.quantity || !extForm.unit) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin vật tư.');
      return;
    }
    const htxId = typeof user?.htxId === 'object' ? user?.htxId?._id : user?.htxId;
    if (!htxId) { Alert.alert('Lỗi', 'Bạn chưa được gán vào HTX nào.'); return; }
    setExtSubmitting(true);
    try {
      await api.post('/supply-requests', {
        htxId,
        reason: 'Khai báo vật tư mua ngoài (Tự túc)',
        isExternalPurchase: true,
        items: [{ itemName: extForm.name, category: extForm.category, quantity: Number(extForm.quantity), unit: extForm.unit }],
      });
      Alert.alert('Thành công', 'Đã gửi khai báo mua ngoài! Chờ HTX phê duyệt.');
      setExtModal(false);
      setExtForm({ name: '', category: '', quantity: '', unit: '' });
      fetchRequests();
    } catch (e) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi khai báo');
    } finally {
      setExtSubmitting(false);
    }
  };

  // ── Cancel request ──
  const handleCancel = (id) => {
    Alert.alert('Xác nhận hủy', 'Bạn muốn hủy đơn yêu cầu này?', [
      { text: 'Quay lại', style: 'cancel' },
      {
        text: 'Hủy đơn', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/supply-requests/${id}`);
            fetchRequests();
          } catch (e) {
            Alert.alert('Lỗi', e.response?.data?.message || 'Không thể hủy đơn');
          }
        }
      }
    ]);
  };

  const renderRequest = ({ item }) => {
    const cfg = STATUS_CFG[item.status] || STATUS_CFG.Pending;
    return (
      <View style={styles.card}>
        {/* Status */}
        <View style={styles.cardTop}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Feather name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {item.isExternalPurchase && (
            <View style={styles.extBadge}>
              <Text style={styles.extBadgeText}>🛒 Tự mua</Text>
            </View>
          )}
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        {/* Items */}
        <View style={styles.itemsContainer}>
          {(item.items || []).map((it, idx) => (
            <View key={idx} style={styles.itemChip}>
              <Text style={styles.itemChipText}>
                {it.itemName} ×{it.quantity} {it.unit}
              </Text>
            </View>
          ))}
        </View>

        {/* HTX name */}
        <View style={styles.htxRow}>
          <Feather name="users" size={12} color="#94a3b8" />
          <Text style={styles.htxText}>{item.htx?.fullname || item.htx?.username || 'HTX'}</Text>
        </View>

        {/* Feedback */}
        {item.htxFeedback && (
          <View style={styles.feedbackBox}>
            <Feather name="message-square" size={12} color="#f97316" />
            <Text style={styles.feedbackText}>{item.htxFeedback}</Text>
          </View>
        )}

        {/* Cancel button */}
        {item.status === 'Pending' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item._id)}>
            <Text style={styles.cancelBtnText}>Hủy đơn</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Xin cấp vật tư</Text>
          <Text style={styles.headerSub}>Gửi đơn tới HTX hoặc khai báo mua ngoài</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
          <Text style={[styles.statNum, { color: '#16a34a' }]}>{approved}</Text>
          <Text style={styles.statLbl}>Đã nhận</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fff7ed' }]}>
          <Text style={[styles.statNum, { color: '#f97316' }]}>{pending}</Text>
          <Text style={styles.statLbl}>Chờ duyệt</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsBtnRow}>
        <TouchableOpacity style={styles.extBtn} onPress={() => setExtModal(true)}>
          <Feather name="shopping-cart" size={16} color="#f97316" />
          <Text style={styles.extBtnText}>Khai báo mua ngoài</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.htxBtn} onPress={() => setHtxModal(true)}>
          <Feather name="send" size={16} color="#fff" />
          <Text style={styles.htxBtnText}>Tạo đơn yêu cầu</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {['all', 'Pending', 'Approved', 'Rejected'].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, statusFilter === s && styles.chipActive]}
            onPress={() => setFilter(s)}
          >
            <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
              {s === 'all' ? 'Tất cả' : STATUS_CFG[s]?.label || s}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 16 }} />
      </ScrollView>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i._id}
          renderItem={renderRequest}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="shopping-bag" size={44} color="#e2e8f0" />
              <Text style={styles.emptyText}>Chưa có đơn yêu cầu nào</Text>
            </View>
          }
        />
      )}

      {/* ── HTX Request Modal ── */}
      <Modal visible={htxModal} animationType="slide" transparent onRequestClose={() => setHtxModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Gửi đơn xin cấp vật tư</Text>
                <TouchableOpacity onPress={() => setHtxModal(false)}>
                  <Feather name="x" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {htxList.length === 0 ? (
                  <View style={styles.noHtxBox}>
                    <Feather name="alert-circle" size={32} color="#94a3b8" />
                    <Text style={styles.noHtxText}>Bạn chưa được gán vào HTX nào.{'\n'}Liên hệ HTX để được thêm vào.</Text>
                  </View>
                ) : (
                  <>
                    {/* HTX */}
                    <Text style={styles.formLabel}>HTX tiếp nhận</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                      {htxList.map(h => (
                        <TouchableOpacity
                          key={h._id}
                          style={[styles.selectChip, selectedHtx === h._id && styles.selectChipActive]}
                          onPress={() => setSelectedHtx(h._id)}
                        >
                          <Text style={[styles.selectChipText, selectedHtx === h._id && styles.selectChipTextActive]}>
                            {h.fullname || h.username}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Items */}
                    <Text style={styles.formLabel}>Danh sách vật tư cần xin</Text>
                    {items.map((it, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <TextInput
                          style={[styles.formInput, { flex: 2 }]}
                          placeholder="Tên vật tư..."
                          value={it.itemName}
                          onChangeText={v => updateItem(idx, 'itemName', v)}
                        />
                        <TextInput
                          style={[styles.formInput, { flex: 1, marginLeft: 8 }]}
                          placeholder="Số lượng"
                          keyboardType="numeric"
                          value={it.quantity}
                          onChangeText={v => updateItem(idx, 'quantity', v)}
                        />
                        {items.length > 1 && (
                          <TouchableOpacity onPress={() => removeItemRow(idx)} style={styles.removeBtn}>
                            <Feather name="x" size={16} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addRowBtn} onPress={addItemRow}>
                      <Feather name="plus" size={16} color="#16a34a" />
                      <Text style={styles.addRowText}>Thêm vật tư khác</Text>
                    </TouchableOpacity>

                    {/* Reason */}
                    <Text style={[styles.formLabel, { marginTop: 16 }]}>Lý do xin cấp (tùy chọn)</Text>
                    <TextInput
                      style={[styles.formInput, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                      placeholder="Mô tả mục đích sử dụng..."
                      multiline
                      value={reason}
                      onChangeText={setReason}
                    />

                    <TouchableOpacity
                      style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                      onPress={handleHtxSubmit}
                      disabled={submitting}
                    >
                      {submitting
                        ? <ActivityIndicator color="#fff" />
                        : <><Feather name="send" size={18} color="#fff" /><Text style={styles.submitBtnText}>Gửi yêu cầu ngay</Text></>
                      }
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── External Declare Modal ── */}
      <Modal visible={extModal} animationType="slide" transparent onRequestClose={() => setExtModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Khai báo hàng mua ngoài</Text>
                <TouchableOpacity onPress={() => setExtModal(false)}>
                  <Feather name="x" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                <Text style={styles.formLabel}>Tên vật tư / Hàng hóa</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="VD: Phân NPK 20-20-15..."
                  value={extForm.name}
                  onChangeText={v => setExtForm(f => ({ ...f, name: v }))}
                />

                <Text style={styles.formLabel}>Phân loại</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.selectChip, extForm.category === cat && styles.selectChipActive]}
                      onPress={() => setExtForm(f => ({ ...f, category: cat }))}
                    >
                      <Text style={[styles.selectChipText, extForm.category === cat && styles.selectChipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Số lượng</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="VD: 50"
                      keyboardType="numeric"
                      value={extForm.quantity}
                      onChangeText={v => setExtForm(f => ({ ...f, quantity: v }))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Đơn vị</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="kg, lít, bao..."
                      value={extForm.unit}
                      onChangeText={v => setExtForm(f => ({ ...f, unit: v }))}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: '#f97316' }, extSubmitting && { opacity: 0.6 }]}
                  onPress={handleExtSubmit}
                  disabled={extSubmitting}
                >
                  {extSubmitting
                    ? <ActivityIndicator color="#fff" />
                    : <><Feather name="check" size={18} color="#fff" /><Text style={styles.submitBtnText}>Gửi khai báo</Text></>
                  }
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    padding: 20, paddingTop: 50, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  headerSub:   { fontSize: 12, color: '#94a3b8', marginTop: 3 },

  statsRow: { flexDirection: 'row', padding: 14, gap: 14 },
  statCard: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  statNum:  { fontSize: 30, fontWeight: 'bold', color: '#1e293b' },
  statLbl:  { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '500' },

  actionsBtnRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, marginBottom: 10 },
  extBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#f97316', borderRadius: 12, paddingVertical: 12,
    backgroundColor: '#fff7ed',
  },
  extBtnText: { color: '#f97316', fontWeight: 'bold', fontSize: 13 },
  htxBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 12,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  htxBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  chipScroll: { paddingLeft: 14, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  chipActive: { backgroundColor: '#16a34a' },
  chipText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  list: { padding: 14 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  extBadge: { backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  extBadgeText: { fontSize: 11, color: '#f97316', fontWeight: 'bold' },
  dateText: { marginLeft: 'auto', fontSize: 11, color: '#94a3b8' },

  itemsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  itemChip: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  itemChipText: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },

  htxRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  htxText: { fontSize: 12, color: '#64748b' },

  feedbackBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff7ed', borderRadius: 8, padding: 8, marginBottom: 6 },
  feedbackText: { flex: 1, fontSize: 12, color: '#f97316', fontStyle: 'italic' },

  cancelBtn: { alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fef2f2' },
  cancelBtnText: { fontSize: 12, color: '#ef4444', fontWeight: 'bold' },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#94a3b8', fontSize: 14, marginTop: 12 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },

  formLabel: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  formInput: { backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1e293b', marginBottom: 14 },

  selectChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  selectChipActive: { backgroundColor: '#16a34a' },
  selectChipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  selectChipTextActive: { color: '#fff' },

  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  removeBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  addRowBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
  addRowText: { color: '#16a34a', fontWeight: 'bold', fontSize: 14 },

  submitBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#16a34a', borderRadius: 14, padding: 16, marginTop: 8, gap: 8 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  noHtxBox: { alignItems: 'center', paddingVertical: 40 },
  noHtxText: { color: '#94a3b8', fontSize: 14, marginTop: 12, textAlign: 'center', lineHeight: 22 },
});
