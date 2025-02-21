import express, { Request, Response } from 'express';
import { Connection, PublicKey, Keypair, sendAndConfirmTransaction, Transaction, SYSVAR_RENT_PUBKEY, SystemProgram, ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js';
import {TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, createMint, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, createInitializeMint2Instruction, createMintToInstruction} from "@solana/spl-token"
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import {AiAgent, IDL } from './idl/ai_agent';
import * as dotenv from 'dotenv';
import { ASSOCIATED_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import {actionCorsMiddleware, ACTIONS_CORS_HEADERS, BLOCKCHAIN_IDS} from "@solana/actions"
import cors from "cors";
import {
  createMetadataAccountV3,
	createV1,
	findMetadataPda,
	mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import {  createSignerFromKeypair, keypairIdentity, percentAmount, publicKey, signerIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from '@metaplex-foundation/umi/serializers'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import Creator from './models/creatorSchema';
import { connectDB } from './db';
import nodeHtmlToImage from 'node-html-to-image';
import { Token } from './models/tokenSchema';
import Walletmodel from './models/walletSchema';
import Mentions from './models/mentionsSchema';
dotenv.config();

const app = express();
app.use((req, res, next) => {
  // Skip CORS for blinks routes
  if (req.path.startsWith('/blinks') || req.path.startsWith('/api/blinks')) {
    return next();
  }
  cors()(req, res, next);});
app.use(express.json());

app.use('/blinks', actionCorsMiddleware({headers: ACTIONS_CORS_HEADERS,chainId: BLOCKCHAIN_IDS.devnet,actionVersion:1}));
app.use('/api/blinks', actionCorsMiddleware({headers: ACTIONS_CORS_HEADERS, chainId: BLOCKCHAIN_IDS.devnet,actionVersion:1}));

connectDB()



const PORT = process.env.PORT || 3000;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || '';

const platformWallet = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(WALLET_PRIVATE_KEY)));
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
const readOnlyProvider = new AnchorProvider(connection, new Wallet(platformWallet), {});
const programId = new PublicKey(process.env.PROGRAM_ID as any);
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



const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

let cachedSolanaPrice: number | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 15 * 60 * 1000;


async function getSolanaPrice(): Promise<number> {
  const now = Date.now();
  
  if (cachedSolanaPrice && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSolanaPrice;
  }

  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    cachedSolanaPrice = data.solana.usd;
    lastFetchTime = now;
    return cachedSolanaPrice ? cachedSolanaPrice : 1;
  } catch (error) {
    console.log('Error fetching solana price:', error);
    return cachedSolanaPrice || 1;
  }
}

async function uploadToS3(
  name: string, 
  symbol: string, 
  imageBuffer: Buffer,
  contentType: string
): Promise<{metadataUri: string, imageUrl: string}> {
  try {

    const uniqueId = uuidv4();
    
    const imageKey = `token-images/${uniqueId}.png`;
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageKey,
      Body: imageBuffer,
      ContentType: contentType,
      ACL: 'public-read' 
    }));

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;

    const metadata = {
      name,
      symbol,
      description: `${name} token for our finz.fun`,
      image: imageUrl
    };

    const metadataKey = `token-metadata/${uniqueId}.json`;
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: metadataKey,
      Body: JSON.stringify(metadata),
      ContentType: 'application/json',
      ACL: 'public-read'
    }));

    return {metadataUri: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${metadataKey}`, imageUrl: imageUrl}
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}



interface TweetData {
  name: string;
  username: string;
  content: string;
  timestamp: string;
  replies: number;
  retweets: number;
  likes: number;
  tweetImage?: string | null;
  avatarUrl?: string;
}

async function generateTweetImage(tweetData: TweetData): Promise<Buffer> {
  const cleanContent = (content: string) => {
    return content
      .replace(/\s+https:\/\/t\.co\/\w+$/, '') 
      .replace(/@finzfunAI\s*/g, '');
  };

  const html = `
    <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 598px;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: black;
            overflow: hidden;
            height: fit-content;
          }
          
          .tweet {
            background-color: black;
            color: white;
            padding: 16px;
            max-width: 598px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            margin: 0;
          }
          
          .metrics {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
            margin-bottom: 0;
            color: rgb(113, 118, 123);
            max-width: 425px;
          }
          .container {
            display: flex;
          }
          .avatar-container {
            flex-shrink: 0;
            margin-right: 12px;
          }
          .avatar {
            width: 40px;
            height: 40px;
          }
          .avatar img {
            width: 100%;
            height: 100%;
            border-radius: 9999px;
            object-fit: cover;
          }
          .content-container {
            flex: 1;
            min-width: 0;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .user-info {
            display: flex;
            align-items: center;
          }
          .name {
            font-weight: 700;
            font-size: 15px;
            color: white;
          }
          .username {
            color: rgb(113, 118, 123);
            font-size: 15px;
            margin-left: 4px;
          }
          .dot {
            color: rgb(113, 118, 123);
            margin: 0 4px;
          }
          .timestamp {
            color: rgb(113, 118, 123);
            font-size: 15px;
          }
          .more-button {
            color: rgb(113, 118, 123);
          }
          .more-button svg {
            width: 20px;
            height: 20px;
          }
          .tweet-content {
            margin-top: 4px;
            font-size: 15px;
            line-height: 1.3;
            white-space: pre-wrap;
            color: white;
            word-wrap: break-word;
            overflow-wrap: break-word;
            margin-bottom: 12px;
          }
          .metric {
            display: flex;
            align-items: center;
            cursor: pointer;
          }
          .metric-content {
            display: flex;
            align-items: center;
          }
          .metric svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
          }
          .metric span {
            font-size: 14px;
            margin-left: 8px;
          }
          .tweet-image {
            margin-top: 10px;
            margin-bottom: 12px;
            border-radius: 16px;
            overflow: hidden;
            max-width: 100%;
          }
          
          .tweet-image img {
            width: 100%;
            height: auto;
            max-height: 350px;
            object-fit: cover;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="tweet">
          <div class="container">
            <div class="avatar-container">
              <div class="avatar">
                <img src="${tweetData.avatarUrl}" alt="https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg" />
              </div>
            </div>
            <div class="content-container">
              <div class="header">
                <div class="user-info">
                  <span class="name">${tweetData.name}</span>
                  <span class="username">@${tweetData.username}</span>
                  <span class="dot">·</span>
                  <span class="timestamp">${tweetData.timestamp}</span>
                </div>
                <div class="more-button">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                  </svg>
                </div>
              </div>
              
              <div class="tweet-content">${cleanContent(tweetData.content)}</div>

              ${tweetData.tweetImage ? `
                <div class="tweet-image">
                  <img src="${tweetData.tweetImage}" alt="Tweet image" />
                </div>
              ` : ''}

              <div class="metrics">
                <div class="metric">
                  <div class="metric-content">
                    <svg viewBox="0 0 24 24">
                      <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                    </svg>
                    <span>${tweetData.replies}</span>
                  </div>
                </div>
                
                <div class="metric">
                  <div class="metric-content">
                    <svg viewBox="0 0 24 24">
                      <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
                    </svg>
                    <span>${tweetData.retweets}</span>
                  </div>
                </div>
                
                <div class="metric">
                  <div class="metric-content">
                    <svg viewBox="0 0 24 24">
                      <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91z"/>
                    </svg>
                    <span>${tweetData.likes}</span>
                  </div>
                </div>

                <div class="metric">
                  <div class="metric-content">
                    <svg viewBox="0 0 24 24">
                      <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
                    </svg>
                  </div>
                </div>

                <div class="metric">
                  <div class="metric-content">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Adjust height calculation to include image height if present
  const contentLength = tweetData.content.length;
  const lineHeight = 20;
  const charsPerLine = 60;
  const estimatedLines = Math.ceil(contentLength / charsPerLine);
  const baseHeight = 120;
  const imageHeight = tweetData.tweetImage ? 350 : 0; // Add image height if present
  const estimatedHeight = baseHeight + (estimatedLines * lineHeight) + imageHeight;

  const image = await nodeHtmlToImage({
    html,
    quality: 100,
    type: 'png',
    puppeteerArgs: {
      defaultViewport: {
        width: 598,
        height: estimatedHeight,
      },
    },
  });

  return image as Buffer;
}

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


app.post("/create-token", async (req, res) => {
  try {
    const { tokenName, symbol } = req.query;

    const requiredFields = [
      'tweetId',
      'name',
      'username',
      'content',
      'timestamp',
      'replies',
      'creator',
      'avatarUrl'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const tweetData = {
      tweetId: String(req.body.tweetId),
      name: String(req.body.name),
      username: String(req.body.username),
      content: String(req.body.content),
      timestamp: String(req.body.timestamp),
      replies: Number(req.body.replies) || 0,
      retweets: Number(req.body.retweets) || 0,
      likes: Number(req.body.likes) || 0,
      creator: String(req.body.creator),
      avatarUrl: String(req.body.avatarUrl),
      ...(req.body.tweetImage && { tweetImage: String(req.body.tweetImage) })
    };
    
    const imageBuffer = await generateTweetImage(tweetData);

    // const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
    // const contentType = image.split(';')[0].split(':')[1];
    const contentType = "image/png"

    const mintKeypair = Keypair.generate();

    const {metadataUri, imageUrl} = await uploadToS3(tokenName as string, symbol as string, imageBuffer, contentType);
    await Token.create({
      creator: tweetData.creator,
      name:tokenName,
      symbol,
      metadataUri,
      imageUrl: imageUrl,
      tweetId: tweetData.tweetId,
      mintAddress: mintKeypair.publicKey.toBase58(),
      secretKey: Buffer.from(mintKeypair.secretKey).toString('base64')
    })

    


    


    // await mintTo(
    //   connection,
    //   platformWallet,
    //   mint,
    //   platformTokenAccount.address,
    //   platformWallet,
    //   BigInt(TOTAL_SUPPLY.toString())
    // );

    // await setAuthority(
    //   connection,
    //   platformWallet,
    //   mint,
    //   platformWallet.publicKey,
    //   0,
    //   null
    // );
    

    res.json({
      success: true,
      secretKey: Buffer.from(mintKeypair.secretKey).toString('base64'),
      tokenMint: mintKeypair.publicKey.toBase58(),
      name: tokenName,
      symbol,
      metaData: metadataUri
    });

  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


app.post("/create-add-liquidity-transaction", async (req, res) => {
  try {
    const { mintAddress, solAmount, account} = req.body; 

    const token = await Token.findOne({mintAddress})
    const secretKey = token?.secretKey as string
    const secretKeyUint8Array = Uint8Array.from(
      Buffer.from(secretKey, 'base64')
    );
    const mintsecretpair = Keypair.fromSecretKey(secretKeyUint8Array);
    const mintSecretKey = mintsecretpair.secretKey
    const user = new PublicKey(account);

    const umi = createUmi("https://api.devnet.solana.com")
	  .use(mplTokenMetadata())
	  .use(mplToolbox());
    
    const mintKeypair = Keypair.fromSecretKey(new Uint8Array(mintSecretKey));
    const keypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(JSON.parse(WALLET_PRIVATE_KEY)))
    const mintpair = umi.eddsa.createKeypairFromSecretKey(mintSecretKey)
    

    const mintSigner = createSignerFromKeypair(umi, mintpair);

    umi.use(keypairIdentity(keypair,true))



    const platformTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      platformWallet.publicKey
    );

    const TOTAL_SUPPLY = new BN(1000000000).mul(new BN(10 ** 9))

    const tokenMetadata = {
      name: token?.name as string,
      symbol: token?.symbol as string,
      uri: token?.metadataUri as string
    };

    const metadataAccountAddress = findMetadataPda(umi, {
      mint: publicKey(mintKeypair.publicKey.toBase58()),
    });
    
    // const INITIAL_LIQUIDITY_SOL =Math.floor(parseFloat("0.02") * 1e9); 
    const buyAmount = Math.floor(parseFloat(solAmount as string) * 1e9); 

    const userTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      user
    );

    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(POOL_SEED_PREFIX), mintKeypair.publicKey.toBuffer()],
      program.programId
    );

    const [poolSolVault] = PublicKey.findProgramAddressSync(
      [Buffer.from(SOL_VAULT_PREFIX), mintKeypair.publicKey.toBuffer()],
      program.programId
    );

    const poolTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey, 
      poolPda, 
      true
    );


    const metadataTx = createV1(umi, {
      mint: mintSigner,
      authority: umi.identity,
      updateAuthority: umi.identity,
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      uri: tokenMetadata.uri,
      sellerFeeBasisPoints: percentAmount(0),
      tokenStandard: TokenStandard.Fungible,
    })
    
    const metadataInstructions = metadataTx.getInstructions().map(umiIx => {
      return new TransactionInstruction({
        keys: umiIx.keys.map(key => ({
          pubkey: new PublicKey(key.pubkey.toString()),
          isSigner: key.isSigner,
          isWritable: key.isWritable
        })),
        programId: new PublicKey(umiIx.programId.toString()),
        data: Buffer.from(umiIx.data)
      });
    });

  //   const mintAuthorityInstruction = createSetAuthorityInstruction(
  //     mintKeypair.publicKey,
  //     platformWallet.publicKey,
  //     AuthorityType.MintTokens,
  //     null
  // )
   
  // createMint(connection, platformWallet, platformWallet.publicKey, null, 9, mintKeypair)

   const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const tx = new Transaction()
    .add(
      SystemProgram.createAccount({
        fromPubkey: user,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID
    }),
    createInitializeMint2Instruction(mintKeypair.publicKey, 9, platformWallet.publicKey, null, TOKEN_PROGRAM_ID),
    createAssociatedTokenAccountInstruction(platformWallet.publicKey, platformTokenAccount, platformWallet.publicKey, mintKeypair.publicKey),
    createMintToInstruction(mintKeypair.publicKey, platformTokenAccount, platformWallet.publicKey, BigInt(TOTAL_SUPPLY.toString()))
    )


    tx.add(...metadataInstructions)
    // if (!tokenAccountInfo) {
    //   tx.add(
    //     createAssociatedTokenAccountInstruction(
    //       user,
    //       userTokenAccount,
    //       user,
    //       mintKeypair.publicKey
    //     )
    //   );
    // }

    
      tx.add(
      //   createAssociatedTokenAccountInstruction(
      //     user,                
      //     poolTokenAccount,    
      //     poolPda,          
      //     mintKeypair.publicKey               
      // ),
        await program.methods
          .createPool()
          .accounts({
            pool: poolPda,
            tokenMint: mintKeypair.publicKey,
            poolTokenAccount: poolTokenAccount,
            payer: user,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId
          })
          .instruction(),
        await program.methods
          .addLiquidity()
          .accounts({
          pool: poolPda,
          poolSolVault: poolSolVault,
          tokenMint: mintKeypair.publicKey,
          poolTokenAccount: poolTokenAccount,
          platformTokenAccount: platformTokenAccount,
          platformAuthority: platformWallet.publicKey,
          user:user,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          })
          .instruction(),
          // mintAuthorityInstruction,
        await program.methods
          .buy(new BN(buyAmount.toString()))
          .accounts({
            pool: poolPda,
            tokenMint: mintKeypair.publicKey,
            teamAccount: teamAccount,
            poolSolVault,
            poolTokenAccount: poolTokenAccount,
            userTokenAccount: userTokenAccount,
            dexConfigurationAccount: curveConfig,
            user: user,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );

    tx.feePayer = user;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    tx.partialSign(platformWallet, mintKeypair);

    const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    }).toString('base64');

    res.json({
      success: true,
      transaction: serializedTransaction,
      message: "Transaction created successfully. Sign and submit to add liquidity and buy tokens.",
      // initialLiquiditySol: INITIAL_LIQUIDITY_SOL/1e9,
      buyAmountSol: buyAmount / 1e9,
      poolPda: poolPda.toBase58(),
      poolSolVault: poolSolVault.toBase58(),
      poolTokenAccount: poolTokenAccount.toBase58(),
      userTokenAccount: userTokenAccount.toBase58()
    });

  } catch (error: any) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});




app.post('/api/:tokenMint/buy', async (req: Request, res: Response) => {
  try {
    const { tokenMint } = req.params;
    const {amount} = req.query
    const {account} = req.body;

    if (!amount) {
      throw new Error('Amount is required');
    }

    const userPubkey = new PublicKey(account);
    const mint = new PublicKey(tokenMint);

    // Get user token account address
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

    // Pool token account is already created
    const poolTokenAccount = await getAssociatedTokenAddress(
      mint, poolPda, true
    );

    const amountInLamports = Math.floor(parseFloat(amount as string) * 1e9);

    // Create transaction
    const tx = new Transaction();
    
    // Check if token account exists
    const tokenAccountInfo = await connection.getAccountInfo(userTokenAccount);
    
    // Only add ATA creation if it doesn't exist
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

    // Add other instructions
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

    // Set transaction fee payer
    tx.feePayer = userPubkey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Optional: Simulate transaction
    // const simulation = await connection.simulateTransaction(tx);
    // console.log('Buy simulation result:', simulation);

    // if (simulation.value.err) {
    //   throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
    // }

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

app.post('/api/:tokenMint/sell', async (req: Request, res: Response) => {
  try {
    const { tokenMint } = req.params;
    const { amount } = req.query;
    const { account } = req.body;
      
    // console.log('Sell request:', { tokenMint, account, amount });

    if (!amount) {
      throw new Error('amount is required');
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
      // console.log('Token balance:', tokenBalance.value);

      if (!tokenBalance.value.amount || tokenBalance.value.amount === '0') {
        throw new Error('No tokens to sell');
      }

      let tokenAmount: BN;
      let sellMessage: string;

      // console.log("amount", amount);

      tokenAmount = new BN(amount as string);
      // console.log("tokenAmount", tokenAmount);
      if (tokenAmount.gt(new BN(tokenBalance.value.amount))) {
        throw new Error('Insufficient token balance');
      }
        sellMessage = `Sell ${amount} tokens`;

      // console.log('Selling:', {
      //   totalBalance: tokenBalance.value.amount,
      //   amountToSell: tokenAmount.toString()
      // });

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

const fetchReserveToken = async (tokenMint: string) => {
  try {
    const token = await Token.findOne({ mintAddress: tokenMint });
    const creator = await Creator.findOne({ twitterId: token?.creator });
    if (!token) {
      console.log("Token not found in database:", tokenMint);
      return { 
        reserveToken: new BN(0), 
        mcap: 0,
        creatorName: creator?.username,
        tokenName: null,
        tokenSymbol: null, 
        isLiquidityActive: false,
        imageUrl: null 
      };
    }

    try {
      const VIRTUAL_SOL = new BN(25_000_000_000);
      const mint = new PublicKey(tokenMint);
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()],
        program.programId
      );
      const stateData = await program.account.liquidityPool.fetch(poolPda);
      const reserveSol = stateData.reserveSol
  
      const totalSolWithVirtual = reserveSol.add(VIRTUAL_SOL);
    
      const mcapInSol = parseInt(totalSolWithVirtual.toString())/ parseInt((new BN(1_000_000_000)).toString());
      
      return { 
        reserveToken: stateData.reserveToken,
        mcap: mcapInSol,
        creatorName: creator?.username,
        tokenName: token.name,
        tokenSymbol: token.symbol,
        isLiquidityActive: token.liquidity,
        imageUrl: token.imageUrl
      };
    } catch (onChainError) {
      console.log("Failed to fetch on-chain data:", onChainError);
      return { 
        reserveToken: new BN(0),
        mcap: 0,
        creatorName: creator?.username,
        tokenName: token.name,
        tokenSymbol: token.symbol,
        isLiquidityActive: token.liquidity,
        imageUrl: token.imageUrl
      };
    }
  } catch (dbError) {
    console.log("Database error:", dbError);
    return { 
      reserveToken: new BN(0), 
      mcap: 0,
      creatorName: null,
      tokenName: null,
      tokenSymbol: null, 
      isLiquidityActive: false,
      imageUrl: null 
    };
  }
};


app.get('/blinks/:tokenMint', async (req: Request, res: Response) => {
  try {
    const { tokenMint } = req.params;
    const baseHref = `/api/blinks/${tokenMint}`
    const poolData = await fetchPoolData(tokenMint);
    const token = await Token.findOne({mintAddress:tokenMint})
    const tokenData= {
      title: token?.name,
      description: "Trade $"+token?.symbol+" token from finz platform launched by AI agents! Trade here: https://app.finz.fun/coin?tokenMint="+tokenMint,
      icon: token?.imageUrl,
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

app.get('/api/:tokenMint/pool-data', async (req: Request, res: Response) => {
  try {
    const { tokenMint } = req.params;
    const token = await fetchReserveToken(tokenMint);
    res.json({reserveToken: token.reserveToken.toString(), tokenName:token.tokenName, tokenSymbol:token.tokenSymbol, isLiquidityActive:token.isLiquidityActive, imageUrl:token.imageUrl, creatorName:token.creatorName, mcap:token.mcap.toString()});
  } catch (error: any) {
    console.error('Error fetching pool data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/:tokenMint/add-liquidity', async (req: Request, res: Response) => {
  const { tokenMint } = req.params;
  const token = await Token.findOne({mintAddress:tokenMint})
  if (token) {
    token.liquidity = true
    await token.save()
    res.json({success: true, message: "Liquidity added successfully"});
  } else {
    res.status(404).json({error: "Token not found"});
  }
})


// app.get('/generate', async (req: Request, res: Response) => {
//   try {
//     const tweetData = {
//       name: String(req.query.name || 'John Doe'),
//       username: String(req.query.username || 'johndoe'),
//       content: String(req.query.content || 'Hello, World!'),
//       timestamp: String(req.query.timestamp || '2h'),
//       replies: Number(req.query.replies || 0),
//       retweets: Number(req.query.retweets || 0),
//       likes: Number(req.query.likes || 0),
//     };

//     const imageBuffer = await generateTweetImage(tweetData);

//     res.setHeader('Content-Type', 'image/png');
//     res.send(imageBuffer);

//   } catch (error) {
//     console.error('Error generating tweet image:', error);
//     res.status(500).json({
//       error: 'Failed to generate image',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// });


app.put('/api/creators/agent-status', async (req: Request, res: Response) => {
  try {
    const { twitterId, agentEnabled } = req.body;

    // Find and update the creator
    const creator = await Creator.findOneAndUpdate(
      { twitterId },
      { agentEnabled },
      { new: true } // Return the updated document
    );

    if (!creator) {
      res.status(404).json({ error: 'Creator not found' });
      return
    }

    // Return the updated creator
    res.json({
      success: true,
      agentEnabled: creator.agentEnabled,
      message: `AI agent ${agentEnabled ? 'enabled' : 'disabled'} successfully`
    });
    return

  } catch (error) {
    console.error('Error updating agent status:', error);
    res.status(500).json({ error: 'Failed to update agent status' });
  }
});

app.get('/api/tokens', async (req: Request, res: Response) => {
  try {

    interface tokenType {
      title: string;
      symbol: string;
      imageUrl: string;
      priceSol: number;
      priceUsd: number;
      avatarUrl: string;
      tokenMint: string;
      tweetLink: string;
      username: string;
    }
    const tokens = await Token.find();

    let multiplier = 1;

    try {
      multiplier = await getSolanaPrice();
    } catch (error) {
      console.log('Error getting solana price:', error);
    }

    console.log("multiplier", multiplier)
    
    const tokenDataPromises = tokens.map(async (token) => {
      try {
        const poolData = await fetchPoolData(token.mintAddress as string);
        const creator = await Creator.findOne({ twitterId: token.creator });
        
        return {
          title: token.name,
          symbol: token.symbol,
          imageUrl: token.imageUrl,
          // priceSol: poolData.price,
          priceUsd: (poolData.price===0) ? 25*multiplier :poolData.price * multiplier, 
          avatarUrl: creator?.profileImage || '',
          tokenMint: token.mintAddress,
          tweetLink:  `https://x.com/${creator?.username}/status/${token.tweetId}`,
          username: creator?.username
        };
      } catch (error) {
        console.error(`Error fetching data for token ${token.mintAddress}:`, error);
        return null;
      }
    });
    const tokenData = (await Promise.all(tokenDataPromises)).filter(
      (token): token is tokenType => token !== null
    );

    res.json(tokenData);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tokens',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


app.get('/api/tokens/creator/:creatorId', async (req: Request, res: Response) => {
  try {

    interface tokenType {
      title: string;
      symbol: string;
      imageUrl: string;
      priceSol: number;
      priceUsd: number;
      avatarUrl: string;
      tokenMint: string;
    }
    const tokens = await Token.find({creator: req.params.creatorId });

    let multiplier = 1;

    try {
      multiplier = await getSolanaPrice();
    } catch (error) {
      console.log('Error getting solana price:', error);
    }
    
    const tokenDataPromises = tokens.map(async (token) => {
      try {
        const poolData = await fetchPoolData(token.mintAddress as string);
        const creator = await Creator.findOne({ twitterId: token.creator });
        
        return {
          title: token.name,
          symbol: token.symbol,
          imageUrl: token.imageUrl,
          priceSol: poolData.price,
          priceUsd: (poolData.price===0) ? 25*multiplier :poolData.price * multiplier, 
          avatarUrl: creator?.profileImage || '',
          tokenMint: token.mintAddress
        };
      } catch (error) {
        console.error(`Error fetching data for token ${token.mintAddress}:`, error);
        return null;
      }
    });
    const tokenData = (await Promise.all(tokenDataPromises)).filter(
      (token): token is tokenType => token !== null
    );

    res.json(tokenData);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tokens',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/analytics', async (req: Request, res: Response) => {
  try {
    const tokens = await Token.find();
    const wallets = await Walletmodel.find();
    const mentions = await Mentions.find();
    let totalCreators = 0;
    let totalTokensCreated = tokens.length;

    const creators = await Creator.find();
    totalCreators = creators.length;

    const nonCreatorUsers = wallets.length - totalCreators;
    const totalMentions = mentions.length;  

    res.json({
      totalUsers: wallets.length,
      numberOfMentions: totalMentions,
      numberOfCreators: totalCreators,
      nonCreatorUsers: nonCreatorUsers > 0 ? nonCreatorUsers : 0,
      totalTokensCreated: totalTokensCreated
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
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

app.get(`/health`, (req: Request, res: Response) => {
  res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

