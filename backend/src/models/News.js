const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String },
  image: { type: String, default: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80' },
  category: { 
    type: String, 
    enum: ['Sản xuất', 'Công nghệ', 'Thị trường', 'Thông báo'],
    default: 'Sản xuất'
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);
module.exports = News;
