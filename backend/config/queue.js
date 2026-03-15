const { Queue } = require("bullmq");
require("dotenv").config();

const redisUrl = (process.env.REDIS_URL || "").trim();
const redisHost = (process.env.REDIS_HOST || "").trim();
const redisPort = process.env.REDIS_PORT;

const isPlaceholder = (value) =>
  value.includes("<") ||
  value.includes(">") ||
  value.toLowerCase().includes("your_");

const isLocalHost = (host) => ["localhost", "127.0.0.1", "::1"].includes(host);

const isHostedEnvironment =
  process.env.NODE_ENV === "production" || process.env.RENDER === "true";

const hasValidRedisUrl = redisUrl && !isPlaceholder(redisUrl);
const hasValidRedisHost = redisHost && !isPlaceholder(redisHost);

const canUseRedisHost =
  hasValidRedisHost && (!isHostedEnvironment || !isLocalHost(redisHost));

const connection = hasValidRedisUrl
  ? { url: redisUrl, lazyConnect: true, maxRetriesPerRequest: null }
  : canUseRedisHost
    ? {
        host: redisHost,
        port: parseInt(redisPort || "6379", 10),
        lazyConnect: true,
        maxRetriesPerRequest: null,
      }
    : null;

let fileQueue;

const getFileQueue = () => {
  if (!connection) return null;
  if (!fileQueue) {
    fileQueue = new Queue("fileProcessing", { connection });
  }
  return fileQueue;
};

module.exports = { getFileQueue, connection };
