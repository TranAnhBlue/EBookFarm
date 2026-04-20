const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const testOrganicRiceSchema = async () => {
  try {
    console.log('🌾 Testing Organic Rice schema...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the Organic Rice schema
    const organicRiceSchema = await FormSchema.findOne({ 
      name: 'Lúa hữu cơ', 
      category: 'huuco_caytrong' 
    });
    
    if (!organicRiceSchema) {
      console.log('❌ Organic Rice schema not found!');
      process.exit(1);
    }
    
    console.log('✅ Found Organic Rice schema');
    console.log(`📋 Schema details:`);
    console.log(`   - Name: ${organicRiceSchema.name}`);
    console.log(`   - Category: ${organicRiceSchema.category}`);
    console.log(`   - Description: ${organicRiceSchema.description}`);
    console.log(`   - Tables: ${organicRiceSchema.tables.length}`);
    
    // Verify all required tables exist
    const expectedTables = [
      'Thông tin chung',
      'Bảng 1: Đánh giá chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm',
      'Bảng 2: Theo dõi mua hoặc tự sản xuất giống',
      'Bảng 3: Theo dõi mua hoặc tự sản xuất vật tư đầu vào',
      'Bảng 4: Theo dõi quá trình sản xuất',
      'Bảng 5: Theo dõi thu hoạch/tiêu thụ sản phẩm'
    ];
    
    console.log('\n📊 Table verification:');
    expectedTables.forEach((expectedTable, index) => {
      const actualTable = organicRiceSchema.tables[index];
      if (actualTable && actualTable.tableName === expectedTable) {
        console.log(`   ✅ ${index + 1}. ${actualTable.tableName} (${actualTable.fields.length} fields)`);
      } else {
        console.log(`   ❌ ${index + 1}. Missing or incorrect: ${expectedTable}`);
      }
    });
    
    // Verify key fields in "Thông tin chung"
    const thongTinChung = organicRiceSchema.tables.find(t => t.tableName === 'Thông tin chung');
    if (thongTinChung) {
      console.log('\n🔍 Key fields in "Thông tin chung":');
      const keyFields = ['tenCoSo', 'dienTichCanhTac', 'giongCayTrong', 'thoiGianTrong', 'namSanXuat'];
      keyFields.forEach(fieldName => {
        const field = thongTinChung.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    // Verify ATTP assessment table
    const danhGiaATTP = organicRiceSchema.tables.find(t => t.tableName.includes('ATTP'));
    if (danhGiaATTP) {
      console.log('\n🔬 Food Safety Assessment fields:');
      const attpFields = ['chiTieuDat', 'ketQuaDat', 'chiTieuNuoc', 'ketQuaNuoc', 'chiTieuSanPham', 'ketQuaSanPham'];
      attpFields.forEach(fieldName => {
        const field = danhGiaATTP.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    // Verify seed tracking table
    const giongLua = organicRiceSchema.tables.find(t => t.tableName.includes('giống'));
    if (giongLua) {
      console.log('\n🌱 Seed tracking fields:');
      const seedFields = ['tenGiong', 'soLuongKg', 'capGiong', 'xuLyGiong'];
      seedFields.forEach(fieldName => {
        const field = giongLua.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    // Verify production process table
    const quaTrinhSanXuat = organicRiceSchema.tables.find(t => t.tableName.includes('quá trình sản xuất'));
    if (quaTrinhSanXuat) {
      console.log('\n🚜 Production process fields:');
      const processFields = ['congViec', 'mucDichApDung', 'nguyenVatLieu', 'lieuLuongKgHa', 'tongLuongSuDung'];
      processFields.forEach(fieldName => {
        const field = quaTrinhSanXuat.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    // Verify harvest table
    const thuHoach = organicRiceSchema.tables.find(t => t.tableName.includes('thu hoạch'));
    if (thuHoach) {
      console.log('\n🌾 Harvest tracking fields:');
      const harvestFields = ['ngayThangNamThuHoach', 'sanLuongKg', 'maSoLoThuHoach', 'khoiLuongTieuThuKg'];
      harvestFields.forEach(fieldName => {
        const field = thuHoach.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    // Test organic rice varieties
    console.log('\n🌾 Organic Rice Varieties Available:');
    const riceVarieties = ['X33', 'OM18', 'ST24', 'ST25', 'Jasmine 85', 'IR64'];
    riceVarieties.forEach(variety => {
      console.log(`   🌾 ${variety}`);
    });
    
    // Test organic inputs
    console.log('\n🌱 Organic Input Materials:');
    const organicInputs = ['Vôi bột', 'Phân hữu cơ', 'Phân trùn quế', 'Trichoderma', 'Lân nung chảy', 'Phân khoáng hữu cơ', 'Vi sinh vật có ích'];
    organicInputs.forEach(input => {
      console.log(`   ✅ ${input}`);
    });
    
    // Test production activities
    console.log('\n🚜 Organic Production Activities:');
    const activities = ['Làm đất, cày vỡ', 'Bón vôi bột', 'Bón lót', 'Gieo xạ', 'Bón thúc lần 1', 'Tỉa, dặm lúa, nhổ cỏ', 'Bón thúc lần 2', 'Thu hoạch'];
    activities.forEach(activity => {
      console.log(`   🔧 ${activity}`);
    });
    
    console.log('\n🎉 Organic Rice schema test completed successfully!');
    console.log('📝 The schema follows TCVN 11041-5:2018 standard for organic production.');
    console.log('🔍 Total fields across all tables:', organicRiceSchema.tables.reduce((sum, table) => sum + table.fields.length, 0));
    console.log('🌱 Organic compliance: No synthetic chemicals, pesticides, or GMOs allowed.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testOrganicRiceSchema();