 
const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { full_name, email, phone, dob, address, password, role_id } = req.body;
    
    const hashedPassword = await hashPassword(password);
    
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, dob, address, password_hash, role_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, full_name, email, role_id`,
      [full_name, email, phone, dob, address, hashedPassword, role_id]
    );

    const token = generateToken({ id: result.rows[0].id });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: result.rows[0]
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id });
    
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, login };