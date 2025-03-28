const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const imageController = require('../controllers/image.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Создаем директорию для загрузки, если она не существует
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Фильтр для разрешения только изображений
const fileFilter = (req, file, cb) => {
  // Разрешаем только изображения
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Только изображения могут быть загружены!'), false);
  }
};

// Инициализация multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB по умолчанию
  }
});

// Маршрут для загрузки изображения (защищенный)
router.post('/', verifyToken, upload.single('image'), imageController.uploadImage);

// Маршрут для получения всех изображений пользователя (защищенный)
router.get('/user', verifyToken, imageController.getUserImages);

// Маршрут для получения всех изображений (публичный)
router.get('/', imageController.getAllImages);

// Маршрут для получения информации об одном изображении (публичный)
router.get('/:id', imageController.getImage);

// Маршрут для удаления изображения (защищенный)
router.delete('/:id', verifyToken, imageController.deleteImage);

module.exports = router; 