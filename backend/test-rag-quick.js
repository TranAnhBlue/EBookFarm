// Quick test để kiểm tra RAG system
const testRAG = async () => {
    try {
        console.log('🧪 Testing RAG System...');
        
        // Test 1: RAG System Status
        const testResponse = await fetch('http://localhost:5000/api/rag/test');
        const testData = await testResponse.json();
        
        if (testData.success) {
            console.log('✅ RAG System: OK');
            console.log('📊 Documents:', testData.data.stats.totalDocuments);
            console.log('🔍 Types:', Object.keys(testData.data.stats.typeBreakdown).join(', '));
        } else {
            console.log('❌ RAG System: FAILED');
        }
        
        // Test 2: RAG Chat (Guest)
        const chatResponse = await fetch('http://localhost:5000/api/rag/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Giá gói chuyên nghiệp bao nhiêu?'
            })
        });
        
        const chatData = await chatResponse.json();
        
        if (chatData.success) {
            console.log('✅ RAG Chat: OK');
            console.log('🤖 Response:', chatData.data.response.substring(0, 100) + '...');
        } else if (chatData.requireUpgrade) {
            console.log('⚠️ RAG Chat: Permission limit (expected for guest)');
        } else {
            console.log('❌ RAG Chat: FAILED');
        }
        
        console.log('\n🎉 RAG System test completed!');
        console.log('📝 Next steps:');
        console.log('   1. Visit http://localhost:5174/admin/rag-test');
        console.log('   2. Login as admin (admin@gmail.com / 123456)');
        console.log('   3. Test RAG system with real data');
        console.log('   4. Use AI Chat widget to see the difference');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testRAG();