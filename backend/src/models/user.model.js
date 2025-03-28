const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

// User object
class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
  }

  // Create new user
  static async create(newUser) {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newUser.password, salt);

      const sql = `
        INSERT INTO users 
        (username, email, password) 
        VALUES (?, ?, ?)
      `;

      const [result] = await pool.execute(sql, [
        newUser.username,
        newUser.email,
        hashedPassword
      ]);

      return { id: result.insertId, ...newUser, password: undefined };
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
      return rows.length ? new User(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
      
      if (rows.length) {
        const user = new User(rows[0]);
        // Don't return password
        delete user.password;
        return user;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 