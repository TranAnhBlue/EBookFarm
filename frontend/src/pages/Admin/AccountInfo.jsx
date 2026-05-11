import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Avatar, Space, message, Divider, Row, Col, Select, DatePicker, Upload, Tag, Spin, Alert, Empty, Modal, Tooltip } from 'antd';
import { UserOutlined, MailOutlined, HomeOutlined, SaveOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, CameraOutlined, IdcardOutlined, ShopOutlined, SafetyCertificateOutlined, LoadingOutlined, WarningOutlined, PlusOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import dayjs from 'dayjs';
import { getProvinces, getWardsByProvince } from '../../services/locationService';
import { API_BASE_URL, API_URL, getAvatarUrl, getInitialAvatar } from '../../utils/helpers';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CertificationModal = ({ visible, onCancel, onSave, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [fileUrl, setFileUrl] = useState('');

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : null,
                    expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : null,
                });
                setFileUrl(initialValues.fileUrl || '');
            } else {
                form.resetFields();
                setFileUrl('');
            }
        }
    }, [visible, initialValues, form]);

    const handleFileUpload = (info) => {
        if (info.file.status === 'done') {
            setFileUrl(info.file.response.data.url || info.file.response.data.fileUrl);
            message.success('Tải tệp lên thành công');
        } else if (info.file.status === 'error') {
            message.error('Tải tệp thất bại');
        }
    };

    return (
        <Modal
            title={initialValues ? "Chỉnh sửa chứng nhận" : "Thêm chứng nhận mới"}
            open={visible}
            onCancel={onCancel}
            onOk={() => {
                form.validateFields().then(values => {
                    onSave({ ...values, fileUrl });
                });
            }}
            confirmLoading={loading}
            width={600}
            centered
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="name" label="Tên chứng nhận" rules={[{ required: true, message: 'Vui lòng nhập tên chứng nhận!' }]}>
                            <Select placeholder="Chọn loại chứng nhận" showSearch>
                                <Option value="VietGAP">VietGAP</Option>
                                <Option value="GlobalGAP">GlobalGAP</Option>
                                <Option value="Organic">Hữu cơ (Organic)</Option>
                                <Option value="HACCP">HACCP</Option>
                                <Option value="ISO 22000">ISO 22000</Option>
                                <Option value="OCOP">OCOP</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="code" label="Số hiệu chứng chỉ">
                            <Input placeholder="Ví dụ: VG-2024-001" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="issuer" label="Tổ chức cấp">
                            <Input placeholder="Ví dụ: Trung tâm Kiểm định..." />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="issueDate" label="Ngày cấp">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="expiryDate" label="Ngày hết hạn">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Bản scan chứng chỉ (Ảnh/PDF)">
                            <Upload
                                name="file"
                                action={`${API_URL}/upload/document`}
                                headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                                onChange={handleFileUpload}
                                maxCount={1}
                                showUploadList={true}
                            >
                                <Button icon={<CameraOutlined />}>Tải tệp lên</Button>
                            </Upload>
                            {fileUrl && <Text type="success" className="text-[10px] mt-1 block">Đã đính kèm tệp</Text>}
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

const ChangePhoneModal = ({ visible, onCancel, onVerify, loading }) => {
    const [form] = Form.useForm();
    const [countdown, setCountdown] = useState(0);
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const sendOtp = async () => {
        try {
            const phone = form.getFieldValue('phone');
            if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
                return message.error('Vui lòng nhập số điện thoại hợp lệ!');
            }

            setOtpLoading(true);
            await api.post('/auth/send-otp', { phone, type: 'CHANGE_PHONE' });
            message.success('Mã OTP đã được gửi!');
            setCountdown(60);
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi gửi OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <Modal
            title="Thay đổi số điện thoại"
            open={visible}
            onCancel={onCancel}
            onOk={() => {
                form.validateFields().then(values => {
                    onVerify(values);
                });
            }}
            confirmLoading={loading}
            centered
        >
            <Form form={form} layout="vertical">
                <Form.Item 
                    name="phone" 
                    label="Số điện thoại mới" 
                    rules={[{ required: true }, { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }]}
                >
                    <Space.Compact className="w-full">
                        <Input placeholder="Nhập số điện thoại mới" />
                        <Button 
                            type="primary" 
                            onClick={sendOtp} 
                            disabled={countdown > 0} 
                            loading={otpLoading}
                        >
                            {countdown > 0 ? `${countdown}s` : 'Gửi mã'}
                        </Button>
                    </Space.Compact>
                </Form.Item>
                <Form.Item 
                    name="otp" 
                    label="Mã OTP" 
                    rules={[{ required: true, len: 6, message: 'Mã OTP gồm 6 chữ số' }]}
                >
                    <Input placeholder="Nhập mã 6 chữ số" maxLength={6} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const AccountInfo = () => {
    const { user, setUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    const [isCertModalVisible, setIsCertModalVisible] = useState(false);
    const [editingCert, setEditingCert] = useState(null);
    const [localCerts, setLocalCerts] = useState(user?.certifications || []);
    
    const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);

    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            const data = await getProvinces();
            setProvinces(data);
            setLoadingProvinces(false);
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                ...user,
                dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null
            });
            setAvatarUrl(user.avatar || '');
            setLocalCerts(user.certifications || []);
        }
    }, [user, form]);

    useEffect(() => {
        const fetch = async () => {
            if (selectedProvinceCode) {
                setLoadingWards(true);
                const data = await getWardsByProvince(selectedProvinceCode);
                setWards(data);
                setLoadingWards(false);
            } else {
                setWards([]);
            }
        };
        fetch();
    }, [selectedProvinceCode]);

    const handleProvinceChange = (value, option) => {
        setSelectedProvinceCode(option.code);
        setWards([]);
        form.setFieldsValue({ province: option.name, ward: undefined });
    };

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
                ward: values.ward,
                farmName: values.farmName,
                farmCode: values.farmCode,
                farmArea: values.farmArea,
                farmType: values.farmType,
                bio: values.bio,
                organization: values.organization,
                avatar: avatarUrl,
                certifications: values.certifications || localCerts,
                otp: values.otp
            };

            if (updateData.dateOfBirth && dayjs.isDayjs(updateData.dateOfBirth)) {
                updateData.dateOfBirth = updateData.dateOfBirth.toISOString();
            }

            return api.put('/users/profile', updateData);
        },
        onSuccess: (res) => {
            setUser(res.data.data);
            message.success('Cập nhật hồ sơ thành công!');
            setIsPhoneModalVisible(false);
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
            message.error({ content: 'Tải ảnh thất bại!', key: 'avatar' });
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
                <Col span={24} lg={8}>
                    <Card bordered={false} className="shadow-sm rounded-[24px] text-center p-4 h-full">
                        <div className="relative inline-block mb-4">
                            <Avatar
                                size={100}
                                src={getAvatarUrl(avatarUrl)}
                                icon={!avatarUrl && <UserOutlined />}
                                className="bg-green-50 text-green-600 border-4 border-white shadow-lg"
                            >
                                {!avatarUrl && getInitialAvatar(user?.fullname || user?.username)}
                            </Avatar>
                            <Upload
                                name="avatar"
                                showUploadList={false}
                                action={`${API_URL}/upload/avatar`}
                                headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
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
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><UserOutlined /></div>
                                <div className="flex-1 min-w-0">
                                    <Text type="secondary" className="text-[10px] uppercase font-bold block">Username</Text>
                                    <Text strong className="block truncate">@{user?.username}</Text>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><MailOutlined /></div>
                                <div className="flex-1 min-w-0">
                                    <Text type="secondary" className="text-[10px] uppercase font-bold block">Email</Text>
                                    <Text strong className="text-xs block truncate">{user?.email}</Text>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><PhoneOutlined /></div>
                                <div className="flex-1 min-w-0">
                                    <Text type="secondary" className="text-[10px] uppercase font-bold block">Điện thoại</Text>
                                    <Text strong className="block truncate">{user?.phone}</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col span={24} lg={16}>
                    <Card bordered={false} className="shadow-sm rounded-[24px] p-4">
                        <Title level={5} className="mb-6 flex items-center gap-2">
                            <EditOutlined className="text-green-500" /> Thay đổi thông tin
                        </Title>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={(values) => updateMutation.mutate(values)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item name="fullname" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                                    <Input className="h-11 rounded-lg" prefix={<UserOutlined className="text-gray-300" />} />
                                </Form.Item>
                                <Form.Item name="email" label="Địa chỉ Email">
                                    <Input disabled className="h-11 rounded-lg bg-gray-50" prefix={<MailOutlined className="text-gray-300" />} />
                                </Form.Item>
                                <Form.Item name="phone" label="Số điện thoại">
                                    <Space.Compact className="w-full">
                                        <Input disabled className="h-11 rounded-l-lg bg-gray-50" prefix={<PhoneOutlined className="text-gray-300" />} />
                                        <Button icon={<EditOutlined />} onClick={() => setIsPhoneModalVisible(true)} className="h-11 rounded-r-lg">Thay đổi</Button>
                                    </Space.Compact>
                                </Form.Item>
                                <Form.Item name="dateOfBirth" label="Ngày sinh">
                                    <DatePicker className="w-full h-11 rounded-lg" format="DD/MM/YYYY" />
                                </Form.Item>
                            </div>

                            <Form.Item name="bio" label="Giới thiệu ngắn">
                                <TextArea rows={3} className="rounded-lg" />
                            </Form.Item>

                            <Divider orientation="left" className="!text-gray-600 !text-sm font-bold mt-6"><EnvironmentOutlined className="mr-2" /> Địa chỉ</Divider>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item name="province" label="Tỉnh/Thành phố">
                                    <Select showSearch onChange={handleProvinceChange} className="h-11">
                                        {provinces.map(p => <Option key={p.code} value={p.name} code={p.code}>{p.name}</Option>)}
                                    </Select>
                                </Form.Item>
                                <Form.Item name="ward" label="Phường/Xã">
                                    <Select showSearch disabled={!selectedProvinceCode} onChange={handleWardChange} className="h-11">
                                        {wards.map(w => <Option key={w.code} value={w.name}>{w.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            </div>
                            <Form.Item name="address" label="Địa chỉ chi tiết">
                                <Input className="h-11 rounded-lg" prefix={<EnvironmentOutlined className="text-gray-300" />} />
                            </Form.Item>

                            <div className="flex justify-end mt-6">
                                <Button type="primary" onClick={() => form.submit()} loading={updateMutation.isLoading} className="h-11 px-8 rounded-xl bg-green-600 border-0 font-bold">
                                    Lưu thông tin hồ sơ
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>

            <CertificationModal 
                visible={isCertModalVisible}
                onCancel={() => setIsCertModalVisible(false)}
                initialValues={editingCert}
                loading={updateMutation.isLoading}
                onSave={(newCert) => {
                    const updatedCerts = editingCert ? [...localCerts] : [...localCerts, { ...newCert, status: 'Pending' }];
                    if (editingCert) updatedCerts[editingCert.index] = { ...newCert, status: 'Pending' };
                    setLocalCerts(updatedCerts);
                    setIsCertModalVisible(false);
                    updateMutation.mutate({ ...form.getFieldsValue(), certifications: updatedCerts });
                }}
            />

            <ChangePhoneModal 
                visible={isPhoneModalVisible}
                onCancel={() => setIsPhoneModalVisible(false)}
                loading={updateMutation.isLoading}
                onVerify={(values) => {
                    updateMutation.mutate({ ...form.getFieldsValue(), phone: values.phone, otp: values.otp });
                }}
            />
        </div>
    );
};

export default AccountInfo;
