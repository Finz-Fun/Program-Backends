use crate::consts::INITIAL_LAMPORTS_FOR_POOL;
use crate::consts::PROPORTION;
use crate::errors::CustomError;
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
    pub fees: f64,
}

impl CurveConfiguration {
    pub const SEED: &'static str = "CurveConfiguration";

    // Discriminator (8) + f64 (8)
    pub const ACCOUNT_SIZE: usize = 8 + 32 + 8;

     pub fn new(fees: f64) -> Self {
        Self { fees }
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
}

impl LiquidityPool {
    pub const POOL_SEED_PREFIX: &'static str = "liquidity_pool";
    pub const SOL_VAULT_PREFIX: &'static str = "liquidity_sol_vault";

    // Discriminator (8) + Pubkey (32) + Pubkey (32) + totalsupply (8)
    // + reserve one (8) + reserve two (8) + Bump (1)
    pub const ACCOUNT_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1;

    // Constructor to initialize a LiquidityPool with two tokens and a bump for the PDA
    pub fn new(creator: Pubkey, token: Pubkey, bump: u8) -> Self {
        Self {
            creator,
            token,
            total_supply: 0_u64,
            reserve_token: 0_u64,
            reserve_sol: 0_u64,
            bump,
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

    // Allows removing liquidity by burning pool shares and receiving back a proportionate amount of tokens
    fn remove_liquidity(
        &mut self,
        token_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        pool_sol_account: &mut AccountInfo<'info>,
        authority: &Signer<'info>,
        bump: u8,
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
        team_account: UncheckedAccount<'info>,
        amount: u64,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
        fees:f64
    ) -> Result<()>;

    fn sell(
        &mut self,
        token_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        pool_sol_vault: &mut AccountInfo<'info>,
        team_account: UncheckedAccount<'info>,
        amount: u64,
        bump: u8,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
        fees:f64
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
        self.transfer_token_to_pool(
            token_accounts.2,
            token_accounts.1,
            token_accounts.0.supply,
            platform_authority,
            token_program,
        )?;

        self.transfer_sol_to_pool(
            user,
            pool_sol_vault,
            INITIAL_LAMPORTS_FOR_POOL,
            system_program,
        )?;
        self.total_supply = 1_000_000_000_000_000_000;
        self.update_reserves(token_accounts.0.supply, INITIAL_LAMPORTS_FOR_POOL)?;

        Ok(())
    }

    fn remove_liquidity(
        &mut self,
        token_accounts: (
            &mut Account<'info, Mint>,
            &mut Account<'info, TokenAccount>,
            &mut Account<'info, TokenAccount>,
        ),
        pool_sol_vault: &mut AccountInfo<'info>,
        authority: &Signer<'info>,
        bump: u8,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        self.transfer_token_from_pool(
            token_accounts.1,
            token_accounts.2,
            token_accounts.1.amount as u64,
            token_program,
        )?;
        let amount = pool_sol_vault.to_account_info().lamports() as u64;
        self.transfer_sol_from_pool(pool_sol_vault, authority, amount, bump, system_program)?;

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
        team_account: UncheckedAccount<'info>,
        amount: u64,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
        fees: f64
    ) -> Result<()> {
        if amount == 0 {
            return err!(CustomError::InvalidAmount);
        }
        if self.reserve_token < amount {
            return err!(CustomError::NotEnoughTokenInVault);
        }

    
        let fee_amount = (amount as f64) * (fees / 100.0);
        let adjusted_amount = (amount as f64) * (1.0 - fees / 100.0);

        let fee_amount_u64 = fee_amount.round() as u64;
        let adjusted_amount_u64 = adjusted_amount.round() as u64;
    
        let ix = transfer(authority.key, team_account.key, fee_amount_u64);
        invoke(
            &ix,
            &[
                authority.to_account_info(),
                team_account.to_account_info(),
                system_program.to_account_info(),
            ],
        )?;

    
        let virtual_sol = 25_000_000_000.0; 
        

        let bought_amount = (self.total_supply as f64 - self.reserve_token as f64) / 1_000_000.0 / 1_000_000_000.0 
            + virtual_sol / 1_000_000_000.0;

        let root_val = (PROPORTION as f64 * adjusted_amount as f64 / 1_000_000_000.0 + bought_amount * bought_amount).sqrt();

        let amount_out_f64 = (root_val - bought_amount) * 1_000_000.0 * 1_000_000_000.0;

        let amount_out = amount_out_f64.round() as u64;

        if amount_out > self.reserve_token {
            return err!(CustomError::NotEnoughTokenInVault);
        }

        self.reserve_sol += adjusted_amount_u64;
        self.reserve_token -= amount_out;


        self.transfer_sol_to_pool(authority, pool_sol_vault, adjusted_amount_u64, system_program)?;
        self.transfer_token_from_pool(token_accounts.1, token_accounts.2, amount_out, token_program)?;
        msg!("TRANSACTION_INFO{{\"token_mint_address\":\"{}\",\"type\":\"BUY\",\"sol_amount\":{},\"token_amount\":{},\"wallet\":\"{}\"}}",
        token_accounts.0.key(),
        amount,
        amount_out,
        authority.key()
    );
       msg!("CHART_DATA{{\"token_mint_address\":\"{}\", \"mcap\":{}}}",
        token_accounts.0.key(),
        (self.reserve_sol + virtual_sol.round() as u64)
    );
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
        team_account: UncheckedAccount<'info>,
        amount: u64,
        bump: u8,
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
        system_program: &Program<'info, System>,
        fees: f64
    ) -> Result<()> {
        if amount == 0 {
            return err!(CustomError::InvalidAmount);
        }

        let virtual_sol = 25_000_000_000.0; 

        let bought_amount = (self.total_supply as f64 - self.reserve_token as f64) / 1_000_000.0 / 1_000_000_000.0 
            + virtual_sol / 1_000_000_000.0;

        let result_amount = (self.total_supply as f64 - self.reserve_token as f64 - amount as f64) / 1_000_000.0 / 1_000_000_000.0 
            + virtual_sol / 1_000_000_000.0;

        let amount_out_f64 = (bought_amount * bought_amount - result_amount * result_amount) / PROPORTION as f64 * 1_000_000_000.0;


        if fees < 0.0 || fees > 100.0 {
            return err!(CustomError::InvalidFeePercentage);
        }

        let adjusted_amount = amount_out_f64 * (1.0 - fees / 100.0);
        let fee_amount: f64 = amount_out_f64 * (fees / 100.0);

 
        system_program::transfer(
            CpiContext::new_with_signer(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: pool_sol_vault.clone(),
                    to: team_account.to_account_info().clone(),
                },
                &[&[
                    LiquidityPool::SOL_VAULT_PREFIX.as_bytes(),
                    self.token.key().as_ref(),
                    &[bump],
                ]],
            ),
            fee_amount.round() as u64,
        )?;

        let amount_out = adjusted_amount.round() as u64;

        if self.reserve_sol < amount_out {
            return err!(CustomError::NotEnoughSolInVault);
        }

 
        self.transfer_token_to_pool(token_accounts.2, token_accounts.1, amount, authority, token_program)?;

        self.reserve_token += amount;
        self.reserve_sol -= amount_out;

        self.transfer_sol_from_pool(pool_sol_vault, authority, amount_out, bump, system_program)?;
        msg!("TRANSACTION_INFO{{\"token_mint_address\":\"{}\",\"type\":\"SELL\",\"sol_amount\":{},\"token_amount\":{},\"wallet\":\"{}\"}}",
        token_accounts.0.key(),
        amount_out,
        amount,
        authority.key()
    );
        msg!("CHART_DATA{{\"token_mint_address\":\"{}\", \"mcap\":{}}}",
        token_accounts.0.key(),
        (self.reserve_sol + virtual_sol.round() as u64)
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

    fn transfer_sol_from_pool(
        &self,
        from: &mut AccountInfo<'info>,
        to: &Signer<'info>,
        amount: u64,
        bump: u8,
        system_program: &Program<'info, System>,
    ) -> Result<()> {

        system_program::transfer(
            CpiContext::new_with_signer(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: from.clone(),
                    to: to.to_account_info().clone(),
                },
                &[&[
                    LiquidityPool::SOL_VAULT_PREFIX.as_bytes(),
                    self.token.key().as_ref(),
                    &[bump],
                ]],
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

        system_program::transfer(
            CpiContext::new(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: from.to_account_info(),
                    to: to.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }
}