const FormSchema = require('../models/FormSchema');
const News = require('../models/News');
const User = require('../models/User');
const Group = require('../models/Group');
const TCVN = require('../models/TCVN');
const FarmJournal = require('../models/FarmJournal');
const HtxJournal = require('../models/HtxJournal');
const AgriModel = require('../models/AgriModel');
const Inventory = require('../models/Inventory');
const Consultation = require('../models/Consultation');

/**
 * Thu thập dữ liệu thực từ database để cung cấp cho RAG
 */
class RAGDataCollector {
    
    /**
     * Lấy thông tin sản phẩm và tính năng thực tế
     */
    static async getProductInfo() {
        try {
            const schemas = await FormSchema.find({ active: true }).select('name category description fields');
            const tcvnStandards = await TCVN.find({ active: true }).select('code title description category');
            
            return {
                type: 'product_info',
                lastUpdated: new Date(),
                data: {
                    schemas: schemas.map(schema => ({
                        name: schema.name,
                        category: schema.category,
                        description: schema.description,
                        fieldCount: schema.fields ? schema.fields.length : 0
                    })),
                    tcvnStandards: tcvnStandards.map(tcvn => ({
                        code: tcvn.code,
                        title: tcvn.title,
                        description: tcvn.description,
                        category: tcvn.category
                    })),
                    categories: {
                        channuoi: schemas.filter(s => s.category === 'channuoi').length,
                        thuysan: schemas.filter(s => s.category === 'thuysan').length,
                        caytrong: schemas.filter(s => s.category === 'caytrong').length,
                        huuco: schemas.filter(s => s.category.includes('huuco')).length
                    }
                }
            };
        } catch (error) {
            console.error('Error collecting product info:', error);
            return null;
        }
    }

    /**
     * Lấy thông tin giá cả và gói dịch vụ (mô phỏng)
     */
    static async getPricingInfo() {
        try {
            // Lấy số lượng user để ước tính pricing tiers
            const userCount = await User.countDocuments();
            const groupCount = await Group.countDocuments();
            
            return {
                type: 'pricing_info',
                lastUpdated: new Date(),
                data: {
                    packages: [
                        {
                            name: 'Gói Cơ bản',
                            price: 500000,
                            currency: 'VND',
                            period: 'tháng',
                            features: [
                                'Nhật ký điện tử cơ bản',
                                'Tối đa 100 mã QR/tháng',
                                'Hỗ trợ email',
                                'Phù hợp nông hộ nhỏ (< 5ha)'
                            ],
                            target: 'Nông hộ nhỏ'
                        },
                        {
                            name: 'Gói Chuyên nghiệp',
                            price: 1800000,
                            currency: 'VND',
                            period: 'tháng',
                            features: [
                                'Đầy đủ tính năng nhật ký',
                                'Tối đa 1000 mã QR/tháng',
                                'Báo cáo & phân tích',
                                'Hỗ trợ điện thoại',
                                'Phù hợp HTX và trang trại (5-50ha)'
                            ],
                            target: 'HTX và trang trại vừa',
                            promotion: 'Giảm 10% cho khách hàng mới'
                        },
                        {
                            name: 'Gói Doanh nghiệp',
                            price: 'Báo giá riêng',
                            currency: 'VND',
                            period: 'tháng',
                            features: [
                                'Giải pháp toàn diện',
                                'Không giới hạn mã QR',
                                'Tùy chỉnh theo yêu cầu',
                                'API tích hợp',
                                'Hỗ trợ 24/7',
                                'Đào tạo chuyên sâu'
                            ],
                            target: 'Doanh nghiệp lớn'
                        }
                    ],
                    promotions: [
                        {
                            title: 'Ưu đãi khách hàng mới',
                            description: 'Giảm 15% phí đăng ký cho 3 tháng đầu',
                            validUntil: '2026-06-30',
                            conditions: 'Áp dụng cho Gói Chuyên nghiệp và Doanh nghiệp'
                        }
                    ],
                    stats: {
                        currentUsers: userCount,
                        activeGroups: groupCount,
                        lastPriceUpdate: '2026-04-01'
                    }
                }
            };
        } catch (error) {
            console.error('Error collecting pricing info:', error);
            return null;
        }
    }

    /**
     * Lấy tin tức và cập nhật mới nhất
     */
    static async getNewsAndUpdates() {
        try {
            const recentNews = await News.find({ published: true })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('title content summary category createdAt');

            return {
                type: 'news_updates',
                lastUpdated: new Date(),
                data: {
                    recentNews: recentNews.map(news => ({
                        title: news.title,
                        summary: news.summary || news.content.substring(0, 200) + '...',
                        category: news.category,
                        publishedAt: news.createdAt
                    })),
                    systemUpdates: [
                        {
                            version: '2.1.0',
                            date: '2026-04-15',
                            features: [
                                'Cải thiện giao diện AI Chat',
                                'Thêm hệ thống phân quyền chat',
                                'Tối ưu hiệu suất truy xuất QR'
                            ]
                        },
                        {
                            version: '2.0.5',
                            date: '2026-04-01',
                            features: [
                                'Sửa lỗi đồng bộ dữ liệu',
                                'Cập nhật tiêu chuẩn TCVN mới',
                                'Thêm báo cáo thống kê nâng cao'
                            ]
                        }
                    ]
                }
            };
        } catch (error) {
            console.error('Error collecting news and updates:', error);
            return null;
        }
    }

    /**
     * Lấy thông tin liên hệ và hỗ trợ thực tế
     */
    static async getContactInfo() {
        return {
            type: 'contact_info',
            lastUpdated: new Date(),
            data: {
                company: {
                    name: 'EBookFarm',
                    fullName: 'Hệ thống Nhật ký Sản xuất & Truy xuất Nguồn gốc Nông sản',
                    website: 'https://ebookfarm.vn',
                    email: 'contact@ebookfarm.vn',
                    hotline: '1900 1234',
                    address: 'Tầng 10, Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP.HCM'
                },
                support: {
                    workingHours: 'Thứ 2 - Thứ 6: 8:00 - 17:30, Thứ 7: 8:00 - 12:00',
                    responseTime: 'Phản hồi trong vòng 30 phút (giờ hành chính)',
                    channels: ['Hotline', 'Email', 'Live Chat', 'Zalo OA'],
                    emergencySupport: '24/7 cho khách hàng Gói Doanh nghiệp'
                },
                sales: {
                    demoBooking: 'Đặt lịch demo miễn phí qua hotline hoặc website',
                    consultationFee: 'Tư vấn miễn phí',
                    trialPeriod: '14 ngày dùng thử miễn phí'
                }
            }
        };
    }

    /**
     * Lấy thông tin kỹ thuật và tích hợp
     */
    static async getTechnicalInfo() {
        try {
            const schemaCount = await FormSchema.countDocuments({ active: true });
            const tcvnCount = await TCVN.countDocuments({ active: true });
            
            return {
                type: 'technical_info',
                lastUpdated: new Date(),
                data: {
                    integrations: [
                        'Cổng TXNG Quốc gia',
                        'VietGAP Database',
                        'Hệ thống ERP',
                        'Mobile Apps (iOS/Android)',
                        'API RESTful'
                    ],
                    standards: {
                        tcvnSupported: tcvnCount,
                        schemaTypes: schemaCount,
                        categories: ['Chăn nuôi', 'Thủy sản', 'Cây trồng', 'Hữu cơ'],
                        certifications: ['ISO 27001', 'VietGAP', 'GlobalGAP']
                    },
                    technology: {
                        platform: 'Cloud-based',
                        database: 'MongoDB',
                        security: 'SSL/TLS, OAuth 2.0',
                        backup: 'Tự động hàng ngày',
                        uptime: '99.9%'
                    },
                    features: {
                        qrGeneration: 'Tạo mã QR truy xuất nguồn gốc không giới hạn',
                        mobileApp: 'Hỗ trợ Responsive Web App',
                        reporting: 'Báo cáo thống kê thời gian thực',
                        traceability: 'Truy xuất nguồn gốc toàn chuỗi cung ứng',
                        dynamicForms: 'Quản lý form nhật ký động (FormSchema) cho Chăn nuôi, Thủy sản, Cây trồng',
                        aiAssistant: 'Trợ lý ảo AI (RAG) tư vấn trực tuyến',
                        voiceInput: 'Nhập liệu bằng giọng nói (Voice Input)',
                        excelExport: 'Xuất/Nhập dữ liệu Excel nhanh chóng',
                        htxManagement: 'Quản lý thành viên và nhật ký Hợp tác xã (HTX)',
                        inventory: 'Quản lý kho vật tư nông nghiệp',
                        agriModels: 'Quản lý các mô hình nông nghiệp chuẩn',
                        tcvn: 'Tích hợp 35+ tiêu chuẩn TCVN'
                    }
                }
            };
        } catch (error) {
            console.error('Error collecting technical info:', error);
            return null;
        }
    }

    /**
     * Lấy thống kê chi tiết toàn bộ hệ thống
     */
    static async getSystemStats() {
        try {
            const [
                userCount, groupCount, farmJournalCount, htxJournalCount,
                agriModelCount, inventoryCount, newsCount, consultationCount
            ] = await Promise.all([
                User.countDocuments(),
                Group.countDocuments(),
                FarmJournal.countDocuments(),
                HtxJournal.countDocuments(),
                AgriModel.countDocuments(),
                Inventory.countDocuments(),
                News.countDocuments(),
                Consultation.countDocuments()
            ]);

            return {
                type: 'system_stats',
                lastUpdated: new Date(),
                data: {
                    stats: {
                        users: userCount,
                        groups: groupCount,
                        farmJournals: farmJournalCount,
                        htxJournals: htxJournalCount,
                        agriModels: agriModelCount,
                        inventories: inventoryCount,
                        news: newsCount,
                        consultations: consultationCount
                    },
                    description: `Hệ thống EBookFarm hiện đang quản lý ${userCount} người dùng, ${groupCount} hợp tác xã, ${farmJournalCount + htxJournalCount} nhật ký sản xuất, ${agriModelCount} mô hình nông nghiệp và ${inventoryCount} mặt hàng trong kho.`
                }
            };
        } catch (error) {
            console.error('Error collecting system stats:', error);
            return null;
        }
    }

    /**
     * Thu thập tất cả dữ liệu
     */
    static async collectAllData() {
        try {
            console.log('🔄 Collecting RAG data from database...');
            
            const [productInfo, pricingInfo, newsUpdates, contactInfo, technicalInfo, systemStats] = await Promise.all([
                this.getProductInfo(),
                this.getPricingInfo(),
                this.getNewsAndUpdates(),
                this.getContactInfo(),
                this.getTechnicalInfo(),
                this.getSystemStats()
            ]);

            const allData = [productInfo, pricingInfo, newsUpdates, contactInfo, technicalInfo, systemStats]
                .filter(data => data !== null);

            console.log(`✅ Collected ${allData.length} data sources for RAG`);
            return allData;
        } catch (error) {
            console.error('❌ Error collecting RAG data:', error);
            return [];
        }
    }
}

module.exports = RAGDataCollector;