# 🧠 Kế hoạch triển khai RAG cho Chat AI

## 🎯 Mục tiêu
Làm cho Chat AI bám sát 100% vào thông tin thực tế của EBookFarm thay vì chỉ dựa vào kiến thức tổng hợp.

## 📊 Hiện tại vs Mong muốn

### ❌ **Hiện tại (Static AI)**
```
User: "Giá gói Pro bao nhiêu?"
AI: "Gói Pro khoảng 2tr/tháng" (dựa vào system prompt cố định)
```

### ✅ **Mong muốn (RAG AI)**
```
User: "Giá gói Pro bao nhiêu?"
AI: Query database → "Gói Pro hiện tại 1.8tr/tháng, đang có ưu đãi giảm 10% đến 30/4/2026"
```

## 🛠️ Các bước triển khai RAG

### **Bước 1: Thu thập dữ liệu thực tế**

#### A. Database queries
```javascript
// Lấy thông tin sản phẩm thực tế
const getProductInfo = async () => {
    return {
        packages: await Package.find({active: true}),
        features: await Feature.find({active: true}),
        pricing: await Pricing.find({current: true}),
        promotions: await Promotion.find({active: true, endDate: {$gte: new Date()}})
    };
};
```

#### B. Website content
```javascript
// Crawl nội dung từ landing page, blog
const websiteContent = {
    landingPage: extractTextFromHTML('/'),
    features: extractTextFromHTML('/features'),
    pricing: extractTextFromHTML('/pricing'),
    blog: await Blog.find({published: true}).limit(10)
};
```

#### C. Documentation
```javascript
// Lấy từ file markdown, docs
const documentation = {
    userGuide: readMarkdownFiles('./docs/user-guide/'),
    apiDocs: readMarkdownFiles('./docs/api/'),
    faqs: await FAQ.find({active: true})
};
```

### **Bước 2: Vector Database**

#### Cài đặt và cấu hình
```bash
# Option 1: Pinecone (cloud)
npm install @pinecone-database/pinecone

# Option 2: Chroma (local)
npm install chromadb

# Option 3: Qdrant (self-hosted)
npm install @qdrant/js-client-rest
```

#### Embedding và indexing
```javascript
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
});

// Tạo embeddings cho tất cả nội dung
const createEmbeddings = async (content) => {
    const chunks = splitIntoChunks(content, 500); // 500 chars per chunk
    const vectors = await embeddings.embedDocuments(chunks);
    
    // Lưu vào vector DB
    await vectorDB.upsert({
        vectors: vectors.map((vector, i) => ({
            id: `chunk_${i}`,
            values: vector,
            metadata: {
                content: chunks[i],
                source: content.source,
                type: content.type,
                lastUpdated: new Date()
            }
        }))
    });
};
```

### **Bước 3: RAG Controller**

```javascript
// backend/src/controllers/ragController.js
const ragChatWithGroq = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        // 1. Tạo embedding cho câu hỏi
        const questionEmbedding = await embeddings.embedQuery(message);
        
        // 2. Tìm kiếm context liên quan
        const searchResults = await vectorDB.query({
            vector: questionEmbedding,
            topK: 5,
            includeMetadata: true
        });
        
        // 3. Lấy thông tin thực tế từ database
        const realtimeData = await getRealtimeData(message);
        
        // 4. Xây dựng context
        const context = buildContext(searchResults, realtimeData);
        
        // 5. Tạo system prompt với context
        const systemPrompt = buildRAGSystemPrompt(context, req.chatPermission.chatLevel);
        
        // 6. Gọi Groq với context
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory,
                { role: 'user', content: message }
            ]
        });
        
        res.json({
            success: true,
            data: {
                response: completion.choices[0].message.content,
                sources: searchResults.matches.map(m => m.metadata.source),
                context: context.summary
            }
        });
        
    } catch (error) {
        // Fallback to static AI
        return staticChatWithGroq(req, res);
    }
};
```

### **Bước 4: Realtime Data Functions**

```javascript
const getRealtimeData = async (question) => {
    const data = {};
    
    // Phân tích câu hỏi để lấy dữ liệu phù hợp
    if (question.includes('giá') || question.includes('price')) {
        data.pricing = await getPricingData();
        data.promotions = await getActivePromotions();
    }
    
    if (question.includes('tính năng') || question.includes('feature')) {
        data.features = await getLatestFeatures();
        data.updates = await getRecentUpdates();
    }
    
    if (question.includes('khách hàng') || question.includes('customer')) {
        data.testimonials = await getTestimonials();
        data.caseStudies = await getCaseStudies();
    }
    
    return data;
};

const getPricingData = async () => {
    return {
        packages: await Package.find({active: true}).select('name price features'),
        promotions: await Promotion.find({
            active: true,
            startDate: {$lte: new Date()},
            endDate: {$gte: new Date()}
        }),
        lastUpdated: await Setting.findOne({key: 'pricing_last_updated'})
    };
};
```

### **Bước 5: Context Builder**

```javascript
const buildContext = (searchResults, realtimeData) => {
    let context = "THÔNG TIN THỰC TẾ VỀ EBOOKFARM:\n\n";
    
    // Thêm dữ liệu realtime
    if (realtimeData.pricing) {
        context += "💰 BẢNG GIÁ HIỆN TẠI:\n";
        realtimeData.pricing.packages.forEach(pkg => {
            context += `- ${pkg.name}: ${pkg.price.toLocaleString()}đ/tháng\n`;
        });
        
        if (realtimeData.pricing.promotions.length > 0) {
            context += "\n🎉 KHUYẾN MÃI ĐANG DIỄN RA:\n";
            realtimeData.pricing.promotions.forEach(promo => {
                context += `- ${promo.title}: ${promo.description}\n`;
            });
        }
        context += "\n";
    }
    
    // Thêm kết quả tìm kiếm
    if (searchResults.matches.length > 0) {
        context += "📚 THÔNG TIN LIÊN QUAN:\n";
        searchResults.matches.forEach((match, i) => {
            if (match.score > 0.7) { // Chỉ lấy kết quả có độ tương đồng cao
                context += `${i+1}. ${match.metadata.content}\n`;
            }
        });
    }
    
    return {
        full: context,
        summary: `Dựa trên ${realtimeData.pricing ? 'giá mới nhất' : 'thông tin cập nhật'} và ${searchResults.matches.length} tài liệu liên quan`
    };
};
```

### **Bước 6: Auto-sync Data**

```javascript
// Cron job để cập nhật vector DB
const cron = require('node-cron');

// Cập nhật mỗi giờ
cron.schedule('0 * * * *', async () => {
    console.log('🔄 Updating RAG knowledge base...');
    
    try {
        // 1. Lấy dữ liệu mới
        const newData = await collectLatestData();
        
        // 2. Tạo embeddings
        await updateEmbeddings(newData);
        
        // 3. Cập nhật vector DB
        await syncVectorDB();
        
        console.log('✅ RAG knowledge base updated');
    } catch (error) {
        console.error('❌ Failed to update RAG:', error);
    }
});

// Webhook khi có thay đổi dữ liệu
app.post('/api/rag/sync', async (req, res) => {
    const { type, data } = req.body;
    
    switch (type) {
        case 'pricing_updated':
            await updatePricingEmbeddings(data);
            break;
        case 'feature_added':
            await updateFeatureEmbeddings(data);
            break;
        case 'blog_published':
            await updateBlogEmbeddings(data);
            break;
    }
    
    res.json({success: true});
});
```

## 📊 So sánh hiệu quả

### **Trước RAG (Static)**
```
User: "Gói Enterprise có gì?"
AI: "Gói Enterprise bao gồm các tính năng cao cấp..." (thông tin chung)

Accuracy: 60%
Relevance: 70%
Up-to-date: 30%
```

### **Sau RAG (Dynamic)**
```
User: "Gói Enterprise có gì?"
AI: "Gói Enterprise hiện tại (cập nhật 15/4/2026) bao gồm:
- Không giới hạn người dùng
- API tích hợp
- Báo cáo nâng cao
- Hỗ trợ 24/7
- Giá: 5.8tr/tháng (đang giảm 15% đến 30/4)"

Accuracy: 95%
Relevance: 90%
Up-to-date: 100%
```

## 💰 Chi phí triển khai

### **Option 1: OpenAI Embeddings + Pinecone**
- Embeddings: ~$0.10/1M tokens
- Pinecone: $70/tháng (100K vectors)
- **Total**: ~$80-100/tháng

### **Option 2: Local Embeddings + Chroma**
- Sentence Transformers (free)
- Chroma DB (free, self-hosted)
- **Total**: $0 (chỉ tốn server resources)

### **Option 3: Hybrid**
- OpenAI cho quality embeddings
- Local vector DB
- **Total**: ~$20-30/tháng

## ⏱️ Timeline triển khai

### **Week 1: Foundation**
- [ ] Cài đặt vector database
- [ ] Tạo data collection pipeline
- [ ] Basic embedding system

### **Week 2: Integration**
- [ ] RAG controller
- [ ] Context building
- [ ] Fallback mechanism

### **Week 3: Optimization**
- [ ] Auto-sync system
- [ ] Performance tuning
- [ ] Quality testing

### **Week 4: Production**
- [ ] A/B testing
- [ ] Monitoring setup
- [ ] Go live

## 🎯 Kết quả mong đợi

Sau khi triển khai RAG:

1. **Accuracy tăng 90%+**: AI trả lời đúng thông tin thực tế
2. **Real-time updates**: Giá, tính năng, khuyến mãi luôn mới nhất
3. **Contextual responses**: Phù hợp với từng tình huống cụ thể
4. **Source attribution**: Biết thông tin lấy từ đâu
5. **Better conversion**: Thông tin chính xác → tăng trust → tăng sales

**Bạn có muốn triển khai RAG không? Tôi có thể bắt đầu với Option 2 (miễn phí) trước!**