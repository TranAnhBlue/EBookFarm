import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Drawer, Descriptions, Card, Typography, Row, Col, Avatar, Statistic, Tooltip, Badge } from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  UserAddOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  QrcodeOutlined, 
  SafetyCertificateOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import JournalEntry from '../Journal/JournalEntry';
import { getAvatarUrl, getInitialAvatar } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const HtxJournalMgmt = () => {
  const [journals, setJournals] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add Farmers Modal state
  const [isAddFarmersVisible, setIsAddFarmersVisible] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [farmersList, setFarmersList] = useState([]);
  const [selectedFarmerIds, setSelectedFarmerIds] = useState([]);

  // Detail Drawer state
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Preview Modal state
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewJournalId, setPreviewJournalId] = useState(null);

  // QR Modal state
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [filterSchema, setFilterSchema] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  // Farmer filter in drawer
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerStatusFilter, setFarmerStatusFilter] = useState(null);

  useEffect(() => {
    fetchJournals();
    fetchSchemas();
    fetchFarmers();
  }, []);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/htx-journals');
      if (res.data.success) {
        setJournals(res.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách sổ nhật ký');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemas = async () => {
    try {
      const res = await api.get('/schemas');
      if (res.data.success) {
        setSchemas(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFarmers = async () => {
    try {
      const res = await api.get('/htx-journals/farmers');
      if (res.data.success) {
        setFarmersList(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateJournal = async (values) => {
    try {
      setLoading(true);
      const res = await api.post('/htx-journals', values);
      if (res.data.success) {
        message.success('Tạo sổ nhật ký thành công');
        setIsModalVisible(false);
        form.resetFields();
        fetchJournals();
      }
    } catch (error) {
      message.error('Lỗi khi tạo sổ nhật ký');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarmers = async () => {
    if (!selectedFarmerIds.length) {
      message.warning('Vui lòng chọn ít nhất một nông dân');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(`/htx-journals/${selectedJournal._id}/farmers`, {
        farmerIds: selectedFarmerIds
      });
      if (res.data.success) {
        message.success(res.data.message);
        setIsAddFarmersVisible(false);
        setSelectedFarmerIds([]);
        fetchJournals();
      }
    } catch (error) {
      message.error('Lỗi khi thêm nông dân');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (journalId, farmerId, status, feedback) => {
    try {
      setLoading(true);
      const res = await api.put(`/htx-journals/${journalId}/farmers/${farmerId}/status`, {
        status,
        feedback
      });
      if (res.data.success) {
        message.success('Cập nhật trạng thái thành công');
        const updatedRes = await api.get('/htx-journals');
        if (updatedRes.data.success) {
            setJournals(updatedRes.data.data);
            const updatedJournal = updatedRes.data.data.find(j => j._id === journalId);
            if (updatedJournal) {
                setSelectedJournal(updatedJournal);
            }
        }
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (text, record, index) => (
        <span className="text-gray-400 font-mono">{(currentPage - 1) * pageSize + index + 1}</span>
      )
    },
    {
      title: 'TÊN SỔ NHẬT KÝ',
      key: 'name_info',
      render: (record) => (
        <div className="flex flex-col">
          <Text strong className="text-green-700 text-sm">{record.name}</Text>
          <Text className="text-[10px] text-gray-400 italic">Mã: {record._id.substring(record._id.length - 8).toUpperCase()}</Text>
        </div>
      )
    },
    {
      title: 'BỘ BIỂU MẪU',
      dataIndex: ['schemaId', 'name'],
      key: 'schemaId',
      render: (text) => <Text className="text-gray-600 font-medium">{text}</Text>
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'gray';
        let text = status;
        if (status === 'Active') { color = 'green'; text = 'Đang hoạt động'; }
        if (status === 'Completed') { color = 'blue'; text = 'Đã hoàn tất'; }
        if (status === 'Archived') { color = 'orange'; text = 'Đã lưu trữ'; }
        return <Tag color={color} className="rounded-full px-3 font-medium">{text}</Tag>;
      }
    },
    {
      title: 'NÔNG DÂN',
      key: 'farmersCount',
      align: 'center',
      render: (_, record) => (
        <Badge count={record.farmers?.length || 0} overflowCount={999} style={{ backgroundColor: '#22c55e' }}>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <TeamOutlined />
          </div>
        </Badge>
      )
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Thêm nông dân">
            <Button
              type="text"
              icon={<UserAddOutlined className="text-blue-600" />}
              onClick={() => {
                setSelectedJournal(record);
                setIsAddFarmersVisible(true);
              }}
              className="bg-blue-50 hover:bg-blue-100 rounded-xl"
            />
          </Tooltip>
          <Tooltip title="Chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined className="text-green-600" />}
              onClick={() => {
                setSelectedJournal(record);
                setIsDrawerVisible(true);
              }}
              className="bg-green-50 hover:bg-green-100 rounded-xl"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredJournals = journals.filter(j => {
    const matchesSearch = j.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesSchema = filterSchema ? j.schemaId?._id === filterSchema : true;
    const matchesStatus = filterStatus ? j.status === filterStatus : true;
    return matchesSearch && matchesSchema && matchesStatus;
  });

  const filteredFarmersInDrawer = selectedJournal?.farmers?.filter(f => {
    const name = f.farmerId?.fullname || f.farmerId?.username || '';
    const matchesName = name.toLowerCase().includes(farmerSearch.toLowerCase());
    const matchesStatus = farmerStatusFilter ? f.status === farmerStatusFilter : true;
    return matchesName && matchesStatus;
  }) || [];

  const stats = {
    total: journals.length,
    active: journals.filter(j => j.status === 'Active').length,
    totalFarmers: journals.reduce((acc, curr) => acc + (curr.farmers?.length || 0), 0)
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <HomeOutlined />
            <span>Quản lý HTX</span>
            <span className="text-gray-200">/</span>
            <span className="text-green-600">Sổ nhật ký HTX</span>
          </div>
          <Title level={4} className="!mb-0">Quản Lý Sổ Nhật Ký HTX</Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="bg-green-600 hover:bg-green-700 rounded-xl h-11 px-6 shadow-lg shadow-green-100 border-0 font-bold"
        >
          Tạo Sổ Mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600">
            <Statistic
              title={<Text className="text-white/80 uppercase text-xs font-bold">Tổng số sổ nhật ký</Text>}
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic
              title={<Text className="text-gray-400 uppercase text-xs font-bold">Sổ đang hoạt động</Text>}
              value={stats.active}
              prefix={<CheckOutlined className="text-green-500" />}
              valueStyle={{ color: '#22c55e', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic
              title={<Text className="text-gray-400 uppercase text-xs font-bold">Tổng nông dân tham gia</Text>}
              value={stats.totalFarmers}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card className="rounded-2xl border-gray-100 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <Space size="middle" wrap className="w-full">
          <Input
            placeholder="Tìm kiếm tên sổ..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="w-80 h-10 rounded-xl"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          <Select
            placeholder="Bộ biểu mẫu"
            allowClear
            style={{ width: 220 }}
            onChange={setFilterSchema}
            className="h-10"
            suffixIcon={<FilterOutlined />}
          >
            {schemas.map(s => (
              <Option key={s._id} value={s._id}>{s.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="Trạng thái sổ"
            allowClear
            style={{ width: 180 }}
            onChange={setFilterStatus}
            className="h-10"
          >
            <Option value="Active">Đang hoạt động</Option>
            <Option value="Completed">Đã hoàn tất</Option>
            <Option value="Archived">Đã lưu trữ</Option>
          </Select>
          <Text className="text-gray-400 text-xs italic ml-auto">
            Tìm thấy <Text strong className="text-green-600">{filteredJournals.length}</Text> kết quả
          </Text>
        </Space>
      </Card>

      {/* Table Section */}
      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredJournals}
          rowKey="_id"
          loading={loading}
          className="premium-table-refined custom-pagination"
          scroll={{ x: 800 }}
          pagination={{ 
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            locale: { items_per_page: '/ trang' },
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            className: "pb-4 px-4 pt-4"
          }}
        />
      </Card>

      {/* Modal Tạo Sổ */}
      <Modal
        title={<div className="flex items-center gap-2"><FileTextOutlined className="text-green-600" /><Text strong className="text-lg">Tạo Sổ Nhật Ký Mới</Text></div>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        centered
        className="rounded-3xl overflow-hidden"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateJournal} className="pt-4">
          <Form.Item
            name="name"
            label={<Text strong>Tên Sổ Nhật Ký</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên sổ' }]}
          >
            <Input className="h-11 rounded-lg" placeholder="Vd: Sổ VietGAP Vụ Đông Xuân 2026" />
          </Form.Item>
          <Form.Item
            name="schemaId"
            label={<Text strong>Bộ Biểu Mẫu</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn bộ biểu mẫu' }]}
          >
            <Select className="h-11" placeholder="Chọn bộ biểu mẫu chuẩn">
              {schemas.map(s => (
                <Option key={s._id} value={s._id}>{s.name} ({s.category})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label={<Text strong>Mô Tả</Text>}
          >
            <TextArea rows={3} className="rounded-lg" placeholder="Ghi chú thêm về phạm vi, thời gian..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Thêm Nông Dân */}
      <Modal
        title={<div className="flex items-center gap-2"><UserAddOutlined className="text-blue-600" /><Text strong className="text-lg">Thêm Nông Dân Vào Sổ</Text></div>}
        open={isAddFarmersVisible}
        onCancel={() => {
          setIsAddFarmersVisible(false);
          setSelectedFarmerIds([]);
        }}
        onOk={handleAddFarmers}
        confirmLoading={loading}
        centered
        width={500}
      >
        <div className="py-4">
          <Text className="text-gray-500 block mb-4 italic">Sổ: <Text strong className="text-green-600">{selectedJournal?.name}</Text></Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Chọn nông dân để phân công"
            value={selectedFarmerIds}
            onChange={setSelectedFarmerIds}
            className="rounded-lg"
            size="large"
            maxTagCount="responsive"
          >
            {farmersList.map(f => {
              const isAlreadyAdded = selectedJournal?.farmers?.some(jf => jf.farmerId?._id === f._id);
              return (
                <Option key={f._id} value={f._id} disabled={isAlreadyAdded}>
                  <div className="flex items-center gap-2">
                    <Avatar size="small" src={getAvatarUrl(f.avatar)} icon={<UserOutlined />}>
                      {!f.avatar && getInitialAvatar(f.fullname || f.username)}
                    </Avatar>
                    <Text>{f.fullname || f.username}</Text>
                    {isAlreadyAdded && <Tag color="gray" className="ml-auto">Đã thêm</Tag>}
                  </div>
                </Option>
              );
            })}
          </Select>
        </div>
      </Modal>

      {/* Drawer Chi Tiết Sổ */}
      <Drawer
        title={<div className="flex items-center gap-2"><EyeOutlined className="text-green-600" /><Text strong className="text-lg">Chi Tiết Sổ Nhật Ký HTX</Text></div>}
        placement="right"
        width={window.innerWidth > 992 ? 1000 : '100%'}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        className="custom-drawer"
      >
        {selectedJournal && (
          <div className="space-y-6">
            <Card bordered={false} className="bg-green-50 border-0 rounded-2xl shadow-none">
              <Descriptions column={2} size="small">
                <Descriptions.Item label={<Text strong>Tên Sổ</Text>} span={2}><Text className="text-green-800 text-lg">{selectedJournal.name}</Text></Descriptions.Item>
                <Descriptions.Item label={<Text strong>Biểu Mẫu</Text>}><Tag color="green">{selectedJournal.schemaId?.name}</Tag></Descriptions.Item>
                <Descriptions.Item label={<Text strong>Trạng Thái</Text>}>
                  <Tag color={selectedJournal.status === 'Active' ? 'green' : 'gray'} className="rounded-full px-3">
                    {selectedJournal.status === 'Active' ? 'Đang hoạt động' : 
                     selectedJournal.status === 'Completed' ? 'Đã hoàn tất' : 'Đã lưu trữ'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Mô Tả</Text>} span={2}>{selectedJournal.description || 'Không có mô tả'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                   <div className="h-6 w-1 bg-green-500 rounded-full"></div>
                   <Text strong className="text-lg">Thành Viên Tham Gia</Text>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Input
                    placeholder="Tìm nông dân..."
                    className="w-full sm:w-[200px] h-9 rounded-lg"
                    onChange={(e) => setFarmerSearch(e.target.value)}
                    allowClear
                    prefix={<SearchOutlined className="text-gray-300" />}
                  />
                  <Select
                    placeholder="Trạng thái"
                    className="w-full sm:w-[140px] h-9"
                    onChange={setFarmerStatusFilter}
                    allowClear
                  >
                    <Option value="Chưa nhập">Chưa nhập</Option>
                    <Option value="Đang nhập">Đang nhập</Option>
                    <Option value="Chờ duyệt">Chờ duyệt</Option>
                    <Option value="Đã duyệt">Đã duyệt</Option>
                    <Option value="Cần chỉnh sửa">Cần chỉnh sửa</Option>
                  </Select>
                </div>
              </div>

              <Table
                dataSource={filteredFarmersInDrawer}
                rowKey={(record) => record.farmerId?._id}
                pagination={{ pageSize: 10, size: 'small' }}
                className="premium-table-refined"
                scroll={{ x: 600 }}
                columns={[
                  {
                    title: 'NÔNG DÂN',
                    key: 'farmer_info',
                    render: (_, record) => (
                      <div className="flex items-center gap-2">
                        <Avatar size="small" src={getAvatarUrl(record.farmerId?.avatar)} icon={<UserOutlined />}>
                          {!record.farmerId?.avatar && getInitialAvatar(record.farmerId?.fullname || record.farmerId?.username)}
                        </Avatar>
                        <Text strong className="text-gray-700">{record.farmerId?.fullname || record.farmerId?.username}</Text>
                      </div>
                    )
                  },
                  {
                    title: 'TRẠNG THÁI',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => {
                      let color = 'default';
                      if (status === 'Đã duyệt') color = 'success';
                      if (status === 'Chờ duyệt') color = 'processing';
                      if (status === 'Cần chỉnh sửa') color = 'warning';
                      if (status === 'Không đạt') color = 'error';
                      return <Tag color={color} className="rounded-full px-3">{status}</Tag>;
                    }
                  },
                  {
                    title: 'HÀNH ĐỘNG',
                    key: 'action',
                    align: 'right',
                    render: (_, record) => (
                      <Space>
                        {record.farmJournalId ? (
                          <Tooltip title="Xem chi tiết nhật ký">
                            <Button
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => {
                                setPreviewJournalId(record.farmJournalId?._id || record.farmJournalId);
                                setIsPreviewVisible(true);
                              }}
                              className="rounded-lg bg-green-50 text-green-600 border-0"
                            />
                          </Tooltip>
                        ) : (
                          <Button size="small" icon={<EyeOutlined />} disabled className="rounded-lg" />
                        )}
                        <Tooltip title="Duyệt">
                          <Button
                            size="small"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleUpdateStatus(selectedJournal._id, record.farmerId._id, 'Đã duyệt', '')}
                            className="bg-green-600 border-0 rounded-lg"
                          />
                        </Tooltip>
                        <Tooltip title="Yêu cầu sửa">
                          <Button
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => {
                              const feedback = window.prompt("Nhập lý do cần chỉnh sửa:");
                              if (feedback !== null) {
                                handleUpdateStatus(selectedJournal._id, record.farmerId._id, 'Cần chỉnh sửa', feedback);
                              }
                            }}
                            className="rounded-lg"
                          />
                        </Tooltip>
                        {record.farmJournalId && (
                          <Tooltip title="QR Truy xuất">
                            <Button
                              size="small"
                              icon={<QrcodeOutlined />}
                              onClick={() => {
                                setQrCodeData({
                                  id: record.farmJournalId?._id || record.farmJournalId,
                                  qrCode: record.farmJournalId?.qrCode,
                                  farmerName: record.farmerId?.fullname || record.farmerId?.username,
                                  journalName: selectedJournal.name
                                });
                                setIsQrModalVisible(true);
                              }}
                              className="border-green-500 text-green-600 rounded-lg"
                            />
                          </Tooltip>
                        )}
                      </Space>
                    )
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal Xem Nhật Ký (Popup) */}
      <Modal
        title={null}
        open={isPreviewVisible}
        onCancel={() => {
          setIsPreviewVisible(false);
          setPreviewJournalId(null);
        }}
        footer={null}
        width={1100}
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, height: '85vh', overflowY: 'auto', backgroundColor: '#f8fafc' }}
        className="premium-modal"
        destroyOnClose
      >
        <div className="sticky top-0 z-50 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold m-0 text-green-700">Chi Tiết Nhật Ký Nông Dân</h2>
          <Button onClick={() => setIsPreviewVisible(false)}>Đóng</Button>
        </div>
        <div className="p-6">
          {previewJournalId && <JournalEntry id={previewJournalId} />}
        </div>
      </Modal>

      {/* Modal QR Code / Truy xuất */}
      <Modal
        title={<div className="flex items-center gap-2"><QrcodeOutlined className="text-green-600" /><Text strong>Mã Truy Xuất Nguồn Gốc</Text></div>}
        open={isQrModalVisible}
        onCancel={() => setIsQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsQrModalVisible(false)} className="rounded-lg">Đóng</Button>,
          <Button
            key="print"
            type="primary"
            icon={<SafetyCertificateOutlined />}
            onClick={() => window.print()}
            className="bg-green-600 border-0 rounded-lg"
          >
            In Tem Truy Xuất
          </Button>
        ]}
        width={400}
        centered
      >
        {qrCodeData && (
          <div className="text-center py-6">
            <div className="mb-6">
              <Text strong className="text-lg block text-green-800">{qrCodeData.journalName}</Text>
              <Text className="text-gray-500 font-medium">Nông dân: {qrCodeData.farmerName}</Text>
            </div>

            <div className="bg-white p-5 inline-block rounded-[32px] shadow-xl border-2 border-green-50 mb-8">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${window.location.origin}/trace/${qrCodeData.qrCode}`)}`}
                alt="QR Code"
                className="w-52 h-52"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-left border border-gray-100 mb-6">
              <Text strong className="block mb-2 text-[10px] uppercase text-gray-400 tracking-wider">Link truy xuất công khai</Text>
              <div className="flex items-center gap-2">
                <Input
                  value={`${window.location.origin}/trace/${qrCodeData.qrCode}`}
                  readOnly
                  className="font-mono text-[10px] bg-white border-0"
                />
                <Button
                  size="small"
                  className="rounded-lg"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/trace/${qrCodeData.qrCode}`);
                    message.success('Đã copy link!');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 rounded-xl border border-green-100">
              <SafetyCertificateOutlined className="text-xl" />
              <Text className="text-green-700 font-bold uppercase tracking-tight text-xs">Chứng nhận bởi EBookFarm Systems</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HtxJournalMgmt;
