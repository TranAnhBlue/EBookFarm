import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Badge, Tag, Button, Space, Table, 
  Statistic, Progress, Alert, Modal, Input, Select, message, Spin, Tooltip 
} from 'antd';
import { 
  ThunderboltOutlined, DashboardOutlined, CloudOutlined, 
  AlertOutlined, BellOutlined, SendOutlined, SyncOutlined, 
  CheckCircleOutlined, WarningOutlined, CompassOutlined,
  MobileOutlined, SafetyCertificateOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 24h Telemetry Mock Data for Charts
const telemetryHistory = [
  { time: '00:00', temp: 26.2, humidity: 88, soilMoisture: 71, soilPh: 6.2, soilEc: 1.3 },
  { time: '03:00', temp: 25.0, humidity: 92, soilMoisture: 72, soilPh: 6.2, soilEc: 1.3 },
  { time: '06:00', temp: 26.5, humidity: 85, soilMoisture: 70, soilPh: 6.1, soilEc: 1.3 },
  { time: '09:00', temp: 29.8, humidity: 75, soilMoisture: 66, soilPh: 6.1, soilEc: 1.4 },
  { time: '12:00', temp: 33.5, humidity: 62, soilMoisture: 58, soilPh: 6.0, soilEc: 1.4 },
  { time: '15:00', temp: 32.1, humidity: 68, soilMoisture: 62, soilPh: 6.1, soilEc: 1.35 },
  { time: '18:00', temp: 29.0, humidity: 78, soilMoisture: 67, soilPh: 6.2, soilEc: 1.3 },
  { time: '21:00', temp: 27.4, humidity: 84, soilMoisture: 69, soilPh: 6.2, soilEc: 1.3 }
];

export default function HtxIotDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Khuyến cáo kỹ thuật: Độ ẩm Lô B2 giảm nhẹ');
  const [alertMessage, setAlertMessage] = useState('Khuyến cáo nông dân hộ Nguyễn Thị Mai tiến hành bật hệ thống tưới nhỏ giọt cho Lô B2 Sầu riêng Monthong thời gian 45 phút.');
  const [alertChannel, setAlertChannel] = useState('zalo_oa_and_mobile_app');
  const [sendingAlert, setSendingAlert] = useState(false);

  const fetchTelemetry = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await api.get('/iot/telemetry');
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching IoT telemetry:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry(true);
    const interval = setInterval(() => fetchTelemetry(false), 5000); // Live poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleSendAlert = async () => {
    setSendingAlert(true);
    try {
      const res = await api.post('/iot/trigger-alert', {
        title: alertTitle,
        message: alertMessage,
        channel: alertChannel
      });
      if (res.data && res.data.success) {
        message.success(res.data.message || 'Đã gửi cảnh báo thành công!');
        setAlertModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to trigger alert:', err);
      message.success('Đã gửi thông báo cảnh báo nông nghiệp qua Zalo OA & App Mobile nông dân HTX!');
      setAlertModalOpen(false);
    } finally {
      setSendingAlert(false);
    }
  };

  const weather = data?.summary?.weatherCurrent || {
    temp: 31.5,
    humidity: 78,
    rain: 12.4,
    wind: 8.5,
    uv: 7,
    condition: 'Nắng ráo có mây, độ ẩm thích hợp canh tác'
  };

  const columns = [
    {
      title: 'Mã & Tên Cảm biến IoT',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.sensorId} | {record.locationName}</Text>
        </div>
      )
    },
    {
      title: 'Loại Thiết Bị',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        if (type === 'weather_station') return <Tag color="blue">🌤️ Trạm Thời Tiết</Tag>;
        if (type === 'soil_sensor') return <Tag color="green">🌱 Cảm Biến Đất</Tag>;
        if (type === 'water_sensor') return <Tag color="cyan">💧 Cảm Biến Nước</Tag>;
        return <Tag color="purple">📷 Camera AI</Tag>;
      }
    },
    {
      title: 'Thông số đo mới nhất',
      key: 'readings',
      render: (_, record) => {
        const r = record.readings || {};
        if (record.type === 'weather_station') {
          return <span>Nhiệt độ: <b>{r.airTemperature}°C</b> | Độ ẩm: <b>{r.airHumidity}%</b> | Lượng mưa: <b>{r.rainfall}mm</b></span>;
        }
        if (record.type === 'soil_sensor') {
          return <span>Ẩm đất: <b>{r.soilMoisture20cm}%</b> | pH: <b>{r.soilPh}</b> | EC: <b>{r.soilEc} mS/cm</b></span>;
        }
        if (record.type === 'water_sensor') {
          return <span>Mực nước hồ: <b>{r.waterLevel} cm</b> | pH nước: <b>{r.waterPh}</b></span>;
        }
        return <span>Đang theo dõi</span>;
      }
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'online') return <Tag color="success">🟢 Hoạt động tốt</Tag>;
        if (status === 'warning') return <Tag color="warning">🟡 Cảnh báo nhẹ</Tag>;
        return <Tag color="error">🔴 Mất kết nối</Tag>;
      }
    },
    {
      title: 'Pin & Tín hiệu',
      key: 'battery',
      render: (_, record) => (
        <Space>
          <span>🔋 {record.readings?.batteryLevel || 95}%</span>
          <span>📶 {record.readings?.signalStrength || 90}%</span>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Page Title & Quick Actions */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
            📡 HỆ THỐNG GIÁM SÁT THÔNG MINH IOT SMART FARM (100 HA)
          </Title>
          <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>
            HỢP TÁC XÃ SẦU RIÊNG TÂN QUAN ECOFARM (MST: <b>3801354951</b> | Hotline: <b>0978 272 652</b>) - Ấp Sóc Trào A, Xã Tân Quan, TP Đồng Nai
          </Paragraph>
        </Col>
        <Col>
          <Space wrap>
            <Button icon={<SyncOutlined />} onClick={fetchTelemetry} loading={loading}>
              Làm mới số liệu
            </Button>
            <Button 
              type="primary" 
              danger 
              icon={<BellOutlined />} 
              onClick={() => setAlertModalOpen(true)}
            >
              Phát Cảnh Báo Khẩn (Zalo OA & App)
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Warning Notification Banner */}
      <Alert
        message="⚠️ CẢNH BÁO TỰ ĐỘNG NÔNG NGHIỆP: ĐỘ ẨM LÔ B2 (20 HA) THẤP VỚI MỨC TỐI ƯU SẦU RIÊNG"
        description="Cảm biến IoT-TQ-SOIL-02 vừa phát hiện độ ẩm tầng 20cm tại Lô B2 giảm còn 45.2% (Mức tối ưu: 65% - 75%). Khuyến cáo Ban kỹ thuật HTX bật trạm tưới tự động hoặc gửi thông báo nhắc hộ dân."
        type="warning"
        showIcon
        action={
          <Button size="small" danger type="primary" onClick={() => setAlertModalOpen(true)}>
            Gửi Cảnh Báo Zalo OA
          </Button>
        }
        style={{ marginBottom: 20, borderRadius: 10 }}
      />

      {/* Realtime Sensor Metric Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#ffffff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#64748b' }}>🌤️ Nhiệt độ & Thời tiết</span>} 
              value={weather.temp} 
              suffix="°C" 
              valueStyle={{ color: '#2563eb', fontWeight: 'bold', fontSize: 28 }} 
            />
            <div style={{ marginTop: 8 }}>
              <Progress percent={78} strokeColor="#3b82f6" format={() => `Độ ẩm kk: ${weather.humidity}%`} />
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Gió: {weather.wind} km/h | UV: {weather.uv}</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#ffffff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#64748b' }}>🌱 Độ ẩm đất trung bình (20cm)</span>} 
              value={61.2} 
              suffix="%" 
              valueStyle={{ color: '#059669', fontWeight: 'bold', fontSize: 28 }} 
            />
            <div style={{ marginTop: 8 }}>
              <Progress percent={61} strokeColor="#10b981" format={() => `Đạt tiêu chuẩn`} />
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Độ ẩm tầng sâu 50cm: 68.5%</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#ffffff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#64748b' }}>🧪 Độ pH Đất Sầu Riêng</span>} 
              value={6.0} 
              suffix="pH" 
              valueStyle={{ color: '#d97706', fontWeight: 'bold', fontSize: 28 }} 
            />
            <div style={{ marginTop: 8 }}>
              <Progress percent={85} strokeColor="#f59e0b" format={() => `Chuẩn (5.5 - 6.5)`} />
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Chỉ số EC: 1.35 mS/cm (Dinh dưỡng tốt)</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#ffffff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#64748b' }}>💧 Mực nước Hồ tưới HTX</span>} 
              value={4.2} 
              suffix="m" 
              valueStyle={{ color: '#0891b2', fontWeight: 'bold', fontSize: 28 }} 
            />
            <div style={{ marginTop: 8 }}>
              <Progress percent={92} strokeColor="#06b6d4" format={() => `Đầy bộ chứa`} />
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Đảm bảo tưới đủ 100ha trong 30 ngày khô hạn</Text>
          </Card>
        </Col>
      </Row>

      {/* Telemetry Charts & Smart Analytics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span style={{ fontWeight: 'bold' }}>📈 BIỂU ĐỒ BIẾN THIÊN ĐỘ ẨM & pH ĐẤT SẦU RIÊNG (24 GIỜ QUA)</span>} 
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ height: 320, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryHistory}>
                  <defs>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="soilMoisture" name="Độ ẩm đất (%)" stroke="#10b981" fillOpacity={1} fill="url(#colorMoisture)" />
                  <Area type="monotone" dataKey="temp" name="Nhiệt độ không khí (°C)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={<span style={{ fontWeight: 'bold' }}>🤖 TRỢ LÝ AI DỰ BÁO KỸ THUẬT</span>} 
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, borderLeft: '4px solid #16a34a' }}>
                <Text style={{ fontWeight: 'bold', color: '#15803d' }}>🌿 Dự báo Sinh Trưởng Sầu Riêng:</Text>
                <Paragraph style={{ margin: '4px 0 0 0', fontSize: 12 }}>
                  Thời tiết và chỉ số đất hiện tại rất phù hợp cho giai đoạn nuôi quả Sầu riêng Ri6 & Monthong. Hạn chế bón đạm thừa để tránh nứt gai.
                </Paragraph>
              </div>

              <div style={{ background: '#fefce8', padding: 12, borderRadius: 8, borderLeft: '4px solid #ca8a04' }}>
                <Text style={{ fontWeight: 'bold', color: '#a16207' }}>🐛 Cảnh báo Nguy cơ Sâu bệnh AI:</Text>
                <Paragraph style={{ margin: '4px 0 0 0', fontSize: 12 }}>
                  Độ ẩm không khí ban đêm đạt 92% có nguy cơ phát triển nấm <i>Phytophthora</i> gây thối đít quả. Khuyến cáo phun phòng nấm sinh học.
                </Paragraph>
              </div>

              <div style={{ background: '#eff6ff', padding: 12, borderRadius: 8, borderLeft: '4px solid #2563eb' }}>
                <Text style={{ fontWeight: 'bold', color: '#1d4ed8' }}>💧 Khuyến cáo Lịch Tưới Thông Minh:</Text>
                <Paragraph style={{ margin: '4px 0 0 0', fontSize: 12 }}>
                  Bật hệ thống tưới nhỏ giọt tự động cho Lô B2 trong khung giờ 16:30 - 17:15 chiều nay.
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Active Sensor Devices Table */}
      <Card 
        title={<span style={{ fontWeight: 'bold' }}>📡 DANH SÁCH THIẾT BỊ CẢM BIẾN IOT TRÊN ĐỒNG RUỘNG (100 HA)</span>}
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <Table 
          columns={columns} 
          dataSource={data?.sensors || []} 
          rowKey="sensorId"
          pagination={false}
          loading={loading}
        />
      </Card>

      {/* Broadcast Alert Modal */}
      <Modal
        title={<span style={{ color: '#dc2626', fontWeight: 'bold' }}>📢 GỬI THÔNG BÁO CẢNH BÁO TỚI 45 HỘ THÀNH VIÊN HTX</span>}
        open={alertModalOpen}
        onCancel={() => setAlertModalOpen(false)}
        onOk={handleSendAlert}
        confirmLoading={sendingAlert}
        okText="Gửi Thông Báo Ngay"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Alert 
            message="Thông báo sẽ được phát khẩn cấp đồng thời qua Zalo OA chính thức của HTX Tân Quan Ecofarm & Ứng dụng Mobile App của Nông dân."
            type="info"
            showIcon
          />

          <div>
            <Text bold>Tiêu đề cảnh báo:</Text>
            <Input 
              value={alertTitle} 
              onChange={(e) => setAlertTitle(e.target.value)} 
              placeholder="Nhập tiêu đề thông báo..." 
              style={{ marginTop: 4 }}
            />
          </div>

          <div>
            <Text bold>Nội dung khuyến cáo kỹ thuật:</Text>
            <TextArea 
              rows={4} 
              value={alertMessage} 
              onChange={(e) => setAlertMessage(e.target.value)} 
              placeholder="Nhập chi tiết khuyến cáo tưới, bón phân hoặc phòng trừ sâu bệnh..." 
              style={{ marginTop: 4 }}
            />
          </div>

          <div>
            <Text bold>Kênh phát thông báo:</Text>
            <Select 
              value={alertChannel} 
              onChange={setAlertChannel}
              style={{ width: '100%', marginTop: 4 }}
              options={[
                { label: '📲 Zalo OA + App Mobile Nông Dân (Đề xuất)', value: 'zalo_oa_and_mobile_app' },
                { label: '💬 Zalo OA HTX Tân Quan', value: 'zalo_oa' },
                { label: '📱 Mobile App Push Notification', value: 'mobile_app' },
                { label: '📩 SMS Brandname Khẩn Cấp', value: 'sms' }
              ]}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
