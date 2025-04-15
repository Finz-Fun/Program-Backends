use crate::{errors::CustomError, state::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

pub fn create_pool_with_liquidity(ctx: Context<CreateLiquidityPool>, creator_fee_wallet: Pubkey) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    pool.set_inner(LiquidityPool::new(
        ctx.accounts.admin.key(),
        ctx.accounts.token_mint.key(),
        ctx.bumps.pool,
        creator_fee_wallet
    ));
    let token_accounts = (
        &mut *ctx.accounts.token_mint,
        &mut *ctx.accounts.pool_token_account,
        &mut *ctx.accounts.platform_token_account,
    );

    pool.add_liquidity(
        token_accounts,
        &mut ctx.accounts.pool_sol_vault,
        &ctx.accounts.admin,
        &ctx.accounts.payer,
        &ctx.accounts.token_program,
        &ctx.accounts.system_program,
    )?;
    Ok(())
}

#[derive(Accounts)]
#[instruction(creator_fee_wallet: Pubkey)]
pub struct CreateLiquidityPool<'info> {
    #[account(
        mut,
        seeds = [CurveConfiguration::SEED.as_bytes()],
        bump,
    )]
    pub dex_configuration_account: Box<Account<'info, CurveConfiguration>>,
    #[account(
        init,
        space = LiquidityPool::ACCOUNT_SIZE,
        payer = payer,
        seeds = [LiquidityPool::POOL_SEED_PREFIX.as_bytes(), token_mint.key().as_ref()],
        bump
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,

    #[account(mut)]
    pub token_mint: Box<Account<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = pool
    )]
    pub pool_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = admin,
    )]
    pub platform_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: Safe. This is the SOL vault for the pool, validated through seeds constraint
    #[account(
        mut,
        seeds = [LiquidityPool::SOL_VAULT_PREFIX.as_bytes(), token_mint.key().as_ref()],
        bump
    )]
    pub pool_sol_vault: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK:  will be checked by the constraints
    #[account(
        mut,
        constraint = admin.key() == dex_configuration_account.authority @ CustomError::UnauthorizedPlatformAuthority
    )]
    pub admin: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}