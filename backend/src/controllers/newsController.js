const News = require('../models/News');
const User = require('../models/User');
const { createLog } = require('./logController');
const { createNotification } = require('./notificationController');
const { isAdminRole } = require('../utils/roles');

const NEWS_RECIPIENT_ROLES = [
  'FARMER',
  'Farmer',
  'User',
  'HTX',
  'HTX_DIRECTOR',
  'HTX_TECHNICAL',
  'HTX_DISTRIBUTION',
  'HTX_ACCOUNTANT',
  'HTX_SUPERVISOR',
];

const notifyPublishedNews = async (news, senderId) => {
  const users = await User.find({
    status: { $regex: /^active$/i },
    role: { $in: NEWS_RECIPIENT_ROLES },
  });

  await Promise.all(users.map(user => createNotification({
    recipient: user._id,
    sender: senderId,
    title: 'Tin tức / Thông báo mới',
    message: `Bài viết mới: ${news.title}`,
    type: 'Announcement',
    relatedId: news._id,
    relatedModel: 'News',
  })));
};

const getNews = async (req, res) => {
  try {
    const filter = req.user && isAdminRole(req.user.role) ? {} : { isPublished: true };
    const news = await News.find(filter)
      .sort({ publishedAt: -1 })
      .populate('author', 'username fullname avatar');

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'username fullname avatar');
    if (!news) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức.' });
    }

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createNews = async (req, res) => {
  try {
    const newsData = { ...req.body, author: req.user.id };
    const news = new News(newsData);
    const createdNews = await news.save();

    await createLog(req.user.id, 'Tạo tin tức', createdNews._id, 'News', {
      title: createdNews.title,
      category: createdNews.category,
    });

    if (createdNews.isPublished) {
      await notifyPublishedNews(createdNews, req.user.id);
    }

    res.status(201).json({ success: true, data: createdNews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const existingNews = await News.findById(req.params.id);
    if (!existingNews) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức.' });
    }

    const wasPublished = Boolean(existingNews.isPublished);
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await createLog(req.user.id, 'Cập nhật tin tức', news._id, 'News', {
      title: news.title,
    });

    if (!wasPublished && news.isPublished) {
      await notifyPublishedNews(news, req.user.id);
    }

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức.' });
    }

    await createLog(req.user.id, 'Xóa tin tức', news._id, 'News', {
      title: news.title,
    });

    res.json({ success: true, message: 'Đã xóa tin tức.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
};
