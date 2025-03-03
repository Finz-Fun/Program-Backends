import { Queue, QueueEvents } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const connection = {
  host: process.env.QUEUE_HOST || 'localhost',
  port: parseInt(process.env.QUEUE_PORT || '6379'),
  password: process.env.QUEUE_PASSWORD,
  username: process.env.QUEUE_USER,
};

export const transactionQueue = new Queue('transaction-updates', {
  connection,
});

// Queue events monitoring
const queueEvents = new QueueEvents('transaction-updates', { connection });

queueEvents.on('waiting', ({ jobId }) => {
  console.log(`Added transaction ${jobId} to queue`);
});

queueEvents.on('active', ({ jobId }) => {
  console.log(`Processing transaction ${jobId}`);
});

queueEvents.on('completed', ({ jobId }) => {
  console.log(`Completed transaction ${jobId}`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Failed transaction ${jobId}:`, failedReason);
});

queueEvents.on('error', error => {
  console.error('Queue error:', error);
});