const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Mock user for testing without database
let mockUsers = [];
let mockUserId = 1;

// Try to load mock users from file
try {
  const mockUsersFilePath = path.join(__dirname, '../../mock-users.json');
  if (fs.existsSync(mockUsersFilePath)) {
    const fileContent = fs.readFileSync(mockUsersFilePath, 'utf8');
    mockUsers = JSON.parse(fileContent);
    // Update mockUserId to be greater than the highest existing ID
    const maxId = mockUsers.reduce((max, user) => Math.max(max, user.id), 0);
    mockUserId = maxId + 1;
    console.log(`Loaded ${mockUsers.length} mock users from file`);
  }
} catch (error) {
  console.error('Error loading mock users:', error.message);
}

// Register a new user
exports.register = async (req, res) => {
  try {
    // Validate request
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: username, email, password'
      });
    }

    try {
      // Try with real database first
      // Check if email already exists
      const existingEmail = await User.findByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }

      // Check if username already exists
      const existingUsername = await User.findByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }

      // Create new user
      const user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });

      // Create token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Return user info (without password) and token
      return res.status(201).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (dbError) {
      console.error('Database error during registration:', dbError.message);
      
      // If DB operation fails, use mock data as fallback
      console.warn('Falling back to mock user data since database is not available');
      
      // Check mock data
      const existingEmail = mockUsers.find(u => u.email === req.body.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use (mock)'
        });
      }

      const existingUsername = mockUsers.find(u => u.username === req.body.username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken (mock)'
        });
      }

      // Create mock user
      const mockUser = {
        id: mockUserId++,
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockUsers.push(mockUser);
      
      // Save updated mock users to file
      try {
        const mockUsersFilePath = path.join(__dirname, '../../mock-users.json');
        fs.writeFileSync(mockUsersFilePath, JSON.stringify(mockUsers, null, 2));
      } catch (fileError) {
        console.error('Error saving mock users to file:', fileError.message);
      }
      
      // Create token
      const token = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Return user info and token
      return res.status(201).json({
        success: true,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email
        },
        token,
        notice: 'Using mock data since database is not available'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration: ' + error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Validate request
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    try {
      // Try with real database first
      // Find user by email
      const user = await User.findByEmail(req.body.email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Create token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Return user info (without password) and token
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (dbError) {
      console.error('Database error during login:', dbError.message);
      
      // If DB operation fails, use mock data as fallback
      console.warn('Falling back to mock user data since database is not available');
      
      // Find mock user
      const mockUser = mockUsers.find(u => u.email === req.body.email);
      if (!mockUser) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password (mock)'
        });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(req.body.password, mockUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password (mock)'
        });
      }

      // Create token
      const token = jwt.sign(
        { id: mockUser.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Return user info and token
      return res.status(200).json({
        success: true,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email
        },
        token,
        notice: 'Using mock data since database is not available'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login: ' + error.message
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    try {
      // Try with real database first
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        user
      });
    } catch (dbError) {
      console.error('Database error when getting profile:', dbError.message);
      
      // If DB operation fails, use mock data as fallback
      console.warn('Falling back to mock user data since database is not available');
      
      // Find mock user
      const mockUser = mockUsers.find(u => u.id === req.userId);
      if (!mockUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found (mock)'
        });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = mockUser;
      
      return res.status(200).json({
        success: true,
        user: userWithoutPassword,
        notice: 'Using mock data since database is not available'
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving profile: ' + error.message
    });
  }
}; 