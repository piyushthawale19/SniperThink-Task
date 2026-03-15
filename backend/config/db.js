const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const baseSchemaStatements = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mimetype VARCHAR(100) NOT NULL,
      size INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      path TEXT,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS jobs (
      id VARCHAR(255) PRIMARY KEY,
      file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      retry_count INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      result JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      job_id VARCHAR(255) UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      word_count INTEGER NOT NULL,
      paragraph_count INTEGER NOT NULL,
      keywords JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      selected_step VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  "CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);",
  "CREATE INDEX IF NOT EXISTS idx_jobs_file_id ON jobs(file_id);",
  "CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);",
  "CREATE INDEX IF NOT EXISTS idx_results_job_id ON results(job_id);",
];

const isInvalidDatabaseUrl = () => {
  const url = (process.env.DATABASE_URL || "").trim();
  if (!url) return true;
  return (
    url.includes("<") ||
    url.includes(">") ||
    url.toLowerCase().includes("@host") ||
    url.toLowerCase().includes("<host>")
  );
};

const syncLegacySchema = async (client) => {
  await client.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);",
  );
  await client.query(
    "UPDATE users SET name = COALESCE(NULLIF(name, ''), split_part(email, '@', 1)) WHERE name IS NULL OR name = ''",
  );
  await client.query("ALTER TABLE users ALTER COLUMN name SET NOT NULL;");

  await client.query(
    "ALTER TABLE files ADD COLUMN IF NOT EXISTS file_path TEXT;",
  );
  await client.query("ALTER TABLE files ADD COLUMN IF NOT EXISTS path TEXT;");
  await client.query(
    "ALTER TABLE files ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
  );
  await client.query(
    "ALTER TABLE files ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
  );
  await client.query(
    "UPDATE files SET file_path = COALESCE(file_path, path) WHERE file_path IS NULL AND path IS NOT NULL",
  );
  await client.query(
    "UPDATE files SET uploaded_at = COALESCE(uploaded_at, created_at, CURRENT_TIMESTAMP) WHERE uploaded_at IS NULL",
  );

  await client.query(
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;",
  );
  await client.query(
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS error_message TEXT;",
  );
  await client.query("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS result JSONB;");
  await client.query(
    "UPDATE jobs SET retry_count = 0 WHERE retry_count IS NULL",
  );

  await client.query(`
    INSERT INTO results (job_id, word_count, paragraph_count, keywords, created_at)
    SELECT
      j.id,
      COALESCE((j.result ->> 'wordCount')::INTEGER, 0),
      COALESCE((j.result ->> 'paragraphCount')::INTEGER, 0),
      COALESCE(j.result -> 'topKeywords', '[]'::jsonb),
      COALESCE(j.updated_at, j.created_at, CURRENT_TIMESTAMP)
    FROM jobs j
    WHERE j.result IS NOT NULL
    ON CONFLICT (job_id) DO NOTHING;
  `);
};

const initDB = async () => {
  if (isInvalidDatabaseUrl()) {
    console.warn(
      "DATABASE_URL is missing or invalid. Provide a real Postgres connection string.",
    );
    return false;
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    for (const statement of baseSchemaStatements) {
      await client.query(statement);
    }
    await syncLegacySchema(client);
    await client.query("COMMIT");
    return true;
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    console.error("Error init db:", error);
    return false;
  } finally {
    if (client) client.release();
  }
};
module.exports = { pool, initDB };
