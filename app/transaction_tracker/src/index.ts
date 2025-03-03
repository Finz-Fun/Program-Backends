import { connection, PROGRAM_ID } from './config';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import dotenv from 'dotenv';
import { transactionQueue } from './queues';


dotenv.config();

interface ParsedTransactionData {
  tokenMintAddress: string;
  type: 'BUY' | 'SELL';
  timestamp: number;
  solAmount: number;
  walletAddress: string;
  price: string;
  tokenAmount: number;
  signature: string;
}

connection.onLogs(PROGRAM_ID, async (logs, ctx) => {
  try {
    let transactionInfo = null;
    for (const log of logs.logs) {
      if (log.includes('TRANSACTION_INFO')) {
        const jsonStr = log.split('TRANSACTION_INFO')[1];
        transactionInfo = JSON.parse(jsonStr);
        break;
      }
    }

    if (!transactionInfo) return;

    const parsedData: ParsedTransactionData = {
      tokenMintAddress: transactionInfo.token_mint_address,
      type: transactionInfo.type,
      timestamp: Date.now(),
      solAmount: transactionInfo.sol_amount / LAMPORTS_PER_SOL,
      walletAddress: transactionInfo.wallet,
      price: (((transactionInfo.sol_amount / LAMPORTS_PER_SOL) / (transactionInfo.token_amount/1E9)).toFixed(10)),
      tokenAmount: transactionInfo.token_amount/1E9,
      signature: logs.signature
    };

    // Add to queue instead of processing directly
    await transactionQueue.add('transaction', parsedData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true,
      removeOnFail: 1000,
      priority: 1
    });
    
  } catch (error) {
    console.error('Error processing transaction:', error);
  }
}, 'confirmed');

// Add cleanup on shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Cleaning up...');
  await transactionQueue.close();
});