const { randomUUID } = require("crypto");
const { pool } = require("../config/db");
const { getFileQueue } = require("../config/queue");

const MAX_JOB_ATTEMPTS = Math.max(
  parseInt(process.env.MAX_JOB_ATTEMPTS || "3", 10),
  1,
);
const JOB_RETRY_BACKOFF_MS = Math.max(
  parseInt(process.env.JOB_RETRY_BACKOFF_MS || "1000", 10),
  0,
);

const normalizeProgress = (progress) =>
  Math.min(100, Math.max(0, Math.round(progress)));

const createUploadJob = async ({ userId, file }) => {
  const fileQueue = getFileQueue();
  if (!fileQueue) {
    const error = new Error("File processing queue is not configured");
    error.code = "QUEUE_NOT_CONFIGURED";
    throw error;
  }

  const client = await pool.connect();
  const jobId = randomUUID();
  let fileId;
  let transactionOpen = false;

  try {
    await client.query("BEGIN");
    transactionOpen = true;

    const fileResult = await client.query(
      `
				INSERT INTO files (
					user_id,
					filename,
					original_name,
					mimetype,
					size,
					file_path,
					path,
					uploaded_at
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
				RETURNING id
			`,
      [
        userId,
        file.filename,
        file.originalname,
        file.mimetype,
        file.size,
        file.path,
        file.path,
      ],
    );
    fileId = fileResult.rows[0].id;

    await client.query(
      `
				INSERT INTO jobs (id, file_id, status, progress, retry_count, created_at, updated_at)
				VALUES ($1, $2, 'pending', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			`,
      [jobId, fileId],
    );

    await client.query("COMMIT");
    transactionOpen = false;

    await fileQueue.add(
      "processFile",
      {
        jobId,
        fileId,
        filePath: file.path,
        mimetype: file.mimetype,
        originalName: file.originalname,
      },
      {
        jobId,
        attempts: MAX_JOB_ATTEMPTS,
        backoff: {
          type: "exponential",
          delay: JOB_RETRY_BACKOFF_MS,
        },
        removeOnComplete: 1000,
        removeOnFail: false,
      },
    );

    return { fileId, jobId };
  } catch (error) {
    if (transactionOpen) {
      await client.query("ROLLBACK").catch(() => {});
    }

    if (fileId) {
      await client
        .query(
          `
					UPDATE jobs
					SET status = 'failed', error_message = $1, updated_at = CURRENT_TIMESTAMP
					WHERE id = $2
				`,
          [error.message, jobId],
        )
        .catch(() => {});
    }

    throw error;
  } finally {
    client.release();
  }
};

const getJobStatus = async (jobId, userId) => {
  const result = await pool.query(
    `
			SELECT
				j.id AS "jobId",
				j.status,
				j.progress,
				j.retry_count AS "retryCount",
				j.error_message AS "errorMessage",
				j.created_at AS "createdAt",
				j.updated_at AS "updatedAt"
			FROM jobs j
			INNER JOIN files f ON f.id = j.file_id
			WHERE j.id = $1 AND f.user_id = $2
		`,
    [jobId, userId],
  );

  return result.rows[0] || null;
};

const getJobResult = async (jobId, userId) => {
  const result = await pool.query(
    `
			SELECT
				j.id AS "jobId",
				j.status,
				j.progress,
				r.word_count AS "wordCount",
				r.paragraph_count AS "paragraphCount",
				r.keywords AS "topKeywords"
			FROM jobs j
			INNER JOIN files f ON f.id = j.file_id
			LEFT JOIN results r ON r.job_id = j.id
			WHERE j.id = $1 AND f.user_id = $2
		`,
    [jobId, userId],
  );

  return result.rows[0] || null;
};

const updateJobProgress = async (jobId, progress) => {
  await pool.query(
    `
			UPDATE jobs
			SET progress = $1, updated_at = CURRENT_TIMESTAMP
			WHERE id = $2
		`,
    [normalizeProgress(progress), jobId],
  );
};

const markJobProcessing = async (jobId) => {
  await pool.query(
    `
			UPDATE jobs
			SET status = 'processing', error_message = NULL, updated_at = CURRENT_TIMESTAMP
			WHERE id = $1
		`,
    [jobId],
  );
};

const markJobPendingForRetry = async (jobId, retryCount, errorMessage) => {
  await pool.query(
    `
			UPDATE jobs
			SET
				status = 'pending',
				progress = 0,
				retry_count = $1,
				error_message = $2,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $3
		`,
    [retryCount, errorMessage, jobId],
  );
};

const markJobFailed = async (jobId, errorMessage, retryCount) => {
  await pool.query(
    `
			UPDATE jobs
			SET
				status = 'failed',
				progress = 0,
				retry_count = $1,
				error_message = $2,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $3
		`,
    [retryCount, errorMessage, jobId],
  );
};

const markJobCompleted = async (jobId, result, retryCount = 0) => {
  const client = await pool.connect();
  const payload = {
    wordCount: result.wordCount,
    paragraphCount: result.paragraphCount,
    topKeywords: result.topKeywords,
  };

  try {
    await client.query("BEGIN");
    await client.query(
      `
				INSERT INTO results (job_id, word_count, paragraph_count, keywords, created_at)
				VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
				ON CONFLICT (job_id)
				DO UPDATE SET
					word_count = EXCLUDED.word_count,
					paragraph_count = EXCLUDED.paragraph_count,
					keywords = EXCLUDED.keywords
			`,
      [
        jobId,
        payload.wordCount,
        payload.paragraphCount,
        JSON.stringify(payload.topKeywords),
      ],
    );
    await client.query(
      `
				UPDATE jobs
				SET
					status = 'completed',
					progress = 100,
					retry_count = $1,
					error_message = NULL,
					result = $2,
					updated_at = CURRENT_TIMESTAMP
				WHERE id = $3
			`,
      [retryCount, JSON.stringify(payload), jobId],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  MAX_JOB_ATTEMPTS,
  JOB_RETRY_BACKOFF_MS,
  createUploadJob,
  getJobResult,
  getJobStatus,
  markJobCompleted,
  markJobFailed,
  markJobPendingForRetry,
  markJobProcessing,
  updateJobProgress,
};
