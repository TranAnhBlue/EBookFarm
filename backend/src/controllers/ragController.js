const Groq = require('groq-sdk');
const RAGDataCollector = require('../utils/ragDataCollector');
const SimpleVectorSearch = require('../utils/simpleVectorSearch');

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'gsk_demo_key'
});

// Global search engine instance
let searchEngine = new SimpleVectorSearch();
let lastDataUpdate = null;

/**
 * Khởi tạo và cập nhật RAG knowledge base
 */
const initializeRAG = async () => {
    try {
        console.log('🚀 Initializing RAG system...');
        
        // Thu thập dữ liệu từ database
        const ragData = await RAGDataCollector.collectAllData();
        
        if (ragData.length > 0) {
            // Cập nhật search engine
            searchEngine.addDocuments(ragData);
            lastDataUpdate = new Date();
            
            console.log('✅ RAG system initialized successfully');
            console.log('📊 Stats:', searchEngine.getStats());
        } else {
            console.warn('⚠️ No RAG data collected, falling back to static responses');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize RAG:', error);
        return false;
    }
};

/**
 * Lấy context liên quan từ RAG
 */
const getRelevantContext = async (query) => {
    try {
        // Tìm kiếm documents liên quan
        const searchResults = searchEngine.search(query, 3);
        
        // Phân tích query để lấy thêm context cụ thể
        const specificContext = await getSpecificContext(query);
        
        return {
            searchResults,
            specificContext,
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Error getting relevant context:', error);
        return { searchResults: [], specificContext: null };
    }
};

/**
 * Lấy context cụ thể dựa trên loại câu hỏi
 */
const getSpecificContext = async (query) => {
    const queryLower = query.toLowerCase();
    
    try {
        // Câu hỏi về giá cả
        if (queryLower.includes('giá') || queryLower.includes('chi phí') || queryLower.includes('phí')) {
            const pricingData = searchEngine.getByType('pricing_info');
            return pricingData.length > 0 ? pricingData[0].metadata : null;
        }
        
        // Câu hỏi về tính năng
        if (queryLower.includes('tính năng') || queryLower.includes('chức năng') || queryLower.includes('làm được')) {
            const productData = searchEngine.getByType('product_info');
            const technicalData = searchEngine.getByType('technical_info');
            return {
                product: productData.length > 0 ? productData[0].metadata : null,
                technical: technicalData.length > 0 ? technicalData[0].metadata : null
            };
        }
        
        // Câu hỏi về liên hệ
        if (queryLower.includes('liên hệ') || queryLower.includes('hỗ trợ') || queryLower.includes('gọi')) {
            const contactData = searchEngine.getByType('contact_info');
            return contactData.length > 0 ? contactData[0].metadata : null;
        }
        
        // Câu hỏi về tin tức/cập nhật
        if (queryLower.includes('tin tức') || queryLower.includes('cập nhật') || queryLower.includes('mới')) {
            const newsData = searchEngine.getByType('news_updates');
            return newsData.length > 0 ? newsData[0].metadata : null;
        }
        
        // Câu hỏi về TCVN/tiêu chuẩn
        if (queryLower.includes('tcvn') || queryLower.includes('tiêu chuẩn') || queryLower.includes('chứng nhận')) {
            const productData = searchEngine.getByType('product_info');
            const technicalData = searchEngine.getByType('technical_info');
            return {
                tcvnStandards: productData.length > 0 ? productData[0].metadata.data.tcvnStandards : [],
                certifications: technicalData.length > 0 ? technicalData[0].metadata.data.standards.certifications : []
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error getting specific context:', error);
        return null;
    }
};

/**
 * Xây dựng system prompt với RAG context
 */
const buildRAGSystemPrompt = (context, chatLevel) => {
    let basePrompt = `Bạn là trợ lý AI thông minh của EBookFarm - Hệ thống quản lý nông trại và truy xuất nguồn gốc nông sản.

⚠️ QUAN TRỌNG - SỬ DỤNG THÔNG TIN THỰC TẾ:
1. Sử dụng THÔNG TIN THỰC TẾ từ database được cung cấp bên dưới
2. KHÔNG đưa ra thông tin giả định hoặc ước tính
3. Nếu không có thông tin cụ thể, hãy nói "Tôi cần kiểm tra thông tin này" và đề xuất liên hệ
4. Luôn ưu tiên dữ liệu thực tế hơn kiến thức tổng hợp

`;

    // Thêm thông tin thực tế từ RAG
    if (context.specificContext) {
        basePrompt += `📊 THÔNG TIN THỰC TẾ HIỆN TẠI:\n\n`;
        
        // Thông tin giá cả thực tế
        if (context.specificContext.type === 'pricing_info') {
            basePrompt += `💰 BẢNG GIÁ CHÍNH THỨC (cập nhật ${context.specificContext.data.stats.lastPriceUpdate}):\n`;
            context.specificContext.data.packages.forEach(pkg => {
                basePrompt += `• ${pkg.name}: ${typeof pkg.price === 'number' ? pkg.price.toLocaleString() + ' VND' : pkg.price}/${pkg.period}\n`;
                basePrompt += `  - ${pkg.features.join(', ')}\n`;
                if (pkg.promotion) basePrompt += `  - 🎉 ${pkg.promotion}\n`;
            });
            
            if (context.specificContext.data.promotions.length > 0) {
                basePrompt += `\n🎉 KHUYẾN MÃI HIỆN TẠI:\n`;
                context.specificContext.data.promotions.forEach(promo => {
                    basePrompt += `• ${promo.title}: ${promo.description} (đến ${promo.validUntil})\n`;
                });
            }
        }
        
        // Thông tin sản phẩm thực tế
        if (context.specificContext.product) {
            const product = context.specificContext.product.data;
            basePrompt += `📋 TÍNH NĂNG THỰC TẾ:\n`;
            basePrompt += `• Hỗ trợ ${product.categories.channuoi} schema chăn nuôi\n`;
            basePrompt += `• Hỗ trợ ${product.categories.thuysan} schema thủy sản\n`;
            basePrompt += `• Hỗ trợ ${product.categories.caytrong} schema cây trồng\n`;
            basePrompt += `• Hỗ trợ ${product.categories.huuco} schema hữu cơ\n`;
            basePrompt += `• Tích hợp ${product.tcvnStandards.length} tiêu chuẩn TCVN\n`;
        }
        
        // Thông tin liên hệ thực tế
        if (context.specificContext.type === 'contact_info') {
            const contact = context.specificContext.data;
            basePrompt += `📞 THÔNG TIN LIÊN HỆ CHÍNH THỨC:\n`;
            basePrompt += `• Hotline: ${contact.company.hotline}\n`;
            basePrompt += `• Email: ${contact.company.email}\n`;
            basePrompt += `• Website: ${contact.company.website}\n`;
            basePrompt += `• Địa chỉ: ${contact.company.address}\n`;
            basePrompt += `• Giờ làm việc: ${contact.support.workingHours}\n`;
            basePrompt += `• Thời gian phản hồi: ${contact.support.responseTime}\n`;
        }
        
        basePrompt += `\n`;
    }

    // Thêm kết quả tìm kiếm
    if (context.searchResults && context.searchResults.length > 0) {
        basePrompt += `🔍 THÔNG TIN LIÊN QUAN:\n`;
        context.searchResults.forEach((result, index) => {
            if (result.score > 0.1) {
                basePrompt += `${index + 1}. [${result.type}] Score: ${result.score.toFixed(2)}\n`;
            }
        });
        basePrompt += `\n`;
    }

    // Thêm hướng dẫn theo cấp độ
    switch (chatLevel) {
        case 'guest':
            basePrompt += `🚫 GIỚI HẠN CHO KHÁCH VÃNG LAI:
- Cung cấp thông tin cơ bản dựa trên dữ liệu thực tế
- Khuyến khích đăng ký để được tư vấn chi tiết
- Cuối mỗi câu trả lời: "💡 Đăng ký miễn phí để được tư vấn chi tiết hơn!"`;
            break;
            
        case 'user':
            basePrompt += `✅ QUYỀN LỢI USER:
- Cung cấp thông tin chi tiết dựa trên dữ liệu thực tế
- Báo giá chính xác từ bảng giá hiện tại
- Tư vấn kỹ thuật chi tiết`;
            break;
            
        case 'admin':
        case 'vip':
            basePrompt += `👑 QUYỀN LỢI VIP/ADMIN:
- Thông tin đầy đủ và chính xác nhất
- Báo giá chi tiết với ưu đãi đặc biệt
- Hỗ trợ kỹ thuật nâng cao`;
            break;
    }

    return basePrompt;
};

/**
 * RAG Chat với Groq
 */
const ragChatWithGroq = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tin nhắn!'
            });
        }

        // Kiểm tra và cập nhật RAG nếu cần
        if (!lastDataUpdate || (Date.now() - lastDataUpdate.getTime()) > 3600000) { // 1 hour
            await initializeRAG();
        }

        // Lấy context liên quan
        const context = await getRelevantContext(message);
        
        // Xây dựng system prompt với RAG
        const systemPrompt = buildRAGSystemPrompt(context, req.chatPermission.chatLevel);
        
        // Xây dựng messages
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Thêm lịch sử hội thoại
        conversationHistory.forEach(msg => {
            messages.push({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.text
            });
        });

        // Thêm tin nhắn hiện tại
        messages.push({
            role: 'user',
            content: message
        });

        console.log(`🧠 RAG Chat (${req.chatPermission.chatLevel.toUpperCase()}): Found ${context.searchResults.length} relevant docs`);

        // Gọi Groq API
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: messages,
            max_tokens: 2048,
            temperature: 0.7, // Giảm temperature để chính xác hơn
            top_p: 0.9,
            stream: false
        });

        const response = completion.choices[0].message.content;

        res.json({
            success: true,
            message: 'RAG Chat thành công',
            data: {
                response: response,
                timestamp: new Date(),
                model: 'llama-3.1-8b-instant',
                usage: completion.usage,
                chatLevel: req.chatPermission.chatLevel,
                remainingChats: req.chatPermission.remainingChats,
                ragInfo: {
                    documentsFound: context.searchResults.length,
                    hasSpecificContext: !!context.specificContext,
                    lastDataUpdate: lastDataUpdate
                }
            }
        });

    } catch (error) {
        console.error('RAG Chat Error:', error);
        
        // Fallback to static chat
        const fallbackResponse = getFallbackResponse(req.body.message);
        
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra với RAG system',
            error: error.message,
            fallbackResponse: fallbackResponse,
            ragFallback: true
        });
    }
};

/**
 * Fallback responses khi RAG thất bại
 */
const getFallbackResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('giá') || msg.includes('chi phí')) {
        return '💰 Hiện tại hệ thống đang cập nhật bảng giá mới nhất. Vui lòng liên hệ hotline 1900 1234 để nhận báo giá chính xác và ưu đãi đặc biệt!';
    } else if (msg.includes('tính năng') || msg.includes('chức năng')) {
        return '📋 EBookFarm cung cấp giải pháp toàn diện cho quản lý nông trại và truy xuất nguồn gốc. Để biết chi tiết các tính năng phù hợp với nhu cầu của bạn, vui lòng liên hệ 1900 1234!';
    } else {
        return 'Cảm ơn bạn đã quan tâm đến EBookFarm! 😊 Để được tư vấn chi tiết nhất, vui lòng liên hệ hotline 1900 1234 hoặc email contact@ebookfarm.vn';
    }
};

/**
 * Test RAG system
 */
const testRAGSystem = async (req, res) => {
    try {
        // Khởi tạo RAG
        const initialized = await initializeRAG();
        
        if (!initialized) {
            return res.status(500).json({
                success: false,
                message: 'Failed to initialize RAG system'
            });
        }

        // Test search
        const testQuery = 'giá gói chuyên nghiệp';
        const context = await getRelevantContext(testQuery);
        
        res.json({
            success: true,
            message: 'RAG system test successful',
            data: {
                stats: searchEngine.getStats(),
                testQuery: testQuery,
                searchResults: context.searchResults,
                specificContext: context.specificContext ? 'Found' : 'Not found',
                lastDataUpdate: lastDataUpdate
            }
        });
        
    } catch (error) {
        console.error('RAG Test Error:', error);
        res.status(500).json({
            success: false,
            message: 'RAG test failed',
            error: error.message
        });
    }
};

/**
 * Cập nhật RAG data thủ công
 */
const updateRAGData = async (req, res) => {
    try {
        const success = await initializeRAG();
        
        res.json({
            success: success,
            message: success ? 'RAG data updated successfully' : 'Failed to update RAG data',
            data: {
                stats: searchEngine.getStats(),
                lastUpdate: lastDataUpdate
            }
        });
    } catch (error) {
        console.error('Update RAG Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update RAG data',
            error: error.message
        });
    }
};

// Khởi tạo RAG khi server start
initializeRAG();

module.exports = {
    ragChatWithGroq,
    testRAGSystem,
    updateRAGData,
    initializeRAG
};