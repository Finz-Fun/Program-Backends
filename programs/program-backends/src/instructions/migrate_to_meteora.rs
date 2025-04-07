use anchor_lang::{prelude::*, solana_program};
use anchor_spl::
    token_interface::Mint as InterfaceMint
;
use anchor_lang::solana_program::program::invoke_signed;

use crate::{ errors::CustomError, state::LiquidityPool};

/// This instruction migrates liquidity from our custom pool to a Raydium pool.
/// It:
/// 1. Transfers SOL from the pool vault to the authority
/// 2. Wraps SOL into WSOL in the authority's ATA
/// 3. Transfers tokens from the platform wallet to the authority's token ATA
/// 4. Marks the pool as migrated
///
/// After this instruction succeeds, the client should call initialize_raydium_pool
/// with the transferred funds.
pub fn migrate_to_meteora(
    ctx: Context<MigrateToMeteora>,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let authority = &ctx.accounts.authority;
    let token_mint_account = &ctx.accounts.token_mint;
    let pool_sol_vault = &ctx.accounts.pool_sol_vault;
    let system_program = &ctx.accounts.system_program;

    // Verify the pool isn't already migrated
    if pool.migrated_to_meteora {
        return err!(CustomError::AlreadyMigrated);
    }

    // Check for sufficient liquidity
    let sol_amount_lamports = **pool_sol_vault.lamports.borrow();
    if sol_amount_lamports == 0 {
        return err!(CustomError::InsufficientLiquidity);
    }


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

    pool.migrated_to_meteora = true;

    msg!("Migration preparation complete. Ready for Meteora pool initialization.");
    Ok(())
}

#[derive(Accounts)]
pub struct MigrateToMeteora<'info> {
    #[account(
        mut,
        seeds = [LiquidityPool::POOL_SEED_PREFIX.as_bytes(), token_mint.key().as_ref()],
        bump,
        constraint = !pool.migrated_to_meteora @ CustomError::AlreadyMigrated
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,

    #[account(mut)]
    pub token_mint: Box<InterfaceAccount<'info, InterfaceMint>>,

    /// CHECK:   Source SOL account, verified by seeds constraint
    #[account(
        mut,
        seeds = [LiquidityPool::SOL_VAULT_PREFIX.as_bytes(), token_mint.key().as_ref()],
        bump
    )]
    pub pool_sol_vault: AccountInfo<'info>,

    /// The platform wallet that will pay for the migration and hold migrated funds
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Required system accounts
    pub system_program: Program<'info, System>,
}
