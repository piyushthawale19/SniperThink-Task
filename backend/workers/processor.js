require("dotenv").config();

const { Worker } = require("bullmq");
const { connection } = require("../config/queue");
const {
  MAX_JOB_ATTEMPTS,
  markJobCompleted,
  markJobFailed,
  markJobPendingForRetry,
  markJobProcessing,
  updateJobProgress,
} = require("../services/jobService");
const {
  analyzeText,
  extractText,
} = require("../services/fileProcessingService");

if (!connection) {
  console.error(
    "Worker cannot start: Redis is not configured. Set REDIS_URL or REDIS_HOST/REDIS_PORT.",
  );
  process.exit(1);
}

const workerConcurrency = Math.max(
  parseInt(process.env.WORKER_CONCURRENCY || "5", 10),
  1,
);

const syncProgress = async (job, progress) => {
  await job.updateProgress(progress);
  await updateJobProgress(job.id, progress);
};

const worker = new Worker(
  "fileProcessing",
  async (job) => {
    const { filePath, mimetype } = job.data;
    await markJobProcessing(job.id);
    await syncProgress(job, 10);

    const text = await extractText(filePath, mimetype);
    await syncProgress(job, 55);

    const result = analyzeText(text);
    await syncProgress(job, 90);

    return result;
  },
  { connection, concurrency: workerConcurrency },
);

worker.on("completed", async (job, result) => {
  if (!job) {
    return;
  }

  try {
    await markJobCompleted(job.id, result, job.attemptsMade);
  } catch (error) {
    console.error(`Failed to persist completion for job ${job.id}:`, error);
  }
});

worker.on("failed", async (job, error) => {
  if (!job) {
    return;
  }

  const attemptLimit = job.opts.attempts || MAX_JOB_ATTEMPTS;
  const errorMessage = error.message || "Job processing failed";

  try {
    if (job.attemptsMade < attemptLimit) {
      await markJobPendingForRetry(job.id, job.attemptsMade, errorMessage);
      return;
    }

    await markJobFailed(job.id, errorMessage, job.attemptsMade);
  } catch (persistError) {
    console.error(`Failed to persist failure for job ${job.id}:`, persistError);
  }
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
