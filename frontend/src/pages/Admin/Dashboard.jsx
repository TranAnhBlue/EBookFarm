import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Col, Row, Typography, Space, Button, Badge, Skeleton } from 'antd';
import { CloudOutlined, ArrowRightOutlined, CompassOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Leaf, PawPrint, Fish, Settings, Link as LinkIcon, Package, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import 'moment/locale/vi';
import { useAuthStore } from '../../store/authStore';

moment.locale('vi');

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [coords, setCoords] = useState(null);

  // Get Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setCoords({ lat: 21.0285, lon: 105.8542 }) // Fallback Hanoi
      );
    } else {
      setCoords({ lat: 21.0285, lon: 105.8542 });
    }
  }, []);

  // Fetch Weather with coordinates
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather', coords],
    queryFn: async () => {
      if (!coords) return null;
      const { data } = await axios.get(`https://wttr.in/${coords.lat},${coords.lon}?format=j1`);
      return data;
    },
    enabled: !!coords
  });

  const getWeatherIcon = (code) => {
    // Basic mapping for wttr.in WWO codes
    const sunCodes = ['113'];
    const partCloudCodes = ['116', '119', '122'];
    const rainCodes = ['263', '266', '293', '296', '299', '302', '305', '308', '353', '356', '359'];
    
    if (sunCodes.includes(code)) return <Sun className="w-12 h-12 text-yellow-500 relative z-10" />;
    if (rainCodes.includes(code)) return <CloudRain className="w-12 h-12 text-blue-400 relative z-10" />;
    return <CloudOutlined className="text-7xl text-blue-400 relative z-10" />;
  };

  const translateCondition = (text) => {
    const dict = {
      'Sunny': 'Trời Nắng',
      'Clear': 'Trời Quang',
      'Partly cloudy': 'Nhiều Mây',
      'Cloudy': 'Có Mây',
      'Overcast': 'U Ám',
      'Light rain': 'Mưa Nhẹ',
      'Patchy rain possible': 'Có Thể Có Mưa',
      'Heavy rain': 'Mưa Lớn'
    };
    return dict[text] || text;
  };

  const current = weather?.current_condition?.[0];
  const area = weather?.nearest_area?.[0];
  const forecast = weather?.weather || [];

  const quickAccessItems = [
    { title: 'VietGAP trồng trọt', icon: <Leaf className="w-8 h-8" />, path: '/vietgap/trong-trot', color: '#22c55e' },
    { title: 'VietGAP chăn nuôi', icon: <PawPrint className="w-8 h-8" />, path: '/vietgap/chan-nuoi', color: '#10b981' },
    { title: 'VietGAP thủy sản', icon: <Fish className="w-8 h-8" />, path: '/vietgap/thuy-san', color: '#06b6d4' },
    { title: 'Quy trình sản xuất', icon: <Settings className="w-8 h-8" />, path: '/form-builder', color: '#6366f1' },
    { title: 'Liên kết chuỗi', icon: <LinkIcon className="w-8 h-8" />, path: '/link', color: '#f59e0b' },
    { title: 'Tồn kho', icon: <Package className="w-8 h-8" />, path: '/inventory', color: '#ec4899' },
  ];

  const newsItems = [
    {
      title: 'Hợp tác xã Krông Pắc đẩy mạnh xuất khẩu sầu riêng sang thị trường Trung Quốc',
      description: 'Nhờ áp dụng nhật ký canh tác điện tử EBookFarm, các hộ nông dân tại Krông Pắc đã kiểm soát tốt quy trình VietGAP, giúp nâng cao giá trị thương phẩm...',
      date: 'Hôm nay, 10:24',
      image: 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Sản xuất'
    },
    {
      title: 'Xu hướng nông nghiệp thông minh: Chuyển đổi số trong quản lý trang trại',
      description: 'Chuyên gia nông nghiệp nhận định việc quản lý dữ liệu realtime giúp giảm thiểu rủi ro dịch bệnh đến 30% và tiết kiệm 20% chi phí vật tư nông nghiệp...',
      date: '16/04/2026',
      image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Công nghệ'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Top Welcome Section */}
      <div className="flex justify-between items-end mb-2">
        <div className="space-y-1">
          <Title level={4} className="!mb-0 !text-gray-400 font-medium uppercase tracking-widest text-xs">Tổng quan hệ thống</Title>
          <Title level={2} className="!mb-0">Chào bạn, <span className="text-green-600">{user?.fullname || user?.username || 'Thành viên'}</span>! 👋</Title>
          <Text className="text-gray-500 font-medium">Hôm nay là {moment().format('dddd, [ngày] D [tháng] M [năm] YYYY')}</Text>
        </div>
        <Button icon={<CompassOutlined />} className="rounded-xl font-bold border-gray-200 text-gray-600 hover:text-green-600">Khám phá module</Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Weather Card */}
        <Col xs={24} lg={11}>
          <Card bordered={false} className="weather-gradient h-full !p-2">
            {weatherLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <>
                <div className="flex justify-between items-start mb-10">
                  <Badge 
                    status="processing" 
                    color="#22c55e" 
                    text={<span className="font-bold text-gray-800 uppercase tracking-tight text-xs">Thời tiết {area?.areaName?.[0]?.value || 'Hà Nội'}</span>} 
                  />
                  <Text className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">Real-time</Text>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                       <div className="absolute -inset-4 bg-yellow-200/40 blur-2xl rounded-full animate-pulse"></div>
                       {getWeatherIcon(current?.weatherCode)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-7xl font-bold tracking-tighter text-gray-900 leading-none">{current?.temp_C || '--'}°</span>
                      <span className="text-lg text-gray-800 font-bold ml-1">{translateCondition(current?.weatherDesc?.[0]?.value) || 'Có Mây'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white space-y-3 min-w-[140px]">
                    <div className="flex justify-between items-center gap-4">
                      <Text className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1"><Droplets className="w-3 h-3" /> Độ ẩm</Text>
                      <Text className="text-gray-800 font-bold">{current?.humidity}%</Text>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <Text className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1"><CloudRain className="w-3 h-3" /> Mưa</Text>
                      <Text className="text-gray-800 font-bold">{current?.precipMM}mm</Text>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                       <Text className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1"><Wind className="w-3 h-3" /> Gió</Text>
                       <Text className="text-gray-800 font-bold text-xs uppercase">{current?.windspeedKmph}km/h</Text>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex items-center justify-between pt-4 border-t border-gray-100">
                   <Space size={20}>
                      {forecast.slice(1, 3).map((day, idx) => (
                        <React.Fragment key={idx}>
                          <div className="flex flex-col items-center">
                            <Text className="text-[10px] text-gray-400 font-bold uppercase">{idx === 0 ? 'Ngày mai' : moment(day.date).format('dddd')}</Text>
                            {getWeatherIcon(day.hourly?.[4]?.weatherCode)}
                            <Text className="text-xs font-bold">{day.maxtempC}°</Text>
                          </div>
                          {idx === 0 && <div className="w-[1px] h-8 bg-gray-100 mx-2"></div>}
                        </React.Fragment>
                      ))}
                   </Space>
                   <Button type="text" className="text-green-600 font-bold text-xs p-0 flex items-center gap-1">Chi tiết địa phương <GlobalOutlined className="text-[10px]" /></Button>
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Quick Access Card */}
        <Col xs={24} lg={13}>
          <Card bordered={false} className="h-full !p-2">
            <div className="flex justify-between items-center mb-10">
                <Title level={5} className="!mb-0 !text-gray-800">Truy cập nhanh</Title>
                <Text className="text-xs text-gray-400 font-medium">Click để chuyển module</Text>
            </div>
            <div className="grid grid-cols-3 gap-y-12 gap-x-6">
              {quickAccessItems.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 mb-4 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[13px] font-bold text-gray-700 group-hover:text-green-600 transition-colors leading-tight">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* News Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <Title level={4} className="!mb-0 !text-gray-800 font-bold">Tin tức hệ thống</Title>
          <Button type="link" className="text-green-600 font-bold p-0">Tất cả bài viết <ArrowRightOutlined /></Button>
        </div>
        
        <Row gutter={[24, 24]}>
          {newsItems.map((news, index) => (
            <Col xs={24} md={12} key={index}>
              <div className="group flex flex-col sm:flex-row border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-green-100 transition-all cursor-pointer bg-white h-auto sm:h-60">
                <div className="w-full sm:w-2/5 shrink-0 relative overflow-hidden">
                  <img 
                    src={news.image} 
                    alt="News" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 left-4 bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm uppercase tracking-widest">
                    {news.category}
                  </div>
                </div>
                <div className="w-full sm:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <Text className="text-xs text-gray-400 font-bold mb-2 block">{news.date}</Text>
                    <Title level={5} className="!text-gray-900 !mb-3 group-hover:text-green-600 transition-colors line-clamp-2 leading-snug">
                        {news.title}
                    </Title>
                    <Paragraph className="text-gray-500 text-sm line-clamp-3 !mb-0 font-medium">
                        {news.description}
                    </Paragraph>
                  </div>
                  <div className="flex justify-end pt-4">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all transform rotate-[-45deg] group-hover:rotate-0">
                      <ArrowRightOutlined />
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
      
    </div>
  );
};

export default Dashboard;
