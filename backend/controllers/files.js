const { createUploadJob } = require("../services/jobService");

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const { fileId, jobId } = await createUploadJob({
      userId: req.user.id,
      file: req.file,
    });

    return res.status(202).json({
      fileId,
      jobId,
      status: "pending",
      progress: 0,
    });
  } catch (err) {
    if (err.code === "QUEUE_NOT_CONFIGURED") {
      return res
        .status(503)
        .json({ message: "File processing queue is not configured" });
    }

    console.error("File upload failed:", err);
    return res.status(500).json({ message: "Unable to create processing job" });
  }
};
