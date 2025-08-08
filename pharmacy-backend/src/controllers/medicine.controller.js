 
const pool = require('../config/db');

const getMedicines = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, c.name as category_name, co.name as company_name 
      FROM medicines m 
      LEFT JOIN medicine_categories c ON m.category_id = c.id
      LEFT JOIN companies co ON m.company_id = co.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT m.*, c.name as category_name, co.name as company_name 
      FROM medicines m 
      LEFT JOIN medicine_categories c ON m.category_id = c.id
      LEFT JOIN companies co ON m.company_id = co.id
      WHERE m.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createMedicine = async (req, res) => {
  try {
    const { name, dosage_form, strength, category_id, company_id, requires_prescription } = req.body;
    
    const result = await pool.query(
      'INSERT INTO medicines (name, dosage_form, strength, category_id, company_id, requires_prescription) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, dosage_form, strength, category_id, company_id, requires_prescription]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dosage_form, strength, category_id, company_id, requires_prescription } = req.body;
    
    const result = await pool.query(
      'UPDATE medicines SET name=$1, dosage_form=$2, strength=$3, category_id=$4, company_id=$5, requires_prescription=$6 WHERE id=$7 RETURNING *',
      [name, dosage_form, strength, category_id, company_id, requires_prescription, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM medicines WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Batch management
const getBatches = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, m.name as medicine_name 
      FROM batches b 
      JOIN medicines m ON b.medicine_id = m.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createBatch = async (req, res) => {
  try {
    const { medicine_id, batch_number, quantity, expiry_date, purchase_price, selling_price } = req.body;
    
    const result = await pool.query(
      'INSERT INTO batches (medicine_id, batch_number, quantity, expiry_date, purchase_price, selling_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [medicine_id, batch_number, quantity, expiry_date, purchase_price, selling_price]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getBatches,
  createBatch
};