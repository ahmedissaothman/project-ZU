 
const pool = require('../config/db');

const getPayments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             o.id as order_id,
             u.full_name as paid_by_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN users u ON p.paid_by = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createPayment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { order_id, amount, payment_method, transaction_reference } = req.body;
    
    // Create payment
    const paymentResult = await client.query(
      'INSERT INTO payments (order_id, paid_by, amount, payment_method, transaction_reference) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [order_id, req.user.id, amount, payment_method, transaction_reference]
    );
    
    // Update order payment status
    const orderResult = await client.query('SELECT total_amount FROM orders WHERE id = $1', [order_id]);
    const totalAmount = parseFloat(orderResult.rows[0].total_amount);
    
    const paidResult = await client.query(
      'SELECT SUM(amount) as total_paid FROM payments WHERE order_id = $1',
      [order_id]
    );
    
    const totalPaid = parseFloat(paidResult.rows[0].total_paid || 0);
    
    let paymentStatus;
    if (totalPaid >= totalAmount) {
      paymentStatus = 'PAID';
    } else if (totalPaid > 0) {
      paymentStatus = 'PARTIAL';
    } else {
      paymentStatus = 'UNPAID';
    }
    
    await client.query(
      'UPDATE orders SET payment_status = $1 WHERE id = $2',
      [paymentStatus, order_id]
    );
    
    // Generate receipt
    await client.query(
      'INSERT INTO receipts (payment_id, printed_by) VALUES ($1, $2)',
      [paymentResult.rows[0].id, req.user.id]
    );
    
    await client.query('COMMIT');
    res.status(201).json(paymentResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

const getReceipts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             p.amount,
             p.payment_method,
             o.id as order_id,
             u.full_name as printed_by_name
      FROM receipts r
      JOIN payments p ON r.payment_id = p.id
      JOIN orders o ON p.order_id = o.id
      LEFT JOIN users u ON r.printed_by = u.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getPayments,
  createPayment,
  getReceipts
};