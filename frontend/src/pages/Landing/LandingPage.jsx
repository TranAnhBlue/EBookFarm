import React, { useState } from 'react';
import { Typography, Button, Row, Col, Card, Space, Tag, Divider, Form, Input, message, Steps } from 'antd';
import {
    ArrowRightOutlined,
    CheckCircleFilled,
    ThunderboltFilled,
    SafetyCertificateFilled,
    GlobalOutlined,
    SearchOutlined,
    EditOutlined,
    QrcodeOutlined,
    TrophyOutlined,
    RocketOutlined,
    TeamOutlined,
    DollarOutlined,
    SafetyOutlined,
    LineChartOutlined,
    BlockOutlined,
    CloudServerOutlined,
    PhoneOutlined,
    MailOutlined,
    UserOutlined,
    ShopOutlined,
    CheckOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';
import AIChatWidget from '../../components/AIChatWidget';
import './LandingStyles.css';
import './LandingAnimations.css';

const { Title, Text, Paragraph } = Typography;

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleConsultationSubmit = async (values) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/consultations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                message.success(data.message || 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong 24h.');
                form.resetFields();
            } else {
                message.error(data.message || 'Có lỗi xảy ra, vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Consultation submit error:', error);
            message.error('Không thể kết nối đến server. Vui lòng thử lại sau!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            <PublicNavbar />

            {/* AI Chat Widget */}
            <AIChatWidget />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 hero-mask bg-slate-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full z-0 opacity-20">
                    <img src="/images/hero.png" alt="Agriculture Background" className="w-full h-full object-cover parallax-slow" />
                </div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-400/20 blur-[120px] rounded-full blob-animate"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 blur-[120px] rounded-full blob-animate" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} lg={14} className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-1.5 rounded-full mb-4 scroll-reveal pulse-badge">
                                <Tag color="green" className="m-0 rounded-full font-bold">New</Tag>
                                <Text className="text-green-700 font-bold text-xs uppercase tracking-wider">Hệ thống truy xuất chuẩn quốc gia TCVN</Text>
                            </div>
                            <Title className="!text-gray-900 !mb-6 leading-[1.1] md:!text-7xl font-black scroll-reveal">
                                Minh bạch <span className="gradient-text">Nguồn gốc</span>,<br />
                                Nâng tầm <span className="gradient-text">Giá trị</span> Nông sản.
                            </Title>
                            <Paragraph className="text-gray-500 text-lg md:text-xl max-w-2xl leading-relaxed scroll-reveal">
                                EBookFarm cung cấp giải pháp chuyển đổi số toàn diện cho nông trại, HTX và doanh nghiệp:
                                Từ Nhật ký sản xuất điện tử đến Truy xuất nguồn gốc bằng mã QR chuẩn quốc gia.
                            </Paragraph>
                            <Space size="middle" className="pt-4 flex-wrap scroll-reveal">
                                <Button
                                    type="primary"
                                    size="large"
                                    className="bg-green-600 hover:bg-green-700 h-16 px-10 rounded-2xl font-black text-lg border-0 shadow-2xl shadow-green-200 shine-effect hover-lift"
                                    onClick={handleGetStarted}
                                >
                                    Số hóa nông trại ngay <ArrowRightOutlined />
                                </Button>
                                <Button
                                    size="large"
                                    className="h-16 px-10 rounded-2xl font-bold text-lg border-2 border-gray-100 hover:border-green-500 hover:text-green-600 transition-all shadow-sm hover-lift"
                                    onClick={() => navigate('/reference/tcvn')}
                                >
                                    Tra cứu tiêu chuẩn <SearchOutlined />
                                </Button>
                            </Space>
                            <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-12 scroll-reveal">
                                <div className="flex flex-col count-up">
                                    <span className="text-3xl font-black text-gray-900">500+</span>
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Nông trại</span>
                                </div>
                                <div className="flex flex-col count-up" style={{ animationDelay: '0.2s' }}>
                                    <span className="text-3xl font-black text-gray-900">35+</span>
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Tiêu chuẩn TCVN</span>
                                </div>
                                <div className="flex flex-col count-up" style={{ animationDelay: '0.4s' }}>
                                    <span className="text-3xl font-black text-gray-900">100%</span>
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Minh bạch</span>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} lg={10} className="hidden lg:block relative">
                            <div className="floating-element">
                                <div className="glass-card rounded-[40px] p-4 shadow-2xl border-white relative z-10 hover-lift">
                                    <img src="/images/trace.png" alt="QR Traceability" className="w-full rounded-[32px] shadow-sm" />
                                    <div className="absolute -bottom-10 -right-10 glass-card p-6 rounded-3xl shadow-xl w-64 border-white bounce-in">
                                        <div className="flex items-center gap-3 mb-3">
                                            <CheckCircleFilled className="text-green-500 text-xl" />
                                            <Text strong>Đã xác minh</Text>
                                        </div>
                                        <Text className="text-xs text-gray-500 block mb-1">Rau Cải Ngọt</Text>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 progress-animate" style={{ width: '85%' }}></div>
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
                            <div className="relative scroll-reveal">
                                <div className="absolute -inset-10 bg-blue-100/30 blur-[100px] rounded-full blob-animate"></div>
                                <Card variant="borderless" className="shadow-2xl rounded-[40px] p-6 border-gray-50 glass-card relative z-10 hover-lift">
                                    <div className="space-y-6">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white/80 transition-all border border-transparent hover:border-blue-50 hover-lift">
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
                                            className="h-14 rounded-xl border-blue-100 text-blue-600 font-bold hover:bg-blue-50 transition-all shine-effect"
                                            onClick={() => navigate('/reference/tcvn')}
                                        >
                                            Tra cứu toàn bộ 35 tiêu chuẩn <ArrowRightOutlined />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </Col>
                        <Col xs={24} md={12} className="space-y-6 scroll-reveal">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <SafetyCertificateFilled className="text-2xl text-blue-600" />
                                </div>
                                <Tag color="blue" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Compliance</Tag>
                            </div>
                            <Title className="!text-gray-900 !mb-6 leading-tight md:!text-5xl gradient-text">Gốc gác rõ ràng,<br />Niềm tin vững chắc.</Title>
                            <Paragraph className="text-gray-500 text-lg leading-relaxed">
                                Hệ thống của chúng tôi được xây dựng dựa trên danh mục đầy đủ các tiêu chuẩn quốc gia về truy xuất nguồn gốc (TCVN).
                                Giúp sản phẩm của bạn dễ dàng vượt qua các rào cản kỹ thuật và tiến xa ra thị trường quốc tế.
                            </Paragraph>
                            <Divider className="my-10" />
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2 count-up">
                                    <Text className="text-blue-600 font-black text-4xl block">100%</Text>
                                    <Text className="text-gray-600 font-medium">Phù hợp quy định nhà nước</Text>
                                </div>
                                <div className="space-y-2 count-up" style={{ animationDelay: '0.2s' }}>
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
                    <div className="text-center max-w-3xl mx-auto space-y-4 scroll-reveal">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <RocketOutlined className="text-2xl text-green-600" />
                            </div>
                            <Tag color="green" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Giải pháp</Tag>
                        </div>
                        <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black">Giải pháp số hóa toàn diện</Title>
                        <Paragraph className="text-gray-500 text-lg">Hành trình nông sản từ nông trại tới bàn ăn chưa bao giờ dễ dàng và minh bạch đến thế.</Paragraph>
                    </div>

                    <Row gutter={[32, 32]}>
                        {[
                            {
                                title: 'Nhật ký sản xuất điện tử',
                                desc: 'Thay thế ghi chép tay bằng ứng dụng di động thông minh. Lưu trữ lịch sử chăm sóc, bón phân, tưới tiêu theo thời gian thực.',
                                icon: <EditOutlined />,
                                color: '#10b981',
                                bgImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            },
                            {
                                title: 'Hệ thống Truy xuất QR',
                                desc: 'Tạo mã QR định danh cho từng lô sản phẩm. Người dùng chỉ cần quét để thấy toàn bộ hành trình nông sản.',
                                icon: <QrcodeOutlined />,
                                color: '#059669',
                                bgImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            },
                            {
                                title: 'Quản trị Chuỗi giá trị',
                                desc: 'Kết nối Nhà cung cấp - Nông trại - HTX - Nhà bán lẻ. Kiểm soát chất lượng đồng bộ trên toàn chuỗi.',
                                icon: <ThunderboltFilled />,
                                color: '#3b82f6',
                                bgImage: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            }
                        ].map((item, idx) => (
                            <Col xs={24} md={8} key={idx}>
                                <Card variant="borderless" className="h-full rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border-gray-100 group hover-lift scroll-reveal">
                                    {/* Decorative background gradient */}
                                    <div 
                                        className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl"
                                        style={{ background: item.bgImage }}
                                    ></div>
                                    
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transform group-hover:rotate-12 transition-transform shadow-xl rotate-hover relative z-10"
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

            {/* Benefits Section */}
            <section className="bg-white py-24 md:py-32 px-6 relative overflow-hidden">
                {/* Background decorative image */}
                <div className="absolute top-1/2 left-0 w-1/3 h-96 opacity-5 -translate-y-1/2">
                    <img src="/images/supply.png" alt="" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-1/2 right-0 w-1/3 h-96 opacity-5 -translate-y-1/2">
                    <img src="/images/trace.png" alt="" className="w-full h-full object-contain" />
                </div>

                <div className="max-w-7xl mx-auto space-y-16 relative z-10">
                    <div className="text-center max-w-3xl mx-auto space-y-4 scroll-reveal">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <TrophyOutlined className="text-2xl text-green-600" />
                            </div>
                            <Tag color="green" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Lợi ích</Tag>
                        </div>
                        <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black gradient-text">Giá trị mà doanh nghiệp nhận được</Title>
                        <Paragraph className="text-gray-500 text-lg">Khi triển khai hệ thống truy xuất nguồn gốc với EBookFarm</Paragraph>
                    </div>

                    <Row gutter={[32, 32]}>
                        {[
                            {
                                icon: <TrophyOutlined />,
                                title: 'Tạo ưu thế cạnh tranh',
                                desc: 'Áp dụng truy xuất nguồn gốc giúp tăng cơ hội đàm phán và bán được giá tốt hơn.',
                                color: '#f59e0b'
                            },
                            {
                                icon: <LineChartOutlined />,
                                title: 'Tối ưu quy trình sản xuất',
                                desc: 'Quản lý hiệu quả vùng sản xuất, kiểm soát rủi ro, tối ưu nhân sự và chi phí.',
                                color: '#3b82f6'
                            },
                            {
                                icon: <SafetyOutlined />,
                                title: 'Nâng cao uy tín thương hiệu',
                                desc: 'Minh bạch thông tin làm tăng niềm tin người tiêu dùng, bảo vệ thương hiệu.',
                                color: '#10b981'
                            },
                            {
                                icon: <GlobalOutlined />,
                                title: 'Mở rộng thị trường xuất khẩu',
                                desc: 'Đáp ứng tiêu chuẩn quốc tế, dễ dàng tiếp cận thị trường nước ngoài.',
                                color: '#8b5cf6'
                            },
                            {
                                icon: <TeamOutlined />,
                                title: 'Minh bạch chuỗi cung ứng',
                                desc: 'Hỗ trợ minh bạch toàn bộ hoạt động để chứng minh năng lực doanh nghiệp.',
                                color: '#ec4899'
                            },
                            {
                                icon: <DollarOutlined />,
                                title: 'Tăng doanh thu bền vững',
                                desc: 'Quảng bá thông tin sản phẩm, tăng độ nhận diện và doanh số bán hàng.',
                                color: '#06b6d4'
                            }
                        ].map((item, idx) => (
                            <Col xs={24} sm={12} lg={8} key={idx}>
                                <div className="flex gap-4 p-6 rounded-2xl hover:bg-gray-50 transition-all scroll-reveal hover-lift" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div 
                                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg pulse-glow rotate-hover"
                                        style={{ background: `${item.color}15`, color: item.color }}
                                    >
                                        <span className="text-2xl">{item.icon}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Title level={4} className="!mb-0 !text-gray-900">{item.title}</Title>
                                        <Text className="text-gray-500 text-sm leading-relaxed">{item.desc}</Text>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Technology & Standards Section */}
            <section className="bg-gradient-to-br from-blue-50 to-green-50 py-24 md:py-32 px-6 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200/30 blur-[100px] rounded-full blob-animate"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-200/30 blur-[100px] rounded-full blob-animate" style={{ animationDelay: '3s' }}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 scroll-reveal">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <BlockOutlined className="text-2xl text-blue-600" />
                            </div>
                            <Tag color="blue" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Công nghệ</Tag>
                        </div>
                        <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black gradient-text">Công nghệ & Tiêu chuẩn</Title>
                        <Paragraph className="text-gray-500 text-lg">Đảm bảo tuân thủ các tiêu chuẩn quốc gia và quốc tế</Paragraph>
                    </div>

                    <Row gutter={[32, 32]} align="middle">
                        <Col xs={24} md={12}>
                            <div className="space-y-6 scroll-reveal">
                                {[
                                    {
                                        icon: <BlockOutlined />,
                                        title: 'Công nghệ Blockchain',
                                        desc: 'Sử dụng thuật toán blockchain đảm bảo minh bạch tuyệt đối, dữ liệu không thể thay đổi.'
                                    },
                                    {
                                        icon: <SafetyCertificateFilled />,
                                        title: 'Tiêu chuẩn TCVN Quốc gia',
                                        desc: 'Hệ thống được xây dựng theo 35+ tiêu chuẩn TCVN về truy xuất nguồn gốc.'
                                    },
                                    {
                                        icon: <GlobalOutlined />,
                                        title: 'Chuẩn GS1 toàn cầu',
                                        desc: 'Tương thích với chuẩn GS1, dễ dàng tích hợp với hệ thống quốc tế.'
                                    },
                                    {
                                        icon: <CloudServerOutlined />,
                                        title: 'Tích hợp Cổng TXNG Quốc gia',
                                        desc: 'Đồng bộ dữ liệu với Cổng Truy xuất nguồn gốc Quốc gia của Bộ Khoa học.'
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover-lift" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 pulse-glow">
                                            <span className="text-xl">{item.icon}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <Title level={5} className="!mb-0 !text-gray-900">{item.title}</Title>
                                            <Text className="text-gray-500 text-sm">{item.desc}</Text>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card className="rounded-3xl shadow-2xl border-0 overflow-hidden scroll-reveal hover-lift">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">Chứng nhận & Tiêu chuẩn</Text>
                                        <CheckCircleFilled className="text-green-500 text-2xl" />
                                    </div>
                                    <div className="space-y-4">
                                        {['VietGAP', 'GlobalGAP', 'HACCP', 'ISO 22000', 'Organic', 'TCVN 12827:2023'].map((cert, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover-lift" style={{ animationDelay: `${idx * 0.05}s` }}>
                                                <Text strong className="text-gray-900">{cert}</Text>
                                                <Tag color="green" className="rounded-full">Hỗ trợ</Tag>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Implementation Process Section */}
            <section className="bg-white py-24 md:py-32 px-6 relative overflow-hidden">
                {/* Background decorative circles */}
                <div className="absolute top-20 right-10 w-96 h-96 border-4 border-green-100 rounded-full opacity-30"></div>
                <div className="absolute bottom-20 left-10 w-80 h-80 border-4 border-blue-100 rounded-full opacity-30"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-gray-100 rounded-full opacity-20"></div>

                <div className="max-w-5xl mx-auto space-y-16 relative z-10">
                    <div className="text-center space-y-4 scroll-reveal">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <CheckCircleFilled className="text-2xl text-green-600" />
                            </div>
                            <Tag color="green" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Quy trình</Tag>
                        </div>
                        <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black gradient-text">Triển khai chỉ trong 3 bước</Title>
                        <Paragraph className="text-gray-500 text-lg">Đơn giản, nhanh chóng và được hỗ trợ toàn diện</Paragraph>
                    </div>

                    <Steps
                        direction="vertical"
                        current={-1}
                        className="scroll-reveal"
                        items={[
                            {
                                title: <Text strong className="text-xl">Đăng ký & Tư vấn</Text>,
                                description: (
                                    <div className="mt-4 space-y-2">
                                        <Paragraph className="text-gray-500">
                                            Liên hệ với EBookFarm qua form đăng ký hoặc hotline. Đội ngũ chuyên gia sẽ tư vấn giải pháp phù hợp với quy mô và nhu cầu của bạn.
                                        </Paragraph>
                                        <div className="flex flex-wrap gap-2">
                                            <Tag color="blue">Tư vấn miễn phí</Tag>
                                            <Tag color="blue">Khảo sát nhu cầu</Tag>
                                            <Tag color="blue">Báo giá chi tiết</Tag>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                title: <Text strong className="text-xl">Triển khai & Đào tạo</Text>,
                                description: (
                                    <div className="mt-4 space-y-2">
                                        <Paragraph className="text-gray-500">
                                            Cài đặt hệ thống, tạo tài khoản và đào tạo sử dụng cho đội ngũ. Hỗ trợ nhập liệu ban đầu và tùy chỉnh theo quy trình riêng.
                                        </Paragraph>
                                        <div className="flex flex-wrap gap-2">
                                            <Tag color="green">Đào tạo trực tiếp</Tag>
                                            <Tag color="green">Tài liệu hướng dẫn</Tag>
                                            <Tag color="green">Hỗ trợ 24/7</Tag>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                title: <Text strong className="text-xl">Vận hành & Tối ưu</Text>,
                                description: (
                                    <div className="mt-4 space-y-2">
                                        <Paragraph className="text-gray-500">
                                            Bắt đầu sử dụng hệ thống, ghi nhật ký sản xuất và tạo mã QR truy xuất. Đội ngũ kỹ thuật luôn sẵn sàng hỗ trợ và tối ưu hóa.
                                        </Paragraph>
                                        <div className="flex flex-wrap gap-2">
                                            <Tag color="orange">Giám sát hiệu suất</Tag>
                                            <Tag color="orange">Cập nhật tính năng</Tag>
                                            <Tag color="orange">Tối ưu liên tục</Tag>
                                        </div>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </section>

            {/* Success Stories Section */}
            <section className="bg-slate-50 py-24 md:py-32 px-6 relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-32 h-32">
                        <QrcodeOutlined className="text-9xl text-green-600" />
                    </div>
                    <div className="absolute bottom-10 right-10 w-32 h-32">
                        <CheckCircleFilled className="text-9xl text-blue-600" />
                    </div>
                    <div className="absolute top-1/2 left-1/4 w-24 h-24 -translate-y-1/2">
                        <TrophyOutlined className="text-8xl text-yellow-600" />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto space-y-16 relative z-10">
                    <div className="text-center max-w-3xl mx-auto space-y-4 scroll-reveal">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                <TeamOutlined className="text-2xl text-purple-600" />
                            </div>
                            <Tag color="purple" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Khách hàng</Tag>
                        </div>
                        <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black gradient-text">Câu chuyện thành công</Title>
                        <Paragraph className="text-gray-500 text-lg">Hàng trăm doanh nghiệp và HTX đã tin tưởng sử dụng EBookFarm</Paragraph>
                    </div>

                    <Row gutter={[32, 32]}>
                        {[
                            {
                                name: 'HTX Nông nghiệp Hiệp Hòa',
                                location: 'Bắc Giang',
                                area: '500 ha',
                                product: 'Vải thiều',
                                result: 'Quản lý 500ha vải thiều, số hóa toàn bộ quy trình từ chăm sóc đến thu hoạch. Sản phẩm đạt chuẩn VietGAP và xuất khẩu thành công.',
                                stats: ['500+ nông hộ', 'VietGAP', 'Xuất khẩu']
                            },
                            {
                                name: 'Công ty TNHH Ogasachi',
                                location: 'Tây Nguyên',
                                area: '20 ha',
                                product: 'Sachi hữu cơ',
                                result: 'Quản lý 20ha sachi và nhà xưởng 3000m². Minh bạch toàn bộ quy trình với đối tác xuất khẩu Đài Loan.',
                                stats: ['20 ha', 'Hữu cơ', 'Xuất Đài Loan']
                            },
                            {
                                name: 'Traphaco Pharma',
                                location: 'Toàn quốc',
                                area: '100+ ha',
                                product: 'Dược liệu',
                                result: 'Truy xuất nguồn gốc dược liệu từ vùng trồng đến sản xuất. Đảm bảo chất lượng và minh bạch với đối tác.',
                                stats: ['100+ ha', 'GMP', 'Dược phẩm']
                            }
                        ].map((story, idx) => (
                            <Col xs={24} md={8} key={idx}>
                                <Card className="h-full rounded-3xl shadow-sm hover:shadow-2xl transition-all border-gray-100 scroll-reveal hover-lift" style={{ animationDelay: `${idx * 0.15}s` }}>
                                    <div className="space-y-6">
                                        {/* Image placeholder with gradient */}
                                        <div className="relative h-48 -mx-6 -mt-6 mb-6 rounded-t-3xl overflow-hidden bg-gradient-to-br from-green-400 to-blue-500">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ShopOutlined className="text-white text-6xl opacity-30" />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <Text className="text-white font-bold text-lg block">{story.name}</Text>
                                                <Text className="text-white/80 text-sm flex items-center gap-1">
                                                    <GlobalOutlined /> {story.location}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center pulse-glow">
                                                    <CheckOutlined className="text-xl" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4 text-center">
                                            <div className="flex-1 p-3 bg-gray-50 rounded-xl">
                                                <Text className="block text-lg font-black text-gray-900">{story.area}</Text>
                                                <Text className="text-xs text-gray-500">Diện tích</Text>
                                            </div>
                                            <div className="flex-1 p-3 bg-gray-50 rounded-xl">
                                                <Text className="block text-lg font-black text-gray-900">{story.product}</Text>
                                                <Text className="text-xs text-gray-500">Sản phẩm</Text>
                                            </div>
                                        </div>

                                        <Paragraph className="text-gray-500 text-sm leading-relaxed">
                                            {story.result}
                                        </Paragraph>

                                        <div className="flex flex-wrap gap-2">
                                            {story.stats.map((stat, i) => (
                                                <Tag key={i} color="green" className="rounded-full">{stat}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Consultation Form Section */}
            <section className="bg-white py-24 md:py-32 px-6 relative overflow-hidden">
                {/* Background decorative image */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
                    <img src="/images/hero.png" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-green-200/20 blur-[100px] rounded-full blob-animate"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} md={12}>
                            <div className="space-y-6 scroll-reveal">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                        <PhoneOutlined className="text-2xl text-green-600" />
                                    </div>
                                    <Tag color="green" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Liên hệ</Tag>
                                </div>
                                <Title level={2} className="!text-gray-900 !mb-0 md:!text-4xl font-black">
                                    Nhận tư vấn & trải nghiệm ngay
                                </Title>
                                <Paragraph className="text-gray-500 text-lg leading-relaxed">
                                    Để lại thông tin và chuyên viên sẽ liên hệ tư vấn chi tiết cho bạn trong 24h.
                                </Paragraph>
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-3 hover-lift">
                                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center pulse-glow">
                                            <PhoneOutlined />
                                        </div>
                                        <div>
                                            <Text className="block text-xs text-gray-400 uppercase font-bold">Hotline</Text>
                                            <Text strong className="text-gray-900">1900 xxxx</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 hover-lift">
                                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center pulse-glow">
                                            <MailOutlined />
                                        </div>
                                        <div>
                                            <Text className="block text-xs text-gray-400 uppercase font-bold">Email</Text>
                                            <Text strong className="text-gray-900">contact@ebookfarm.vn</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card className="rounded-3xl shadow-xl border-0 scroll-reveal hover-lift">
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleConsultationSubmit}
                                    className="space-y-2"
                                >
                                    <Form.Item
                                        name="fullname"
                                        label="Họ và tên"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                                    >
                                        <Input 
                                            size="large" 
                                            placeholder="Nguyễn Văn A" 
                                            prefix={<UserOutlined className="text-gray-300" />}
                                            className="rounded-xl"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="phone"
                                        label="Số điện thoại"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                                        ]}
                                    >
                                        <Input 
                                            size="large" 
                                            placeholder="0912345678" 
                                            prefix={<PhoneOutlined className="text-gray-300" />}
                                            className="rounded-xl"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                    >
                                        <Input 
                                            size="large" 
                                            placeholder="email@example.com" 
                                            prefix={<MailOutlined className="text-gray-300" />}
                                            className="rounded-xl"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="organization"
                                        label="Tên doanh nghiệp/HTX"
                                    >
                                        <Input 
                                            size="large" 
                                            placeholder="HTX Nông nghiệp..." 
                                            prefix={<ShopOutlined className="text-gray-300" />}
                                            className="rounded-xl"
                                        />
                                    </Form.Item>

                                    <Form.Item className="!mb-0 !mt-6">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            block
                                            loading={loading}
                                            className="h-12 rounded-xl bg-green-600 hover:bg-green-700 border-0 font-bold text-base shine-effect"
                                        >
                                            Đăng ký tư vấn miễn phí
                                        </Button>
                                    </Form.Item>
                                    <Text className="text-xs text-gray-400 block text-center mt-3">
                                        Chúng tôi cam kết bảo mật thông tin cá nhân của bạn
                                    </Text>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Bottom CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto relative group scroll-reveal">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-[40px] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 morph-shape"></div>
                    <div className="relative bg-gray-900 rounded-[40px] p-12 md:p-24 overflow-hidden flex flex-col items-center text-center space-y-12 hover-lift">
                        <div className="absolute top-0 right-0 w-full h-full opacity-30 z-0 floating-element">
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
                                className="bg-green-600 hover:bg-green-700 h-16 px-12 rounded-2xl font-black text-xl border-0 shadow-2xl shadow-green-200/50 shine-effect hover-lift"
                                onClick={handleGetStarted}
                            >
                                Bắt đầu miễn phí <ArrowRightOutlined />
                            </Button>
                            <Button
                                size="large"
                                className="h-16 px-12 rounded-2xl font-bold text-xl border-2 border-white/20 text-white hover:border-white hover:text-white bg-white/5 backdrop-blur-md transition-all hover-lift"
                            >
                                Liên hệ tư vấn
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
