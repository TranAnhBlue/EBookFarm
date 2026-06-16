/**
 * BƯỚC 1: PHÂN TÍCH PATTERNS BỊ LỖI
 * 
 * Script này sẽ:
 * 1. Tìm tất cả documents có ký tự �
 * 2. Phân tích các patterns xuất hiện nhiều lần
 * 3. Tạo danh sách patterns để sử dụng trong bước 2
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const COLLECTIONS_TO_CHECK = [
  'users',
  'htxmanagementrecords',
  'farmjournals',
  'htxjournals',
  'groups',
  'notifications',
  'news',
  'products'
];

// Lưu trữ patterns
const patternFrequency = {};
const patternExamples = {};

async function analyzePatterns() {
  try {
    console.log('🔍 BƯỚC 1: PHÂN TÍCH PATTERNS');
    console.log('='.repeat(70));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    let totalCorrupted = 0;

    for (const collName of COLLECTIONS_TO_CHECK) {
      console.log(`📂 Đang phân tích collection: ${collName}`);
      
      const collection = mongoose.connection.db.collection(collName);
      const docs = await collection.find({}).toArray();
      
      let collectionCount = 0;
      
      for (const doc of docs) {
        const docStr = JSON.stringify(doc);
        
        if (docStr.includes('�') || docStr.includes('\ufffd')) {
          collectionCount++;
          totalCorrupted++;
          
          // Phân tích các patterns trong document này
          analyzeDocument(doc, collName);
        }
      }
      
      if (collectionCount > 0) {
        console.log(`   ❌ Tìm thấy ${collectionCount} documents bị lỗi`);
      } else {
        console.log(`   ✅ OK - Không có lỗi`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 KẾT QUẢ PHÂN TÍCH');
    console.log('='.repeat(70));
    console.log(`Tổng documents bị lỗi: ${totalCorrupted}`);
    console.log(`Tổng patterns phát hiện: ${Object.keys(patternFrequency).length}`);

    // Sắp xếp patterns theo tần suất
    const sortedPatterns = Object.entries(patternFrequency)
      .sort((a, b) => b[1] - a[1]);

    console.log('\n📈 TOP 30 PATTERNS XUẤT HIỆN NHIỀU NHẤT:');
    console.log('='.repeat(70));
    
    sortedPatterns.slice(0, 30).forEach(([pattern, count], index) => {
      const example = patternExamples[pattern][0];
      console.log(`${(index + 1).toString().padStart(2)}. [${count}×] "${pattern}"`);
      console.log(`    Ví dụ: ${example.substring(0, 60)}${example.length > 60 ? '...' : ''}`);
    });

    // Lưu kết quả vào file JSON
    const analysisResult = {
      timestamp: new Date().toISOString(),
      totalCorrupted,
      totalPatterns: Object.keys(patternFrequency).length,
      patterns: sortedPatterns.map(([pattern, count]) => ({
        pattern,
        frequency: count,
        examples: patternExamples[pattern].slice(0, 3)
      }))
    };

    fs.writeFileSync(
      'step1-patterns-analysis.json',
      JSON.stringify(analysisResult, null, 2),
      'utf8'
    );

    console.log('\n✅ Đã lưu kết quả vào: step1-patterns-analysis.json');
    console.log('\n💡 Tiếp theo: Chạy step2-auto-fix-definite.js');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

function analyzeDocument(doc, collectionName) {
  // Các fields cần kiểm tra theo từng collection
  const fieldsToCheck = {
    users: ['fullname', 'organization', 'address', 'phone'],
    htxmanagementrecords: ['title', 'description', 'content'],
    htxjournals: ['name', 'description', 'content'],
    groups: ['name', 'description'],
    notifications: ['title', 'message', 'content'],
    news: ['title', 'content', 'summary'],
    products: ['name', 'description']
  };

  const fields = fieldsToCheck[collectionName] || [];
  
  fields.forEach(field => {
    if (doc[field] && typeof doc[field] === 'string') {
      extractPatterns(doc[field]);
    }
  });
}

function extractPatterns(text) {
  if (!text.includes('�')) return;

  // Pattern 1: Các từ có chứa � (word�word)
  const wordPatterns = text.match(/[\wÀ-ỹ]*�[\wÀ-ỹ]*/g);
  if (wordPatterns) {
    wordPatterns.forEach(pattern => {
      if (pattern.length >= 2) { // Bỏ qua patterns quá ngắn
        patternFrequency[pattern] = (patternFrequency[pattern] || 0) + 1;
        
        if (!patternExamples[pattern]) {
          patternExamples[pattern] = [];
        }
        if (patternExamples[pattern].length < 5) {
          patternExamples[pattern].push(text);
        }
      }
    });
  }

  // Pattern 2: Các cụm từ có chứa � (2-4 từ liền kề)
  const phrasePatterns = text.match(/(?:[\wÀ-ỹ]*�[\wÀ-ỹ]*\s+){1,3}[\wÀ-ỹ]*�?[\wÀ-ỹ]*/g);
  if (phrasePatterns) {
    phrasePatterns.forEach(pattern => {
      const trimmed = pattern.trim();
      if (trimmed.length >= 5 && trimmed.includes('�')) {
        patternFrequency[trimmed] = (patternFrequency[trimmed] || 0) + 1;
        
        if (!patternExamples[trimmed]) {
          patternExamples[trimmed] = [];
        }
        if (patternExamples[trimmed].length < 5) {
          patternExamples[trimmed].push(text);
        }
      }
    });
  }

  // Pattern 3: Câu hoàn chỉnh chứa � (để phát hiện context)
  const sentences = text.split(/[.!?]/);
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.includes('�') && trimmed.length >= 10 && trimmed.length <= 100) {
      patternFrequency[trimmed] = (patternFrequency[trimmed] || 0) + 1;
      
      if (!patternExamples[trimmed]) {
        patternExamples[trimmed] = [];
      }
      if (patternExamples[trimmed].length < 3) {
        patternExamples[trimmed].push(trimmed);
      }
    }
  });
}

console.log('🚀 Bắt đầu phân tích patterns...\n');
analyzePatterns();
