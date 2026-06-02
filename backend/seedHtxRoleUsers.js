const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const { ROLES } = require('./src/utils/roles');

dotenv.config();

const testUsers = [
  {
    username: 'htx_director',
    fullname: 'Nguyễn Quang Huy',
    email: 'htx.director@ebookfarm.test',
    phone: '0912322412',
    password: '123456',
    role: ROLES.HTX_DIRECTOR,
    status: 'Active',
    organization: 'Hợp tác xã Dịch vụ Nông nghiệp Đông Dư',
    address: 'Thôn Đông Dư Hạ, xã Bát Tràng, thành phố Hà Nội',
  },
  {
    username: 'htx_technical',
    fullname: 'Cán bộ Ban kỹ thuật',
    email: 'htx.technical@ebookfarm.test',
    phone: '0912322413',
    password: '123456',
    role: ROLES.HTX_TECHNICAL,
    status: 'Active',
  },
  {
    username: 'htx_distribution',
    fullname: 'Cán bộ Ban phân phối',
    email: 'htx.distribution@ebookfarm.test',
    phone: '0912322414',
    password: '123456',
    role: ROLES.HTX_DISTRIBUTION,
    status: 'Active',
  },
  {
    username: 'htx_accountant',
    fullname: 'Kế toán HTX',
    email: 'htx.accountant@ebookfarm.test',
    phone: '0912322415',
    password: '123456',
    role: ROLES.HTX_ACCOUNTANT,
    status: 'Active',
  },
  {
    username: 'htx_supervisor',
    fullname: 'Cán bộ Ban kiểm soát',
    email: 'htx.supervisor@ebookfarm.test',
    phone: '0912322416',
    password: '123456',
    role: ROLES.HTX_SUPERVISOR,
    status: 'Active',
  },
  {
    username: 'farmer_vietgap',
    fullname: 'Thành viên VietGAP Đông Dư',
    email: 'farmer.vietgap@ebookfarm.test',
    phone: '0912322417',
    password: '123456',
    role: ROLES.FARMER,
    status: 'Active',
    farmName: 'Vườn rau Đông Dư',
    farmArea: 1500,
    farmType: 'Trồng trọt',
    address: 'Xứ đồng ngoài Bãi, Đông Dư Hạ, xã Bát Tràng, thành phố Hà Nội',
  },
];

const upsertUser = async (userData, htxId) => {
  const data = { ...userData };
  if (htxId) data.htxId = htxId;

  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = new User(data);
  } else {
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'password') user[key] = value;
    });
    user.password = data.password;
  }

  user.mustChangePassword = false;
  await user.save();
  return user;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const director = await upsertUser(testUsers[0]);
    console.log(`Ready: ${director.email} / 123456 (${director.role})`);

    for (const userData of testUsers.slice(1)) {
      const user = await upsertUser(userData, director._id);
      console.log(`Ready: ${user.email} / 123456 (${user.role})`);
    }

    console.log('HTX role test users seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed HTX role users:', error);
    process.exit(1);
  }
};

seed();
