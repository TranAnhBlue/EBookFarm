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
      itemRender: (originNode) => {
          return (
              <div className="inline-block m-2">
                  {originNode}
              </div>
          );
      }
  };

  const saveMutation = useMutation({
      mutationFn: async (values) => {
          // Validation bổ sung trước khi gửi
          const errors = [];
          
          // Kiểm tra ít nhất một tab phải có dữ liệu
          const hasData = schema.tables.some(table => {
              const tableData = values[table.tableName];
              return tableData && Object.values(tableData).some(value => value !== undefined && value !== null && value !== '');
          });
          
          if (!hasData) {
              errors.push('Vui lòng nhập ít nhất một thông tin trong các tab!');
          }
          
          // Kiểm tra logic nghiệp vụ
          const thongTinChung = values['Thông tin chung'];
          if (thongTinChung) {
              // Kiểm tra năm sản xuất hợp lý
              if (thongTinChung.namSanXuat) {
                  const currentYear = new Date().getFullYear();
                  if (thongTinChung.namSanXuat < currentYear - 5 || thongTinChung.namSanXuat > currentYear + 2) {
                      errors.push(`Năm sản xuất phải từ ${currentYear - 5} đến ${currentYear + 2}!`);
                  }
              }
              
              // Kiểm tra diện tích hợp lý
              if (thongTinChung.dienTich && thongTinChung.dienTich > 1000000) {
                  errors.push('Diện tích không được vượt quá 1,000,000 m²!');
              }
          }
          
          // Kiểm tra thời gian hợp lý trong thực hành sản xuất
          const thucHanhSanXuat = values['Nhật ký thực hành sản xuất'];
          if (thucHanhSanXuat) {
              if (thucHanhSanXuat.ngayTrong && thucHanhSanXuat.duKienThuHoachTu) {
                  const ngayTrong = new Date(thucHanhSanXuat.ngayTrong);
                  const ngayThuHoach = new Date(thucHanhSanXuat.duKienThuHoachTu);
                  if (ngayThuHoach <= ngayTrong) {
                      errors.push('Ngày thu hoạch phải sau ngày trồng!');
                  }
              }
          }
          
          if (errors.length > 0) {
              throw new Error(errors.join('\n'));
          }
          
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
          const errorMessage = err.message || err.response?.data?.message || 'Lỗi khi lưu nhật ký. Vui lòng thử lại.';
          
          // Hiển thị lỗi validation chi tiết
          if (errorMessage.includes('\n')) {
              const errors = errorMessage.split('\n');
              errors.forEach(error => {
                  message.error(error, 5); // Hiển thị 5 giây
              });
          } else {
              message.error(errorMessage);
          }
      }
  });

  // Validation rules cho các trường khác nhau
  const getValidationRules = (field) => {
    const rules = [];
    
    // Required validation
    if (field.required) {
      rules.push({ 
        required: true, 
        message: `Vui lòng nhập ${field.label}` 
      });
    }

    // Validation theo loại trường
    switch (field.type) {
      case 'text':
        // Validation cho các trường text cụ thể
        if (field.name.includes('email') || field.label.toLowerCase().includes('email')) {
          rules.push({
            type: 'email',
            message: 'Email không hợp lệ!'
          });
        }
        
        if (field.name.includes('phone') || field.label.toLowerCase().includes('điện thoại')) {
          rules.push({
            pattern: /^[0-9]{10,11}$/,
            message: 'Số điện thoại phải có 10-11 chữ số!'
          });
        }

        if (field.name.includes('maSo') || field.name.includes('maHo')) {
          rules.push({
            pattern: /^[A-Z0-9]{3,20}$/,
            message: 'Mã số chỉ chứa chữ hoa và số, từ 3-20 ký tự!'
          });
        }

        // Giới hạn độ dài
        if (field.name.includes('tenCoSo') || field.name.includes('hoTen')) {
          rules.push({
            min: 2,
            max: 100,
            message: 'Tên phải từ 2-100 ký tự!'
          });
        }

        if (field.name.includes('diaChi')) {
          rules.push({
            min: 10,
            max: 200,
            message: 'Địa chỉ phải từ 10-200 ký tự!'
          });
        }

        break;

      case 'number':
        rules.push({
          type: 'number',
          min: 0,
          message: 'Giá trị phải là số dương!'
        });

        // Validation cụ thể cho từng trường số
        if (field.name.includes('dienTich')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 1000000,
            message: 'Diện tích phải từ 1 đến 1,000,000 m²!'
          });
        }

        if (field.name.includes('matDo')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 1000,
            message: 'Mật độ phải từ 0.1 đến 1000 cây/m²!'
          });
        }

        if (field.name.includes('soLuong')) {
          rules.push({
            type: 'number',
            min: 1,
            message: 'Số lượng phải lớn hơn 0!'
          });
        }

        if (field.name.includes('namSanXuat')) {
          const currentYear = new Date().getFullYear();
          rules.push({
            type: 'number',
            min: currentYear - 5,
            max: currentYear + 2,
            message: `Năm sản xuất phải từ ${currentYear - 5} đến ${currentYear + 2}!`
          });
        }

        if (field.name.includes('thoiGianCachLy')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 365,
            message: 'Thời gian cách ly phải từ 0-365 ngày!'
          });
        }

        break;

      case 'date':
        // Validation cho ngày tháng
        if (field.name.includes('hanSuDung')) {
          rules.push({
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const today = new Date();
              const selectedDate = new Date(value);
              if (selectedDate <= today) {
                return Promise.reject(new Error('Hạn sử dụng phải sau ngày hôm nay!'));
              }
              return Promise.resolve();
            }
          });
        }

        if (field.name.includes('ngayTrong') || field.name.includes('ngayBatDau')) {
          rules.push({
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const today = new Date();
              const selectedDate = new Date(value);
              const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
              const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
              
              if (selectedDate < oneYearAgo || selectedDate > oneYearLater) {
                return Promise.reject(new Error('Ngày phải trong khoảng 1 năm trước đến 1 năm sau!'));
              }
              return Promise.resolve();
            }
          });
        }

        break;

      case 'select':
        // Select không cần validation đặc biệt vì đã giới hạn options
        break;
    }

    return rules;
  };

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
                            rules={getValidationRules(field)}
                            className="mb-4"
                        >
                            {field.type === 'text' && (
                                <Input 
                                    size="large" 
                                    className="rounded-xl border-gray-200"
                                    placeholder={`Nhập ${field.label.toLowerCase()}`}
                                    maxLength={field.name.includes('diaChi') ? 200 : field.name.includes('tenCoSo') || field.name.includes('hoTen') ? 100 : 50}
                                    showCount={field.name.includes('diaChi') || field.name.includes('tenCoSo') || field.name.includes('hoTen')}
                                />
                            )}
                            {field.type === 'number' && (
                                <InputNumber 
                                    size="large" 
                                    className="w-full rounded-xl border-gray-200"
                                    placeholder={`Nhập ${field.label.toLowerCase()}`}
                                    min={0}
                                    max={field.name.includes('dienTich') ? 1000000 : field.name.includes('namSanXuat') ? new Date().getFullYear() + 2 : undefined}
                                    formatter={field.name.includes('dienTich') ? (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : undefined}
                                    parser={field.name.includes('dienTich') ? (value) => value.replace(/\$\s?|(,*)/g, '') : undefined}
                                />
                            )}
                            {field.type === 'date' && (
                                <DatePicker 
                                    size="large" 
                                    className="w-full rounded-xl border-gray-200"
                                    placeholder={`Chọn ${field.label.toLowerCase()}`}
                                    format="DD/MM/YYYY"
                                    disabledDate={field.name.includes('hanSuDung') ? (current) => current && current < new Date() : undefined}
                                />
                            )}
                            {field.type === 'select' && (
                                <Select 
                                    size="large" 
                                    className="rounded-xl border-gray-200"
                                    placeholder={`Chọn ${field.label.toLowerCase()}`}
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                >
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