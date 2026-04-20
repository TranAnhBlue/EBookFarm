const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const formSchemaRoutes = require('./routes/formSchemaRoutes');
const journalRoutes = require('./routes/journalRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const logRoutes = require('./routes/logRoutes');
const agriModelRoutes = require('./routes/agriModelRoutes');
const groupRoutes = require('./routes/groupRoutes');
const reportRoutes = require('./routes/reportRoutes');
const systemRoutes = require('./routes/systemRoutes');
const newsRoutes = require('./routes/newsRoutes');
const tcvnRoutes = require('./routes/tcvnRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const geminiRoutes = require('./routes/geminiRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemas', formSchemaRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/agri-models', agriModelRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tcvn', tcvnRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/openai', require('./routes/openaiRoutes'));
app.use('/api/groq', require('./routes/groqRoutes'));
app.use('/api/xai', require('./routes/xaiRoutes'));
app.use('/api/chat', require('./routes/chatStatsRoutes'));
app.use('/api/rag', require('./routes/ragRoutes'));

connectDB();

app.get('/', (req, res) => {
  res.send('EBook Farm API is running.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});