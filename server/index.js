require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const figmaRoutes = require('./routes/figma');
const spreadsheetRoutes = require('./routes/spreadsheet');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/exports', express.static(path.join(__dirname, 'exports')));

// Serve the main application at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.use('/api/figma', figmaRoutes);
app.use('/api/spreadsheet', spreadsheetRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Prototype Text Review Tool API is running' });
});

// Serve React app in production (fallback)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Prototype Text Review Tool ready!`);
  console.log(`🌐 Access the tool at: http://localhost:${PORT}`);
  console.log(`🌐 Or from external: http://${HOST}:${PORT}`);
});

module.exports = app;