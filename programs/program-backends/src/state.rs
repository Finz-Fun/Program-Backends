use crate::consts::INITIAL_LAMPORTS_FOR_POOL;
use crate::consts::PROPORTION_BASE;
use crate::consts::PROPORTION_EXP;
use crate::consts::EXPONENT;
use crate::consts::MIN_PRICE;
use crate::errors::CustomError;
use anchor_lang::solana_program;
use anchor_lang::{
    prelude::*,
    solana_program::{
        program::invoke,
        system_instruction::transfer,
    },
};
use anchor_lang::system_program;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

#[account]
pub struct CurveConfiguration {
    pub authority: Pubkey,
    pub fees: f64,
}

impl CurveConfiguration {
    pub const SEED: &'static str = "CurveConfiguration";

    // Discriminator (8) + f64 (8)
    pub const ACCOUNT_SIZE: usize = 8 + 32 + 8;

     pub fn new(authority: Pubkey, fees: f64) -> Self {
        Self { authority, fees }
    }
}

#[account]
pub struct LiquidityProvider {
    pub shares: u64, 
}

impl LiquidityProvider {
    pub const SEED_PREFIX: &'static str = "LiqudityProvider"; // Prefix for generating PDAs

    // Discriminator (8) + f64 (8)
    pub const ACCOUNT_SIZE: usize = 8 + 8;
}

#[account]
pub struct LiquidityPool {
    pub creator: Pubkey,
    pub token: Pubkey,
    pub total_supply: u64,
    pub reserve_token: u64,
    pub reserve_sol: u64,
    pub bump: u8,
    pub migrated_to_meteora: bool, // Tracks migration status
    pub creator_fee_wallet: Pubkey
}

impl LiquidityPool {
    pub const POOL_SEED_PREFIX: &'static str = "liquidity_pool";
    pub const SOL_VAULT_PREFIX: &'static str = "liquidity_sol_vault";

    // Discriminator (8) + creator (32) + token (32) + totalsupply (8)
    // + reserve_token (8) + reserve_sol (8) + Bump (1) + migrated_to_raydium (1)
    pub const ACCOUNT_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1 + 32;

    // Constructor to initialize a LiquidityPool
    pub fn new(creator: Pubkey, token: Pubkey, bump: u8, creator_fee_wallet: Pubkey) -> Self {
        Self {
            creator,
            token,
            total_supply: 0_u64,
            reserve_token: 0_u64,
            reserve_sol: 0_u64,
            bump,
            migrated_to_meteora: false,
            creator_fee_wallet
        }
    }
}

pub trait LiquidityPoolAccount<'info> {
    // Updates the token reserves in the liquidity pool
    fn update_reserves(&mut self, reserve_token: u64, reserve_sol: u64) -> Result<()>;

    // Allows adding liquidity by depositing an amount of two tokens and getting back pool shares
    fn add_liquidity(
        &mut self,
        token_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        pool_sol_vault: &mut AccountInfo<'info>,
        platform_authority: &Signer<'info>,
        user: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;

    fn buy(
        &mut self,
        token_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        pool_sol_vault: &mut AccountInfo<'info>,
        platform_fee_wallet1: UncheckedAccount<'info>,
        creator_fee_wallet: UncheckedAccount<'info>,
        amount: u64,
        min_tokens_out: u64,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
        fees: f64
    ) -> Result<()>;

    fn sell(
        &mut self,
        token_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        pool_sol_vault: &mut AccountInfo<'info>,
        platform_fee_wallet1: UncheckedAccount<'info>,
        creator_fee_wallet: UncheckedAccount<'info>,
        amount: u64,
        min_sol_out: u64,
        bump: u8,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
        fees: f64
    ) -> Result<()>;

    fn transfer_token_from_pool(
        &self,
        from: &Account<'info, TokenAccount>,
        to: &Account<'info, TokenAccount>,
        amount: u64,
        token_program: &Program<'info, Token>,
    ) -> Result<()>;

    fn transfer_token_to_pool(
        &self,
        from: &Account<'info, TokenAccount>,
        to: &Account<'info, TokenAccount>,
        amount: u64,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()>;

    fn transfer_sol_to_pool(
        &self,
        from: &Signer<'info>,
        to: &mut AccountInfo<'info>,
        amount: u64,
        system_program: &Program<'info, System>,
    ) -> Result<()>;

    fn transfer_sol_from_pool(
        &self,
        from: &mut AccountInfo<'info>,
        to: &Signer<'info>,
        amount: u64,
        bump: u8,
        system_program: &Program<'info, System>,
    ) -> Result<()>;
}

impl<'info> LiquidityPoolAccount<'info> for Account<'info, LiquidityPool> {
    fn update_reserves(&mut self, reserve_token: u64, reserve_sol: u64) -> Result<()> {
        self.reserve_token = reserve_token;
        self.reserve_sol = reserve_sol;
        Ok(())
    }

    fn add_liquidity(
        &mut self,
        token_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        pool_sol_vault: &mut AccountInfo<'info>,
        platform_authority: &Signer<'info>,
        user: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        if self.migrated_to_meteora {
            return err!(CustomError::AlreadyMigrated);
        }
        self.transfer_token_to_pool(
            token_accounts.2,
            token_accounts.1,
            800_000_000_000_000_000 as u64,
            platform_authority,
            token_program,
        )?;

        self.transfer_sol_to_pool(
            user,
            pool_sol_vault,
            INITIAL_LAMPORTS_FOR_POOL,
            system_program,
        )?;
        self.total_supply = 800_000_000_000_000_000;
        self.update_reserves(800_000_000_000_000_000, INITIAL_LAMPORTS_FOR_POOL)?;

        Ok(())
    }

    fn buy(
        &mut self,
        token_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        pool_sol_vault: &mut AccountInfo<'info>,
        platform_fee_wallet1: UncheckedAccount<'info>,
        creator_fee_wallet: UncheckedAccount<'info>,
        amount: u64,
        min_tokens_out: u64,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
        fees: f64
    ) -> Result<()> {
        if self.migrated_to_meteora {
            return err!(CustomError::AlreadyMigrated);
        }
        if amount == 0 {
            return err!(CustomError::InvalidAmount);
        }

        // Calculate fees
        let fee_amount = (amount as f64) * (fees / 100.0);
        let adjusted_amount = amount as f64 - fee_amount;

        let platform_fee1 = fee_amount * 50.0 / 100.0;
        let creator_fee = fee_amount - platform_fee1;

        // Get the current state
        let current_tokens_sold = (self.total_supply as f64 - self.reserve_token as f64) / 1_000_000_000.0;
        let current_price = (EXPONENT * current_tokens_sold.powf(EXPONENT - 1.0)) / (PROPORTION_BASE * 10.0f64.powi(PROPORTION_EXP)) + MIN_PRICE;
        

        // Calculate how many tokens to give based on area under the curve
        // We need to solve for new_tokens_sold where:
        // integral(current_tokens_sold to new_tokens_sold) = adjusted_amount
        // For the bonding curve: price = (EXPONENT * x^(EXPONENT-1)) / (PROPORTION_BASE * 10^PROPORTION_EXP) + MIN_PRICE
        // The integral is: (x^EXPONENT) / (PROPORTION_BASE * 10^PROPORTION_EXP) + MIN_PRICE*x
        
        // Initialize approximation variables
        let mut tokens_to_buy = adjusted_amount / current_price; // Initial estimate
        let mut new_tokens_sold = current_tokens_sold + tokens_to_buy / 1_000_000_000.0;
        
        // Define the integral function
        let integral = |x: f64| -> f64 {
            (x.powf(EXPONENT)) / (PROPORTION_BASE * 10.0f64.powi(PROPORTION_EXP)) + MIN_PRICE * x
        };
        
        // Numerical solution - 3 iterations for sufficient accuracy
        for _ in 0..3 {
            let area = (integral(new_tokens_sold) - integral(current_tokens_sold)) * 1_000_000_000.0;
            
            // If area is close enough to adjusted_amount, break
            if (area - adjusted_amount).abs() < 0.001 {
                break;
            }
            
            // Adjust our estimate
            let scale_factor = adjusted_amount / area;
            tokens_to_buy *= scale_factor;
            new_tokens_sold = current_tokens_sold + tokens_to_buy / 1_000_000_000.0;
        }
        

        let amount_out_u64 = tokens_to_buy.round() as u64;

        if amount_out_u64 < min_tokens_out {
            return err!(CustomError::SlippageExceeded);
        }


        if platform_fee1 > 0.0 {
            let ix = transfer(authority.key, platform_fee_wallet1.key, platform_fee1.round() as u64);
            invoke(
                &ix,
                &[
                    authority.to_account_info(),
                    platform_fee_wallet1.to_account_info(),
                    system_program.to_account_info(),
                ],
            )?;
        }

        if creator_fee > 0.0 {
            let ix = transfer(authority.key, creator_fee_wallet.key, creator_fee.round() as u64);
            invoke(
                &ix,
                &[
                    authority.to_account_info(),
                    creator_fee_wallet.to_account_info(),
                    system_program.to_account_info(),
                ],
            )?;
        }

        if amount_out_u64 > self.reserve_token {
            return err!(CustomError::NotEnoughTokenInVault);
        }

        self.reserve_sol += adjusted_amount.round() as u64;
        self.reserve_token -= amount_out_u64;

        // Transfer assets
        self.transfer_sol_to_pool(authority, pool_sol_vault, adjusted_amount.round() as u64, system_program)?;
        self.transfer_token_from_pool(token_accounts.1, token_accounts.2, amount_out_u64, token_program)?;
        
 
        let new_price = (EXPONENT * new_tokens_sold.powf(EXPONENT - 1.0)) / (PROPORTION_BASE * 10.0f64.powi(PROPORTION_EXP)) + MIN_PRICE;
        let mcap = new_price * 1_000_000_000.0;

        msg!("TRANSACTION_INFO{{\"token_mint_address\":\"{}\",\"type\":\"BUY\",\"sol_amount\":{},\"token_amount\":{},\"wallet\":\"{}\",\"price\":{:.9}}}",
            token_accounts.0.key(),
            amount,
            amount_out_u64,
            authority.key(),
            new_price
        );
        
        msg!("CHART_DATA{{\"token_mint_address\":\"{}\", \"mcap\":{:.4}}}",
            token_accounts.0.key(),
            mcap
        );

        if self.reserve_sol > 85_000_000_000 {
            msg!("START MIGRATION");
        }
        Ok(())
    }

    fn sell(
        &mut self,
        token_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        pool_sol_vault: &mut AccountInfo<'info>,
        platform_fee_wallet1: UncheckedAccount<'info>,
        creator_fee_wallet: UncheckedAccount<'info>,
        amount: u64,
        min_sol_out: u64,
        bump: u8,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
        fees: f64
    ) -> Result<()> {
        if self.migrated_to_meteora {
            return err!(CustomError::AlreadyMigrated);
        }
        if amount == 0 {
            return err!(CustomError::InvalidAmount);
        }


        let current_tokens_sold = (self.total_supply as f64 - self.reserve_token as f64) / 1_000_000_000.0;
        
        
        // Calculate new tokens sold after this sale
        let tokens_to_sell = amount as f64 / 1_000_000_000.0; // Convert to normalized units
        let new_tokens_sold = current_tokens_sold - tokens_to_sell;
        
        // Calculate SOL to receive based on the area under the curve
        // This ensures fair pricing along the bonding curve
        let sol_received = if new_tokens_sold <= 0.0 {
            // Edge case - selling all tokens or more than exist
            self.reserve_sol as f64
        } else {
            // Calculate area under curve between current_tokens_sold and new_tokens_sold
            // For the bonding curve: price = (EXPONENT * x^(EXPONENT-1)) / (PROPORTION_BASE * 10^PROPORTION_EXP) + MIN_PRICE
            // The integral is: (x^EXPONENT) / (PROPORTION_BASE * 10^PROPORTION_EXP) + MIN_PRICE*x
            let integral = |x: f64| -> f64 {
                (x.powf(EXPONENT)) / (PROPORTION_BASE * 10.0f64.powi(PROPORTION_EXP)) + MIN_PRICE * x
            };
            
            let area = integral(current_tokens_sold) - integral(new_tokens_sold);
            area * 1_000_000_000.0 // Convert back to lamports
        };

        // Apply fees
        let amount_before_fee = sol_received;
        let amount_out = amount_before_fee * (1.0 - fees / 100.0);
        let fee_amount = amount_before_fee - amount_out;
        
        let platform_fee1 = fee_amount * 50.0 / 100.0;
        let creator_fee = fee_amount - platform_fee1;
        let amount_out_u64 = amount_out.round() as u64;

        if amount_out_u64 < min_sol_out {
            return err!(CustomError::SlippageExceeded);
        }

        if platform_fee1 > 0.0 {
            system_program::transfer(
                CpiContext::new_with_signer(
                    system_program.to_account_info(),
                    system_program::Transfer {
                        from: pool_sol_vault.clone(),
                        to: platform_fee_wallet1.to_account_info().clone(),
                    },
                    &[&[
                        LiquidityPool::SOL_VAULT_PREFIX.as_bytes(),
                        self.token.key().as_ref(),
                        &[bump],
                    ]],
                ),
                platform_fee1.round() as u64,
            )?;
        }

        if creator_fee > 0.0 {
            system_program::transfer(
                CpiContext::new_with_signer(
                    system_program.to_account_info(),
                    system_program::Transfer {
                        from: pool_sol_vault.clone(),
                        to: creator_fee_wallet.to_account_info().clone(),
                    },
                    &[&[
                        LiquidityPool::SOL_VAULT_PREFIX.as_bytes(),
                        self.token.key().as_ref(),
                        &[bump],
                    ]],
                ),
                creator_fee.round() as u64,
            )?;
        }
        
        // Check if there's enough SOL in the vault
        let total_sol_needed = amount_out_u64 + platform_fee1.round() as u64 + creator_fee.round() as u64;
        if self.reserve_sol < total_sol_needed {
            return err!(CustomError::NotEnoughSolInVault);
        }

        self.transfer_token_to_pool(token_accounts.2, token_accounts.1, amount, authority, token_program)?;

        self.reserve_token += amount;
        self.reserve_sol -= total_sol_needed;
        self.transfer_sol_from_pool(pool_sol_vault, authority, amount_out_u64, bump, system_program)?;

        // Calculate new price after the sale
        let new_price = if new_tokens_sold <= 0.0 {
            // Edge case: if all tokens are sold or trying to sell more than available
            MIN_PRICE // Use the minimum price as fallback
        } else {
            (EXPONENT * new_tokens_sold.powf(EXPONENT - 1.0)) / (PROPORTION_BASE * 10.0f64.powi(PROPORTION_EXP)) + MIN_PRICE
        };

        let mcap = new_price * 1_000_000_000.0;
        
        msg!("TRANSACTION_INFO{{\"token_mint_address\":\"{}\",\"type\":\"SELL\",\"sol_amount\":{},\"token_amount\":{},\"wallet\":\"{}\",\"price\":{:.9}}}",
            token_accounts.0.key(),
            amount_out_u64,
            amount,
            authority.key(),
            new_price
        );
        
        msg!("CHART_DATA{{\"token_mint_address\":\"{}\", \"mcap\":{:.4}}}",
            token_accounts.0.key(),
            mcap
        );
        
        Ok(())
    }

    fn transfer_token_from_pool(
        &self,
        from: &Account<'info, TokenAccount>,
        to: &Account<'info, TokenAccount>,
        amount: u64,
        token_program: &Program<'info, Token>,
    ) -> Result<()> {
        token::transfer(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                token::Transfer {
                    from: from.to_account_info(),
                    to: to.to_account_info(),
                    authority: self.to_account_info(),
                },
                &[&[
                    LiquidityPool::POOL_SEED_PREFIX.as_bytes(),
                    self.token.key().as_ref(),
                    &[self.bump],
                ]],
            ),
            amount,
        )?;
        Ok(())
    }

    fn transfer_token_to_pool(
        &self,
        from: &Account<'info, TokenAccount>,
        to: &Account<'info, TokenAccount>,
        amount: u64,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()> {
        token::transfer(
            CpiContext::new(
                token_program.to_account_info(),
                token::Transfer {
                    from: from.to_account_info(),
                    to: to.to_account_info(),
                    authority: authority.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    fn transfer_sol_to_pool(
        &self,
        from: &Signer<'info>,
        to: &mut AccountInfo<'info>,
        amount: u64,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        let ix = solana_program::system_instruction::transfer(from.key, to.key, amount);
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                from.to_account_info(),
                to.clone(),
                system_program.to_account_info(),
            ],
        )?;
        Ok(())
    }

    fn transfer_sol_from_pool(
        &self,
        from: &mut AccountInfo<'info>,
        to: &Signer<'info>,
        amount: u64,
        bump: u8,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        let seeds = &[
            LiquidityPool::SOL_VAULT_PREFIX.as_bytes(),
            self.token.as_ref(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let ix = solana_program::system_instruction::transfer(from.key, to.key, amount);

        anchor_lang::solana_program::program::invoke_signed(
            &ix,
            &[
                from.to_account_info(),
                to.to_account_info(),
                system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        Ok(())
    }
}