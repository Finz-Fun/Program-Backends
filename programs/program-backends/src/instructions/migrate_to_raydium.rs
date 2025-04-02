use anchor_lang::{prelude::*, solana_program};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::sync_native as spl_sync_native,
    token_interface::{self as spl_token_interface, Mint as InterfaceMint, TokenAccount as InterfaceTokenAccount, TokenInterface},
};
use anchor_lang::solana_program::program::{invoke, invoke_signed};

use crate::{consts::{PLATFORM_TOKEN_AMOUNT, WSOL_ID}, errors::CustomError, state::LiquidityPool};

/// This instruction migrates liquidity from our custom pool to a Raydium pool.
/// It:
/// 1. Transfers SOL from the pool vault to the authority
/// 2. Wraps SOL into WSOL in the authority's ATA
/// 3. Transfers tokens from the platform wallet to the authority's token ATA
/// 4. Marks the pool as migrated
///
/// After this instruction succeeds, the client should call initialize_raydium_pool
/// with the transferred funds.
pub fn migrate_to_raydium(
    ctx: Context<MigrateToRaydium>,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let authority = &ctx.accounts.authority;
    let token_mint_account = &ctx.accounts.token_mint;
    let pool_sol_vault = &ctx.accounts.pool_sol_vault;
    let system_program = &ctx.accounts.system_program;
    let token_program = &ctx.accounts.token_program;

    // Verify the pool isn't already migrated
    if pool.migrated_to_raydium {
        return err!(CustomError::AlreadyMigrated);
    }

    // Check for sufficient liquidity
    let sol_amount_lamports = **pool_sol_vault.lamports.borrow();
    if sol_amount_lamports == 0 {
        return err!(CustomError::InsufficientLiquidity);
    }

    // Calculate token amount (200M tokens adjusted for decimals)
    let token_amount = PLATFORM_TOKEN_AMOUNT
        .checked_mul(10u64.pow(token_mint_account.decimals as u32))
        .ok_or(CustomError::CalculationError)?;

    msg!("Migrating pool with {} lamports and {} tokens", sol_amount_lamports, token_amount);

    // --- STEP 1: Transfer SOL from pool vault to authority ---
    let token_mint_key = token_mint_account.key();
    let (_, pool_sol_vault_bump) = Pubkey::find_program_address(
        &[
            LiquidityPool::SOL_VAULT_PREFIX.as_bytes(),
            token_mint_key.as_ref(),
        ],
        ctx.program_id,
    );
    let seeds = &[
        LiquidityPool::SOL_VAULT_PREFIX.as_bytes(),
        token_mint_key.as_ref(),
        &[pool_sol_vault_bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let transfer_ix_vault_to_auth = solana_program::system_instruction::transfer(
        &pool_sol_vault.key(),
        &authority.key(),
        sol_amount_lamports,
    );

    invoke_signed(
        &transfer_ix_vault_to_auth,
        &[
            pool_sol_vault.to_account_info(),
            authority.to_account_info(),
            system_program.to_account_info(),
        ],
        signer_seeds,
    )?;
    
    msg!("Transferred {} lamports from pool vault to authority", sol_amount_lamports);

    // --- STEP 2: Transfer SOL from authority to WSOL ATA and sync ---
    msg!("Transferring SOL to WSOL ATA and syncing");
    let transfer_ix_auth_to_wsol = solana_program::system_instruction::transfer(
        &authority.key(),
        &ctx.accounts.creator_base_ata.key(),
        sol_amount_lamports,
    );
    invoke(
        &transfer_ix_auth_to_wsol,
        &[
            authority.to_account_info(),
            ctx.accounts.creator_base_ata.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Sync WSOL account
    let cpi_accounts_sync_native = anchor_spl::token::SyncNative {
        account: ctx.accounts.creator_base_ata.to_account_info(),
    };
    let cpi_program_sync_native = token_program.to_account_info();
    let cpi_ctx_sync_native = CpiContext::new(cpi_program_sync_native, cpi_accounts_sync_native);
    spl_sync_native(cpi_ctx_sync_native)?;
    
    msg!("SOL wrapped into WSOL successfully");

    // --- STEP 3: Burn tokens from the authority's token account ---
    msg!("Burning {} tokens from the authority's token account", token_amount);
    spl_token_interface::burn(
        CpiContext::new(
            token_program.to_account_info(),
            spl_token_interface::Burn {
                mint: token_mint_account.to_account_info(),
                from: ctx.accounts.authority_token_account.to_account_info(),
                authority: authority.to_account_info(),
            },
        ),
        token_amount,
    )?;
    
    msg!("Tokens burned successfully");

    // --- STEP 4: Mark the pool as migrated ---
    pool.migrated_to_raydium = true;
    msg!("Pool marked as migrated");

    msg!("Migration preparation complete. Ready for Raydium pool initialization.");
    Ok(())
}

#[derive(Accounts)]
pub struct MigrateToRaydium<'info> {
    #[account(
        mut,
        seeds = [LiquidityPool::POOL_SEED_PREFIX.as_bytes(), token_mint.key().as_ref()],
        bump,
        constraint = !pool.migrated_to_raydium @ CustomError::AlreadyMigrated
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,

    #[account(mut)]
    pub token_mint: Box<InterfaceAccount<'info, InterfaceMint>>,

    /// CHECK: Source SOL account, verified by seeds constraint
    #[account(
        mut,
        seeds = [LiquidityPool::SOL_VAULT_PREFIX.as_bytes(), token_mint.key().as_ref()],
        bump
    )]
    pub pool_sol_vault: AccountInfo<'info>,

    /// The platform wallet that will pay for the migration and hold migrated funds
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The authority's token account that will provide the platform tokens
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = authority,
        token::token_program = token_program,
    )]
    pub authority_token_account: Box<InterfaceAccount<'info, InterfaceTokenAccount>>,

    /// The WSOL ATA for the authority, will receive wrapped SOL
    #[account(
        mut,
        associated_token::mint = base_mint,
        associated_token::authority = authority,
        token::token_program = token_program,
    )]
    pub creator_base_ata: Box<InterfaceAccount<'info, InterfaceTokenAccount>>,

    /// The WSOL (Wrapped SOL) mint account
    #[account(
        address = WSOL_ID,
        mint::token_program = token_program,
    )]
    pub base_mint: Box<InterfaceAccount<'info, InterfaceMint>>,

    /// Required system accounts
    pub system_program: Program<'info, System>,
    #[account(
        address = anchor_spl::token::ID,
    )]
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
