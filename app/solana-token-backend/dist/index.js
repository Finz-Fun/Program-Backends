"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const anchor_1 = require("@coral-xyz/anchor");
const ai_agent_1 = require("./idl/ai_agent");
const dotenv = __importStar(require("dotenv"));
const token_1 = require("@coral-xyz/anchor/dist/cjs/utils/token");
const actions_1 = require("@solana/actions");
const cors_1 = __importDefault(require("cors"));
dotenv.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/blinks', (0, actions_1.actionCorsMiddleware)({ headers: actions_1.ACTIONS_CORS_HEADERS, chainId: actions_1.BLOCKCHAIN_IDS.devnet }));
app.use('/api/blinks', (0, actions_1.actionCorsMiddleware)({ headers: actions_1.ACTIONS_CORS_HEADERS, chainId: actions_1.BLOCKCHAIN_IDS.devnet }));
const PORT = process.env.PORT || 3000;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || '';
const wallet = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(WALLET_PRIVATE_KEY)));
const connection = new web3_js_1.Connection(SOLANA_RPC_URL, 'confirmed');
const readOnlyProvider = new anchor_1.AnchorProvider(connection, new anchor_1.Wallet(wallet), {});
const programId = new web3_js_1.PublicKey(process.env.PROGRAM_ID);
const IDL = JSON.parse(ai_agent_1.idljson);
const program = new anchor_1.Program(IDL, programId, readOnlyProvider);
const curveSeed = "CurveConfiguration";
const POOL_SEED_PREFIX = "liquidity_pool";
const SOL_VAULT_PREFIX = "liquidity_sol_vault";
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const [curveConfig] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(curveSeed)], program.programId);
const teamAccount = new web3_js_1.PublicKey("6XF158v9uXWL7dpJnkJFHKpZgzmLXX5HoH4vG5hPsmmP");
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
app.get("/create-token-and-add-liquidity", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_key } = req.body;
        console.log("Creating a new token...");
        const user = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(user_key)));
        const mint = yield (0, spl_token_1.createMint)(connection, user, user.publicKey, null, 9); // 9 decimals
        console.log(mint.toBase58());
        const amount = new anchor_1.BN(1000000000).mul(new anchor_1.BN(Math.pow(10, 9)));
        console.log("Getting user's associated token account...");
        const userTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, user, mint, user.publicKey);
        console.log("Minting tokens to the user...");
        yield (0, spl_token_1.mintTo)(connection, user, mint, userTokenAccount.address, user, BigInt(amount.toString()));
        console.log("Creating the pool PDA...");
        const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()], program.programId);
        const [poolSolVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(SOL_VAULT_PREFIX), mint.toBuffer()], program.programId);
        const poolTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, poolPda, true);
        const tx1 = new web3_js_1.Transaction()
            .add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }), yield program.methods
            .createPool()
            .accounts({
            pool: poolPda,
            tokenMint: mint,
            poolTokenAccount: poolTokenAccount,
            payer: user.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId
        })
            .instruction());
        console.log(user.publicKey.toBase58());
        tx1.feePayer = user.publicKey;
        tx1.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
        console.log(yield connection.simulateTransaction(tx1));
        const sig = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, tx1, [user], { skipPreflight: true });
        console.log("Successfully created pool : ", `https://solscan.io/tx/${sig}?cluster=devnet`);
        // Step 5: Add Liquidity
        console.log("Adding liquidity to the pool...");
        const tx = new web3_js_1.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }), yield program.methods
            .addLiquidity()
            .accounts({
            pool: poolPda,
            poolSolVault: poolSolVault,
            tokenMint: mint,
            poolTokenAccount: poolTokenAccount,
            userTokenAccount: userTokenAccount.address,
            user: user.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .instruction());
        tx.feePayer = user.publicKey;
        tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [user], { skipPreflight: true });
        console.log(`Transaction successful: https://solscan.io/tx/${signature}?cluster=devnet`);
        res.json({
            success: true,
            message: "Token created, minted to user, pool created, and liquidity added successfully.",
            tokenMintAddress: mint.toBase58(),
            transactionSignature: signature,
        });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}));
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
const fetchPoolData = (tokenMint) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const VIRTUAL_SOL = new anchor_1.BN(25000000000);
        const mint = new web3_js_1.PublicKey(tokenMint);
        const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()], program.programId);
        console.log(poolPda);
        const stateData = yield program.account.liquidityPool.fetch(poolPda);
        console.log(stateData);
        const reserveSol = stateData.reserveSol;
        const reserveToken = stateData.reserveToken;
        const total_supply = stateData.totalSupply;
        const totalSolWithVirtual = reserveSol.add(VIRTUAL_SOL);
        console.log(totalSolWithVirtual.toString());
        const mcapInSol = parseInt(totalSolWithVirtual.toString()) / parseInt((new anchor_1.BN(1000000000)).toString());
        return { price: mcapInSol };
    }
    catch (error) {
        console.log(error);
        return { price: 0 };
    }
});
app.get('/blinks/:tokenMint', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenMint } = req.params;
        const baseHref = `/api/blinks/${tokenMint}`;
        const poolData = yield fetchPoolData(tokenMint);
        const tokenData = {
            title: "$MVP token trading",
            description: "Trade $MVP token from finz platform launched by AI agents!",
            icon: "https://trade-chart-sandy.vercel.app/image.png",
            label: "Trade Token",
        };
        const blinksMetadata = {
            type: "action",
            title: tokenData.title,
            icon: tokenData.icon,
            description: tokenData.description + `\n` + `Current mcap: ${poolData.price} SOL`,
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
    }
    catch (error) {
        console.error('Metadata error:', error);
        res.status(500).json({ error: error.message });
    }
}));
app.post('/api/blinks/:tokenMint/buy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenMint } = req.params;
        const { amount } = req.query;
        const { account } = req.body;
        if (!amount) {
            throw new Error('Amount is required');
        }
        const userPubkey = new web3_js_1.PublicKey(account);
        const mint = new web3_js_1.PublicKey(tokenMint);
        const userTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, userPubkey, false);
        const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()], program.programId);
        const [poolSolVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(SOL_VAULT_PREFIX), mint.toBuffer()], program.programId);
        const poolTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, poolPda, true);
        const amountInLamports = Math.floor(parseFloat(amount) * 1e9);
        const tx = new web3_js_1.Transaction();
        const tokenAccountInfo = yield connection.getAccountInfo(userTokenAccount);
        if (!tokenAccountInfo) {
            tx.add((0, spl_token_1.createAssociatedTokenAccountInstruction)(userPubkey, userTokenAccount, userPubkey, mint));
        }
        tx.add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }), yield program.methods
            .buy(new anchor_1.BN(amountInLamports))
            .accounts({
            pool: poolPda,
            tokenMint: mint,
            teamAccount: teamAccount,
            poolSolVault,
            poolTokenAccount: poolTokenAccount,
            userTokenAccount: userTokenAccount,
            dexConfigurationAccount: curveConfig,
            user: userPubkey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            systemProgram: web3_js_1.SystemProgram.programId
        })
            .instruction());
        tx.feePayer = userPubkey;
        tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
        const serializedTx = tx.serialize({ requireAllSignatures: false }).toString('base64');
        res.json({
            transaction: serializedTx,
            message: `Buy ${amount} SOL worth of tokens`
        });
    }
    catch (error) {
        console.error('Buy error:', error);
        res.status(500).json({ error: error.message });
    }
}));
app.post('/api/blinks/:tokenMint/sell', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenMint } = req.params;
        const { amount, percentage } = req.query;
        const { account } = req.body;
        console.log('Sell request:', { tokenMint, account, amount, percentage });
        if (!amount && !percentage) {
            throw new Error('Either amount or percentage is required');
        }
        const userPubkey = new web3_js_1.PublicKey(account);
        const mint = new web3_js_1.PublicKey(tokenMint);
        const userTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, userPubkey, false);
        try {
            const tokenBalance = yield connection.getTokenAccountBalance(userTokenAccount);
            console.log('Token balance:', tokenBalance.value);
            if (!tokenBalance.value.amount || tokenBalance.value.amount === '0') {
                throw new Error('No tokens to sell');
            }
            let tokenAmount;
            let sellMessage;
            if (percentage) {
                const sellPercentage = parseInt(percentage) / 100;
                const rawAmount = new anchor_1.BN(tokenBalance.value.amount);
                tokenAmount = rawAmount.muln(sellPercentage);
                sellMessage = `Sell ${tokenBalance.value.uiAmount * sellPercentage} tokens (${percentage}% of your balance)`;
            }
            else {
                const rawAmount = parseFloat(amount) * 1e9;
                tokenAmount = new anchor_1.BN(Math.floor(rawAmount));
                if (tokenAmount.gt(new anchor_1.BN(tokenBalance.value.amount))) {
                    throw new Error('Insufficient token balance');
                }
                sellMessage = `Sell ${amount} tokens`;
            }
            console.log('Selling:', {
                totalBalance: tokenBalance.value.amount,
                amountToSell: tokenAmount.toString()
            });
            const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint.toBuffer()], program.programId);
            const [poolSolVault, bump] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(SOL_VAULT_PREFIX), mint.toBuffer()], program.programId);
            const poolTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, poolPda, true);
            const tx = new web3_js_1.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }), yield program.methods
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
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                systemProgram: web3_js_1.SystemProgram.programId
            })
                .instruction());
            tx.feePayer = userPubkey;
            tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
            const serializedTx = tx.serialize({ requireAllSignatures: false }).toString('base64');
            res.json({
                transaction: serializedTx,
                message: sellMessage
            });
        }
        catch (error) {
            if (error.message.includes('Account does not exist')) {
                throw new Error('No token account found. You need tokens to sell.');
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Sell error:', error);
        res.status(500).json({ error: error.message });
    }
}));
app.get('/actions.json', (req, res) => {
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
