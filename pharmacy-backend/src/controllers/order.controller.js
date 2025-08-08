 
const pool = require('../config/db');

const getOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
             c.full_name as customer_name,
             u.full_name as ordered_by_name
      FROM orders o
      LEFT JOIN users c ON o.customer_id = c.id
      LEFT JOIN users u ON o.ordered_by = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const orderResult = await pool.query(`
      SELECT o.*, 
             c.full_name as customer_name,
             u.full_name as ordered_by_name
      FROM orders o
      LEFT JOIN users c ON o.customer_id = c.id
      LEFT JOIN users u ON o.ordered_by = u.id
      WHERE o.id = $1
    `, [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const itemsResult = await pool.query(`
      SELECT oi.*, m.name as medicine_name, b.batch_number
      FROM order_items oi
      JOIN batches b ON oi.batch_id = b.id
      JOIN medicines m ON b.medicine_id = m.id
      WHERE oi.order_id = $1
    `, [id]);
    
    const order = orderResult.rows[0];
    order.items = itemsResult.rows;
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { customer_id, items, discount = 0 } = req.body;
    
    // Calculate total amount
    let total_amount = 0;
    for (const item of items) {
      total_amount += item.quantity * item.unit_price;
    }
    total_amount -= discount;
    
    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (customer_id, ordered_by, order_status, payment_status, total_amount, discount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customer_id, req.user.id, 'PENDING', 'UNPAID', total_amount, discount]
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Create order items and update stock
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, batch_id, quantity, unit_price, vat_percent) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.batch_id, item.quantity, item.unit_price, item.vat_percent || 0]
      );
      
      // Update batch quantity
      await client.query(
        'UPDATE batches SET quantity = quantity - $1 WHERE id = $2',
        [item.quantity, item.batch_id]
      );
      
      // Record stock movement
      await client.query(
        'INSERT INTO stock_movements (batch_id, quantity, movement_type, reason, created_by) VALUES ($1, $2, $3, $4, $5)',
        [item.batch_id, -item.quantity, 'OUT', 'Order #' + orderId, req.user.id]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;
    
    const result = await pool.query(
      'UPDATE orders SET order_status=$1, payment_status=$2 WHERE id=$3 RETURNING *',
      [order_status, payment_status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
};