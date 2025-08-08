 
const pool = require('../config/db');

const getDeliveries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, 
             o.id as order_id,
             o.total_amount,
             u.full_name as delivery_person_name,
             c.full_name as customer_name
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      LEFT JOIN users u ON d.delivery_person_id = u.id
      LEFT JOIN users c ON o.customer_id = c.id
      ORDER BY d.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createDelivery = async (req, res) => {
  try {
    const { order_id, delivery_person_id, delivery_address } = req.body;
    
    const result = await pool.query(
      'INSERT INTO deliveries (order_id, delivery_person_id, delivery_address, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [order_id, delivery_person_id, delivery_address, 'PENDING']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updateData = { status };
    if (status === 'DELIVERED') {
      updateData.delivered_at = new Date();
    }
    
    const result = await pool.query(
      'UPDATE deliveries SET status=$1, delivered_at=$2 WHERE id=$3 RETURNING *',
      [status, updateData.delivered_at || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    
    // Update order status if delivered
    if (status === 'DELIVERED') {
      await pool.query(
        'UPDATE orders SET order_status=$1 WHERE id=$2',
        ['DELIVERED', result.rows[0].order_id]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getFeedback = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, 
             o.id as order_id,
             u.full_name as user_name
      FROM feedback f
      JOIN orders o ON f.order_id = o.id
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { order_id, message, rating } = req.body;
    
    const result = await pool.query(
      'INSERT INTO feedback (order_id, user_id, message, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [order_id, req.user.id, message, rating]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getDeliveries,
  createDelivery,
  updateDeliveryStatus,
  getFeedback,
  createFeedback
};