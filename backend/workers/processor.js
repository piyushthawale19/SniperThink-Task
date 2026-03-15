const { Worker } = require('bullmq');
const { connection } = require('../config/queue');
const { pool } = require('../config/db');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const extractText = async (filePath, type) => {
  if (type === 'application/pdf') return (await pdfParse(fs.readFileSync(filePath))).text;
  if (type === 'text/plain') return fs.readFileSync(filePath, 'utf8');
  throw new Error('Unsupported');
};

const processContent = (text) => {
  const words = text.match(/\b\w+\b/g) || [];
  const pCount = text.split(/\n\s*\n/).filter(p => p.trim()).length;
  const freq = {};
  words.forEach(w => { const lw = w.toLowerCase(); if (lw.length > 3) freq[lw] = (freq[lw] || 0) + 1; });
  const top = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,10).map(x => x[0]);
  return { wordCount: words.length, paragraphCount: pCount, topKeywords: top };
};

new Worker('fileProcessing', async job => {
  const { filePath, mimetype } = job.data;
  await pool.query("UPDATE jobs SET status = 'processing', progress = 0 WHERE id = $1", [job.id]);
  try {
    const text = await extractText(filePath, mimetype);
    await job.updateProgress(50);
    await pool.query("UPDATE jobs SET progress = 50 WHERE id = $1", [job.id]);
    
    const result = processContent(text);
    await job.updateProgress(100);
    await pool.query("UPDATE jobs SET status = 'completed', progress = 100, result = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [JSON.stringify(result), job.id]);
    return result;
  } catch (err) {
    await pool.query("UPDATE jobs SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [job.id]);
    throw err;
  }
}, { connection, concurrency: 5 });