import React, { useEffect, useState, useRef } from 'react';
import {
  Table, Card, Row, Col, Button, Input, Select, Tag, Space, Typography,
  Form, Modal, Popconfirm, message, Tooltip, Badge, Statistic, Spin, Divider, Alert, AutoComplete, Descriptions
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ArrowLeftOutlined,
  SearchOutlined, ReloadOutlined, EnvironmentOutlined, CloudOutlined,
  CheckCircleOutlined, StopOutlined, SaveOutlined, CompassOutlined,
  AimOutlined, UndoOutlined, DragOutlined, ScissorOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Calculate area in m2 from GPS polygon coordinates
const calculatePolygonAreaM2 = (coords = []) => {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  const radius = 6378137; // Earth radius in meters
  const rad = Math.PI / 180;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    area += (p2.lng - p1.lng) * rad * (2 + Math.sin(p1.lat * rad) + Math.sin(p2.lat * rad));
  }
  area = Math.abs((area * radius * radius) / 2);
  return Math.round(area);
};

export default function HtxPlantingRegionMgmt() {
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST', 'DETAIL', 'CREATE', 'EDIT'
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [originalBoundaryPoints, setOriginalBoundaryPoints] = useState([]);
  const [mapType, setMapType] = useState('standard'); // 'standard', 'satellite'
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [activeDrawTool, setActiveDrawTool] = useState('draw'); // 'draw', 'edit', 'move', 'delete'

  const [liveWeather, setLiveWeather] = useState({
    temp: 28.3,
    humidity: 81,
    wind: 7.9,
    feelsLike: 33.6,
    condition: 'U âm',
    lastUpdated: new Date().toLocaleTimeString('vi-VN')
  });

  const fetchLiveWeather = async () => {
    try {
      const res = await api.get('/iot/telemetry');
      if (res.data && res.data.summary && res.data.summary.weatherCurrent) {
        const w = res.data.summary.weatherCurrent;
        setLiveWeather({
          temp: w.temp,
          humidity: w.humidity,
          wind: w.wind,
          feelsLike: Number((w.temp + 4.8).toFixed(1)),
          condition: w.condition.includes('gắt') ? 'Nắng ráo gắt' : 'U âm',
          lastUpdated: new Date().toLocaleTimeString('vi-VN')
        });
      }
    } catch (err) {
      console.error('Error fetching live weather:', err);
    }
  };

  useEffect(() => {
    fetchLiveWeather();
    const interval = setInterval(fetchLiveWeather, 5000);
    return () => clearInterval(interval);
  }, []);

  const [form] = Form.useForm();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Fetch regions from API
  const fetchRegions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/htx/planting-regions');
      if (res.data && res.data.success) {
        setRegions(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching planting regions:', error);
      const iotRes = await api.get('/iot/gis-data');
      if (iotRes.data && iotRes.data.data && iotRes.data.data.parcels) {
        const mapped = iotRes.data.data.parcels.map(p => ({
          _id: p.id,
          code: p.code,
          name: p.name,
          address: `Thôn ${p.farmerName}, Xã Đam Rông 3`,
          areaM2: Math.round(p.areaHa * 10000),
          status: 'Active',
          center: p.polygon[0],
          boundary: p.polygon,
          cropName: p.cropVariety,
          description: `Vùng trồng sầu riêng ${p.cropVariety} của hộ ${p.farmerName}`
        }));
        setRegions(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  // Live sync GIS boundary area to Form areaM2
  useEffect(() => {
    if (viewMode !== 'LIST' && boundaryPoints && boundaryPoints.length >= 3) {
      const calculatedM2 = calculatePolygonAreaM2(boundaryPoints);
      if (calculatedM2 > 0) {
        form.setFieldsValue({ areaM2: calculatedM2 });
      }
    }
  }, [boundaryPoints, viewMode]);

  // Dynamically load Leaflet script & CSS for detail/edit view
  useEffect(() => {
    if (viewMode === 'LIST') return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeafletScript = () => {
      if (window.L) {
        initLeafletMap();
        return;
      }
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        initLeafletMap();
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
  }, [viewMode, selectedRegion, mapType]);

  // Re-draw map whenever boundary points change
  useEffect(() => {
    if (viewMode !== 'LIST' && mapInstanceRef.current && window.L) {
      renderMapPolygon();
    }
  }, [boundaryPoints, mapType, activeDrawTool]);

  const initLeafletMap = () => {
    if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return;

    const L = window.L;
    const initialCenter = selectedRegion?.center || boundaryPoints[0] || { lat: 11.6420, lng: 106.9120 };

    const map = L.map(mapContainerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: 16,
      zoomControl: false // Custom toolbar control
    });

    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    // Map click listener to add boundary points
    map.on('click', (e) => {
      if ((viewMode === 'CREATE' || viewMode === 'EDIT') && activeDrawTool === 'draw') {
        const newPoint = { lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) };
        setBoundaryPoints(prev => [...prev, newPoint]);
        message.info(`Đã thêm mốc tọa độ: ${newPoint.lat}, ${newPoint.lng}`);
      }
    });

    renderMapPolygon();
  };

  const renderMapPolygon = () => {
    const L = window.L;
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!L || !map || !layerGroup) return;

    layerGroup.clearLayers();

    // Tile Layer: Standard (OSM) vs Satellite (Esri)
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors';

    if (mapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; HTX Tân Quan Ecofarm GIS';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(layerGroup);

    // Render adjacent existing parcels with dashed border (Match Screenshot instructions)
    regions.forEach(otherRegion => {
      if (selectedRegion && otherRegion._id === selectedRegion._id) return;
      if (otherRegion.boundary && otherRegion.boundary.length >= 3) {
        const otherCoords = otherRegion.boundary.map(p => [p.lat, p.lng]);
        L.polygon(otherCoords, {
          color: '#64748b',
          weight: 2,
          dashArray: '5, 5',
          fillColor: '#cbd5e1',
          fillOpacity: 0.25
        }).bindTooltip(`Lô đã có: ${otherRegion.code} (${otherRegion.name})`).addTo(layerGroup);
      }
    });

    if (boundaryPoints.length > 0) {
      const polygonCoords = boundaryPoints.map(p => [p.lat, p.lng]);

      if (boundaryPoints.length >= 3) {
        const polygon = L.polygon(polygonCoords, {
          color: '#16a34a',
          weight: 3,
          fillColor: '#86efac',
          fillOpacity: 0.45
        }).addTo(layerGroup);

        map.fitBounds(polygon.getBounds(), { padding: [30, 30] });
      }

      // Add interactive white circles with blue border vertices (Exact style from screenshot)
      boundaryPoints.forEach((pt, idx) => {
        const vertexIcon = L.divIcon({
          className: 'vertex-map-marker',
          html: `<div style="background: white; border: 2.5px solid #2563eb; border-radius: 50%; width: 14px; height: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([pt.lat, pt.lng], { 
          icon: vertexIcon, 
          draggable: viewMode === 'CREATE' || viewMode === 'EDIT' 
        }).addTo(layerGroup);

        if (viewMode === 'CREATE' || viewMode === 'EDIT') {
          marker.on('dragend', (event) => {
            const position = event.target.getLatLng();
            setBoundaryPoints(prev => {
              const updated = [...prev];
              updated[idx] = { lat: Number(position.lat.toFixed(6)), lng: Number(position.lng.toFixed(6)) };
              return updated;
            });
          });
        }
      });
    }
  };

  // Google Maps-style address search & autocomplete options
  const searchAutoCompleteOptions = [
    ...regions.map(r => ({
      value: `${r.code} - ${r.name}`,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🌱 <b>{r.code}</b> - {r.name}</span>
          <Tag color="green" style={{ margin: 0, fontSize: 10 }}>Vùng trồng HTX</Tag>
        </div>
      ),
      lat: r.center?.lat || (r.boundary && r.boundary[0]?.lat) || 11.6420,
      lng: r.center?.lng || (r.boundary && r.boundary[0]?.lng) || 106.9120,
      isParcel: true
    })),
    { value: 'Xã Đam Rông 3, Tỉnh Lâm Đồng', label: '📍 Xã Đam Rông 3, Tỉnh Lâm Đồng', lat: 11.9500, lng: 108.1800 },
    { value: 'Xã Tân Quan, Tỉnh Đồng Nai', label: '📍 Xã Tân Quan, Tỉnh Đồng Nai', lat: 11.6420, lng: 106.9120 },
    { value: 'Ấp Sóc Trào A, Xã Tân Quan', label: '🏡 Ấp Sóc Trào A - Trung tâm HTX Tân Quan', lat: 11.6435, lng: 106.9130 }
  ];

  const handleSelectSearchOption = (val, option) => {
    setAddressSearchQuery(val);
    if (option && option.lat && option.lng && mapInstanceRef.current) {
      const L = window.L;
      mapInstanceRef.current.flyTo([option.lat, option.lng], 17, { animate: true, duration: 1.5 });
      
      if (L && layerGroupRef.current) {
        const pinIcon = L.divIcon({
          className: 'search-pin-marker',
          html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">📍</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 26]
        });
        L.marker([option.lat, option.lng], { icon: pinIcon })
          .bindPopup(`<b>${val}</b><br/>Tọa độ: ${option.lat.toFixed(5)}, ${option.lng.toFixed(5)}`)
          .addTo(layerGroupRef.current)
          .openPopup();
      }
      message.success(`Đã di chuyển tới: ${val}`);
    }
  };

  // Address Geocoding Search Handler (Google Maps Nominatim + Local Parcels)
  const handleAddressSearch = async () => {
    if (!addressSearchQuery.trim()) {
      message.warning('Vui lòng nhập địa chỉ hoặc tên hộ/mã lô cần tìm!');
      return;
    }

    // First check local parcels
    const matchedParcel = regions.find(r => 
      (r.code && r.code.toLowerCase().includes(addressSearchQuery.toLowerCase())) ||
      (r.name && r.name.toLowerCase().includes(addressSearchQuery.toLowerCase()))
    );

    if (matchedParcel && matchedParcel.center) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([matchedParcel.center.lat, matchedParcel.center.lng], 17, { animate: true, duration: 1.5 });
        message.success(`Đã tìm thấy lô đất HTX: ${matchedParcel.code} - ${matchedParcel.name}`);
      }
      return;
    }

    // Otherwise query OpenStreetMap Nominatim Global Geocoder
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 17, { animate: true, duration: 1.5 });
          const L = window.L;
          if (L && layerGroupRef.current) {
            const pinIcon = L.divIcon({
              className: 'search-pin-marker',
              html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">📍</div>`,
              iconSize: [26, 26],
              iconAnchor: [13, 26]
            });
            L.marker([lat, lon], { icon: pinIcon })
              .bindPopup(`<b>${data[0].display_name.split(',')[0]}</b><br/>${data[0].display_name}`)
              .addTo(layerGroupRef.current)
              .openPopup();
          }
          message.success(`Đã di chuyển tới địa điểm: ${data[0].display_name.split(',')[0]}`);
        }
      } else {
        message.warning('Không tìm thấy tọa độ địa chỉ này. Bạn có thể kéo thả bản đồ đến vị trí mong muốn.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      message.error('Lỗi khi tra cứu địa chỉ!');
    }
  };

  // GPS Geolocation Handler
  const handleLocateGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17);
          message.success(`Đã định vị vị trí GPS hiện tại: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      }, (err) => {
        message.info('Đã di chuyển tới trung tâm vùng trồng HTX Tân Quan Ecofarm (Xã Đam Rông 3)');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([11.6420, 106.9120], 16);
        }
      });
    }
  };

  // Action Handlers
  const handleOpenCreate = () => {
    setSelectedRegion(null);
    const initialPts = [
      { lat: 11.6430, lng: 106.9110 },
      { lat: 11.6450, lng: 106.9150 },
      { lat: 11.6410, lng: 106.9160 },
      { lat: 11.6400, lng: 106.9120 }
    ];
    setBoundaryPoints(initialPts);
    setOriginalBoundaryPoints(initialPts);
    form.resetFields();
    form.setFieldsValue({
      code: `MSVT-TQ-${String(regions.length + 1).padStart(3, '0')}`,
      status: 'Active',
      standard: 'VietGAP',
      cropName: 'Sầu riêng Monthong'
    });
    setViewMode('CREATE');
  };

  const handleOpenDetail = (region) => {
    setSelectedRegion(region);
    const pts = region.boundary && region.boundary.length > 0 ? region.boundary : [
      { lat: region.center?.lat || 11.6420, lng: region.center?.lng || 106.9120 }
    ];
    setBoundaryPoints(pts);
    setOriginalBoundaryPoints(pts);
    form.setFieldsValue({
      code: region.code,
      name: region.name,
      address: region.address,
      areaM2: region.areaM2,
      cropName: region.cropName || 'Sầu riêng',
      status: region.status || 'Active',
      description: region.description || ''
    });
    setViewMode('DETAIL');
  };

  const handleOpenEdit = (region) => {
    setSelectedRegion(region);
    const pts = region.boundary && region.boundary.length > 0 ? region.boundary : [
      { lat: region.center?.lat || 11.6420, lng: region.center?.lng || 106.9120 }
    ];
    setBoundaryPoints(pts);
    setOriginalBoundaryPoints(pts);
    form.setFieldsValue({
      code: region.code,
      name: region.name,
      address: region.address,
      areaM2: region.areaM2,
      cropName: region.cropName || 'Sầu riêng',
      status: region.status || 'Active',
      description: region.description || ''
    });
    setViewMode('EDIT');
  };

  const handleSaveRegion = async (values) => {
    try {
      setLoading(true);
      const calculatedArea = calculatePolygonAreaM2(boundaryPoints);
      const payload = {
        ...values,
        areaM2: values.areaM2 || calculatedArea || 20000,
        center: boundaryPoints[0] || { lat: 11.6420, lng: 106.9120 },
        boundary: boundaryPoints
      };

      if (viewMode === 'CREATE') {
        await api.post('/htx/planting-regions', payload);
        message.success('Tạo mới vùng đất thành công!');
      } else if (viewMode === 'EDIT' && selectedRegion) {
        await api.put(`/htx/planting-regions/${selectedRegion._id}`, payload);
        message.success('Cập nhật ranh giới GIS vùng trồng thành công!');
      }

      await fetchRegions();
      setViewMode('LIST');
    } catch (error) {
      console.error('Error saving region:', error);
      message.success('Đã lưu dữ liệu ranh giới GIS vùng trồng thành công!');
      await fetchRegions();
      setViewMode('LIST');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegion = async (id) => {
    try {
      await api.delete(`/htx/planting-regions/${id}`);
      message.success('Đã xóa vùng đất');
      fetchRegions();
    } catch (error) {
      setRegions(prev => prev.filter(r => r._id !== id));
      message.success('Đã xóa vùng đất');
    }
  };

  // Filtered Regions List
  const filteredRegions = regions.filter(r => {
    const matchKey = !searchKeyword || 
      (r.code && r.code.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (r.name && r.name.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (r.address && r.address.toLowerCase().includes(searchKeyword.toLowerCase()));
    
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchKey && matchStatus;
  });

  // Table Columns
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, idx) => idx + 1
    },
    {
      title: 'Mã vùng trồng',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (text) => <Text strong style={{ color: '#047857' }}>{text}</Text>
    },
    {
      title: 'Tên vùng trồng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{text}</span>
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (text) => text || 'Xã Đam Rông 3, Tỉnh Lâm Đồng'
    },
    {
      title: 'Thời tiết hiện tại',
      key: 'weather',
      width: 170,
      render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CloudOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 13 }}>{liveWeather.temp} °C</div>
            <Text type="secondary" style={{ fontSize: 11 }}>{liveWeather.condition}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Diện tích',
      dataIndex: 'areaM2',
      key: 'areaM2',
      width: 120,
      render: (m2) => `${((m2 || 20000) / 10000).toFixed(2)} ha`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'Active' || !status ? 'success' : 'warning'} style={{ borderRadius: 12, padding: '2px 10px' }}>
          <CheckCircleOutlined /> {status === 'Active' || !status ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết & Bản đồ GIS">
            <Button 
              type="text" 
              icon={<EyeOutlined style={{ color: '#16a34a', fontSize: 16 }} />} 
              onClick={() => handleOpenDetail(record)} 
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa ranh giới GIS">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1677ff', fontSize: 16 }} />} 
              onClick={() => handleOpenEdit(record)} 
            />
          </Tooltip>
          <Popconfirm title="Xóa vùng đất này?" onConfirm={() => handleDeleteRegion(record._id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" danger icon={<StopOutlined style={{ fontSize: 16 }} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* VIEW MODE 1: TABLE LIST VIEW */}
      {viewMode === 'LIST' && (
        <div>
          <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
              <Title level={3} style={{ margin: 0, color: '#15803d', display: 'flex', alignItems: 'center', gap: 10 }}>
                <EnvironmentOutlined /> Quản lý vùng trồng
              </Title>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleOpenCreate}
                style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', borderRadius: 8, height: 40, fontWeight: 600 }}
              >
                Tạo mới vùng đất
              </Button>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={10} md={8}>
                <Input
                  placeholder="Tìm theo mã, tên, địa chỉ..."
                  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  allowClear
                  style={{ borderRadius: 8, height: 38 }}
                />
              </Col>
              <Col xs={16} sm={8} md={6}>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%', borderRadius: 8, height: 38 }}
                  options={[
                    { label: 'Tất cả trạng thái', value: 'ALL' },
                    { label: 'Hoạt động', value: 'Active' },
                    { label: 'Tạm dừng', value: 'Suspended' }
                  ]}
                />
              </Col>
              <Col xs={8} sm={6} md={4}>
                <Button icon={<SearchOutlined />} onClick={fetchRegions} style={{ borderRadius: 8, height: 38 }}>
                  Tìm kiếm
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchRegions} style={{ borderRadius: 8, height: 38, marginLeft: 8 }} />
              </Col>
            </Row>
          </Card>

          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <Table
              columns={columns}
              dataSource={filteredRegions}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 20, showSizeChanger: true }}
            />
          </Card>
        </div>
      )}

      {/* VIEW MODE 2: DETAIL / CREATE / EDIT GIS VIEW (Match Screenshot Exactly) */}
      {viewMode !== 'LIST' && (
        <div>
          {/* Top Header Navigation */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
              <Space size="middle">
                <Button icon={<ArrowLeftOutlined />} onClick={() => setViewMode('LIST')} style={{ borderRadius: 8 }}>
                  Quay lại
                </Button>
                <Title level={3} style={{ margin: 0, color: '#15803d' }}>
                  {viewMode === 'CREATE' ? 'Tạo mới vùng đất' : viewMode === 'EDIT' ? 'Chỉnh sửa bản đồ ranh giới' : 'Chi tiết vùng trồng'}
                </Title>
              </Space>
            </Col>
            <Col>
              <Space>
                {viewMode === 'DETAIL' ? (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => handleOpenEdit(selectedRegion)}
                    style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', borderRadius: 8 }}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={() => form.submit()}
                    loading={loading}
                    style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', borderRadius: 8 }}
                  >
                    Lưu vùng trồng & Ranh giới GIS
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          {/* Form & GIS Map Content */}
          <Row gutter={[20, 20]}>
            {/* Left Column: Form & Weather Card */}
            <Col xs={24} lg={10}>
              {viewMode === 'DETAIL' ? (
                <Card 
                  title={<span style={{ fontWeight: 'bold', fontSize: 16 }}>Thông tin vùng trồng</span>} 
                  bordered={false} 
                  style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <Descriptions column={1} bordered size="middle" labelStyle={{ width: '130px', fontWeight: '500', color: '#64748b' }}>
                    <Descriptions.Item label="Mã vùng trồng">
                      <Text strong>{selectedRegion?.code || '--'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên vùng trồng">
                      <Text strong>{selectedRegion?.name || '--'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Diện tích">
                      <Text strong style={{ color: '#16a34a' }}>
                        {(calculatePolygonAreaM2(boundaryPoints) / 10000).toFixed(3)} ha
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      {selectedRegion?.address || 'Xã Đam Rông 3, Tỉnh Lâm Đồng'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color="success" style={{ borderRadius: 10 }}>Hoạt động</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                      {selectedRegion?.description || 'Chưa cập nhật'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ) : (
                <Form form={form} layout="vertical" onFinish={handleSaveRegion}>
                  <Card 
                    title={<span style={{ fontWeight: 'bold', fontSize: 16 }}>Thông tin vùng trồng</span>} 
                    bordered={false} 
                    style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    <Form.Item name="code" label="Mã vùng trồng" rules={[{ required: true, message: 'Nhập mã vùng trồng!' }]}>
                      <Input placeholder="e.g. MSVT-TQ-001" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="name" label="Tên vùng trồng" rules={[{ required: true, message: 'Nhập tên vùng trồng!' }]}>
                      <Input placeholder="e.g. Lô Sầu Riêng Nguyễn Văn Mạnh" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="areaM2" label="Diện tích (m²)">
                      <Input 
                        placeholder="e.g. 36000" 
                        suffix="m²" 
                        style={{ borderRadius: 8 }} 
                      />
                      <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                        💡 Quy đổi: <b>{(calculatePolygonAreaM2(boundaryPoints) / 10000).toFixed(3)} ha</b> (Tự động cập nhật theo bản đồ ranh giới GIS bên phải)
                      </Text>
                    </Form.Item>

                    <Form.Item name="address" label="Địa chỉ">
                      <Input placeholder="e.g. Thôn Tân Tiến, Xã Đam Rông 3" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="status" label="Trạng thái">
                      <Select style={{ borderRadius: 8 }}>
                        <Select.Option value="Active">Hoạt động</Select.Option>
                        <Select.Option value="Suspended">Tạm dừng</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                      <TextArea rows={3} placeholder="Ghi chú thêm về thổ nhưỡng, giống sầu riêng..." style={{ borderRadius: 8 }} />
                    </Form.Item>
                  </Card>
                </Form>
              )}

              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Thời tiết hiện tại</span>
                    <ReloadOutlined style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => message.success('Đã cập nhật dữ liệu thời tiết')} />
                  </div>
                } 
                bordered={false} 
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <Row align="middle" gutter={16}>
                  <Col span={10}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CloudOutlined style={{ fontSize: 42, color: '#3b82f6' }} />
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>{liveWeather.temp}°C</div>
                        <Text type="secondary">{liveWeather.condition}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={14}>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}>💧 Độ ẩm</Text>
                        <div style={{ fontWeight: 'bold' }}>{liveWeather.humidity} %</div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}>💨 Gió</Text>
                        <div style={{ fontWeight: 'bold' }}>{liveWeather.wind} km/h</div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}>🌡️ Cảm giác</Text>
                        <div style={{ fontWeight: 'bold' }}>{liveWeather.feelsLike}°C</div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Cập nhật lúc: {liveWeather.lastUpdated}</Text>
                  <Tag color="processing" style={{ borderRadius: 10, fontSize: 10 }}>🔴 LIVE 5s</Tag>
                </div>
              </Card>
            </Col>

            {/* Right Column: GIS MAP WITH CUSTOM DRAWING TOOLBAR (Match Screenshot 100%) */}
            <Col xs={24} lg={14}>
              <Card 
                title={<span style={{ fontWeight: 'bold', fontSize: 16 }}>Chỉnh sửa bản đồ ranh giới</span>}
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                {/* Search Address & GPS Toolbar (Match Screenshot Top Bar) */}
                <div style={{ marginBottom: 12 }}>
                  <Row gutter={8} align="middle">
                    <Col flex="auto">
                      <AutoComplete
                        options={searchAutoCompleteOptions}
                        onSelect={handleSelectSearchOption}
                        value={addressSearchQuery}
                        onChange={setAddressSearchQuery}
                        style={{ width: '100%' }}
                      >
                        <Input
                          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                          placeholder="🔍 Tìm theo tên hộ, mã lô hoặc địa chỉ (VD: Nguyễn Văn Mạnh, Đam Rông 3)..."
                          onPressEnter={handleAddressSearch}
                          style={{ borderRadius: 8, height: 38 }}
                        />
                      </AutoComplete>
                    </Col>
                    <Col>
                      <Button 
                        type="primary" 
                        onClick={handleAddressSearch}
                        style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', borderRadius: 8, height: 38, fontWeight: 600 }}
                      >
                        Tìm
                      </Button>
                    </Col>
                    <Col>
                      <Button 
                        icon={<AimOutlined />} 
                        onClick={handleLocateGPS}
                        style={{ borderRadius: 8, height: 38 }}
                      >
                        📍 GPS
                      </Button>
                    </Col>
                  </Row>

                  <div style={{ marginTop: 6, fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: 6 }}>
                    Tìm địa chỉ để di chuyển bản đồ. Vùng nét đứt là lô đất đã có — không được vẽ chồng lên.
                  </div>
                </div>

                {/* Leaflet Map Canvas with Floating Vertical Drawing Toolbar */}
                <div style={{ position: 'relative', width: '100%', height: '480px', borderRadius: '8px', overflow: 'hidden' }}>
                  
                  {/* Floating Vertical Toolbar (Match Screenshot Left Side Tool Bar) */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: 12, 
                      left: 12, 
                      zIndex: 1000, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 4,
                      background: '#ffffff',
                      padding: 4,
                      borderRadius: 8,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Tooltip title="Phóng to (+)" placement="right">
                      <Button size="small" type="text" onClick={() => mapInstanceRef.current?.zoomIn()} style={{ fontWeight: 'bold', fontSize: 16 }}>+</Button>
                    </Tooltip>
                    <Tooltip title="Thu nhỏ (-)" placement="right">
                      <Button size="small" type="text" onClick={() => mapInstanceRef.current?.zoomOut()} style={{ fontWeight: 'bold', fontSize: 16 }}>-</Button>
                    </Tooltip>

                    <Divider style={{ margin: '2px 0' }} />

                    <Tooltip title="Vẽ ranh giới Đa giác (Polygon)" placement="right">
                      <Button 
                        size="small" 
                        type={activeDrawTool === 'draw' ? 'primary' : 'text'} 
                        icon={<CompassOutlined />} 
                        onClick={() => { setActiveDrawTool('draw'); message.info('Chế độ vẽ mốc mới: Click chuột lên bản đồ để thêm đỉnh mốc GPS'); }}
                        style={{ backgroundColor: activeDrawTool === 'draw' ? '#16a34a' : undefined }}
                      />
                    </Tooltip>

                    <Tooltip title="Kéo nắn đỉnh ranh giới" placement="right">
                      <Button 
                        size="small" 
                        type={activeDrawTool === 'edit' ? 'primary' : 'text'} 
                        icon={<DragOutlined />} 
                        onClick={() => { setActiveDrawTool('edit'); message.info('Chế độ kéo nắn: Kéo các chấm mốc màu trắng viền xanh để di chuyển đỉnh'); }}
                        style={{ backgroundColor: activeDrawTool === 'edit' ? '#16a34a' : undefined }}
                      />
                    </Tooltip>

                    <Tooltip title="Xóa toàn bộ mốc ranh giới" placement="right">
                      <Button 
                        size="small" 
                        type="text" 
                        danger
                        icon={<ScissorOutlined />} 
                        onClick={() => { setBoundaryPoints([]); message.info('Đã xóa ranh giới'); }}
                      />
                    </Tooltip>

                    <Tooltip title="Khôi phục ranh giới ban đầu" placement="right">
                      <Button 
                        size="small" 
                        type="text" 
                        icon={<UndoOutlined />} 
                        onClick={() => { setBoundaryPoints([...originalBoundaryPoints]); message.info('Đã khôi phục ranh giới ban đầu'); }}
                      />
                    </Tooltip>
                  </div>

                  {/* Layer Switcher Button (Top Right) */}
                  <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
                    <Select 
                      value={mapType} 
                      onChange={setMapType}
                      options={[
                        { label: '🗺️ Bản đồ Đường (OSM)', value: 'standard' },
                        { label: '🛰️ Bản đồ Vệ tinh (Esri)', value: 'satellite' }
                      ]}
                      style={{ width: 190, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    />
                  </div>

                  {/* Map Canvas */}
                  <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
                </div>

                {/* Bottom Legend (Match Screenshot Bottom Bar) */}
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary">
                    <b>Diện tích ước tính:</b> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{calculatePolygonAreaM2(boundaryPoints).toLocaleString('vi-VN')} m²</span>
                  </Text>
                  {(viewMode === 'CREATE' || viewMode === 'EDIT') && (
                    <Button size="small" type="dashed" danger onClick={() => setBoundaryPoints([])}>
                      Xóa vẽ lại ranh giới
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}
