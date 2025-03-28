const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Registration route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Get current user profile (protected route)
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router; 