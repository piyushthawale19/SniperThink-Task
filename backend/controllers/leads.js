const { pool } = require('../config/db');

exports.submitInterest = async (req, res) => {
  const { name, email, selectedStep } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Missing fields' });
  try {
    await pool.query('INSERT INTO leads (name, email, selected_step) VALUES ($1, $2, $3)', [name, email, selectedStep]);
    res.status(200).json({ message: 'Success' });
  } catch (err) { 
    console.error('Error inserting lead:', err);
    res.status(500).json({ message: 'Server error' }); 
  }
};