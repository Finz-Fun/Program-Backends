import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { connection, PORT, PROGRAM_ID, redisClient } from './config';
import { Candle, PriceUpdate } from './types';
import { Keypair } from '@solana/web3.js';
import { subscribeToPoolUpdates, unsubscribeFromPool } from './utils/pool';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { AiAgent, IDL } from './idl/ai_agent';
import mongoose from 'mongoose';
import { Token } from './models/tokenSchema';

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);

class PriceCollectorService {
  private poolSubscriptions = new Map<string, number>();
  private isRunning = false;

  constructor() {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dex')
      .then(() => console.log('Connected to MongoDB'))
      .catch((err: any) => console.error('MongoDB connection error:', err));
  }

  async getKnownTokens(): Promise<string[]> {
    try {
      const tokens = await Token.find({ isActive: true });
      if (!tokens.length) {
        const defaultTokens = [
          'CcGU8SdwSriabxH43s3m1D2Grt1ewinkhS1nzbXZXq5U',
          'CPSumkuZjzaDAHp6ti18iko4AnFN3xCBp3DjgF4bUSzJ',
          'AgcsskTUCce1USqnTX5pfGpkN6KJGQ3KWuZ9LE7c3G7Z'
        ];
        
        await Token.insertMany(
          defaultTokens.map(mint => ({ mintAddress: mint }))
        );
        
        return defaultTokens;
      }
      
      return tokens.map(token => token.mintAddress);
    } catch (error) {
      console.error('Error getting known tokens:', error);
      return [];
    }
  }

  async addNewToken(tokenMint: string): Promise<boolean> {
    try {
      const existingToken = await Token.findOne({ mintAddress: tokenMint });
      
      if (existingToken) {
        if (!existingToken.isActive) {
          existingToken.isActive = true;
          existingToken.lastUpdated = new Date();
          await existingToken.save();
        }
      } else {
        await Token.create({ 
          mintAddress: tokenMint,
          isActive: true
        });
      }
      
      if (this.isRunning) {
        await this.startCollecting(tokenMint);
      }
      
      console.log(`Added new token to tracking: ${tokenMint}`);
      return true;
    } catch (error) {
      console.error('Error adding new token:', error);
      return false;
    }
  }

  async deactivateToken(tokenMint: string): Promise<boolean> {
    try {
      await Token.updateOne(
        { mintAddress: tokenMint },
        { 
          isActive: false,
          lastUpdated: new Date()
        }
      );

      if (this.poolSubscriptions.has(tokenMint)) {
        const subscriptionId = this.poolSubscriptions.get(tokenMint)!;
        await unsubscribeFromPool(connection, subscriptionId);
        this.poolSubscriptions.delete(tokenMint);
      }

      return true;
    } catch (error) {
      console.error('Error deactivating token:', error);
      return false;
    }
  }

  async getTokenStatus(tokenMint: string) {
    try {
      const token = await Token.findOne({ mintAddress: tokenMint });
      if (!token) return null;
      
      return {
        mintAddress: token.mintAddress,
        isActive: token.isActive,
        isTracking: this.poolSubscriptions.has(tokenMint),
        lastUpdated: token.lastUpdated
      };
    } catch (error) {
      console.error('Error getting token status:', error);
      return null;
    }
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    const knownTokens = await this.getKnownTokens();
    
    await Promise.all(knownTokens.map(token => this.startCollecting(token)));
    console.log('Started collecting data for all tokens');
  }

  private async startCollecting(tokenMint: string) {
    if (this.poolSubscriptions.has(tokenMint)) return;
    
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

          await this.updateRedis(tokenMint, update);
        }
      );

      this.poolSubscriptions.set(tokenMint, subscriptionId);
      console.log(`Started collecting data for ${tokenMint}`);

    } catch (error) {
      console.error(`Error starting collection for ${tokenMint}:`, error);
    }
  }

  private async updateRedis(tokenMint: string, update: PriceUpdate) {
    const candleTime = Math.floor(update.ts / 30) * 30;
    const key = `candles:${tokenMint}`;
    const lockKey = `lock:${tokenMint}`;

    try {
      const lock = await redisClient.set(lockKey, '1', {
        NX: true,
        PX: 5000
      });
      
      if (!lock) {
        console.log(`Lock acquisition failed for ${tokenMint}, skipping update`);
        return;
      }

      const multi = redisClient.multi();

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

      multi.set(`current_candle:${tokenMint}`, JSON.stringify(candle));
      await multi.exec();

    } catch (error) {
      console.error(`Error updating Redis for ${tokenMint}:`, error);
    } finally {
      await redisClient.del(lockKey);
    }
  }

  async stop() {
    this.isRunning = false;
    await Promise.all(
      Array.from(this.poolSubscriptions.entries()).map(([_, subscriptionId]) => 
        unsubscribeFromPool(connection, subscriptionId)
      )
    );
    this.poolSubscriptions.clear();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTokens: Array.from(this.poolSubscriptions.keys()),
      subscriptionCount: this.poolSubscriptions.size
    };
  }
}


const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || '';
const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(WALLET_PRIVATE_KEY)));
const provider = new AnchorProvider(connection, new Wallet(wallet), {});
const program = new Program<AiAgent>(IDL, PROGRAM_ID, provider);


redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.connect().catch(console.error);


const priceCollector = new PriceCollectorService();
priceCollector.start().catch(console.error);


app.get('/status', (req, res) => {
  res.json(priceCollector.getStatus());
});

app.get("/candles/:tokenMint", async (req, res) => {
  const { tokenMint } = req.params;
  const { start, end } = req.query;
  
  try {
    const [historicalCandles, currentCandle] = await Promise.all([
      redisClient.zRange(`candles:${tokenMint}`, Number(start) || 0, Number(end) || -1),
      redisClient.get(`current_candle:${tokenMint}`)
    ]);
    
    res.json([
      ...historicalCandles.map(candle => JSON.parse(candle)),
      ...(currentCandle ? [JSON.parse(currentCandle)] : [])
    ]);
  } catch (error) {
    console.error('Error fetching candles:', error);
    res.status(500).json({ error: "Failed to fetch candles" });
  }
});

app.post('/tokens/add', async (req, res) => {
  const { tokenMint } = req.body;
  
  if (!tokenMint) {
    res.status(400).json({ error: 'Token mint address is required' });
    return;
  }

  try {
    const success = await priceCollector.addNewToken(tokenMint);
    if (success) {
      const status = await priceCollector.getTokenStatus(tokenMint);
       res.json({ 
        message: 'Token added successfully', 
        status 
      });
      return;
    } else {
      res.status(500).json({ error: 'Failed to add token' });
      return;
    }
  } catch (error) {
    console.error('Error in add token endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

app.get('/tokens', async (req, res) => {
  try {
    const tokens = await Token.find().sort({ createdAt: -1 });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

app.post('/tokens/deactivate', async (req, res) => {
  const { tokenMint } = req.body;
  
  if (!tokenMint) {
    res.status(400).json({ error: 'Token mint address is required' });
    return;
  }

  try {
    const success = await priceCollector.deactivateToken(tokenMint);
    if (success) {
      const status = await priceCollector.getTokenStatus(tokenMint);
      res.json({ 
        message: 'Token deactivated successfully', 
        status 
      });
      return;
    } else {
      res.status(500).json({ error: 'Failed to deactivate token' });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Cleaning up...');
  await priceCollector.stop();
  await redisClient.quit();
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});