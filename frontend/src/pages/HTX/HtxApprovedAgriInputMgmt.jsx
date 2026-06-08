import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  LinkOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const typeOptions = [
  { value: 'PESTICIDE', label: 'Thuốc BVTV' },
  { value: 'FERTILIZER', label: 'Phân bón' },
];

const statusOptions = [
  { value: 'ALLOWED', label: 'Được phép' },
  { value: 'SUSPENDED', label: 'Tạm dừng' },
  { value: 'EXPIRED', label: 'Hết hiệu lực' },
];

const scopeOptions = [
  { value: 'HTX', label: 'Danh mục HTX' },
  { value: 'GLOBAL', label: 'Danh mục toàn hệ thống' },
];

const officialPpdSourceUrl = 'https://ppd.gov.vn/FileUpload/Documents/Thuoc%20BVTV/25.12.30_PL%201%20-%20Danh%20m%E1%BB%A5c%20%C4%91%C6%B0%E1%BB%A3c%20ph%C3%A9p%20s%E1%BB%AD%20d%E1%BB%A5ng.pdf';

const statusColor = {
  ALLOWED: 'success',
  SUSPENDED: 'warning',
  EXPIRED: 'default',
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const HtxApprovedAgriInputMgmt = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingSource, setUploadingSource] = useState(false);
  const [importingOfficial, setImportingOfficial] = useState(false);
  const [sourceDocument, setSourceDocument] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({ q: '', type: undefined, status: undefined });
  const [form] = Form.useForm();
  const [importForm] = Form.useForm();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/agri-inputs/approved', { params: filters });
      if (res.data.success) setItems(res.data.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải danh mục vật tư được phép.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const totals = useMemo(() => ({
    pesticide: items.filter(item => item.type === 'PESTICIDE').length,
    fertilizer: items.filter(item => item.type === 'FERTILIZER').length,
    allowed: items.filter(item => item.status === 'ALLOWED').length,
  }), [items]);

  const openCreate = () => {
    setEditingItem(null);
    form.resetFields();
    const sourceFileUrl = importForm.getFieldValue('sourceFileUrl');
    form.setFieldsValue({ type: 'PESTICIDE', status: 'ALLOWED', scope: 'HTX', sourceFileUrl });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingItem(record);
    setSourceDocument(
      record.sourceFileUrl || record.sourceUrl
        ? { url: record.sourceFileUrl, sourceUrl: record.sourceUrl, name: record.sourceFileName || 'PDF nguồn pháp lý' }
        : null
    );
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await api.put(`/agri-inputs/approved/${editingItem._id}`, values);
        message.success('Đã cập nhật vật tư.');
      } else {
        await api.post('/agri-inputs/approved', values);
        message.success('Đã thêm vật tư.');
      }
      setModalOpen(false);
      fetchItems();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể lưu vật tư.');
    }
  };

  const handleDelete = async (record) => {
    await api.delete(`/agri-inputs/approved/${record._id}`);
    message.success('Đã xóa vật tư.');
    fetchItems();
  };

  const handleImport = async (file) => {
    try {
      const values = importForm.getFieldsValue();
      const fileBase64 = await fileToBase64(file);
      const res = await api.post('/agri-inputs/approved/import', {
        fileBase64,
        type: values.type || 'PESTICIDE',
        scope: values.scope || 'HTX',
        sourceFileUrl: values.sourceFileUrl,
        sourceUrl: values.sourceUrl,
      });
      const data = res.data.data || {};
      message.success(`Đã nhập ${data.created || 0} mới, cập nhật ${data.updated || 0}, bỏ qua ${data.skipped || 0}.`);
      fetchItems();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể nhập file danh mục.');
    }
    return false;
  };

  const handleImportOfficialPdfRows = async () => {
    try {
      setImportingOfficial(true);
      const values = importForm.getFieldsValue();
      const res = await api.post('/agri-inputs/approved/import-official-ppd-pdf', {
        scope: values.scope || 'HTX',
        sourceUrl: values.sourceUrl || officialPpdSourceUrl,
        sourceFileUrl: values.sourceFileUrl,
      });
      const data = res.data.data || {};
      message.success(`Đã nhập ${data.created || 0} mới, cập nhật ${data.updated || 0}. Đọc được ${data.totalParsed || 0} dòng từ PDF.`);
      fetchItems();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể nhập danh mục từ PDF Cục BVTV.');
    } finally {
      setImportingOfficial(false);
    }
  };

  const handleSourcePdfUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      message.error('Chỉ nhận file PDF làm nguồn pháp lý.');
      return false;
    }

    try {
      setUploadingSource(true);
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/upload/document', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.url;
      const filename = res.data?.data?.filename || file.name;
      if (!url) throw new Error('Không nhận được URL file sau khi upload.');
      importForm.setFieldsValue({ sourceFileUrl: url, sourceUrl: undefined });
      form.setFieldsValue({ sourceFileUrl: url, sourceUrl: undefined });
      setSourceDocument({ url, name: filename });
      message.success('Đã tải PDF nguồn pháp lý lên Cloudinary.');
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải PDF nguồn pháp lý.');
    } finally {
      setUploadingSource(false);
    }
    return false;
  };

  const handleOfficialSourceImport = async () => {
    try {
      setUploadingSource(true);
      const res = await api.post('/upload/document-from-url', { url: officialPpdSourceUrl });
      const url = res.data?.data?.url;
      const filename = res.data?.data?.filename || 'Danh mục thuốc BVTV được phép sử dụng tại Việt Nam.pdf';
      if (!url) throw new Error('Không nhận được URL file sau khi tải nguồn.');
      importForm.setFieldsValue({ sourceFileUrl: url, sourceUrl: officialPpdSourceUrl });
      form.setFieldsValue({ sourceFileUrl: url, sourceUrl: officialPpdSourceUrl });
      setSourceDocument({ url, name: filename, sourceUrl: officialPpdSourceUrl });
      message.success('Đã tải PDF nguồn Cục BVTV vào hệ thống.');
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải PDF nguồn Cục BVTV.');
    } finally {
      setUploadingSource(false);
    }
  };

  const clearSourceDocument = () => {
    setSourceDocument(null);
    importForm.setFieldsValue({ sourceFileUrl: undefined });
    importForm.setFieldsValue({ sourceUrl: undefined });
    form.setFieldsValue({ sourceFileUrl: undefined, sourceUrl: undefined });
  };

  const openPdfDocument = async (url, sourceUrl) => {
    if (sourceUrl) {
      window.open(sourceUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const targetUrl = String(url || '')
      .replace('/image/upload/', '/raw/upload/')
      .replace(/\.pdf\.pdf($|\?)/, '.pdf$1');
    if (!targetUrl) {
      message.error('Chưa có tài liệu PDF để mở.');
      return;
    }

    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể mở tài liệu PDF.');
    }
  };

  const columns = [
    {
      title: 'Vật tư',
      key: 'name',
      fixed: 'left',
      width: 260,
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong>{record.tradeName}</Text>
          <Text className="text-xs text-gray-500">{record.registrationNo || 'Chưa có số đăng ký'}</Text>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      width: 120,
      render: (type) => <Tag color={type === 'PESTICIDE' ? 'red' : 'green'}>{typeOptions.find(item => item.value === type)?.label || type}</Tag>,
    },
    { title: 'Hoạt chất/thành phần', dataIndex: 'activeIngredient', width: 220 },
    { title: 'Cây trồng', dataIndex: 'cropName', width: 160 },
    { title: 'Đối tượng', dataIndex: 'targetPest', width: 180 },
    { title: 'Liều lượng', dataIndex: 'dosage', width: 160 },
    {
      title: 'Cách ly',
      dataIndex: 'phiDays',
      width: 110,
      render: (value, record) => record.type === 'PESTICIDE' ? `${Number(value || 0)} ngày` : '--',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (status) => <Tag color={statusColor[status]}>{statusOptions.find(item => item.value === status)?.label || status}</Tag>,
    },
    {
      title: 'Nguồn pháp lý',
      key: 'source',
      width: 240,
      render: (_, record) => (
        <div className="flex flex-col">
          <Text>{record.legalDocumentNo || '--'}</Text>
          {record.version && <Text className="text-xs text-gray-500">Phiên bản: {record.version}</Text>}
          {(record.sourceFileUrl || record.sourceUrl) && (
            <button type="button" onClick={() => openPdfDocument(record.sourceFileUrl, record.sourceUrl)} className="text-xs text-green-700 text-left">
              <LinkOutlined /> PDF nguồn
            </button>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xóa vật tư này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(record)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Kiểm soát vật tư đầu vào</Text>
          <Title level={2} className="!mb-1 flex items-center gap-3">
            <SafetyCertificateOutlined className="text-green-600" /> Danh mục vật tư được phép
          </Title>
          <Paragraph className="!mb-0 text-gray-500 max-w-4xl">
            Quản lý thuốc BVTV, phân bón theo danh mục được phép, số đăng ký, hoạt chất, cây trồng và thời gian cách ly để kiểm tra nhật ký trước khi duyệt.
          </Paragraph>
        </div>
        <Space wrap>
          <Button icon={<SearchOutlined />} onClick={fetchItems}>Lọc dữ liệu</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm vật tư</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card className="rounded-2xl"><Statistic title="Thuốc BVTV" value={totals.pesticide} prefix={<ExperimentOutlined />} /></Card></Col>
        <Col xs={24} md={8}><Card className="rounded-2xl"><Statistic title="Phân bón" value={totals.fertilizer} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={24} md={8}><Card className="rounded-2xl"><Statistic title="Đang được phép" value={totals.allowed} /></Card></Col>
      </Row>

      <Card bordered={false} className="rounded-2xl shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 mb-4">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm tên thương mại, hoạt chất, số đăng ký..."
            value={filters.q}
            onChange={(event) => setFilters(prev => ({ ...prev, q: event.target.value }))}
            className="max-w-md"
          />
          <Select
            allowClear
            placeholder="Loại vật tư"
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            options={typeOptions}
            className="w-44"
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            options={statusOptions}
            className="w-44"
          />
        </div>

        <Card size="small" className="rounded-xl bg-green-50/40 mb-4">
          <Form form={importForm} layout="inline" initialValues={{ type: 'PESTICIDE', scope: 'HTX' }} className="gap-3">
            <Form.Item name="type" label="Loại danh mục"><Select options={typeOptions} className="w-40" /></Form.Item>
            <Form.Item name="scope" label="Phạm vi"><Select options={scopeOptions} className="w-48" /></Form.Item>
            <Form.Item name="sourceFileUrl" hidden><Input /></Form.Item>
            <Form.Item name="sourceUrl" hidden><Input /></Form.Item>
            <Upload accept=".pdf,application/pdf" showUploadList={false} beforeUpload={handleSourcePdfUpload}>
              <Button icon={<FilePdfOutlined />} loading={uploadingSource}>Tải PDF nguồn</Button>
            </Upload>
            <Button icon={<FilePdfOutlined />} loading={uploadingSource} onClick={handleOfficialSourceImport}>
              Dùng nguồn Cục BVTV
            </Button>
            <Button type="primary" icon={<FilePdfOutlined />} loading={importingOfficial} onClick={handleImportOfficialPdfRows}>
              Nhập danh mục từ PDF
            </Button>
            <Upload accept=".xlsx,.xls,.csv" showUploadList={false} beforeUpload={handleImport}>
              <Button icon={<FileExcelOutlined />}>Import Excel/CSV</Button>
            </Upload>
          </Form>
          {sourceDocument?.url && (
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-green-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <FilePdfOutlined />
                </div>
                <div className="min-w-0">
                  <Text strong className="block truncate">{sourceDocument.name}</Text>
                  <Text className="text-xs text-green-700">Đã lưu vào hệ thống làm PDF nguồn pháp lý</Text>
                </div>
              </div>
              <Space>
                <Button size="small" icon={<LinkOutlined />} onClick={() => openPdfDocument(sourceDocument.url, sourceDocument.sourceUrl)}>Xem PDF</Button>
                <Button size="small" danger onClick={clearSourceDocument}>Bỏ nguồn</Button>
              </Space>
            </div>
          )}
          <Text className="block text-xs text-gray-500 mt-3">
            Bấm "Dùng nguồn Cục BVTV" để gắn tài liệu pháp lý, sau đó bấm "Nhập danh mục từ PDF" để đọc các dòng thuốc vào bảng. Với dữ liệu cần đối chiếu tuyệt đối, vẫn nên kiểm tra lại và có thể nhập bổ sung bằng Excel/CSV.
          </Text>
        </Card>

        <Table
          columns={columns}
          dataSource={items}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Cập nhật vật tư' : 'Thêm vật tư được phép'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={860}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Row gutter={16}>
            <Col xs={24} md={8}><Form.Item name="type" label="Loại vật tư" rules={[{ required: true }]}><Select options={typeOptions} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="status" label="Trạng thái"><Select options={statusOptions} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="scope" label="Phạm vi"><Select options={scopeOptions} /></Form.Item></Col>
            <Col xs={24} md={16}><Form.Item name="tradeName" label="Tên thương mại/tên vật tư" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="registrationNo" label="Số đăng ký"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="activeIngredient" label="Hoạt chất/thành phần"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="manufacturer" label="Nhà sản xuất"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="category" label="Nhóm"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="cropName" label="Cây trồng áp dụng"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="targetPest" label="Đối tượng phòng trừ"><Input /></Form.Item></Col>
            <Col xs={24} md={16}><Form.Item name="dosage" label="Liều lượng/cách dùng"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="phiDays" label="Thời gian cách ly (ngày)"><InputNumber min={0} className="w-full" /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="legalDocumentNo" label="Số văn bản pháp lý"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="version" label="Phiên bản danh mục"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="sourceUrl" label="URL trang nguồn"><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item name="sourceFileUrl" hidden><Input /></Form.Item></Col>
            {sourceDocument?.url && (
              <Col xs={24}>
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <Space className="w-full justify-between" wrap>
                    <Space>
                      <FilePdfOutlined className="text-red-500" />
                      <div>
                        <Text strong>{sourceDocument.name}</Text>
                        <Text className="block text-xs text-green-700">PDF nguồn pháp lý đã gắn với bản ghi</Text>
                      </div>
                    </Space>
                    <Button size="small" icon={<LinkOutlined />} onClick={() => openPdfDocument(sourceDocument.url, sourceDocument.sourceUrl)}>Xem PDF</Button>
                  </Space>
                </div>
              </Col>
            )}
            <Col span={24}><Form.Item name="notes" label="Ghi chú"><TextArea rows={3} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default HtxApprovedAgriInputMgmt;
