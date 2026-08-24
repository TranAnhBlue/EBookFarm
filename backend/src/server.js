// EBookFarm Backend API - v1.0.2 - Render Deploy Fix
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db.js');

// Load environment variables - always load for local dev, Vercel injects env vars automatically
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://e-book-farm.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => origin === allowed || (allowed && origin.startsWith(allowed))) || 
                     origin.endsWith('.vercel.app') || 
                     origin.includes('localhost');
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('âŒ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.use(express.json());

// Middleware: Force UTF-8 encoding for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Middleware to ensure DB connection for each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('CRITICAL: DB connection failed:', error.message);
    // On Render, we want to know if DB is failing
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const formSchemaRoutes = require('./routes/formSchemaRoutes.js');
const journalRoutes = require('./routes/journalRoutes.js');
const inventoryRoutes = require('./routes/inventoryRoutes.js');
const logRoutes = require('./routes/logRoutes.js');
const agriModelRoutes = require('./routes/agriModelRoutes.js');
const groupRoutes = require('./routes/groupRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const systemRoutes = require('./routes/systemRoutes.js');
const newsRoutes = require('./routes/newsRoutes.js');
const tcvnRoutes = require('./routes/tcvnRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes.js');
const consultationRoutes = require('./routes/consultationRoutes.js');
const geminiRoutes = require('./routes/geminiRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const inventoryCategoryRoutes = require('./routes/inventoryCategoryRoutes.js');


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
app.use('/api/notifications', notificationRoutes);
app.use('/api/inventory-categories', inventoryCategoryRoutes);


// Additional routes
const journalImportExportRoutes = require('./routes/journalImportExportRoutes.js');
app.use('/api/journals', journalImportExportRoutes);

const journalHistoryRoutes = require('./routes/journalHistoryRoutes.js');
app.use('/api/journals', journalHistoryRoutes);

const openaiRoutes = require('./routes/openaiRoutes.js');
app.use('/api/openai', openaiRoutes);

const groqRoutes = require('./routes/groqRoutes.js');
app.use('/api/groq', groqRoutes);

const xaiRoutes = require('./routes/xaiRoutes.js');
app.use('/api/xai', xaiRoutes);

const chatStatsRoutes = require('./routes/chatStatsRoutes.js');
app.use('/api/chat', chatStatsRoutes);

const ragRoutes = require('./routes/ragRoutes.js');
app.use('/api/rag', ragRoutes);

try {
  const journalAIRoutes = require('./routes/journalAIRoutes.js');
  app.use('/api/journal-ai', journalAIRoutes);
  console.log('âœ… Journal AI routes loaded successfully');
} catch (error) {
  console.error('âŒ Failed to load Journal AI routes:', error);
}

const htxJournalRoutes = require('./routes/htxJournalRoutes.js');
app.use('/api/htx/journals', htxJournalRoutes);

const htxManagementRoutes = require('./routes/htxManagementRoutes.js');
app.use('/api/htx/management', htxManagementRoutes);

const plantingRegionRoutes = require('./routes/plantingRegionRoutes.js');
app.use('/api/htx/planting-regions', plantingRegionRoutes);
app.use('/api/planting-regions', plantingRegionRoutes);

const iotRoutes = require('./routes/iotRoutes.js');
app.use('/api/iot', iotRoutes);

const approvedAgriInputRoutes = require('./routes/approvedAgriInputRoutes.js');
app.use('/api/agri-inputs/approved', approvedAgriInputRoutes);

const vietGAPHouseholdRoutes = require('./routes/vietGAPHouseholdRoutes.js');
app.use('/api/vietgap-households', vietGAPHouseholdRoutes);

// === TXNG Quốc Gia ===
const productRoutes = require('./routes/productRoutes.js');
app.use('/api/products', productRoutes);

const batchRoutes = require('./routes/batchRoutes.js');
app.use('/api/batches', batchRoutes);

const portalRoutes = require('./routes/portalRoutes.js');
app.use('/api/portal', portalRoutes);

const supplyRoutes = require('./routes/supplyRoutes.js');
app.use('/api/supply-requests', supplyRoutes);

app.get('/', (req, res) => {
  res.send('EBook Farm API is running.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Export app for Vercel serverless
module.exports = app;

// Listen when running locally or on Render (Render sets process.env.RENDER)
if (process.env.NODE_ENV !== 'production' || process.env.RENDER === 'true' || process.env.RENDER) {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}
