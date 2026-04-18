import React, { useState } from 'react';
import { Card, Table, Typography, Button, Space, Modal, Drawer, Select, QRCode, Tag, Badge, Row, Col, Form } from 'antd';
import { PlusOutlined, EditOutlined, QrcodeOutlined, EyeOutlined, BarsOutlined, AppstoreOutlined, CalendarOutlined, EnvironmentOutlined, ProfileOutlined, TagOutlined, RightOutlined, FileOutlined } from '@ant-design/icons';
import { Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;

const JournalList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định category dựa theo URL hiện tại
  const getCategoryFromPath = (path) => {
    if (path.startsWith('/vietgap')) {
      if (path.includes('chan-nuoi')) return { key: 'channuoi', label: 'VietGAP Chăn nuôi', desc: 'Quản lý nhật ký chăn nuôi theo tiêu chuẩn VietGAP' };
      if (path.includes('thuy-san')) return { key: 'thuyssan', label: 'VietGAP Thủy sản', desc: 'Quản lý nhật ký nuôi trồng thủy sản theo VietGAP' };
      return { key: 'trongtrot', label: 'VietGAP Trồng trọt', desc: 'Quản lý nhật ký sản xuất trồng trọt theo tiêu chuẩn VietGAP' };
    }
    if (path.startsWith('/huuco')) {
      if (path.includes('cay-trong')) return { key: 'huuco_caytrong', label: 'Hữu cơ - Cây trồng', desc: 'Nhật ký sản xuất cây trồng hữu cơ' };
      if (path.includes('chan-nuoi')) return { key: 'huuco_channuoi', label: 'Hữu cơ - Chăn nuôi', desc: 'Nhật ký chăn nuôi hữu cơ' };
      if (path.includes('thuy-san')) return { key: 'huuco_thuyssan', label: 'Hữu cơ - Thủy sản', desc: 'Nhật ký thủy sản hữu cơ' };
      return { key: 'huuco', label: 'Nông nghiệp Hữu cơ', desc: 'Nhật ký sản xuất hữu cơ, không sử dụng hoá chất tổng hợp' };
    }
    if (path.startsWith('/thongminh')) return { key: 'thongminh', label: 'Nông nghiệp Thông minh', desc: 'Nhật ký sản xuất ứng dụng công nghệ cao' };
    return { key: null, label: 'Danh sách sổ nhật ký', desc: 'Toàn bộ nhật ký sản xuất' };
  };

  const category = getCategoryFromPath(location.pathname);

  const [schemaModalVisible, setSchemaModalVisible] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [currentQr, setCurrentQr] = useState('');
  const [viewMode, setViewMode] = useState('card');

  const { data: journalsRaw, isLoading } = useQuery({
    queryKey: ['journals', category.key],
    queryFn: () => {
      const params = category.key ? `?category=${category.key}` : '';
      return api.get(`/journals${params}`).then(res => res.data.data);
    }
  });

  const { data: schemasRaw } = useQuery({
    queryKey: ['schemas', category.key],
    queryFn: () => {
      const params = category.key ? `?category=${category.key}` : '';
      return api.get(`/schemas${params}`).then(res => res.data.data);
    }
  });

  // Lọc dự phòng phía client: nếu backend chưa có field category thì filter theo tên
  const channuoiNames = new Set(['Gia cầm', 'Bò thịt', 'Bò sữa', 'Ong', 'Dê thịt', 'Dê sữa', 'Lợn thịt', 'Lúa hữu cơ']);
  
  const schemas = schemasRaw?.filter(s => {
    if (!category.key) return true;
    if (s.category && s.category === category.key) return true;
    if (!s.category) {
      if (category.key === 'channuoi') return channuoiNames.has(s.name);
      if (category.key === 'trongtrot') return !channuoiNames.has(s.name);
    }
    return false;
  });

  const journals = journalsRaw?.filter(j => {
    if (!category.key) return true;
    const s = j.schemaId;
    if (!s) return false;
    if (s.category && s.category === category.key) return true;
    if (!s.category) {
      if (category.key === 'channuoi') return channuoiNames.has(s.name);
      if (category.key === 'trongtrot') return !channuoiNames.has(s.name);
    }
    return false;
  });

  const columns = [
    {
      title: 'Tên quy trình',
      dataIndex: ['schemaId', 'name'],
      key: 'schema',
      render: (text) => <Text strong className="text-gray-800">{text}</Text>
    },
    {
      title: 'Người tạo',
      dataIndex: ['userId', 'username'],
      key: 'user',
      render: (text) => <Tag color="blue" className="rounded-md border-blue-100 font-medium">{text}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'Completed' ? 'success' : 'processing'}
          text={<span className={`font-bold ${status === 'Completed' ? 'text-green-600' : 'text-blue-500'}`}>{status === 'Completed' ? 'Đã hoàn thành' : 'Đang thực hiện'}</span>}
        />
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text className="text-gray-400 font-medium">{new Date(date).toLocaleDateString('vi-VN')}</Text>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            className="flex items-center justify-center hover:bg-green-50 text-green-600 rounded-lg"
            icon={<EditOutlined />}
            onClick={() => navigate(`/journal/edit/${record._id}`)}
          />
          <Button
            type="text"
            className="flex items-center justify-center hover:bg-green-50 text-green-600 rounded-lg"
            icon={<QrcodeOutlined />}
            onClick={() => {
              setCurrentQr(`${window.location.origin}/trace/${record.qrCode}`);
              setQrModalVisible(true);
            }}
          />
          <Button
            type="text"
            className="flex items-center justify-center hover:bg-gray-100 text-gray-400 rounded-lg"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/trace/${record.qrCode}`)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <Title level={3} className="!mb-0 text-gray-800">{category.label}</Title>
          <Text className="text-gray-400 text-sm">{category.desc}</Text>
        </div>
        <div className="flex gap-2">
          <Space.Compact className="shadow-sm rounded-lg overflow-hidden bg-white">
            <Button
              type={viewMode === 'table' ? 'primary' : 'default'}
              icon={<BarsOutlined />}
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-green-600 hover:bg-green-700 border-0' : 'text-gray-500'}
            >
              Xem ở dạng bảng
            </Button>
            <Button
              type={viewMode === 'card' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('card')}
              className={viewMode === 'card' ? 'bg-green-600 hover:bg-green-700 border-0' : 'text-gray-500'}
            >
              Xem ở dạng thẻ
            </Button>
          </Space.Compact>
        </div>
      </div>

      {/* Main Table/Card Content */}
      <Card variant="borderless" className="shadow-sm rounded-xl overflow-hidden border border-green-200 p-0" styles={{ body: { padding: 0 } }}>
        {/* Toolbar in Card */}
        <div className="p-4 flex justify-end items-center bg-white border-b border-green-200">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setSchemaModalVisible(true)}
              className="bg-green-500 hover:bg-green-600 rounded whitespace-nowrap h-9 font-medium"
            >
              Tạo sổ nhật ký
            </Button>
            <Button icon={<QrcodeOutlined />} className="text-gray-500" />
          </Space>
        </div>

        {/* Card View */}
        {viewMode === 'card' && (
          <div className="p-6 bg-gray-50 min-h-[400px]">
            <Row gutter={[24, 24]}>
              {journals?.map(journal => (
                <Col xs={24} sm={12} lg={8} key={journal._id}>
                  <Card
                    hoverable
                    className="h-full rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm"
                    styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
                  >
                    <div className="p-5 flex-1 relative flex">
                      <div className="w-10 pt-2 flex justify-center text-orange-400 opacity-60">
                        <Leaf className="w-6 h-6" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <Text strong className="text-gray-700 text-sm">{journal.qrCode?.substring(0, 6).toUpperCase()} - {journal.userId?.fullname || journal.userId?.username}</Text>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm text-gray-600 items-start">
                          <div className="flex items-center gap-1.5"><ProfileOutlined className="text-green-500" /> Diện tích:</div>
                          <div className="text-right"><Text strong>{journal.entries?.['Diện tích'] || <span className="text-gray-300 font-normal italic">Chưa cập nhật</span>}</Text></div>

                          <div className="flex items-center gap-1.5"><CalendarOutlined className="text-green-500" /> Ngày bắt đầu:</div>
                          <div className="text-right"><Text strong>{new Date(journal.createdAt).toLocaleDateString('vi-VN')}</Text></div>

                          <div className="flex items-center gap-1.5"><EnvironmentOutlined className="text-green-500" /> Địa chỉ:</div>
                          <div className="text-right leading-tight"><Text strong>{journal.entries?.['Địa chỉ'] || journal.entries?.['Dia chi'] || <span className="text-gray-300 font-normal italic">Chưa cập nhật</span>}</Text></div>

                          <div className="flex items-center gap-1.5 mt-2"><FileOutlined className="text-green-500" /> Loại sổ:</div>
                          <div className="text-right mt-2"><Text strong>{journal.schemaId?.name}</Text></div>

                          <div className="flex items-center gap-1.5"><TagOutlined className="text-green-500" /> Lô sản xuất:</div>
                          <div className="text-right"><Text strong>{journal.entries?.['Lô sản xuất'] || journal.entries?.['Lo san xuat'] || <span className="text-gray-300 font-normal italic">Chưa cập nhật</span>}</Text></div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="p-3 text-center border-t border-gray-100 hover:bg-green-50 transition-colors cursor-pointer mt-auto bg-white"
                      onClick={() => navigate(`/journal/edit/${journal._id}`)}
                    >
                      <Text className="text-green-600 font-medium">Vào sổ nhật ký <RightOutlined className="text-[10px] ml-1" /></Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="p-0">
            <Table
              dataSource={journals}
              columns={columns}
              rowKey="_id"
              loading={isLoading}
              pagination={{ pageSize: 8, className: "px-6 py-4" }}
              className="border-0"
              size="middle"
            />
          </div>
        )}
      </Card>

      <Drawer
        title={<span className="font-bold text-[16px]">Tạo sổ nhật ký</span>}
        placement="right"
        onClose={() => {
          setSchemaModalVisible(false);
          setSelectedSchema(null);
        }}
        open={schemaModalVisible}
        width={400}
        closeIcon={<span className="text-gray-400 font-bold">✕</span>}
        extra={
          <Button
            type="primary"
            className="bg-green-600 font-bold px-6"
            disabled={!selectedSchema}
            onClick={() => {
              if (selectedSchema) {
                navigate(`/journal/new/${selectedSchema}`);
              }
            }}
          >
            Tiếp tục
          </Button>
        }
      >
        <Form layout="vertical" className="mt-4">
          {schemas && schemas.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-5xl mb-4">📭</div>
              <div className="font-semibold text-gray-600 text-base mb-1">Chưa có loại sổ nhật ký</div>
              <div className="text-gray-400 text-sm">Danh mục này chưa được cài đặt mẫu sổ. Vui lòng liên hệ quản trị viên.</div>
            </div>
          ) : (
            <Form.Item
              label={<span className="font-medium text-gray-700">Chọn loại sổ</span>}
              required
            >
              <Select
                style={{ width: '100%' }}
                placeholder={<span className="text-gray-400">Vui lòng chọn</span>}
                className="h-10 hover:border-green-400 custom-drawer-select"
                onChange={setSelectedSchema}
                value={selectedSchema}
                loading={!schemas}
              >
                {schemas?.map((s) => (
                  <Select.Option value={s._id} key={s._id}>{s.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Drawer>

      <Modal
        title={<span className="text-lg font-bold">Mã QR Truy xuất nguồn gốc</span>}
        open={qrModalVisible}
        footer={null}
        onCancel={() => setQrModalVisible(false)}
        centered
        className="rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col justify-center items-center p-8 bg-gray-50/50">
          <div className="bg-white p-6 rounded-3xl shadow-lg mb-6 border border-gray-100">
            <QRCode
              value={currentQr}
              size={220}
              bordered={false}
              color="#15803d"
            />
          </div>
          <Text className="text-gray-400 text-xs mb-1 uppercase font-bold tracking-widest">Quét mã để xem hồ sơ công khai</Text>
          <Text strong className="text-gray-800 break-all text-center">
            <a href={currentQr} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">{currentQr}</a>
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default JournalList;
