import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Card, Row, Col, Typography,
  Table, Modal, Upload, message, Popconfirm, Tag, Tooltip,
  Space, Empty, Pagination
} from 'antd';
import {
  ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined,
  ReloadOutlined, ExportOutlined, AppstoreOutlined, UnorderedListOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useAuthStore } from '../../store/authStore';

// Data configs & Subcomponents
import { FOUR_TABLES_CONFIG, INITIAL_BOOKS } from '../../data/journalConfigs';
import JournalBookCard from './components/JournalBookCard';
import JournalLotInfoCard from './components/JournalLotInfoCard';
import JournalRecordModal from './components/JournalRecordModal';
import JournalExportModal from './components/JournalExportModal';
import JournalCreateModal from './components/JournalCreateModal';

// Utilities
import { exportJournalPdf, printJournalHtml } from '../../utils/pdfExport';
import { exportJournalExcel } from '../../utils/excelExport';

dayjs.locale('vi');
const { Title, Text } = Typography;

export default function StandardJournalForm({ journalType = 'vietgap-trong-trot', config = {} }) {
  const { user } = useAuthStore();
  const [createBookForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [infoForm] = Form.useForm();

  const tabsConfig = FOUR_TABLES_CONFIG;
  const storageKey = `ebookfarm_books_v2_${journalType}`;

  // State: List of Journal Books
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_BOOKS;
  });

  // State: Selected Journal Book ID
  const [selectedBookId, setSelectedBookId] = useState(null);

  // View Modes & Modal States
  const [listViewMode, setListViewMode] = useState('card'); // 'card' | 'table'
  const [detailViewMode, setDetailViewMode] = useState('table'); // 'table' | 'card'
  const [activeTabKey, setActiveTabKey] = useState(tabsConfig[0]?.key || 'bieu_1');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editInfoVisible, setEditInfoVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [mapUploadVisible, setMapUploadVisible] = useState(false);
  const [mapFileList, setMapFileList] = useState([]);

  // Auto-save books to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(books));
  }, [books, storageKey]);

  const selectedBook = books.find(b => b.id === selectedBookId);

  // ── Book Handlers ─────────────────────────────────────────────────────────

  const handleCreateBook = async () => {
    try {
      const values = await createBookForm.validateFields();
      const newBook = {
        id: 'book-' + Date.now(),
        maNongHo: values.maNongHo || user?.farmCode || 'BANHANG',
        hoTen: values.hoTen || user?.fullname || user?.username || 'Trần Đức Anh Test',
        loaiSo: values.loaiSo || 'Sầu riêng',
        dienTich: values.dienTich || 'Test',
        matDo: values.matDo || '10',
        tongTuiPhoi: values.tongTuiPhoi || '10',
        ngayBatDauDatTui: values.ngayBatDauDatTui || '2',
        ngayBatDau: values.ngayBatDau ? dayjs(values.ngayBatDau).format('DD/MM/YYYY HH:mm') : dayjs().format('DD/MM/YYYY HH:mm'),
        diaChi: values.diaChi || 'Thach Hoa',
        diaChiSanXuat: values.diaChiSanXuat || values.diaChi || '',
        loSanXuat: values.loSanXuat || 'Test',
        tenCoSo: values.tenCoSo || 'Cơ sở sản xuất',
        maSoThua: values.maSoThua || 'Test01',
        soDoVuon: null,
        tablesData: { bieu_1: [], bieu_2: [], bang_3: [], bang_4: [] }
      };
      setBooks(prev => [newBook, ...prev]);
      setCreateModalVisible(false);
      createBookForm.resetFields();
      message.success('Đã tạo sổ nhật ký mới thành công!');
    } catch (e) {
      message.error('Vui lòng điền các thông tin bắt buộc (*)');
    }
  };

  const handleSaveBookInfo = async () => {
    try {
      const values = await infoForm.validateFields();
      setBooks(prev => prev.map(b => b.id === selectedBookId ? { ...b, ...values } : b));
      setEditInfoVisible(false);
      message.success('Đã cập nhật thông tin lô sản xuất!');
    } catch (e) { }
  };

  const handleDeleteBook = (bookId) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    if (selectedBookId === bookId) setSelectedBookId(null);
    message.success('Đã xóa sổ nhật ký!');
  };

  // ── Record Handlers ───────────────────────────────────────────────────────

  const currentTab = tabsConfig.find(t => t.key === activeTabKey) || tabsConfig[0];
  const currentRows = selectedBook?.tablesData?.[activeTabKey] || [];

  const handleOpenAddRecord = () => {
    setEditingRecord(null);
    modalForm.resetFields();
    modalForm.setFieldsValue({
      ngay_thang: dayjs(),
      thoi_gian: dayjs(),
      thoi_gian_th: dayjs(),
      thoi_gian_thu_hoach: dayjs(),
      ngay_ban: dayjs(),
      han_su_dung: dayjs().add(1, 'year'),
    });
    setRecordModalVisible(true);
  };

  const handleOpenEditRecord = (record) => {
    setEditingRecord(record);
    modalForm.resetFields();
    const values = { ...record };
    currentTab.columns.forEach(col => {
      if (col.type === 'date' && values[col.key]) {
        values[col.key] = dayjs(values[col.key], 'DD/MM/YYYY');
      }
    });
    modalForm.setFieldsValue(values);
    setRecordModalVisible(true);
  };

  const handleSaveRecord = async () => {
    try {
      const values = await modalForm.validateFields();
      const formatted = { ...values };
      currentTab.columns.forEach(col => {
        if (col.type === 'date' && formatted[col.key]) {
          formatted[col.key] = dayjs(formatted[col.key]).format('DD/MM/YYYY');
        } else if (Array.isArray(formatted[col.key])) {
          formatted[col.key] = formatted[col.key].join(', ');
        }
      });

      setBooks(prev => prev.map(b => {
        if (b.id !== selectedBookId) return b;
        const prevTabRows = b.tablesData?.[activeTabKey] || [];
        let newTabRows;
        if (editingRecord) {
          newTabRows = prevTabRows.map(r => r.id === editingRecord.id ? { ...formatted, id: editingRecord.id } : r);
        } else {
          newTabRows = [...prevTabRows, { ...formatted, id: Date.now().toString() }];
        }
        return {
          ...b,
          tablesData: {
            ...(b.tablesData || {}),
            [activeTabKey]: newTabRows
          }
        };
      }));

      message.success(editingRecord ? 'Đã cập nhật bản ghi!' : 'Đã ghi nhật ký thành công!');
      setRecordModalVisible(false);
    } catch (e) {
      message.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
    }
  };

  const handleDeleteRecord = (recordId) => {
    setBooks(prev => prev.map(b => {
      if (b.id !== selectedBookId) return b;
      return {
        ...b,
        tablesData: {
          ...(b.tablesData || {}),
          [activeTabKey]: (b.tablesData?.[activeTabKey] || []).filter(r => r.id !== recordId)
        }
      };
    }));
    message.success('Đã xóa bản ghi!');
  };

  // ── Table Columns Definition ──────────────────────────────────────────────

  const tableColumns = [
    {
      title: 'STT',
      key: 'idx',
      width: 60,
      align: 'center',
      render: (_, __, idx) => <span className="text-xs font-semibold text-slate-400">{idx + 1}</span>
    },
    ...currentTab.columns.map(col => ({
      title: col.title,
      dataIndex: col.key,
      key: col.key,
      render: (text) => {
        if (!text && text !== 0) return <span className="text-slate-300 italic text-xs">--</span>;
        if (col.key === 'danh_gia') {
          const isGood = String(text).toLowerCase().includes('đạt') && !String(text).toLowerCase().includes('không');
          return (
            <Tag color={isGood ? 'success' : 'error'} className="font-extrabold rounded-full px-3 py-0.5 border-none text-xs">
              {text}
            </Tag>
          );
        }
        return <span className="text-slate-800 text-xs md:text-sm font-semibold">{text}</span>;
      }
    })),
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Xóa bản ghi này?"
            description="Bản ghi đã xóa không thể khôi phục."
            onConfirm={() => handleDeleteRecord(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
              className="font-bold p-0 text-xs text-rose-500 hover:text-rose-700"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const standardModelTitle = config.title
    ? config.title
    : journalType.includes('chan-nuoi')
      ? 'Danh sách sổ nhật ký chăn nuôi theo mô hình VietGAP'
      : journalType.includes('thuy-san')
        ? 'Danh sách sổ nhật ký thủy sản theo mô hình VietGAP'
        : 'Danh sách sổ nhật ký trồng trọt theo mô hình VietGAP';

  // ==========================================================================
  // 1. RENDER LIST VIEW (Danh Sách Sổ Bên Ngoài)
  // ==========================================================================

  if (!selectedBookId || !selectedBook) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-16">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 pt-6">

          {/* Top Title & View Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <Title level={3} className="!mb-1 !font-black text-slate-800 !text-xl md:!text-2xl tracking-tight">
                {standardModelTitle}
              </Title>
              <Text className="text-sm md:text-base text-slate-500 font-medium">
                Quản lý các sổ nhật ký điện tử và hồ sơ lô sản xuất chuẩn VietGAP
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={listViewMode === 'card' ? <UnorderedListOutlined /> : <AppstoreOutlined />}
                onClick={() => setListViewMode(listViewMode === 'card' ? 'table' : 'card')}
                className="rounded-xl font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-500 h-11 px-5 bg-white shadow-sm text-sm"
              >
                {listViewMode === 'card' ? 'Xem ở dạng bảng' : 'Xem ở dạng thẻ'}
              </Button>
            </div>
          </div>

          {/* Main Card Container */}
          <Card
            className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden"
            styles={{ body: { padding: '22px 26px' } }}
          >
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-slate-700 text-base md:text-lg">
                  Tổng số sổ nhật ký: <span className="text-emerald-600 font-black">{books.length}</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    createBookForm.resetFields();
                    createBookForm.setFieldsValue({
                      maNongHo: user?.farmCode || 'BANHANG',
                      hoTen: user?.fullname || user?.username || 'Nông hộ',
                      ngayBatDau: dayjs(),
                      dienTich: '1 ha',
                      matDo: '100 cây/ha',
                      tongTuiPhoi: '100',
                      ngayBatDauDatTui: '10/01/2026',
                      diaChi: user?.address || 'Cơ sở sản xuất',
                      loaiSo: 'Sầu riêng',
                      loSanXuat: 'Lô 01'
                    });
                    setCreateModalVisible(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 border-none font-extrabold rounded-xl h-11 px-6 shadow-md shadow-emerald-600/20 text-sm md:text-base"
                >
                  Tạo sổ nhật ký mới
                </Button>
                <Tooltip title="Làm mới danh sách">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      const saved = localStorage.getItem(storageKey);
                      if (saved) setBooks(JSON.parse(saved));
                      message.success('Đã làm mới danh sách sổ!');
                    }}
                    className="rounded-xl h-11 w-11 p-0 text-slate-500 hover:text-emerald-600 hover:border-emerald-400"
                  />
                </Tooltip>
              </div>
            </div>

            {/* List Content */}
            {listViewMode === 'card' ? (
              books.length === 0 ? (
                <Empty description="Chưa có sổ nhật ký nào. Bấm '+ Tạo sổ nhật ký mới' để tạo." className="py-12" />
              ) : (
                <Row gutter={[20, 20]}>
                  {books.map((book) => (
                    <Col xs={24} md={12} lg={12} key={book.id}>
                      <JournalBookCard
                        book={book}
                        onSelect={(id) => setSelectedBookId(id)}
                        onDelete={handleDeleteBook}
                      />
                    </Col>
                  ))}
                </Row>
              )
            ) : (
              <Table
                dataSource={books}
                rowKey="id"
                columns={[
                  { title: 'STT', key: 'idx', width: 60, align: 'center', render: (_, __, i) => <span className="font-bold text-sm">{i + 1}</span> },
                  { title: 'Mã nông hộ / Họ tên', key: 'user', render: (_, r) => <span className="font-bold text-slate-800 text-sm md:text-base">{r.maNongHo} - {r.hoTen}</span> },
                  { title: 'Loại sổ', dataIndex: 'loaiSo', key: 'loaiSo', render: t => <Tag color="success" className="font-bold rounded-full text-sm px-3 py-0.5">{t}</Tag> },
                  { title: 'Lô sản xuất', dataIndex: 'loSanXuat', key: 'loSanXuat', render: t => <span className="text-sm font-semibold text-slate-700">{t || '--'}</span> },
                  { title: 'Diện tích', dataIndex: 'dienTich', key: 'dienTich', render: t => <span className="text-sm font-semibold text-slate-700">{t || '--'}</span> },
                  { title: 'Ngày bắt đầu', dataIndex: 'ngayBatDau', key: 'ngayBatDau', render: t => <span className="text-sm font-semibold text-slate-700">{t || '--'}</span> },
                  { title: 'Địa chỉ', dataIndex: 'diaChi', key: 'diaChi', render: t => <span className="text-sm text-slate-600 font-medium truncate max-w-[200px] inline-block">{t || '--'}</span> },
                  {
                    title: 'Thao tác',
                    key: 'action',
                    align: 'center',
                    render: (_, r) => (
                      <Space>
                        <Button
                          type="primary"
                          onClick={() => setSelectedBookId(r.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold rounded-xl h-9 px-4 text-xs md:text-sm"
                        >
                          Vào ghi sổ &gt;
                        </Button>
                        <Popconfirm
                          title="Xóa sổ này?"
                          onConfirm={() => handleDeleteBook(r.id)}
                          okButtonProps={{ danger: true }}
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} size="small" className="rounded-lg hover:bg-rose-50" />
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
                pagination={{ pageSize: 10 }}
                className="premium-table-refined"
                bordered
              />
            )}

            <div className="flex justify-end mt-6">
              <Pagination defaultCurrent={1} total={books.length} pageSize={6} size="small" />
            </div>
          </Card>

        </div>

        {/* Create Modal */}
        <JournalCreateModal
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onCreate={handleCreateBook}
          form={createBookForm}
          cropOptions={config.cropOptions || ['Sầu riêng', 'Cà phê', 'Lúa', 'Rau củ quả', 'Bưởi', 'Xoài', 'Chăn nuôi', 'Thủy sản']}
        />
      </div>
    );
  }

  // ==========================================================================
  // 2. RENDER DETAIL RECORDING VIEW (Ghi Chép 4 Bảng Bên Trong)
  // ==========================================================================

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 pt-6">

        {/* ── Header Toolbar ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Button
            onClick={() => setSelectedBookId(null)}
            icon={<ArrowLeftOutlined />}
            className="rounded-xl font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-500 h-11 px-5 bg-white shadow-sm text-sm"
          >
            Quay lại danh sách sổ
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              icon={<ExportOutlined />}
              onClick={() => setExportModalVisible(true)}
              className="rounded-xl font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-500 h-11 px-5 bg-white shadow-sm text-sm"
            >
              Xuất nhật ký (Excel/PDF)
            </Button>

            <Button
              icon={detailViewMode === 'table' ? <AppstoreOutlined /> : <UnorderedListOutlined />}
              onClick={() => setDetailViewMode(detailViewMode === 'table' ? 'card' : 'table')}
              className="rounded-xl font-bold text-slate-700 hover:text-emerald-600 hover:border-emerald-500 h-11 px-5 bg-white shadow-sm text-sm"
            >
              {detailViewMode === 'table' ? 'Xem dạng thẻ' : 'Xem dạng bảng'}
            </Button>

            <Popconfirm
              title="Xác nhận xóa sổ nhật ký này?"
              description="Toàn bộ các bảng ghi chép trong sổ này sẽ bị xóa vĩnh viễn."
              onConfirm={() => handleDeleteBook(selectedBook.id)}
              okText="Xác nhận xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                className="rounded-xl font-bold h-11 px-5 shadow-sm text-sm hover:shadow"
              >
                Xóa sổ
              </Button>
            </Popconfirm>
          </div>
        </div>

        {/* ── Top Card: Thông Tin Lô Sản Xuất ──────────────────────────────── */}
        <JournalLotInfoCard
          book={selectedBook}
          onEdit={() => {
            infoForm.setFieldsValue(selectedBook);
            setEditInfoVisible(true);
          }}
          onOpenMapUpload={() => setMapUploadVisible(true)}
        />

        {/* ── 4 Tabs Navigation (Farmer-Friendly Cards) ────────────────────── */}
        <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200/90 p-3 md:p-4 overflow-x-auto shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {tabsConfig.map((tab) => {
              const isActive = tab.key === activeTabKey;
              const count = (selectedBook.tablesData?.[tab.key] || []).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTabKey(tab.key)}
                  className={`p-3 md:p-3.5 rounded-2xl transition-all cursor-pointer text-left flex items-start justify-between gap-2 border ${isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 scale-[1.01]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100/90 hover:border-slate-300 border-slate-200/80'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{tab.icon || '📝'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-emerald-100' : 'text-emerald-700'}`}>
                          {tab.shortLabel || tab.label.split('.')[0]}
                        </span>
                      </div>
                      <div className={`text-sm md:text-base font-extrabold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {tab.simpleTitle || tab.label}
                      </div>
                      <div className={`text-xs truncate hidden sm:block ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {tab.desc || ''}
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs px-2 py-0.5 rounded-full font-black shrink-0 ${isActive ? 'bg-white text-emerald-800' : (count > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600')
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content: Table / Cards ───────────────────────────────────── */}
        <div className="bg-white rounded-b-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
              <div>
                <Title level={5} className="!mb-0 !font-extrabold text-slate-800 !text-base md:!text-lg leading-snug">
                  {currentTab.tableTitle}
                </Title>
                <Text className="text-sm text-slate-400">
                  Hiển thị <span className="font-bold text-slate-600">{currentRows.length}</span> bản ghi chép
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAddRecord}
                className="bg-emerald-600 hover:bg-emerald-700 border-none font-extrabold rounded-xl h-11 px-6 shadow-md shadow-emerald-600/20 text-base flex items-center gap-2"
              >
                Ghi nhật ký mới
              </Button>
              <Tooltip title="Làm mới bảng dữ liệu">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    const saved = localStorage.getItem(storageKey);
                    if (saved) setBooks(JSON.parse(saved));
                    message.success('Đã làm mới dữ liệu!');
                  }}
                  className="rounded-xl h-11 w-11 p-0 text-slate-500 hover:text-emerald-600 hover:border-emerald-400"
                />
              </Tooltip>
            </div>
          </div>

          {detailViewMode === 'table' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <Table
                dataSource={currentRows}
                columns={tableColumns}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: false }}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có bản ghi nào trong biểu này" /> }}
                className="premium-table-refined"
                bordered
              />
            </div>
          ) : (
            currentRows.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có bản ghi nào trong biểu này" />
            ) : (
              <Row gutter={[16, 16]}>
                {currentRows.map((row) => (
                  <Col xs={24} sm={12} md={8} key={row.id}>
                    <Card
                      className="rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all h-full flex flex-col justify-between"
                      styles={{ body: { padding: '16px' } }}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <Tag color="success" className="font-bold rounded-full text-xs px-2.5 py-0.5 border-none">
                            {row.ngay_thang || row.thoi_gian || row.thoi_gian_th || row.thoi_gian_thu_hoach || 'Bản ghi'}
                          </Tag>
                          <Space size="small">
                            <Popconfirm
                              title="Xóa bản ghi này?"
                              onConfirm={() => handleDeleteRecord(row.id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button type="text" icon={<DeleteOutlined className="text-rose-500 hover:text-rose-700" />} size="small" className="w-7 h-7 rounded-lg hover:bg-rose-50" />
                            </Popconfirm>
                          </Space>
                        </div>
                        {currentTab.columns.map((col) => (
                          <div key={col.key} className="text-xs flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 font-medium">{col.title}:</span>
                            <span className="text-slate-800 font-semibold text-right">{row[col.key] || '--'}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )
          )}
        </div>

      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <JournalRecordModal
        visible={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        onSave={handleSaveRecord}
        form={modalForm}
        currentTab={currentTab}
        editingRecord={editingRecord}
      />

      <JournalExportModal
        visible={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onExportPdf={() => exportJournalPdf(selectedBook)}
        onExportExcel={() => {
          exportJournalExcel(selectedBook, tabsConfig);
          setExportModalVisible(false);
        }}
        onPrintPreview={() => {
          printJournalHtml(selectedBook);
          setExportModalVisible(false);
        }}
      />

      {/* Edit Lot Info Modal */}
      <Modal
        title={<span className="text-lg font-black text-gray-900">✏️ Chỉnh sửa thông tin lô sản xuất</span>}
        open={editInfoVisible}
        onOk={handleSaveBookInfo}
        onCancel={() => setEditInfoVisible(false)}
        okText="Lưu thông tin"
        cancelText="Hủy"
        width={680}
        centered
        okButtonProps={{ className: 'bg-green-600 hover:bg-green-700 font-bold rounded-xl h-10 px-6' }}
        cancelButtonProps={{ className: 'rounded-xl h-10 px-6 font-bold' }}
      >
        <Form form={infoForm} layout="vertical" className="mt-4">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="hoTen" label="Họ tên tổ chức / cá nhân" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Input className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="maNongHo" label="Mã nông hộ" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Input className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="dienTich" label="Diện tích" rules={[{ required: true, message: 'Bắt buộc!' }]}>
                <Input placeholder="Test, 2.5 ha..." className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="matDo" label="Mật độ">
                <Input className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="tongTuiPhoi" label="Tổng túi phôi">
                <Input className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="ngayBatDauDatTui" label="Ngày bắt đầu đặt/treo túi phôi">
                <Input className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="diaChi" label="Địa chỉ">
                <Input className="h-11 rounded-xl" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Map Upload & View Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2.5 text-base md:text-lg font-black text-slate-800 border-b border-slate-100 pb-3">
            <span className="text-xl">🗺️</span>
            <span>Sơ đồ vườn trồng / Phân lô canh tác</span>
          </div>
        }
        open={mapUploadVisible}
        onCancel={() => setMapUploadVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setMapUploadVisible(false)}
            className="rounded-xl font-bold h-10 px-6 text-slate-700 hover:text-slate-900 border-slate-200"
          >
            Đóng
          </Button>
        ]}
        centered
        width={680}
      >
        <div className="py-3">
          {selectedBook?.soDoVuon ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sơ đồ hiện tại của lô sản xuất ({selectedBook.loSanXuat || 'Lô 01'})
                </span>
                <Popconfirm
                  title="Xóa sơ đồ vườn này?"
                  description="Bạn có thể tải lên sơ đồ mới bất cứ lúc nào."
                  onConfirm={() => {
                    setBooks(prev => prev.map(b => b.id === selectedBookId ? { ...b, soDoVuon: null, soDoVuonName: null } : b));
                    message.success('Đã xóa sơ đồ vườn!');
                  }}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} className="font-bold text-xs">
                    Xóa sơ đồ
                  </Button>
                </Popconfirm>
              </div>

              {/* If it's a base64 image or image url */}
              {selectedBook.soDoVuon.startsWith('data:image/') || selectedBook.soDoVuon.startsWith('http') ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 max-h-[420px]">
                  <img
                    src={selectedBook.soDoVuon}
                    alt="Sơ đồ vườn trồng"
                    className="max-h-[390px] w-auto max-w-full object-contain rounded-xl shadow-sm"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-4xl mb-2">📄</p>
                  <p className="text-sm font-bold text-slate-800">{selectedBook.soDoVuonName || selectedBook.soDoVuon}</p>
                  <p className="text-xs text-slate-400 mt-1">Đã lưu tệp sơ đồ thành công</p>
                </div>
              )}

              {/* Re-upload section */}
              <div className="pt-2">
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    if (file.type && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setBooks(prev => prev.map(b => b.id === selectedBookId ? { ...b, soDoVuon: e.target.result, soDoVuonName: file.name } : b));
                        message.success('Đã thay đổi sơ đồ vườn trồng mới thành công!');
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setBooks(prev => prev.map(b => b.id === selectedBookId ? { ...b, soDoVuon: file.name, soDoVuonName: file.name } : b));
                      message.success('Đã cập nhật tệp sơ đồ!');
                    }
                    return false;
                  }}
                >
                  <Button icon={<FileImageOutlined />} className="rounded-xl font-bold text-xs h-9">
                    Tải lên sơ đồ khác thay thế
                  </Button>
                </Upload>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <Upload.Dragger
                name="file"
                multiple={false}
                fileList={mapFileList}
                beforeUpload={(file) => {
                  if (file.type && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setBooks(prev => prev.map(b => b.id === selectedBookId ? { ...b, soDoVuon: e.target.result, soDoVuonName: file.name } : b));
                      message.success('Đã tải lên sơ đồ vườn trồng thành công!');
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setBooks(prev => prev.map(b => b.id === selectedBookId ? { ...b, soDoVuon: file.name, soDoVuonName: file.name } : b));
                    message.success('Đã tải lên sơ đồ vườn trồng thành công!');
                  }
                  return false;
                }}
                className="rounded-2xl p-6 bg-slate-50 hover:bg-emerald-50/50 border-2 border-dashed border-emerald-300 transition-all cursor-pointer"
              >
                <p className="text-5xl mb-3 text-emerald-600">🗺️</p>
                <p className="text-sm font-black text-slate-800 mb-1.5">Bấm hoặc kéo thả ảnh sơ đồ vườn vào đây</p>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  Hỗ trợ chụp ảnh trực tiếp hoặc chọn ảnh PNG, JPG (Sơ đồ vẽ tay, ảnh chụp bản đồ phân lô, vệ tinh)
                </p>
              </Upload.Dragger>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
