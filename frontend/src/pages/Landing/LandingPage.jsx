import React, { useState } from 'react';
import { Typography, Button, Row, Col, Card, Space, Tag, Divider, Form, Input, message, Steps, Select, Modal } from 'antd';
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
    CheckOutlined,
    CameraOutlined,
    EnvironmentOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';
import AIChatWidget from '../../components/AIChatWidget';
import api from '../../services/api';
import './LandingStyles.css';
import './LandingAnimations.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [form] = Form.useForm();
    const [qrForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [qrSearching, setQrSearching] = useState(false);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

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
            const response = await api.post('/consultations', values);

            if (response.data.success) {
                // If there's an AI response, show a more informative message
                if (response.data.data?.aiResponse) {
                    message.success({
                        content: 'Gửi yêu cầu thành công! Vui lòng kiểm tra email để xem gợi ý sơ bộ từ AI EBookFarm.',
                        duration: 5
                    });
                    
                    Modal.success({
                        title: 'Gợi ý sơ bộ từ AI EBookFarm',
                        content: (
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                        <SafetyCertificateFilled className="text-white" />
                                    </div>
                                    <Text strong className="text-blue-700">Trợ lý AI</Text>
                                    <Tag color="blue" className="text-[10px]">Llama 3.1</Tag>
                                </div>
                                <Paragraph className="text-gray-700 italic">
                                    "{response.data.data.aiResponse}"
                                </Paragraph>
                                <Divider className="my-2" />
                                <Text type="secondary" className="text-xs">
                                    * Đây là phản hồi tự động. Chuyên gia của chúng tôi sẽ liên hệ trực tiếp trong 24h.
                                </Text>
                            </div>
                        ),
                        width: 600,
                        okText: 'Tôi đã hiểu',
                        className: 'premium-modal'
                    });
                } else {
                    message.success(response.data.message || 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong 24h.');
                }
                form.resetFields();
            }
        } catch (error) {
            console.error('Consultation submit error:', error);
            message.error(error.response?.data?.message || 'Không thể kết nối đến server. Vui lòng thử lại sau!');
        } finally {
            setLoading(false);
        }
    };

    const handleQrSearch = async (values) => {
        const qrCode = values?.qrCode?.trim();
        if (!qrCode) {
            message.warning('Vui lòng nhập mã truy xuất!');
            return;
        }

        setQrSearching(true);
        try {
            // Use the standard api service instead of fetch with undefined API_URL
            const { data } = await api.get(`/journals/qr/${qrCode}`);

            if (data.success) {
                // Navigate to trace page
                navigate(`/trace/${qrCode}`);
            } else {
                message.error('Không tìm thấy sản phẩm với mã này. Vui lòng kiểm tra lại!');
            }
        } catch (error) {
            console.error('QR search error:', error);
            // Error messaging is handled by api interceptor, but we can add specific handling if needed
        } finally {
            setQrSearching(false);
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
                                <Tag color="green" className="m-0 rounded-full font-bold">Mới</Tag>
                                <Text className="text-green-700 font-bold text-xs uppercase tracking-wider">Hệ thống truy xuất chuẩn quốc gia TCVN</Text>
                            </div>
                            <Title className="!text-gray-900 !mb-6 leading-[1.1] !text-4xl md:!text-7xl font-black scroll-reveal">
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

            {/* QR Lookup Section for Consumers */}
            <section className="py-16 md:py-20 px-6 relative overflow-hidden bg-[#fafafa]">
                {/* Tech background elements */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22c55e 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-16 scroll-reveal">
                        <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 mb-6 hover-lift transition-all">
                            <QrcodeOutlined className="text-green-600 text-xl" />
                            <Text className="text-gray-900 font-black uppercase text-[10px] tracking-widest">Trung tâm xác thực</Text>
                        </div>
                        <Title level={2} className="!text-gray-900 !mb-4 md:!text-5xl font-black">
                            Tra cứu nguồn gốc sản phẩm
                        </Title>
                        <Paragraph className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Minh bạch thông tin từ nông trại đến bàn ăn chỉ với một thao tác quét mã hoặc nhập mã truy xuất.
                        </Paragraph>
                    </div>

                    <div className="relative scroll-reveal">
                        {/* Decorative glow behind card */}
                        <div className="absolute -inset-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 blur-3xl rounded-[50px] -z-10"></div>
                        
                        <Card className="rounded-[40px] shadow-2xl border-white bg-white/70 backdrop-blur-xl overflow-hidden p-0" styles={{ body: { padding: 0 } }}>
                            <div className="grid md:grid-cols-12">
                                {/* Left Side: Input Form */}
                                <div className="md:col-span-7 p-8 md:p-12 space-y-8 border-b md:border-b-0 md:border-r border-gray-100">
                                    <div className="space-y-2">
                                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Xác thực bằng mã</Text>
                                        <Title level={4} className="!text-gray-900 !mb-0 font-black">Nhập mã truy xuất điện tử</Title>
                                    </div>

                                    <Form form={qrForm} onFinish={handleQrSearch} className="space-y-4">
                                        <Form.Item name="qrCode" className="!mb-0">
                                            <Input
                                                size="large"
                                                placeholder="Nhập mã (ví dụ: 1a83ca5c...)"
                                                prefix={<SearchOutlined className="text-blue-500 mr-2" />}
                                                className="h-16 rounded-[20px] text-base border-gray-100 bg-gray-50/50 hover:bg-white focus:bg-white transition-all shadow-inner"
                                                disabled={qrSearching}
                                            />
                                        </Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            block
                                            loading={qrSearching}
                                            className="h-16 rounded-[20px] bg-gradient-to-r from-gray-900 to-blue-900 hover:from-black hover:to-blue-800 border-0 font-black text-lg shadow-xl shadow-blue-100 transition-all hover-lift"
                                        >
                                            Tra cứu thông tin ngay <ArrowRightOutlined className="ml-2" />
                                        </Button>
                                    </Form>

                                    <div className="pt-4 space-y-4">
                                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hướng dẫn quét QR</Text>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { icon: '📱', text: 'iPhone Camera', color: 'blue' },
                                                { icon: '📷', text: 'Android Camera', color: 'green' },
                                                { icon: '💬', text: 'Zalo / Messenger', color: 'purple' }
                                            ].map((guide, i) => (
                                                <Tag key={i} color={guide.color} className="rounded-xl px-4 py-2 border-0 font-bold bg-white shadow-sm hover-lift cursor-pointer flex items-center gap-2 m-0">
                                                    <span>{guide.icon}</span>
                                                    <span className="text-[11px]">{guide.text}</span>
                                                </Tag>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Camera Simulation Area */}
                                <div className="md:col-span-5 bg-slate-900 p-8 md:p-12 relative flex flex-col items-center justify-center text-center overflow-hidden">
                                    {/* Scan Animation Pattern */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-0 left-0 w-full h-full scan-line"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <QrcodeOutlined style={{ fontSize: '300px' }} className="text-green-500/20" />
                                        </div>
                                    </div>

                                    <div className="relative space-y-6 z-10">
                                        {/* Viewfinder Frame */}
                                        <div className="w-48 h-48 mx-auto relative border-2 border-green-500/30 rounded-[32px] p-4 group cursor-pointer hover:border-green-400 transition-all">
                                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-xl"></div>
                                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-xl"></div>
                                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-xl"></div>
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-xl"></div>
                                            
                                            <div className="w-full h-full bg-white/5 rounded-[20px] flex items-center justify-center group-hover:bg-green-500/10 transition-all">
                                                <CameraOutlined className="text-4xl text-green-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Text className="text-white font-black text-lg block">Quét QR bằng camera</Text>
                                            <Text className="text-gray-400 text-xs block leading-relaxed">
                                                Tự động nhận diện và chuyển hướng<br />đến trang chi tiết sản phẩm.
                                            </Text>
                                        </div>
                                        
                                        <div className="flex justify-center gap-4 pt-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-green-500"><CheckOutlined /></div>
                                                <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Nhanh chóng</Text>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-500"><SafetyOutlined /></div>
                                                <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Xác thực</Text>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* TCVN Highlight Section */}
            <section className="bg-white py-16 md:py-20 px-6">
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
                                                    <Text className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Tiêu chuẩn {i}</Text>
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
                                <Tag color="blue" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Tuân thủ</Tag>
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
                            <Tag color="green" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Đặc điểm nổi bật</Tag>
                        </div>
                        <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black">Nhật ký sản xuất điện tử EBookFarm</Title>
                        <Paragraph className="text-gray-500 text-lg">Giải pháp chuyển đổi số toàn diện cho nông nghiệp hiện đại, minh bạch và hiệu quả.</Paragraph>
                    </div>

                    <Row gutter={[20, 20]} className="mt-12">
                        {[
                            {
                                title: 'Quản lý quy trình sản xuất chi tiết',
                                desc: 'Ghi chép đầy đủ các hoạt động: gieo trồng, bón phân, tưới tiêu, thu hoạch. Tích hợp sổ tay điện tử thông minh cho từng loại cây trồng, vật nuôi.',
                                icon: <EditOutlined />,
                                color: '#10b981',
                                bgImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            },
                            {
                                title: 'Tự động hóa & Đồng bộ dữ liệu',
                                desc: (
                                    <div className="space-y-2">
                                        <Text className="text-gray-500 text-sm block">Đồng bộ dữ liệu thời gian thực từ mọi thiết bị:</Text>
                                        <div className="flex flex-col gap-1">
                                            <Text className="text-[11px] text-gray-400 flex items-center gap-1"><CheckOutlined className="text-green-500" /> Kết nối cảm biến IoT (Đất, Nước, Nhiệt độ)</Text>
                                            <Text className="text-[11px] text-gray-400 flex items-center gap-1"><CheckOutlined className="text-green-500" /> Đồng bộ điều khiển Drone & Máy móc</Text>
                                            <Text className="text-[11px] text-gray-400 flex items-center gap-1"><CheckOutlined className="text-green-500" /> Đa nền tảng: Mobile, Tablet và Máy tính</Text>
                                        </div>
                                    </div>
                                ),
                                icon: <ThunderboltFilled />,
                                color: '#3b82f6',
                                bgImage: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            },
                            {
                                title: 'Hỗ trợ truy xuất nguồn gốc',
                                desc: 'Cung cấp mã QR/mã vạch giúp khách hàng kiểm tra toàn bộ thông tin sản xuất. Đáp ứng VietGAP, GlobalGAP, Nông nghiệp hữu cơ...',
                                icon: <QrcodeOutlined />,
                                color: '#059669',
                                bgImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            },
                            {
                                title: 'Phân tích và dự báo AI',
                                desc: 'Sử dụng AI phân tích dữ liệu để dự báo năng suất, chi phí và rủi ro. Hỗ trợ đưa ra quyết định tối ưu hóa sản xuất dựa trên dữ liệu thực tế.',
                                icon: <LineChartOutlined />,
                                color: '#8b5cf6',
                                bgImage: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                            },
                            {
                                title: 'Bảo mật và lưu trữ đám mây',
                                desc: 'Lưu trữ dữ liệu trên nền tảng Cloud bảo mật tuyệt đối. Dễ dàng truy cập, tìm kiếm và quản lý thông tin lịch sử từ bất cứ đâu.',
                                icon: <CloudServerOutlined />,
                                color: '#06b6d4',
                                bgImage: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                            }
                        ].map((item, idx) => (
                            <Col xs={24} md={idx < 3 ? 8 : 12} key={idx}>
                                <Card variant="borderless" className="h-full rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border-gray-100 group hover-lift scroll-reveal">
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
                                    <Title level={4} className="!mb-4 !text-gray-900 leading-tight">{item.title}</Title>
                                    <Paragraph className="text-gray-500 leading-relaxed text-sm">{item.desc}</Paragraph>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-slate-50 py-16 md:py-20 px-6 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/30 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                    <div className="text-center max-w-3xl mx-auto space-y-4 scroll-reveal">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <TrophyOutlined className="text-2xl text-green-600" />
                            </div>
                            <Tag color="green" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Giá trị mang lại</Tag>
                        </div>
                        <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black">Giá trị mà doanh nghiệp nhận được</Title>
                        <Paragraph className="text-gray-500 text-lg">Khi triển khai hệ thống truy xuất nguồn gốc với EBookFarm</Paragraph>
                    </div>

                    <Row gutter={[24, 24]} className="mt-12">
                        {[
                            {
                                icon: <TrophyOutlined />,
                                title: 'Tạo ưu thế cạnh tranh',
                                desc: 'Áp dụng truy xuất nguồn gốc giúp tăng cơ hội đàm phán và bán được giá tốt hơn trên thị trường.',
                                color: 'orange',
                                gradient: 'from-orange-400 to-amber-600'
                            },
                            {
                                icon: <LineChartOutlined />,
                                title: 'Tối ưu quy trình sản xuất',
                                desc: 'Quản lý hiệu quả vùng sản xuất, kiểm soát rủi ro, tối ưu nhân sự và chi phí vận hành.',
                                color: 'blue',
                                gradient: 'from-blue-400 to-indigo-600'
                            },
                            {
                                icon: <SafetyOutlined />,
                                title: 'Nâng cao uy tín thương hiệu',
                                desc: 'Minh bạch thông tin làm tăng niềm tin người tiêu dùng và bảo vệ giá trị thương hiệu bền vững.',
                                color: 'green',
                                gradient: 'from-green-400 to-emerald-600'
                            },
                            {
                                icon: <GlobalOutlined />,
                                title: 'Mở rộng thị trường xuất khẩu',
                                desc: 'Đáp ứng đầy đủ các tiêu chuẩn khắt khe quốc tế, dễ dàng tiếp cận thị trường nước ngoài.',
                                color: 'purple',
                                gradient: 'from-purple-400 to-violet-600'
                            },
                            {
                                icon: <TeamOutlined />,
                                title: 'Minh bạch chuỗi cung ứng',
                                desc: 'Hỗ trợ minh bạch toàn bộ hoạt động sản xuất để chứng minh năng lực thực tế của doanh nghiệp.',
                                color: 'pink',
                                gradient: 'from-pink-400 to-rose-600'
                            },
                            {
                                icon: <DollarOutlined />,
                                title: 'Tăng doanh thu bền vững',
                                desc: 'Quảng bá thông tin sản phẩm chuyên nghiệp, tăng độ nhận diện thương hiệu và doanh số bán hàng.',
                                color: 'cyan',
                                gradient: 'from-cyan-400 to-teal-600'
                            }
                        ].map((item, idx) => (
                            <Col xs={24} sm={12} lg={8} key={idx}>
                                <div className="h-full group scroll-reveal" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <Card className="h-full rounded-[32px] border-white shadow-sm hover:shadow-2xl transition-all duration-500 hover-lift bg-white/80 backdrop-blur-md overflow-hidden">
                                        <div className="relative p-2">
                                            {/* Glow Background for Icon */}
                                            <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-[0.03] rounded-br-[60px] -z-10 group-hover:opacity-[0.08] transition-opacity`}></div>
                                            
                                            <div className="space-y-6 p-4">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br ${item.gradient}`}>
                                                    {item.icon}
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Title level={3} className="!mb-0 !text-gray-900 !text-xl font-black group-hover:text-blue-600 transition-colors">
                                                        {item.title}
                                                    </Title>
                                                    <Paragraph className="text-gray-500 text-sm leading-relaxed mb-0">
                                                        {item.desc}
                                                    </Paragraph>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Technology & Standards Section */}
            <section className="bg-gradient-to-br from-blue-50 to-green-50 py-16 md:py-20 px-6 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200/30 blur-[100px] rounded-full blob-animate"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-200/30 blur-[100px] rounded-full blob-animate" style={{ animationDelay: '3s' }}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 scroll-reveal">
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

            {/* Product Traceability Supply Chain Section */}
            <section id="process" className="bg-white py-16 md:py-20 px-6 relative overflow-hidden">
                {/* Tech grid background */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 scroll-reveal">
                        <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100 mb-2">
                            <SafetyCertificateOutlined className="text-green-600" />
                            <Text className="text-green-700 font-bold text-[10px] uppercase tracking-widest">Chuỗi giá trị</Text>
                        </div>
                        <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black gradient-text">
                            Quy Trình Truy Xuất Toàn Diện
                        </Title>
                        <Paragraph className="text-gray-500 text-lg">
                            Mô hình hóa toàn bộ chuỗi cung ứng, đảm bảo tính minh bạch và xác thực dữ liệu tại từng điểm chạm.
                        </Paragraph>
                    </div>

                    {/* 5-Step Supply Chain Flow */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative mb-20 scroll-reveal">
                        {/* Connecting line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10"></div>

                        {[
                            {
                                step: "01",
                                title: "Sản Xuất Ban Đầu",
                                items: ["Thu hoạch", "Ghi nhận dữ liệu", "Mã số lô"],
                                icon: <HomeOutlined />,
                                color: "from-blue-600 to-blue-400",
                                shadow: "shadow-blue-100",
                                bg: "bg-blue-50/50"
                            },
                            {
                                step: "02",
                                title: "Thu Gom & Vận Chuyển",
                                items: ["Gom hàng", "Kiểm tra chất lượng", "Đóng gói sơ bộ"],
                                icon: <TruckOutlined />,
                                color: "from-cyan-600 to-cyan-400",
                                shadow: "shadow-cyan-100",
                                bg: "bg-cyan-50/50"
                            },
                            {
                                step: "03",
                                title: "Chế Biến & Sản Xuất",
                                items: ["Xử lý nguyên liệu", "Quy trình sản xuất", "Gán nhãn & QR"],
                                icon: <DatabaseOutlined />,
                                color: "from-green-600 to-green-400",
                                shadow: "shadow-green-100",
                                bg: "bg-green-50/50"
                            },
                            {
                                step: "04",
                                title: "Lưu Kho & Phân Phối",
                                items: ["Nhập kho", "Quản lý tồn kho", "Đại lý phân phối"],
                                icon: <ShopOutlined />,
                                color: "from-orange-600 to-orange-400",
                                shadow: "shadow-orange-100",
                                bg: "bg-orange-50/50"
                            },
                            {
                                step: "05",
                                title: "Bán Lẻ & Tiêu Dùng",
                                items: ["Bày bán sản phẩm", "Khách hàng quét mã", "Truy cập thông tin"],
                                icon: <CheckOutlined />,
                                color: "from-red-600 to-red-400",
                                shadow: "shadow-red-100",
                                bg: "bg-red-50/50"
                            }
                        ].map((item, index) => (
                            <div key={index} className="relative group hover-lift">
                                <Card className={`rounded-[32px] border-0 shadow-xl ${item.shadow} ${item.bg} h-full overflow-hidden`}>
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg`}>
                                        {item.icon}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-4xl font-black opacity-10 italic">{item.step}</span>
                                        </div>
                                        <Title level={4} className="!text-gray-800 !mb-2 !text-base font-black leading-tight h-12 flex items-center">{item.title}</Title>
                                        <ul className="space-y-2 m-0 p-0 list-none">
                                            {item.items.map((point, pIdx) => (
                                                <li key={pIdx} className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color}`}></div>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Data Management Layer */}
                    <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-gray-100 scroll-reveal">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="md:w-1/3 text-center md:text-left space-y-4 border-b md:border-b-0 md:border-r border-gray-200 pb-8 md:pb-0 md:pr-8">
                                <Title level={3} className="!font-black !text-gray-800 !mb-0">Hệ Thống Quản Lý & Truy Xuất Dữ Liệu</Title>
                                <Text className="text-gray-500 block">Nền tảng hợp nhất giúp lưu trữ và xác thực thông tin xuyên suốt chuỗi giá trị.</Text>
                            </div>
                            
                            <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                                {[
                                    { icon: <FileTextOutlined />, label: "Ghi nhận", desc: "Dữ liệu thực địa" },
                                    { icon: <CloudServerOutlined />, label: "Lưu trữ", desc: "Database/Cloud" },
                                    { icon: <ShareAltOutlined />, label: "Chia sẻ", desc: "Đa nền tảng" },
                                    { icon: <SecurityScanOutlined />, label: "Kiểm chứng", desc: "Xác thực QR" }
                                ].map((step, i) => (
                                    <div key={i} className="text-center space-y-3">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-green-600 text-2xl border border-gray-50">
                                            {step.icon}
                                        </div>
                                        <div>
                                            <Text className="block font-black text-gray-800 text-sm">{step.label}</Text>
                                            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{step.desc}</Text>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Showcase Section */}
            <section className="bg-white py-16 md:py-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 scroll-reveal">
                        <div className="max-w-2xl space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <QrcodeOutlined className="text-2xl text-orange-600" />
                                </div>
                                <Tag color="orange" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1">Sản phẩm thực tế</Tag>
                            </div>
                            <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black">Sản phẩm đã được minh bạch hóa</Title>
                            <Paragraph className="text-gray-500 text-lg">
                                Hàng ngàn sản phẩm nông sản đã được gắn mã QR truy xuất nguồn gốc, giúp người tiêu dùng an tâm sử dụng và nâng cao giá trị thương hiệu.
                            </Paragraph>
                        </div>
                        <Button 
                            type="primary" 
                            size="large" 
                            className="bg-orange-600 hover:bg-orange-700 h-14 px-8 rounded-xl font-bold border-0 shadow-lg shadow-orange-200"
                        >
                            Xem tất cả sản phẩm <ArrowRightOutlined />
                        </Button>
                    </div>

                    <Row gutter={[32, 32]}>
                        {[
                            {
                                name: 'Gạo sạch ST25 Organic',
                                brand: 'HTX Nông nghiệp Hiệp Hòa',
                                image: '/images/rice_product.png',
                                tag: 'Lương thực',
                                color: 'green',
                                detail: {
                                    origin: 'Cánh đồng Hiệp Hòa, Bắc Giang',
                                    farmer: 'Nguyễn Văn A',
                                    variety: 'ST25 (Gạo ngon nhất thế giới)',
                                    harvestDate: '15/10/2025',
                                    standards: ['VietGAP', 'Organic USDA'],
                                    timeline: [
                                        { date: '01/06/2025', activity: 'Làm đất và gieo mạ', note: 'Sử dụng giống ST25 thuần chủng' },
                                        { date: '20/06/2025', activity: 'Cấy lúa', note: 'Mật độ 25 khóm/m2' },
                                        { date: '15/07/2025', activity: 'Bón phân hữu cơ đợt 1', note: 'Sử dụng phân bón vi sinh chuyên dụng' },
                                        { date: '10/09/2025', activity: 'Kiểm tra chất lượng trước thu hoạch', note: 'Không phát hiện dư lượng thuốc BVTV' },
                                        { date: '15/10/2025', activity: 'Thu hoạch và sấy khô', note: 'Độ ẩm đạt chuẩn 14%' }
                                    ]
                                }
                            },
                            {
                                name: 'Trái cây xuất khẩu chuẩn VietGAP',
                                brand: 'Trang trại Ogasachi',
                                image: '/images/fruit_product.png',
                                tag: 'Trái cây',
                                color: 'orange',
                                detail: {
                                    origin: 'Cao nguyên Lâm Đồng',
                                    farmer: 'Trần Thị B',
                                    variety: 'Táo/Cam organic',
                                    harvestDate: '20/11/2025',
                                    standards: ['GlobalGAP', 'HACCP'],
                                    timeline: [
                                        { date: '10/01/2025', activity: 'Cắt tỉa cành vụ mới', note: 'Tạo tán và vệ sinh vườn' },
                                        { date: '15/03/2025', activity: 'Ra hoa và thụ phấn', note: 'Thời tiết thuận lợi, tỷ lệ đậu quả cao' },
                                        { date: '20/06/2025', activity: 'Bao trái', note: 'Sử dụng túi bao chuyên dụng ngăn côn trùng' },
                                        { date: '05/11/2025', activity: 'Kiểm định chất lượng xuất khẩu', note: 'Đạt chuẩn size và độ đường (Brix)' },
                                        { date: '20/11/2025', activity: 'Thu hoạch và đóng gói', note: 'Quy trình lạnh khép kín' }
                                    ]
                                }
                            },
                            {
                                name: 'Mật ong hoa rừng tự nhiên',
                                brand: 'Công ty TNHH Dược liệu Việt',
                                image: '/images/honey_product.png',
                                tag: 'Thực phẩm',
                                color: 'gold',
                                detail: {
                                    origin: 'Rừng nguyên sinh Yên Bái',
                                    farmer: 'HTX nuôi ong rừng',
                                    variety: 'Mật ong đa hoa rừng',
                                    harvestDate: '01/05/2025',
                                    standards: ['ISO 22000', 'OCOP 4 sao'],
                                    timeline: [
                                        { date: '01/03/2025', activity: 'Đặt thùng ong', note: 'Vùng hoa rừng tự nhiên, không ô nhiễm' },
                                        { date: '15/03/2025', activity: 'Kiểm tra đàn ong', note: 'Đàn khỏe mạnh, mật đang tích tụ tốt' },
                                        { date: '10/04/2025', activity: 'Kiểm tra độ chín của mật', note: 'Vít nắp đạt 90%' },
                                        { date: '01/05/2025', activity: 'Khai thác mật', note: 'Sử dụng công nghệ quay ly tâm hiện đại' },
                                        { date: '10/05/2025', activity: 'Lọc và đóng chai', note: 'Quy trình vô trùng tuyệt đối' }
                                    ]
                                }
                            }
                        ].map((product, idx) => (
                            <Col xs={24} md={8} key={idx}>
                                <div 
                                    className="group relative scroll-reveal hover-lift cursor-pointer" 
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setShowProductModal(true);
                                    }}
                                >
                                    <div className="relative h-[450px] rounded-[40px] overflow-hidden shadow-2xl">
                                        <img 
                                            src={product.image} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100"></div>
                                        
                                        {/* Floating Badge */}
                                        <div className="absolute top-6 left-6">
                                            <Tag color={product.color} className="rounded-full px-4 py-1 font-bold border-0 shadow-lg">
                                                {product.tag}
                                            </Tag>
                                        </div>

                                        {/* Content */}
                                        <div className="absolute bottom-8 left-8 right-8 space-y-3">
                                            <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider">
                                                <ShopOutlined /> {product.brand}
                                            </div>
                                            <Title level={3} className="!text-white !mb-0 !text-2xl font-black leading-tight">
                                                {product.name}
                                            </Title>
                                            <div className="pt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                                <div className="flex items-center gap-2 text-orange-400 font-bold">
                                                    <QrcodeOutlined className="text-xl" />
                                                    <span>Xem báo cáo truy xuất</span>
                                                </div>
                                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                                    <ArrowRightOutlined />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Product Traceability Modal */}
            <Modal
                open={showProductModal}
                onCancel={() => setShowProductModal(false)}
                footer={null}
                width={700}
                centered
                styles={{ content: { padding: 0, borderRadius: '32px', overflow: 'hidden' } }}
                className="product-trace-modal"
            >
                {selectedProduct && (
                    <div className="bg-white">
                        {/* Header Area */}
                        <div className="bg-gradient-to-r from-gray-900 to-blue-900 p-8 text-white relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center">
                                    <QrcodeOutlined className="text-4xl text-blue-900" />
                                </div>
                                <div>
                                    <Text className="text-blue-300 text-xs font-black uppercase tracking-widest block mb-1">Xác thực nguồn gốc</Text>
                                    <Title level={3} className="!text-white !mb-0 font-black">{selectedProduct.name}</Title>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-6">
                                <Tag color="blue" className="rounded-full px-4 border-0 font-bold bg-white/10 text-white">Lô: EB-{new Date().getFullYear()}-001</Tag>
                                <Tag color="green" className="rounded-full px-4 border-0 font-bold bg-white/10 text-white">Trạng thái: Đã kiểm duyệt</Tag>
                            </div>
                            
                            {/* Decorative QR Pattern */}
                            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 flex items-center justify-center overflow-hidden pointer-events-none">
                                <QrcodeOutlined style={{ fontSize: '200px' }} />
                            </div>
                        </div>

                        <div className="p-8 md:p-10 space-y-10">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Text className="text-gray-400 text-[10px] uppercase font-black tracking-wider">Nhà sản xuất</Text>
                                    <Text strong className="text-gray-800 block text-base">{selectedProduct.brand}</Text>
                                </div>
                                <div className="space-y-1">
                                    <Text className="text-gray-400 text-[10px] uppercase font-black tracking-wider">Hộ nông dân / Vùng trồng</Text>
                                    <Text strong className="text-gray-800 block text-base">{selectedProduct.detail.farmer} - {selectedProduct.detail.origin}</Text>
                                </div>
                                <div className="space-y-1">
                                    <Text className="text-gray-400 text-[10px] uppercase font-black tracking-wider">Giống / Chủng loại</Text>
                                    <Text strong className="text-gray-800 block text-base">{selectedProduct.detail.variety}</Text>
                                </div>
                                <div className="space-y-1">
                                    <Text className="text-gray-400 text-[10px] uppercase font-black tracking-wider">Ngày thu hoạch</Text>
                                    <Text strong className="text-gray-800 block text-base">{selectedProduct.detail.harvestDate}</Text>
                                </div>
                            </div>

                            {/* Timeline Journey */}
                            <div>
                                <Title level={4} className="!mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> 
                                    Hành trình sản xuất sạch
                                </Title>
                                <Steps
                                    direction="vertical"
                                    size="small"
                                    current={selectedProduct.detail.timeline.length}
                                    items={selectedProduct.detail.timeline.map((t, i) => ({
                                        title: <Text strong className="text-sm">{t.activity}</Text>,
                                        description: (
                                            <div className="text-xs text-gray-500 mt-1">
                                                <div className="text-blue-600 font-bold mb-0.5">{t.date}</div>
                                                {t.note}
                                            </div>
                                        ),
                                        status: 'finish'
                                    }))}
                                />
                            </div>

                            {/* Certificates Section */}
                            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={5} className="!mb-0 text-gray-800">Chứng nhận chất lượng</Title>
                                    <CheckCircleFilled className="text-green-500 text-xl" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.detail.standards.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                            <SafetyCertificateFilled className="text-blue-600" />
                                            <Text strong className="text-xs">{s}</Text>
                                        </div>
                                    ))}
                                </div>
                                <Text className="text-[10px] text-gray-400 block mt-4 text-center italic">
                                    * Toàn bộ dữ liệu được xác thực và bảo vệ bởi hệ thống EBookFarm Blockchain
                                </Text>
                            </div>
                            
                            <div className="flex gap-4">
                                <Button 
                                    block 
                                    size="large" 
                                    className="h-14 rounded-2xl bg-gray-900 text-white border-0 font-bold hover:!bg-black transition-all"
                                    onClick={() => setShowProductModal(false)}
                                >
                                    Đóng báo cáo
                                </Button>
                                <Button 
                                    type="primary"
                                    size="large" 
                                    className="h-14 px-10 rounded-2xl bg-blue-600 border-0 font-bold shadow-lg shadow-blue-200"
                                    onClick={() => {
                                        setShowProductModal(false);
                                        handleGetStarted();
                                    }}
                                >
                                    Tôi muốn dùng hệ thống này
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Success Stories Section */}
            <section className="bg-slate-50 py-16 md:py-20 px-6 relative overflow-hidden">
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
                                image: '/images/lychee_farm.png',
                                result: 'Quản lý 500ha vải thiều, số hóa toàn bộ quy trình từ chăm sóc đến thu hoạch. Sản phẩm đạt chuẩn VietGAP và xuất khẩu thành công.',
                                stats: ['500+ nông hộ', 'VietGAP', 'Xuất khẩu'],
                                detail: {
                                    challenge: 'Trước đây, HTX gặp khó khăn trong việc kiểm soát nhật ký canh tác của hàng trăm hộ nông dân lẻ tẻ, dẫn đến chất lượng không đồng đều và khó đáp ứng tiêu chuẩn xuất khẩu.',
                                    solution: 'Áp dụng EBookFarm để số hóa quy trình ghi chép. Mỗi nông hộ được cấp tài khoản mobile để cập nhật hoạt động hàng ngày. Cán bộ HTX giám sát thời gian thực qua bảng điều khiển trung tâm.',
                                    impact: '100% sản lượng đạt chuẩn VietGAP, giá bán tăng 20% nhờ minh bạch nguồn gốc, mở rộng thị trường sang Nhật Bản và Châu Âu.'
                                }
                            },
                            {
                                name: 'Công ty TNHH Ogasachi',
                                location: 'Tây Nguyên',
                                area: '20 ha',
                                product: 'Sachi hữu cơ',
                                image: '/images/sachi_farm.png',
                                result: 'Quản lý 20ha sachi và nhà xưởng 3000m². Minh bạch toàn bộ quy trình với đối tác xuất khẩu Đài Loan.',
                                stats: ['20 ha', 'Hữu cơ', 'Xuất Đài Loan'],
                                detail: {
                                    challenge: 'Đối tác nước ngoài yêu cầu khắt khe về việc minh bạch quá trình sử dụng phân bón hữu cơ và thuốc BVTV sinh học trong suốt chu kỳ sinh trưởng của cây Sachi.',
                                    solution: 'Triển khai hệ thống truy xuất nguồn gốc QR code tích hợp với nhật ký sản xuất điện tử. Toàn bộ dữ liệu được lưu trữ không thể thay đổi trên hệ thống.',
                                    impact: 'Ký kết hợp đồng dài hạn với đối tác Đài Loan, giảm 30% thời gian báo cáo và đối soát dữ liệu chất lượng hàng tháng.'
                                }
                            },
                            {
                                name: 'Traphaco Pharma',
                                location: 'Toàn quốc',
                                area: '100+ ha',
                                product: 'Dược liệu',
                                image: '/images/medicinal_plants.png',
                                result: 'Truy xuất nguồn gốc dược liệu từ vùng trồng đến sản xuất. Đảm bảo chất lượng và minh bạch với đối tác.',
                                stats: ['100+ ha', 'GMP', 'Dược phẩm'],
                                detail: {
                                    challenge: 'Quản lý vùng nguyên liệu dược liệu trải dài trên nhiều tỉnh thành, cần đảm bảo tuân thủ nghiêm ngặt chuẩn GACP-WHO.',
                                    solution: 'Sử dụng EBookFarm để theo dõi chi tiết từ khâu chọn giống, thổ nhưỡng đến khi thu hoạch và vận chuyển về nhà máy chiết xuất.',
                                    impact: 'Số hóa hoàn toàn hồ sơ vùng trồng, nâng cao năng lực quản lý chuỗi cung ứng dược liệu sạch, đảm bảo 100% nguyên liệu đầu vào đạt chuẩn.'
                                }
                            }
                        ].map((story, idx) => (
                            <Col xs={24} md={8} key={idx}>
                                <Card className="h-full rounded-3xl shadow-sm hover:shadow-2xl transition-all border-gray-100 scroll-reveal hover-lift overflow-hidden" style={{ animationDelay: `${idx * 0.15}s` }} styles={{ body: { padding: 0 } }}>
                                    <div className="space-y-0 h-full flex flex-col">
                                        {/* Real Success Story Image */}
                                        <div className="relative h-56 overflow-hidden flex-shrink-0">
                                            <img 
                                                src={story.image} 
                                                alt={story.name} 
                                                className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                            <div className="absolute bottom-4 left-6 right-6">
                                                <Text className="text-white font-black text-lg block leading-tight mb-1">{story.name}</Text>
                                                <Text className="text-white/80 text-xs flex items-center gap-1 uppercase tracking-widest font-bold">
                                                    <GlobalOutlined /> {story.location}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-6 flex-1 flex flex-col">
                                            <div className="flex gap-4 text-center">
                                                <div className="flex-1 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <Text className="block text-lg font-black text-gray-900">{story.area}</Text>
                                                    <Text className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Diện tích</Text>
                                                </div>
                                                <div className="flex-1 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <Text className="block text-lg font-black text-gray-900">{story.product}</Text>
                                                    <Text className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Sản phẩm</Text>
                                                </div>
                                            </div>

                                            <Paragraph className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                                                {story.result}
                                            </Paragraph>

                                            <div className="mt-auto space-y-4">
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                                                    {story.stats.map((stat, i) => (
                                                        <Tag key={i} color="green" className="rounded-full px-3 font-medium border-green-100">{stat}</Tag>
                                                    ))}
                                                </div>
                                                <Button 
                                                    block 
                                                    className="h-12 rounded-xl font-bold border-gray-200 hover:border-green-500 hover:text-green-600 transition-all"
                                                    onClick={() => {
                                                        setSelectedStory(story);
                                                        setShowStoryModal(true);
                                                    }}
                                                >
                                                    Xem chi tiết câu chuyện
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Story Detail Modal */}
            <Modal
                open={showStoryModal}
                onCancel={() => setShowStoryModal(false)}
                footer={null}
                width={800}
                centered
                styles={{ content: { padding: 0, borderRadius: '32px', overflow: 'hidden' } }}
                className="story-modal"
            >
                {selectedStory && (
                    <div className="space-y-0">
                        <div className="relative h-64 overflow-hidden">
                            <img src={selectedStory.image} alt={selectedStory.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <Tag color="green" className="rounded-full px-4 border-0 font-bold">Thành công tiêu biểu</Tag>
                                    <Text className="text-white/80 text-sm"><GlobalOutlined /> {selectedStory.location}</Text>
                                </div>
                                <Title level={2} className="!text-white !mb-0 !text-3xl font-black">{selectedStory.name}</Title>
                            </div>
                        </div>
                        <div className="p-8 md:p-10 space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <Text className="text-xs text-gray-400 block uppercase font-bold mb-1">Diện tích</Text>
                                    <Text className="text-xl font-black text-gray-900">{selectedStory.area}</Text>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <Text className="text-xs text-gray-400 block uppercase font-bold mb-1">Sản phẩm</Text>
                                    <Text className="text-xl font-black text-gray-900">{selectedStory.product}</Text>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl col-span-2">
                                    <Text className="text-xs text-gray-400 block uppercase font-bold mb-1">Chứng chỉ hỗ trợ</Text>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStory.stats.map((s, i) => <Tag key={i} color="blue" className="rounded-full m-0">{s}</Tag>)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Title level={4} className="!text-red-500 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-red-500 rounded-full"></div> Thách thức ban đầu
                                    </Title>
                                    <Paragraph className="text-gray-600 text-base leading-relaxed">{selectedStory.detail.challenge}</Paragraph>
                                </div>
                                <div>
                                    <Title level={4} className="!text-blue-500 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-blue-500 rounded-full"></div> Giải pháp từ EBookFarm
                                    </Title>
                                    <Paragraph className="text-gray-600 text-base leading-relaxed">{selectedStory.detail.solution}</Paragraph>
                                </div>
                                <div>
                                    <Title level={4} className="!text-green-500 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-green-500 rounded-full"></div> Kết quả đạt được
                                    </Title>
                                    <Paragraph className="text-gray-600 text-base leading-relaxed font-medium">{selectedStory.detail.impact}</Paragraph>
                                </div>
                            </div>

                            <Divider />
                            <div className="flex justify-between items-center bg-green-50 p-6 rounded-3xl">
                                <div className="space-y-1">
                                    <Text className="text-gray-500 text-sm block">Bạn muốn đạt được thành công tương tự?</Text>
                                    <Text strong className="text-green-700 text-lg">Đăng ký tư vấn giải pháp ngay hôm nay!</Text>
                                </div>
                                <Button type="primary" size="large" className="bg-green-600 border-0 h-12 rounded-xl font-bold" onClick={() => setShowStoryModal(false)}>
                                    Nhận tư vấn ngay
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* About Us Section */}
            <section id="about-us" className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-16 md:py-20 px-6 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full blob-animate"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full blob-animate" style={{ animationDelay: '3s' }}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-16 scroll-reveal">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <TeamOutlined className="text-2xl text-green-400" />
                            </div>
                            <Tag color="green" className="rounded-full px-4 font-black uppercase text-xs tracking-widest py-1 pulse-badge">Về chúng tôi</Tag>
                        </div>
                        <Title level={2} className="!text-white !mb-4 md:!text-5xl font-black">
                            Công ty TNHH Dịch vụ Tư vấn<br />
                            <span className="gradient-text">Khoa học và Công nghệ Việt</span>
                        </Title>
                        <Paragraph className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
                            Chính thức hoạt động từ tháng 7 năm 2013, được sáng lập bởi các chuyên gia giàu kinh nghiệm hoạt động ở nhiều lĩnh vực Kinh tế - Xã hội khác nhau.
                        </Paragraph>
                    </div>

                    <Row gutter={[32, 32]} className="mb-24">
                        {/* Mission */}
                        <Col xs={24} md={12}>
                            <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover-lift scroll-reveal">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center shrink-0">
                                        <RocketOutlined className="text-3xl text-green-400" />
                                    </div>
                                    <div>
                                        <Text className="text-green-400 text-xs font-black uppercase tracking-widest block">Mission</Text>
                                        <Title level={3} className="!text-white !mb-0">Sứ mệnh</Title>
                                    </div>
                                </div>
                                <Paragraph className="text-gray-300 text-base leading-relaxed !mb-0">
                                    Cung cấp các dịch vụ tư vấn quản lý và đào tạo chuyên nghiệp, đơn giản và hiệu quả. Mang lại những sản phẩm và dịch vụ có giá trị thực tế, giúp gia tăng hiệu quả hoạt động, phát triển bền vững và thịnh vượng cho các tổ chức và doanh nghiệp.
                                </Paragraph>
                            </div>
                        </Col>

                        {/* Vision */}
                        <Col xs={24} md={12}>
                            <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover-lift scroll-reveal">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                                        <GlobalOutlined className="text-3xl text-blue-400" />
                                    </div>
                                    <div>
                                        <Text className="text-blue-400 text-xs font-black uppercase tracking-widest block">Vision</Text>
                                        <Title level={3} className="!text-white !mb-0">Tầm nhìn</Title>
                                    </div>
                                </div>
                                <Paragraph className="text-gray-300 text-base leading-relaxed !mb-0">
                                    Trở thành đối tác tin cậy và ưu tiên hàng đầu trong lĩnh vực cung cấp dịch vụ tư vấn quản lý và đào tạo chuyên nghiệp tại Việt Nam. Tập trung vào chất lượng, sáng tạo và sự cam kết, đóng góp tích cực vào sự phát triển toàn diện của cộng đồng và xã hội.
                                </Paragraph>
                            </div>
                        </Col>
                    </Row>

                    {/* Strategic Objectives */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 mb-12 scroll-reveal">
                        <div className="flex flex-col items-center gap-4 mb-12 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/10">
                                <TrophyOutlined className="text-3xl text-orange-400" />
                            </div>
                            <Title level={3} className="!text-white !mb-0 md:!text-4xl font-black">Mục tiêu chiến lược</Title>
                        </div>
                        <Row gutter={[32, 32]} justify="center">
                            {[
                                {
                                    icon: <LineChartOutlined />,
                                    color: '#10b981',
                                    text: 'Tập trung vào việc phát triển và mở rộng danh mục dịch vụ, bao gồm cả tư vấn quản lý và đào tạo chuyên nghiệp trong các lĩnh vực mới.'
                                },
                                {
                                    icon: <SafetyCertificateFilled />,
                                    color: '#3b82f6',
                                    text: 'Nâng cao chất lượng dịch vụ thông qua việc đào tạo nhân viên, áp dụng công nghệ mới và liên tục thu thập phản hồi từ khách hàng để cải thiện quy trình.'
                                },
                                {
                                    icon: <GlobalOutlined />,
                                    color: '#8b5cf6',
                                    text: 'Tăng cường hiện diện trực tuyến thông qua quảng bá, tiếp cận khách hàng tiềm năng qua các kênh truyền thông và marketing kỹ thuật số.'
                                }
                            ].map((obj, idx) => (
                                <Col xs={24} md={8} key={idx}>
                                    <div className="flex flex-col items-center text-center gap-4 group">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                                            style={{ background: `${obj.color}20`, color: obj.color }}>
                                            <span className="text-3xl">{obj.icon}</span>
                                        </div>
                                        <Text className="text-gray-300 text-sm leading-relaxed max-w-[280px]">{obj.text}</Text>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
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
                                            <Text strong className="text-gray-900">02462730.818</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 hover-lift">
                                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center pulse-glow">
                                            <MailOutlined />
                                        </div>
                                        <div>
                                            <Text className="block text-xs text-gray-400 uppercase font-bold">Email</Text>
                                            <Text strong className="text-gray-900">tuvansct@gmail.com</Text>
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

                                    <Row gutter={12}>
                                        <Col span={24}>
                                            <Form.Item
                                                name="category"
                                                label="Lĩnh vực cần tư vấn"
                                                initialValue="Kỹ thuật"
                                            >
                                                <Select size="large" className="rounded-xl">
                                                    <Option value="Kỹ thuật">Hỗ trợ kỹ thuật / Canh tác</Option>
                                                    <Option value="Báo giá">Báo giá dịch vụ / Phần mềm</Option>
                                                    <Option value="Hợp tác">Hợp tác kinh doanh</Option>
                                                    <Option value="Khác">Khác</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="message"
                                        label="Nội dung cần tư vấn"
                                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                                    >
                                        <TextArea 
                                            rows={3} 
                                            placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..." 
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
