import React from 'react';
import { Row, Col, Typography, Space, Divider } from 'antd';
import { GlobalOutlined, ThunderboltFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-ebookfarm.jpg';

const { Title, Text, Paragraph } = Typography;

const PublicFooter = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-white border-t border-gray-100 py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <Row gutter={[48, 48]}>
                    <Col xs={24} md={10} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm">
                                <img src={logo} alt="EBookFarm Logo" className="w-[140%] h-[140%] object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-green-600 font-extrabold text-[14px] leading-[1.1] uppercase tracking-tight">Nhật ký sản xuất</span>
                                <span className="text-green-600 font-bold text-[14px] leading-[1.1] uppercase tracking-tight">Điện tử</span>
                            </div>
                        </div>
                        <Paragraph className="text-gray-500 max-w-sm">
                            Giải pháp quản lý sản xuất và truy xuất nguồn gốc nông sản hàng đầu Việt Nam. Đồng hành cùng nông dân xây dựng tương lai bền vững.
                        </Paragraph>
                    </Col>
                    <Col xs={24} md={14}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-sm">
                            <div className="space-y-4">
                                <Text strong className="text-gray-900 block uppercase tracking-widest text-[11px]">Về chúng tôi</Text>
                                <Space direction="vertical" className="text-gray-500">
                                    <Text className="hover:text-green-600 cursor-pointer">Sứ mệnh</Text>
                                    <Text className="hover:text-green-600 cursor-pointer">Đội ngũ</Text>
                                    <Text className="hover:text-green-600 cursor-pointer">Cơ hội nghề nghiệp</Text>
                                </Space>
                            </div>
                            <div className="space-y-4">
                                <Text strong className="text-gray-900 block uppercase tracking-widest text-[11px]">Hỗ trợ</Text>
                                <Space direction="vertical" className="text-gray-500">
                                    <Text className="hover:text-green-600 cursor-pointer">Hướng dẫn sử dụng</Text>
                                    <Text className="hover:text-green-600 cursor-pointer">Câu hỏi thường gặp</Text>
                                    <Text className="hover:text-green-600 cursor-pointer">Điều khoản dịch vụ</Text>
                                </Space>
                            </div>
                            <div className="space-y-4">
                                <Text strong className="text-gray-900 block uppercase tracking-widest text-[11px]">Liên hệ</Text>
                                <Space direction="vertical" className="text-gray-500">
                                    <Text className="hover:text-green-600 cursor-pointer">Email: contact@ebookfarm.com</Text>
                                    <Text className="hover:text-green-600 cursor-pointer">Hotline: 1900 6688</Text>
                                </Space>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Divider className="my-12" />
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <Text className="text-gray-400 text-xs">© 2026 EBookFarm. Tất cả quyền được bảo lưu.</Text>
                    <Space className="text-gray-400 text-xl" size="large">
                        <GlobalOutlined className="hover:text-green-600 cursor-pointer" />
                        <ThunderboltFilled className="hover:text-green-600 cursor-pointer" />
                    </Space>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
