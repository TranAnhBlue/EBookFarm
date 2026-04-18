import React from 'react';
import { Row, Col, Typography, Button, Skeleton, Space, Tag } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const NewsListAll = () => {
    const navigate = useNavigate();

    const { data: newsItems = [], isLoading } = useQuery({
        queryKey: ['news-all'],
        queryFn: async () => {
            const { data } = await api.get('/news');
            return data.data;
        }
    });

    const getFallbackImage = (category) => {
        if (category === 'Công nghệ') return 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80';
        if (category === 'Thị trường') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
        return 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80';
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10 min-h-screen animate-in fade-in duration-700">
            {/* Header */}
            <div className="space-y-4">
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-green-600 font-medium p-0"
                >
                    Quay lại
                </Button>
                <div>
                    <Title level={2} className="!mb-2">Tin tức hệ thống</Title>
                    <Text className="text-gray-500 text-lg">Cập nhật những thông tin mới nhất về nông nghiệp và công nghệ</Text>
                </div>
            </div>

            {/* News Grid */}
            {isLoading ? (
                <Row gutter={[24, 24]}>
                    {[1, 2, 3, 4].map(i => (
                        <Col xs={24} md={12} lg={8} key={i}>
                            <Card loading={true} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <Row gutter={[24, 24]}>
                    {newsItems.map((news, index) => (
                        <Col xs={24} md={12} lg={8} key={index}>
                            <div 
                                onClick={() => navigate(`/news/${news._id}`)}
                                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={news.image || getFallbackImage(news.category)}
                                        alt={news.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Tag color="green" className="rounded-full px-3 py-0.5 border-0 font-bold backdrop-blur-md bg-green-500/80 text-white uppercase text-[10px] tracking-widest">
                                            {news.category}
                                        </Tag>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mb-3 uppercase tracking-tighter">
                                        <CalendarOutlined className="text-[10px]" /> {new Date(news.publishedAt).toLocaleDateString('vi-VN')}
                                    </div>
                                    <Title level={4} className="!text-gray-900 !mb-3 group-hover:text-green-600 transition-colors line-clamp-2 leading-snug">
                                        {news.title}
                                    </Title>
                                    <Paragraph className="text-gray-500 text-sm line-clamp-3 !mb-0 leading-relaxed">
                                        {news.summary}
                                    </Paragraph>
                                    <div className="mt-auto pt-6 flex justify-end">
                                        <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                            Xem chi tiết <ArrowRightOutlined className="text-[10px]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            )}

            {!isLoading && newsItems.length === 0 && (
                <div className="py-24 text-center">
                    <Text className="text-gray-400 italic">Hiện tại chưa có tin tức nào.</Text>
                </div>
            )}
        </div>
    );
};

export default NewsListAll;
