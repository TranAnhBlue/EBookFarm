const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const { ROLES } = require('./src/utils/roles');

dotenv.config();

const HTX_DIRECTOR_EMAIL = 'htx.director@ebookfarm.test';
const DEFAULT_PASSWORD = '123456';

const farmers = [
  ['Nguyễn Hữu Vượng', 1, 'Bãi ven sông', 1441, 'VG/ĐD-V.01', 'Trưởng nhóm'],
  ['Nguyễn Đức Đáp', 1, 'Bãi ven sông', 1237, 'VG/ĐD-Đ.02', 'Tổng: 26.649 m2'],
  ['Nguyễn Huy Môn', 1, 'Bãi ven sông', 1245, 'VG/ĐD-M.03', '27 thành viên'],
  ['Nguyễn Thị Với', 1, 'Bãi ven sông', 1048, 'VG/ĐD-V.04', ''],
  ['Nguyễn Thị Lê', 1, 'Bãi ven sông', 917, 'VG/ĐD-L.05', ''],
  ['Nguyễn Văn Khảm', 1, 'Bãi ven sông', 1114, 'VG/ĐD-K.06', ''],
  ['Vũ Thị Gạo', 1, 'Bãi ven sông', 768, 'VG/ĐD-G.07', ''],
  ['Hoàng Thị Đào', 1, 'Bãi ven sông', 1323, 'VG/ĐD-Đ.08', ''],
  ['Ngô Ngọc Tần', 1, 'Bãi ven sông', 945, 'VG/ĐD-T.09', ''],
  ['Nguyễn Thị Lân', 1, 'Bãi ven sông', 756, 'VG/ĐD-L.10', ''],
  ['Nguyễn Thị Bình', 1, 'Bãi ven sông', 1008, 'VG/ĐD-B.11', ''],
  ['Hoàng Thị Sình', 1, 'Bãi ven sông', 945, 'VG/ĐD-S.12', ''],
  ['Nguyễn Hữu Chính', 1, 'Bãi ven sông', 1134, 'VG/ĐD-C.13', ''],
  ['Ngô Văn Thủy', 1, 'Bãi ven sông', 1008, 'VG/ĐD-T.14', ''],
  ['Hoàng Văn Sòn', 1, 'Bãi ven sông', 630, 'VG/ĐD-S.15', ''],
  ['Nguyễn Thị Soạn', 1, 'Bãi ven sông', 1008, 'VG/ĐD-S.16', ''],
  ['Nguyễn Quang Tuấn', 1, 'Bãi ven sông', 630, 'VG/ĐD-T.17', ''],
  ['Nguyễn Quang Tiện', 1, 'Bãi ven sông', 756, 'VG/ĐD-T.18', ''],
  ['Bùi Văn Xoèn', 1, 'Bãi ven sông', 756, 'VG/ĐD-X.19', ''],
  ['Nguyễn Đức Tưởng', 1, 'Bãi ven sông', 504, 'VG/ĐD-T.20', ''],
  ['Nguyễn Quang Minh', 1, 'Bãi ven sông', 630, 'VG/ĐD-M.21', ''],
  ['Nguyễn Thị Song', 1, 'Bãi ven sông', 945, 'VG/ĐD-S.22', ''],
  ['Nguyễn Hữu Tiến', 1, 'Bãi ven sông', 504, 'VG/ĐD-T.23', ''],
  ['Vũ Văn Đạo', 1, 'Bãi ven sông', 756, 'VG/ĐD-Đ.24', ''],
  ['Nguyễn Thị Mai', 1, 'Bãi ven sông', 1008, 'VG/ĐD-M.25', ''],
  ['Nguyễn Văn Viên', 1, 'Bãi ven sông', 1025, 'VG/ĐD-V.26', ''],
  ['Hoàng Thị Bình', 1, 'Bãi ven sông', 1577, 'VG/ĐD-B.27', ''],
  ['Hoàng Thị Nhinh', 1, 'Bãi ven sông', 1031, 'VG/ĐD-N.28', 'Trưởng nhóm'],
  ['Hoàng Văn Chung', 1, 'Bãi ven sông', 1524, 'VG/ĐD-C.29', 'Tổng: 38.703 m2'],
  ['Lê Thị Sử', 1, 'Bãi ven sông', 830, 'VG/ĐD-S.30', '16 thành viên'],
  ['Hoàng Văn Tuấn', 1, 'Bãi ven sông', 684, 'VG/ĐD-T.31', ''],
  ['Hoàng Văn Tiến', 1, 'Bãi ven sông', 641, 'VG/ĐD-T.32', ''],
  ['Bùi Thị Phượng', 1, 'Bãi ven sông', 771, 'VG/ĐD-P.33', ''],
  ['Nguyễn Thị Mỵ', 1, 'Bãi ven sông', 1140, 'VG/ĐD-M.34', ''],
  ['Vũ Văn Hùng', 1, 'Bãi ven sông', 1046, 'VG/ĐD-H.35', ''],
  ['Vũ Thị Hào', 1, 'Bãi ven sông', 700, 'VG/ĐD-H.36', ''],
  ['Nguyễn Thị Mơ', 1, 'Bãi ven sông', 818, 'VG/ĐD-M.37', ''],
  ['Hoàng Thị Hạnh', 1, 'Bãi ven sông', 1348, 'VG/ĐD-H.38', ''],
  ['Nguyễn Thị Lan', 1, 'Bãi ven sông', 924, 'VG/ĐD-L.39', ''],
  ['Hoàng Mạnh Hiền', 1, 'Bãi ven sông', 1166, 'VG/ĐD-M.40', ''],
  ['Nguyễn Thị Cần', 1, 'Bãi ven sông', 1342, 'VG/ĐD-C.41', ''],
  ['Nguyễn Thị Hạnh', 1, 'Bãi ven sông', 926, 'VG/ĐD-H.42', ''],
  ['Vũ Văn Khải', 1, 'Bãi ven sông', 953, 'VG/ĐD-K.43', ''],
  ['Nguyễn Thị Lan Anh', 1, 'Bãi ven sông', 1011, 'VG/ĐD-A.44', 'Trưởng nhóm'],
  ['Nguyễn Thị Hà', 1, 'Bãi ven sông', 1206, 'VG/ĐD-H.45', 'Tổng: 22.859 m2'],
  ['Hoàng Thị Hát', 1, 'Bãi ven sông', 1315, 'VG/ĐD-H.46', '20 thành viên'],
  ['Hoàng Thị Loan', 1, 'Bãi ven sông', 1323, 'VG/ĐD-L.47', ''],
  ['Hoàng Thị Tho', 1, 'Bãi ven sông', 1189, 'VG/ĐD-T.48', ''],
  ['Bùi Thị Luân', 1, 'Bãi ven sông', 961, 'VG/ĐD-L.49', ''],
  ['Nguyễn Thị Thúy', 1, 'Bãi ven sông', 1291, 'VG/ĐD-T.50', ''],
  ['Nguyễn Văn Trãi', 1, 'Bãi ven sông', 1371, 'VG/ĐD-T.51', ''],
  ['Nguyễn Thị Đính', 1, 'Bãi ven sông', 1042, 'VG/ĐD-Đ.52', ''],
  ['Nguyễn Văn Tiếp', 1, 'Bãi ven sông', 1292, 'VG/ĐD-T.53', ''],
  ['Hoàng Thị Tho', 1, 'Bãi ven sông', 1490, 'VG/ĐD-T.54', ''],
  ['Nguyễn Văn Sáng', 1, 'Bãi ven sông', 1414, 'VG/ĐD-S.55', ''],
  ['Nguyễn Văn Lê', 1, 'Bãi ven sông', 1341, 'VG/ĐD-L.56', ''],
  ['Hoàng Văn Quốc', 1, 'Bãi ven sông', 1017, 'VG/ĐD-Q.57', ''],
  ['Nguyễn Thị Tựa', 1, 'Bãi ven sông', 831, 'VG/ĐD-T.58', ''],
  ['Hoàng Thị Mỵ', 1, 'Bãi ven sông', 1294, 'VG/ĐD-M.59', ''],
  ['Nguyễn Thị Sang', 1, 'Bãi ven sông', 827, 'VG/ĐD-S.60', ''],
  ['Hoàng Văn Phượng', 1, 'Bãi ven sông', 700, 'VG/ĐD-P.61', ''],
  ['Nguyễn Thị Hải', 1, 'Bãi ven sông', 994, 'VG/ĐD-H.62', ''],
  ['Nguyễn Thị Tình', 1, 'Bãi ven sông', 950, 'VG/ĐD-T.63', ''],
  ['Nguyễn Thị Hằng', 2, 'Bãi ven sông', 1056, 'VG/ĐD-H.64', 'Trưởng nhóm'],
  ['Nguyễn Văn Luyện', 2, 'Bãi ven sông', 1176, 'VG/ĐD-L.65', 'Tổng: 21.732 m2'],
  ['Ngô Văn Chiến', 2, 'Bãi ven sông', 1221, 'VG/ĐD-C.66', '22 thành viên'],
  ['Vũ Ngọc Ân', 2, 'Bãi ven sông', 1002, 'VG/ĐD-Â.67', ''],
  ['Nguyễn Hữu Bích', 2, 'Bãi ven sông', 1320, 'VG/ĐD-B.68', ''],
  ['Nguyễn Hữu Cường', 2, 'Bãi ven sông', 1362, 'VG/ĐD-C.69', ''],
  ['Nguyễn Thị Hiệp', 2, 'Bãi ven sông', 744, 'VG/ĐD-H.70', ''],
  ['Nguyễn Hữu Sinh', 2, 'Bãi ven sông', 850, 'VG/ĐD-S.71', ''],
  ['Nguyễn Thị Đáo', 2, 'Bãi ven sông', 1113, 'VG/ĐD-Đ.72', ''],
  ['Nguyễn Hữu Mạnh', 2, 'Bãi ven sông', 1234, 'VG/ĐD-M.73', ''],
  ['Nguyễn Thị Thiếp', 2, 'Bãi ven sông', 860, 'VG/ĐD-T.74', ''],
  ['Nguyễn Hữu Sỹ', 2, 'Bãi ven sông', 1009, 'VG/ĐD-S.75', ''],
  ['Ngô Thị Hồng', 2, 'Bãi ven sông', 615, 'VG/ĐD-H.76', ''],
  ['Đào Văn Thanh', 2, 'Bãi ven sông', 820, 'VG/ĐD-T.77', ''],
  ['Vũ Thị Giới', 2, 'Bãi ven sông', 795, 'VG/ĐD-G.78', ''],
  ['Nguyễn Thị Hòa', 2, 'Bãi ven sông', 860, 'VG/ĐD-H.79', ''],
  ['Nguyễn Văn Trường', 2, 'Bãi ven sông', 800, 'VG/ĐD-T.80', ''],
  ['Nguyễn Thị Nghỉ', 2, 'Bãi ven sông', 734, 'VG/ĐD-N.81', ''],
  ['Nguyễn Thị Xích', 2, 'Bãi ven sông', 850, 'VG/ĐD-X.82', ''],
  ['Nguyễn Thị Bống', 2, 'Bãi ven sông', 850, 'VG/ĐD-B.83', ''],
  ['Dương Thị Hiệp', 2, 'Bãi ven sông', 1035, 'VG/ĐD-H.84', ''],
  ['Đào Văn Cường', 2, 'Bãi ven sông', 1426, 'VG/ĐD-C.85', ''],
  ['Nguyễn Thị Dinh', 2, 'Bãi ven sông', 1048, 'VG/ĐD-D.86', 'Trưởng nhóm'],
  ['Nguyễn Hữu Nhượng', 2, 'Bãi ven sông', 1098, 'VG/ĐD-N.87', 'Tổng: 13.947 m2'],
  ['Nguyễn Hữu Yến', 2, 'Bãi ven sông', 1170, 'VG/ĐD-Y.88', '15 thành viên'],
  ['Ngô Thị Lợi', 2, 'Bãi ven sông', 965, 'VG/ĐD-L.89', ''],
  ['Hoàng Thị Sợi', 2, 'Bãi ven sông', 721, 'VG/ĐD-S.90', ''],
  ['Nguyễn Hữu Minh', 2, 'Bãi ven sông', 834, 'VG/ĐD-M.91', ''],
  ['Nguyễn Thị Mỵ', 2, 'Bãi ven sông', 694, 'VG/ĐD-M.92', ''],
  ['Ngô Văn Bợp', 2, 'Bãi ven sông', 1190, 'VG/ĐD-B.93', ''],
  ['Nguyễn Hữu Bằng', 2, 'Bãi ven sông', 860, 'VG/ĐD-B.94', ''],
  ['Nguyễn Hữu Trình', 2, 'Bãi ven sông', 1001, 'VG/ĐD-T.95', ''],
  ['Vũ Văn Khanh', 2, 'Bãi ven sông', 796, 'VG/ĐD-K.96', ''],
  ['Nguyễn Thị Điệp', 2, 'Bãi ven sông', 980, 'VG/ĐD-V.97', ''],
  ['Hoàng Thị Bối', 2, 'Bãi ven sông', 850, 'VG/ĐD-B.98', ''],
  ['Nguyễn Văn Khải', 2, 'Bãi ven sông', 980, 'VG/ĐD-K.99', ''],
  ['Nguyễn Hữu Trịnh', 2, 'Bãi ven sông', 760, 'VG/ĐD-T.100', ''],
];

const toSlug = (value) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const farmCodeSuffix = (farmCode) => {
  const suffix = farmCode.split('-').pop() || farmCode;
  return toSlug(suffix.replace('.', ''));
};

const ensureDirector = async () => {
  let director = await User.findOne({ email: HTX_DIRECTOR_EMAIL });
  if (director) return director;

  director = new User({
    username: 'htx_director',
    fullname: 'Nguyễn Quang Huy',
    email: HTX_DIRECTOR_EMAIL,
    phone: '0912322412',
    password: DEFAULT_PASSWORD,
    role: ROLES.HTX_DIRECTOR,
    status: 'Active',
    organization: 'Hợp tác xã Dịch vụ Nông nghiệp Đông Dư',
    address: 'Thôn Đông Dư Hạ, xã Bát Tràng, thành phố Hà Nội',
    province: 'Thành phố Hà Nội',
    ward: 'Xã Bát Tràng',
    mustChangePassword: false,
  });

  await director.save();
  return director;
};

const upsertFarmer = async (row, htxId, index) => {
  const [fullname, hamlet, fieldName, area, farmCode, note] = row;
  const sequence = String(index + 1).padStart(3, '0');
  const loginSlug = `${toSlug(fullname)}_${farmCodeSuffix(farmCode)}`;
  const email = `${loginSlug}@dongdu.htx.test`;

  let user = await User.findOne({ htxId, farmCode });
  if (!user) user = await User.findOne({ email });
  if (!user) user = await User.findOne({ email: `dongdu.farmer.${sequence}@ebookfarm.test` });
  if (!user) {
    user = new User({
      username: loginSlug,
      email,
      password: DEFAULT_PASSWORD,
      mustChangePassword: false,
    });
  }

  user.username = loginSlug;
  user.email = email;
  user.fullname = fullname;
  user.role = ROLES.FARMER;
  user.status = 'Active';
  user.htxId = htxId;
  user.farmName = `Hộ trồng ổi VietGAP - ${fullname}`;
  user.farmCode = farmCode;
  user.farmArea = area;
  user.farmType = 'Trồng trọt';
  user.organization = 'Hợp tác xã Dịch vụ Nông nghiệp Đông Dư';
  user.address = `Thôn ${hamlet}, xứ đồng ${fieldName}, xã Bát Tràng, thành phố Hà Nội`;
  user.province = 'Thành phố Hà Nội';
  user.ward = 'Xã Bát Tràng';
  user.bio = note || 'Thành viên sản xuất ổi theo tiêu chuẩn VietGAP của HTX Đông Dư';

  await user.save();
  return user;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const director = await ensureDirector();
    let createdOrUpdated = 0;

    for (let i = 0; i < farmers.length; i += 1) {
      await upsertFarmer(farmers[i], director._id, i);
      createdOrUpdated += 1;
    }

    const totalArea = farmers.reduce((sum, row) => sum + row[3], 0);
    console.log(`HTX: ${director.fullname} (${director.email})`);
    console.log(`Seeded ${createdOrUpdated} Dong Du VietGAP farmers`);
    console.log(`Total area: ${totalArea.toLocaleString('vi-VN')} m2`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed Dong Du farmers:', error);
    process.exit(1);
  }
};

seed();
