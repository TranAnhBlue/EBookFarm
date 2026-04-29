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
const journalImportExportRoutes = require('./routes/journalImportExportRoutes');
app.use('/api/journals', journalImportExportRoutes);
const journalHistoryRoutes = require('./routes/journalHistoryRoutes');
app.use('/api/journals', journalHistoryRoutes);
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

try {
    const journalAIRoutes = require('./routes/journalAIRoutes');
    app.use('/api/journal-ai', journalAIRoutes);
    console.log('✅ Journal AI routes loaded successfully');
} catch (error) {
    console.error('❌ Failed to load Journal AI routes:', error);
}

// Test route để kiểm tra
app.get('/api/journal-ai-test', (req, res) => {
    res.json({ success: true, message: 'Journal AI test route working!' });
});

// Test route cho Journal AI không cần auth
app.post('/api/journal-ai-test-suggestions', async (req, res) => {
    try {
        const { getQuickSuggestions } = require('./controllers/journalAIController');
        
        // Lấy tham số từ request body
        const { fieldName = 'thức ăn', schemaCategory = 'thuysan', fieldType = 'general', fieldValue = '' } = req.body;
        
        // Mock request object
        const mockReq = {
            body: {
                fieldType: fieldType,
                fieldName: fieldName,
                schemaCategory: schemaCategory,
                fieldValue: fieldValue
            }
        };
        
        // Mock response object
        const mockRes = {
            json: (data) => res.json(data),
            status: (code) => ({ json: (data) => res.status(code).json(data) })
        };
        
        await getQuickSuggestions(mockReq, mockRes);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test route cho AI suggestions với Groq
app.post('/api/journal-ai-test-groq', async (req, res) => {
    try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: 'Bạn là AI Assistant chuyên gia nông nghiệp của EBookFarm. Trả lời ngắn gọn bằng tiếng Việt.'
                },
                {
                    role: 'user',
                    content: 'Cho tôi 3 gợi ý về việc cho cá tra ăn.'
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        res.json({
            success: true,
            message: 'Groq AI test successful',
            response: completion.choices[0].message.content
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

connectDB();

app.get('/', (req, res) => {
  res.send('EBook Farm API is running.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Export app for Vercel serverless
module.exports = app;

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}