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
            
            if (provinces.length > 0 && user.province) {
                const found = provinces.find(p => p.name === user.province);
                if (found) setSelectedProvinceCode(found.code);
            }
        }
    }, [user, provinces]);

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
            // Log dữ liệu để debug
            console.log('🚀 Final form values for update:', values);
            
            const updateData = {
                ...values,
                avatar: avatarUrl,
                certifications: localCerts
            };

            // Chuyển đổi tất cả các đối tượng DayJS sang ISO string trước khi gửi
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
            
            // Cập nhật lại form với dữ liệu mới từ server
            form.setFieldsValue({
                ...updatedUser,
                dateOfBirth: updatedUser.dateOfBirth ? dayjs(updatedUser.dateOfBirth) : null
            });
        },
        onError: (err) => {
            console.error('❌ Update Mutation Error:', err);
            message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu hồ sơ!');
        }
    });

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
                                onChange={handleAvatarChange}
                                className="absolute bottom-0 right-0"
                            >
                                <Button shape="circle" size="small" icon={<CameraOutlined />} className="bg-green-500 text-white border-0 shadow-lg" />
                            </Upload>
                        </div>
                        <Title level={4} className="!mb-0">{user?.fullname || user?.username}</Title>
                        <Text type="secondary" className="text-xs uppercase font-bold text-green-600 tracking-widest">{user?.role}</Text>
                        
                        {user?.bio && <Text className="text-sm text-gray-500 block mt-3 px-4">{user.bio}</Text>}
                        
                        <Divider className="my-6" />
                        <div className="space-y-4 text-left px-2 text-sm">
                            <div className="flex items-center gap-3"><UserOutlined className="text-gray-400" /> <div className="flex-1 min-w-0"><Text type="secondary" className="text-[10px] uppercase font-bold block">Username</Text><Text strong>@{user?.username}</Text></div></div>
                            <div className="flex items-center gap-3"><MailOutlined className="text-gray-400" /> <div className="flex-1 min-w-0"><Text type="secondary" className="text-[10px] uppercase font-bold block">Email</Text><Text strong className="truncate block">{user?.email}</Text></div></div>
                            <div className="flex items-center gap-3"><PhoneOutlined className="text-gray-400" /> <div className="flex-1 min-w-0"><Text type="secondary" className="text-[10px] uppercase font-bold block">Điện thoại</Text><Text strong>{user?.phone}</Text></div></div>
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
                                // Sử dụng form.getFieldsValue(true) để lấy cả các trường disabled
                                const allValues = form.getFieldsValue(true);
                                updateMutation.mutate(allValues);
                            }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="fullname" label="Họ và tên" rules={[{ required: true }]}>
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
                                    <Form.Item name="dateOfBirth" label="Ngày sinh">
                                        <DatePicker className="w-full h-11 rounded-lg" format="DD/MM/YYYY" placeholder="Chọn ngày" />
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
                                        <Select showSearch onChange={handleProvinceChange} className="h-11">
                                            {provinces.map(p => <Option key={p.code} value={p.name} code={p.code}>{p.name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="ward" label="Phường/Xã">
                                        <Select showSearch disabled={!selectedProvinceCode} onChange={handleWardChange} className="h-11">
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
