const { Queue, QueueEvents } = require('bullmq');
require('dotenv').config();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};
const fileQueue = new Queue('fileProcessing', { connection });
const queueEvents = new QueueEvents('fileProcessing', { connection });

module.exports = { fileQueue, connection, queueEvents };