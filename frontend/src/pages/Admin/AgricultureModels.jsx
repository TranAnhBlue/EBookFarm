import React, { useState } from 'react';
import { Card, Typography, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Empty, Spin } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HomeOutlined, 
  NodeIndexOutlined,
  BlockOutlined,
  TagOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const { Title, Text } = Typography;

const AgricultureModels = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [activeNode, setActiveNode] = useState(null);
  const [form] = Form.useForm();

  // Fetch Tree Data
  const { data: nodes, isLoading } = useQuery({
    queryKey: ['agri-models'],
    queryFn: () => api.get('/agri-models').then(res => res.data.data)
  });

  // Fetch Schemas (for Level 2 nodes)
  const { data: schemas } = useQuery({
    queryKey: ['schemas'],
    queryFn: () => api.get('/schemas').then(res => res.data.data)
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: (values) => {
      if (modalMode === 'edit') return api.put(`/agri-models/${activeNode._id}`, values);
      return api.post('/agri-models', values);
    },
    onSuccess: () => {
      message.success(`${modalMode === 'add' ? 'Thêm' : 'Cập nhật'} thành công!`);
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries(['agri-models']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/agri-models/${id}`),
    onSuccess: () => {
      message.success('Đã xóa thành phần và các thư mục con!');
      queryClient.invalidateQueries(['agri-models']);
    }
  });

  // Tree Processing
  const buildTree = (data) => {
    if (!data) return [];
    const map = {};
    const tree = [];
    data.forEach(node => {
      map[node._id] = { ...node, children: [] };
    });
    data.forEach(node => {
      if (node.parentId) {
        if (map[node.parentId]) map[node.parentId].children.push(map[node._id]);
      } else {
        tree.push(map[node._id]);
      }
    });
    return tree;
  };

  const treeData = buildTree(nodes);

  const handleAdd = (level, parentId = null) => {
    setModalMode('add');
    setActiveNode({ level, parentId });
    form.setFieldsValue({ level, parentId });
    setIsModalOpen(true);
  };

  const handleEdit = (node) => {
    setModalMode('edit');
    setActiveNode(node);
    form.setFieldsValue(node);
    setIsModalOpen(true);
  };

  const RenderNode = ({ node, level }) => {
    const colors = [
      'bg-blue-100 border-blue-200 text-blue-700', // Level 0
      'bg-green-100 border-green-200 text-green-700 ml-8', // Level 1
      'bg-orange-50 border-orange-100 text-orange-700 ml-16' // Level 2
    ];

    const btnLabel = level === 0 ? 'Thêm danh mục' : level === 1 ? 'Thêm đối tượng sản xuất' : null;

    return (
      <div className="mb-2">
        <div className={`flex items-center justify-between p-2 rounded-lg border shadow-sm transition-all hover:shadow-md ${colors[level]}`}>
          <Space>
            <Text strong className="text-inherit">
              {level === 0 ? '1' : level === 1 ? '1.1' : '1.1.1'} {node.name}
            </Text>
            {node.schemaId && (
              <TagOutlined className="text-xs opacity-50" />
            )}
          </Space>
          
          <Space>
            {btnLabel && (
              <Button 
                type="primary" 
                size="small" 
                className="text-[10px] font-bold h-7 rounded-md px-4"
                onClick={() => handleAdd(level + 1, node._id)}
              >
                {btnLabel}
              </Button>
            )}
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              type="text" 
              className="text-blue-600 hover:bg-white"
              onClick={() => handleEdit(node)}
            />
            <Popconfirm 
              title="Xác nhận xóa?" 
              description="Hành động này sẽ xóa cả các thư mục con."
              onConfirm={() => deleteMutation.mutate(node._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" icon={<DeleteOutlined />} type="text" danger className="hover:bg-white" />
            </Popconfirm>
          </Space>
        </div>
        
        {node.children && node.children.map(child => (
          <RenderNode key={child._id} node={child} level={level + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
           <HomeOutlined />
           <span>Dashboard</span>
           <span className="text-gray-200">/</span>
           <span className="text-green-600">Mô hình nông nghiệp</span>
        </div>
        <div className="flex justify-between items-center">
            <Title level={4} className="!mb-0">Cây phân cấp mô hình sản xuất</Title>
            <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                className="premium-gradient border-0 rounded-lg font-bold h-10 px-6 shadow-lg shadow-green-100"
                onClick={() => handleAdd(0)}
            >
                Thêm mới mô hình nông nghiệp
            </Button>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm rounded-[24px] p-4 min-h-[500px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
        ) : treeData.length > 0 ? (
          treeData.map(model => (
            <RenderNode key={model._id} node={model} level={0} />
          ))
        ) : (
          <Empty description="Chưa có mô hình nào được khởi tạo. Hãy nhấn nút phía trên để bắt đầu." />
        )}
      </Card>

      <Modal
        title={<span className="font-bold">{modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} thành phần</span>}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        centered
        className="rounded-2xl overflow-hidden"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          className="mt-6"
        >
          <Form.Item name="level" hidden><Input /></Form.Item>
          <Form.Item name="parentId" hidden><Input /></Form.Item>

          <Form.Item
            name="name"
            label="Tên thành phần"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input className="h-11 rounded-lg" placeholder="Ví dụ: VietGAP Trồng trọt, Chè búp..." />
          </Form.Item>

          {activeNode?.level === 2 && (
            <Form.Item
              name="schemaId"
              label="Gắn liên kết Biểu mẫu Nhật ký"
              tooltip="Đối tượng sản xuất cuối cùng cần có một biểu mẫu nhật ký đi kèm."
            >
              <Select 
                placeholder="Chọn biểu mẫu nhật ký..." 
                className="h-11 rounded-lg"
                options={schemas?.map(s => ({ value: s._id, label: s.name }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="order"
            label="Thứ tự hiển thị"
            initialValue={0}
          >
             <Input type="number" className="h-11 rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgricultureModels;
