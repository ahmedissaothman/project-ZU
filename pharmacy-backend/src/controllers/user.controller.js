 
const pool = require('../config/db');
const { hashPassword } = require('../utils/hash');

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.phone, u.dob, u.address, 
             r.name as role, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.phone, u.dob, u.address, 
             r.name as role, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, dob, address, role_id } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET full_name=$1, email=$2, phone=$3, dob=$4, address=$5, role_id=$6 WHERE id=$7 RETURNING id, full_name, email, phone, dob, address, role_id',
      [full_name, email, phone, dob, address, role_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;
    
    // Get current user
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const { comparePassword } = require('../utils/hash');
    const isValidPassword = await comparePassword(current_password, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(new_password);
    
    // Update password
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser, 
  updatePassword 
};