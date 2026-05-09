import React, { useState } from 'react';
import { Row, Col, Typography, Button, Skeleton, Space, Tag, Avatar, Divider, Card } from 'antd';
import { 
    ArrowLeftOutlined, 
    CalendarOutlined, 
    ClockCircleOutlined, 
    CheckCircleFilled, 
    BookOutlined, 
    MoreOutlined,
    FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;

const NewsListAll = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);

    const { data: newsItems = [], isLoading } = useQuery({
        queryKey: ['news-all'],
        queryFn: async () => {
            const { data } = await api.get('/news');
            return data.data;
        }
    });

    const categories = ['Tất cả', ...new Set(newsItems.map(item => item.category))];
    const filteredNews = selectedCategory && selectedCategory !== 'Tất cả'
        ? newsItems.filter(n => n.category === selectedCategory)
        : newsItems;

    const getFallbackImage = (category) => {
        if (category === 'Công nghệ') return 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80';
        if (category === 'Thị trường') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
        return 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80';
    };

    return (
        <div className="bg-white min-h-screen font-['Inter',_sans-serif]">
            <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="mb-12">
                    <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-green-600 font-medium p-0 mb-6 flex items-center"
                    >
                        Quay lại
                    </Button>
                    <Title level={1} className="!text-[#292929] !font-black !mb-2 !text-4xl tracking-tight">Bài viết nổi bật</Title>
                    <Text className="text-[#505050] text-lg">Tổng hợp các bài viết chia sẻ về nông nghiệp sạch và công nghệ số.</Text>
                </div>

                <Row gutter={48}>
                    {/* Main Content: Post List */}
                    <Col xs={24} lg={17}>
                        {isLoading ? (
                            <div className="space-y-8">
                                {[1, 2, 3].map(i => <Skeleton key={i} active avatar paragraph={{ rows: 4 }} />)}
                            </div>
                        ) : filteredNews.length > 0 ? (
                            <div className="space-y-10">
                                {filteredNews.map((news, index) => (
                                    <div 
                                        key={news._id || index}
                                        className="group cursor-pointer border-b border-gray-100 pb-10 last:border-0"
                                        onClick={() => navigate(`/news/${news._id}`)}
                                    >
                                        {/* Author Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Avatar size={28} src={`https://i.pravatar.cc/150?u=${news.author || 'admin'}`} />
                                                <Text className="font-bold text-[#292929] text-sm flex items-center gap-1">
                                                    {news.author || 'EBookFarm Editor'}
                                                    <CheckCircleFilled className="text-blue-500 text-[10px]" />
                                                </Text>
                                            </div>
                                            <Space className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <BookOutlined className="hover:text-black" />
                                                <MoreOutlined className="hover:text-black" />
                                            </Space>
                                        </div>

                                        {/* Post Body */}
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <Title level={3} className="!text-[#292929] !font-bold !mb-3 !text-xl group-hover:text-green-600 transition-colors leading-tight">
                                                    {news.title}
                                                </Title>
                                                <Paragraph className="text-[#505050] text-sm md:text-base line-clamp-3 mb-4 leading-relaxed">
                                                    {news.summary}
                                                </Paragraph>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <Tag className="rounded-full bg-gray-100 border-0 text-[#505050] font-semibold px-3 py-0.5 m-0">
                                                        {news.category}
                                                    </Tag>
                                                    <span className="flex items-center gap-1">
                                                        <CalendarOutlined /> {dayjs(news.publishedAt).fromNow()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ClockCircleOutlined /> 6 phút đọc
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-48 h-32 flex-shrink-0">
                                                <img
                                                    src={news.image || getFallbackImage(news.category)}
                                                    alt={news.title}
                                                    className="w-full h-full object-cover rounded-2xl shadow-sm group-hover:shadow-md transition-shadow"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <Title level={4} className="text-gray-400">Chưa có bài viết nào trong chủ đề này</Title>
                                <Button type="primary" className="bg-green-600 border-0 rounded-full mt-4" onClick={() => setSelectedCategory(null)}>
                                    Xem tất cả bài viết
                                </Button>
                            </div>
                        )}
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={7} className="hidden lg:block">
                        <div className="sticky top-10 space-y-12">
                            {/* Topics Section */}
                            <div>
                                <Title level={5} className="!text-[#757575] !uppercase !text-xs !font-black !tracking-widest !mb-6">CÁC CHỦ ĐỀ ĐƯỢC ĐỀ XUẤT</Title>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat === 'Tất cả' ? null : cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                                                (selectedCategory === cat || (!selectedCategory && cat === 'Tất cả'))
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-100 text-[#505050] hover:bg-gray-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trending Section */}
                            <div>
                                <Title level={5} className="!text-[#757575] !uppercase !text-xs !font-black !tracking-widest !mb-6 flex items-center gap-2">
                                    <FireOutlined className="text-orange-500" /> BÀI VIẾT XEM NHIỀU
                                </Title>
                                <div className="space-y-6">
                                    {newsItems.slice(0, 3).map((news, idx) => (
                                        <div key={idx} className="group cursor-pointer" onClick={() => navigate(`/news/${news._id}`)}>
                                            <Text className="text-[#505050] text-[10px] font-black uppercase mb-1 block">Tin số {idx + 1}</Text>
                                            <Title level={5} className="!text-[#292929] !font-bold !text-sm group-hover:text-green-600 transition-colors line-clamp-2 leading-snug">
                                                {news.title}
                                            </Title>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Banner Section */}
                            <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 rounded-3xl text-white relative overflow-hidden group shadow-lg">
                                <div className="relative z-10">
                                    <Title level={4} className="!text-white !font-black !mb-2">Gia nhập cộng đồng</Title>
                                    <Paragraph className="text-green-50 text-sm mb-6">Theo dõi chúng tôi để nhận những tin tức nông nghiệp mới nhất.</Paragraph>
                                    <Button className="rounded-full font-bold border-0 bg-white text-green-700 hover:scale-105 transition-transform">Theo dõi ngay</Button>
                                </div>
                                <div className="absolute -right-8 -bottom-8 text-white/10 rotate-12 transition-transform group-hover:scale-110">
                                    <FireOutlined style={{ fontSize: '120px' }} />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default NewsListAll;

