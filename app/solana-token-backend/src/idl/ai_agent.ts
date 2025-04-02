/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ai_agent.json`.
 */
export type AiAgent = {
  "address": "DHr5zADHP6mkJRZiZKoMnadQyqWKfq6kxXG7iZAcipNa",
  "metadata": {
    "name": "aiAgent",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addLiquidity",
      "discriminator": [
        181,
        157,
        89,
        67,
        143,
        182,
        52,
        72
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "platformTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "platformAuthority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "platformAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "buy",
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "dexConfigurationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  117,
                  114,
                  118,
                  101,
                  67,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "teamAccount",
          "writable": true,
          "address": "6XF158v9uXWL7dpJnkJFHKpZgzmLXX5HoH4vG5hPsmmP"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createPool",
      "discriminator": [
        233,
        146,
        209,
        142,
        207,
        104,
        64,
        188
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "harvestLockedFee",
      "discriminator": [
        11,
        221,
        28,
        235,
        159,
        93,
        85,
        251
      ],
      "accounts": [
        {
          "name": "lockCpmmProgram",
          "address": "DLockwT7X7sxtLmGH9g5kmfcjaBtncdbUmi738m5bvQC"
        },
        {
          "name": "cpSwapProgram",
          "address": "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "ammConfig"
        },
        {
          "name": "authority",
          "address": "3f7GcQFG397GAaEnv51zR6tsTVihYRydnydDD1cXekxH"
        },
        {
          "name": "feeNftAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "locked_liquidity.fee_nft_mint",
                "account": "lockedCpLiquidityState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lockedLiquidity",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107,
                  101,
                  100,
                  95,
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "locked_liquidity.fee_nft_mint",
                "account": "lockedCpLiquidityState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "lockCpmmProgram"
            }
          }
        },
        {
          "name": "cpAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "poolState",
          "writable": true
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "baseVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "lockedLpVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "lpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "memoProgram",
          "address": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        },
        {
          "name": "token0Program"
        },
        {
          "name": "token1Program"
        },
        {
          "name": "baseMint"
        },
        {
          "name": "tokenMint"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "dexConfigurationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  117,
                  114,
                  118,
                  101,
                  67,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "f64"
        }
      ]
    },
    {
      "name": "initializeRaydiumPool",
      "discriminator": [
        208,
        201,
        66,
        208,
        195,
        113,
        11,
        45
      ],
      "accounts": [
        {
          "name": "cpSwapProgram",
          "address": "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "baseMint",
          "writable": true,
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "creatorBaseAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "ammConfig"
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "creatorLpToken",
          "writable": true
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "createPoolFee",
          "writable": true,
          "address": "G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2"
        },
        {
          "name": "observationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token1Program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "initAmount0",
          "type": "u64"
        },
        {
          "name": "initAmount1",
          "type": "u64"
        }
      ]
    },
    {
      "name": "lockCpmmLp",
      "discriminator": [
        105,
        223,
        197,
        190,
        186,
        12,
        93,
        180
      ],
      "accounts": [
        {
          "name": "cpSwapProgram",
          "address": "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
        },
        {
          "name": "lockCpmmProgram",
          "address": "DLockwT7X7sxtLmGH9g5kmfcjaBtncdbUmi738m5bvQC"
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "ammConfig"
        },
        {
          "name": "authority",
          "address": "3f7GcQFG397GAaEnv51zR6tsTVihYRydnydDD1cXekxH"
        },
        {
          "name": "feeNftMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeNftAcc",
          "writable": true
        },
        {
          "name": "poolState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "lockedLiquidity",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107,
                  101,
                  100,
                  95,
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "feeNftMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "lockCpmmProgram"
            }
          }
        },
        {
          "name": "lpMint",
          "docs": [
            "The mint of liquidity token",
            "address = pool_state.lp_mint"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "liquidityOwnerLp",
          "writable": true
        },
        {
          "name": "lockedLpVault",
          "writable": true
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "baseMint"
        },
        {
          "name": "tokenMint"
        }
      ],
      "args": []
    },
    {
      "name": "migrateToRaydium",
      "discriminator": [
        116,
        139,
        75,
        192,
        86,
        63,
        121,
        169
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The platform wallet that will pay for the migration and hold migrated funds"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "authorityTokenAccount",
          "docs": [
            "The authority's token account that will provide the platform tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorBaseAta",
          "docs": [
            "The WSOL ATA for the authority, will receive wrapped SOL"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "baseMint",
          "docs": [
            "The WSOL (Wrapped SOL) mint account"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Required system accounts"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "removeLiquidity",
      "discriminator": [
        80,
        85,
        209,
        72,
        24,
        206,
        177,
        108
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "sell",
      "discriminator": [
        51,
        230,
        133,
        164,
        1,
        127,
        131,
        173
      ],
      "accounts": [
        {
          "name": "dexConfigurationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  117,
                  114,
                  118,
                  101,
                  67,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "teamAccount",
          "writable": true,
          "address": "6XF158v9uXWL7dpJnkJFHKpZgzmLXX5HoH4vG5hPsmmP"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "swap",
      "discriminator": [
        248,
        198,
        158,
        145,
        225,
        117,
        135,
        200
      ],
      "accounts": [
        {
          "name": "cpSwapProgram",
          "address": "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
        },
        {
          "name": "creator",
          "docs": [
            "The user performing the swap"
          ],
          "signer": true
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "ammConfig",
          "docs": [
            "The factory state to read protocol fees"
          ]
        },
        {
          "name": "poolState",
          "writable": true
        },
        {
          "name": "inputTokenAccount",
          "docs": [
            "The user token account for input token"
          ],
          "writable": true
        },
        {
          "name": "outputTokenAccount",
          "docs": [
            "The user token account for output token"
          ],
          "writable": true
        },
        {
          "name": "inputVault",
          "docs": [
            "The vault token account for input token"
          ],
          "writable": true
        },
        {
          "name": "outputVault",
          "docs": [
            "The vault token account for output token"
          ],
          "writable": true
        },
        {
          "name": "inputTokenProgram",
          "docs": [
            "SPL program for input token transfers"
          ]
        },
        {
          "name": "outputTokenProgram",
          "docs": [
            "SPL program for output token transfers"
          ]
        },
        {
          "name": "inputTokenMint",
          "docs": [
            "The mint of input token"
          ]
        },
        {
          "name": "outputTokenMint",
          "docs": [
            "The mint of output token"
          ]
        },
        {
          "name": "observationState",
          "docs": [
            "The program account for the most recent oracle observation"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minimumAmountOut",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ammConfig",
      "discriminator": [
        218,
        244,
        33,
        104,
        203,
        203,
        43,
        111
      ]
    },
    {
      "name": "curveConfiguration",
      "discriminator": [
        225,
        242,
        252,
        198,
        63,
        77,
        56,
        255
      ]
    },
    {
      "name": "liquidityPool",
      "discriminator": [
        66,
        38,
        17,
        64,
        188,
        80,
        68,
        129
      ]
    },
    {
      "name": "lockedCpLiquidityState",
      "discriminator": [
        25,
        10,
        238,
        197,
        207,
        234,
        73,
        22
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "duplicateTokenNotAllowed",
      "msg": "Duplicate tokens are not allowed"
    },
    {
      "code": 6001,
      "name": "failedToAllocateShares",
      "msg": "Failed to allocate shares"
    },
    {
      "code": 6002,
      "name": "failedToDeallocateShares",
      "msg": "Failed to deallocate shares"
    },
    {
      "code": 6003,
      "name": "insufficientShares",
      "msg": "Insufficient shares"
    },
    {
      "code": 6004,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to swap"
    },
    {
      "code": 6005,
      "name": "invalidAmount",
      "msg": "Invalid amount to swap"
    },
    {
      "code": 6006,
      "name": "invalidFee",
      "msg": "Invalid fee"
    },
    {
      "code": 6007,
      "name": "failedToAddLiquidity",
      "msg": "Failed to add liquidity"
    },
    {
      "code": 6008,
      "name": "failedToRemoveLiquidity",
      "msg": "Failed to remove liquidity"
    },
    {
      "code": 6009,
      "name": "notEnoughToRemove",
      "msg": "Sold token is not enough to remove pool"
    },
    {
      "code": 6010,
      "name": "notCreator",
      "msg": "Not a pool creator"
    },
    {
      "code": 6011,
      "name": "overflowOrUnderflowOccurred",
      "msg": "Overflow or underflow occured"
    },
    {
      "code": 6012,
      "name": "tokenAmountToSellTooBig",
      "msg": "Token amount is too big to sell"
    },
    {
      "code": 6013,
      "name": "notEnoughSolInVault",
      "msg": "SOL is not enough in vault"
    },
    {
      "code": 6014,
      "name": "notEnoughTokenInVault",
      "msg": "Token is not enough in vault"
    },
    {
      "code": 6015,
      "name": "negativeNumber",
      "msg": "Amount is negative"
    },
    {
      "code": 6016,
      "name": "invalidFeePercentage",
      "msg": "Invalid fee percentage. It must be between 0.0 and 100.0."
    },
    {
      "code": 6017,
      "name": "poolValueTooLow",
      "msg": "Pool value is too low for migration"
    },
    {
      "code": 6018,
      "name": "alreadyMigrated",
      "msg": "Pool already migrated to Raydium"
    },
    {
      "code": 6019,
      "name": "insufficientLiquidity",
      "msg": "Insufficient SOL or Token liquidity in the pool for migration"
    },
    {
      "code": 6020,
      "name": "calculationError",
      "msg": "Calculation error occurred during migration"
    }
  ],
  "types": [
    {
      "name": "ammConfig",
      "docs": [
        "Holds the current owner of the factory"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          },
          {
            "name": "disableCreatePool",
            "docs": [
              "Status to control if new pool can be create"
            ],
            "type": "bool"
          },
          {
            "name": "index",
            "docs": [
              "Config index"
            ],
            "type": "u16"
          },
          {
            "name": "tradeFeeRate",
            "docs": [
              "The trade fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "protocolFeeRate",
            "docs": [
              "The protocol fee"
            ],
            "type": "u64"
          },
          {
            "name": "fundFeeRate",
            "docs": [
              "The fund fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "createPoolFee",
            "docs": [
              "Fee for create a new pool"
            ],
            "type": "u64"
          },
          {
            "name": "protocolOwner",
            "docs": [
              "Address of the protocol fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "fundOwner",
            "docs": [
              "Address of the fund fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding",
            "docs": [
              "padding"
            ],
            "type": {
              "array": [
                "u64",
                16
              ]
            }
          }
        ]
      }
    },
    {
      "name": "curveConfiguration",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fees",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "liquidityPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "token",
            "type": "pubkey"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "reserveToken",
            "type": "u64"
          },
          {
            "name": "reserveSol",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "migratedToRaydium",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "lockedCpLiquidityState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lockedLpAmount",
            "docs": [
              "The Locked liquidity amount without claimed lp fee"
            ],
            "type": "u64"
          },
          {
            "name": "claimedLpAmount",
            "docs": [
              "Claimed lp fee amount"
            ],
            "type": "u64"
          },
          {
            "name": "unclaimedLpAmount",
            "docs": [
              "Unclaimed lp fee amount"
            ],
            "type": "u64"
          },
          {
            "name": "lastLp",
            "docs": [
              "Last updated cp pool lp total supply"
            ],
            "type": "u64"
          },
          {
            "name": "lastK",
            "docs": [
              "Last updated cp pool k"
            ],
            "type": "u128"
          },
          {
            "name": "recentEpoch",
            "docs": [
              "Account update recent epoch"
            ],
            "type": "u64"
          },
          {
            "name": "poolId",
            "docs": [
              "The ID of the pool with which this record is connected"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeNftMint",
            "docs": [
              "nft mint to check who has authority to collect fee"
            ],
            "type": "pubkey"
          },
          {
            "name": "lockedOwner",
            "docs": [
              "The owner who has locked liquidity"
            ],
            "type": "pubkey"
          },
          {
            "name": "lockedLpMint",
            "docs": [
              "The mint of locked lp token"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding",
            "docs": [
              "Unused bytes for future upgrades."
            ],
            "type": {
              "array": [
                "u64",
                8
              ]
            }
          }
        ]
      }
    }
  ]
};

export const IDL:AiAgent = {
  "address": "DHr5zADHP6mkJRZiZKoMnadQyqWKfq6kxXG7iZAcipNa",
  "metadata": {
    "name": "aiAgent",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addLiquidity",
      "discriminator": [
        181,
        157,
        89,
        67,
        143,
        182,
        52,
        72
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "platformTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "platformAuthority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "platformAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "buy",
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "dexConfigurationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  117,
                  114,
                  118,
                  101,
                  67,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "teamAccount",
          "writable": true,
          "address": "6XF158v9uXWL7dpJnkJFHKpZgzmLXX5HoH4vG5hPsmmP"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createPool",
      "discriminator": [
        233,
        146,
        209,
        142,
        207,
        104,
        64,
        188
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "harvestLockedFee",
      "discriminator": [
        11,
        221,
        28,
        235,
        159,
        93,
        85,
        251
      ],
      "accounts": [
        {
          "name": "lockCpmmProgram",
          "address": "DLockwT7X7sxtLmGH9g5kmfcjaBtncdbUmi738m5bvQC"
        },
        {
          "name": "cpSwapProgram",
          "address": "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "ammConfig"
        },
        {
          "name": "authority",
          "address": "3f7GcQFG397GAaEnv51zR6tsTVihYRydnydDD1cXekxH"
        },
        {
          "name": "feeNftAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "locked_liquidity.fee_nft_mint",
                "account": "lockedCpLiquidityState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lockedLiquidity",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107,
                  101,
                  100,
                  95,
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "locked_liquidity.fee_nft_mint",
                "account": "lockedCpLiquidityState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "lockCpmmProgram"
            }
          }
        },
        {
          "name": "cpAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "poolState",
          "writable": true
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "baseVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "lockedLpVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "lpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "memoProgram",
          "address": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        },
        {
          "name": "token0Program"
        },
        {
          "name": "token1Program"
        },
        {
          "name": "baseMint"
        },
        {
          "name": "tokenMint"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "dexConfigurationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  117,
                  114,
                  118,
                  101,
                  67,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "f64"
        }
      ]
    },
    {
      "name": "initializeRaydiumPool",
      "discriminator": [
        208,
        201,
        66,
        208,
        195,
        113,
        11,
        45
      ],
      "accounts": [
        {
          "name": "cpSwapProgram",
          "address": "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "baseMint",
          "writable": true,
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "creatorBaseAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "ammConfig"
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "creatorLpToken",
          "writable": true
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "createPoolFee",
          "writable": true,
          "address": "G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2"
        },
        {
          "name": "observationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token1Program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "initAmount0",
          "type": "u64"
        },
        {
          "name": "initAmount1",
          "type": "u64"
        }
      ]
    },
    {
      "name": "lockCpmmLp",
      "discriminator": [
        105,
        223,
        197,
        190,
        186,
        12,
        93,
        180
      ],
      "accounts": [
        {
          "name": "cpSwapProgram",
          "address": "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
        },
        {
          "name": "lockCpmmProgram",
          "address": "DLockwT7X7sxtLmGH9g5kmfcjaBtncdbUmi738m5bvQC"
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "ammConfig"
        },
        {
          "name": "authority",
          "address": "3f7GcQFG397GAaEnv51zR6tsTVihYRydnydDD1cXekxH"
        },
        {
          "name": "feeNftMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeNftAcc",
          "writable": true
        },
        {
          "name": "poolState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "baseMint"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "lockedLiquidity",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107,
                  101,
                  100,
                  95,
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "feeNftMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "lockCpmmProgram"
            }
          }
        },
        {
          "name": "lpMint",
          "docs": [
            "The mint of liquidity token",
            "address = pool_state.lp_mint"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "liquidityOwnerLp",
          "writable": true
        },
        {
          "name": "lockedLpVault",
          "writable": true
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "baseMint"
        },
        {
          "name": "tokenMint"
        }
      ],
      "args": []
    },
    {
      "name": "migrateToRaydium",
      "discriminator": [
        116,
        139,
        75,
        192,
        86,
        63,
        121,
        169
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The platform wallet that will pay for the migration and hold migrated funds"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "authorityTokenAccount",
          "docs": [
            "The authority's token account that will provide the platform tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorBaseAta",
          "docs": [
            "The WSOL ATA for the authority, will receive wrapped SOL"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "baseMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "baseMint",
          "docs": [
            "The WSOL (Wrapped SOL) mint account"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Required system accounts"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "removeLiquidity",
      "discriminator": [
        80,
        85,
        209,
        72,
        24,
        206,
        177,
        108
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "sell",
      "discriminator": [
        51,
        230,
        133,
        164,
        1,
        127,
        131,
        173
      ],
      "accounts": [
        {
          "name": "dexConfigurationAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  117,
                  114,
                  118,
                  101,
                  67,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "teamAccount",
          "writable": true,
          "address": "6XF158v9uXWL7dpJnkJFHKpZgzmLXX5HoH4vG5hPsmmP"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "swap",
      "discriminator": [
        248,
        198,
        158,
        145,
        225,
        117,
        135,
        200
      ],
      "accounts": [
        {
          "name": "cpSwapProgram",
          "address": "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"
        },
        {
          "name": "creator",
          "docs": [
            "The user performing the swap"
          ],
          "signer": true
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "ammConfig",
          "docs": [
            "The factory state to read protocol fees"
          ]
        },
        {
          "name": "poolState",
          "writable": true
        },
        {
          "name": "inputTokenAccount",
          "docs": [
            "The user token account for input token"
          ],
          "writable": true
        },
        {
          "name": "outputTokenAccount",
          "docs": [
            "The user token account for output token"
          ],
          "writable": true
        },
        {
          "name": "inputVault",
          "docs": [
            "The vault token account for input token"
          ],
          "writable": true
        },
        {
          "name": "outputVault",
          "docs": [
            "The vault token account for output token"
          ],
          "writable": true
        },
        {
          "name": "inputTokenProgram",
          "docs": [
            "SPL program for input token transfers"
          ]
        },
        {
          "name": "outputTokenProgram",
          "docs": [
            "SPL program for output token transfers"
          ]
        },
        {
          "name": "inputTokenMint",
          "docs": [
            "The mint of input token"
          ]
        },
        {
          "name": "outputTokenMint",
          "docs": [
            "The mint of output token"
          ]
        },
        {
          "name": "observationState",
          "docs": [
            "The program account for the most recent oracle observation"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minimumAmountOut",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ammConfig",
      "discriminator": [
        218,
        244,
        33,
        104,
        203,
        203,
        43,
        111
      ]
    },
    {
      "name": "curveConfiguration",
      "discriminator": [
        225,
        242,
        252,
        198,
        63,
        77,
        56,
        255
      ]
    },
    {
      "name": "liquidityPool",
      "discriminator": [
        66,
        38,
        17,
        64,
        188,
        80,
        68,
        129
      ]
    },
    {
      "name": "lockedCpLiquidityState",
      "discriminator": [
        25,
        10,
        238,
        197,
        207,
        234,
        73,
        22
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "duplicateTokenNotAllowed",
      "msg": "Duplicate tokens are not allowed"
    },
    {
      "code": 6001,
      "name": "failedToAllocateShares",
      "msg": "Failed to allocate shares"
    },
    {
      "code": 6002,
      "name": "failedToDeallocateShares",
      "msg": "Failed to deallocate shares"
    },
    {
      "code": 6003,
      "name": "insufficientShares",
      "msg": "Insufficient shares"
    },
    {
      "code": 6004,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to swap"
    },
    {
      "code": 6005,
      "name": "invalidAmount",
      "msg": "Invalid amount to swap"
    },
    {
      "code": 6006,
      "name": "invalidFee",
      "msg": "Invalid fee"
    },
    {
      "code": 6007,
      "name": "failedToAddLiquidity",
      "msg": "Failed to add liquidity"
    },
    {
      "code": 6008,
      "name": "failedToRemoveLiquidity",
      "msg": "Failed to remove liquidity"
    },
    {
      "code": 6009,
      "name": "notEnoughToRemove",
      "msg": "Sold token is not enough to remove pool"
    },
    {
      "code": 6010,
      "name": "notCreator",
      "msg": "Not a pool creator"
    },
    {
      "code": 6011,
      "name": "overflowOrUnderflowOccurred",
      "msg": "Overflow or underflow occured"
    },
    {
      "code": 6012,
      "name": "tokenAmountToSellTooBig",
      "msg": "Token amount is too big to sell"
    },
    {
      "code": 6013,
      "name": "notEnoughSolInVault",
      "msg": "SOL is not enough in vault"
    },
    {
      "code": 6014,
      "name": "notEnoughTokenInVault",
      "msg": "Token is not enough in vault"
    },
    {
      "code": 6015,
      "name": "negativeNumber",
      "msg": "Amount is negative"
    },
    {
      "code": 6016,
      "name": "invalidFeePercentage",
      "msg": "Invalid fee percentage. It must be between 0.0 and 100.0."
    },
    {
      "code": 6017,
      "name": "poolValueTooLow",
      "msg": "Pool value is too low for migration"
    },
    {
      "code": 6018,
      "name": "alreadyMigrated",
      "msg": "Pool already migrated to Raydium"
    },
    {
      "code": 6019,
      "name": "insufficientLiquidity",
      "msg": "Insufficient SOL or Token liquidity in the pool for migration"
    },
    {
      "code": 6020,
      "name": "calculationError",
      "msg": "Calculation error occurred during migration"
    }
  ],
  "types": [
    {
      "name": "ammConfig",
      "docs": [
        "Holds the current owner of the factory"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          },
          {
            "name": "disableCreatePool",
            "docs": [
              "Status to control if new pool can be create"
            ],
            "type": "bool"
          },
          {
            "name": "index",
            "docs": [
              "Config index"
            ],
            "type": "u16"
          },
          {
            "name": "tradeFeeRate",
            "docs": [
              "The trade fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "protocolFeeRate",
            "docs": [
              "The protocol fee"
            ],
            "type": "u64"
          },
          {
            "name": "fundFeeRate",
            "docs": [
              "The fund fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "createPoolFee",
            "docs": [
              "Fee for create a new pool"
            ],
            "type": "u64"
          },
          {
            "name": "protocolOwner",
            "docs": [
              "Address of the protocol fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "fundOwner",
            "docs": [
              "Address of the fund fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding",
            "docs": [
              "padding"
            ],
            "type": {
              "array": [
                "u64",
                16
              ]
            }
          }
        ]
      }
    },
    {
      "name": "curveConfiguration",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fees",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "liquidityPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "token",
            "type": "pubkey"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "reserveToken",
            "type": "u64"
          },
          {
            "name": "reserveSol",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "migratedToRaydium",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "lockedCpLiquidityState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lockedLpAmount",
            "docs": [
              "The Locked liquidity amount without claimed lp fee"
            ],
            "type": "u64"
          },
          {
            "name": "claimedLpAmount",
            "docs": [
              "Claimed lp fee amount"
            ],
            "type": "u64"
          },
          {
            "name": "unclaimedLpAmount",
            "docs": [
              "Unclaimed lp fee amount"
            ],
            "type": "u64"
          },
          {
            "name": "lastLp",
            "docs": [
              "Last updated cp pool lp total supply"
            ],
            "type": "u64"
          },
          {
            "name": "lastK",
            "docs": [
              "Last updated cp pool k"
            ],
            "type": "u128"
          },
          {
            "name": "recentEpoch",
            "docs": [
              "Account update recent epoch"
            ],
            "type": "u64"
          },
          {
            "name": "poolId",
            "docs": [
              "The ID of the pool with which this record is connected"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeNftMint",
            "docs": [
              "nft mint to check who has authority to collect fee"
            ],
            "type": "pubkey"
          },
          {
            "name": "lockedOwner",
            "docs": [
              "The owner who has locked liquidity"
            ],
            "type": "pubkey"
          },
          {
            "name": "lockedLpMint",
            "docs": [
              "The mint of locked lp token"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding",
            "docs": [
              "Unused bytes for future upgrades."
            ],
            "type": {
              "array": [
                "u64",
                8
              ]
            }
          }
        ]
      }
    }
  ]
};