use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};
use raydium_cpmm_cpi::{
    cpi,
    program::RaydiumCpmm,
    states::{AmmConfig, OBSERVATION_SEED, POOL_LP_MINT_SEED, POOL_SEED, POOL_VAULT_SEED},
};

use crate::consts::WSOL_ID;

/// This context allows us to create a raydium pool
#[derive(Accounts)]
pub struct CreateCpmmPool<'info> {
    pub cp_swap_program: Program<'info, RaydiumCpmm>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        mint::decimals = 9,
        mint::authority = creator,
        mint::token_program = token_program,
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(
        mut,
        address = WSOL_ID,
        constraint = base_mint.key() < token_mint.key(),
        mint::token_program = token_program,
    )]
    pub base_mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(
        mut,
        associated_token::mint = base_mint,
        associated_token::authority  = creator,
    )]
    pub creator_base_ata: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        init,
        payer = creator,
        associated_token::mint = token_mint,
        associated_token::authority = creator
    )]
    pub creator_token_ata: Box<InterfaceAccount<'info, TokenAccount>>,
    pub amm_config: Box<Account<'info, AmmConfig>>,
    /// CHECK: pool vault and lp mint authority
    #[account(
        seeds = [
            raydium_cpmm_cpi::AUTH_SEED.as_bytes(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub authority: UncheckedAccount<'info>,
    /// CHECK: Initialize an account to store the pool state, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_SEED.as_bytes(),
            amm_config.key().as_ref(),
            base_mint.key().as_ref(),
            token_mint.key().as_ref(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub pool_state: UncheckedAccount<'info>,
    /// CHECK: pool lp mint, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_LP_MINT_SEED.as_bytes(),
            pool_state.key().as_ref(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub lp_mint: UncheckedAccount<'info>,
    /// CHECK: creator lp ATA token account, init by cp-swap
    #[account(mut)]
    pub creator_lp_token: UncheckedAccount<'info>,
    /// CHECK: Token_0 vault for the pool, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_VAULT_SEED.as_bytes(),
            pool_state.key().as_ref(),
            base_mint.key().as_ref()
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub token_0_vault: UncheckedAccount<'info>,
    /// CHECK: Token_1 vault for the pool, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_VAULT_SEED.as_bytes(),
            pool_state.key().as_ref(),
            token_mint.key().as_ref()
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub token_1_vault: UncheckedAccount<'info>,
    #[account(
        mut,
        address= raydium_cpmm_cpi::create_pool_fee_reveiver::id(),
    )]
    pub create_pool_fee: Box<InterfaceAccount<'info, TokenAccount>>,
    /// CHECK: an account to store oracle observations, init by cp-swap
    #[account(
        mut,
        seeds = [
            OBSERVATION_SEED.as_bytes(),
            pool_state.key().as_ref(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub observation_state: UncheckedAccount<'info>,
    #[account(
        address = anchor_spl::token::ID,
    )]
    pub token_program: Interface<'info, TokenInterface>,
    
    #[account(
        address = anchor_spl::token::ID,
    )]
    pub token_1_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateCpmmPool<'info> {
    pub fn create_cpmm_pool(ctx: Context<CreateCpmmPool>,
        init_amount_0: u64,
        init_amount_1: u64) -> Result<()> {
        let open_time = Clock::get()?.unix_timestamp as u64;

        let cpi_accounts = cpi::accounts::Initialize {
            creator: ctx.accounts.creator.to_account_info(),
            amm_config: ctx.accounts.amm_config.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
            pool_state: ctx.accounts.pool_state.to_account_info(),
            token_0_mint: ctx.accounts.base_mint.to_account_info(),
            token_1_mint: ctx.accounts.token_mint.to_account_info(),
            lp_mint: ctx.accounts.lp_mint.to_account_info(),
            creator_token_0: ctx.accounts.creator_base_ata.to_account_info(),
            creator_token_1: ctx.accounts.creator_token_ata.to_account_info(),
            creator_lp_token: ctx.accounts.creator_lp_token.to_account_info(),
            token_0_vault: ctx.accounts.token_0_vault.to_account_info(),
            token_1_vault: ctx.accounts.token_1_vault.to_account_info(),
            create_pool_fee: ctx.accounts.create_pool_fee.to_account_info(),
            observation_state: ctx.accounts.observation_state.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            token_0_program: ctx.accounts.token_program.to_account_info(),
            token_1_program: ctx.accounts.token_1_program.to_account_info(),
            associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };

        let cpi_context = CpiContext::new(ctx.accounts.cp_swap_program.to_account_info(), cpi_accounts);
        cpi::initialize(cpi_context, init_amount_0, init_amount_1, open_time)?;

        Ok(())
    }
}