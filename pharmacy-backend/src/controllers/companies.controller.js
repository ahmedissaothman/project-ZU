const pool = require('../config/db');

const getCompanies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createCompany = async (req, res) => {
  try {
    const { name, contact_info } = req.body;
    const result = await pool.query(
      'INSERT INTO companies (name, contact_info) VALUES ($1, $2) RETURNING *',
      [name, contact_info]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_info } = req.body;
    const result = await pool.query(
      'UPDATE companies SET name = $1, contact_info = $2 WHERE id = $3 RETURNING *',
      [name, contact_info, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany
};