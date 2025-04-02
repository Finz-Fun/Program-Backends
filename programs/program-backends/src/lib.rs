use anchor_lang::prelude::*;

pub mod errors;
pub mod utils;
pub mod instructions;
pub mod state;
pub mod consts;

use crate::instructions::*;

declare_id!("DHr5zADHP6mkJRZiZKoMnadQyqWKfq6kxXG7iZAcipNa");

#[program]
pub mod ai_agent {
    use super::*;
    pub fn initialize(ctx: Context<InitializeCurveConfiguration>, fee: f64) -> Result<()> {
        instructions::initialize(ctx, fee)
    }

    pub fn create_pool(ctx: Context<CreateLiquidityPool>) -> Result<()> {
        instructions::create_pool(ctx)
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
    ) -> Result<()> {
        instructions::add_liquidity(ctx)
    }

    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, bump: u8) -> Result<()> {
        instructions::remove_liquidity(ctx, bump)
    }

    pub fn buy(ctx: Context<Buy>, amount: u64) -> Result<()> {
        instructions::buy(ctx, amount)
    }

    pub fn sell(ctx: Context<Sell>, amount: u64, bump: u8) -> Result<()> {
        instructions::sell(ctx, amount, bump)
    }

    pub fn migrate_to_raydium(
        ctx: Context<MigrateToRaydium>,
    ) -> Result<()> {
        instructions::migrate_to_raydium(ctx)
    }

    pub fn initialize_raydium_pool(
        ctx: Context<CreateCpmmPool>,
        init_amount_0: u64,
        init_amount_1: u64,
    ) -> Result<()> {
        instructions::raydium_init::CreateCpmmPool::create_cpmm_pool(
            ctx,
            init_amount_0,
            init_amount_1,
        )
    }
    
    pub fn lock_cpmm_lp(ctx: Context<LockCpmmLiquidity>) -> Result<()> {
        instructions::lock_cpmm_lp::LockCpmmLiquidity::lock_cpmm_cpi(ctx)
    }

    pub fn harvest_locked_fee(ctx: Context<HarvestLockedLiquidity>) -> Result<()> {
        instructions::harvest_locked_fee::HarvestLockedLiquidity::harvest_cp_fees_cpi(ctx)
    }   

    pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
        instructions::swap::Swap::swap(ctx, amount_in, minimum_amount_out)
    }
}


