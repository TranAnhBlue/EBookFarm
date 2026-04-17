import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, DatePicker, Select, Typography, message, Skeleton, Space, Tabs } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import VoiceInput from '../../components/VoiceInput';

const { Title } = Typography;
const { Option } = Select;

const JournalEntry = () => {
  const { schemaId, id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  // Decide if we are creating or editing based on route params
  const isEditing = !!id;

  // Fetch Journal if editing
  const { data: journalData, isLoading: journalLoading } = useQuery({
      queryKey: ['journal', id],
      queryFn: () => api.get(`/journals/${id}`).then(res => res.data.data),
      enabled: isEditing
  });

  const activeSchemaId = isEditing && journalData ? journalData.schemaId._id : schemaId;

  // Fetch schema structure
  const { data: schema, isLoading: schemaLoading } = useQuery({
      queryKey: ['schema', activeSchemaId],
      queryFn: () => api.get(`/schemas/${activeSchemaId}`).then(res => res.data.data),
      enabled: !!activeSchemaId
  });

  useEffect(() => {
    if (isEditing && journalData && schema) {
      const initValues = { ...journalData.entries, status: journalData.status };
      form.setFieldsValue(initValues);
    }
  }, [isEditing, journalData, schema, form]);

  const handleVoiceInput = (tableName, fieldName, text) => {
      const currentValues = form.getFieldsValue();
      const tableValues = currentValues[tableName] || {};
      const currentValue = tableValues[fieldName] || '';
      
      form.setFieldValue(
          [tableName, fieldName], 
          currentValue ? `${currentValue} ${text}` : text
      );
      message.success(`Đã thêm: "${text}"`);
  };

  const saveMutation = useMutation({
      mutationFn: (values) => {
          const payload = {
              schemaId: activeSchemaId,
              status: values.status || 'Draft',
              entries: values
          };
          if(isEditing) {
              return api.put(`/journals/${id}`, payload);
          } else {
              return api.post(`/journals`, payload);
          }
      },
      onSuccess: () => {
          message.success(`Journal ${isEditing ? 'updated' : 'created'} successfully`);
          queryClient.invalidateQueries({ queryKey: ['journals'] });
          navigate('/journal');
      },
      onError: (err) => {
          message.error(err.response?.data?.message || 'Error saving journal');
      }
  });

  const [activeTab, setActiveTab] = useState("0");

  useEffect(() => {
    if (activeSchemaId) {
      const savedTab = localStorage.getItem(`journal_tab_${activeSchemaId}`);
      if (savedTab) setActiveTab(savedTab);
    }
  }, [activeSchemaId]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (activeSchemaId) {
      localStorage.setItem(`journal_tab_${activeSchemaId}`, key);
    }
  };

  if (schemaLoading || (isEditing && journalLoading)) return <Skeleton active />;
  if (!schema) return <div>Schema not found</div>;

  const tabItems = schema.tables.map((table, idx) => ({
    key: idx.toString(),
    label: <span className="font-semibold">{table.tableName}</span>,
    children: (
        <Card className="shadow-sm rounded-2xl border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <Title level={5} className="!mb-0 text-green-700">{table.tableName}</Title>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {table.fields.map((field) => (
                    <div key={field.name}>
                        <Form.Item 
                            name={[table.tableName, field.name]} 
                            label={
                                <Space>
                                    <span className="font-medium text-gray-700">{field.label}</span>
                                    {field.type === 'text' && (
                                        <VoiceInput 
                                            targetField={field.label}
                                            onSpeechEnd={(text) => handleVoiceInput(table.tableName, field.name, text)} 
                                        />
                                    )}
                                </Space>
                            }
                            rules={[{ required: field.required, message: `Vui lòng nhập ${field.label}` }]}
                            className="mb-4"
                        >
                            {field.type === 'text' && <Input size="large" className="rounded-xl border-gray-200" />}
                            {field.type === 'number' && <InputNumber size="large" className="w-full rounded-xl border-gray-200" />}
                            {field.type === 'date' && <DatePicker size="large" className="w-full rounded-xl border-gray-200" />}
                            {field.type === 'select' && (
                                <Select size="large" className="rounded-xl border-gray-200">
                                    {field.options?.map((opt) => (
                                        <Option value={opt} key={opt}>{opt}</Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    </div>
                ))}
            </div>
        </Card>
    )
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-green-100">
           <div>
             <Title level={3} className="!mb-0 text-gray-800 flex items-center gap-2">
                 {isEditing ? 'Sổ nhật ký:' : 'Tạo sổ nhật ký mới:'} <span className="text-green-600">{schema.name}</span>
             </Title>
             <p className="text-gray-500 mt-1 mb-0">{schema.description}</p>
           </div>
           <div className="flex gap-2">
               <Button size="large" onClick={() => navigate('/journal')} className="rounded-xl">Quay lại</Button>
               <Button type="primary" size="large" onClick={() => form.submit()} loading={saveMutation.isPending} className="rounded-xl bg-green-600 font-bold px-8">
                   Lưu nhật ký
               </Button>
           </div>
        </div>

        {/* Info Header as per Design */}
        <Card bordered={false} className="shadow-sm rounded-[24px] border border-green-200 bg-green-50/30">
            <Title level={5} className="text-green-700 !mb-4 border-b border-green-200 pb-2">Thông tin lô sản xuất</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Họ tên tổ chức/cá nhân:</span>
                    <span className="font-bold text-gray-800">{journalData?.userId?.fullname || journalData?.userId?.username || 'Đang cập nhật'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Quy mô/Diện tích:</span>
                    <span className="font-bold text-gray-800">{form.getFieldValue('Diện tích') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Địa chỉ sản xuất:</span>
                    <span className="font-bold text-gray-800">{form.getFieldValue('Địa chỉ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Ngày bắt đầu:</span>
                    <span className="font-bold text-gray-800">{journalData?.createdAt ? new Date(journalData.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        </Card>

        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
            <Tabs 
                activeKey={activeTab}
                onChange={handleTabChange}
                type="card"
                className="premium-tabs"
                items={tabItems}
            />

            <Card className="mt-6 rounded-2xl shadow-sm border border-gray-100 bg-white">
                <div className="flex justify-between items-center">
                    <div className="w-1/2">
                        <Form.Item name="status" label="Trạng thái hồ sơ" initialValue="Draft" className="mb-0">
                            <Select size="large" className="rounded-xl">
                                <Option value="Draft">Đang thực hiện (Lưu nháp)</Option>
                                <Option value="Completed">Hoàn tất (Kết thúc vụ mùa)</Option>
                            </Select>
                        </Form.Item>
                    </div>
                </div>
            </Card>
        </Form>
    </div>
  );
};

export default JournalEntry;
