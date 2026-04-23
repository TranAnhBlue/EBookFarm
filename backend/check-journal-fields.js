require('dotenv').config();
const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');

async function checkJournalFields() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get one journal to check structure
    const journal = await FarmJournal.findOne().populate('schemaId').populate('userId');
    
    if (!journal) {
      console.log('❌ No journals found');
      return;
    }

    console.log('\n📋 Journal Structure:');
    console.log('ID:', journal._id);
    console.log('QR Code:', journal.qrCode);
    console.log('Status:', journal.status);
    console.log('\n🆕 New Fields:');
    console.log('- images:', journal.images ? `Array with ${journal.images.length} items` : 'undefined or empty');
    console.log('- certifications:', journal.certifications ? `Array with ${journal.certifications.length} items` : 'undefined or empty');
    console.log('- viewCount:', journal.viewCount !== undefined ? journal.viewCount : 'undefined');
    console.log('- lastViewedAt:', journal.lastViewedAt || 'undefined');

    console.log('\n📊 Full Journal Object:');
    console.log(JSON.stringify({
      _id: journal._id,
      qrCode: journal.qrCode,
      status: journal.status,
      images: journal.images,
      certifications: journal.certifications,
      viewCount: journal.viewCount,
      lastViewedAt: journal.lastViewedAt,
      schemaName: journal.schemaId?.name,
      userName: journal.userId?.username
    }, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkJournalFields();
