use anchor_lang::prelude::*;

pub mod errors;
pub mod utils;
pub mod instructions;
pub mod state;
pub mod consts;

use crate::instructions::*;

declare_id!("8sZuVSqHEvhRTn1syQwgbwfwqr8PNjdty4a6o2BzL1ox");

#[program]
pub mod ai_agent {
    use super::*;
    pub fn initialize(ctx: Context<InitializeCurveConfiguration>, fee: f64) -> Result<()> {
        instructions::initialize(ctx, fee)
    }

    pub fn create_pool_with_liquidity(ctx: Context<CreateLiquidityPool>, creator_fee_wallet: Pubkey) -> Result<()> {
        instructions::create_pool_with_liquidity(ctx, creator_fee_wallet)
    }


    pub fn buy(ctx: Context<Buy>, amount: u64, min_tokens_out: u64) -> Result<()> {
        instructions::buy(ctx, amount, min_tokens_out)
    }

    pub fn sell(ctx: Context<Sell>, amount: u64, bump: u8, min_sol_out: u64) -> Result<()> {
        instructions::sell(ctx, amount, bump, min_sol_out)
    }

    pub fn migrate_to_meteora(
        ctx: Context<MigrateToMeteora>,
    ) -> Result<()> {
        instructions::migrate_to_meteora(ctx)
    }
}


