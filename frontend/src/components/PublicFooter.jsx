import React from 'react';
import { Row, Col, Typography, Space, Divider } from 'antd';
import { GlobalOutlined, ThunderboltFilled, EnvironmentOutlined, PhoneOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-ebookfarm.jpg';

const { Title, Text, Paragraph } = Typography;

const PublicFooter = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-gray-900 text-white py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <Row gutter={[48, 48]}>
                    {/* Company Info */}
                    <Col xs={24} md={8} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm">
                                <img src={logo} alt="EBookFarm Logo" className="w-[140%] h-[140%] object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-green-400 font-extrabold text-[14px] leading-[1.1] uppercase tracking-tight">Nhật ký sản xuất</span>
                                <span className="text-green-400 font-bold text-[14px] leading-[1.1] uppercase tracking-tight">Điện tử</span>
                            </div>
                        </div>
                        <Paragraph className="text-gray-400 max-w-sm leading-relaxed">
                            Nền tảng truy xuất nguồn gốc chuẩn quốc gia. Minh bạch - Đồng bộ - Tin cậy - Phù hợp tiêu chuẩn Việt Nam & Quốc tế.
                        </Paragraph>
                        
                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors">
                                <SafetyCertificateOutlined className="text-lg" />
                                <Text className="text-gray-400">Giấy phép ĐKKD: 0123456789</Text>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors">
                                <SafetyCertificateOutlined className="text-lg" />
                                <Text className="text-gray-400">Ngày cấp: 01/01/2020</Text>
                            </div>
                        </div>
                    </Col>

                    {/* Office Locations */}
                    <Col xs={24} md={8} className="space-y-6">
                        <Text strong className="text-white block uppercase tracking-widest text-xs mb-4">Văn phòng</Text>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Text strong className="text-green-400 block text-sm">Trụ sở Hà Nội</Text>
                                <div className="flex items-start gap-2 text-gray-400">
                                    <EnvironmentOutlined className="text-base mt-1 shrink-0" />
                                    <Text className="text-gray-400 text-sm leading-relaxed">
                                        Tầng 12, Tòa nhà Diamond Flower, Số 48 Lê Văn Lương, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội
                                    </Text>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Text strong className="text-green-400 block text-sm">Trụ sở TP. Hồ Chí Minh</Text>
                                <div className="flex items-start gap-2 text-gray-400">
                                    <EnvironmentOutlined className="text-base mt-1 shrink-0" />
                                    <Text className="text-gray-400 text-sm leading-relaxed">
                                        Số 8 Đường số 20, Khu dân cư Him Lam, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Quick Links & Contact */}
                    <Col xs={24} md={8}>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-4">
                                <Text strong className="text-white block uppercase tracking-widest text-xs">Liên kết nhanh</Text>
                                <Space direction="vertical" className="text-gray-400">
                                    <Text className="hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigate('/reference/tcvn')}>
                                        Tra cứu TCVN
                                    </Text>
                                    <Text className="hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigate('/login')}>
                                        Đăng nhập
                                    </Text>
                                    <Text className="hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigate('/register')}>
                                        Đăng ký
                                    </Text>
                                    <Text className="hover:text-green-400 cursor-pointer transition-colors">
                                        Hướng dẫn sử dụng
                                    </Text>
                                </Space>
                            </div>

                            <div className="space-y-4">
                                <Text strong className="text-white block uppercase tracking-widest text-xs">Liên hệ</Text>
                                <Space direction="vertical" className="text-gray-400">
                                    <div className="flex items-center gap-2 hover:text-green-400 transition-colors">
                                        <PhoneOutlined />
                                        <Text className="text-gray-400">Hotline: 1900 xxxx</Text>
                                    </div>
                                    <div className="flex items-center gap-2 hover:text-green-400 transition-colors">
                                        <MailOutlined />
                                        <Text className="text-gray-400">contact@ebookfarm.vn</Text>
                                    </div>
                                </Space>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Divider className="my-12 border-gray-700" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <Text className="text-gray-400 text-xs block">
                            © 2026 EBookFarm. Tất cả quyền được bảo lưu.
                        </Text>
                        <Text className="text-gray-500 text-xs block">
                            Minh bạch - Đồng bộ - Tin cậy - Phù hợp tiêu chuẩn Việt Nam & Quốc tế
                        </Text>
                    </div>
                    <Space className="text-gray-400 text-xl" size="large">
                        <GlobalOutlined className="hover:text-green-400 cursor-pointer transition-colors" />
                        <ThunderboltFilled className="hover:text-green-400 cursor-pointer transition-colors" />
                    </Space>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
