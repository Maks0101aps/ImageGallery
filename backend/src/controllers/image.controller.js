const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

// Data storage for mode without database
let mockImages = [];
let mockImageId = 1;

// Try to load images from file
try {
  const mockImagesFilePath = path.join(__dirname, '../../mock-images.json');
  if (fs.existsSync(mockImagesFilePath)) {
    const fileContent = fs.readFileSync(mockImagesFilePath, 'utf8');
    mockImages = JSON.parse(fileContent);
    // Update ID to maximum existing + 1
    const maxId = mockImages.reduce((max, img) => Math.max(max, img.id), 0);
    mockImageId = maxId + 1;
    console.log(`Loaded ${mockImages.length} images from file`);
  }
} catch (error) {
  console.error('Error loading images from file:', error.message);
}

// Upload image
exports.uploadImage = async (req, res) => {
  try {
    console.log('Image upload request received');
    console.log('File:', req.file);
    console.log('Form data:', req.body);
    
    // Check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check data
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: 'Image title is required'
      });
    }

    const userId = req.userId;
    const title = req.body.title;
    const description = req.body.description || '';
    const filePath = req.file.filename;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;

    try {
      // Try to save to database
      const sql = `
        INSERT INTO images 
        (user_id, title, description, file_path, file_type, file_size)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(sql, [
        userId,
        title,
        description,
        filePath,
        fileType,
        fileSize
      ]);

      const imageId = result.insertId;

      const image = {
        id: imageId,
        user_id: userId,
        title,
        description,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Image successfully saved to database:', image);
      
      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        image
      });
    } catch (dbError) {
      console.error('Database error during image upload:', dbError.message);
      
      // Fallback mode with file storage
      console.warn('Using storage mode without database');
      
      const mockImage = {
        id: mockImageId++,
        user_id: userId,
        title,
        description,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockImages.push(mockImage);
      
      // Save updated list to file
      try {
        const mockImagesFilePath = path.join(__dirname, '../../mock-images.json');
        fs.writeFileSync(mockImagesFilePath, JSON.stringify(mockImages, null, 2));
        console.log('Image successfully saved to mock-images.json:', mockImage);
        console.log('Image file path:', path.join(__dirname, '../../uploads', filePath));
        
        // Check if the file is accessible
        if (fs.existsSync(path.join(__dirname, '../../uploads', filePath))) {
            console.log('Image file exists on disk');
        } else {
            console.warn('Image file does NOT exist on disk!');
        }
      } catch (fileError) {
        console.error('Error saving images to file:', fileError.message);
      }
      
      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully (without database)',
        image: mockImage,
        notice: 'Using storage mode without database'
      });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload: ' + error.message
    });
  }
};

// Get all user images
exports.getUserImages = async (req, res) => {
  try {
    console.log('Request to get user images');
    const userId = req.userId;
    console.log('User ID:', userId);
    
    try {
      // Try to get from database
      const [rows] = await pool.execute(
        'SELECT * FROM images WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      console.log('Images retrieved from DB:', rows);
      
      return res.status(200).json({
        success: true,
        images: rows
      });
    } catch (dbError) {
      console.error('Database error when retrieving images:', dbError.message);
      
      // Fallback mode with file storage
      console.warn('Using storage mode without database');
      
      // Filter images by user ID
      const userImages = mockImages.filter(img => img.user_id === userId);
      
      console.log('Available mock images:', mockImages);
      console.log('Filtered images for user:', userImages);
      
      return res.status(200).json({
        success: true,
        images: userImages,
        notice: 'Using storage mode without database'
      });
    }
  } catch (error) {
    console.error('Error retrieving user images:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when retrieving images: ' + error.message
    });
  }
};

// Get all images (public)
exports.getAllImages = async (req, res) => {
  try {
    try {
      // Try to get from database
      const [rows] = await pool.execute(
        'SELECT images.*, users.username FROM images JOIN users ON images.user_id = users.id ORDER BY images.created_at DESC'
      );
      
      return res.status(200).json({
        success: true,
        images: rows
      });
    } catch (dbError) {
      console.error('Database error when retrieving all images:', dbError.message);
      
      // Fallback mode with file storage
      console.warn('Using storage mode without database');
      
      // Get all users to add names
      let mockUsersFilePath = path.join(__dirname, '../../mock-users.json');
      let mockUsers = [];
      if (fs.existsSync(mockUsersFilePath)) {
        const fileContent = fs.readFileSync(mockUsersFilePath, 'utf8');
        mockUsers = JSON.parse(fileContent);
      }
      
      // Add usernames to images
      const imagesWithUsernames = mockImages.map(img => {
        const user = mockUsers.find(u => u.id === img.user_id);
        return {
          ...img,
          username: user ? user.username : 'unknown'
        };
      });
      
      return res.status(200).json({
        success: true,
        images: imagesWithUsernames,
        notice: 'Using storage mode without database'
      });
    }
  } catch (error) {
    console.error('Error retrieving all images:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when retrieving images: ' + error.message
    });
  }
};

// Get information about a single image
exports.getImage = async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);
    
    try {
      // Try to get from database
      const [rows] = await pool.execute(
        'SELECT images.*, users.username FROM images JOIN users ON images.user_id = users.id WHERE images.id = ?',
        [imageId]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        image: rows[0]
      });
    } catch (dbError) {
      console.error('Database error when retrieving image:', dbError.message);
      
      // Fallback mode with file storage
      console.warn('Using storage mode without database');
      
      const mockImage = mockImages.find(img => img.id === imageId);
      
      if (!mockImage) {
        return res.status(404).json({
          success: false,
          message: 'Image not found (mock)'
        });
      }
      
      // Get user
      let mockUsersFilePath = path.join(__dirname, '../../mock-users.json');
      let mockUsers = [];
      if (fs.existsSync(mockUsersFilePath)) {
        const fileContent = fs.readFileSync(mockUsersFilePath, 'utf8');
        mockUsers = JSON.parse(fileContent);
      }
      
      const user = mockUsers.find(u => u.id === mockImage.user_id);
      
      return res.status(200).json({
        success: true,
        image: {
          ...mockImage,
          username: user ? user.username : 'unknown'
        },
        notice: 'Using storage mode without database'
      });
    }
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when retrieving image: ' + error.message
    });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);
    const userId = req.userId;
    
    try {
      // Try to delete from database
      
      // First check that the image belongs to the user
      const [rows] = await pool.execute(
        'SELECT * FROM images WHERE id = ? AND user_id = ?',
        [imageId, userId]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Image not found or does not belong to you'
        });
      }
      
      // Save the file path
      const filePath = path.join(__dirname, '../../uploads', rows[0].file_path);
      
      // Delete record from database
      await pool.execute('DELETE FROM images WHERE id = ?', [imageId]);
      
      // Delete image file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Image successfully deleted'
      });
    } catch (dbError) {
      console.error('Database error when deleting image:', dbError.message);
      
      // Fallback mode with file storage
      console.warn('Using storage mode without database');
      
      // Find the image index in the array
      const imageIndex = mockImages.findIndex(img => img.id === imageId && img.user_id === userId);
      
      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Image not found or does not belong to you (mock)'
        });
      }
      
      // Save the file path
      const filePath = path.join(__dirname, '../../uploads', mockImages[imageIndex].file_path);
      
      // Remove from array
      mockImages.splice(imageIndex, 1);
      
      // Save updated list
      try {
        const mockImagesFilePath = path.join(__dirname, '../../mock-images.json');
        fs.writeFileSync(mockImagesFilePath, JSON.stringify(mockImages, null, 2));
      } catch (fileError) {
        console.error('Error saving images to file:', fileError.message);
      }
      
      // Delete image file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Image successfully deleted (without database)',
        notice: 'Using storage mode without database'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when deleting image: ' + error.message
    });
  }
}; 