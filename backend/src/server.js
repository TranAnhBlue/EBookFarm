const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const formSchemaRoutes = require('./routes/formSchemaRoutes');
const journalRoutes = require('./routes/journalRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const logRoutes = require('./routes/logRoutes');
const agriModelRoutes = require('./routes/agriModelRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemas', formSchemaRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/agri-models', agriModelRoutes);

connectDB();

app.get('/', (req, res) => {
  res.send('Farm Management System API is running.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});