const { pool } = require("../config/db");
const { getFileQueue } = require("../config/queue");

exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file" });
  const fileQueue = getFileQueue();
  if (!fileQueue)
    return res
      .status(503)
      .json({ message: "File processing queue is not configured" });
  const { filename, originalname, mimetype, size, path: filePath } = req.file;
  try {
    const result = await pool.query(
      "INSERT INTO files (user_id, filename, original_name, mimetype, size, path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [req.user.id, filename, originalname, mimetype, size, filePath],
    );
    const fileId = result.rows[0].id;
    const job = await fileQueue.add(
      "processFile",
      { fileId, filePath, mimetype },
      { attempts: 3 },
    );
    await pool.query(
      "INSERT INTO jobs (id, file_id, status) VALUES ($1, $2, $3)",
      [job.id, fileId, "pending"],
    );
    res.status(202).json({ fileId, jobId: job.id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
