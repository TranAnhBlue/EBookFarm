import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Drawer, Descriptions } from 'antd';
import { PlusOutlined, EyeOutlined, UserAddOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Option } = Select;
const { TextArea } = Input;

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Sổ Nhật Ký HTX</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
        >
          Tạo Sổ Mới
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={journals} 
        rowKey="_id" 
        loading={loading}
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
        title="Chi Tiết Sổ Nhật Ký HTX"
        placement="right"
        width={700}
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

            <h3 className="text-lg font-semibold mb-4">Danh Sách Nông Dân Tham Gia</h3>
            <Table
              dataSource={selectedJournal.farmers}
              rowKey={(record) => record.farmerId?._id}
              pagination={false}
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
                      <Button 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => window.open(`/journals/view/${record.farmJournalId}`, '_blank')}
                      >
                        Xem Sổ
                      </Button>
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
                    </Space>
                  )
                }
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default HtxJournalMgmt;
