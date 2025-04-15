use anchor_lang::{prelude::Pubkey, solana_program::pubkey};


pub const INITIAL_LAMPORTS_FOR_POOL: u64 = 10_000_000; 
// pub const TOKEN_SELL_LIMIT_PERCENT: u64 = 8000; 
pub const PROPORTION_BASE: f64 = 2.26;      
pub const PROPORTION_EXP: i32 = 39;  // 2.26 * 10^39
pub const EXPONENT: f64 = 4.62;      // Total exponent is 1 + EXPONENT = 4.62
pub const MIN_PRICE: f64 = 3.5e-8; // Minimum starting price in SOL
pub const PLATFORM_FEE_WALLET1: Pubkey = pubkey!("7tMpmwww2ZXu8kwNXh88tQS72h2eS86LGm5A3cPJbZZx");
// pub const PLATFORM_FEE_WALLET2: Pubkey = pubkey!("H4UZeBfC7Qwjs3B76izaiMkTiG2brxeLGakLcyt8Et3L");