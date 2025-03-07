import { Worker, Job } from 'bullmq';
import { redisClient } from '../config';
import { PriceUpdate, Candle } from '../types';
import cluster from 'cluster';
import { cpus } from 'os';
import dotenv from 'dotenv';

dotenv.config();

// console.log(process.env.REDIS_URL);

redisClient.connect();
redisClient.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

const WORKER_COUNT = process.env.WORKER_COUNT ? 
  parseInt(process.env.WORKER_COUNT) : 
  cpus().length;

  const connection = {
    host: process.env.QUEUE_HOST || 'localhost',
    port: parseInt(process.env.QUEUE_PORT || '6379'),
    password: process.env.QUEUE_PASSWORD,
    username: process.env.QUEUE_USER,
  };

async function processUpdate(update: PriceUpdate) {
  const candleTime = Math.floor(update.ts / 30) * 30;
  const key = `candles:${update.m}`;
  const lockKey = `lock:${update.m}`;

  try {
    const lock = await redisClient.set(lockKey, '1', {
      NX: true,
      PX: 5000
    });
    
    if (!lock) {
      console.log(`Lock acquisition failed for ${update.m}, skipping update`);
      return;
    }

    const multi = redisClient.multi();
    const currentCandle = await redisClient.get(`current_candle:${update.m}`);
    let candle: Candle;

    if (!currentCandle) {
      candle = {
        t: candleTime,
        o: update.p,
        h: update.p,
        l: update.p,
        c: update.p
      };
    } else {
      candle = JSON.parse(currentCandle);

      if (candleTime > candle.t) {
        multi.zAdd(key, [{
          score: candle.t,
          value: JSON.stringify(candle)
        }]);

        candle = {
          t: candleTime,
          o: update.p,
          h: update.p,
          l: update.p,
          c: update.p
        };
      } else {
        candle.h = Math.max(candle.h, update.p);
        candle.l = Math.min(candle.l, update.p);
        candle.c = update.p;
      }
    }

    multi.set(`current_candle:${update.m}`, JSON.stringify(candle));
    await multi.exec();

  } catch (error) {
    console.error(`Error processing update for ${update.m}:`, error);
    throw error;
  } finally {
    await redisClient.del(lockKey);
  }
}

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Starting ${WORKER_COUNT} workers...`);

  for (let i = 0; i < WORKER_COUNT; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const worker = new Worker('price-updates', 
    async (job: Job<PriceUpdate>) => {
      console.log(`Worker ${process.pid} processing job ${job.id}`);
      await processUpdate(job.data);
    }, 
    { 
      connection,
      concurrency: 10,
      autorun: true
    }
  );

  worker.on('error', (error) => {
    console.error(`Worker ${process.pid} encountered error:`, error);
  });

  worker.on('completed', (job) => {
    console.log(`Worker ${process.pid} completed job ${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Worker ${process.pid} failed job ${job?.id}:`, error);
  });

  console.log(`Worker ${process.pid} started`);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Cleaning up...');
    await worker.close();
    await redisClient.quit();
    process.exit(0);
  });
}

// Now priceUpdateQueue is accessible here
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Cleaning up...');
  if (!cluster.isPrimary) {
    await redisClient.quit();
  }
  process.exit(0);
});