 
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(400).json({ error: 'Resource already exists' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

module.exports = { errorHandler };