 
const pool = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { user_id, title, message } = req.body;
    
    const result = await pool.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3) RETURNING *',
      [user_id, title, message]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Auto-generate stock alerts
const checkStockAlerts = async () => {
  try {
    // Low stock alert (quantity < 10)
    const lowStockResult = await pool.query(`
      SELECT b.*, m.name as medicine_name 
      FROM batches b 
      JOIN medicines m ON b.medicine_id = m.id 
      WHERE b.quantity < 10
    `);
    
    // Expiry alerts (expiring in 30 days)
    const expiryResult = await pool.query(`
      SELECT b.*, m.name as medicine_name 
      FROM batches b 
      JOIN medicines m ON b.medicine_id = m.id 
      WHERE b.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    `);
    
    // Get all managers and admins for notifications
    const usersResult = await pool.query(`
      SELECT u.id FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name IN ('Manager', 'Admin')
    `);
    
    for (const user of usersResult.rows) {
      // Send low stock notifications
      for (const batch of lowStockResult.rows) {
        await pool.query(
          'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
          [
            user.id,
            'Low Stock Alert',
            `${batch.medicine_name} (Batch: ${batch.batch_number}) has low stock: ${batch.quantity} units remaining`
          ]
        );
      }
      
      // Send expiry notifications
      for (const batch of expiryResult.rows) {
        await pool.query(
          'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
          [
            user.id,
            'Expiry Alert',
            `${batch.medicine_name} (Batch: ${batch.batch_number}) expires on ${batch.expiry_date}`
          ]
        );
      }
    }
  } catch (error) {
    console.error('Error checking stock alerts:', error);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  checkStockAlerts
};