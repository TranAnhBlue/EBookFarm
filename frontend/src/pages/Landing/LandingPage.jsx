import React from 'react';
import { Typography, Button, Row, Col, Card, Space, Tag, Divider } from 'antd';
import {
    ArrowRightOutlined,
    CheckCircleFilled,
    ThunderboltFilled,
    SafetyCertificateFilled,
    GlobalOutlined,
    SearchOutlined,
    EditOutlined,
    QrcodeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-ebookfarm.jpg';
import './LandingStyles.css';

const { Title, Text, Paragraph } = Typography;

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Header / Navbar */}
            <nav className="fixed top-0 w-full z-50 glass-card border-b border-gray-100 flex justify-center">
                <div className="w-full max-w-7xl px-6 md:px-12 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-80" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm border border-gray-50">
                            <img src={logo} alt="EBookFarm Logo" className="w-[140%] h-[140%] object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-green-600 font-bold text-[16px] leading-[1.2] uppercase tracking-wide">Nhật ký sản xuất</span>
                            <span className="text-green-600 font-bold text-[16px] leading-[1.2] uppercase tracking-wide">Điện tử</span>
                        </div>
                    </div>
                    <Space size="large" className="hidden md:flex">
                        <Button type="text" className="font-bold text-gray-600 hover:text-green-600">Giải pháp</Button>
                        <Button type="text" className="font-bold text-gray-600 hover:text-green-600" onClick={() => navigate('/reference/tcvn')}>Tra cứu TCVN</Button>
                        <Button type="text" className="font-bold text-gray-600 hover:text-green-600">Về chúng tôi</Button>
                    </Space>
                    <Space>
                        <Button type="text" className="font-bold text-green-600" onClick={() => navigate('/login')}>Đăng nhập</Button>
                        <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700 rounded-xl font-bold px-4 md:px-6 border-0 shadow-lg shadow-green-100" onClick={() => navigate('/register')}>Bắt đầu ngay</Button>
                    </Space>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 hero-mask bg-slate-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full z-0 opacity-20">
                    <img src="/images/hero.png" alt="Agriculture Background" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-400/20 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 blur-[120px] rounded-full"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} lg={14} className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-1.5 rounded-full mb-4">
                                <Tag color="green" className="m-0 rounded-full font-bold">New</Tag>
                                <Text className="text-green-700 font-bold text-xs uppercase tracking-wider">Hệ thống truy xuất chuẩn quốc gia TCVN</Text>
                            </div>
                            <Title className="!text-gray-900 !mb-6 leading-[1.1] md:!text-7xl font-black">
                                Minh bạch <span className="text-green-600">Nguồn gốc</span>,<br />
                                Nâng tầm <span className="text-green-600">Giá trị</span> Nông sản.
                            </Title>
                            <Paragraph className="text-gray-500 text-lg md:text-xl max-w-2xl leading-relaxed">
                                EBookFarm cung cấp giải pháp chuyển đổi số toàn diện cho nông trại, HTX và doanh nghiệp:
                                Từ Nhật ký sản xuất điện tử đến Truy xuất nguồn gốc bằng mã QR chuẩn quốc gia.
                            </Paragraph>
                            <Space size="middle" className="pt-4 flex-wrap">
                                <Button
                                    type="primary"
                                    size="large"
                                    className="bg-green-600 hover:bg-green-700 h-16 px-10 rounded-2xl font-black text-lg border-0 shadow-2xl shadow-green-200"
                                    onClick={() => navigate('/login')}
                                >
                                    Số hóa nông trại ngay <ArrowRightOutlined />
                                </Button>
                                <Button
                                    size="large"
                                    className="h-16 px-10 rounded-2xl font-bold text-lg border-2 border-gray-100 hover:border-green-500 hover:text-green-600 transition-all shadow-sm"
                                    onClick={() => navigate('/reference/tcvn')}
                                >
                                    Tra cứu tiêu chuẩn <SearchOutlined />
                                </Button>
                            </Space>
                            <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-12">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-gray-900">500+</span>
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Nông trại</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-gray-900">35+</span>
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Tiêu chuẩn TCVN</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-gray-900">100%</span>
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Minh bạch</span>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} lg={10} className="hidden lg:block relative">
                            <div className="floating">
                                <div className="glass-card rounded-[40px] p-4 shadow-2xl border-white relative z-10">
                                    <img src="/images/trace.png" alt="QR Traceability" className="w-full rounded-[32px] shadow-sm" />
                                    <div className="absolute -bottom-10 -right-10 glass-card p-6 rounded-3xl shadow-xl w-64 border-white animate-pulse">
                                        <div className="flex items-center gap-3 mb-3">
                                            <CheckCircleFilled className="text-green-500 text-xl" />
                                            <Text strong>Đã xác minh</Text>
                                        </div>
                                        <Text className="text-xs text-gray-500 block mb-1">Cà phê Arabica Cầu Đất</Text>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="w-[85%] h-full bg-green-500"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* TCVN Highlight Section */}
            <section className="bg-white py-24 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} md={12}>
                            <div className="relative">
                                <div className="absolute -inset-10 bg-blue-100/30 blur-[100px] rounded-full"></div>
                                <Card variant="borderless" className="shadow-2xl rounded-[40px] p-6 border-gray-50 glass-card relative z-10">
                                    <div className="space-y-6">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white/80 transition-all border border-transparent hover:border-blue-50">
                                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                    <SafetyCertificateFilled className="text-white text-xl" />
                                                </div>
                                                <div className="flex-1">
                                                    <Text className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Standard {i}</Text>
                                                    <Text strong className="text-gray-800 text-base line-clamp-1">
                                                        {i === 1 ? 'TCVN 12827:2023 - Rau quả tươi' : i === 2 ? 'TCVN 13166-4:2020 - Thịt lợn' : 'TCVN 13840:2023 - Cà phê'}
                                                    </Text>
                                                </div>
                                                <ArrowRightOutlined className="text-gray-300" />
                                            </div>
                                        ))}
                                        <Button
                                            block
                                            size="large"
                                            className="h-14 rounded-xl border-blue-100 text-blue-600 font-bold hover:bg-blue-50 transition-all"
                                            onClick={() => navigate('/reference/tcvn')}
                                        >
                                            Tra cứu toàn bộ 35 tiêu chuẩn <ArrowRightOutlined />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </Col>
                        <Col xs={24} md={12} className="space-y-6">
                            <Tag color="blue" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1">Compliance</Tag>
                            <Title className="!text-gray-900 !mb-6 leading-tight md:!text-5xl">Gốc gác rõ ràng,<br />Niềm tin vững chắc.</Title>
                            <Paragraph className="text-gray-500 text-lg leading-relaxed">
                                Hệ thống của chúng tôi được xây dựng dựa trên danh mục đầy đủ các tiêu chuẩn quốc gia về truy xuất nguồn gốc (TCVN).
                                Giúp sản phẩm của bạn dễ dàng vượt qua các rào cản kỹ thuật và tiến xa ra thị trường quốc tế.
                            </Paragraph>
                            <Divider className="my-10" />
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Text className="text-blue-600 font-black text-4xl block">100%</Text>
                                    <Text className="text-gray-600 font-medium">Phù hợp quy định nhà nước</Text>
                                </div>
                                <div className="space-y-2">
                                    <Text className="text-blue-600 font-black text-4xl block">24/7</Text>
                                    <Text className="text-gray-600 font-medium">Tra cứu & Kiểm soát</Text>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Feature Cards Section */}
            <section className="bg-slate-50 py-24 md:py-32 px-6">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black">Giải pháp số hóa toàn diện</Title>
                        <Paragraph className="text-gray-500 text-lg">Hành trình nông sản tử nông trại tới bàn ăn chưa bao giờ dễ dàng và minh bạch đến thế.</Paragraph>
                    </div>

                    <Row gutter={[32, 32]}>
                        {[
                            {
                                title: 'Nhật ký sản xuất điện tử',
                                desc: 'Thay thế ghi chép tay bằng ứng dụng di động thông minh. Lưu trữ lịch sử chăm sóc, bón phân, tưới tiêu theo thời gian thực.',
                                icon: <EditOutlined />,
                                color: '#10b981'
                            },
                            {
                                title: 'Hệ thống Truy xuất QR',
                                desc: 'Tạo mã QR định danh cho từng lô sản phẩm. Người dùng chỉ cần quét để thấy toàn bộ hành trình nông sản.',
                                icon: <QrcodeOutlined />,
                                color: '#059669'
                            },
                            {
                                title: 'Quản trị Chuỗi giá trị',
                                desc: 'Kết nối Nhà cung cấp - Nông trại - HTX - Nhà bán lẻ. Kiểm soát chất lượng đồng bộ trên toàn chuỗi.',
                                icon: <ThunderboltFilled />,
                                color: '#3b82f6'
                            }
                        ].map((item, idx) => (
                            <Col xs={24} md={8} key={idx}>
                                <Card variant="borderless" className="h-full rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden card-hover-up border-gray-100 group">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transform group-hover:rotate-12 transition-transform shadow-xl"
                                        style={{ background: `${item.color}15`, color: item.color }}
                                    >
                                        <span className="text-3xl">{item.icon}</span>
                                    </div>
                                    <Title level={3} className="!mb-4 !text-gray-900">{item.title}</Title>
                                    <Paragraph className="text-gray-500 leading-relaxed text-base">{item.desc}</Paragraph>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Bottom CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-[40px] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-gray-900 rounded-[40px] p-12 md:p-24 overflow-hidden flex flex-col items-center text-center space-y-12">
                        <div className="absolute top-0 right-0 w-full h-full opacity-30 z-0">
                            <img src="/images/supply.png" alt="Supply Chain" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative z-10 max-w-4xl space-y-6">
                            <Title className="!text-white !mb-0 md:!text-6xl font-black">Sẵn sàng để đưa nông trại của bạn lên tầm cao mới?</Title>
                            <Paragraph className="text-gray-400 text-xl leading-relaxed">
                                Hãy tham gia cùng hàng ngàn nông hộ và HTX đã số hóa quy trình sản xuất cùng EBookFarm.
                            </Paragraph>
                        </div>
                        <div className="relative z-10 flex flex-wrap justify-center gap-6">
                            <Button
                                type="primary"
                                size="large"
                                className="bg-green-600 hover:bg-green-700 h-16 px-12 rounded-2xl font-black text-xl border-0 shadow-2xl shadow-green-200/50"
                                onClick={() => navigate('/login')}
                            >
                                Bắt đầu miễn phí <ArrowRightOutlined />
                            </Button>
                            <Button
                                size="large"
                                className="h-16 px-12 rounded-2xl font-bold text-xl border-2 border-white/20 text-white hover:border-white hover:text-white bg-white/5 backdrop-blur-md transition-all"
                            >
                                Liên hệ tư vấn
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
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
                                        <Text className="hover:text-green-600 cursor-pointer">Cơ hội nghệ nghiệp</Text>
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
        </div>
    );
};

export default LandingPage;
