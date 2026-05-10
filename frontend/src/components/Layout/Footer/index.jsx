import React from 'react';
import { Row, Col, Typography, Space, Divider } from 'antd';
import { GlobalOutlined, ThunderboltFilled, EnvironmentOutlined, PhoneOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authSession from 'src/services/core/authSession';
import logo from 'src/assets/images/logo/logo-ebookfarm.jpg';

const { Title, Text, Paragraph } = Typography;

const PublicFooter = () => {
    const navigate = useNavigate();
    const user = authSession.getUser();
  const logout = () => { authSession.clearSession(); window.location.href = '/login'; };;
    const isLoggedIn = !!user;

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
                                <span className="text-green-400 font-extrabold text-[14px] leading-[1.1] uppercase tracking-tight">Nháº­t kÃ½ sáº£n xuáº¥t</span>
                                <span className="text-green-400 font-bold text-[14px] leading-[1.1] uppercase tracking-tight">Äiá»‡n tá»­</span>
                            </div>
                        </div>
                        <Paragraph className="text-gray-400 max-w-sm leading-relaxed">
                            Ná»n táº£ng truy xuáº¥t nguá»“n gá»‘c chuáº©n quá»‘c gia. Minh báº¡ch - Äá»“ng bá»™ - Tin cáº­y - PhÃ¹ há»£p tiÃªu chuáº©n Viá»‡t Nam & Quá»‘c táº¿.
                        </Paragraph>
                        
                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors">
                                <SafetyCertificateOutlined className="text-lg" />
                                <Text className="text-gray-400">Giáº¥y phÃ©p ÄKKD: 0123456789</Text>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors">
                                <SafetyCertificateOutlined className="text-lg" />
                                <Text className="text-gray-400">NgÃ y cáº¥p: 01/01/2020</Text>
                            </div>
                        </div>
                    </Col>

                    {/* Office Locations */}
                    <Col xs={24} md={8} className="space-y-6">
                        <Text strong className="text-white block uppercase tracking-widest text-xs mb-4">VÄƒn phÃ²ng</Text>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Text strong className="text-green-400 block text-sm">Äá»‹a chá»‰ Ä‘Äƒng kÃ½</Text>
                                <div className="flex items-start gap-2 text-gray-400">
                                    <EnvironmentOutlined className="text-base mt-1 shrink-0" />
                                    <Text className="text-gray-200 text-sm leading-relaxed">
                                        CÄƒn sá»‘ 13 tá»• 49 trÆ°á»ng NT Nguyá»…n Viáº¿t XuÃ¢n, phÆ°á»ng YÃªn HÃ²a, quáº­n Cáº§u Giáº¥y, TP HÃ  Ná»™i
                                    </Text>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Text strong className="text-green-400 block text-sm">VÄƒn phÃ²ng giao dá»‹ch</Text>
                                <div className="flex items-start gap-2 text-gray-400">
                                    <EnvironmentOutlined className="text-base mt-1 shrink-0" />
                                    <Text className="text-gray-200 text-sm leading-relaxed">
                                        Sá»‘ 19 phá»‘ Liá»…u Giai, phÆ°á»ng Liá»…u Giai, quáº­n Ba ÄÃ¬nh, thÃ nh phá»‘ HÃ  Ná»™i
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Quick Links & Contact */}
                    <Col xs={24} md={8}>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-4">
                                <Text strong className="text-white block uppercase tracking-widest text-xs">LiÃªn káº¿t nhanh</Text>
                                <Space direction="vertical" className="text-gray-200">
                                    <Text className="text-gray-200 hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigate('/reference/tcvn')}>
                                        Tra cá»©u TCVN
                                    </Text>
                                    {isLoggedIn ? (
                                        <Text className="text-gray-200 hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>
                                            VÃ o báº£ng Ä‘iá»u khiá»ƒn
                                        </Text>
                                    ) : (
                                        <Text className="text-gray-200 hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigate('/login')}>
                                            ÄÄƒng nháº­p
                                        </Text>
                                    )}
                                    {isLoggedIn ? (
                                        <Text className="text-red-400 hover:text-red-300 cursor-pointer transition-colors" onClick={() => { logout(); navigate('/'); }}>
                                            ÄÄƒng xuáº¥t
                                        </Text>
                                    ) : (
                                        <Text className="text-gray-200 hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigate('/register')}>
                                            ÄÄƒng kÃ½
                                        </Text>
                                    )}
                                    <Text className="text-gray-200 hover:text-green-400 cursor-pointer transition-colors">
                                        HÆ°á»›ng dáº«n sá»­ dá»¥ng
                                    </Text>
                                </Space>
                            </div>

                            <div className="space-y-4">
                                <Text strong className="text-white block uppercase tracking-widest text-xs">LiÃªn há»‡</Text>
                                <Space direction="vertical" className="text-gray-200">
                                    <div className="flex items-center gap-2 text-gray-200 hover:text-green-400 transition-colors">
                                        <PhoneOutlined />
                                        <Text className="text-gray-200">Hotline: 02462730.818</Text>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-200 hover:text-green-400 transition-colors">
                                        <MailOutlined />
                                        <Text className="text-gray-200">tuvansct@gmail.com</Text>
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
                            Â© 2026 EBookFarm. Táº¥t cáº£ quyá»n Ä‘Æ°á»£c báº£o lÆ°u.
                        </Text>
                        <Text className="text-gray-500 text-xs block">
                            Minh báº¡ch - Äá»“ng bá»™ - Tin cáº­y - PhÃ¹ há»£p tiÃªu chuáº©n Viá»‡t Nam & Quá»‘c táº¿
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

