const mongoose = require('mongoose');
const News = require('./src/models/News');
require('dotenv').config();

const seedNews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing news to avoid duplicates
    await News.deleteMany({});

    const newsData = [
      {
        title: 'Hợp tác xã Krông Pắc đẩy mạnh xuất khẩu sầu riêng sang thị trường Trung Quốc',
        summary: 'Nhờ áp dụng nhật ký canh tác điện tử EBookFarm, các hộ nông dân tại Krông Pắc đã kiểm soát tốt quy trình VietGAP, giúp nâng cao giá trị thương phẩm...',
        content: 'Nội dung chi tiết về xuất khẩu sầu riêng...',
        category: 'Sản xuất',
        image: 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80',
        publishedAt: new Date()
      },
      {
        title: 'Xu hướng nông nghiệp thông minh: Chuyển đổi số trong quản lý trang trại',
        summary: 'Chuyên gia nông nghiệp nhận định việc quản lý dữ liệu realtime giúp giảm thiểu rủi ro dịch bệnh đến 30% và tiết kiệm 20% chi phí vật tư nông nghiệp...',
        content: 'Nội dung chi tiết về nông nghiệp thông minh...',
        category: 'Công nghệ',
        image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
        publishedAt: new Date(Date.now() - 86400000 * 3) // 3 days ago
      },
      {
        title: 'Nâng cao giá trị nông sản qua tem truy xuất nguồn gốc QR Code',
        summary: 'Việc dán tem điện tử giúp người tiêu dùng an tâm về nguồn gốc sản phẩm, đồng thời giúp HTX quản lý tốt hơn sản lượng cung ứng ra thị trường...',
        content: 'Nội dung chi tiết về QR Code...',
        category: 'Công nghệ',
        image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=800&q=80',
        publishedAt: new Date(Date.now() - 86400000 * 5)
      },
      {
        title: 'Bản tin thị trường: Giá cà phê và sầu riêng đạt đỉnh trong tuần qua',
        summary: 'Thị trường XK ghi nhận sự tăng trưởng mạnh mẽ của các mặt hàng nông sản chủ lực. Giá sầu riêng tại vườn giữ mức ổn định từ 80.000 - 100.000đ/kg...',
        content: 'Nội dung chi tiết về thị trường...',
        category: 'Thị trường',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        publishedAt: new Date(Date.now() - 86400000 * 7)
      }
    ];

    await News.insertMany(newsData);
    console.log('Seeded news successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedNews();
