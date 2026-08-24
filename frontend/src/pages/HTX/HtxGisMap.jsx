import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, Row, Col, Typography, Badge, Tag, Button, Space, Drawer, 
  Table, Tooltip, Switch, Statistic, Select, Alert, Modal, message 
} from 'antd';
import { 
  EnvironmentOutlined, EyeOutlined, FilterOutlined, 
  ThunderboltOutlined, CheckCircleOutlined, WarningOutlined, 
  SyncOutlined, FileTextOutlined, CloudDownloadOutlined, InfoCircleOutlined,
  CompassOutlined, DashboardOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

export default function HtxGisMap() {
  const [loading, setLoading] = useState(true);
  const [gisData, setGisData] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState('satellite'); // satellite, standard
  const [showPestLayer, setShowPestLayer] = useState(true);
  const [showIrrigationLayer, setShowIrrigationLayer] = useState(true);
  const [showYieldLayer, setShowYieldLayer] = useState(true);
  const [selectedVariety, setSelectedVariety] = useState('ALL');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Fetch GIS Data from Backend API
  const fetchGisData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/iot/gis-data');
      if (res.data && res.data.data) {
        setGisData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load GIS data:', err);
      message.error('Không thể kết nối máy chủ GIS, đang hiển thị dữ liệu bộ nhớ đệm HTX Tân Quan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGisData();
  }, []);

  // Dynamically load Leaflet CSS & JS
  useEffect(() => {
    // Inject Leaflet CSS if not existing
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    const loadLeafletScript = () => {
      if (window.L) {
        initMap();
        return;
      }
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        initMap();
      };
      document.body.appendChild(script);
    };

    loadLeafletScript();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, gisData]);

  // Re-render map layers when layer states change
  useEffect(() => {
    if (mapInstanceRef.current && window.L && gisData) {
      renderParcelsOnMap();
    }
  }, [activeLayer, showPestLayer, showIrrigationLayer, showYieldLayer, selectedVariety, gisData]);

  const initMap = () => {
    if (!mapContainerRef.current || mapInstanceRef.current || !window.L || !gisData) return;

    const L = window.L;
    const center = gisData.htxInfo.center;

    // Create Leaflet Map Instance
    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: true
    });

    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    renderParcelsOnMap();
  };

  const renderParcelsOnMap = () => {
    const L = window.L;
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!L || !map || !layerGroup || !gisData) return;

    layerGroup.clearLayers();

    // Tile Layer: Satellite (Esri) vs Standard (OpenStreetMap)
    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = 'Tiles &copy; Esri &mdash; HTX Tân Quan Ecofarm GIS';

    if (activeLayer === 'standard') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(layerGroup);

    // Filter parcels by variety
    const filteredParcels = gisData.parcels.filter(p => {
      if (selectedVariety === 'ALL') return true;
      return p.cropVariety.toLowerCase().includes(selectedVariety.toLowerCase());
    });

    // Color code parcels by health / pest risk
    filteredParcels.forEach((parcel) => {
      let fillColor = '#10B981'; // Emerald Green
      let strokeColor = '#059669';

      if (parcel.pestRisk === 'Trung bình') {
        fillColor = '#F59E0B'; // Amber
        strokeColor = '#D97706';
      } else if (parcel.pestRisk === 'Cao') {
        fillColor = '#EF4444'; // Red
        strokeColor = '#DC2626';
      }

      const polygonCoords = parcel.polygon.map(coord => [coord.lat, coord.lng]);

      // Polygon outline for 100ha plot
      const polygon = L.polygon(polygonCoords, {
        color: strokeColor,
        weight: 3,
        fillColor: fillColor,
        fillOpacity: 0.45
      }).addTo(layerGroup);

      // Popup on click
      const popupContent = `
        <div style="font-family: Roboto, sans-serif; padding: 4px; max-width: 240px;">
          <h4 style="margin: 0 0 6px 0; color: #15803d; font-size: 14px; font-weight: bold;">
            🌿 ${parcel.name}
          </h4>
          <p style="margin: 2px 0; font-size: 12px;"><b>Hộ thành viên:</b> ${parcel.farmerName}</p>
          <p style="margin: 2px 0; font-size: 12px;"><b>Mã MSVT:</b> <span style="background: #e0f2fe; padding: 2px 4px; borderRadius: 4px; color: #0369a1;">${parcel.code}</span></p>
          <p style="margin: 2px 0; font-size: 12px;"><b>Giống:</b> ${parcel.cropVariety}</p>
          <p style="margin: 2px 0; font-size: 12px;"><b>Diện tích:</b> ${parcel.areaHa} ha (${parcel.treeCount} cây)</p>
          <p style="margin: 2px 0; font-size: 12px;"><b>Độ ẩm đất:</b> ${parcel.moistureLevel} | <b>pH:</b> ${parcel.soilPh}</p>
          <p style="margin: 2px 0; font-size: 12px;"><b>Dự báo sản lượng:</b> ${parcel.yieldEstTons} Tấn</p>
          <button id="btn-parcel-${parcel.id}" style="margin-top: 8px; width: 100%; background: #1677ff; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            🔍 Xem chi tiết lô đất
          </button>
        </div>
      `;

      polygon.bindPopup(popupContent);

      polygon.on('popupopen', () => {
        const btn = document.getElementById(`btn-parcel-${parcel.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedParcel(parcel);
            setDrawerOpen(true);
          };
        }
      });

      // Add center Marker with label
      const bounds = polygon.getBounds();
      const centerMarker = bounds.getCenter();

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background: rgba(15, 23, 42, 0.85); color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; border: 1.5px solid white; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            📍 ${parcel.code.split('-').pop()} (${parcel.areaHa}ha)
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 12]
      });

      L.marker(centerMarker, { icon: customIcon }).addTo(layerGroup);
    });

    // Boundary for overall 100ha HTX Region
    const outerBoundary = [
      [11.6480, 106.9070],
      [11.6485, 106.9220],
      [11.6355, 106.9225],
      [11.6350, 106.9065]
    ];

    L.polygon(outerBoundary, {
      color: '#2563EB',
      weight: 2,
      dashArray: '6, 6',
      fill: false
    }).addTo(layerGroup);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Banner */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
            🗺️ BẢN ĐỒ SỐ GIS VÙNG TRỒNG SẦU RIÊNG 100 HA
          </Title>
          <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>
            HỢP TÁC XÃ SẦU RIÊNG TÂN QUAN ECOFARM (MST: <b>3801354951</b>) - Ấp Sóc Trào A, Xã Tân Quan, TP Đồng Nai, Việt Nam
          </Paragraph>
        </Col>
        <Col>
          <Space wrap>
            <Tag color="green" style={{ fontSize: 13, padding: '4px 10px' }}>
              <CheckCircleOutlined /> Đạt chuẩn MSVT & VietGAP
            </Tag>
            <Button icon={<SyncOutlined />} onClick={fetchGisData} loading={loading}>
              Làm mới GIS
            </Button>
            <Button type="primary" icon={<CloudDownloadOutlined />} onClick={() => message.success('Đã xuất báo cáo tọa độ GPS và bản đồ vùng trồng 100ha!')}>
              Xuất Báo Cáo GIS (PDF)
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#fff', borderRadius: 12 }}>
            <Statistic title={<span style={{ color: '#a7f3d0' }}>Tổng diện tích số hóa</span>} value={100} suffix="ha" valueStyle={{ color: '#fff', fontWeight: 'bold' }} />
            <Text style={{ color: '#d1fae5', fontSize: 12 }}>4 Lô chính - 45 Hộ thành viên</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', color: '#fff', borderRadius: 12 }}>
            <Statistic title={<span style={{ color: '#bfdbfe' }}>Tổng số cây Sầu riêng</span>} value={15000} suffix="gốc" valueStyle={{ color: '#fff', fontWeight: 'bold' }} />
            <Text style={{ color: '#dbeafe', fontSize: 12 }}>Ri6 (50%), Monthong (40%), Musang King (10%)</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #854d0e 0%, #a16207 100%)', color: '#fff', borderRadius: 12 }}>
            <Statistic title={<span style={{ color: '#fef08a' }}>Dự báo sản lượng vĩnh cửu</span>} value={1400} suffix="Tấn/năm" valueStyle={{ color: '#fff', fontWeight: 'bold' }} />
            <Text style={{ color: '#fef9c3', fontSize: 12 }}>Ước tính doanh thu ~ 112 Tỷ VNĐ</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)', color: '#fff', borderRadius: 12 }}>
            <Statistic title={<span style={{ color: '#c7d2fe' }}>Cảm biến IoT kết nối</span>} value={4} suffix="Trạm" valueStyle={{ color: '#fff', fontWeight: 'bold' }} />
            <Text style={{ color: '#e0e7ff', fontSize: 12 }}>Thời tiết, Đất 20/50cm, pH, EC, Nước</Text>
          </Card>
        </Col>
      </Row>

      {/* Main Map & Filter Console */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card 
            bordered={false} 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: 16 }}>
                  📍 BẢN ĐỒ VỆ TINH VÀ RANH GIỚI THỦA ĐẤT (GIS 100 HA)
                </span>
                <Space>
                  <Select 
                    value={activeLayer} 
                    onChange={setActiveLayer}
                    options={[
                      { label: '🛰️ Bản đồ Vệ tinh High-Res (Esri)', value: 'satellite' },
                      { label: '🗺️ Bản đồ Địa hình / Đường sá (OSM)', value: 'standard' }
                    ]}
                    style={{ width: 230 }}
                  />
                  <Select 
                    value={selectedVariety} 
                    onChange={setSelectedVariety}
                    options={[
                      { label: 'Tất cả giống Sầu riêng', value: 'ALL' },
                      { label: 'Sầu riêng Ri6', value: 'Ri6' },
                      { label: 'Sầu riêng Monthong/Dona', value: 'Monthong' },
                      { label: 'Sầu riêng Musang King', value: 'Musang King' }
                    ]}
                    style={{ width: 210 }}
                  />
                </Space>
              </div>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            {/* Map Container */}
            <div 
              ref={mapContainerRef} 
              style={{ 
                height: '580px', 
                width: '100%', 
                borderRadius: '8px', 
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1
              }}
            />
          </Card>
        </Col>

        {/* Control Panel / Layer Toggles */}
        <Col xs={24} lg={6}>
          <Card 
            title={<span style={{ fontWeight: 'bold' }}>⚙️ LỚP DỮ LIỆU BẢN ĐỒ (LAYERS)</span>} 
            bordered={false} 
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text><Badge color="#10B981" text="🌱 Lớp Vùng trồng & Ranh giới" /></Text>
                <Switch defaultChecked disabled />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text><Badge color="#3B82F6" text="💧 Lớp Hệ thống tưới nhỏ giọt" /></Text>
                <Switch checked={showIrrigationLayer} onChange={setShowIrrigationLayer} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text><Badge color="#EF4444" text="🐛 Lớp Cảnh báo Sâu bệnh" /></Text>
                <Switch checked={showPestLayer} onChange={setShowPestLayer} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text><Badge color="#F59E0B" text="📊 Lớp Dự báo Sản lượng" /></Text>
                <Switch checked={showYieldLayer} onChange={setShowYieldLayer} />
              </div>
            </Space>
          </Card>

          {/* Quick Parcels List */}
          <Card 
            title={<span style={{ fontWeight: 'bold' }}>🏡 NÔNG HỘ VÀ LÔ CANH TÁC</span>} 
            bordered={false} 
            style={{ borderRadius: 12 }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {gisData?.parcels?.map(parcel => (
                <div 
                  key={parcel.id} 
                  onClick={() => {
                    setSelectedParcel(parcel);
                    setDrawerOpen(true);
                  }}
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: 8, 
                    border: '1px solid #e2e8f0', 
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1677ff'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 13 }}>
                    <span>{parcel.name}</span>
                    <Tag color="blue">{parcel.code}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Hộ: {parcel.farmerName} | {parcel.areaHa} ha ({parcel.treeCount} cây)
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Parcel Detail Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 'bold', color: '#15803d', fontSize: 16 }}>📋 HỒ SƠ SỐ LÔ CANH TÁC & MÃ SỐ VÙNG TRỒNG</span>}
        placement="right"
        width={480}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedParcel && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message={`Mã số vùng trồng: ${selectedParcel.code}`}
              description="Đã được chuẩn hóa dữ liệu GIS và chứng nhận tiêu chuẩn VietGAP xuất khẩu sang thị trường Trung Quốc (GACC) & G7."
              type="success"
              showIcon
            />

            <div>
              <Title level={4} style={{ color: '#0f172a', margin: 0 }}>
                {selectedParcel.name}
              </Title>
              <Text type="secondary">Chủ hộ canh tác: <b>{selectedParcel.farmerName}</b> ({selectedParcel.farmerPhone})</Text>
            </div>

            <Card size="small" title="📌 THÔNG TIN ĐỊA LÝ & SINH TRƯỞNG">
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <Text type="secondary">Diện tích quy hoạch:</Text>
                  <div><b>{selectedParcel.areaHa} ha</b></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Số lượng cây:</Text>
                  <div><b>{selectedParcel.treeCount} gốc</b></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Giống sầu riêng:</Text>
                  <div><b>{selectedParcel.cropVariety}</b></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Độ ẩm đất hiện tại:</Text>
                  <div><Tag color="green">{selectedParcel.moistureLevel}</Tag></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Chỉ số pH đất:</Text>
                  <div><b>{selectedParcel.soilPh}</b> (Chuẩn: 5.5 - 6.5)</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Cảnh báo sâu bệnh:</Text>
                  <div><Tag color={selectedParcel.pestRisk === 'Thấp' ? 'green' : 'gold'}>{selectedParcel.pestRisk}</Tag></div>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="📊 DỰ BÁO THU HOẠCH & DOANH THU">
              <Statistic title="Sản lượng ước tính" value={selectedParcel.yieldEstTons} suffix="Tấn" valueStyle={{ color: '#15803d', fontWeight: 'bold' }} />
              <Paragraph style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                Nhật ký ghi chép VietGAP mới nhất: <b>{selectedParcel.lastJournalDate}</b>
              </Paragraph>
            </Card>

            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setDrawerOpen(false)}>Đóng</Button>
              <Button type="primary" icon={<FileTextOutlined />} onClick={() => message.info(`Đang tải nhật ký canh tác của ${selectedParcel.farmerName}...`)}>
                Xem Nhật Ký VietGAP
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
}
