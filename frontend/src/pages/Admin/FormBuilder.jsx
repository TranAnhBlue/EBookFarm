import React, { useState } from 'react';
import { Card, Button, Form, Input, Select, Space, Typography, Table, Drawer, message, Popconfirm, Tag, Tooltip, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const FormBuilder = () => {
  const queryClient = useQueryClient();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingSchema, setEditingSchema] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [form] = Form.useForm();

  const { data: schemas, isLoading } = useQuery({
    queryKey: ['schemas'],
    queryFn: () => api.get('/schemas').then(res => res.data.data)
  });

  const createMutation = useMutation({
    mutationFn: (newSchema) => {
      if (editingSchema) {
        return api.put(`/schemas/${editingSchema._id}`, newSchema);
      }
      return api.post('/schemas', newSchema);
    },
    onSuccess: () => {
      message.success(editingSchema ? 'Cập nhật biểu mẫu thành công' : 'Tạo biểu mẫu thành công');
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
      setDrawerVisible(false);
      setEditingSchema(null);
      form.resetFields();
      
      // Nếu là tạo mới, nhảy về trang 1 (vì mặc định sắp xếp mới nhất lên đầu)
      if (!editingSchema) {
        setPagination(prev => ({ ...prev, current: 1 }));
        setSortOrder('newest'); // Đảm bảo đang ở chế độ mới nhất
      }
    },
    onError: () => message.error('Có lỗi xảy ra khi lưu biểu mẫu'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/schemas/${id}`),
    onSuccess: () => {
      message.success('Đã xóa biểu mẫu');
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
    }
  });

  const onFinish = (values) => {
    // Format options from string to array
    if (values.tables) {
      values.tables.forEach((table) => {
        if (table.fields) {
          table.fields.forEach((field) => {
            if (field.options && typeof field.options === 'string') {
              field.options = field.options.split(',').map((o) => o.trim());
            }
          })
        }
      });
    }
    createMutation.mutate(values);
  };

  const handleEdit = (record) => {
    setEditingSchema(record);
    // Format options back to string for the form
    const initialValues = { ...record };
    if (initialValues.tables) {
      initialValues.tables.forEach((table) => {
        if (table.fields) {
          table.fields.forEach((field) => {
            if (Array.isArray(field.options)) {
              field.options = field.options.join(', ');
            }
          })
        }
      });
    }
    form.setFieldsValue(initialValues);
    setDrawerVisible(true);
  };

  const filteredSchemas = schemas
    ?.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    }) || [];

  const columns = [
    { 
      title: 'STT', 
      key: 'stt', 
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1 
    },
    { 
      title: 'Tên biểu mẫu', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Text strong className="text-green-700">{text}</Text>
    },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { 
      title: 'Ngày tạo', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      render: (date) => new Date(date).toLocaleDateString('vi-VN') 
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined className="text-blue-500" />} 
              onClick={() => handleEdit(record)} 
            />
          </Tooltip>
          <Popconfirm 
            title="Bạn có chắc chắn muốn xóa biểu mẫu này?" 
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button danger type="text" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Title level={2} className="!mb-0">Trình tạo biểu mẫu (Sơ đồ động)</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingSchema(null);
            form.resetFields();
            setDrawerVisible(true);
          }}
          className="bg-green-600 hover:bg-green-700 rounded-xl px-6"
        >
          Tạo biểu mẫu mới
        </Button>
      </div>

      <Card className="mb-6 rounded-2xl shadow-sm border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Tìm kiếm theo tên biểu mẫu..."
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            size="large"
            className="rounded-xl flex-1"
            allowClear
          />
          <Select
            defaultValue="newest"
            size="large"
            className="w-full sm:w-[200px]"
            onChange={(val) => {
              setSortOrder(val);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
          >
            <Option value="newest">Mới nhất</Option>
            <Option value="oldest">Cũ nhất</Option>
          </Select>
        </div>
      </Card>

      <Table 
        dataSource={filteredSchemas} 
        columns={columns} 
        rowKey="_id" 
        loading={isLoading} 
        className="premium-table"
        pagination={{ 
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, pageSize) => setPagination({ current: page, pageSize })
        }}
        onChange={(p) => setPagination({ current: p.current, pageSize: p.pageSize })}
      />

      <Drawer
        title={editingSchema ? "Chỉnh sửa biểu mẫu" : "Tạo biểu mẫu mới"}
        width={720}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        maskClosable={false}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Hủy</Button>
            <Button type="primary" onClick={() => form.submit()} loading={createMutation.isPending}>
              {editingSchema ? "Cập nhật" : "Lưu biểu mẫu"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Tên biểu mẫu" rules={[{ required: true, message: 'Vui lòng nhập tên biểu mẫu' }]}>
            <Input placeholder="Vd: Quy trình VietGAP Rau Củ Quả" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Nhập mô tả ngắn gọn về biểu mẫu" />
          </Form.Item>

          <Card title={<span className="text-green-700">Cấu trúc các bảng</span>} size="small" className="mb-4">
            <Form.List name="tables">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card 
                      key={key} 
                      size="small" 
                      className="mb-4 bg-gray-50 rounded-xl border-gray-200" 
                      extra={<Button danger type="link" size="small" onClick={() => remove(name)}>Xóa bảng</Button>}
                    >
                      <Form.Item {...restField} name={[name, 'tableName']} label="Tên bảng" rules={[{ required: true, message: 'Nhập tên bảng' }]}>
                        <Input placeholder="Vd: Đăng ký giống, Thu hoạch" />
                      </Form.Item>

                      <Form.List name={[name, 'fields']}>
                        {(subFields, { add: addSubField, remove: removeSubField }) => (
                          <>
                            {subFields.map((subField) => (
                              <div key={subField.key} className="bg-white p-3 rounded-lg mb-3 border border-gray-100">
                                <Row gutter={8} align="middle">
                                  <Col span={7}>
                                    <Form.Item {...subField} name={[subField.name, 'name']} rules={[{ required: true, message: 'ID trường' }]} className="m-0">
                                      <Input placeholder="ID (vd: ten_giong)" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={7}>
                                    <Form.Item {...subField} name={[subField.name, 'label']} rules={[{ required: true, message: 'Nhãn' }]} className="m-0">
                                      <Input placeholder="Nhãn (vd: Tên giống)" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={6}>
                                    <Form.Item {...subField} name={[subField.name, 'type']} rules={[{ required: true }]} className="m-0">
                                      <Select placeholder="Kiểu">
                                        <Option value="text">Chữ</Option>
                                        <Option value="number">Số</Option>
                                        <Option value="date">Ngày</Option>
                                        <Option value="select">Lựa chọn</Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col span={3}>
                                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeSubField(subField.name)} />
                                  </Col>
                                  <Col span={24} className="mt-2">
                                    <Form.Item 
                                      {...subField} 
                                      name={[subField.name, 'options']} 
                                      className="m-0"
                                      noStyle
                                      shouldUpdate={(prev, curr) => prev.type !== curr.type}
                                    >
                                      {({ getFieldValue }) => 
                                        getFieldValue(['tables', name, 'fields', subField.name, 'type']) === 'select' ? (
                                          <Input placeholder="Các lựa chọn (cách nhau bởi dấu phẩy)" className="mt-2" />
                                        ) : null
                                      }
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </div>
                            ))}
                            <Button type="dashed" onClick={() => addSubField()} block icon={<PlusOutlined />} className="rounded-lg">
                              Thêm trường thông tin
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Card>
                  ))}
                  <Button 
                    type="primary" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />} 
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold h-11 border-0 shadow-md"
                  >
                    Thêm bảng dữ liệu
                  </Button>
                </>
              )}
            </Form.List>
          </Card>
        </Form>
      </Drawer>
    </div>
  );
};

export default FormBuilder;

