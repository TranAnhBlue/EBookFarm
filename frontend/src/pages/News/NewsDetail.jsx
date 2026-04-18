import React from 'react';
import { Typography, Button, Skeleton, Space, Tag, Divider, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, UserOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: news, isLoading } = useQuery({
        queryKey: ['news', id],
        queryFn: async () => {
            const { data } = await api.get(`/news/${id}`);
            return data.data;
        }
    });

    const getFallbackImage = (category) => {
        if (category === 'Công nghệ') return 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80';
        if (category === 'Thị trường') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
        return 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80';
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
                <Skeleton active paragraph={{ rows: 20 }} />
            </div>
        );
    }

    if (!news) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
                <Title level={4}>Không tìm thấy bài viết</Title>
                <Button onClick={() => navigate('/news')}>Quay lại danh sách</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-700 pb-24">
            {/* Navigation */}
            <div className="flex flex-col gap-4">
                <Breadcrumb 
                    items={[
                        { title: <Link to="/">Trang chủ</Link> },
                        { title: <Link to="/news">Tin tức</Link> },
                        { title: 'Chi tiết bài viết' }
                    ]}
                />
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate(-1)}
                    className="w-fit text-gray-500 hover:text-green-600 font-medium p-0"
                >
                    Quay lại
                </Button>
            </div>

            {/* Header Content */}
            <div className="space-y-6 text-center sm:text-left">
                <Tag color="green" className="rounded-full px-4 py-1 border-0 font-bold bg-green-50 text-green-600 uppercase text-xs tracking-widest">
                    {news.category}
                </Tag>
                <Title className="!mb-6 !text-gray-900 leading-tight md:!text-5xl">{news.title}</Title>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-4 gap-x-8 text-gray-400 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <CalendarOutlined className="text-green-500" />
                        <span>{new Date(news.publishedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <UserOutlined className="text-green-500" />
                        <span>Đăng bởi Admin</span>
                    </div>
                    <Button type="text" icon={<ShareAltOutlined />} className="p-0 text-gray-400 hover:text-green-600 flex items-center h-fit">
                        <span>Chia sẻ</span>
                    </Button>
                </div>
            </div>

            {/* Featured Image */}
            <div className="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                    src={news.image || getFallbackImage(news.category)} 
                    alt={news.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Summary / Lead */}
            <div className="bg-gray-50 p-8 rounded-2xl border-l-4 border-green-500">
                <Paragraph className="!mb-0 text-lg text-gray-700 font-medium italic leading-relaxed">
                    {news.summary}
                </Paragraph>
            </div>

            <Divider />

            {/* Article Content */}
            <div className="prose prose-lg max-w-none text-gray-800 leading-loose">
                {news.content ? (
                    news.content.split('\n').map((paragraph, index) => (
                        <Paragraph key={index} className="text-lg mb-6">
                            {paragraph}
                        </Paragraph>
                    ))
                ) : (
                    <Paragraph className="italic text-gray-400">Nội dung bài viết đang được cập nhật...</Paragraph>
                )}
            </div>

            <Divider className="my-12" />
            
            <div className="flex flex-col items-center justify-center gap-6 py-10 bg-green-50/30 rounded-3xl border border-green-100">
                <Title level={4} className="!mb-0">Bạn thấy bài viết này hữu ích?</Title>
                <Space size="large">
                    <Button size="large" className="rounded-xl px-8 h-12 font-bold hover:bg-white transition-all shadow-sm">
                        Lưu bài viết
                    </Button>
                    <Button type="primary" size="large" className="bg-green-600 hover:bg-green-700 rounded-xl px-12 h-12 font-bold shadow-lg shadow-green-100">
                        Chia sẻ ngay
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default NewsDetail;
