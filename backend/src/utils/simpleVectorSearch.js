const natural = require('natural');
const similarity = require('cosine-similarity');

/**
 * Simple Vector Search Engine sử dụng TF-IDF và Cosine Similarity
 * Thay thế cho vector database phức tạp
 */
class SimpleVectorSearch {
    constructor() {
        this.documents = [];
        this.tfidf = new natural.TfIdf();
        this.isIndexed = false;
    }

    /**
     * Thêm documents vào index
     */
    addDocuments(documents) {
        this.documents = [];
        this.tfidf = new natural.TfIdf();
        
        documents.forEach((doc, index) => {
            const text = this.extractText(doc);
            this.documents.push({
                id: index,
                content: text,
                metadata: doc,
                type: doc.type || 'unknown'
            });
            
            // Thêm vào TF-IDF
            this.tfidf.addDocument(text);
        });
        
        this.isIndexed = true;
        console.log(`📚 Indexed ${this.documents.length} documents for search`);
    }

    /**
     * Trích xuất text từ document object
     */
    extractText(doc) {
        let text = '';
        
        if (doc.type === 'product_info') {
            text += `Sản phẩm EBookFarm hỗ trợ ${doc.data.categories.channuoi} schema chăn nuôi, `;
            text += `${doc.data.categories.thuysan} schema thủy sản, `;
            text += `${doc.data.categories.caytrong} schema cây trồng, `;
            text += `${doc.data.categories.huuco} schema hữu cơ. `;
            
            doc.data.schemas.forEach(schema => {
                text += `Schema ${schema.name} thuộc danh mục ${schema.category} với ${schema.fieldCount} trường dữ liệu. `;
            });
            
            doc.data.tcvnStandards.forEach(tcvn => {
                text += `Tiêu chuẩn TCVN ${tcvn.code}: ${tcvn.title} - ${tcvn.description}. `;
            });
        }
        
        else if (doc.type === 'pricing_info') {
            doc.data.packages.forEach(pkg => {
                text += `Gói ${pkg.name} giá ${typeof pkg.price === 'number' ? pkg.price.toLocaleString() + ' VND' : pkg.price} mỗi ${pkg.period}. `;
                text += `Tính năng: ${pkg.features.join(', ')}. `;
                text += `Phù hợp cho ${pkg.target}. `;
                if (pkg.promotion) text += `Khuyến mãi: ${pkg.promotion}. `;
            });
            
            doc.data.promotions.forEach(promo => {
                text += `Khuyến mãi ${promo.title}: ${promo.description}. Có hiệu lực đến ${promo.validUntil}. `;
            });
        }
        
        else if (doc.type === 'news_updates') {
            doc.data.recentNews.forEach(news => {
                text += `Tin tức ${news.title}: ${news.summary}. Danh mục ${news.category}. `;
            });
            
            doc.data.systemUpdates.forEach(update => {
                text += `Cập nhật phiên bản ${update.version} ngày ${update.date}: ${update.features.join(', ')}. `;
            });
        }
        
        else if (doc.type === 'contact_info') {
            const company = doc.data.company;
            text += `Công ty ${company.name} - ${company.fullName}. `;
            text += `Website ${company.website}, email ${company.email}, hotline ${company.hotline}. `;
            text += `Địa chỉ: ${company.address}. `;
            
            const support = doc.data.support;
            text += `Giờ làm việc: ${support.workingHours}. `;
            text += `Thời gian phản hồi: ${support.responseTime}. `;
            text += `Kênh hỗ trợ: ${support.channels.join(', ')}. `;
        }
        
        else if (doc.type === 'technical_info') {
            text += `Tích hợp với: ${doc.data.integrations.join(', ')}. `;
            text += `Hỗ trợ ${doc.data.standards.tcvnSupported} tiêu chuẩn TCVN, ${doc.data.standards.schemaTypes} loại schema. `;
            text += `Danh mục: ${doc.data.standards.categories.join(', ')}. `;
            text += `Chứng nhận: ${doc.data.standards.certifications.join(', ')}. `;
            text += `Nền tảng ${doc.data.technology.platform}, cơ sở dữ liệu ${doc.data.technology.database}. `;
            text += `Bảo mật ${doc.data.technology.security}, uptime ${doc.data.technology.uptime}. `;
        }
        
        return text.toLowerCase();
    }

    /**
     * Tìm kiếm documents liên quan
     */
    search(query, topK = 5) {
        if (!this.isIndexed) {
            console.warn('⚠️ Search index not ready');
            return [];
        }

        const queryLower = query.toLowerCase();
        const results = [];

        // Tính TF-IDF similarity
        this.tfidf.tfidfs(queryLower, (i, measure) => {
            if (measure > 0) {
                results.push({
                    id: i,
                    score: measure,
                    content: this.documents[i].content,
                    metadata: this.documents[i].metadata,
                    type: this.documents[i].type
                });
            }
        });

        // Sắp xếp theo score và lấy top K
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }

    /**
     * Tìm kiếm theo từ khóa cụ thể
     */
    searchByKeywords(keywords, topK = 3) {
        if (!this.isIndexed) return [];

        const results = [];
        const keywordLower = keywords.map(k => k.toLowerCase());

        this.documents.forEach((doc, index) => {
            let score = 0;
            const content = doc.content.toLowerCase();
            
            keywordLower.forEach(keyword => {
                const matches = (content.match(new RegExp(keyword, 'g')) || []).length;
                score += matches;
            });

            if (score > 0) {
                results.push({
                    id: index,
                    score: score,
                    content: doc.content,
                    metadata: doc.metadata,
                    type: doc.type
                });
            }
        });

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }

    /**
     * Lấy thông tin theo loại
     */
    getByType(type) {
        return this.documents.filter(doc => doc.type === type);
    }

    /**
     * Thống kê index
     */
    getStats() {
        const typeCount = {};
        this.documents.forEach(doc => {
            typeCount[doc.type] = (typeCount[doc.type] || 0) + 1;
        });

        return {
            totalDocuments: this.documents.length,
            isIndexed: this.isIndexed,
            typeBreakdown: typeCount
        };
    }
}

module.exports = SimpleVectorSearch;