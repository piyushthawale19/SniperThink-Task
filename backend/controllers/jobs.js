const { pool } = require('../config/db');

exports.getJobStatus = async (req, res) => {
  try {
    const r = await pool.query('SELECT id as "jobId", status, progress FROM jobs WHERE id = $1', [req.params.jobId]);
    if (!r.rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getJobResult = async (req, res) => {
  try {
    const r = await pool.query('SELECT status, result FROM jobs WHERE id = $1', [req.params.jobId]);
    if (!r.rows.length) return res.status(404).json({ message: 'Not found' });
    const job = r.rows[0];
    if (job.status !== 'completed') return res.status(400).json({ message: 'Not completed' });
    res.json(job.result);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};