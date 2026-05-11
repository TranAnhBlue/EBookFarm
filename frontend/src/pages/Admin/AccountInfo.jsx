import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Avatar, Space, message, Divider, Row, Col, Select, DatePicker, Upload, Tag, Spin, Alert, Empty, Modal, Tooltip } from 'antd';
import { UserOutlined, MailOutlined, HomeOutlined, SaveOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, CameraOutlined, IdcardOutlined, ShopOutlined, SafetyCertificateOutlined, LoadingOutlined, WarningOutlined, PlusOutlined, DeleteOutlined, ClockCircleOutlined, BankOutlined, CalendarOutlined, WomanOutlined, ManOutlined, AreaChartOutlined, BarcodeOutlined, FieldTimeOutlined } from '@ant-design/icons';
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
                        <Form.Item name="name" label="Tên chứng nhận" rules={[{ required: true, message: 'Vui lòng chọn loại chứng nhận!' }]}>
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
                            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="expiryDate" label="Ngày hết hạn">
                            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
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

    const canEditPhone = ['Admin', 'HTX'].includes(user?.role);

    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            try {
                const data = await getProvinces();
                setProvinces(data);
            } catch (err) {
                console.error('Failed to fetch provinces', err);
            }
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
            
            if (provinces.length > 0 && user.province) {
                const found = provinces.find(p => p.name === user.province);
                if (found) setSelectedProvinceCode(found.code);
            }
        }
    }, [user, provinces, form]);

    useEffect(() => {
        const fetch = async () => {
            if (selectedProvinceCode) {
                setLoadingWards(true);
                try {
                    const data = await getWardsByProvince(selectedProvinceCode);
                    setWards(data);
                } catch (err) {
                    console.error('Failed to fetch wards', err);
                }
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
        form.setFieldsValue({ province: value, ward: undefined });
    };

    const handleWardChange = (value) => {
        form.setFieldsValue({ ward: value });
    };

    const updateMutation = useMutation({
        mutationFn: (values) => {
            const updateData = {
                ...values,
                avatar: avatarUrl,
                certifications: localCerts
            };

            if (updateData.dateOfBirth && dayjs.isDayjs(updateData.dateOfBirth)) {
                updateData.dateOfBirth = updateData.dateOfBirth.toISOString();
            }

            if (updateData.certifications) {
                updateData.certifications = updateData.certifications.map(c => ({
                    ...c,
                    issueDate: c.issueDate && dayjs.isDayjs(c.issueDate) ? c.issueDate.toISOString() : c.issueDate,
                    expiryDate: c.expiryDate && dayjs.isDayjs(c.expiryDate) ? c.expiryDate.toISOString() : c.expiryDate
                }));
            }

            return api.put('/users/profile', updateData);
        },
        onSuccess: (res) => {
            const updatedUser = res.data.data;
            setUser(updatedUser);
            message.success('Cập nhật hồ sơ thành công!');
            queryClient.invalidateQueries(['users']);
        },
        onError: (err) => {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu hồ sơ!');
        }
    });

    const disabledDate = (current) => {
        return current && current > dayjs().endOf('day');
    };

    const validateAge = (_, value) => {
        if (!value) return Promise.resolve();
        const age = dayjs().diff(value, 'year');
        if (age < 18) {
            return Promise.reject(new Error('Bạn phải từ 18 tuổi trở lên'));
        }
        return Promise.resolve();
    };

    const handleAvatarChange = (info) => {
        if (info.file.status === 'done') {
            const url = info.file.response.data.avatar;
            setAvatarUrl(url);
            setUser({ ...user, avatar: url });
            message.success('Tải ảnh đại diện thành công!');
        } else if (info.file.status === 'error') {
            message.error('Tải ảnh thất bại!');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                    <Card bordered={false} className="shadow-sm rounded-[24px] text-center p-4 h-full sticky top-24">
                        <div className="relative inline-block mb-4">
                            <Avatar
                                size={120}
                                src={getAvatarUrl(avatarUrl)}
                                icon={!avatarUrl && <UserOutlined />}
                                className="bg-green-50 text-green-600 border-4 border-white shadow-xl"
                            >
                                {!avatarUrl && getInitialAvatar(user?.fullname || user?.username)}
                            </Avatar>
                            <Upload
                                name="avatar"
                                showUploadList={false}
                                action={`${API_URL}/upload/avatar`}
                                headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                                onChange={handleAvatarChange}
                                className="absolute bottom-1 right-1"
                            >
                                <Button shape="circle" size="small" icon={<CameraOutlined />} className="bg-green-500 text-white border-2 border-white shadow-lg" />
                            </Upload>
                        </div>
                        <Title level={4} className="!mb-0">{user?.fullname || user?.username}</Title>
                        <Text type="secondary" className="text-[10px] uppercase font-bold text-green-600 tracking-widest">
                            {user?.role === 'Admin' ? 'Quản trị viên' : 
                             user?.role === 'Farmer' ? 'Nông dân' : 
                             user?.role === 'HTX' ? 'Hợp tác xã' : 
                             user?.role === 'User' ? 'Người dùng' : user?.role}
                        </Text>
                        
                        {user?.organization && (
                            <div className="mt-3">
                                <Tag icon={<BankOutlined />} color="success" className="px-3 py-1 rounded-full border-0 shadow-sm text-[11px]">{user.organization}</Tag>
                            </div>
                        )}
                        
                        {user?.bio && <Text className="text-sm text-gray-400 block mt-4 px-4 italic leading-relaxed">"{user.bio}"</Text>}
                        
                        <Divider className="my-6" />
                        <div className="space-y-4 text-left px-4 text-sm">
                            {/* Thông tin định danh */}
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><UserOutlined /></div>
                                <div className="flex-1 min-w-0"><Text type="secondary" className="text-[9px] uppercase font-bold block opacity-60">Username</Text><Text strong className="text-sm">@{user?.username}</Text></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><MailOutlined /></div>
                                <div className="flex-1 min-w-0"><Text type="secondary" className="text-[9px] uppercase font-bold block opacity-60">Email</Text><Text strong className="text-sm truncate block">{user?.email}</Text></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><PhoneOutlined /></div>
                                <div className="flex-1 min-w-0"><Text type="secondary" className="text-[9px] uppercase font-bold block opacity-60">Điện thoại</Text><Text strong className="text-sm">{user?.phone || 'Chưa cập nhật'}</Text></div>
                            </div>

                            {/* Địa chỉ & Cá nhân */}
                            <Divider className="!my-2 border-gray-100" />
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><EnvironmentOutlined /></div>
                                <div className="flex-1 min-w-0"><Text type="secondary" className="text-[9px] uppercase font-bold block opacity-60">Địa chỉ</Text><Text strong className="text-sm block leading-tight">{user?.address ? `${user.address}, ` : ''}{user?.ward ? `${user.ward}, ` : ''}{user?.province || 'Chưa cập nhật'}</Text></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><CalendarOutlined /></div>
                                <div className="flex-1 min-w-0"><Text type="secondary" className="text-[9px] uppercase font-bold block opacity-60">Ngày sinh</Text><Text strong className="text-sm">{user?.dateOfBirth ? dayjs(user.dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}</Text></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">{user?.gender === 'Nam' ? <ManOutlined /> : <WomanOutlined />}</div>
                                <div className="flex-1 min-w-0"><Text type="secondary" className="text-[9px] uppercase font-bold block opacity-60">Giới tính</Text><Text strong className="text-sm">{user?.gender || 'Chưa cập nhật'}</Text></div>
                            </div>

                            {/* Thông tin nông trại (Cho Farmer/User) */}
                            {['Farmer', 'User'].includes(user?.role) && (user?.farmName || user?.farmCode || user?.farmArea) && (
                                <>
                                    <Divider className="!my-2 border-gray-100" />
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-400"><HomeOutlined /></div>
                                        <div className="flex-1 min-w-0"><Text type="secondary" className="text-[9px] uppercase font-bold block opacity-60">Nông trại</Text><Text strong className="text-sm block">{user.farmName || 'Tên chưa đặt'}</Text><Text className="text-[10px] text-gray-400">Mã: {user.farmCode || 'N/A'}</Text></div>
                                    </div>
                                    {user?.farmArea && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-400"><AreaChartOutlined /></div>
                                            <div className="flex-1 min-w-0"><Text type="secondary" className="text-[9px] uppercase font-bold block opacity-60">Diện tích</Text><Text strong className="text-sm">{user.farmArea} m²</Text></div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Card>
                </Col>

                <Col span={24} lg={16}>
                    <Card bordered={false} className="shadow-sm rounded-[24px] p-6">
                        <Title level={5} className="mb-6 flex items-center gap-2"><EditOutlined className="text-green-500" /> Thay đổi thông tin</Title>
                        <Form 
                            form={form} 
                            layout="vertical" 
                            onFinish={(v) => {
                                const allValues = form.getFieldsValue(true);
                                updateMutation.mutate(allValues);
                            }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="fullname" label="Họ và tên" rules={[{ required: true, message: 'Họ và tên là bắt buộc' }]}>
                                        <Input className="h-11 rounded-lg" prefix={<UserOutlined className="text-gray-300" />} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="email" label="Địa chỉ Email">
                                        <Input disabled className="h-11 rounded-lg bg-gray-50" prefix={<MailOutlined className="text-gray-300" />} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="phone" label="Số điện thoại">
                                        <Input 
                                            disabled={!canEditPhone} 
                                            className={`h-11 rounded-lg ${!canEditPhone ? 'bg-gray-50' : ''}`} 
                                            prefix={<PhoneOutlined className="text-gray-300" />} 
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item 
                                        name="dateOfBirth" 
                                        label="Ngày sinh" 
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn ngày sinh' },
                                            { validator: validateAge }
                                        ]}
                                    >
                                        <DatePicker 
                                            className="w-full h-11 rounded-lg" 
                                            format="DD/MM/YYYY" 
                                            placeholder="Chọn ngày"
                                            disabledDate={disabledDate}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="gender" label="Giới tính">
                                        <Select className="h-11" placeholder="Chọn giới tính">
                                            <Option value="Nam">Nam</Option>
                                            <Option value="Nữ">Nữ</Option>
                                            <Option value="Khác">Khác</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="organization" label="Tổ chức/Công ty">
                                        <Input className="h-11 rounded-lg" prefix={<ShopOutlined className="text-gray-300" />} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="bio" label="Giới thiệu ngắn">
                                        <TextArea rows={2} className="rounded-lg" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left" className="!text-gray-600 !text-sm font-bold mt-6"><EnvironmentOutlined className="mr-2" /> Địa chỉ</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="province" label="Tỉnh/Thành phố">
                                        <Select 
                                            showSearch 
                                            onChange={handleProvinceChange} 
                                            className="h-11"
                                            placeholder="Chọn tỉnh/thành phố"
                                        >
                                            {provinces.map(p => <Option key={p.code} value={p.name} code={p.code}>{p.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="ward" label="Phường/Xã">
                                        <Select 
                                            showSearch 
                                            disabled={!selectedProvinceCode} 
                                            onChange={handleWardChange} 
                                            className="h-11"
                                            placeholder="Chọn phường/xã"
                                        >
                                            {wards.map(w => <Option key={w.code} value={w.name}>{w.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="address" label="Địa chỉ chi tiết">
                                        <Input className="h-11 rounded-lg" prefix={<EnvironmentOutlined className="text-gray-300" />} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {['Farmer', 'User'].includes(user?.role) && (
                                <>
                                    <Divider orientation="left" className="!text-gray-600 !text-sm font-bold mt-8"><SafetyCertificateOutlined className="mr-2" /> Chứng nhận & Nông trại</Divider>
                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200 mb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <Text strong>Danh sách chứng chỉ</Text>
                                            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setEditingCert(null); setIsCertModalVisible(true); }} className="bg-green-600 border-0">Thêm mới</Button>
                                        </div>
                                        <div className="space-y-3">
                                            {localCerts.map((cert, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <SafetyCertificateOutlined className="text-green-600" />
                                                        <div>
                                                            <Text strong className="text-sm">{cert.name}</Text>
                                                            <Tag color={cert.status === 'Approved' ? 'success' : 'warning'} className="ml-2 text-[9px]">{cert.status}</Tag>
                                                        </div>
                                                    </div>
                                                    <Space>
                                                        <Button size="small" type="text" icon={<EditOutlined className="text-blue-500" />} onClick={() => { setEditingCert({ ...cert, index }); setIsCertModalVisible(true); }} />
                                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => { const n = [...localCerts]; n.splice(index, 1); setLocalCerts(n); }} />
                                                    </Space>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Row gutter={16}>
                                        <Col span={12}><Form.Item name="farmName" label="Tên nông trại"><Input className="h-11 rounded-lg" /></Form.Item></Col>
                                        <Col span={12}><Form.Item name="farmCode" label="Mã nông trại"><Input className="h-11 rounded-lg" /></Form.Item></Col>
                                        <Col span={12}><Form.Item name="farmArea" label="Diện tích (m²)"><Input type="number" className="h-11 rounded-lg" /></Form.Item></Col>
                                        <Col span={12}>
                                            <Form.Item name="farmType" label="Loại hình">
                                                <Select className="h-11">
                                                    <Option value="Trồng trọt">Trồng trọt</Option>
                                                    <Option value="Chăn nuôi">Chăn nuôi</Option>
                                                    <Option value="Thủy sản">Thủy sản</Option>
                                                    <Option value="Hỗn hợp">Hỗn hợp</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            <div className="flex justify-end mt-6">
                                <Button type="primary" htmlType="submit" loading={updateMutation.isLoading} className="h-11 px-8 rounded-xl bg-green-600 border-0 font-bold shadow-lg">
                                    Lưu hồ sơ
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
                }}
            />
        </div>
    );
};

export default AccountInfo;
