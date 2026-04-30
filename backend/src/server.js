// EBookFarm Backend API - ESM Version
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (optional in production/Vercel)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware to ensure DB connection for each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DB connection error:', error);
    next(); // Continue even if DB fails
  }
});

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Import routes dynamically
const loadRoutes = async () => {
  try {
    const authRoutes = (await import('./routes/authRoutes.js')).default;
    const userRoutes = (await import('./routes/userRoutes.js')).default;
    const formSchemaRoutes = (await import('./routes/formSchemaRoutes.js')).default;
    const journalRoutes = (await import('./routes/journalRoutes.js')).default;
    const inventoryRoutes = (await import('./routes/inventoryRoutes.js')).default;
    const logRoutes = (await import('./routes/logRoutes.js')).default;
    const agriModelRoutes = (await import('./routes/agriModelRoutes.js')).default;
    const groupRoutes = (await import('./routes/groupRoutes.js')).default;
    const reportRoutes = (await import('./routes/reportRoutes.js')).default;
    const systemRoutes = (await import('./routes/systemRoutes.js')).default;
    const newsRoutes = (await import('./routes/newsRoutes.js')).default;
    const tcvnRoutes = (await import('./routes/tcvnRoutes.js')).default;
    const uploadRoutes = (await import('./routes/uploadRoutes.js')).default;
    const consultationRoutes = (await import('./routes/consultationRoutes.js')).default;
    const geminiRoutes = (await import('./routes/geminiRoutes.js')).default;

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

    // Additional routes
    const journalImportExportRoutes = (await import('./routes/journalImportExportRoutes.js')).default;
    app.use('/api/journals', journalImportExportRoutes);
    
    const journalHistoryRoutes = (await import('./routes/journalHistoryRoutes.js')).default;
    app.use('/api/journals', journalHistoryRoutes);

    const openaiRoutes = (await import('./routes/openaiRoutes.js')).default;
    app.use('/api/openai', openaiRoutes);

    const groqRoutes = (await import('./routes/groqRoutes.js')).default;
    app.use('/api/groq', groqRoutes);

    const xaiRoutes = (await import('./routes/xaiRoutes.js')).default;
    app.use('/api/xai', xaiRoutes);

    const chatStatsRoutes = (await import('./routes/chatStatsRoutes.js')).default;
    app.use('/api/chat', chatStatsRoutes);

    const ragRoutes = (await import('./routes/ragRoutes.js')).default;
    app.use('/api/rag', ragRoutes);

    try {
      const journalAIRoutes = (await import('./routes/journalAIRoutes.js')).default;
      app.use('/api/journal-ai', journalAIRoutes);
      console.log('✅ Journal AI routes loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Journal AI routes:', error);
    }
  } catch (error) {
    console.error('Error loading routes:', error);
  }
};

// Load routes
await loadRoutes();

app.get('/', (req, res) => {
  res.send('EBook Farm API is running.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Export app for Vercel serverless
export default app;

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}
