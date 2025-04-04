use anchor_lang::{prelude::Pubkey, solana_program};

pub const INITIAL_LAMPORTS_FOR_POOL: u64 = 10_000_000; 
// pub const TOKEN_SELL_LIMIT_PERCENT: u64 = 8000; 
pub const PROPORTION: u64 = 1280;      
// Define the fixed amount of tokens to be provided by the platform wallet (200 Million)
pub const PLATFORM_TOKEN_AMOUNT: u64 = 200_000_000;
pub const WSOL_ID: Pubkey = solana_program::pubkey!("So11111111111111111111111111111111111111112");
pub const LOCK_CPMM_AUTHORITY: Pubkey = solana_program::pubkey!("7AFUeLVRjBfzqK3tTGw8hN48KLQWSk6DTE8xprWdPqix");