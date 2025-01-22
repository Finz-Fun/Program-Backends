import express, { Request, Response } from 'express';
import { Connection, PublicKey, Keypair, sendAndConfirmTransaction, Transaction, SYSVAR_RENT_PUBKEY, SystemProgram, ComputeBudgetProgram } from '@solana/web3.js';
import {TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, createMint, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction} from "@solana/spl-token"
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import {AiAgent, idljson } from './idl/ai_agent';
import * as dotenv from 'dotenv';
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import {actionCorsMiddleware, ACTIONS_CORS_HEADERS, BLOCKCHAIN_IDS} from "@solana/actions"
import cors from "cors";

dotenv.config();

const app = express();
// app.use(cors());
app.use(express.json());

app.use('/blinks', actionCorsMiddleware({headers: ACTIONS_CORS_HEADERS,chainId: BLOCKCHAIN_IDS.devnet,actionVersion:1}));
app.use('/api/blinks', actionCorsMiddleware({headers: ACTIONS_CORS_HEADERS, chainId: BLOCKCHAIN_IDS.devnet,actionVersion:1}));



const PORT = process.env.PORT || 3000;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || '';

const wallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(WALLET_PRIVATE_KEY)));
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
const readOnlyProvider = new AnchorProvider(connection, new Wallet(wallet), {});
const programId = new PublicKey(process.env.PROGRAM_ID as any);
const IDL = JSON.parse(idljson);
const program = new Program<AiAgent>(IDL, programId, readOnlyProvider);

const curveSeed = "CurveConfiguration"
const POOL_SEED_PREFIX = "liquidity_pool"
const SOL_VAULT_PREFIX = "liquidity_sol_vault"
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const [curveConfig] = PublicKey.findProgramAddressSync(
  [Buffer.from(curveSeed)],
  program.programId
)

const teamAccount = new PublicKey("6XF158v9uXWL7dpJnkJFHKpZgzmLXX5HoH4vG5hPsmmP")



// Initialize route
// app.post('/initialize', async (req: Request, res: Response) => {
//   try {
//     const tx = new Transaction()
//     .add(
//       await program.methods
//         .initialize(1)
//         .accounts({
//           dexConfigurationAccount: curveConfig,
//           admin: wallet.publicKey,
//           rent: SYSVAR_RENT_PUBKEY,
//           systemProgram: SystemProgram.programId
//         })
//         .instruction()
//     )
//     tx.feePayer = wallet.publicKey
//     tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
//     console.log(await connection.simulateTransaction(tx))
//     const sig = await sendAndConfirmTransaction(connection, tx, [wallet], { skipPreflight: true })
//     console.log("Successfully initialized : ", `https://solscan.io/tx/${sig}?cluster=devnet`)
//     let pool = await program.account.curveConfiguration.fetch(curveConfig)
//     console.log("Pool State : ", pool)

//     res.status(200).send({ message: 'Initialization successful' });
//   } catch (error:any) {
//     res.status(500).send({ error: error.message });
//   }
// });


app.get("/create-token-and-add-liquidity", async (req, res) => {
  try {
    const {user_key} = req.body

    console.log("Creating a new token...");
    const user = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(user_key)));
    const mint = await createMint(connection, user, user.publicKey, null, 9); // 9 decimals
    console.log(mint.toBase58())

    const amount = new BN(1000000000).mul(new BN(10 ** 9))


    console.log("Getting user's associated token account...");
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(connection, user, mint, user.publicKey)

    console.log("Minting tokens to the user...");
    await mintTo(connection, user, mint, userTokenAccount.address, user, BigInt(amount.toString()));

    console.log("Creating the pool PDA...");
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()],
      program.programId
    );

    const [poolSolVault] = PublicKey.findProgramAddressSync(
      [Buffer.from(SOL_VAULT_PREFIX), mint.toBuffer()],
      program.programId
    );

    const poolTokenAccount = await getAssociatedTokenAddress(
      mint, poolPda, true
    )

    const tx1 = new Transaction()
    .add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 }),
      await program.methods
        .createPool()
        .accounts({
          pool: poolPda,
          tokenMint: mint,
          poolTokenAccount: poolTokenAccount,
          payer: user.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .instruction()
    )
    console.log(user.publicKey.toBase58())
    tx1.feePayer = user.publicKey
    tx1.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    console.log(await connection.simulateTransaction(tx1))
    const sig = await sendAndConfirmTransaction(connection, tx1, [user], { skipPreflight: true })
    console.log("Successfully created pool : ", `https://solscan.io/tx/${sig}?cluster=devnet`)

    // Step 5: Add Liquidity
    console.log("Adding liquidity to the pool...");
    const tx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 }),
      await program.methods
        .addLiquidity()
        .accounts({
          pool: poolPda,
          poolSolVault: poolSolVault,
          tokenMint: mint,
          poolTokenAccount: poolTokenAccount,
          userTokenAccount: userTokenAccount.address,
          user: user.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
        })
        .instruction()
    );

    tx.feePayer = user.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const signature = await sendAndConfirmTransaction(connection, tx, [user], { skipPreflight: true });

    console.log(`Transaction successful: https://solscan.io/tx/${signature}?cluster=devnet`);

    res.json({
      success: true,
      message: "Token created, minted to user, pool created, and liquidity added successfully.",
      tokenMintAddress: mint.toBase58(),
      transactionSignature: signature,
    });
  } catch (error:any) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Remove liquidity route
// app.post('/remove-liquidity', async (req: Request, res: Response) => {
//   try {
//     const { pool, tokenMint, poolTokenAccount, userTokenAccount, poolSolVault, user, bump } = req.body;

//     await program.methods
//       .removeLiquidity(bump)
//       .accounts({
//         pool: new PublicKey(pool),
//         tokenMint: new PublicKey(tokenMint),
//         poolTokenAccount: new PublicKey(poolTokenAccount),
//         userTokenAccount: new PublicKey(userTokenAccount),
//         poolSolVault: new PublicKey(poolSolVault),
//         user: new PublicKey(user),
//         rent: web3.SYSVAR_RENT_PUBKEY,
//         systemProgram: web3.SystemProgram.programId,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         associatedTokenProgram: new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID),
//       })
//       .rpc();

//     res.status(200).send({ message: 'Liquidity removed successfully' });
//   } catch (error:any) {
//     res.status(500).send({ error: error.message });
//   }
// });




const fetchPoolData = async (tokenMint:string)=>{
  try{
    const VIRTUAL_SOL = new BN(25_000_000_000);
    const mint = new PublicKey(tokenMint)
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()],
      program.programId
    );
    const stateData = await program.account.liquidityPool.fetch(poolPda)
    const reserveSol = stateData.reserveSol
  
    const totalSolWithVirtual = reserveSol.add(VIRTUAL_SOL);
    
    const mcapInSol = parseInt(totalSolWithVirtual.toString())/ parseInt((new BN(1_000_000_000)).toString());
  
    return { price:mcapInSol}
  } catch (error:any) {
    console.log(error)
    return { price:0}
}
}


app.get('/blinks/:tokenMint', async (req: Request, res: Response) => {
  try {
    const { tokenMint } = req.params;
    const baseHref = `/api/blinks/${tokenMint}`
    const poolData = await fetchPoolData(tokenMint);
    const tokenData= {
      title: "$MVP token trading",
      description: "Trade $MVP token from finz platform launched by AI agents!",
      icon: "https://trade-chart-sandy.vercel.app/image.png",
      label: "Trade Token",
    }

    const blinksMetadata = {
      type: "action",
      title: tokenData.title,
      icon: tokenData.icon, 
      description: tokenData.description+`\n`+`Current mcap: ${poolData.price} SOL`,
      label: tokenData.label,
      links: {
        actions: [
          { label: "0.1 SOL buy", href: `${baseHref}/buy?amount=0.1` },
          { label: "0.5 SOL buy", href: `${baseHref}/buy?amount=0.5` },
          { label: "1 SOL buy", href: `${baseHref}/buy?amount=1` },
          // { label: "2 SOL buy", href: `${baseHref}/buy&amount=2` },
          {
            label: "Buy Tokens",
            href: `${baseHref}/buy?amount={amount}`,
            parameters: [
              {
                name: "amount",
                type: "string",
                label: "SOL Amount",
                required: true,
                placeholder: "Enter SOL amount",
                pattern: "^[0-9]*[.]?[0-9]{0,2}$",
                min: 0.01,
                max: 100,
                patternDescription: "Enter amount between 0.01 and 100 SOL (max 2 decimal places)"
              }
            ]
          },
          {
            label: "Sell Tokens",
            href: `${baseHref}/sell?amount={amount}`,
            parameters: [
              {
                name: "amount",
                type: "string",
                label: "Token Amount",
                required: true,
                placeholder: "Enter percentage",
                pattern: "^[0-9]{1,10}$",
                patternDescription: "Enter token amount to sell"
              }
            ]
          },
          // { label: "25% sell", href: `${baseHref}/sell&percentage=25` },
          { label: "50% sell", href: `${baseHref}/sell?percentage=50` },
          { label: "75% sell", href: `${baseHref}/sell?percentage=75` },
          { label: "100% sell", href: `${baseHref}/sell?percentage=100` },
        ]
      }
    };

    res.json(blinksMetadata);
  } catch (error: any) {
    console.error('Metadata error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/blinks/:tokenMint/buy', async (req: Request, res: Response) => {
  try {
    const { tokenMint } = req.params;
    const {amount} = req.query
    const {account} = req.body;

    if (!amount) {
      throw new Error('Amount is required');
    }

    const userPubkey = new PublicKey(account);
    const mint = new PublicKey(tokenMint);

    const userTokenAccount = await getAssociatedTokenAddress(
      mint,
      userPubkey,
      false
    );
    
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()],
      program.programId
    );

    const [poolSolVault] = PublicKey.findProgramAddressSync(
      [Buffer.from(SOL_VAULT_PREFIX), mint.toBuffer()],
      program.programId
    );

    const poolTokenAccount = await getAssociatedTokenAddress(
      mint, poolPda, true
    );

    const amountInLamports = Math.floor(parseFloat(amount as string) * 1e9);


    const tx = new Transaction();
    

    const tokenAccountInfo = await connection.getAccountInfo(userTokenAccount);
    

    if (!tokenAccountInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          userPubkey,
          userTokenAccount,
          userPubkey,
          mint
        )
      );
    }

    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 }),
      await program.methods
        .buy(new BN(amountInLamports))
        .accounts({
          pool: poolPda,
          tokenMint: mint,
          teamAccount: teamAccount,
          poolSolVault,
          poolTokenAccount: poolTokenAccount,
          userTokenAccount: userTokenAccount,
          dexConfigurationAccount: curveConfig,
          user: userPubkey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId
        })
        .instruction()
    );


    tx.feePayer = userPubkey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;


    const serializedTx = tx.serialize({ requireAllSignatures: false }).toString('base64');

    res.json({
      transaction: serializedTx,
      message: `Buy ${amount} SOL worth of tokens`
    });
  } catch (error: any) {
    console.error('Buy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/blinks/:tokenMint/sell', async (req: Request, res: Response) => {
  try {
    const { tokenMint } = req.params;
    const { amount, percentage } = req.query;
    const { account } = req.body;

    if (!amount && !percentage) {
      throw new Error('Either amount or percentage is required');
    }

    const userPubkey = new PublicKey(account);
    const mint = new PublicKey(tokenMint);


    const userTokenAccount = await getAssociatedTokenAddress(
      mint,
      userPubkey,
      false
    );

    try {
      const tokenBalance = await connection.getTokenAccountBalance(userTokenAccount);

      if (!tokenBalance.value.amount || tokenBalance.value.amount === '0') {
        throw new Error('No tokens to sell');
      }

      let tokenAmount: BN;
      let sellMessage: string;

      if (percentage) {
        const sellPercentage = parseInt(percentage as string) / 100;
        const rawAmount = new BN(tokenBalance.value.amount);
        tokenAmount = rawAmount.muln(sellPercentage);
        sellMessage = `Sell ${tokenBalance.value.uiAmount as number * sellPercentage} tokens (${percentage}% of your balance)`;
      } else {
        const rawAmount = parseFloat(amount as string) * 1e9;
        tokenAmount = new BN(Math.floor(rawAmount));
        
        if (tokenAmount.gt(new BN(tokenBalance.value.amount))) {
          throw new Error('Insufficient token balance');
        }
        sellMessage = `Sell ${amount} tokens`;
      }

      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()],
        program.programId
      );

      const [poolSolVault, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(SOL_VAULT_PREFIX), mint.toBuffer()],
        program.programId
      );

      const poolTokenAccount = await getAssociatedTokenAddress(
        mint,
        poolPda,
        true
      );

      const tx = new Transaction().add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 }),
        await program.methods
          .sell(tokenAmount, bump)
          .accounts({
            pool: poolPda,
            tokenMint: mint,
            teamAccount: teamAccount,
            poolSolVault,
            poolTokenAccount: poolTokenAccount,
            userTokenAccount: userTokenAccount,
            dexConfigurationAccount: curveConfig,
            user: userPubkey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId
          })
          .instruction()
      );

      tx.feePayer = userPubkey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const serializedTx = tx.serialize({ requireAllSignatures: false }).toString('base64');

      res.json({
        transaction: serializedTx,
        message: sellMessage
      });
    } catch (error: any) {
      if (error.message.includes('Account does not exist')) {
        throw new Error('No token account found. You need tokens to sell.');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Sell error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/actions.json', (req: Request, res: Response) => {
  res.json({
    rules: [
      {
        pathPattern: "/blinks/*",
        apiPath: "/blinks/*"
      },
      {
        pathPattern: "/api/blinks/**",
        apiPath: "/api/blinks/**"
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

