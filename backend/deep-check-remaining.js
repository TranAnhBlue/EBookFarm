/**
 * KIỂM TRA SÂU - Tìm chính xác field nào còn lỗi
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function deepCheck() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối\n');

    console.log('🔍 KIỂM TRA SÂU - TÌM CHÍNH XÁC FIELD NÀO CÒN LỖI');
    console.log('='.repeat(70));

    const Users = mongoose.connection.db.collection('users');
    const users = await Users.find({}).toArray();
    
    let count = 0;
    const fieldsWithErrors = {};
    
    for (const user of users) {
      const docStr = JSON.stringify(user);
      
      if (docStr.includes('�')) {
        count++;
        
        // Tìm chính xác field nào có lỗi
        for (const [key, value] of Object.entries(user)) {
          if (value && typeof value === 'string' && value.includes('�')) {
            if (!fieldsWithErrors[key]) {
              fieldsWithErrors[key] = 0;
            }
            fieldsWithErrors[key]++;
            
            if (count <= 10) {
              console.log(`\n_id: ${user._id}`);
              console.log(`Field "${key}": ${value.substring(0, 80)}`);
            }
          }
        }
      }
    }
    
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 THỐNG KÊ THEO FIELD:');
    console.log('='.repeat(70));
    
    Object.entries(fieldsWithErrors)
      .sort((a, b) => b[1] - a[1])
      .forEach(([field, count]) => {
        console.log(`${field}: ${count} documents`);
      });
    
    console.log('\n\n📊 Tổng: ' + count + ' documents có lỗi');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

deepCheck();
