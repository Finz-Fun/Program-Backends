import { Queue, QueueEvents } from 'bullmq';

import dotenv from 'dotenv';

dotenv.config();

const connection = {
  host: process.env.QUEUE_HOST || 'localhost',
  port: parseInt(process.env.QUEUE_PORT || '6379'),
  password: process.env.QUEUE_PASSWORD,
  username: process.env.QUEUE_USER,
};

console.log(process.env.QUEUE_HOST);

export const priceUpdateQueue = new Queue('price-updates', {
  connection,
});

// Queue events monitoring
const queueEvents = new QueueEvents('price-updates', { connection });

queueEvents.on('waiting', ({ jobId }) => {
  console.log(`Added job ${jobId} to queue`);
});

queueEvents.on('active', ({ jobId }) => {
  console.log(`Processing job ${jobId}`);
});

queueEvents.on('completed', ({ jobId }) => {
  console.log(`Completed job ${jobId}`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Failed job ${jobId}:`, failedReason);
});

queueEvents.on('error', error => {
  console.error('Queue error:', error);
});