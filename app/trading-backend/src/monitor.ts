import Queue from 'bull';
import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

const app = express();
const priceUpdateQueue = new Queue('price-updates', process.env.REDIS_URL || 'redis://localhost:6379');

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullAdapter(priceUpdateQueue)],
  serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

app.listen(3003, () => {
  console.log('Queue monitor running on port 3003');
});