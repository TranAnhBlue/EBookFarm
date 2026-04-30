// Test file to verify uuid works
console.log('Testing uuid import...');

try {
  const { v4: uuidv4 } = require('uuid');
  console.log('✅ UUID imported successfully');
  console.log('Generated UUID:', uuidv4());
} catch (error) {
  console.error('❌ UUID import failed:', error.message);
  console.error('Error stack:', error.stack);
}

console.log('Node version:', process.version);
console.log('Platform:', process.platform);
