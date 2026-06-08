import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
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
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileDoneOutlined,
  PlusOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const statusOptions = [
  { value: 'Draft', label: 'Dự thảo' },
  { value: 'Active', label: 'Đang hiệu lực' },
  { value: 'Suspended', label: 'Tạm dừng' },
  { value: 'Archived', label: 'Lưu trữ' },
];

const parseBoundary = (value) => String(value || '')
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => {
    const [lat, lng] = line.split(',').map(item => Number(String(item).trim()));
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  })
  .filter(Boolean);

const formatBoundary = (boundary = []) => boundary
  .map(point => `${point.lat}, ${point.lng}`)
  .join('\n');

const parsePesticides = (value) => String(value || '')
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => {
    const [tradeName, activeIngredient, phiDays, registrationNo] = line.split('|').map(item => String(item || '').trim());
    return {
      tradeName,
      activeIngredient,
      phiDays: Number(phiDays) || 0,
      registrationNo,
    };
  });

const formatPesticides = (items = []) => items
  .map(item => [item.tradeName, item.activeIngredient, item.phiDays, item.registrationNo].filter(value => value !== undefined).join(' | '))
  .join('\n');

const HtxPlantingRegionMgmt = () => {
  const [regions, setRegions] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [dossier, setDossier] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/htx/planting-regions');
      if (res.data.success) setRegions(res.data.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách vùng trồng');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmers = async () => {
    try {
      const res = await api.get('/htx/journals/farmers');
      if (res.data.success) setFarmers(res.data.data || []);
    } catch (error) {
      setFarmers([]);
    }
  };

  useEffect(() => {
    fetchRegions();
    fetchFarmers();
  }, []);

  const totals = useMemo(() => ({
    active: regions.filter(item => item.status === 'Active').length,
    farmers: regions.reduce((sum, item) => sum + (item.farmerIds?.length || 0), 0),
    area: regions.reduce((sum, item) => sum + Number(item.areaM2 || 0), 0),
  }), [regions]);

  const openCreate = () => {
    setEditingRegion(null);
    form.resetFields();
    form.setFieldsValue({ status: 'Draft', standard: 'VietGAP' });
    setModalOpen(true);
  };

  const openEdit = (region) => {
    setEditingRegion(region);
    form.setFieldsValue({
      ...region,
      farmerIds: region.farmerIds?.map(item => item._id || item) || [],
      centerLat: region.center?.lat,
      centerLng: region.center?.lng,
      boundaryText: formatBoundary(region.boundary),
      pesticidesText: formatPesticides(region.allowedPesticides),
      ...region.inspectionProfile,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = {
      code: values.code,
      name: values.name,
      cropName: values.cropName,
      standard: values.standard,
      province: values.province,
      ward: values.ward,
      address: values.address,
      areaM2: values.areaM2,
      status: values.status,
      farmerIds: values.farmerIds || [],
      center: {
        lat: values.centerLat,
        lng: values.centerLng,
      },
      boundary: parseBoundary(values.boundaryText),
      allowedPesticides: parsePesticides(values.pesticidesText),
      inspectionProfile: {
        trainingReady: !!values.trainingReady,
        internalAuditReady: !!values.internalAuditReady,
        harvestProfileReady: !!values.harvestProfileReady,
        salesProfileReady: !!values.salesProfileReady,
        gaccReady: !!values.gaccReady,
        notes: values.notes,
      },
    };

    try {
      if (editingRegion) {
        await api.put(`/htx/planting-regions/${editingRegion._id}`, payload);
        message.success('Đã cập nhật vùng trồng');
      } else {
        await api.post('/htx/planting-regions', payload);
        message.success('Đã tạo vùng trồng');
      }
      setModalOpen(false);
      fetchRegions();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể lưu vùng trồng');
    }
  };

  const handleDelete = async (region) => {
    await api.delete(`/htx/planting-regions/${region._id}`);
    message.success('Đã xóa vùng trồng');
    fetchRegions();
  };

  const openDossier = async (region) => {
    try {
      setDossierOpen(true);
      setDossierLoading(true);
      const res = await api.get(`/htx/planting-regions/${region._id}/dossier`);
      if (res.data.success) setDossier(res.data.data);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải hồ sơ thanh tra');
    } finally {
      setDossierLoading(false);
    }
  };

  const printDossier = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !dossier) return;
    const checksHtml = (dossier.checks || []).map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.label}</td>
        <td>${item.evidence || ''}</td>
        <td>${item.ok ? 'Đạt' : 'Cần bổ sung'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Hồ sơ thanh tra vùng trồng</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; text-align: center; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #111827; padding: 8px; font-size: 12px; vertical-align: top; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Hồ sơ thanh tra vùng trồng</h1>
          <p><strong>Mã vùng:</strong> ${dossier.region?.code || ''}</p>
          <p><strong>Tên vùng:</strong> ${dossier.region?.name || ''}</p>
          <p><strong>Sản phẩm:</strong> ${dossier.region?.cropName || ''}</p>
          <table>
            <thead><tr><th>STT</th><th>Tiêu chí</th><th>Minh chứng</th><th>Trạng thái</th></tr></thead>
            <tbody>${checksHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const columns = [
    {
      title: 'Vùng trồng',
      key: 'region',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong>{record.name}</Text>
          <Text className="text-xs text-gray-500">{record.code} · {record.cropName || 'Chưa có sản phẩm'}</Text>
        </div>
      ),
    },
    {
      title: 'Địa điểm/GPS',
      key: 'location',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text>{record.ward || '--'}, {record.province || '--'}</Text>
          <Text className="text-xs text-gray-500">
            {record.center?.lat && record.center?.lng ? `${record.center.lat}, ${record.center.lng}` : 'Chưa có tọa độ'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Hộ/diện tích',
      key: 'farmers',
      render: (_, record) => (
        <Space wrap>
          <Tag color="green">{record.farmerIds?.length || 0} hộ</Tag>
          <Tag color="blue">{Number(record.areaM2 || 0).toLocaleString('vi-VN')} m²</Tag>
        </Space>
      ),
    },
    {
      title: 'Thuốc BVTV',
      key: 'pesticides',
      render: (_, record) => <Tag color={record.allowedPesticides?.length ? 'purple' : 'default'}>{record.allowedPesticides?.length || 0} hoạt chất</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        const color = status === 'Active' ? 'success' : status === 'Suspended' ? 'warning' : 'default';
        return <Tag color={color}>{statusOptions.find(item => item.value === status)?.label || status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<FileDoneOutlined />} onClick={() => openDossier(record)}>Hồ sơ</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xóa vùng trồng này?" okText="Xóa" cancelText="Hủy" onConfirm={() => handleDelete(record)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Hồ sơ vùng trồng & thanh tra</Text>
          <Title level={2} className="!mb-1 flex items-center gap-3">
            <EnvironmentOutlined className="text-green-600" /> Mã số vùng trồng
          </Title>
          <Paragraph className="!mb-0 text-gray-500 max-w-3xl">
            Quản lý mã vùng, tọa độ GPS, danh sách hộ, thuốc BVTV được phép và bộ hồ sơ minh chứng khi thanh tra.
          </Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="rounded-xl h-11 px-5">
          Thêm vùng trồng
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card className="rounded-2xl"><Statistic title="Tổng vùng trồng" value={regions.length} /></Card></Col>
        <Col xs={24} md={8}><Card className="rounded-2xl"><Statistic title="Đang hiệu lực" value={totals.active} /></Card></Col>
        <Col xs={24} md={8}><Card className="rounded-2xl"><Statistic title="Tổng diện tích" value={totals.area} suffix="m²" /></Card></Col>
      </Row>

      <Card bordered={false} className="rounded-2xl shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={regions} rowKey="_id" loading={loading} scroll={{ x: 1000 }} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingRegion ? 'Cập nhật vùng trồng' : 'Thêm vùng trồng'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={900}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Row gutter={16}>
            <Col span={8}><Form.Item name="code" label="Mã số vùng trồng" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="name" label="Tên vùng trồng" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="cropName" label="Sản phẩm/cây trồng"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="standard" label="Tiêu chuẩn"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="status" label="Trạng thái"><Select options={statusOptions} /></Form.Item></Col>
            <Col span={8}><Form.Item name="province" label="Tỉnh/Thành phố"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="ward" label="Phường/Xã"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="areaM2" label="Diện tích (m²)"><InputNumber min={0} className="w-full" /></Form.Item></Col>
            <Col span={24}><Form.Item name="address" label="Địa chỉ chi tiết"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="centerLat" label="Tọa độ trung tâm - Latitude"><InputNumber className="w-full" /></Form.Item></Col>
            <Col span={12}><Form.Item name="centerLng" label="Tọa độ trung tâm - Longitude"><InputNumber className="w-full" /></Form.Item></Col>
            <Col span={24}>
              <Form.Item name="boundaryText" label="Ranh giới vùng trồng" extra="Mỗi dòng nhập một điểm theo dạng: latitude, longitude. Tối thiểu 3 điểm để đủ hồ sơ bản đồ.">
                <TextArea rows={4} placeholder="21.012345, 105.987654" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="farmerIds" label="Hộ/nông dân thuộc vùng trồng">
                <Select
                  mode="multiple"
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={farmers.map(farmer => ({
                    value: farmer._id,
                    label: `${farmer.fullname || farmer.username} - ${farmer.farmCode || farmer.username || ''}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="pesticidesText" label="Danh mục thuốc BVTV được phép" extra="Mỗi dòng: Tên thương mại | Hoạt chất | Số ngày cách ly | Số đăng ký">
                <TextArea rows={4} placeholder="Ví dụ: Abamectin 3.6EC | Abamectin | 7 | VN-12345" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Descriptions bordered size="small" column={2} title="Đánh dấu hồ sơ đã được chuẩn bị ngoài hệ thống">
                <Descriptions.Item label="Tập huấn"><Form.Item name="trainingReady" valuePropName="checked" noStyle><Select options={[{ value: true, label: 'Đã có' }, { value: false, label: 'Chưa có' }]} /></Form.Item></Descriptions.Item>
                <Descriptions.Item label="Giám sát nội bộ"><Form.Item name="internalAuditReady" noStyle><Select options={[{ value: true, label: 'Đã có' }, { value: false, label: 'Chưa có' }]} /></Form.Item></Descriptions.Item>
                <Descriptions.Item label="Hồ sơ thu hoạch"><Form.Item name="harvestProfileReady" noStyle><Select options={[{ value: true, label: 'Đã có' }, { value: false, label: 'Chưa có' }]} /></Form.Item></Descriptions.Item>
                <Descriptions.Item label="Hồ sơ bán hàng"><Form.Item name="salesProfileReady" noStyle><Select options={[{ value: true, label: 'Đã có' }, { value: false, label: 'Chưa có' }]} /></Form.Item></Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={24}><Form.Item name="notes" label="Ghi chú hồ sơ thanh tra"><TextArea rows={3} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title="Hồ sơ thanh tra vùng trồng"
        open={dossierOpen}
        onClose={() => setDossierOpen(false)}
        width={760}
        extra={<Button icon={<FileDoneOutlined />} onClick={printDossier} disabled={!dossier}>In/xuất PDF</Button>}
      >
        <Table
          rowKey="key"
          loading={dossierLoading}
          pagination={false}
          dataSource={dossier?.checks || []}
          columns={[
            { title: 'Tiêu chí', dataIndex: 'label' },
            { title: 'Minh chứng', dataIndex: 'evidence', width: 180 },
            {
              title: 'Trạng thái',
              width: 130,
              render: (_, record) => record.ok
                ? <Tag icon={<CheckCircleOutlined />} color="success">Đạt</Tag>
                : <Tag icon={<WarningOutlined />} color="warning">Cần bổ sung</Tag>,
            },
          ]}
        />
        <Title level={5} className="!mt-6">Nhật ký cần chú ý</Title>
        <Table
          rowKey="journalId"
          pagination={{ pageSize: 5 }}
          dataSource={(dossier?.journals || []).filter(item => !item.compliance?.ok || item.compliance?.warnings?.length)}
          columns={[
            { title: 'Nông dân', render: (_, record) => record.farmer?.fullname || record.farmer?.username || '--' },
            { title: 'Sổ', render: (_, record) => record.schema?.name || '--' },
            { title: 'Trạng thái', dataIndex: 'status' },
            {
              title: 'Vấn đề',
              render: (_, record) => [...(record.compliance?.blockers || []), ...(record.compliance?.warnings || [])].join('; ') || '--',
            },
          ]}
        />
      </Drawer>
    </div>
  );
};

export default HtxPlantingRegionMgmt;
