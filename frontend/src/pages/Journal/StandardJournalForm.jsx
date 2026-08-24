import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Card, Row, Col, Typography,
  Table, Modal, Upload, message, Popconfirm, Tag, Tooltip,
  Space, Empty, Pagination
} from 'antd';
import {
  ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined,
  ReloadOutlined, ExportOutlined, AppstoreOutlined, UnorderedListOutlined
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
      try { return JSON.parse(saved); } catch (e) {}
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
    } catch (e) {}
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
      if ((col.type === 'date' || col.type === 'datetime') && values[col.key]) {
        values[col.key] = dayjs(values[col.key], col.type === 'datetime' ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY');
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
        } else if (col.type === 'datetime' && formatted[col.key]) {
          formatted[col.key] = dayjs(formatted[col.key]).format('DD/MM/YYYY HH:mm');
        }
      });

      setBooks(prev => prev.map(b => {
        if (b.id !== selectedBookId) return b;
        const prevTabRows = b.tablesData?.[activeTabKey] || [];
        let newTabRows;
        if (editingRecord) {
          newTabRows = prevTabRows.map(r => r.id === editingRecord.id ? { ...formatted, id: editingRecord.id } : r);
        } else {
          newTabRows = [{ ...formatted, id: Date.now().toString() }, ...prevTabRows];
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
    ...currentTab.columns.map(col => ({
      title: col.title,
      dataIndex: col.key,
      key: col.key,
      render: (text) => {
        if (!text && text !== 0) return <span className="text-gray-300 italic">--</span>;
        if (col.key === 'danh_gia') {
          const isGood = String(text).toLowerCase().includes('đạt') && !String(text).toLowerCase().includes('không');
          return <Tag color={isGood ? 'green' : 'red'} className="font-bold">{text}</Tag>;
        }
        return <span className="text-gray-800 text-sm">{text}</span>;
      }
    })),
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
            size="small"
            onClick={() => handleOpenEditRecord(record)}
          />
          <Popconfirm
            title="Xóa bản ghi này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteRecord(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined className="text-red-500 hover:text-red-700" />}
              size="small"
            />
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <Title level={4} className="!mb-0 !font-bold text-gray-900">
              {standardModelTitle}
            </Title>
            <Button
              icon={listViewMode === 'card' ? <UnorderedListOutlined /> : <AppstoreOutlined />}
              onClick={() => setListViewMode(listViewMode === 'card' ? 'table' : 'card')}
              className="rounded-xl font-bold text-gray-700 hover:text-green-600 hover:border-green-500 h-10 px-4 bg-white"
            >
              {listViewMode === 'card' ? 'Xem ở dạng bảng' : 'Xem ở dạng thẻ'}
            </Button>
          </div>

          {/* Main Card Container */}
          <Card
            className="rounded-2xl border-t-2 border-t-green-600 border-x-0 border-b-0 bg-white shadow-sm overflow-hidden"
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div className="flex items-center justify-end gap-3 mb-6">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  createBookForm.resetFields();
                  createBookForm.setFieldsValue({
                    maNongHo: user?.farmCode || 'test',
                    hoTen: user?.fullname || user?.username || 'test',
                    ngayBatDau: dayjs(),
                    dienTich: 'Test',
                    matDo: '10',
                    tongTuiPhoi: '10',
                    ngayBatDauDatTui: '2',
                    diaChi: user?.address || 'tes',
                    loaiSo: 'Sầu riêng',
                    loSanXuat: 'Test'
                  });
                  setCreateModalVisible(true);
                }}
                className="bg-green-600 hover:bg-green-700 border-none font-bold rounded-xl h-10 px-5 shadow-sm"
              >
                Tạo sổ nhật ký
              </Button>
              <Tooltip title="Làm mới danh sách">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    const saved = localStorage.getItem(storageKey);
                    if (saved) setBooks(JSON.parse(saved));
                    message.success('Đã làm mới danh sách sổ!');
                  }}
                  className="rounded-xl h-10 w-10 p-0 text-gray-500 hover:text-green-600"
                />
              </Tooltip>
            </div>

            {/* List Content */}
            {listViewMode === 'card' ? (
              books.length === 0 ? (
                <Empty description="Chưa có sổ nhật ký nào. Bấm '+ Tạo sổ nhật ký' để tạo mới." className="py-12" />
              ) : (
                <Row gutter={[24, 24]}>
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
                  { title: 'STT', key: 'idx', width: 60, render: (_, __, i) => i + 1 },
                  { title: 'Mã nông hộ / Họ tên', key: 'user', render: (_, r) => <span className="font-bold text-gray-900">{r.maNongHo} - {r.hoTen}</span> },
                  { title: 'Loại sổ', dataIndex: 'loaiSo', key: 'loaiSo', render: t => <Tag color="green" className="font-bold">{t}</Tag> },
                  { title: 'Lô sản xuất', dataIndex: 'loSanXuat', key: 'loSanXuat' },
                  { title: 'Diện tích', dataIndex: 'dienTich', key: 'dienTich' },
                  { title: 'Ngày bắt đầu', dataIndex: 'ngayBatDau', key: 'ngayBatDau' },
                  { title: 'Địa chỉ', dataIndex: 'diaChi', key: 'diaChi' },
                  {
                    title: 'Thao tác',
                    key: 'action',
                    align: 'center',
                    render: (_, r) => (
                      <Space>
                        <Button
                          type="link"
                          onClick={() => setSelectedBookId(r.id)}
                          className="text-green-600 font-bold p-0"
                        >
                          Vào sổ nhật ký &gt;
                        </Button>
                        <Popconfirm
                          title="Xóa sổ này?"
                          onConfirm={() => handleDeleteBook(r.id)}
                          okButtonProps={{ danger: true }}
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
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
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => setSelectedBookId(null)}
            icon={<ArrowLeftOutlined />}
            className="rounded-xl font-bold text-gray-700 hover:text-green-600 hover:border-green-500 h-10 px-4"
          >
            Quay lại
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
              className="rounded-xl font-bold h-10 px-4 hover:shadow-sm"
            >
              Xóa sổ nhật ký
            </Button>
          </Popconfirm>
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

        {/* ── Action Buttons ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 mb-3">
          <Button
            icon={<ExportOutlined />}
            onClick={() => setExportModalVisible(true)}
            className="rounded-xl font-bold text-gray-700 hover:text-green-600 hover:border-green-500 h-10 px-4 bg-white"
          >
            Xuất nhật ký
          </Button>

          <Button
            icon={detailViewMode === 'table' ? <AppstoreOutlined /> : <UnorderedListOutlined />}
            onClick={() => setDetailViewMode(detailViewMode === 'table' ? 'card' : 'table')}
            className="rounded-xl font-bold text-gray-700 hover:text-green-600 hover:border-green-500 h-10 px-4 bg-white"
          >
            {detailViewMode === 'table' ? 'Xem ở dạng thẻ' : 'Xem ở dạng bảng'}
          </Button>
        </div>

        {/* ── 4 Tabs Navigation ────────────────────────────────────────────── */}
        <div className="bg-white rounded-t-2xl border-b border-gray-200 px-4 pt-2 overflow-x-auto shadow-sm">
          <div className="flex space-x-2 whitespace-nowrap min-w-max">
            {tabsConfig.map((tab) => {
              const isActive = tab.key === activeTabKey;
              const count = (selectedBook.tablesData?.[tab.key] || []).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTabKey(tab.key)}
                  className={`px-4 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'border-green-600 text-green-600 font-black'
                      : 'border-transparent text-gray-600 hover:text-green-600'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content: Table / Cards ───────────────────────────────────── */}
        <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-100">
            <Title level={5} className="!mb-0 !font-black text-gray-900 leading-snug">
              {currentTab.tableTitle}
            </Title>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAddRecord}
                className="bg-green-600 hover:bg-green-700 border-none font-bold rounded-xl h-10 px-5 shadow-sm"
              >
                Ghi nhật ký
              </Button>
              <Tooltip title="Làm mới bảng">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    const saved = localStorage.getItem(storageKey);
                    if (saved) setBooks(JSON.parse(saved));
                    message.success('Đã làm mới dữ liệu!');
                  }}
                  className="rounded-xl h-10 w-10 p-0 text-gray-500 hover:text-green-600"
                />
              </Tooltip>
            </div>
          </div>

          {detailViewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table
                dataSource={currentRows}
                columns={tableColumns}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: false }}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" /> }}
                className="premium-table-refined"
                bordered
              />
            </div>
          ) : (
            currentRows.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />
            ) : (
              <Row gutter={[16, 16]}>
                {currentRows.map((row) => (
                  <Col xs={24} sm={12} md={8} key={row.id}>
                    <Card
                      className="rounded-2xl border-gray-200 hover:shadow-md transition-all h-full flex flex-col justify-between"
                      styles={{ body: { padding: '16px' } }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <Tag color="green" className="font-bold rounded-lg text-xs">
                            {row.ngay_thang || row.thoi_gian || row.thoi_gian_th || row.thoi_gian_thu_hoach || 'Bản ghi'}
                          </Tag>
                          <Space size="small">
                            <Button
                              type="text"
                              icon={<EditOutlined className="text-blue-500" />}
                              size="small"
                              onClick={() => handleOpenEditRecord(row)}
                            />
                            <Popconfirm
                              title="Xóa bản ghi này?"
                              onConfirm={() => handleDeleteRecord(row.id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button type="text" icon={<DeleteOutlined className="text-red-500" />} size="small" />
                            </Popconfirm>
                          </Space>
                        </div>
                        {currentTab.columns.map((col) => (
                          <div key={col.key} className="text-xs">
                            <span className="text-gray-400 font-semibold">{col.title}: </span>
                            <span className="text-gray-800 font-medium">{row[col.key] || '--'}</span>
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

      {/* Map Upload Modal */}
      <Modal
        title={<span className="text-lg font-black text-gray-900">🗺️ Tải lên sơ đồ vườn trồng / Vùng sản xuất</span>}
        open={mapUploadVisible}
        onCancel={() => setMapUploadVisible(false)}
        footer={[
          <Button key="close" onClick={() => setMapUploadVisible(false)} className="rounded-xl font-bold">
            Đóng
          </Button>
        ]}
        centered
        width={500}
      >
        <div className="py-4 text-center">
          <Upload.Dragger
            name="file"
            multiple={false}
            fileList={mapFileList}
            onChange={(info) => {
              setMapFileList(info.fileList);
              if (info.file.status === 'done' || info.file.originFileObj) {
                setBooks(prev => prev.map(b => b.id === selectedBookId ? { ...b, soDoVuon: info.file.name } : b));
                message.success('Đã tải lên sơ đồ vườn trồng thành công!');
              }
            }}
            beforeUpload={() => false}
            className="rounded-2xl p-4 bg-gray-50 border-2 border-dashed border-green-300"
          >
            <p className="text-4xl mb-2">📄</p>
            <p className="text-sm font-bold text-gray-800 mb-1">Kéo thả hoặc bấm để chọn tệp sơ đồ</p>
            <p className="text-xs text-gray-400">Hỗ trợ: Hình ảnh PNG, JPG, PDF, bản đồ số GIS (tối đa 10MB)</p>
          </Upload.Dragger>
        </div>
      </Modal>

    </div>
  );
}
