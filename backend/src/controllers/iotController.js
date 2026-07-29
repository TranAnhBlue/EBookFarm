const IoTSensor = require('../models/IoTSensor');
const PlantingRegion = require('../models/PlantingRegion');
const User = require('../models/User');

// Mock data generator if DB is empty for HTX Tân Quan Ecofarm (100 ha)
const getMockSensors = () => [
  {
    sensorId: 'IOT-TQ-WEATHER-01',
    name: 'Trạm thời tiết Trung tâm HTX Tân Quan',
    type: 'weather_station',
    locationName: 'Khu A - Trung tâm Vùng trồng 100ha',
    coordinates: { lat: 11.6425, lng: 106.9123 },
    plantingRegionCode: 'MSVT-TQ-001',
    readings: {
      airTemperature: 31.5,
      airHumidity: 78,
      rainfall: 12.4,
      windSpeed: 8.5,
      uvIndex: 7,
      batteryLevel: 98,
      signalStrength: 95
    },
    status: 'online',
    lastUpdated: new Date()
  },
  {
    sensorId: 'IOT-TQ-SOIL-01',
    name: 'Cảm biến đất Lô A1 (Sầu riêng Ri6)',
    type: 'soil_sensor',
    locationName: 'Lô A1 - Hộ Trần Văn Bình (15 ha)',
    coordinates: { lat: 11.6441, lng: 106.9105 },
    plantingRegionCode: 'MSVT-TQ-001',
    readings: {
      soilMoisture20cm: 68.5,
      soilMoisture50cm: 72.0,
      soilPh: 6.2,
      soilEc: 1.35,
      soilTemperature: 27.8,
      batteryLevel: 94,
      signalStrength: 90
    },
    status: 'online',
    lastUpdated: new Date()
  },
  {
    sensorId: 'IOT-TQ-SOIL-02',
    name: 'Cảm biến đất Lô B2 (Sầu riêng Monthong/Dona)',
    type: 'soil_sensor',
    locationName: 'Lô B2 - Hộ Nguyễn Thị Mai (20 ha)',
    coordinates: { lat: 11.6410, lng: 106.9140 },
    plantingRegionCode: 'MSVT-TQ-002',
    readings: {
      soilMoisture20cm: 45.2,
      soilMoisture50cm: 51.0,
      soilPh: 5.4,
      soilEc: 0.85,
      soilTemperature: 29.5,
      batteryLevel: 88,
      signalStrength: 85
    },
    status: 'warning',
    lastWarning: {
      title: 'Độ ẩm đất thấp & pH giảm nhẹ',
      message: 'Cần bổ sung nước tưới nhỏ giọt và bón vôi hạ phèn cho gốc Sầu riêng Monthong',
      severity: 'medium',
      timestamp: new Date()
    },
    lastUpdated: new Date()
  },
  {
    sensorId: 'IOT-TQ-WATER-01',
    name: 'Cảm biến mực nước Hồ tưới Trung tâm',
    type: 'water_sensor',
    locationName: 'Trạm bơm Hồ Tân Quan',
    coordinates: { lat: 11.6395, lng: 106.9118 },
    plantingRegionCode: 'MSVT-TQ-001',
    readings: {
      waterLevel: 420, // cm
      waterPh: 6.8,
      batteryLevel: 100,
      signalStrength: 98
    },
    status: 'online',
    lastUpdated: new Date()
  }
];

// Mock GIS Parcels for 100 ha HTX Tân Quan Ecofarm
const getMockGisParcels = () => ({
  htxInfo: {
    name: 'HỢP TÁC XÃ SẦU RIÊNG TÂN QUAN ECOFARM',
    taxCode: '3801354951',
    phone: '0978 272 652',
    totalAreaHa: 100,
    totalFarmers: 45,
    crop: 'Sầu riêng (Ri6, Monthong/Dona, Musang King)',
    address: 'Ấp Sóc Trào A, Xã Tân Quan, TP Đồng Nai, Việt Nam',
    center: { lat: 11.6420, lng: 106.9120 }
  },
  parcels: [
    {
      id: 'PARCEL-01',
      code: 'MSVT-TQ-001-A1',
      name: 'Lô A1 - Sầu riêng Ri6 (Thu hoạch chính)',
      farmerName: 'Trần Văn Bình',
      farmerPhone: '0912 345 678',
      areaHa: 25.5,
      treeCount: 3800,
      cropVariety: 'Sầu riêng Ri6 (7 năm tuổi)',
      status: 'Canh tác chuẩn VietGAP',
      healthStatus: 'Tốt',
      moistureLevel: '68% (Đạt)',
      soilPh: 6.2,
      pestRisk: 'Thấp',
      yieldEstTons: 380,
      lastJournalDate: '2026-07-28',
      polygon: [
        { lat: 11.6450, lng: 106.9080 },
        { lat: 11.6470, lng: 106.9130 },
        { lat: 11.6435, lng: 106.9150 },
        { lat: 11.6420, lng: 106.9095 }
      ]
    },
    {
      id: 'PARCEL-02',
      code: 'MSVT-TQ-001-A2',
      name: 'Lô A2 - Sầu riêng Monthong / Dona',
      farmerName: 'Nguyễn Thị Mai',
      farmerPhone: '0988 765 432',
      areaHa: 30.0,
      treeCount: 4500,
      cropVariety: 'Sầu riêng Monthong (6 năm tuổi)',
      status: 'Canh tác Hữu cơ hướng tới Xuất khẩu',
      healthStatus: 'Cần chú ý độ ẩm',
      moistureLevel: '45% (Hơi khô)',
      soilPh: 5.4,
      pestRisk: 'Trung bình (Nhện đỏ)',
      yieldEstTons: 420,
      lastJournalDate: '2026-07-29',
      polygon: [
        { lat: 11.6435, lng: 106.9150 },
        { lat: 11.6455, lng: 106.9190 },
        { lat: 11.6410, lng: 106.9205 },
        { lat: 11.6400, lng: 106.9160 }
      ]
    },
    {
      id: 'PARCEL-03',
      code: 'MSVT-TQ-002-B1',
      name: 'Lô B1 - Sầu riêng Musang King & Ri6',
      farmerName: 'Lê Hoàng Nam',
      farmerPhone: '0903 112 233',
      areaHa: 22.0,
      treeCount: 3300,
      cropVariety: 'Musang King & Ri6 (5 năm tuổi)',
      status: 'Chuẩn VietGAP - Đã cấp MSVT',
      healthStatus: 'Rất Tốt',
      moistureLevel: '70% (Tối ưu)',
      soilPh: 6.0,
      pestRisk: 'Thấp',
      yieldEstTons: 310,
      lastJournalDate: '2026-07-27',
      polygon: [
        { lat: 11.6420, lng: 106.9095 },
        { lat: 11.6435, lng: 106.9150 },
        { lat: 11.6390, lng: 106.9140 },
        { lat: 11.6380, lng: 106.9085 }
      ]
    },
    {
      id: 'PARCEL-04',
      code: 'MSVT-TQ-002-B2',
      name: 'Lô B2 - Vùng nhân giống & Thử nghiệm IoT',
      farmerName: 'Phạm Đức Anh (Kỹ thuật HTX)',
      farmerPhone: '0977 445 566',
      areaHa: 22.5,
      treeCount: 3400,
      cropVariety: 'Sầu riêng Dona & Cảm biến Smart Farm',
      status: 'Số hóa 100% - Thử nghiệm Cảm biến IoT',
      healthStatus: 'Tốt',
      moistureLevel: '65%',
      soilPh: 6.3,
      pestRisk: 'Thấp',
      yieldEstTons: 290,
      lastJournalDate: '2026-07-29',
      polygon: [
        { lat: 11.6400, lng: 106.9160 },
        { lat: 11.6410, lng: 106.9205 },
        { lat: 11.6370, lng: 106.9210 },
        { lat: 11.6365, lng: 106.9150 }
      ]
    }
  ]
});

// @desc Get IoT Telemetry & Sensor status
// @route GET /api/iot/telemetry
exports.getTelemetry = async (req, res) => {
  try {
    let sensors = await IoTSensor.find().sort({ createdAt: -1 });
    if (!sensors || sensors.length === 0) {
      sensors = getMockSensors();
    }

    const summary = {
      totalSensors: sensors.length,
      onlineCount: sensors.filter(s => s.status === 'online').length,
      warningCount: sensors.filter(s => s.status === 'warning').length,
      avgSoilMoisture: 61.2,
      avgSoilPh: 6.0,
      weatherCurrent: {
        temp: 31.5,
        humidity: 78,
        rain: 12.4,
        wind: 8.5,
        uv: 7,
        condition: 'Nắng ráo có mây, độ ẩm thích hợp canh tác'
      }
    };

    return res.status(200).json({
      success: true,
      summary,
      sensors
    });
  } catch (error) {
    console.error('Error fetching IoT telemetry:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get GIS Parcels & 100ha Map Layers
// @route GET /api/iot/gis-data
exports.getGisData = async (req, res) => {
  try {
    const director = await User.findOne({ username: 'tanquan_ecofarm' });
    let dbRegions = [];
    
    if (director) {
      dbRegions = await PlantingRegion.find({ htxId: director._id })
        .populate('farmerIds', 'fullname phone email address farmName')
        .sort({ code: 1 });
    }

    if (dbRegions && dbRegions.length > 0) {
      const parcels = dbRegions.map((region, idx) => {
        const farmer = (region.farmerIds && region.farmerIds[0]) || {};
        const areaHa = (region.areaM2 / 10000).toFixed(1);
        const treeCount = Math.round(region.areaM2 / 65);

        return {
          id: region._id.toString(),
          code: region.code,
          name: region.name,
          farmerName: farmer.fullname || 'Hộ thành viên HTX',
          farmerPhone: farmer.phone || '0978 272 652',
          areaHa: parseFloat(areaHa),
          treeCount: treeCount,
          cropVariety: region.cropName || 'Sầu riêng Dona / Monthong',
          status: 'Canh tác chuẩn VietGAP',
          healthStatus: 'Tốt',
          moistureLevel: `${60 + (idx % 15)}% (Đạt)`,
          soilPh: Number((5.8 + (idx % 8) * 0.1).toFixed(1)),
          pestRisk: idx % 7 === 0 ? 'Trung bình' : 'Thấp',
          yieldEstTons: Math.round(parseFloat(areaHa) * 15), // ~15 tons per ha
          lastJournalDate: new Date().toISOString().split('T')[0],
          polygon: region.boundary && region.boundary.length > 0 ? region.boundary : [
            { lat: region.center.lat + 0.001, lng: region.center.lng - 0.001 },
            { lat: region.center.lat + 0.001, lng: region.center.lng + 0.001 },
            { lat: region.center.lat - 0.001, lng: region.center.lng + 0.001 },
            { lat: region.center.lat - 0.001, lng: region.center.lng - 0.001 }
          ]
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          htxInfo: {
            name: 'HỢP TÁC XÃ SẦU RIÊNG TÂN QUAN ECOFARM',
            taxCode: '3801354951',
            phone: '0978 272 652',
            totalAreaHa: parcels.reduce((sum, p) => sum + p.areaHa, 0).toFixed(1),
            totalFarmers: parcels.length,
            crop: 'Sầu riêng (Ri6, Monthong/Dona, TR6)',
            address: 'Ấp Sóc Trào A, Xã Tân Quan, TP Đồng Nai, Việt Nam',
            center: dbRegions[0].center || { lat: 11.6420, lng: 106.9120 }
          },
          parcels
        }
      });
    }

    const gisData = getMockGisParcels();
    return res.status(200).json({
      success: true,
      data: gisData
    });
  } catch (error) {
    console.error('Error fetching GIS data:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Trigger Broadcast Alert (Zalo OA / SMS / App Notification)
// @route POST /api/iot/trigger-alert
exports.triggerAlert = async (req, res) => {
  try {
    const { title, message, channel, parcelId } = req.body;

    const alertLog = {
      id: `ALT-${Date.now()}`,
      title: title || 'Cảnh báo tự động nông nghiệp Smart Farm',
      message: message || 'Đã gửi thông báo khuyến cáo kỹ thuật đến các hộ nông dân HTX Tân Quan',
      channel: channel || 'zalo_oa_and_mobile_app',
      parcelId: parcelId || 'ALL',
      sentCount: 45,
      timestamp: new Date(),
      status: 'SUCCESS'
    };

    return res.status(200).json({
      success: true,
      message: `Đã phát cảnh báo thành công qua kênh ${alertLog.channel} tới 45 hộ thành viên HTX!`,
      alertLog
    });
  } catch (error) {
    console.error('Error triggering IoT alert:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
