import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connection, PORT, PROGRAM_ID, redisClient } from './config';
import { Candle, PriceUpdate } from './types';
import { Keypair, PublicKey } from '@solana/web3.js';
import {  subscribeToPoolUpdates, unsubscribeFromPool } from './utils/pool';
import { AnchorProvider, Program, Wallet,BN } from '@coral-xyz/anchor';
import { AiAgent, idljson } from './idl/ai_agent';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
  transports: ['websocket']
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.connect().catch(console.error);


const poolSubscriptions = new Map<string, number>();
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || '';

const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(WALLET_PRIVATE_KEY)));
const provider = new AnchorProvider(connection, new Wallet(wallet), {});
const IDL = JSON.parse(idljson);
const program = new Program<AiAgent>(IDL, PROGRAM_ID, provider);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100 
});

app.use(limiter);

async function subscribeToPool(tokenMint: string) {
    if (poolSubscriptions.has(tokenMint)) return;
  
    try {
      const subscriptionId = await subscribeToPoolUpdates(
        program,
        tokenMint,
        async (poolData) => {
          const update: PriceUpdate = {
            m: tokenMint,
            p: poolData.price,
            s: poolData.reserveSol,
            t: poolData.reserveToken,
            ts: Math.floor(Date.now() / 1000)
          };

          io.to(`price:${tokenMint}`).emit('price', update);
  
          await saveCandleData(tokenMint, update);
        }
      );
  
      poolSubscriptions.set(tokenMint, subscriptionId);
      console.log(`Subscribed to pool updates for ${tokenMint}`);
  
    } catch (error) {
      console.error(`Error subscribing to pool ${tokenMint}:`, error);
    }
  }

  function unsubscribeFromPoolUpdates(tokenMint: string) {
    const subscriptionId = poolSubscriptions.get(tokenMint);
    if (subscriptionId) {
      unsubscribeFromPool(connection, subscriptionId);
      poolSubscriptions.delete(tokenMint);
      console.log(`Unsubscribed from pool updates for ${tokenMint}`);
    }
  }

  
  async function saveCandleData(tokenMint: string, update: PriceUpdate) {
    const candleTime = Math.floor(update.ts / 30) * 30;
    const key = `candles:${tokenMint}`;
  
    try {
      if (!redisClient.isReady) {
        throw new Error('Redis client not ready');
      }


      if (!update.p || update.p === 0) {
        console.log('Invalid price, skipping update:', update);
        return;
      }

      const currentCandle = await redisClient.get(`current_candle:${tokenMint}`);
      let candle: Candle;

      if (!currentCandle) {
        candle = {
          t: candleTime,
          o: update.p,
          h: update.p,
          l: update.p,
          c: update.p
        };
        console.log('Created first candle:', candle);
      } else {
        candle = JSON.parse(currentCandle);

        if (candleTime > candle.t) { 
          await redisClient.zAdd(key, [{
            score: candle.t,
            value: JSON.stringify({
              t: candle.t,
              o: candle.o,
              h: candle.h,
              l: candle.l,
              c: candle.c 
            })
          }]);

          candle = {
            t: candleTime,
            o: update.p,
            h: update.p,
            l: update.p,
            c: update.p
          };
          console.log('Started new current candle:', candle);
        } else {
          candle.h = Math.max(candle.h, update.p);
          candle.l = Math.min(candle.l, update.p);
          candle.c = update.p;
          console.log('Updated current candle:', candle);
        }
      }

      await redisClient.set(`current_candle:${tokenMint}`, JSON.stringify(candle));

    } catch (error) {
      console.error(`Error saving candle data for ${tokenMint}:`, error);
      if (!redisClient.isOpen) {
        try {
          await redisClient.connect();
        } catch (reconnectError) {
          console.error('Failed to reconnect to Redis:', reconnectError);
        }
      }
    }
}


io.on('connection', (socket) => {
  console.log('Client connected');
  const subscriptions = new Set<string>();

  socket.on('subscribe', async (tokenMint: string) => {
    console.log(`Client subscribed to ${tokenMint}`);
    socket.join(`price:${tokenMint}`);
    await subscribeToPool(tokenMint);
    subscriptions.add(tokenMint);
  });

  socket.on('unsubscribe', (tokenMint: string) => {
    console.log(`Client unsubscribed from ${tokenMint}`);
    socket.leave(`price:${tokenMint}`);
    subscriptions.delete(tokenMint);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    subscriptions.forEach(tokenMint => {
      unsubscribeFromPoolUpdates(tokenMint);
    });
    subscriptions.clear();
  });
});

// REST endpoints
app.get("/candles/:tokenMint", async (req, res) => {
    const { tokenMint } = req.params;
    const { start, end } = req.query;
    const key = `candles:${tokenMint}`;
    
    try {
      const historicalCandles = await redisClient.zRange(
        key,
        Number(start) || 0,
        Number(end) || -1
      );
      
      const currentCandle = await redisClient.get(`current_candle:${tokenMint}`);
      
      const allCandles = [
        ...historicalCandles.map(candle => JSON.parse(candle)),
        ...(currentCandle ? [JSON.parse(currentCandle)] : [])
      ];

      
      res.json(allCandles);
    } catch (error) {
      console.error('Error fetching candles:', error);
      res.status(500).json({ error: "Failed to fetch candles" });
    }
});

  async function getLatestCompleteCandle(tokenMint: string): Promise<Candle | null> {
    try {
      const key = `candles:${tokenMint}`;
      const latestCandles = await redisClient.zRange(key, -1, -1);
      
      if (latestCandles && latestCandles.length > 0) {
        return JSON.parse(latestCandles[0]);
      }
      return null;
    } catch (error) {
      console.error('Error getting latest complete candle:', error);
      return null;
    }
  }



process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Cleaning up...');
  
  for (const [tokenMint, subscriptionId] of poolSubscriptions) {
    unsubscribeFromPool(connection, subscriptionId);
  }
  poolSubscriptions.clear();

  await redisClient.quit();
  
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});



httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});