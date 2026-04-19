import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Avatar, Space, message, Divider, Row, Col, Select, DatePicker, Upload, Tag, Spin, Alert } from 'antd';
import { UserOutlined, MailOutlined, HomeOutlined, SaveOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, CameraOutlined, IdcardOutlined, ShopOutlined, SafetyCertificateOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import dayjs from 'dayjs';
import { getProvinces, getDistrictsByProvince, getWardsByDistrict, checkMergeWarning } from '../../services/locationService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AccountInfo = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  
  // State cho địa phương
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  const [mergeWarning, setMergeWarning] = useState(null);

  // Load danh sách tỉnh/thành khi component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      const data = await getProvinces();
      setProvinces(data);
      setLoadingProvinces(false);
    };
    fetchProvinces();
  }, []);

  // Load districts khi chọn province
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvinceCode) {
        setLoadingDistricts(true);
        const data = await getDistrictsByProvince(selectedProvinceCode);
        setDistricts(data);
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  // Load wards khi chọn district
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrictCode) {
        setLoadingWards(true);
        const data = await getWardsByDistrict(selectedDistrictCode);
        setWards(data);
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  // Xử lý khi chọn province
  const handleProvinceChange = (value, option) => {
    setSelectedProvinceCode(option.code);
    form.setFieldsValue({ 
      province: option.name,
      district: undefined, 
      ward: undefined 
    });
    setDistricts([]);
    setWards([]);
    setSelectedDistrictCode(null);
  };

  // Xử lý khi chọn district
  const handleDistrictChange = (value, option) => {
    setSelectedDistrictCode(option.code);
    form.setFieldsValue({ 
      district: option.name,
      ward: undefined 
    });
    setWards([]);
    
    // Kiểm tra cảnh báo sáp nhập
    const provinceName = form.getFieldValue('province');
    const warning = checkMergeWarning(provinceName, option.name);
    setMergeWarning(warning);
  };

  // Xử lý khi chọn ward
  const handleWardChange = (value, option) => {
    form.setFieldsValue({ ward: option.name });
  };

  const updateMutation = useMutation({
    mutationFn: (values) => {
      const updateData = {
        fullname: values.fullname,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        address: values.address,
        province: values.province,
        district: values.district,
        ward: values.ward,
        farmName: values.farmName,
        farmCode: values.farmCode,
        farmArea: values.farmArea,
        farmType: values.farmType,
        certifications: values.certifications,
        organization: values.organization,
        bio: values.bio,
        avatar: avatarUrl
      };
      return api.put('/users/profile', updateData);
    },
    onSuccess: (res) => {
      setUser(res.data.data);
      message.success('Cập nhật hồ sơ thành công!');
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => message.error(err.message || err.response?.data?.message || 'Có lỗi xảy ra!')
  });

  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      message.loading({ content: 'Đang tải ảnh lên...', key: 'avatar' });
    }
    if (info.file.status === 'done') {
      const avatarUrl = info.file.response.data.avatar;
      setAvatarUrl(avatarUrl);
      setUser({ ...user, avatar: avatarUrl });
      message.success({ content: 'Tải ảnh đại diện thành công!', key: 'avatar' });
    } else if (info.file.status === 'error') {
      console.error('Upload error:', info.file.error, info.file.response);
      message.error({ content: info.file.response?.message || info.file.error?.message || 'Tải ảnh thất bại!', key: 'avatar' });
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ chấp nhận file ảnh!');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const uploadButton = (
    <div className="text-center">
      <CameraOutlined className="text-2xl text-gray-400 mb-2" />
      <div className="text-xs text-gray-500">Thay đổi</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
           <HomeOutlined />
           <span>Tổng quan</span>
           <span className="text-gray-200">/</span>
           <span className="text-green-600">Thông tin tài khoản</span>
        </div>
        <Title level={4} className="!mb-0">Hồ sơ cá nhân</Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col span={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-[24px] text-center p-4 h-full">
            <div className="relative inline-block mb-4">
                <Avatar 
                    size={100} 
                    src={avatarUrl ? `http://localhost:5000${avatarUrl}` : null}
                    icon={!avatarUrl && <UserOutlined />} 
                    className="bg-green-50 text-green-600 border-4 border-white shadow-lg"
                />
                <Upload
                    name="avatar"
                    showUploadList={false}
                    action="http://localhost:5000/api/upload/avatar"
                    headers={{
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }}
                    beforeUpload={beforeUpload}
                    onChange={handleAvatarChange}
                    className="absolute bottom-0 right-0"
                >
                    <Button 
                        shape="circle" 
                        size="small" 
                        icon={<CameraOutlined />} 
                        className="bg-green-500 text-white border-0 shadow-lg hover:bg-green-600"
                    />
                </Upload>
            </div>
            
            <Title level={4} className="!mb-0">{user?.fullname || user?.username}</Title>
            <Text type="secondary" className="text-xs uppercase font-bold tracking-widest text-green-600">{user?.role}</Text>
            
            {user?.bio && (
                <Text className="text-sm text-gray-500 block mt-3 px-4">{user.bio}</Text>
            )}
            
            <Divider className="my-6" />
            
            <div className="space-y-4 text-left px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <UserOutlined />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Username</Text>
                        <Text strong className="block truncate">@{user?.username}</Text>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <MailOutlined />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Email</Text>
                        <Text strong className="text-xs block truncate">{user?.email}</Text>
                    </div>
                </div>
                
                {user?.phone && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <PhoneOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text type="secondary" className="text-[10px] uppercase font-bold block">Điện thoại</Text>
                            <Text strong className="block truncate">{user.phone}</Text>
                        </div>
                    </div>
                )}
                
                {user?.dateOfBirth && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <IdcardOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text type="secondary" className="text-[10px] uppercase font-bold block">Ngày sinh</Text>
                            <Text strong className="block truncate">{dayjs(user.dateOfBirth).format('DD/MM/YYYY')}</Text>
                        </div>
                    </div>
                )}
                
                {user?.gender && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <UserOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text type="secondary" className="text-[10px] uppercase font-bold block">Giới tính</Text>
                            <Text strong className="block truncate">{user.gender}</Text>
                        </div>
                    </div>
                )}
                
                {user?.organization && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <ShopOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text type="secondary" className="text-[10px] uppercase font-bold block">Tổ chức</Text>
                            <Text strong className="block truncate">{user.organization}</Text>
                        </div>
                    </div>
                )}
                
                {(user?.province || user?.district || user?.ward || user?.address) && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <EnvironmentOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text type="secondary" className="text-[10px] uppercase font-bold block">Địa chỉ</Text>
                            <Text strong className="text-xs block">
                                {[user?.address, user?.ward, user?.district, user?.province]
                                    .filter(Boolean)
                                    .join(', ')}
                            </Text>
                        </div>
                    </div>
                )}
                
                {user?.farmName && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <ShopOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text type="secondary" className="text-[10px] uppercase font-bold block">Nông trại</Text>
                            <Text strong className="block truncate">{user.farmName}</Text>
                        </div>
                    </div>
                )}
                
                {user?.farmCode && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <IdcardOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text type="secondary" className="text-[10px] uppercase font-bold block">Mã nông trại</Text>
                            <Text strong className="block truncate">{user.farmCode}</Text>
                        </div>
                    </div>
                )}
                
                {user?.farmArea && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <EnvironmentOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text type="secondary" className="text-[10px] uppercase font-bold block">Diện tích</Text>
                            <Text strong className="block truncate">{user.farmArea.toLocaleString()} m²</Text>
                        </div>
                    </div>
                )}
                
                {user?.farmType && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                            <ShopOutlined />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Text type="secondary" className="text-[10px] uppercase font-bold block">Loại hình</Text>
                            <Text strong className="block truncate">{user.farmType}</Text>
                        </div>
                    </div>
                )}
                
                {user?.certifications && user.certifications.length > 0 && (
                    <div>
                        <Text type="secondary" className="text-[10px] uppercase font-bold block mb-2">Chứng nhận</Text>
                        <div className="flex flex-wrap gap-1">
                            {user.certifications.map((cert, idx) => (
                                <Tag key={idx} color="green" className="text-xs">{cert}</Tag>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </Card>
        </Col>

        {/* Edit Form */}
        <Col span={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-[24px] p-4">
             <Title level={5} className="mb-6 flex items-center gap-2">
                 <EditOutlined className="text-green-500" />
                 Thay đổi thông tin
             </Title>
             
             <Form
                form={form}
                layout="vertical"
                initialValues={{
                    ...user,
                    dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth) : null
                }}
                onFinish={(values) => updateMutation.mutate(values)}
             >
                {/* Thông tin cơ bản */}
                <Divider orientation="left" className="!text-gray-600 !text-sm font-bold">
                    <IdcardOutlined className="mr-2" />
                    Thông tin cá nhân
                </Divider>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="fullname"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Nhập họ tên!' }]}
                    >
                        <Input className="h-11 rounded-lg" prefix={<UserOutlined className="text-gray-300" />} placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    
                    <Form.Item
                        name="email"
                        label="Địa chỉ Email"
                    >
                        <Input disabled className="h-11 rounded-lg bg-gray-50" prefix={<MailOutlined className="text-gray-300" />} />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }]}
                    >
                        <Input className="h-11 rounded-lg" prefix={<PhoneOutlined className="text-gray-300" />} placeholder="0912345678" />
                    </Form.Item>

                    <Form.Item 
                        name="dateOfBirth" 
                        label="Ngày sinh"
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    const age = dayjs().diff(value, 'year');
                                    if (age < 16) {
                                        return Promise.reject(new Error('Phải từ 16 tuổi trở lên!'));
                                    }
                                    if (age > 100) {
                                        return Promise.reject(new Error('Ngày sinh không hợp lệ!'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <DatePicker 
                            className="w-full h-11 rounded-lg" 
                            format="DD/MM/YYYY" 
                            placeholder="Chọn ngày sinh"
                            disabledDate={(current) => {
                                // Không cho chọn ngày trong tương lai
                                return current && current > dayjs().endOf('day');
                            }}
                        />
                    </Form.Item>

                    <Form.Item name="gender" label="Giới tính">
                        <Select className="h-11" placeholder="Chọn giới tính">
                            <Option value="Nam">Nam</Option>
                            <Option value="Nữ">Nữ</Option>
                            <Option value="Khác">Khác</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="organization" label="Tổ chức/Công ty">
                        <Input className="h-11 rounded-lg" prefix={<ShopOutlined className="text-gray-300" />} placeholder="HTX Nông nghiệp..." />
                    </Form.Item>
                </div>

                <Form.Item name="bio" label="Giới thiệu ngắn">
                    <TextArea rows={3} className="rounded-lg" placeholder="Mô tả ngắn về bản thân..." />
                </Form.Item>

                {/* Địa chỉ */}
                <Divider orientation="left" className="!text-gray-600 !text-sm font-bold mt-6">
                    <EnvironmentOutlined className="mr-2" />
                    Địa chỉ
                </Divider>
                
                {mergeWarning && (
                    <Alert
                        message="Thông báo sáp nhập đơn vị hành chính"
                        description={mergeWarning.message}
                        type="warning"
                        icon={<WarningOutlined />}
                        showIcon
                        closable
                        onClose={() => setMergeWarning(null)}
                        className="mb-4"
                    />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Form.Item name="province" label="Tỉnh/Thành phố">
                        <Select 
                            className="h-11" 
                            placeholder="Chọn tỉnh/thành phố"
                            showSearch
                            loading={loadingProvinces}
                            notFoundContent={loadingProvinces ? <Spin size="small" /> : 'Không tìm thấy'}
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={handleProvinceChange}
                        >
                            {provinces.map((province) => (
                                <Option 
                                    value={province.name} 
                                    key={province.code}
                                    code={province.code}
                                    name={province.name}
                                >
                                    {province.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="district" label="Quận/Huyện">
                        <Select 
                            className="h-11" 
                            placeholder="Chọn quận/huyện"
                            disabled={!selectedProvinceCode}
                            showSearch
                            loading={loadingDistricts}
                            notFoundContent={loadingDistricts ? <Spin size="small" /> : 'Không tìm thấy'}
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={handleDistrictChange}
                        >
                            {districts.map((district) => (
                                <Option 
                                    value={district.name} 
                                    key={district.code}
                                    code={district.code}
                                    name={district.name}
                                >
                                    {district.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="ward" label="Phường/Xã">
                        <Select 
                            className="h-11" 
                            placeholder="Chọn phường/xã"
                            disabled={!selectedDistrictCode}
                            showSearch
                            loading={loadingWards}
                            notFoundContent={loadingWards ? <Spin size="small" /> : 'Không tìm thấy'}
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={handleWardChange}
                        >
                            {wards.map((ward) => (
                                <Option 
                                    value={ward.name} 
                                    key={ward.code}
                                    code={ward.code}
                                    name={ward.name}
                                >
                                    {ward.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item name="address" label="Địa chỉ chi tiết">
                    <Input className="h-11 rounded-lg" prefix={<EnvironmentOutlined className="text-gray-300" />} placeholder="Số nhà, tên đường..." />
                </Form.Item>

                {/* Thông tin nông trại (chỉ hiện với User role) */}
                {user?.role === 'User' && (
                    <>
                        <Divider orientation="left" className="!text-gray-600 !text-sm font-bold mt-6">
                            <ShopOutlined className="mr-2" />
                            Thông tin nông trại
                        </Divider>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item name="farmName" label="Tên nông trại">
                                <Input className="h-11 rounded-lg" placeholder="Nông trại ABC" />
                            </Form.Item>

                            <Form.Item name="farmCode" label="Mã số nông trại">
                                <Input className="h-11 rounded-lg" placeholder="NT-001" />
                            </Form.Item>

                            <Form.Item name="farmArea" label="Diện tích (m²)">
                                <Input type="number" className="h-11 rounded-lg" placeholder="5000" />
                            </Form.Item>

                            <Form.Item name="farmType" label="Loại hình">
                                <Select className="h-11" placeholder="Chọn loại hình">
                                    <Option value="Trồng trọt">Trồng trọt</Option>
                                    <Option value="Chăn nuôi">Chăn nuôi</Option>
                                    <Option value="Thủy sản">Thủy sản</Option>
                                    <Option value="Hỗn hợp">Hỗn hợp</Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item name="certifications" label="Chứng nhận">
                            <Select 
                                mode="tags" 
                                className="rounded-lg" 
                                placeholder="VietGAP, Hữu cơ, GlobalGAP..."
                                suffixIcon={<SafetyCertificateOutlined />}
                            >
                                <Option value="VietGAP">VietGAP</Option>
                                <Option value="Hữu cơ">Hữu cơ</Option>
                                <Option value="GlobalGAP">GlobalGAP</Option>
                                <Option value="HACCP">HACCP</Option>
                                <Option value="ISO 22000">ISO 22000</Option>
                            </Select>
                        </Form.Item>
                    </>
                )}

                <div className="flex justify-end mt-6">
                    <Button 
                        type="primary" 
                        icon={<SaveOutlined />} 
                        onClick={() => form.submit()}
                        loading={updateMutation.isLoading}
                        className="h-11 px-8 rounded-xl bg-green-600 border-0 font-bold shadow-lg shadow-green-100"
                    >
                        Lưu thông tin hồ sơ
                    </Button>
                </div>
             </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccountInfo;
