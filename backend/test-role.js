require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://EBookFarm:0981977793aA%40@ebookfarm.qndp2x4.mongodb.net/test?retryWrites=true&w=majority')
  .then(async () => {
    const user = await User.findOne({ username: 'htx_demo' }) || await User.findOne({ role: { $regex: /HTX/i } });
    console.log("Found user:", user ? { username: user.username, role: `"${user.role}"` } : "None");
    process.exit();
  });
