 
const pool = require('../config/db');

const getMessages = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    const result = await pool.query(`
      SELECT m.*, 
             s.full_name as sender_name,
             r.full_name as receiver_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.sent_at ASC
    `, [req.user.id, user_id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, receiver_id, message]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT 
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END as user_id,
        u.full_name,
        MAX(m.sent_at) as last_message_time
      FROM messages m
      JOIN users u ON u.id = CASE 
        WHEN m.sender_id = $1 THEN m.receiver_id 
        ELSE m.sender_id 
      END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      GROUP BY user_id, u.full_name
      ORDER BY last_message_time DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  getConversations
};