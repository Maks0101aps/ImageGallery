const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const multer = require('multer');

// Import routes
const authRoutes = require('./routes/auth.routes');
const imageRoutes = require('./routes/image.routes');

// Import database connection
const { testConnection } = require('./config/database');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Настройка CORS для разрешения кросс-доменных запросов
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Разрешаем запросы с frontend сервера
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Image Gallery API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer error handling
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `Файл слишком большой. Максимальный размер ${process.env.MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    return res.status(400).json({
      success: false,
      message: `Ошибка загрузки файла: ${err.message}`
    });
  } else if (err) {
    // Другие ошибки
    console.error(err);
    return res.status(500).json({
      success: false,
      message: `Ошибка сервера: ${err.message}`
    });
  }
  next();
});

// Start server
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.warn('WARNING: Starting server without database connection. Some features may not work correctly.');
    console.warn('Please ensure MySQL is installed and running, then restart the server.');
  }
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
}); 