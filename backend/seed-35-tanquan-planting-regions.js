const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const PlantingRegion = require('./src/models/PlantingRegion');

dotenv.config();

const seed35PlantingRegions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env!');
    }

    console.log('Connecting to MongoDB Atlas database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Find HTX Director
    const director = await User.findOne({ username: 'tanquan_ecofarm' });
    if (!director) {
      console.error('❌ HTX Director tanquan_ecofarm not found!');
      process.exit(1);
    }

    // 2. Find all 35 farmers belonging to this HTX
    const farmers = await User.find({ htxId: director._id, role: 'Farmer' }).sort({ createdAt: 1 });
    console.log(`📋 Found ${farmers.length} farmers for HTX Tân Quan Ecofarm`);

    if (farmers.length === 0) {
      console.error('❌ No farmers found! Please run seed-35-tanquan-farmers.js first.');
      process.exit(1);
    }

    // Hamlet Coordinate Map for Xã Đam Rông 3, Tỉnh Lâm Đồng
    const getHamletCenter = (address = '', index = 0) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      const microLat = row * 0.0025;
      const microLng = col * 0.0025;

      if (address.includes('Pang Pế Nặm')) {
        return { lat: 11.9580 + microLat, lng: 108.1890 + microLng };
      }
      if (address.includes('Liên Hương')) {
        return { lat: 11.9520 + microLat, lng: 108.1820 + microLng };
      }
      if (address.includes('Tân Tiến')) {
        return { lat: 11.9460 + microLat, lng: 108.1740 + microLng };
      }
      if (address.includes('Thôn 1') || address.includes('Thôn 2')) {
        return { lat: 11.9410 + microLat, lng: 108.1680 + microLng };
      }
      return { lat: 11.9500 + microLat, lng: 108.1800 + microLng };
    };

    let regionCount = 0;

    for (let i = 0; i < farmers.length; i++) {
      const farmer = farmers[i];
      const code = `MSVT-TQ-${String(i + 1).padStart(3, '0')}`;

      const center = getHamletCenter(farmer.address || '', i);
      const centerLat = center.lat;
      const centerLng = center.lng;

      const areaM2 = farmer.farmArea || 20000;
      const areaHa = (areaM2 / 10000).toFixed(1);
      const treeCount = Math.round(areaM2 / 65); // ~150 trees per ha

// Calculate area in m2 from GPS polygon coordinates (Green's theorem)
const calculatePolygonAreaM2 = (coords = []) => {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  const radius = 6378137;
  const rad = Math.PI / 180;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    area += (p2.lng - p1.lng) * rad * (2 + Math.sin(p1.lat * rad) + Math.sin(p2.lat * rad));
  }
  area = Math.abs((area * radius * radius) / 2);
  return Math.round(area);
};

      // Dynamic organic shapes matching farmer area with 100% exact areaM2 calibration
      let unitTemplate = [];
      const shapeType = i % 4;

      if (shapeType === 0) {
        // 5-point irregular polygon with cut corner
        unitTemplate = [
          { dLat: 0.0005, dLng: -0.0004 },
          { dLat: 0.0006, dLng: 0.0003 },
          { dLat: 0.0002, dLng: 0.0006 },
          { dLat: -0.0005, dLng: 0.0005 },
          { dLat: -0.0004, dLng: -0.0004 }
        ];
      } else if (shapeType === 1) {
        // 6-point L-shape parcel along road/contour
        unitTemplate = [
          { dLat: 0.0006, dLng: -0.0005 },
          { dLat: 0.0006, dLng: 0.0002 },
          { dLat: 0.0001, dLng: 0.0002 },
          { dLat: 0.0001, dLng: 0.0006 },
          { dLat: -0.0005, dLng: 0.0006 },
          { dLat: -0.0005, dLng: -0.0005 }
        ];
      } else if (shapeType === 2) {
        // 4-point slanted parallelogram
        unitTemplate = [
          { dLat: 0.0005, dLng: -0.0003 },
          { dLat: 0.0007, dLng: 0.0005 },
          { dLat: -0.0003, dLng: 0.0007 },
          { dLat: -0.0005, dLng: -0.0001 }
        ];
      } else {
        // 5-point organic pentagon
        unitTemplate = [
          { dLat: 0.0006, dLng: -0.0002 },
          { dLat: 0.0004, dLng: 0.0005 },
          { dLat: -0.0002, dLng: 0.0006 },
          { dLat: -0.0006, dLng: 0.0001 },
          { dLat: -0.0003, dLng: -0.0005 }
        ];
      }

      // Measure unit area and scale precisely to match farmer.farmArea (areaM2)
      const testPolygon = unitTemplate.map(pt => ({
        lat: centerLat + pt.dLat,
        lng: centerLng + pt.dLng
      }));
      const unitAreaM2 = calculatePolygonAreaM2(testPolygon);
      const scaleFactor = Math.sqrt(areaM2 / unitAreaM2);

      const polygon = unitTemplate.map(pt => ({
        lat: Number((centerLat + pt.dLat * scaleFactor).toFixed(6)),
        lng: Number((centerLng + pt.dLng * scaleFactor).toFixed(6))
      }));
      // Extract crop variety
      const cropVariety = farmer.farmName && farmer.farmName.includes('(')
        ? farmer.farmName.split('(')[1].replace(')', '')
        : 'Monthong / Dona';

      // Remove existing planting region with same code to update cleanly
      await PlantingRegion.deleteOne({ htxId: director._id, code });

      const region = new PlantingRegion({
        htxId: director._id,
        code,
        name: `Lô ${i + 1} - Sầu riêng ${farmer.fullname} (${farmer.address || 'Xã Đam Rông 3'})`,
        cropName: `Sầu riêng ${cropVariety}`,
        standard: 'VietGAP / MSVT Xuất Khẩu (GACC)',
        province: farmer.province || 'Tỉnh Lâm Đồng',
        ward: farmer.ward || 'Xã Đam Rông 3',
        address: farmer.address || 'Xã Đam Rông 3',
        areaM2,
        center: { lat: centerLat, lng: centerLng },
        boundary: polygon,
        farmerIds: [farmer._id],
        allowedPesticides: [
          { tradeName: 'Phù Đổng Sinh Học', activeIngredient: 'Trichoderma spp.', phiDays: 3, registrationNo: 'PB-2026' },
          { tradeName: 'Anvil 5SC', activeIngredient: 'Hexaconazole', phiDays: 14, registrationNo: 'BVTV-102' }
        ],
        inspectionProfile: {
          trainingReady: true,
          internalAuditReady: true,
          harvestProfileReady: true,
          salesProfileReady: true,
          gaccReady: true,
          notes: 'Vùng trồng 100ha chuẩn hóa dữ liệu GIS và hồ sơ kiểm tra GACC'
        },
        status: 'Active',
        createdBy: director._id
      });

      await region.save();

      // Update farmer model with plantingRegionId and plantingRegionCode
      farmer.plantingRegionId = region._id;
      farmer.plantingRegionCode = code;
      await farmer.save();

      regionCount++;
      console.log(`[${regionCount}/35] Created GIS Planting Region for: ${farmer.fullname} (Code: ${code} - ${areaHa} ha - ${cropVariety})`);
    }

    console.log('\n================================================');
    console.log(`🎉 ĐÃ KHỞI TẠO XONG ĐỦ 35 VÙNG TRỒNG GIS CHO 35 HỘ NÔNG DÂN!`);
    console.log('================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding planting regions:', error);
    process.exit(1);
  }
};

seed35PlantingRegions();
