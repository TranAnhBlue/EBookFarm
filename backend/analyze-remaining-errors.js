/**
 * PHÂN TÍCH CHI TIẾT 109 DOCUMENTS CÒN LỖI
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function analyzeRemainingErrors() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối\n');

    console.log('🔍 PHÂN TÍCH CHI TIẾT CÁC PATTERNS CÒN LỖI');
    console.log('='.repeat(70));

    const collections = [
      { name: 'users', fields: ['fullname', 'organization', 'address', 'email', 'username'] },
      { name: 'notifications', fields: ['title', 'message', 'content'] }
    ];

    const patternCounts = {};
    const examples = {};

    for (const { name: collName, fields } of collections) {
      console.log(`\n📂 Collection: ${collName}`);
      
      const collection = mongoose.connection.db.collection(collName);
      const docs = await collection.find({}).toArray();
      
      let count = 0;
      
      for (const doc of docs) {
        let hasError = false;
        
        for (const field of fields) {
          if (doc[field] && typeof doc[field] === 'string' && doc[field].includes('�')) {
            hasError = true;
            
            // Extract patterns
            const text = doc[field];
            const matches = text.match(/[\wÀ-ỹ]*�[\wÀ-ỹ]*/g);
            
            if (matches) {
              matches.forEach(pattern => {
                if (pattern.length >= 2) {
                  if (!patternCounts[pattern]) {
                    patternCounts[pattern] = 0;
                    examples[pattern] = [];
                  }
                  patternCounts[pattern]++;
                  
                  if (examples[pattern].length < 3) {
                    examples[pattern].push({
                      collection: collName,
                      field,
                      text: text.substring(0, 100),
                      _id: doc._id.toString()
                    });
                  }
                }
              });
            }
            
            if (count < 5) {
              console.log(`   _id: ${doc._id}`);
              console.log(`   ${field}: ${text.substring(0, 80)}...`);
            }
          }
        }
        
        if (hasError) count++;
      }
      
      console.log(`   📊 Tổng: ${count} documents`);
    }

    // Sort patterns by frequency
    const sorted = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1]);

    console.log('\n\n' + '='.repeat(70));
    console.log('📈 TOP PATTERNS CÒN LỖI (theo tần suất):');
    console.log('='.repeat(70));

    sorted.forEach(([pattern, count], index) => {
      console.log(`\n${(index + 1).toString().padStart(2)}. [${count}×] "${pattern}"`);
      
      // Show examples
      examples[pattern].slice(0, 2).forEach(ex => {
        console.log(`    ${ex.collection}.${ex.field}: ${ex.text}...`);
      });
    });

    // Lưu kết quả
    const result = {
      timestamp: new Date().toISOString(),
      totalPatterns: sorted.length,
      patterns: sorted.map(([pattern, count]) => ({
        pattern,
        frequency: count,
        examples: examples[pattern]
      }))
    };

    fs.writeFileSync(
      'remaining-errors-analysis.json',
      JSON.stringify(result, null, 2),
      'utf8'
    );

    console.log('\n\n✅ Đã lưu phân tích vào: remaining-errors-analysis.json');
    console.log('\n💡 Sẽ tạo script dựa trên patterns này');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

analyzeRemainingErrors();
