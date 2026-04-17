import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, DatePicker, Select, Divider, Statistic, Skeleton, Empty, Tag } from 'antd';
import { 
  FilePdfOutlined, 
  FileExcelOutlined, 
  CalendarOutlined, 
  FilterOutlined,
  DashboardOutlined,
  BarChartOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  BoxPlotOutlined
} from '@ant-design/icons';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

const Reports = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';

  // Fetch stats data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/reports/dashboard-stats').then(res => res.data.data)
  });

  // Fetch chart data (Pie)
  const { data: pieData, isLoading: pieLoading } = useQuery({
    queryKey: ['journal-status'],
    queryFn: () => api.get('/reports/journal-status').then(res => res.data.data)
  });

  // Fetch timeline data (Area)
  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['activity-timeline'],
    queryFn: () => api.get('/reports/activity-timeline').then(res => res.data.data)
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`BAO CAO CHUOI CUNG UNG EBOOKFARM`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Nguoi xuat: ${user.fullname || user.username}`, 14, 22);
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 27);

    const tableData = pieData?.map(item => [item.name, item.value]) || [];
    
    doc.autoTable({
      head: [['Hang muc', 'So luong']],
      body: [
        ['Tong nhat ky', stats?.totalJournals || 0],
        ['Hoan thanh', stats?.completedJournals || 0],
        ...tableData
      ],
      startY: 35
    });

    doc.save(`Bao_cao_EBookFarm_${new Date().getTime()}.pdf`);
  };

  const exportExcel = () => {
    const data = [
      { 'Hạng mục': 'Tổng số tài khoản', 'Số lượng': stats?.totalUsers || 0 },
      { 'Hạng mục': 'Tổng nhóm/HTX', 'Số lượng': stats?.totalGroups || 0 },
      { 'Hạng mục': 'Tổng nhật ký sản xuất', 'Số lượng': stats?.totalJournals || 0 },
      { 'Hạng mục': 'Nhật ký đã hoàn thành', 'Số lượng': stats?.completedJournals || 0 },
      ... (pieData?.map(item => ({ 'Hạng mục': item.name, 'Số lượng': item.value })) || [])
    ];
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `EBookFarm_Stats_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Hệ thống phân tích dữ liệu</Text>
          <Title level={2} className="!mb-0 flex items-center gap-3">
             <BarChartOutlined className="text-green-500" /> Báo cáo & Thống kê
          </Title>
        </div>
        <Space size={12}>
          <Button 
            icon={<FilePdfOutlined />} 
            onClick={exportPDF}
            className="h-11 rounded-xl border-red-100 text-red-500 hover:bg-red-50 font-bold px-6"
          >
            Xuất PDF
          </Button>
          <Button 
            type="primary" 
            icon={<FileExcelOutlined />} 
            onClick={exportExcel}
            className="h-11 rounded-xl bg-green-600 border-0 hover:bg-green-700 shadow-lg shadow-green-100 font-bold px-6"
          >
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* Stats Cards Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-[32px] hover:-translate-y-1 transition-all overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <FileTextOutlined className="text-6xl text-green-500" />
             </div>
             <Statistic 
                title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Tổng Nhật ký</Text>}
                value={stats?.totalJournals}
                loading={statsLoading}
                prefix={<FileTextOutlined className="text-green-500" />}
                className="stats-value"
             />
             <div className="mt-4 flex items-center gap-2">
                <Tag color="success" className="rounded-full border-0 text-[10px] font-bold">+12%</Tag>
                <Text className="text-[10px] text-gray-400">so với tháng trước</Text>
             </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-[32px] hover:-translate-y-1 transition-all overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <DashboardOutlined className="text-6xl text-blue-500" />
             </div>
             <Statistic 
                title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Hoàn thành</Text>}
                value={stats?.completedJournals}
                loading={statsLoading}
                prefix={<DashboardOutlined className="text-blue-500" />}
             />
             <div className="mt-4 flex items-center gap-2">
                <Text className="text-[10px] text-gray-400 font-bold uppercase">Tỷ lệ:</Text>
                <Text className="text-[10px] text-blue-600 font-bold">
                  {stats?.totalJournals ? Math.round((stats.completedJournals/stats.totalJournals)*100) : 0}%
                </Text>
             </div>
          </Card>
        </Col>

        {isAdmin && (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-[32px] hover:-translate-y-1 transition-all overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <UserOutlined className="text-6xl text-orange-500" />
                 </div>
                 <Statistic 
                    title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Người dùng</Text>}
                    value={stats?.totalUsers}
                    loading={statsLoading}
                    prefix={<UserOutlined className="text-orange-500" />}
                 />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-[32px] hover:-translate-y-1 transition-all overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BoxPlotOutlined className="text-6xl text-purple-500" />
                 </div>
                 <Statistic 
                    title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Tồn kho vật tư</Text>}
                    value={stats?.inventoryCount}
                    loading={statsLoading}
                    prefix={<BoxPlotOutlined className="text-purple-500" />}
                 />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]}>
        {/* Timeline Chart */}
        <Col xs={24} lg={16}>
          <Card 
            bordered={false} 
            className="shadow-xl shadow-gray-100/50 rounded-[32px] overflow-hidden"
            title={
              <div className="flex justify-between items-center py-2">
                <Space>
                  <BarChartOutlined className="text-green-500" />
                  <span className="font-bold">Biến động hoạt động</span>
                  <Tag className="rounded-md border-0 bg-green-50 text-green-600 font-bold ml-2">6 Tháng gần nhất</Tag>
                </Space>
              </div>
            }
          >
            <div className="h-[400px] w-full mt-4">
              {timelineLoading ? (
                <Skeleton active className="mt-8" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorHoatDong" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 500}}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 12}}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#22c55e', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hoat_dong" 
                      stroke="#22c55e" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorHoatDong)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>

        {/* Status Pie Chart */}
        <Col xs={24} lg={8}>
          <Card 
            bordered={false} 
            className="shadow-xl shadow-gray-100/50 rounded-[32px] overflow-hidden h-full"
            title={
              <Space>
                <PieChartOutlined className="text-orange-500" />
                <span className="font-bold">Trạng thái Nhật ký</span>
              </Space>
            }
          >
            <div className="h-[300px] w-full">
              {pieLoading ? (
                <Skeleton.Avatar active size={200} shape="circle" className="mx-auto block mt-10" />
              ) : pieData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      animationBegin={500}
                      animationDuration={1500}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Chưa có dữ liệu trạng thái" className="mt-16" />
              )}
            </div>
            {!pieLoading && pieData?.length > 0 && (
               <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase block mb-4">Ghi chú phân tích</Text>
                  <Text className="text-xs text-gray-600 font-medium leading-relaxed">
                    Hệ thống ghi nhận <Text strong className="text-green-600">{stats?.completedJournals}</Text> nhật ký đã hoàn thành. 
                    Tỷ lệ hoàn thành đang ở mức ổn định, cần đẩy nhanh các bản nháp còn tồn đọng.
                  </Text>
               </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
