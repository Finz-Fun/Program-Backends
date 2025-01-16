import { Connection, PublicKey } from '@solana/web3.js';
import { Program, BN } from '@coral-xyz/anchor';
import { AiAgent } from '../idl/ai_agent';
import { PoolData } from '../types';

const POOL_SEED_PREFIX = "liquidity_pool";

export async function fetchPoolData(
  program: Program<AiAgent>,
  tokenMint: string
): Promise<PoolData> {
  try {
    const mint = new PublicKey(tokenMint);
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()],
      program.programId
    );

    const stateData = await program.account.liquidityPool.fetch(poolPda);
    const reserveSol = stateData.reserveSol;
    const reserveToken = stateData.reserveToken;
    const tokenDecimals = 9;

    const reserveTokenScaled = reserveToken.div(new BN(Math.pow(10, tokenDecimals)));
    

    const price = parseInt(reserveSol.toString()) / parseInt(reserveTokenScaled.toString());

    return {
      price,
      reserveSol: parseInt(reserveSol.toString()),
      reserveToken: parseInt(reserveTokenScaled.toString())
    };
  } catch (error) {
    console.error('Error fetching pool data:', error);
    throw error;
  }
}

export async function subscribeToPoolUpdates(
  program: Program<AiAgent>,
  tokenMint: string,
  callback: (update: PoolData) => void
): Promise<number> {
  const mint = new PublicKey(tokenMint);
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()],
    program.programId
  );

  const subscriptionId = program.provider.connection.onAccountChange(
    poolPda,
    async (accountInfo) => {
      try {
        const poolData = await fetchPoolData(program, tokenMint);
        callback(poolData);
      } catch (error) {
        console.error('Error processing pool update:', error);
      }
    },
    'confirmed'
  );

  return subscriptionId;
}

export function unsubscribeFromPool(
  connection: Connection,
  subscriptionId: number
): void {
  connection.removeAccountChangeListener(subscriptionId);
}