const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

// 35 Exact Farmer Records from the provided Excel spreadsheets
const rawFarmersData = [
  { stt: 1, fullname: 'Nguyễn Văn Mạnh', birthYear: 1978, address: 'Thôn Tân Tiến', cccd: '040078025365', phone: '0356384198', areaHa: 3.6, crop: 'Monthong', email: 'nguyenvanmanh@gmail.com', pass: 'Manh2026' },
  { stt: 2, fullname: 'Lương Quỳnh', birthYear: 1968, address: 'Thôn Tân Tiến', cccd: '', phone: '0399653428', areaHa: 4.5, crop: 'Monthong', email: 'luongquynh@gmail.com', pass: 'Quynh123' },
  { stt: 3, fullname: 'Lờ Quốc Hùng', birthYear: 1976, address: 'Thôn Tân Tiến', cccd: '056079015598', phone: '0397598637', areaHa: 2.0, crop: 'Monthong', email: 'loquochung@gmail.com', pass: 'Hung2026' },
  { stt: 4, fullname: 'Lờ Quốc Cường', birthYear: 1976, address: 'Thôn Tân Tiến', cccd: '', phone: '0868028485', areaHa: 2.0, crop: 'Monthong', email: 'loquoccuong@gmail.com', pass: 'Quoc2026' },
  { stt: 5, fullname: 'Lờ Quốc Dũng', birthYear: 1981, address: 'Thôn Tân Tiến', cccd: '', phone: '0909249124', areaHa: 2.0, crop: 'Monthong', email: 'loquocdung@gmail.com', pass: 'Dung2026' },
  { stt: 6, fullname: 'Lê Văn Tuấn', birthYear: 1977, address: 'Liên Hương', cccd: '', phone: '0963563156', areaHa: 3.0, crop: 'Dona', email: 'levantuan@gmail.com', pass: 'Tuan2026' },
  { stt: 7, fullname: 'Đỗ Văn Tùng', birthYear: 1988, address: 'Liên Hương', cccd: '', phone: '0399900877', areaHa: 1.0, crop: 'Dona', email: 'dovantung@gmail.com', pass: 'Tung2026' },
  { stt: 8, fullname: 'Triệu Thanh Sa', birthYear: 1979, address: 'Liên Hương', cccd: '', phone: '0359934533', areaHa: 2.0, crop: 'Dona', email: 'trieuthanhsa@gmail.com', pass: 'Thanh2026' },
  { stt: 9, fullname: 'Nông Văn Kiểm', birthYear: 1971, address: 'Liên Hương', cccd: '', phone: '0336924015', areaHa: 3.0, crop: 'Dona', email: 'nongvankiem@gmail.com', pass: 'Kiem2026' },
  { stt: 10, fullname: 'Trần Xuân Kỳ', birthYear: 1976, address: 'Liên Hương', cccd: '', phone: '0327706400', areaHa: 1.0, crop: 'Dona', email: 'tranxuanky@gmail.com', pass: 'Xuan2026' },
  { stt: 11, fullname: 'Nguyễn Văn Thủy', birthYear: 1987, address: 'Liên Hương', cccd: '', phone: '0383114923', areaHa: 2.0, crop: 'TR6', email: 'nguyenvanthuy@gmail.com', pass: 'Thuy2026' },
  { stt: 12, fullname: 'Bùi Văn Tuấn', birthYear: 1978, address: 'Liên Hương', cccd: '', phone: '0867751087', areaHa: 2.0, crop: 'Dona', email: 'buivantuan@gmail.com', pass: 'Tuan2026' },
  { stt: 13, fullname: 'Phùng Tấn Vũ', birthYear: 1970, address: 'Liên Hương', cccd: '', phone: '0865245219', areaHa: 6.0, crop: 'Dona, TR6', email: 'phungtuanvu@gmail.com', pass: 'Tuan2026' },
  { stt: 14, fullname: 'Nguyễn Văn Tấn', birthYear: 1976, address: 'Liên Hương', cccd: '', phone: '0966849658', areaHa: 3.0, crop: 'Dona', email: 'nguyenvantan@gmail.com', pass: 'Tan@2026' },
  { stt: 15, fullname: 'Lê Văn Sự', birthYear: 1980, address: 'Liên Hương', cccd: '', phone: '0869187136', areaHa: 4.5, crop: 'Dona', email: 'levansu@gmail.com', pass: 'Van@2026' },
  { stt: 16, fullname: 'Đinh Văn Đức', birthYear: 1980, address: 'Liên Hương', cccd: '', phone: '0377028544', areaHa: 1.0, crop: 'Dona', email: 'dinhvanduc@gmail.com', pass: 'Duc@2026' },
  { stt: 17, fullname: 'Bùi Văn Linh', birthYear: 1987, address: 'Liên Hương', cccd: '', phone: '0973321270', areaHa: 1.0, crop: 'Dona', email: 'buivanlinh@gmail.com', pass: 'Linh2026' },
  { stt: 18, fullname: 'Phan Tiến Sĩ', birthYear: 1976, address: 'Liên Hương', cccd: '', phone: '0869913973', areaHa: 2.0, crop: 'Dona', email: 'phantiansi@gmail.com', pass: 'Phan2026' },
  { stt: 19, fullname: 'Đinh Văn Lượng', birthYear: 1972, address: 'Liên Hương', cccd: '', phone: '0913055891', areaHa: 2.0, crop: 'Dona', email: 'dinhvanluong@gmail.com', pass: 'Dinh2026' },
  { stt: 20, fullname: 'Lê Văn Bảy', birthYear: 1975, address: 'Liên Hương', cccd: '', phone: '0336342598', areaHa: 4.0, crop: 'Dona', email: 'levanbay@gmail.com', pass: 'Bay@2026' },
  { stt: 21, fullname: 'Nguyễn Văn Tám', birthYear: 1961, address: 'Liên Hương', cccd: '', phone: '0967735777', areaHa: 1.0, crop: 'Dona', email: 'nguyenvantam@gmail.com', pass: 'Tam@2026' },
  { stt: 22, fullname: 'Lừ Anh Hồng Lộc', birthYear: 1994, address: 'Liên Hương', cccd: '', phone: '0946991794', areaHa: 2.0, crop: 'Dona', email: 'luanhhongloc@gmail.com', pass: 'Loc@2026' },
  { stt: 23, fullname: 'Quách Văn Trọng', birthYear: null, address: 'Pang Pế Nặm', cccd: '038090072008', phone: '0352296876', areaHa: 3.0, crop: 'Dona', email: 'quachvantrong@gmail.com', pass: 'Trong123' },
  { stt: 24, fullname: 'Nguyễn Văn Luật', birthYear: null, address: 'Pang Pế Nặm', cccd: '040068002588', phone: '0935443959', areaHa: 1.5, crop: 'Dona', email: 'nguyenvanduat@gmail.com', pass: 'Duat2026' },
  { stt: 25, fullname: 'Bạch Văn Toàn', birthYear: null, address: 'Pang Pế Nặm', cccd: '001082039680', phone: '0981732082', areaHa: 2.0, crop: 'Dona', email: 'bachvantoan@gmail.com', pass: 'Toan2026' },
  { stt: 26, fullname: 'Lê Văn Ảnh', birthYear: null, address: 'Pang Pế Nặm', cccd: '036077022601', phone: '0966724510', areaHa: 1.0, crop: 'Dona', email: 'levananh2@gmail.com', pass: 'Anh@2026' },
  { stt: 27, fullname: 'Phạm Văn Dương', birthYear: null, address: 'Pang Pế Nặm', cccd: '0680055684783', phone: '0971405470', areaHa: 1.0, crop: 'Dona', email: 'phamvanduong@gmail.com', pass: 'Duong123' },
  { stt: 28, fullname: 'Lê Văn Ngãi', birthYear: null, address: 'Pang Pế Nặm', cccd: '036076013818', phone: '0347991368', areaHa: 1.0, crop: 'Dona', email: 'levanngai@gmail.com', pass: 'Ngai2026' },
  { stt: 29, fullname: 'Đặng Long Việt', birthYear: null, address: 'Pang Pế Nặm', cccd: '068082004751', phone: '0352297830', areaHa: 1.0, crop: 'Dona', email: 'danglongviet@gmail.com', pass: 'Viet2026' },
  { stt: 30, fullname: 'Võ Nguyên Đức', birthYear: null, address: 'Pang Pế Nặm', cccd: '083075001200', phone: '0335958654', areaHa: 1.0, crop: 'Dona', email: 'vonguyenduc@gmail.com', pass: 'Duc@2026' },
  { stt: 31, fullname: 'Nguyễn Văn Phong', birthYear: null, address: 'Pang Pế Nặm', cccd: '068098009893', phone: '0378370131', areaHa: 1.0, crop: 'Dona', email: 'nguyenvanphong@gmail.com', pass: 'Phong123' },
  { stt: 32, fullname: 'Võ Nguyên Hưng', birthYear: null, address: 'Pang Pế Nặm', cccd: '083073001218', phone: '0393091788', areaHa: 1.0, crop: 'Dona', email: 'vonguyenhung@gmail.com', pass: 'Hung2026' },
  { stt: 33, fullname: 'Phạm Văn Thân', birthYear: null, address: 'Pang Pế Nặm', cccd: '0380950351632', phone: '0981435534', areaHa: 1.0, crop: 'Dona', email: 'phamvanthan@gmail.com', pass: 'Than2026' },
  { stt: 34, fullname: 'Nguyễn Văn Nghĩa', birthYear: null, address: 'Pang Pế Nặm', cccd: '001077004523', phone: '0979876078', areaHa: 1.0, crop: 'Dona', email: 'nguyenvannghia2@gmail.com', pass: 'Nghia2026' },
  { stt: 35, fullname: 'Đào Quang Quế', birthYear: null, address: 'Pang Pế Nặm', cccd: '001085053660', phone: '0379041635', areaHa: 3.0, crop: 'Dona', email: 'daoquangque@gmail.com', pass: 'Que@2026' }
];

const seedExactFarmers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env!');
    }

    console.log('Connecting to MongoDB Atlas database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Find HTX Director on Atlas
    const director = await User.findOne({ username: 'tanquan_ecofarm' });
    if (!director) {
      console.error('❌ HTX Director tanquan_ecofarm not found on MongoDB Atlas! Please run create-tanquan-ecofarm-user.js first.');
      process.exit(1);
    }

    let count = 0;
    for (const item of rawFarmersData) {
      const username = item.email.split('@')[0];

      // Remove existing farmer if any to reset password properly
      await User.deleteOne({ 
        $or: [
          { email: item.email },
          { username: username }
        ] 
      });

      const farmerUser = new User({
        username,
        fullname: item.fullname,
        email: item.email,
        phone: item.phone,
        password: item.pass, // PLAIN TEXT -> Pre-save hook hashes it once
        role: 'Farmer',
        status: 'Active',
        htxId: director._id,
        organization: 'HỢP TÁC XÃ SẦU RIÊNG TÂN QUAN ECOFARM',
        address: item.address ? `${item.address}, Xã Đam Rông 3` : 'Xã Đam Rông 3',
        ward: 'Xã Đam Rông 3',
        farmName: `Lô Sầu Riêng ${item.fullname} (${item.crop})`,
        farmArea: Math.round(item.areaHa * 10000), // m2
        farmType: 'Trồng trọt',
        plantingRegionCode: `MSVT-TQ-${String(Math.ceil(item.stt / 10)).padStart(3, '0')}`,
        bio: item.birthYear ? `Năm sinh: ${item.birthYear} | Số CCCD: ${item.cccd || 'N/A'}` : `Số CCCD: ${item.cccd || 'N/A'}`
      });

      await farmerUser.save();
      count++;
      console.log(`[${count}/35] Seeded Farmer on Atlas: ${item.fullname} (${item.email}) - Pass: ${item.pass}`);
    }

    console.log('\n================================================');
    console.log(`🎉 ĐÃ SEED THÀNH CÔNG ĐỦ 35 NÔNG DÂN LÊN MONGODB ATLAS!`);
    console.log('================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding farmers:', error);
    process.exit(1);
  }
};

seedExactFarmers();
