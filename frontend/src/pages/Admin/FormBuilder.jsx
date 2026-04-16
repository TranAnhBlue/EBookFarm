import React, { useState } from 'react';
import { Card, Button, Form, Input, Select, Space, Typography, Table, Drawer, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const { Title } = Typography;
const { Option } = Select;

const FormBuilder = () => {
  const queryClient = useQueryClient();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: schemas, isLoading } = useQuery({ 
      queryKey: ['schemas'], 
      queryFn: () => api.get('/schemas').then(res => res.data.data) 
  });

  const createMutation = useMutation({
    mutationFn: (newSchema) => api.post('/schemas', newSchema),
    onSuccess: () => {
      message.success('Schema created successfully');
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
      setDrawerVisible(false);
      form.resetFields();
    },
    onError: () => message.error('Failed to create schema'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/schemas/${id}`),
    onSuccess: () => {
      message.success('Schema deleted');
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
    }
  });

  const onFinish = (values) => {
    // Format options from string to array
    if(values.tables) {
        values.tables.forEach((table) => {
            if(table.fields) {
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

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
    { 
      title: 'Action', 
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="Delete this schema?" onConfirm={() => deleteMutation.mutate(record._id)}>
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Form Builder (Dynamic Schemas)</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>
          Create Schema
        </Button>
      </div>

      <Table dataSource={schemas} columns={columns} rowKey="_id" loading={isLoading} />

      <Drawer
        title="Create New Dynamic Schema"
        width={720}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
            <Button type="primary" onClick={() => form.submit()} loading={createMutation.isPending}>
                Save Schema
            </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Schema Name" rules={[{ required: true }]}>
             <Input placeholder="e.g. Tomato Farm Workflow" />
          </Form.Item>
          <Form.Item name="description" label="Description">
             <Input.TextArea rows={2} />
          </Form.Item>

          <Card title="Tables" size="small">
            <Form.List name="tables">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" className="mb-4 bg-gray-50" extra={<Button danger onClick={() => remove(name)}>Remove Table</Button>}>
                      <Form.Item {...restField} name={[name, 'tableName']} label="Table Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Seed Registration, Harvesting" />
                      </Form.Item>
                      
                      <Form.List name={[name, 'fields']}>
                        {(subFields, { add: addSubField, remove: removeSubField }) => (
                           <>
                             {subFields.map((subField) => (
                                <Space key={subField.key} className="flex mb-2" align="baseline">
                                  <Form.Item {...subField} name={[subField.name, 'name']} rules={[{ required: true }]} className="m-0">
                                    <Input placeholder="Field ID (e.g. seed_name)" />
                                  </Form.Item>
                                  <Form.Item {...subField} name={[subField.name, 'label']} rules={[{ required: true }]} className="m-0">
                                    <Input placeholder="Grid Label (e.g. Seed Name)" />
                                  </Form.Item>
                                  <Form.Item {...subField} name={[subField.name, 'type']} rules={[{ required: true }]} className="m-0 min-w-[120px]">
                                    <Select placeholder="Type">
                                      <Option value="text">Text</Option>
                                      <Option value="number">Number</Option>
                                      <Option value="date">Date</Option>
                                      <Option value="select">Select</Option>
                                    </Select>
                                  </Form.Item>
                                  {/* For select type options */}
                                   <Form.Item {...subField} name={[subField.name, 'options']} className="m-0">
                                    <Input placeholder="Comma separated options" />
                                  </Form.Item>
                                  <DeleteOutlined onClick={() => removeSubField(subField.name)} className="text-red-500 cursor-pointer" />
                                </Space>
                             ))}
                             <Button type="dashed" onClick={() => addSubField()} block icon={<PlusOutlined />}>
                                Add Field
                             </Button>
                           </>
                        )}
                      </Form.List>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Table
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
