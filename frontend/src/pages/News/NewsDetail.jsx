import React, { useState, useEffect } from 'react';
import { Typography, Button, Skeleton, Space, Tag, Divider, Avatar, Row, Col, Affix, message } from 'antd';
import {
    ArrowLeftOutlined,
    ShareAltOutlined,
    HeartOutlined,
    HeartFilled,
    MessageOutlined,
    FacebookFilled,
    TwitterCircleFilled,
    LinkedinFilled,
    CopyOutlined,
    BookOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { getAvatarUrl, getInitialAvatar } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [liked, setLiked] = useState(false);

    const { data: news, isLoading } = useQuery({
        queryKey: ['news', id],
        queryFn: async () => {
            const { data } = await api.get(`/news/${id}`);
            return data.data;
        }
    });

    const { data: relatedNews = [] } = useQuery({
        queryKey: ['related-news', news?.category],
        enabled: !!news?.category,
        queryFn: async () => {
            const { data } = await api.get('/news');
            return data.data.filter(n => n.category === news.category && n._id !== id).slice(0, 3);
        }
    });

    const getFallbackImage = (category) => {
        if (category === 'Công nghệ') return 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80';
        if (category === 'Thị trường') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
        return 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80';
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        message.success('Đã sao chép liên kết tin tức!');
    };

    if (isLoading) {
        return (
            <div className="bg-white min-h-screen pt-12">
                <div className="max-w-4xl mx-auto px-6">
                    <Skeleton active avatar={{ size: 40 }} paragraph={{ rows: 20 }} />
                </div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <Title level={4}>Không tìm thấy tin tức</Title>
                <Button onClick={() => navigate('/news')}>Quay lại danh sách</Button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-['Roboto',_sans-serif] pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10">
                <Row gutter={48}>
                    {/* Left Side: Floating Actions */}
                    <Col xs={0} lg={2}>
                        <Affix offsetTop={100}>
                            <div className="flex flex-col items-center gap-8 py-4">
                                <div className="flex flex-col items-center gap-1 group">
                                    <Button
                                        shape="circle"
                                        size="large"
                                        onClick={() => setLiked(!liked)}
                                        className={`border-0 shadow-sm flex items-center justify-center transition-all ${liked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black'}`}
                                        icon={liked ? <HeartFilled /> : <HeartOutlined />}
                                    />
                                    <Text className="text-xs font-bold text-gray-400 group-hover:text-black">12</Text>
                                </div>
                                <div className="flex flex-col items-center gap-1 group">
                                    <Button
                                        shape="circle"
                                        size="large"
                                        className="border-0 shadow-sm flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black"
                                        icon={<MessageOutlined />}
                                    />
                                    <Text className="text-xs font-bold text-gray-400 group-hover:text-black">4</Text>
                                </div>
                                <Divider className="my-2 border-gray-100" />
                                <Space direction="vertical" size="large">
                                    <FacebookFilled className="text-2xl text-gray-300 hover:text-[#1877F2] cursor-pointer transition-colors" />
                                    <TwitterCircleFilled className="text-2xl text-gray-300 hover:text-[#1DA1F2] cursor-pointer transition-colors" />
                                    <LinkedinFilled className="text-2xl text-gray-300 hover:text-[#0A66C2] cursor-pointer transition-colors" />
                                </Space>
                            </div>
                        </Affix>
                    </Col>

                    {/* Middle: Article Content */}
                    <Col xs={24} lg={15}>
                        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Breadcrumb replacement */}
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/news')}
                                className="text-gray-500 hover:text-green-600 font-bold p-0 mb-8"
                            >
                                DANH SÁCH TIN TỨC
                            </Button>

                            <Title className="!text-[#292929] !font-black !mb-8 leading-[1.2] !text-3xl md:!text-5xl tracking-tight">
                                {news.title}
                            </Title>

                            {/* Author Box */}
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        size={48}
                                        src={typeof news.author === 'object' ? getAvatarUrl(news.author?.avatar) : null}
                                        style={{ backgroundColor: '#16a34a', fontSize: 18, fontWeight: 700 }}
                                        className="border-2 border-white shadow-sm flex-shrink-0"
                                    >
                                        {typeof news.author === 'object'
                                            ? (!news.author?.avatar && getInitialAvatar(news.author?.fullname || news.author?.username))
                                            : 'E'
                                        }
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <Text className="font-bold text-[#292929]">{(typeof news.author === 'object' ? (news.author.fullname || news.author.username) : news.author) || 'EBookFarm Editor'}</Text>
                                        <Text className="text-gray-500 text-xs">{dayjs(news.publishedAt).format('DD [tháng] MM, YYYY')} • 6 phút đọc</Text>
                                    </div>
                                </div>
                                <Space>
                                    <BookOutlined className="text-gray-400 hover:text-black cursor-pointer" />
                                    <MoreOutlined className="text-gray-400 hover:text-black cursor-pointer" />
                                </Space>
                            </div>

                            {/* Content */}
                            <div className="space-y-8 text-[#292929]">
                                <Paragraph className="text-xl font-bold italic leading-relaxed border-l-4 border-green-500 pl-6 bg-green-50/30 py-8 rounded-[24px]">
                                    {news.summary}
                                </Paragraph>

                                <div className="rounded-[32px] overflow-hidden shadow-sm mb-12 border border-gray-100">
                                    <img
                                        src={news.image || getFallbackImage(news.category)}
                                        alt={news.title}
                                        className="w-full h-auto object-cover max-h-[500px]"
                                    />
                                    <div className="bg-gray-50 p-6 text-center text-gray-500 text-sm italic">
                                        Hình ảnh minh họa cho {news.title}
                                    </div>
                                </div>

                                <div className="prose prose-lg max-w-none text-[#292929] leading-[1.8] text-lg">
                                    {news.content ? (
                                        news.content.split('\n').map((paragraph, index) => (
                                            <Paragraph key={index} className="mb-8 last:mb-0">
                                                {paragraph}
                                            </Paragraph>
                                        ))
                                    ) : (
                                        <Paragraph className="italic text-gray-400">Nội dung tin tức đang được cập nhật...</Paragraph>
                                    )}
                                </div>
                            </div>

                            {/* Tags Section */}
                            <div className="mt-16 flex flex-wrap gap-2">
                                <Tag className="rounded-full bg-gray-100 border-0 text-[#505050] font-bold px-4 py-1 m-0">#nongnghiepsach</Tag>
                                <Tag className="rounded-full bg-gray-100 border-0 text-[#505050] font-bold px-4 py-1 m-0">#congngheso</Tag>
                                <Tag className="rounded-full bg-gray-100 border-0 text-[#505050] font-bold px-4 py-1 m-0">#{news.category?.toLowerCase()}</Tag>
                            </div>

                            {/* Reaction Section */}
                            <div className="mt-12 p-10 rounded-[32px] bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <Title level={4} className="!mb-0 !text-[#292929]">Bạn thấy hữu ích?</Title>
                                    <Button
                                        size="large"
                                        className={`rounded-full flex items-center gap-2 font-bold px-6 ${liked ? 'bg-red-500 text-white border-red-500' : 'bg-white border-gray-200'}`}
                                        onClick={() => setLiked(!liked)}
                                        icon={liked ? <HeartFilled /> : <HeartOutlined />}
                                    >
                                        {liked ? 'Đã thích' : 'Thích tin tức'}
                                    </Button>
                                </div>
                                <Space size="middle">
                                    <Button shape="circle" size="large" icon={<ShareAltOutlined />} className="hover:text-green-600" />
                                    <Button shape="circle" size="large" icon={<CopyOutlined />} onClick={copyToClipboard} className="hover:text-green-600" />
                                </Space>
                            </div>
                        </article>
                    </Col>

                    {/* Right Side: Sidebar */}
                    <Col xs={0} lg={7}>
                        <div className="sticky top-10 space-y-12 pl-6">
                            {/* Table of Contents Placeholder */}
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                <Title level={5} className="!text-[#292929] !font-black !text-xs !uppercase !tracking-widest !mb-4">NỘI DUNG CHÍNH</Title>
                                <div className="space-y-4 text-sm text-gray-500 font-medium">
                                    <div className="hover:text-green-600 cursor-pointer transition-colors border-l-2 border-green-500 pl-4 text-green-600">1. Giới thiệu tổng quan</div>
                                    <div className="hover:text-green-600 cursor-pointer transition-colors pl-4">2. Các giải pháp công nghệ</div>
                                    <div className="hover:text-green-600 cursor-pointer transition-colors pl-4">3. Hiệu quả thực tiễn</div>
                                    <div className="hover:text-green-600 cursor-pointer transition-colors pl-4">4. Kết luận & Khuyến nghị</div>
                                </div>
                            </div>

                            {/* Related Posts */}
                            <div>
                                <Title level={5} className="!text-[#292929] !font-black !text-xs !uppercase !tracking-widest !mb-6">TIN TỨC LIÊN QUAN</Title>
                                <div className="space-y-8">
                                    {relatedNews.length > 0 ? relatedNews.map((n, idx) => (
                                        <div key={idx} className="group cursor-pointer" onClick={() => navigate(`/news/${n._id}`)}>
                                            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3">
                                                <img src={n.image || getFallbackImage(n.category)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <Title level={5} className="!text-[#292929] !font-bold !text-sm group-hover:text-green-600 transition-colors line-clamp-2 leading-snug">
                                                {n.title}
                                            </Title>
                                            <Text className="text-gray-400 text-xs uppercase font-black">{dayjs(n.publishedAt).format('MMMM DD, YYYY')}</Text>
                                        </div>
                                    )) : <Text className="italic text-gray-400">Không có tin tức liên quan</Text>}
                                </div>
                            </div>

                            {/* Newsletter / CTA */}
                            <div className="bg-[#1a1a1a] p-10 rounded-[32px] text-white shadow-xl">
                                <Title level={4} className="!text-white !font-black !mb-4">Đăng ký bản tin</Title>
                                <Paragraph className="text-gray-400 text-sm mb-6 leading-relaxed">Nhận thông báo về các tin tức công nghệ mới nhất từ chúng tôi.</Paragraph>
                                <Button type="primary" size="large" className="w-full bg-green-600 border-0 font-black rounded-full h-12 hover:scale-105 transition-transform" onClick={() => navigate('/register')}>Đăng ký ngay</Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default NewsDetail;

