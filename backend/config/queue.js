const { Queue } = require("bullmq");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

const hasRedisConfig = Boolean(redisUrl || redisHost);

const connection = hasRedisConfig
  ? redisUrl
    ? { url: redisUrl, lazyConnect: true, maxRetriesPerRequest: null }
    : {
        host: redisHost,
        port: parseInt(redisPort || "6379", 10),
        lazyConnect: true,
        maxRetriesPerRequest: null,
      }
  : null;

const fileQueue = hasRedisConfig
  ? new Queue("fileProcessing", { connection })
  : null;

module.exports = { fileQueue, connection };
