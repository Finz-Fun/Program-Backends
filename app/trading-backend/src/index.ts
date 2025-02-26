import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { connection, PORT, PROGRAM_ID } from './config';
import { PriceUpdate } from './types';
import { Keypair } from '@solana/web3.js';
import { subscribeToPoolUpdates, unsubscribeFromPool } from './utils/pool';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { AiAgent, IDL } from './idl/ai_agent';
import mongoose from 'mongoose';
import { Token } from './models/tokenSchema';
import { priceUpdateQueue } from './queues';
import dotenv from 'dotenv';

dotenv.config();

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
      const tokens = await Token.find({ isActive: true, liquidity: true });
      if (!tokens.length) {
        const defaultTokens = [
          '9geyEpevinqqpocmGgtDuSDagbrBwWPeJa2vTTSUeMU5'
        ];
        
        await Token.insertMany(
          defaultTokens.map(mint => ({ mintAddress: mint }))
        );
        
        return defaultTokens;
      }
      
      return tokens.map(token => token.mintAddress!)
    } catch (error) {
      console.error('Error getting known tokens:', error);
      return [];
    }
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

          // BullMQ job options
          await priceUpdateQueue.add('price-update', update, {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000
            },
            removeOnComplete: true,
            removeOnFail: 1000,
            priority: 1
          });
        }
      );

      this.poolSubscriptions.set(tokenMint, subscriptionId);
      console.log(`Started collecting data for ${tokenMint}`);

    } catch (error) {
      console.error(`Error starting collection for ${tokenMint}:`, error);
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
        
        if (this.isRunning) {
          await this.startCollecting(tokenMint);
        }
        
        return true;
      }
      
      return false;
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

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    const knownTokens = await this.getKnownTokens();
    await Promise.all(knownTokens.map(token => this.startCollecting(token)));
    console.log('Started collecting data for all tokens');
  }

  async stop() {
    this.isRunning = false;
    await Promise.all([
      ...Array.from(this.poolSubscriptions.entries()).map(([_, subscriptionId]) => 
        unsubscribeFromPool(connection, subscriptionId)
      )
    ]);
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

const priceCollector = new PriceCollectorService();
priceCollector.start().catch(console.error);

app.get('/status', (req, res) => {
  res.json(priceCollector.getStatus());
});

app.get('/queue-status', async (req, res) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      priceUpdateQueue.getWaitingCount(),
      priceUpdateQueue.getActiveCount(),
      priceUpdateQueue.getCompletedCount(),
      priceUpdateQueue.getFailedCount(),
    ]);

    res.json({
      waiting,
      active,
      completed,
      failed
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch queue status' });
  }
});

app.get('/tokens/add', async (req, res) => {
  const { tokenMint } = req.query;
  if (!tokenMint) {
    res.status(400).json({ error: 'Token mint address is required' });
    return;
  }

  try {
    const success = await priceCollector.addNewToken(tokenMint as string);
    if (success) {
      res.json({ message: 'Token added successfully' });
    } else {
      res.status(500).json({ error: 'Failed to add token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
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
      res.json({ message: 'Token deactivated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to deactivate token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Cleaning up...');
  await Promise.all([
    priceCollector.stop(),
    priceUpdateQueue.close(),
  ]);
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});