const { getJobResult, getJobStatus } = require("../services/jobService");

exports.getJobStatus = async (req, res) => {
  try {
    const job = await getJobStatus(req.params.jobId, req.user.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.json(job);
  } catch (err) {
    console.error("Failed to fetch job status:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getJobResult = async (req, res) => {
  try {
    const job = await getJobResult(req.params.jobId, req.user.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "completed") {
      return res.status(400).json({
        message: "Job processing is not complete yet",
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
      });
    }

    return res.json({
      jobId: job.jobId,
      wordCount: job.wordCount,
      paragraphCount: job.paragraphCount,
      topKeywords: job.topKeywords || [],
    });
  } catch (err) {
    console.error("Failed to fetch job result:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
