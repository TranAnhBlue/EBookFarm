import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, DatePicker, Select, Typography, message, Skeleton } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

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
      if(isEditing && journalData && schema) {
          const initValues = { ...journalData.entries, status: journalData.status };
          form.setFieldsValue(initValues);
      }
  }, [isEditing, journalData, schema, form]);

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

  if (schemaLoading || (isEditing && journalLoading)) return <Skeleton active />;
  if (!schema) return <div>Schema not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <div>
             <Title level={2} className="!mb-0">{isEditing ? 'Edit' : 'New'} entry: {schema.name}</Title>
             <p className="text-gray-500">{schema.description}</p>
           </div>
        </div>

        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
            {schema.tables.map((table, idx) => (
                <Card title={table.tableName} key={idx} className="mb-6 shadow-sm">
                    {/* Render table fields dynamically */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {table.fields.map((field) => (
                            <div key={field.name}>
                                <Form.Item 
                                    name={[table.tableName, field.name]} 
                                    label={field.label}
                                    rules={[{ required: field.required, message: `${field.label} is required` }]}
                                >
                                    {field.type === 'text' && <Input />}
                                    {field.type === 'number' && <InputNumber className="w-full" />}
                                    {field.type === 'date' && <DatePicker className="w-full" />}
                                    {field.type === 'select' && (
                                        <Select>
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
            ))}

            <Card className="mb-6">
                <Form.Item name="status" label="Record Status" initialValue="Draft" className="mb-0 w-64">
                    <Select>
                        <Option value="Draft">Draft</Option>
                        <Option value="Completed">Completed</Option>
                    </Select>
                </Form.Item>
            </Card>

            <div className="flex gap-4">
                <Button type="primary" htmlType="submit" size="large" loading={saveMutation.isPending}>
                    Save Journal
                </Button>
                <Button size="large" onClick={() => navigate('/journal')}>Cancel</Button>
            </div>
        </Form>
    </div>
  );
};

export default JournalEntry;
