import { Connection, PublicKey } from '@solana/web3.js';
import { Program, BN } from '@coral-xyz/anchor';
import { AiAgent } from '../idl/ai_agent';
import { PoolData } from '../types';

const POOL_SEED_PREFIX = "liquidity_pool";
const VIRTUAL_SOL = new BN(25_000_000_000); 

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
    
    const totalSolWithVirtual = reserveSol.add(VIRTUAL_SOL);
    console.log(totalSolWithVirtual.toString())
    
    const mcapInSol = parseInt(totalSolWithVirtual.toString())/ parseInt((new BN(1_000_000_000)).toString());
    console.log(mcapInSol)

    return {
      price: mcapInSol,
      reserveSol: parseInt(reserveSol.toString()),
      reserveToken: parseInt((stateData.reserveToken).toString())
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

  console.log("subscription id", subscriptionId)

  return subscriptionId;
}

export function unsubscribeFromPool(
  connection: Connection,
  subscriptionId: number
): void {
  connection.removeAccountChangeListener(subscriptionId);
}