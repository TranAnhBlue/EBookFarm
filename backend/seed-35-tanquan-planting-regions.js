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

    // Center Coordinates for 100ha region (Đam Rông 3 / Tân Quan grid)
    const baseLat = 11.6420;
    const baseLng = 106.9120;

    let regionCount = 0;

    for (let i = 0; i < farmers.length; i++) {
      const farmer = farmers[i];
      const code = `MSVT-TQ-${String(i + 1).padStart(3, '0')}`;
      
      // Calculate a 6x6 grid layout for 35 parcels so they sit neatly side-by-side on the GIS map
      const row = Math.floor(i / 6);
      const col = i % 6;

      const latOffset = row * 0.0035;
      const lngOffset = col * 0.0035;

      const centerLat = baseLat + latOffset;
      const centerLng = baseLng + lngOffset;

      // 4-point polygon around parcel center
      const polygon = [
        { lat: Number((centerLat + 0.0012).toFixed(6)), lng: Number((centerLng - 0.0012).toFixed(6)) },
        { lat: Number((centerLat + 0.0012).toFixed(6)), lng: Number((centerLng + 0.0012).toFixed(6)) },
        { lat: Number((centerLat - 0.0012).toFixed(6)), lng: Number((centerLng + 0.0012).toFixed(6)) },
        { lat: Number((centerLat - 0.0012).toFixed(6)), lng: Number((centerLng - 0.0012).toFixed(6)) }
      ];

      // Extract crop variety
      const cropVariety = farmer.farmName && farmer.farmName.includes('(')
        ? farmer.farmName.split('(')[1].replace(')', '')
        : 'Monthong / Dona';

      const areaM2 = farmer.farmArea || 20000;
      const areaHa = (areaM2 / 10000).toFixed(1);
      const treeCount = Math.round(areaM2 / 65); // ~150 trees per ha

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
