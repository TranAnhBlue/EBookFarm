const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
const FormSchema = require('./src/models/FormSchema');
const User = require('./src/models/User');
require('dotenv').config();

async function checkJournals() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count total journals
    const total = await FarmJournal.countDocuments();
    console.log(`📊 Tổng số nhật ký: ${total}`);

    // Get recent journals
    const recent = await FarmJournal.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('schemaId', 'name')
      .populate('userId', 'username');

    console.log('\n📝 5 nhật ký gần nhất:');
    recent.forEach((j, i) => {
      console.log(`\n${i + 1}. ${j.qrCode}`);
      console.log(`   Schema: ${j.schemaId?.name || 'N/A'}`);
      console.log(`   User: ${j.userId?.username || 'N/A'}`);
      console.log(`   Status: ${j.status}`);
      console.log(`   Created: ${j.createdAt}`);
      console.log(`   Entries: ${Object.keys(j.entries || {}).length} tables`);
    });

    // Check by status
    const statuses = await FarmJournal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Phân bố theo trạng thái:');
    statuses.forEach(s => {
      console.log(`   ${s._id}: ${s.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

checkJournals();
