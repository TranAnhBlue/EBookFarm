import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Drawer, Descriptions, Card, Typography } from 'antd';
import { PlusOutlined, EyeOutlined, UserAddOutlined, CheckCircleOutlined, CloseCircleOutlined, QrcodeOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import JournalEntry from '../Journal/JournalEntry';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const HtxJournalMgmt = () => {
  const [journals, setJournals] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuthStore();

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
        fetchJournals();
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên Sổ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Bộ Biểu Mẫu',
      dataIndex: ['schemaId', 'name'],
      key: 'schemaId',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'gray'}>{status}</Tag>
      )
    },
    {
      title: 'Số Nông Dân',
      key: 'farmersCount',
      render: (_, record) => record.farmers?.length || 0
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              setSelectedJournal(record);
              setIsAddFarmersVisible(true);
            }}
          >
            Thêm Nông Dân
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedJournal(record);
              setIsDrawerVisible(true);
            }}
          >
            Chi Tiết
          </Button>
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

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Quản Lý Sổ Nhật Ký HTX</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="bg-green-600 hover:bg-green-700 rounded-xl"
        >
          Tạo Sổ Mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <Card className="mb-6 rounded-2xl shadow-sm border-gray-100" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Tìm kiếm tên sổ..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="rounded-xl"
              prefix={<EyeOutlined className="text-gray-400" />}
            />
          </div>
          <div className="w-full lg:w-[250px]">
            <Select
              placeholder="Lọc theo bộ biểu mẫu"
              allowClear
              style={{ width: '100%' }}
              onChange={setFilterSchema}
              size="large"
              className="rounded-xl"
            >
              {schemas.map(s => (
                <Option key={s._id} value={s._id}>{s.name}</Option>
              ))}
            </Select>
          </div>
          <div className="w-full lg:w-[200px]">
            <Select
              placeholder="Trạng thái sổ"
              allowClear
              style={{ width: '100%' }}
              onChange={setFilterStatus}
              size="large"
              className="rounded-xl"
            >
              <Option value="Active">Đang hoạt động (Active)</Option>
              <Option value="Completed">Đã kết thúc (Completed)</Option>
              <Option value="Archived">Đã lưu trữ (Archived)</Option>
            </Select>
          </div>
          <div className="text-gray-400 text-sm italic">
            Tìm thấy {filteredJournals.length} kết quả
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredJournals}
        rowKey="_id"
        loading={loading}
        className="premium-table"
        scroll={{ x: 800 }}
        pagination={{ pageSize: 10, size: 'small' }}
      />

      {/* Modal Tạo Sổ */}
      <Modal
        title="Tạo Sổ Nhật Ký Mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateJournal}>
          <Form.Item
            name="name"
            label="Tên Sổ Nhật Ký"
            rules={[{ required: true, message: 'Vui lòng nhập tên sổ' }]}
          >
            <Input placeholder="Vd: Sổ VietGAP Vụ Đông Xuân 2026" />
          </Form.Item>
          <Form.Item
            name="schemaId"
            label="Chọn Bộ Biểu Mẫu"
            rules={[{ required: true, message: 'Vui lòng chọn bộ biểu mẫu' }]}
          >
            <Select placeholder="Chọn bộ biểu mẫu chuẩn">
              {schemas.map(s => (
                <Option key={s._id} value={s._id}>{s.name} ({s.category})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô Tả"
          >
            <TextArea rows={3} placeholder="Ghi chú thêm..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Thêm Nông Dân */}
      <Modal
        title={`Thêm Nông Dân vào sổ: ${selectedJournal?.name}`}
        open={isAddFarmersVisible}
        onCancel={() => {
          setIsAddFarmersVisible(false);
          setSelectedFarmerIds([]);
        }}
        onOk={handleAddFarmers}
        confirmLoading={loading}
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Chọn nông dân"
          value={selectedFarmerIds}
          onChange={setSelectedFarmerIds}
          optionLabelProp="label"
        >
          {farmersList.map(f => {
            const isAlreadyAdded = selectedJournal?.farmers?.some(jf => jf.farmerId?._id === f._id);
            return (
              <Option key={f._id} value={f._id} label={f.fullname || f.username} disabled={isAlreadyAdded}>
                {f.fullname || f.username} {isAlreadyAdded ? '(Đã thêm)' : ''}
              </Option>
            );
          })}
        </Select>
      </Modal>

      {/* Drawer Chi Tiết Sổ */}
      <Drawer
        title={<span className="text-lg font-bold">Chi Tiết Sổ Nhật Ký HTX</span>}
        placement="right"
        width={window.innerWidth > 992 ? 1000 : '100%'}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedJournal && (
          <div>
            <Descriptions bordered column={1} className="mb-6">
              <Descriptions.Item label="Tên Sổ">{selectedJournal.name}</Descriptions.Item>
              <Descriptions.Item label="Biểu Mẫu">{selectedJournal.schemaId?.name}</Descriptions.Item>
              <Descriptions.Item label="Trạng Thái">{selectedJournal.status}</Descriptions.Item>
              <Descriptions.Item label="Mô Tả">{selectedJournal.description}</Descriptions.Item>
            </Descriptions>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 mt-6">
              <h3 className="text-lg font-semibold m-0">Danh Sách Nông Dân Tham Gia</h3>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Input
                  placeholder="Tìm tên nông dân..."
                  className="w-full sm:w-[200px]"
                  onChange={(e) => setFarmerSearch(e.target.value)}
                  allowClear
                />
                <Select
                  placeholder="Lọc trạng thái"
                  className="w-full sm:w-[150px]"
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
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
              columns={[
                {
                  title: 'Nông Dân',
                  key: 'farmerName',
                  render: (_, record) => record.farmerId?.fullname || record.farmerId?.username
                },
                {
                  title: 'Trạng Thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    let color = 'default';
                    if (status === 'Đã duyệt') color = 'success';
                    if (status === 'Chờ duyệt') color = 'processing';
                    if (status === 'Cần chỉnh sửa') color = 'warning';
                    if (status === 'Không đạt') color = 'error';
                    return <Tag color={color}>{status}</Tag>;
                  }
                },
                {
                  title: 'Hành Động',
                  key: 'action',
                  render: (_, record) => (
                    <Space>
                      {record.farmJournalId ? (
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          className="flex items-center"
                          onClick={() => {
                            setPreviewJournalId(record.farmJournalId?._id || record.farmJournalId);
                            setIsPreviewVisible(true);
                          }}
                        >
                          Xem Sổ
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          disabled
                          title="Chưa có dữ liệu nhật ký"
                        >
                          Xem Sổ
                        </Button>
                      )}
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleUpdateStatus(selectedJournal._id, record.farmerId._id, 'Đã duyệt', '')}
                      >
                        Duyệt
                      </Button>
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
                      >
                        Y/C Sửa
                      </Button>

                      {record.farmJournalId && (
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
                          className="border-green-500 text-green-600"
                        >
                          QR
                        </Button>
                      )}
                    </Space>
                  )
                }
              ]}
            />
          </div>
        )}
      </Drawer>

      {/* Modal Xem Nhan Ky (Popup) */}
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
        </div>
        <div className="p-6">
          {previewJournalId && <JournalEntry id={previewJournalId} />}
        </div>
      </Modal>

      {/* Modal QR Code / Truy xuat */}
      <Modal
        title="Mã Truy Xuất Nguồn Gốc"
        open={isQrModalVisible}
        onCancel={() => setIsQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsQrModalVisible(false)}>Đóng</Button>,
          <Button
            key="print"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => window.print()}
          >
            In Tem
          </Button>
        ]}
        width={400}
        centered
      >
        {qrCodeData && (
          <div className="text-center py-6">
            <div className="mb-4">
              <Text strong className="text-lg block">{qrCodeData.journalName}</Text>
              <Text className="text-gray-500">Nông dân: {qrCodeData.farmerName}</Text>
            </div>

            <div className="bg-white p-4 inline-block rounded-2xl shadow-md border-2 border-green-100 mb-6">
              {/* Su dung API QR Code mien phi */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/trace/${qrCodeData.qrCode}`)}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-left">
              <Text strong className="block mb-1 text-xs uppercase text-gray-400">Link truy xuất công khai:</Text>
              <div className="flex items-center gap-2">
                <Input
                  value={`${window.location.origin}/trace/${qrCodeData.qrCode}`}
                  readOnly
                  className="font-mono text-[10px]"
                />
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/trace/${qrCodeData.qrCode}`);
                    message.success('Đã copy link!');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 rounded-lg">
              <SafetyCertificateOutlined />
              <Text className="text-green-700 font-bold">Chứng nhận bởi EBookFarm</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HtxJournalMgmt;
