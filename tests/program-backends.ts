import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AiAgent } from "../target/types/ai_agent";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, mintTo, getAssociatedTokenAddress } from "@solana/spl-token";
import { assert } from "chai";
import { BN } from "bn.js";

describe("program-backends", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AiAgent as Program<AiAgent>;
  const wallet = provider.wallet as anchor.Wallet;
  
  // Test keypairs
  const user = Keypair.generate();
  const creator = wallet.payer;
  const creatorFeeWallet = Keypair.generate();
  
  // Constants
  const INITIAL_MINT_AMOUNT = new BN("800000000000000000");
  const FEES = 2; // 2% fees
  
  // PDA addresses
  let configPDA: PublicKey;
  let poolPDA: PublicKey;
  let solVaultPDA: PublicKey;
  let tokenMint: PublicKey;
  let poolTokenAccount: PublicKey;
  let userTokenAccount: PublicKey;
  let creatorTokenAccount: PublicKey;
  
  // Bumps
  let configBump: number;
  let poolBump: number;
  let solVaultBump: number;

  before(async () => {
    // Airdrop some SOL to the user
    // const airdropSig = await provider.connection.requestAirdrop(
    //   user.publicKey,
    //   10 * LAMPORTS_PER_SOL
    // );
    // await provider.connection.confirmTransaction(airdropSig);
    
    // Find PDA addresses
    const [configPDAAddress, configBumpVal] = await PublicKey.findProgramAddress(
      [Buffer.from("CurveConfiguration")],
      program.programId
    );
    configPDA = configPDAAddress;
    configBump = configBumpVal;
    
    // Create token mint
    tokenMint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      9 // 9 decimals like SOL
    );
    
    // Find pool PDA and sol vault PDA
    const [poolPDAAddress, poolBumpVal] = await PublicKey.findProgramAddress(
      [Buffer.from("liquidity_pool"), tokenMint.toBuffer()],
      program.programId
    );
    poolPDA = poolPDAAddress;
    poolBump = poolBumpVal;
    
    const [solVaultPDAAddress, solVaultBumpVal] = await PublicKey.findProgramAddress(
      [Buffer.from("liquidity_sol_vault"), tokenMint.toBuffer()],
      program.programId
    );
    solVaultPDA = solVaultPDAAddress;
    solVaultBump = solVaultBumpVal;
    
    // Create associated token accounts
    poolTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      poolPDA,
      true // allowOwnerOffCurve
    );
    
    userTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      creator,
      tokenMint,
      user.publicKey
    );
    
    creatorTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      creator,
      tokenMint,
      creator.publicKey
    );
    
    // Mint initial tokens to creator
    await mintTo(
      provider.connection,
      creator,
      tokenMint,
      creatorTokenAccount,
      creator.publicKey,
      BigInt(INITIAL_MINT_AMOUNT.toString())
    );
  });

  it("Initializes curve configuration", async () => {
    const tx = await program.methods
      .initialize(FEES)
      .accounts({
        admin: creator.publicKey
      })
      .rpc();
    
    console.log("Configuration initialized: ", tx);
    
    // Verify the config was created with correct values
    const config = await program.account.curveConfiguration.fetch(configPDA);
    assert.equal(config.authority.toString(), creator.publicKey.toString());
    assert.equal(config.fees, FEES);
  });

  it("Creates a liquidity pool", async () => {
    const tx = await program.methods
      .createPool(creatorFeeWallet.publicKey)
      .accounts({
        admin: creator.publicKey,
        tokenMint: tokenMint,
      })
      .rpc();
    
    console.log("Pool created: ", tx);
    
    // Verify the pool was created with correct values
    const pool = await program.account.liquidityPool.fetch(poolPDA);
    assert.equal(pool.creator.toString(), creator.publicKey.toString());
    assert.equal(pool.token.toString(), tokenMint.toString());
    assert.equal(pool.totalSupply.toString(), "0");
    assert.equal(pool.reserveToken.toString(), "0");
    assert.equal(pool.reserveSol.toString(), "0");
    assert.equal(pool.bump, poolBump);
    assert.equal(pool.migratedToMeteora, false);
    assert.equal(pool.creatorFeeWallet.toString(), creatorFeeWallet.publicKey.toString());
  });

  it("Adds liquidity to the pool", async () => {
    const tx = await program.methods
      .addLiquidity()
      .accounts({
        tokenMint: tokenMint,
        platformAuthority: creator.publicKey,
        user: creator.publicKey
      })
      .rpc();
    
    console.log("Liquidity added: ", tx);
    
    // Verify the pool state after adding liquidity
    const pool = await program.account.liquidityPool.fetch(poolPDA);
    assert.equal(pool.totalSupply.toString(), INITIAL_MINT_AMOUNT.toString());
    assert.equal(pool.reserveToken.toString(), INITIAL_MINT_AMOUNT.toString());
    assert.isAbove(Number(pool.reserveSol), 0);
  });

  it("Executes a buy order", async () => {
    // Amount in lamports
    const buyAmount = new BN(1 * LAMPORTS_PER_SOL);
    
    // Calculate expected tokens out (simplified estimation)
    // This would be calculated properly in a frontend
    const expectedTokensOut = new BN(LAMPORTS_PER_SOL / 10); // Rough estimate
    const minTokensOut = expectedTokensOut.muln(95).divn(100); // 5% slippage
    
    // Execute buy
    const tx = await program.methods
      .buy(buyAmount, minTokensOut)
      .accounts({
        tokenMint: tokenMint,
        user: user.publicKey
      })
      .signers([user])
      .rpc();
    
    console.log("Buy executed: ", tx);
    
    // Verify user received tokens
    const userTokenBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);
    assert.isAbove(Number(userTokenBalance.value.amount), 0);
  });

  it("Executes a sell order", async () => {
    // Get user's token balance
    const userTokenBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);
    const sellAmount = new BN(userTokenBalance.value.amount).divn(2); // Sell half of tokens
    
    // Calculate expected SOL out (simplified estimation)
    // This would be calculated properly in a frontend
    const expectedSolOut = new BN(LAMPORTS_PER_SOL / 20); // Rough estimate
    const minSolOut = expectedSolOut.muln(95).divn(100); // 5% slippage
    
    // Get user's SOL balance before
    const userSolBefore = await provider.connection.getBalance(user.publicKey);
    
    // Execute sell
    const tx = await program.methods
      .sell(sellAmount, solVaultBump, minSolOut)
      .accounts({
        tokenMint: tokenMint,
        user: user.publicKey
      })
      .signers([user])
      .rpc();
    
    console.log("Sell executed: ", tx);
    
    // Verify user received SOL
    const userSolAfter = await provider.connection.getBalance(user.publicKey);
    assert.isAbove(userSolAfter, userSolBefore);
  });
});