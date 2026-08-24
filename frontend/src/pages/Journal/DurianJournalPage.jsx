/**
 * DurianJournalPage.jsx
 * ─────────────────────────────────────────────────────────────────
 * Trang ghi nhật ký sầu riêng VietGAP dành riêng cho nông dân.
 * - Hiển thị đúng FormSchema "Sổ nhật ký Sầu riêng VietGAP & GACC Xuất Khẩu 2026"
 * - Ghi chép thân thiện: chọn tab công việc → điền nhanh → Lưu nháp / Gửi duyệt
 * - Lưu vào /journals API → tạo QR truy xuất nguồn gốc
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

dayjs.locale('vi');

// ─── Preset quick-pick options for each table ────────────────────
const PRESETS = {
  'Nhật ký Chăm sóc': {
    task: ['Tỉa cành tạo tán', 'Tỉa chồi nước', 'Làm cỏ quanh gốc', 'Bao trái', 'Xử lý ra hoa', 'Xiết nước kích hoa', 'Phun bổ sung dinh dưỡng lá', 'Vệ sinh vườn', 'Kiểm tra sinh trưởng', 'Bấm ngọn cành'],
  },
  'Nhật ký Bón phân': {
    fertilizer_name: ['NPK 15-15-15+TE (Đầu Trâu)', 'Phân Hữu Cơ Vi Sinh Trichoderma', 'Canxi Bor (Ca-B) tăng cường đậu trái', 'Kali Clorua (KCl 60%)', 'Phân Urea 46%', 'Phân cá thủy phân (Amino Acid)', 'Magie Sunfat (MgSO4)', 'Phân Super Lân'],
    unit: ['kg/gốc', 'g/gốc', 'lít/gốc', 'ml/gốc', 'kg/ha'],
    method: ['Bón gốc', 'Phun lá', 'Tưới nhỏ giọt qua gốc', 'Vùi đất quanh tán'],
  },
  'Nhật ký Thuốc bảo vệ thực vật (BVTV)': {
    pesticide_name: ['Anvil 5SC (Hexaconazole)', 'Ridomil Gold MZ 68WG (Metalaxyl)', 'Kasumin 2SL (Kasugamycin)', 'Actara 25WG (Thiamethoxam)', 'Confidor 700WG (Imidacloprid)', 'Emamectin Benzoate', 'Trichoderma sinh học', 'Dầu khoáng SK Enspray 99EC'],
    PHI_DAYS: { 'Anvil 5SC (Hexaconazole)': 14, 'Ridomil Gold MZ 68WG (Metalaxyl)': 7, 'Kasumin 2SL (Kasugamycin)': 7, 'Actara 25WG (Thiamethoxam)': 10, 'Confidor 700WG (Imidacloprid)': 10, 'Emamectin Benzoate': 7, 'Trichoderma sinh học': 3, 'Dầu khoáng SK Enspray 99EC': 3 },
  },
  'Nhật ký Tưới nước': {
    water_source: ['Hồ tưới Tân Quan', 'Giếng khoan tại vườn', 'Hệ thống tưới nhỏ giọt HTX', 'Suối tự nhiên'],
    irrigation_method: ['Tưới nhỏ giọt', 'Tưới phun mưa', 'Tưới gốc', 'Tưới tràn'],
  },
  'Nhật ký Sâu bệnh & Xử lý': {
    pest_type: ['Nấm hồng (Corticium salmonicolor)', 'Thối rễ Phytophthora', 'Rệp sáp hại rễ & thân', 'Nhện đỏ hại lá', 'Sâu đục trái', 'Bọ trĩ hại hoa', 'Bệnh thán thư hại trái'],
    severity: ['Nhẹ (Dưới 5%)', 'Trung bình (5–20%)', 'Nặng (Trên 20%)'],
    result: ['Đã kiểm soát hoàn toàn', 'Giảm nhẹ – cần theo dõi thêm', 'Chưa kiểm soát được'],
  },
  'Nhật ký Thu hoạch': {
    crop_variety: ['Monthong', 'Dona', 'TR6'],
    gacc_standard: ['Đạt chuẩn GACC xuất khẩu', 'Đạt tiêu dùng nội địa', 'Loại B (tiêu thụ nội địa)'],
  },
  'Nhật ký Bán hàng & Doanh thu': {
    payment_method: ['Tiền mặt', 'Chuyển khoản ngân hàng', 'Công nợ HTX'],
  },
};

// ─── Tab config: emoji + color per table ─────────────────────────
const TAB_META = {
  'Thông tin vườn sầu riêng':                { emoji: '🏡', color: '#0f766e' },
  'Thông tin lô sản xuất':                   { emoji: '🗺️', color: '#0369a1' },
  'Nhật ký Chăm sóc':                        { emoji: '🌿', color: '#16a34a' },
  'Nhật ký Bón phân':                        { emoji: '🧪', color: '#b45309' },
  'Nhật ký Thuốc bảo vệ thực vật (BVTV)':   { emoji: '🛡️', color: '#7c3aed' },
  'Nhật ký Tưới nước':                       { emoji: '💧', color: '#0284c7' },
  'Nhật ký Sâu bệnh & Xử lý':               { emoji: '🐛', color: '#dc2626' },
  'Nhật ký Thu hoạch':                       { emoji: '🍈', color: '#c2410c' },
  'Nhật ký Bán hàng & Doanh thu':           { emoji: '💰', color: '#0e7490' },
  'Đánh giá Nội bộ VietGAP & GACC':         { emoji: '📋', color: '#475569' },
};

// ─── Durian schema ID (seeded earlier) ────────────────────────────
const DURIAN_SCHEMA_NAME = 'Sổ nhật ký Sầu riêng VietGAP & GACC Xuất Khẩu 2026';

// ─── Helpers ──────────────────────────────────────────────────────
const today = () => dayjs().format('YYYY-MM-DD');

function QuickChips({ options, value, onChange, color }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {options.map(opt => {
        const sel = value === opt;
        return (
          <button key={opt} onClick={() => onChange(sel ? '' : opt)} style={{
            padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${sel ? color : '#e2e8f0'}`,
            background: sel ? color + '18' : '#fff', color: sel ? color : '#475569',
            fontWeight: sel ? 700 : 400, fontSize: 13, cursor: 'pointer', outline: 'none',
            transition: 'all 0.1s',
          }}>
            {sel ? '✓ ' : ''}{opt}
          </button>
        );
      })}
    </div>
  );
}

function FieldInput({ field, value, onChange, color, presets }) {
  const opts = presets?.[field.name];
  const isDate = field.type === 'date';
  const isNum  = field.type === 'number';
  const isTxt  = field.type === 'textarea';
  const isSel  = field.type === 'select' || field.type === 'multi-select';
  const isBool = field.type === 'boolean';

  const inputStyle = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', background: '#fafafa', transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
        {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
      </div>

      {/* Quick chips for common fields */}
      {opts && (
        <QuickChips options={opts} value={value || ''} onChange={onChange} color={color} />
      )}

      {/* Date input */}
      {isDate && (
        <input type="date" value={value || today()} onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, marginTop: opts ? 8 : 0 }} />
      )}

      {/* Number */}
      {isNum && (
        <input type="number" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="0" style={{ ...inputStyle, marginTop: opts ? 8 : 0 }} />
      )}

      {/* Textarea */}
      {isTxt && (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)}
          rows={3} style={{ ...inputStyle, resize: 'vertical', marginTop: opts ? 8 : 0 }} />
      )}

      {/* Select without presets */}
      {isSel && !opts && (
        <select value={value || ''} onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, appearance: 'none' }}>
          <option value="">— Chọn —</option>
          {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {/* Boolean */}
      {isBool && (
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          {['Có', 'Không'].map(v => (
            <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
              <input type="radio" checked={value === v} onChange={() => onChange(v)} />
              {v}
            </label>
          ))}
        </div>
      )}

      {/* Text (without presets) */}
      {field.type === 'text' && !opts && (
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, marginTop: 0 }} />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function DurianJournalPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);
  const [entries, setEntries] = useState({});
  const [saving, setSaving] = useState(false);
  const [notify, setNotify] = useState(null); // { type: 'success'|'error'|'warn', msg }

  // Load durian schema
  const { data: schemas } = useQuery({
    queryKey: ['schemas', 'trongtrot'],
    queryFn: () => api.get('/schemas?category=trongtrot').then(r => r.data.data),
  });

  const schema = schemas?.find(s => s.name === DURIAN_SCHEMA_NAME);

  // If editing existing journal
  const { data: existing } = useQuery({
    queryKey: ['journal', editId],
    queryFn: () => api.get(`/journals/${editId}`).then(r => r.data.data),
    enabled: !!editId,
  });

  useEffect(() => {
    if (existing?.entries) setEntries(existing.entries);
  }, [existing]);

  // Auto-fill farmer info into first tab
  useEffect(() => {
    if (!schema || !user) return;
    const firstTable = schema.tables[0];
    if (!firstTable) return;
    setEntries(prev => ({
      ...prev,
      [firstTable.tableName]: {
        owner_name: user.fullname || user.username || '',
        parcel_code: user.plantingRegionCode || '',
        htx_name: 'HTX Sầu Riêng Tân Quan Ecofarm',
        ...prev[firstTable.tableName],
      }
    }));
  }, [schema, user]);

  const showNote = (type, msg, ms = 2800) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), ms);
  };

  const saveJournal = async (status) => {
    if (!schema) return;
    setSaving(true);
    try {
      const payload = { schemaId: schema._id, status, entries, images: [], documents: [] };
      if (editId) {
        await api.put(`/journals/${editId}`, payload);
      } else {
        await api.post('/journals', payload);
      }
      queryClient.invalidateQueries(['journals']);
      showNote('success', status === 'Submitted'
        ? '✅ Đã gửi nhật ký lên HTX để xét duyệt!'
        : '💾 Đã lưu nháp thành công!');
      if (status === 'Submitted') {
        setTimeout(() => navigate('/vietgap/trong-trot'), 1200);
      }
    } catch (err) {
      showNote('error', '❌ Lỗi lưu: ' + (err.response?.data?.message || err.message));
    }
    setSaving(false);
  };

  const setField = (tableName, fieldName, val) => {
    setEntries(prev => ({
      ...prev,
      [tableName]: { ...(prev[tableName] || {}), [fieldName]: val }
    }));
  };

  // ── Render ─────────────────────────────────────────────────────
  if (!schema) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '4px solid #d1fae5', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#64748b', fontSize: 14 }}>Đang tải sổ nhật ký sầu riêng...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const tables = schema.tables || [];
  const curTable = tables[activeTab];
  const curMeta = TAB_META[curTable?.tableName] || { emoji: '📝', color: '#16a34a' };
  const curPresets = PRESETS[curTable?.tableName] || {};

  // PHI auto-compute for BVTV table
  const bvtvTable = entries['Nhật ký Thuốc bảo vệ thực vật (BVTV)'] || {};
  const bvtvPesticide = bvtvTable.pesticide_name;
  const phiDays = bvtvPesticide ? PRESETS['Nhật ký Thuốc bảo vệ thực vật (BVTV)'].PHI_DAYS[bvtvPesticide] : null;
  const safeDate = phiDays ? dayjs().add(phiDays, 'day').format('DD/MM/YYYY') : null;

  const notifyColors = { success: '#16a34a', error: '#dc2626', warn: '#d97706' };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── Toast Notification ─ */}
      {notify && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: notifyColors[notify.type], color: '#fff',
          padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 9999, whiteSpace: 'nowrap',
        }}>
          {notify.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #166534, #15803d)',
        padding: '18px 20px 20px', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button onClick={() => navigate('/vietgap/trong-trot')} style={{
              background: 'none', border: 'none', color: '#bbf7d0', cursor: 'pointer',
              fontSize: 13, padding: 0, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4,
            }}>← Quay lại</button>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>
              🌿 Nhật ký Sầu riêng VietGAP
            </div>
            <div style={{ color: '#86efac', fontSize: 12, marginTop: 2 }}>
              {user?.fullname || user?.username} · {dayjs().format('ddd DD/MM/YYYY')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => saveJournal('Draft')} disabled={saving} style={{
              padding: '9px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600,
              fontSize: 13, cursor: 'pointer', outline: 'none',
            }}>
              💾 Lưu nháp
            </button>
            <button onClick={() => saveJournal('Submitted')} disabled={saving} style={{
              padding: '9px 16px', borderRadius: 10, border: 'none',
              background: '#fff', color: '#166534', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              ✅ Gửi duyệt
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', minWidth: 'max-content' }}>
          {tables.map((t, i) => {
            const meta = TAB_META[t.tableName] || { emoji: '📝', color: '#16a34a' };
            const filled = !!(entries[t.tableName] && Object.values(entries[t.tableName]).some(v => v));
            const active = activeTab === i;
            return (
              <button key={t.tableName} onClick={() => setActiveTab(i)} style={{
                padding: '13px 16px', border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: active ? `3px solid ${meta.color}` : '3px solid transparent',
                color: active ? meta.color : '#64748b',
                fontWeight: active ? 700 : 400, fontSize: 13, outline: 'none',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.12s', whiteSpace: 'nowrap',
              }}>
                <span>{meta.emoji}</span>
                <span style={{ display: active ? 'inline' : 'none' }}>{t.tableName.replace('Nhật ký ', '').replace('Đánh giá ', '').replace('Thông tin ', '')}</span>
                {!active && <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.tableName.split(' ')[t.tableName.split(' ').length - 1]}</span>}
                {filled && <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form Area ────────────────────────────────────────────── */}
      <div style={{ padding: '16px', maxWidth: 720, margin: '0 auto' }}>
        {/* Tab header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          padding: '14px 18px', borderRadius: 14,
          background: curMeta.color + '0f', border: `1.5px solid ${curMeta.color}28`,
        }}>
          <span style={{ fontSize: 28 }}>{curMeta.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: curMeta.color }}>{curTable.tableName}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
              {curTable.isMultiRow ? 'Ghi nhiều dòng hàng ngày' : 'Thông tin một lần'} · {curTable.fields.length} trường
            </div>
          </div>
        </div>

        {/* PHI warning if BVTV tab */}
        {curTable.tableName.includes('BVTV') && bvtvPesticide && phiDays && (
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            background: '#fffbeb', border: '1.5px solid #fcd34d', marginBottom: 16,
          }}>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>
              ⏱️ PHI {phiDays} ngày — Thu hoạch an toàn từ: {safeDate}
            </div>
            <div style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>
              Ghi đúng thời gian cách ly để đạt chuẩn GACC xuất khẩu
            </div>
          </div>
        )}

        {/* Fields */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
        }}>
          {curTable.fields.map(field => (
            <FieldInput
              key={field.name}
              field={field}
              value={entries[curTable.tableName]?.[field.name]}
              onChange={val => setField(curTable.tableName, field.name, val)}
              color={curMeta.color}
              presets={curPresets}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 10 }}>
          <button
            onClick={() => setActiveTab(i => Math.max(0, i - 1))}
            disabled={activeTab === 0}
            style={{
              flex: 1, padding: '13px', borderRadius: 12,
              border: '1.5px solid #e2e8f0', background: activeTab === 0 ? '#f8fafc' : '#fff',
              color: activeTab === 0 ? '#cbd5e1' : '#475569',
              fontWeight: 600, fontSize: 14, cursor: activeTab === 0 ? 'not-allowed' : 'pointer',
            }}>
            ← Tab trước
          </button>
          <button
            onClick={() => saveJournal('Draft')}
            style={{
              flex: 1, padding: '13px', borderRadius: 12,
              border: 'none', background: curMeta.color, color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: `0 3px 12px ${curMeta.color}44`,
            }}>
            💾 Lưu tab này
          </button>
          {activeTab < tables.length - 1 ? (
            <button
              onClick={() => { saveJournal('Draft'); setTimeout(() => setActiveTab(i => Math.min(tables.length - 1, i + 1)), 400); }}
              style={{
                flex: 1, padding: '13px', borderRadius: 12,
                border: 'none', background: '#f0fdf4', color: '#16a34a',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', border: '1.5px solid #86efac',
              }}>
              Tab sau →
            </button>
          ) : (
            <button
              onClick={() => saveJournal('Submitted')}
              style={{
                flex: 1, padding: '13px', borderRadius: 12,
                border: 'none', background: '#16a34a', color: '#fff',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 3px 12px #16a34a44',
              }}>
              ✅ Gửi duyệt HTX
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          {tables.map((t, i) => {
            const filled = !!(entries[t.tableName] && Object.values(entries[t.tableName]).some(v => v));
            const meta = TAB_META[t.tableName] || { color: '#16a34a' };
            return (
              <button key={i} onClick={() => setActiveTab(i)} style={{
                width: i === activeTab ? 24 : 8, height: 8, borderRadius: 4,
                border: 'none', cursor: 'pointer', outline: 'none',
                background: i === activeTab ? meta.color : filled ? '#86efac' : '#e2e8f0',
                transition: 'all 0.2s',
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
