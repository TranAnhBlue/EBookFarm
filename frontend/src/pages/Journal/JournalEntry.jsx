import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, DatePicker, Select, Typography, message, Skeleton, Space, Tabs, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import VoiceInput from '../../components/VoiceInput';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const JournalEntry = () => {
  const { schemaId, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  
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
      const rawEntries = journalData.entries || {};
      const convertedEntries = {};

      // Convert nested table date fields
      schema.tables.forEach(table => {
        const tableName = table.tableName;
        convertedEntries[tableName] = {};
        table.fields.forEach(field => {
          const val = rawEntries[tableName]?.[field.name];
          if (field.type === 'date' && val) {
            convertedEntries[tableName][field.name] = dayjs(val);
          } else {
            convertedEntries[tableName][field.name] = val;
          }
        });
      });

      // Load basic flat fields (Địa chỉ, Diện tích, Lô sản xuất...)
      const basicFields = ['Mã nông hộ', 'Họ và tên', 'Địa chỉ', 'Diện tích', 'Lô sản xuất', 'Tên cơ sở', 'Địa chỉ sản xuất', 'Mã số thửa'];
      basicFields.forEach(key => {
        if (rawEntries[key] !== undefined) {
          convertedEntries[key] = rawEntries[key];
        }
      });
      // Convert Ngày bắt đầu
      if (rawEntries['Ngày bắt đầu']) {
        convertedEntries['Ngày bắt đầu'] = dayjs(rawEntries['Ngày bắt đầu']);
      }

      form.setFieldsValue({ ...convertedEntries, status: journalData.status });
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

  const uploadProps = {
      name: 'file',
      multiple: true,
      fileList: fileList,
      showUploadList: true,
      beforeUpload: (file) => {
          // Kiểm tra kích thước file (giới hạn 10MB)
          const isLt10M = file.size / 1024 / 1024 < 10;
          if (!isLt10M) {
              message.error('File phải nhỏ hơn 10MB!');
              return Upload.LIST_IGNORE;
          }
          
          // Tạo preview URL cho file
          const reader = new FileReader();
          reader.onload = (e) => {
              const newFile = {
                  uid: file.uid,
                  name: file.name,
                  status: 'done',
                  url: e.target.result,
                  originFileObj: file,
                  thumbUrl: file.type.startsWith('image/') ? e.target.result : null
              };
              setFileList(prev => [...prev, newFile]);
          };
          reader.readAsDataURL(file);
          
          return false; // Ngăn upload tự động
      },
      onRemove: (file) => {
          setFileList(prev => prev.filter(item => item.uid !== file.uid));
      },
      onPreview: async (file) => {
          // Xử lý preview file
          if (file.url) {
              window.open(file.url, '_blank');
          }
      },
      itemRender: (originNode, file) => {
          return (
              <div className="inline-block m-2">
                  {originNode}
              </div>
          );
      }
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
          message.success(`Lưu nhật ký ${isEditing ? 'thành công!' : 'thành công! Đã tạo sổ mới.'}`);
          queryClient.invalidateQueries({ queryKey: ['journals'] });
          
          // Lấy đường dẫn danh sách từ URL hiện tại
          // Ví dụ: /vietgap/trong-trot/new/123 -> /vietgap/trong-trot
          // hoặc: /vietgap/trong-trot/edit/456 -> /vietgap/trong-trot
          const pathParts = location.pathname.split('/');
          const listPath = `/${pathParts[1]}/${pathParts[2]}`;
          navigate(listPath);
      },
      onError: (err) => {
          message.error(err.response?.data?.message || 'Lỗi khi lưu nhật ký. Vui lòng thử lại.');
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
        {/* Sticky top bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-green-100 sticky top-0 z-10">
           <div>
             <Title level={3} className="!mb-0 text-gray-800 flex items-center gap-2">
                 {isEditing ? 'Sổ nhật ký:' : 'Tạo sổ nhật ký mới:'} <span className="text-green-600">{schema.name}</span>
             </Title>
             <p className="text-gray-500 mt-1 mb-0">{schema.description}</p>
           </div>
           <div className="flex gap-2">
               <Button size="large" onClick={() => {
                   // Quay lại trang danh sách dựa trên URL hiện tại
                   const pathParts = location.pathname.split('/');
                   const listPath = `/${pathParts[1]}/${pathParts[2]}`;
                   navigate(listPath);
               }} className="rounded-xl">← Quay lại</Button>
               <Button type="primary" size="large" onClick={() => form.submit()} loading={saveMutation.isPending} className="rounded-xl bg-green-600 font-bold px-8">
                   Lưu nhật ký
               </Button>
           </div>
        </div>

        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
            {/* ===== THÔNG TIN CƠ BẢN LÔ SẢN XUẤT ===== */}
            <Card className="rounded-[28px] border border-green-200 bg-green-50/30 shadow-sm">
                <Title level={5} className="text-green-700 !mb-6 border-b border-green-200 pb-3 flex items-center gap-2">
                    Nhập thông tin lô sản xuất
                </Title>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {/* Required fields */}
                    <Form.Item name="Mã nông hộ" label={<span className="font-medium text-gray-700">Mã nông hộ <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Vui lòng nhập mã nông hộ' }]} className="mb-5">
                        <Input size="large" placeholder="Mã nông hộ" className="rounded-xl border-gray-200" />
                    </Form.Item>
                    <Form.Item name="Họ và tên" label={<span className="font-medium text-gray-700">Họ và tên tổ chức/cá nhân sản xuất <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]} className="mb-5">
                        <Input size="large" placeholder="Họ và tên tổ chức/cá nhân sản xuất" className="rounded-xl border-gray-200" />
                    </Form.Item>
                    <Form.Item name="Địa chỉ" label={<span className="font-medium text-gray-700">Địa chỉ <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]} className="mb-5">
                        <Input size="large" placeholder="Địa chỉ" className="rounded-xl border-gray-200" />
                    </Form.Item>
                    <Form.Item name="Diện tích" label={<span className="font-medium text-gray-700">Diện tích <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]} className="mb-5">
                        <Input size="large" placeholder="Diện tích (VD: 500 m2)" className="rounded-xl border-gray-200" />
                    </Form.Item>
                    <Form.Item name="Ngày bắt đầu" label={<span className="font-medium text-gray-700">Ngày bắt đầu <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]} className="mb-5">
                        <DatePicker size="large" className="w-full rounded-xl border-gray-200" placeholder="Ngày bắt đầu" format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="Lô sản xuất" label={<span className="font-medium text-gray-700">Lô sản xuất <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Vui lòng nhập lô sản xuất' }]} className="mb-5">
                        <Input size="large" placeholder="Lô sản xuất (VD: Lô 01)" className="rounded-xl border-gray-200" />
                    </Form.Item>

                    {/* Optional fields */}
                    <Form.Item name="Tên cơ sở" label={<span className="font-medium text-gray-600">Tên cơ sở / hộ sản xuất</span>} className="mb-5">
                        <Input size="large" placeholder="Tên cơ sở (không bắt buộc)" className="rounded-xl border-gray-200" />
                    </Form.Item>
                    <Form.Item name="Địa chỉ sản xuất" label={<span className="font-medium text-gray-600">Địa chỉ sản xuất</span>} className="mb-5">
                        <Input size="large" placeholder="Địa chỉ sản xuất chi tiết (không bắt buộc)" className="rounded-xl border-gray-200" />
                    </Form.Item>
                    <Form.Item name="Mã số thửa" label={<span className="font-medium text-gray-600">Mã số thửa</span>} className="mb-5">
                        <Input size="large" placeholder="Mã số thửa đất (không bắt buộc)" className="rounded-xl border-gray-200" />
                    </Form.Item>
                </div>
            </Card>

            {/* ===== TÀI LIỆU ĐÍNH KÈM ===== */}
            <Card className="rounded-[28px] border border-blue-200 bg-blue-50/30 shadow-sm">
                <Title level={5} className="text-blue-700 !mb-6 border-b border-blue-200 pb-3 flex items-center gap-2">
                    📎 Tài liệu đính kèm
                </Title>
                <Upload.Dragger 
                    {...uploadProps}
                    className="bg-white"
                    style={{ padding: '20px', border: '2px dashed #93c5fd', borderRadius: '16px' }}
                >
                    <div className="flex flex-col items-center justify-center py-4">
                        <InboxOutlined className="text-blue-400 text-5xl mb-3" />
                        <p className="text-gray-700 font-semibold mb-1">Tải sơ đồ lên tại đây</p>
                        <p className="text-gray-500 text-sm mb-2">
                            Nhấp hoặc kéo tệp vào khu vực này để tải lên
                        </p>
                        <p className="text-xs text-gray-400">
                            Hỗ trợ: PDF, Word, Excel, Hình ảnh (tối đa 10MB/file)
                        </p>
                    </div>
                </Upload.Dragger>
            </Card>

            {/* ===== TABS VietGAP ===== */}
            <Tabs 
                activeKey={activeTab}
                onChange={handleTabChange}
                type="card"
                className="premium-tabs"
                items={tabItems}
            />

            {/* ===== TRẠNG THÁI ===== */}
            <Card className="mt-6 rounded-2xl shadow-sm border border-gray-100 bg-white">
                <div className="w-1/2">
                    <Form.Item name="status" label="Trạng thái hồ sơ" initialValue="Draft" className="mb-0">
                        <Select size="large" className="rounded-xl">
                            <Option value="Draft">Đang thực hiện (Lưu nháp)</Option>
                            <Option value="Completed">Hoàn tất (Kết thúc vụ mùa)</Option>
                        </Select>
                    </Form.Item>
                </div>
            </Card>
        </Form>
    </div>
  );
};

export default JournalEntry;

