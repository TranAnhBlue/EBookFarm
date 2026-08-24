import React, { useState, useEffect, useRef } from 'react';
import { Badge, Progress, message } from 'antd';
import { CheckOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import * as XLSX from 'xlsx';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

dayjs.locale('vi');

// ── Activity Types ───────────────────────────────────────────────
const ACTIVITIES = [
  { key: 'cham_soc',   emoji: '🌿', label: 'Chăm sóc',    color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  { key: 'bon_phan',   emoji: '🧪', label: 'Bón phân',     color: '#b45309', bg: '#fefce8', border: '#fde68a' },
  { key: 'tuoi_nuoc',  emoji: '💧', label: 'Tưới nước',    color: '#0369a1', bg: '#f0f9ff', border: '#7dd3fc' },
  { key: 'thuoc_bvtv', emoji: '🛡️', label: 'Phun thuốc',   color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  { key: 'sau_benh',   emoji: '🐛', label: 'Sâu bệnh',     color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  { key: 'thu_hoach',  emoji: '🍈', label: 'Thu hoạch',    color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  { key: 'ban_hang',   emoji: '💰', label: 'Bán hàng',     color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  { key: 'danh_gia',   emoji: '📋', label: 'Kiểm tra',     color: '#475569', bg: '#f8fafc', border: '#cbd5e1' },
];

const QUICK_OPTIONS = {
  cham_soc: [
    { label: 'Tỉa cành tạo tán', sub: 'Cắt bỏ cành sâu, cành yếu' },
    { label: 'Tỉa chồi nước', sub: 'Loại bỏ chồi vô ích' },
    { label: 'Làm cỏ quanh gốc', sub: 'Vệ sinh vùng gốc cây' },
    { label: 'Bao trái sầu riêng', sub: 'Bao khi trái đạt 7–10cm' },
    { label: 'Xử lý ra hoa', sub: 'Dùng hóa chất kích hoa' },
    { label: 'Xiết nước kích hoa', sub: 'Ngưng tưới 15–20 ngày' },
    { label: 'Phun bổ sung lá', sub: 'Dinh dưỡng qua lá' },
    { label: 'Vệ sinh vườn', sub: 'Dọn lá, trái rụng' },
  ],
  bon_phan: [
    { label: 'NPK 15-15-15', sub: '2 kg/gốc – Đầu Trâu' },
    { label: 'Hữu Cơ Trichoderma', sub: '5 kg/gốc – Vi sinh' },
    { label: 'Canxi Bor (Ca-B)', sub: 'Tăng cường đậu trái' },
    { label: 'Kali KCl 60%', sub: '1 kg/gốc – Tăng chất lượng' },
    { label: 'Phân Urea 46%', sub: '0.5 kg/gốc – Tăng đạm' },
    { label: 'Phân cá thủy phân', sub: 'Amino Acid – phun lá' },
  ],
  tuoi_nuoc: [
    { label: 'Tưới nhỏ giọt 45 phút', sub: 'Hệ thống tự động HTX' },
    { label: 'Tưới nhỏ giọt 60 phút', sub: 'Hệ thống tự động HTX' },
    { label: 'Tưới phun mưa 30 phút', sub: 'Phun mưa quanh tán' },
    { label: 'Tưới phá xiết', sub: 'Sau khi xiết nước kích hoa' },
  ],
  thuoc_bvtv: [
    { label: 'Anvil 5SC', sub: 'Trừ nấm hồng · PHI 14 ngày', phi: 14 },
    { label: 'Ridomil Gold MZ', sub: 'Trừ thối rễ · PHI 7 ngày', phi: 7 },
    { label: 'Confidor 700WG', sub: 'Trừ rệp sáp · PHI 10 ngày', phi: 10 },
    { label: 'Trichoderma sinh học', sub: 'An toàn · PHI 3 ngày', phi: 3 },
    { label: 'Dầu khoáng SK Enspray', sub: 'Trừ nhện · PHI 3 ngày', phi: 3 },
  ],
  sau_benh: [
    { label: 'Nấm hồng', sub: 'Phát hiện trên thân/cành', muc: 'nhẹ' },
    { label: 'Thối rễ Phytophthora', sub: 'Lá vàng, cây suy yếu', muc: 'trung bình' },
    { label: 'Rệp sáp hại rễ', sub: 'Dưới gốc cây', muc: 'nhẹ' },
    { label: 'Nhện đỏ hại lá', sub: 'Lá bạc màu, có tơ', muc: 'nhẹ' },
    { label: 'Sâu đục trái', sub: 'Trái bị thủng, rỉ nhựa', muc: 'nặng' },
  ],
  thu_hoach: [
    { label: 'Monthong – Đạt GACC', sub: 'Xuất khẩu Trung Quốc' },
    { label: 'Dona – Đạt GACC', sub: 'Xuất khẩu Trung Quốc' },
    { label: 'TR6 – Nội địa', sub: 'Tiêu thụ trong nước' },
  ],
  ban_hang: [
    { label: 'Hữu Nghị Export', sub: 'Xuất khẩu chính ngạch' },
    { label: 'HTX Tân Quan tổng hợp', sub: 'Qua đầu mối HTX' },
    { label: 'Thương lái tại chỗ', sub: 'Bán tại vườn' },
  ],
  danh_gia: [
    { label: 'Kiểm tra PHI cách ly', sub: 'Đối chiếu nhật ký BVTV' },
    { label: 'Hồ sơ vùng trồng', sub: 'Kiểm tra MSVT & giấy tờ' },
    { label: 'Tiêu chuẩn GACC', sub: 'Chuẩn bị xuất khẩu' },
    { label: 'Nhiệt độ & Độ ẩm IoT', sub: 'Kiểm tra cảm biến HTX' },
  ],
};

const DEFAULT_CHECKLIST = [
  { id: 1, label: 'Kiểm tra độ ẩm đất – cần tưới không?', emoji: '💧', done: false },
  { id: 2, label: 'Kiểm tra sâu bệnh trên lá & trái', emoji: '🐛', done: false },
  { id: 3, label: 'Kiểm tra bao trái – thay bao hỏng', emoji: '🛍️', done: false },
  { id: 4, label: 'Ghi nhật ký bón phân (nếu hôm nay bón)', emoji: '🧪', done: false },
  { id: 5, label: 'Kiểm tra thời gian cách ly PHI', emoji: '🛡️', done: false },
  { id: 6, label: 'Báo cáo sản lượng thu hoạch cho HTX', emoji: '📊', done: false },
];

// ── Styles ────────────────────────────────────────────────────────
const s = {
  page: { minHeight: '100vh', background: '#f1f5f9', paddingBottom: 80 },
  header: {
    background: 'linear-gradient(135deg, #166534 0%, #15803d 60%, #16a34a 100%)',
    padding: '20px 20px 28px',
    position: 'relative',
    overflow: 'hidden',
  },
  headerBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)',
  },
  headerContent: { position: 'relative', zIndex: 1 },
  tabBar: {
    display: 'flex', gap: 0,
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  tabBtn: (active) => ({
    flex: 1, padding: '14px 4px', border: 'none', background: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 400,
    color: active ? '#16a34a' : '#64748b',
    borderBottom: active ? '2.5px solid #16a34a' : '2.5px solid transparent',
    transition: 'all 0.15s', letterSpacing: -0.2,
  }),
  section: { padding: '14px 16px' },
  card: {
    background: '#fff', borderRadius: 16, padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
  },
  actBtn: (act, sel) => ({
    width: '100%', padding: '12px 6px', borderRadius: 14,
    border: sel ? `2px solid ${act.color}` : '2px solid #e2e8f0',
    background: sel ? act.bg : '#fff',
    cursor: 'pointer', textAlign: 'center',
    transition: 'all 0.12s',
    boxShadow: sel ? `0 0 0 3px ${act.color}1a` : 'none',
    outline: 'none',
  }),
  chipBtn: (active, color, bg) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    padding: '10px 14px', borderRadius: 12,
    border: active ? `2px solid ${color}` : '1.5px solid #e2e8f0',
    background: active ? bg : '#fff',
    cursor: 'pointer', textAlign: 'left', width: '100%',
    transition: 'all 0.12s',
    outline: 'none',
  }),
  sendBtn: (color) => ({
    width: '100%', padding: '15px', borderRadius: 14,
    border: 'none', background: color, color: '#fff',
    fontSize: 17, fontWeight: 700, cursor: 'pointer',
    boxShadow: `0 4px 14px ${color}55`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'transform 0.1s, box-shadow 0.1s',
    outline: 'none',
  }),
  phiBanner: {
    padding: '10px 14px', borderRadius: 12,
    background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    border: '1px solid #fcd34d',
    marginTop: 12,
  },
  noteInput: {
    width: '100%', border: '1.5px solid #e2e8f0',
    borderRadius: 12, padding: '12px 14px',
    fontSize: 14, resize: 'none', fontFamily: 'inherit',
    marginTop: 12, outline: 'none',
    transition: 'border-color 0.15s',
    minHeight: 72,
    background: '#fafafa',
  },
  timelineItem: (bg, border) => ({
    background: bg, border: `1px solid ${border}`,
    borderRadius: 14, padding: '13px 15px',
    marginBottom: 14, position: 'relative',
    paddingLeft: 44,
  }),
  timelineDot: (color) => ({
    position: 'absolute', left: 12, top: 14,
    width: 24, height: 24, borderRadius: '50%',
    background: color + '22', border: `2px solid ${color}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12,
  }),
  timelineLine: {
    position: 'absolute', left: 23, top: 38, bottom: -14,
    width: 2, background: '#e2e8f0', zIndex: 0,
  },
  checkItem: (done) => ({
    display: 'flex', alignItems: 'center', gap: 13,
    padding: '14px 16px', borderRadius: 14, marginBottom: 8,
    background: done ? '#f0fdf4' : '#f8fafc',
    border: done ? '1.5px solid #86efac' : '1.5px solid #e2e8f0',
    cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s',
  }),
  checkCircle: (done) => ({
    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
    border: done ? '2px solid #16a34a' : '2px solid #cbd5e1',
    background: done ? '#16a34a' : '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  }),
};

export default function FarmerDailyJournal() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('quick');
  const [selAct, setSelAct] = useState(null);
  const [selOpt, setSelOpt] = useState(null);
  const [note, setNote] = useState('');
  const [parcel, setParcel] = useState(null);
  const [logs, setLogs] = useState([]);
  const [sending, setSending] = useState(false);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const noteRef = useRef(null);

  const donePct = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);

  // Load farmer's own parcel
  useEffect(() => {
    api.get('/htx/planting-regions/my-parcel')
      .then(res => { if (res.data?.data) setParcel(res.data.data); })
      .catch(() => {});
  }, []);

  const actConfig = ACTIVITIES.find(a => a.key === selAct);

  const handleSend = () => {
    if (!selAct) return;
    if (!selOpt) { alert('Vui lòng chọn công việc cụ thể!'); return; }

    const log = {
      id: Date.now(),
      actKey: selAct, emoji: actConfig.emoji,
      actLabel: actConfig.label, actColor: actConfig.color,
      actBg: actConfig.bg, actBorder: actConfig.border,
      parcelCode: parcel?.code || user?.plantingRegionCode || '—',
      content: selOpt.label, sub: selOpt.sub || '',
      note: note.trim(),
      phi: selOpt.phi || null,
      safeDate: selOpt.phi ? dayjs().add(selOpt.phi, 'day').format('DD/MM/YYYY') : null,
      time: dayjs().format('HH:mm'), date: dayjs().format('ddd DD/MM'),
      farmer: user?.fullname || user?.name || 'Nông dân',
    };

    setLogs(prev => [log, ...prev]);
    setSending(true);
    setSelOpt(null);
    setNote('');
    setSelAct(null);
    setTimeout(() => setSending(false), 700);
    setTab('timeline');
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const rows = [
      ['Thời gian', 'Ngày', 'Lô', 'Hoạt động', 'Nội dung', 'Ghi chú', 'PHI (ngày)', 'An toàn sau'],
      ...logs.map(l => [`${l.time} – ${l.date}`, l.date, l.parcelCode,
        `${l.emoji} ${l.actLabel}`, l.content, l.note, l.phi || '', l.safeDate || ''])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Nhật ký');
    XLSX.writeFile(wb, `NhatKy_SauRieng_${dayjs().format('YYYYMMDD')}.xlsx`);
  };

  return (
    <div style={s.page}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={s.header}>
        <div style={s.headerBg} />
        <div style={s.headerContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#bbf7d0', fontSize: 12, marginBottom: 4, letterSpacing: 0.3 }}>
                🌿 HTX Tân Quan Ecofarm
              </div>
              <div style={{ color: '#fff', fontSize: 21, fontWeight: 800, lineHeight: 1.2 }}>
                Nhật ký sầu riêng
              </div>
              <div style={{ color: '#86efac', fontSize: 13, marginTop: 4 }}>
                {dayjs().format('dddd, DD/MM/YYYY')}
              </div>
              {parcel && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.15)', borderRadius: 20,
                  padding: '4px 12px', backdropFilter: 'blur(4px)' }}>
                  <span style={{ color: '#fff', fontSize: 12 }}>📍 {parcel.code} — {parcel.name?.split('(')[0].trim()}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleExport}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: 10, padding: '8px 12px', cursor: 'pointer',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, outline: 'none' }}>
              <DownloadOutlined /> Excel
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {[
              { val: logs.length, label: 'Đã ghi hôm nay' },
              { val: `${donePct}%`, label: 'Checklist xong' },
              { val: logs.filter(l => l.phi).length, label: 'Thuốc đang cách ly' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.12)',
                borderRadius: 12, padding: '10px 12px', textAlign: 'center',
                backdropFilter: 'blur(4px)' }}>
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{s.val}</div>
                <div style={{ color: '#bbf7d0', fontSize: 11 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB BAR ─────────────────────────────────────────────── */}
      <div style={s.tabBar}>
        {[
          { key: 'quick',     label: '⚡ Ghi nhanh' },
          { key: 'timeline',  label: `📅 Lịch sử${logs.length ? ` (${logs.length})` : ''}` },
          { key: 'checklist', label: `✅ Việc hôm nay` },
        ].map(t => (
          <button key={t.key} style={s.tabBtn(tab === t.key)} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ TAB: GHI NHANH ═══════════ */}
      {tab === 'quick' && (
        <div style={s.section}>

          {/* STEP 1 */}
          <div style={s.card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
              Hôm nay bạn đã làm gì?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {ACTIVITIES.map(act => (
                <button
                  key={act.key}
                  style={s.actBtn(act, selAct === act.key)}
                  onClick={() => { setSelAct(act.key); setSelOpt(null); }}>
                  <div style={{ fontSize: 26 }}>{act.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: act.color, marginTop: 3, lineHeight: 1.2 }}>
                    {act.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2 + 3 */}
          {selAct && (
            <div style={{ ...s.card, borderLeft: `4px solid ${actConfig.color}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: actConfig.color, marginBottom: 12 }}>
                {actConfig.emoji} Chọn công việc cụ thể:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {QUICK_OPTIONS[selAct].map(opt => (
                  <button
                    key={opt.label}
                    style={s.chipBtn(selOpt?.label === opt.label, actConfig.color, actConfig.bg)}
                    onClick={() => setSelOpt(opt)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: selOpt?.label === opt.label ? 700 : 500,
                        color: selOpt?.label === opt.label ? actConfig.color : '#1e293b' }}>
                        {selOpt?.label === opt.label && <CheckOutlined style={{ marginRight: 6 }} />}
                        {opt.label}
                      </span>
                      {opt.phi && (
                        <span style={{ fontSize: 11, background: '#fef3c7',
                          color: '#92400e', borderRadius: 8, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                          PHI {opt.phi}ngày
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{opt.sub}</span>
                  </button>
                ))}
              </div>

              {/* PHI Warning */}
              {selOpt?.phi && (
                <div style={s.phiBanner}>
                  <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
                    ⏱️ Cách ly: {selOpt.phi} ngày
                  </div>
                  <div style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>
                    ✅ Thu hoạch an toàn từ: <b>{dayjs().add(selOpt.phi, 'day').format('DD/MM/YYYY')}</b>
                  </div>
                </div>
              )}

              {/* Note */}
              <textarea
                ref={noteRef}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ghi chú thêm (không bắt buộc)..."
                style={s.noteInput}
                onFocus={e => { e.target.style.borderColor = actConfig.color; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
              />

              {/* SEND BUTTON */}
              <button
                style={s.sendBtn(selOpt ? actConfig.color : '#94a3b8')}
                onClick={handleSend}
                disabled={!selOpt}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
                {sending ? '✅ Đã ghi!' : `✅ Ghi vào nhật ký — ${selOpt?.label || 'chọn công việc'}`}
              </button>
            </div>
          )}

          {/* Placeholder */}
          {!selAct && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 52 }}>☝️</div>
              <div style={{ fontSize: 14, marginTop: 10, fontWeight: 500 }}>Bấm chọn công việc bên trên</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Chỉ cần 2 cú bấm là ghi xong nhật ký!</div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ TAB: LỊCH SỬ ═══════════ */}
      {tab === 'timeline' && (
        <div style={s.section}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 60 }}>📖</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 14, color: '#64748b' }}>Chưa có nhật ký hôm nay</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Qua tab ⚡ Ghi nhanh để ghi việc đầu tiên!</div>
              <button
                onClick={() => setTab('quick')}
                style={{ marginTop: 20, padding: '12px 28px', borderRadius: 12,
                  background: '#16a34a', color: '#fff', border: 'none',
                  fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                ⚡ Ghi nhanh ngay
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Date label */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ background: '#e2e8f0', borderRadius: 20, padding: '4px 16px',
                  fontSize: 12, color: '#475569', fontWeight: 600 }}>
                  📅 {dayjs().format('dddd, DD/MM/YYYY')}
                </span>
              </div>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 27, top: 36, bottom: 0, width: 2, background: '#e2e8f0' }} />
              {logs.map((log, idx) => (
                <div key={log.id} style={{ position: 'relative' }}>
                  <div style={s.timelineDot(log.actColor)}>{log.emoji}</div>
                  {idx < logs.length - 1 && <div style={s.timelineLine} />}
                  <div style={s.timelineItem(log.actBg, log.actBorder)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: log.actColor,
                            background: log.actColor + '1a', borderRadius: 8, padding: '2px 8px' }}>
                            {log.actLabel}
                          </span>
                          <span style={{ fontSize: 12, color: '#64748b' }}>🕐 {log.time}</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{log.content}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{log.sub}</div>
                        {log.note && (
                          <div style={{ fontSize: 13, color: '#475569', marginTop: 6,
                            background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '6px 10px' }}>
                            💬 {log.note}
                          </div>
                        )}
                        {log.safeDate && (
                          <div style={{ marginTop: 8, padding: '5px 10px', borderRadius: 8,
                            background: '#fffbeb', border: '1px solid #fcd34d', display: 'inline-block' }}>
                            <span style={{ fontSize: 12, color: '#92400e' }}>
                              ⏱️ Thu hoạch an toàn: <b>{log.safeDate}</b>
                            </span>
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                          📍 {log.parcelCode}
                        </div>
                      </div>
                      <button
                        onClick={() => setLogs(prev => prev.filter(l => l.id !== log.id))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                          color: '#cbd5e1', padding: 4, fontSize: 16 }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ TAB: CHECKLIST ═══════════ */}
      {tab === 'checklist' && (
        <div style={s.section}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>📋 Việc cần làm hôm nay</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: donePct === 100 ? '#16a34a' : '#64748b' }}>
                {donePct}%
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, marginBottom: 18, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, transition: 'width 0.4s',
                width: `${donePct}%`,
                background: donePct === 100
                  ? 'linear-gradient(90deg, #86efac, #16a34a)'
                  : 'linear-gradient(90deg, #4ade80, #22c55e)' }} />
            </div>

            {donePct === 100 && (
              <div style={{ textAlign: 'center', padding: '10px 0 18px', color: '#16a34a', fontWeight: 700, fontSize: 15 }}>
                🎉 Tuyệt vời! Xong hết việc hôm nay rồi!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {checklist.map(item => (
                <div
                  key={item.id}
                  style={s.checkItem(item.done)}
                  onClick={() => setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, done: !c.done } : c))}>
                  <div style={s.checkCircle(item.done)}>
                    {item.done && <CheckOutlined style={{ color: '#fff', fontSize: 12 }} />}
                  </div>
                  <span style={{ fontSize: 24 }}>{item.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: item.done ? 400 : 500,
                    color: item.done ? '#94a3b8' : '#1e293b',
                    textDecoration: item.done ? 'line-through' : 'none' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setChecklist(DEFAULT_CHECKLIST.map(c => ({ ...c, done: false })))}
              style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 12,
                border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer',
                fontSize: 13, color: '#64748b', fontWeight: 600 }}>
              🔄 Đặt lại danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
