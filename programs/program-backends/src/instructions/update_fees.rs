use crate::{errors::CustomError, state::*};
use anchor_lang::prelude::*;

pub fn update_fees(ctx: Context<UpdateFees>, new_fees: f64) -> Result<()> {
    if new_fees < 0_f64 || new_fees > 100_f64 {
        return err!(CustomError::InvalidFee);
    }
    
    ctx.accounts.dex_configuration_account.fees = new_fees;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateFees<'info> {
    #[account(
        mut,
        seeds = [CurveConfiguration::SEED.as_bytes()],
        bump,
        constraint = dex_configuration_account.authority == authority.key() @ CustomError::Unauthorized
    )]
    pub dex_configuration_account: Account<'info, CurveConfiguration>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}