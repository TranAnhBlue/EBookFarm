const News = require('../models/News');
const { createLog } = require('./logController');

const getNews = async (req, res) => {
  try {
    const filter = req.user && req.user.role === 'Admin' ? {} : { isPublished: true };
    console.log('Fetching news with filter:', filter);
    const news = await News.find(filter).sort({ publishedAt: -1 }).populate('author', 'username fullname');
    console.log(`Found ${news.length} news articles`);
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'username fullname');
    if (news) {
      res.json({ success: true, data: news });
    } else {
      res.status(404).json({ success: false, message: 'News article not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createNews = async (req, res) => {
  try {
    const newsData = { ...req.body, author: req.user.id };
    const news = new News(newsData);
    const createdNews = await news.save();
    
    // Log action
    await createLog(req.user.id, 'Tạo tin tức', createdNews._id, 'News', {
      title: createdNews.title,
      category: createdNews.category
    });
    
    res.status(201).json({ success: true, data: createdNews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (news) {
      // Log action
      await createLog(req.user.id, 'Cập nhật tin tức', news._id, 'News', {
        title: news.title
      });
      
      res.json({ success: true, data: news });
    } else {
      res.status(404).json({ success: false, message: 'News article not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (news) {
      // Log action
      await createLog(req.user.id, 'Xóa tin tức', news._id, 'News', {
        title: news.title
      });
      
      res.json({ success: true, message: 'News article removed' });
    } else {
      res.status(404).json({ success: false, message: 'News article not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
};
