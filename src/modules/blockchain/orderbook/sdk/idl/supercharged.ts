/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/supercharged.json`.
 */
export type Supercharged = {
  address: 'AALyth5nZfutbht272SwKyCbk6fV7kgEwQsyQWbbCJmm';
  metadata: {
    name: 'supercharged';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'updateTokenSupport';
      discriminator: [27, 140, 130, 210, 121, 1, 150, 115];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'caller';
              },
            ];
          };
        },
        {
          name: 'tokenSupport';
          writable: true;
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'tokenSupportAddress';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'cancelEvent';
      discriminator: [55, 143, 36, 45, 59, 241, 89, 119];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'operator';
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
        {
          name: 'outcome';
          writable: true;
        },
        {
          name: 'operator';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'claimEvent';
      discriminator: [219, 230, 175, 166, 97, 172, 193, 131];
      accounts: [
        {
          name: 'totalClaim';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 116, 97, 108, 95, 99, 108, 97, 105, 109];
              },
              {
                kind: 'account';
                path: 'caller';
              },
              {
                kind: 'account';
                path: 'outcome.outcome_id';
                account: 'outcome';
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
        {
          name: 'outcome';
          writable: true;
        },
        {
          name: 'balance';
          writable: true;
        },
        {
          name: 'config';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: 'contractTokenAccount';
          writable: true;
        },
        {
          name: 'vaultAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'userTokenAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'closeOrder';
      discriminator: [90, 103, 209, 28, 7, 63, 168, 4];
      accounts: [
        {
          name: 'order';
          writable: true;
        },
        {
          name: 'event';
          writable: true;
        },
        {
          name: 'outcome';
          writable: true;
        },
        {
          name: 'programBalance';
          writable: true;
        },
        {
          name: 'userBalance';
          writable: true;
        },
        {
          name: 'userTokenAccount';
          writable: true;
        },
        {
          name: 'contractTokenAccount';
          writable: true;
        },
        {
          name: 'vaultAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'createBuyOrder';
      discriminator: [182, 87, 0, 160, 192, 66, 151, 130];
      accounts: [
        {
          name: 'order';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [111, 114, 100, 101, 114];
              },
              {
                kind: 'arg';
                path: 'orderId';
              },
            ];
          };
        },
        {
          name: 'balance';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [98, 97, 108, 97, 110, 99, 101];
              },
              {
                kind: 'account';
                path: 'caller';
              },
              {
                kind: 'arg';
                path: 'outcomeId';
              },
            ];
          };
        },
        {
          name: 'config';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: 'userTokenAccount';
          writable: true;
        },
        {
          name: 'contractTokenAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'outcomeId';
          type: 'u64';
        },
        {
          name: 'orderId';
          type: 'u64';
        },
        {
          name: 'orderType';
          type: {
            defined: {
              name: 'orderType';
            };
          };
        },
        {
          name: 'price';
          type: 'u64';
        },
        {
          name: 'value';
          type: 'u64';
        },
      ];
    },
    {
      name: 'createEvent';
      discriminator: [49, 219, 29, 203, 22, 98, 100, 87];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'operator';
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 118, 101, 110, 116];
              },
              {
                kind: 'arg';
                path: 'eventId';
              },
            ];
          };
        },
        {
          name: 'balance';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: 'arg';
                path: 'outcomeId';
              },
            ];
          };
        },
        {
          name: 'outcome';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [111, 117, 116, 99, 111, 109, 101];
              },
              {
                kind: 'arg';
                path: 'outcomeId';
              },
            ];
          };
        },
        {
          name: 'operator';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'eventId';
          type: 'u64';
        },
        {
          name: 'outcomeId';
          type: 'u64';
        },
        {
          name: 'startTime';
          type: 'i64';
        },
        {
          name: 'endTime';
          type: 'i64';
        },
      ];
    },
    {
      name: 'createMarketBuyOrder';
      discriminator: [220, 9, 120, 57, 216, 245, 189, 108];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'booker';
              },
            ];
          };
        },
        {
          name: 'order';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [111, 114, 100, 101, 114];
              },
              {
                kind: 'arg';
                path: 'orderId';
              },
            ];
          };
        },
        {
          name: 'balance';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [98, 97, 108, 97, 110, 99, 101];
              },
              {
                kind: 'account';
                path: 'caller';
              },
              {
                kind: 'arg';
                path: 'outcomeId';
              },
            ];
          };
        },
        {
          name: 'programBalance';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: 'arg';
                path: 'outcomeId';
              },
            ];
          };
        },
        {
          name: 'config';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: 'feeTokenAccount';
          writable: true;
        },
        {
          name: 'userTokenAccount';
          writable: true;
        },
        {
          name: 'vaultAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'contractTokenAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'booker';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'orderId';
          type: 'u64';
        },
        {
          name: 'outcomeId';
          type: 'u64';
        },
        {
          name: 'orderType';
          type: {
            defined: {
              name: 'orderType';
            };
          };
        },
        {
          name: 'value';
          type: 'u64';
        },
        {
          name: 'expireTime';
          type: 'i64';
        },
        {
          name: 'matchingOrders';
          type: {
            vec: 'pubkey';
          };
        },
      ];
    },
    {
      name: 'createMarketSellOrder';
      discriminator: [181, 228, 28, 229, 255, 90, 44, 10];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'booker';
              },
            ];
          };
        },
        {
          name: 'order';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [111, 114, 100, 101, 114];
              },
              {
                kind: 'arg';
                path: 'orderId';
              },
            ];
          };
        },
        {
          name: 'balance';
          writable: true;
        },
        {
          name: 'programBalance';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  45,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101,
                ];
              },
              {
                kind: 'arg';
                path: 'outcomeId';
              },
            ];
          };
        },
        {
          name: 'config';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: 'userTokenAccount';
          writable: true;
        },
        {
          name: 'feeTokenAccount';
          writable: true;
        },
        {
          name: 'contractTokenAccount';
          writable: true;
        },
        {
          name: 'vaultAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'booker';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'orderId';
          type: 'u64';
        },
        {
          name: 'outcomeId';
          type: 'u64';
        },
        {
          name: 'orderType';
          type: {
            defined: {
              name: 'orderType';
            };
          };
        },
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'expireTime';
          type: 'i64';
        },
        {
          name: 'matchingOrders';
          type: {
            vec: 'pubkey';
          };
        },
      ];
    },
    {
      name: 'createSellOrder';
      discriminator: [53, 52, 255, 44, 191, 74, 171, 225];
      accounts: [
        {
          name: 'order';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [111, 114, 100, 101, 114];
              },
              {
                kind: 'arg';
                path: 'orderId';
              },
            ];
          };
        },
        {
          name: 'balance';
          writable: true;
        },
        {
          name: 'programBalance';
          writable: true;
        },
        {
          name: 'userTokenAccount';
          writable: true;
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'orderId';
          type: 'u64';
        },
        {
          name: 'outcomeId';
          type: 'u64';
        },
        {
          name: 'orderType';
          type: {
            defined: {
              name: 'orderType';
            };
          };
        },
        {
          name: 'price';
          type: 'u64';
        },
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'getTokenSupport';
      discriminator: [50, 71, 160, 128, 200, 133, 109, 137];
      accounts: [
        {
          name: 'tokenSupport';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  115,
                  117,
                  112,
                  112,
                  111,
                  114,
                  116,
                ];
              },
            ];
          };
        },
      ];
      args: [];
      returns: {
        defined: {
          name: 'tokenSupport';
        };
      };
    },
    {
      name: 'grantRole';
      discriminator: [218, 234, 128, 15, 82, 33, 236, 253];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'caller';
              },
            ];
          };
        },
        {
          name: 'operator';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'arg';
                path: 'address';
              },
            ];
          };
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'operatorAddress';
          type: 'pubkey';
        },
        {
          name: 'role';
          type: {
            defined: {
              name: 'role';
            };
          };
        },
      ];
    },
    {
      name: 'initConfig';
      discriminator: [23, 235, 115, 232, 168, 96, 1, 231];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'caller';
              },
            ];
          };
        },
        {
          name: 'config';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'buyFee';
          type: 'u64';
        },
        {
          name: 'sellFee';
          type: 'u64';
        },
        {
          name: 'winningFee';
          type: 'u64';
        },
        {
          name: 'feeWallet';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'initTokenSupport';
      discriminator: [33, 104, 61, 38, 122, 96, 100, 248];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'caller';
              },
            ];
          };
        },
        {
          name: 'tokenSupport';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  115,
                  117,
                  112,
                  112,
                  111,
                  114,
                  116,
                ];
              },
            ];
          };
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'tokenSupportAddress';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'initialize';
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'administrator';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'arg';
                path: 'adminWallet';
              },
            ];
          };
        },
        {
          name: 'globalState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: 'vaultAuthority';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'adminWallet';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'matchOrders';
      discriminator: [17, 1, 201, 93, 7, 51, 251, 134];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'batcher';
              },
            ];
          };
        },
        {
          name: 'config';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: 'feeTokenAccount';
          writable: true;
        },
        {
          name: 'contractTokenAccount';
          writable: true;
        },
        {
          name: 'vaultAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'batcher';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'orders';
          type: {
            vec: 'pubkey';
          };
        },
        {
          name: 'matchingOrders';
          type: {
            vec: {
              vec: 'pubkey';
            };
          };
        },
      ];
    },
    {
      name: 'resolveEvent';
      discriminator: [184, 55, 78, 47, 114, 38, 50, 90];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'operator';
              },
            ];
          };
        },
        {
          name: 'event';
          writable: true;
        },
        {
          name: 'outcome';
          writable: true;
        },
        {
          name: 'operator';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'outcomeStatus';
          type: {
            defined: {
              name: 'outcomeStatus';
            };
          };
        },
      ];
    },
    {
      name: 'updateConfig';
      discriminator: [29, 158, 252, 191, 10, 83, 219, 99];
      accounts: [
        {
          name: 'administrator';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  100,
                  109,
                  105,
                  110,
                  105,
                  115,
                  116,
                  114,
                  97,
                  116,
                  111,
                  114,
                ];
              },
              {
                kind: 'account';
                path: 'caller';
              },
            ];
          };
        },
        {
          name: 'config';
          writable: true;
        },
        {
          name: 'caller';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'buyFee';
          type: 'u64';
        },
        {
          name: 'sellFee';
          type: 'u64';
        },
        {
          name: 'winningFee';
          type: 'u64';
        },
        {
          name: 'feeWallet';
          type: 'pubkey';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'administrator';
      discriminator: [17, 227, 133, 8, 44, 57, 118, 110];
    },
    {
      name: 'balance';
      discriminator: [127, 71, 25, 157, 105, 157, 241, 182];
    },
    {
      name: 'config';
      discriminator: [155, 12, 170, 224, 30, 250, 204, 130];
    },
    {
      name: 'event';
      discriminator: [125, 192, 125, 158, 9, 115, 152, 233];
    },
    {
      name: 'globalState';
      discriminator: [163, 46, 74, 168, 216, 123, 133, 98];
    },
    {
      name: 'order';
      discriminator: [134, 173, 223, 185, 77, 86, 28, 51];
    },
    {
      name: 'outcome';
      discriminator: [131, 46, 145, 156, 166, 15, 46, 131];
    },
    {
      name: 'tokenSupport';
      discriminator: [82, 96, 80, 86, 0, 138, 107, 111];
    },
    {
      name: 'totalClaim';
      discriminator: [146, 50, 162, 114, 134, 225, 46, 240];
    },
  ];
  events: [
    {
      name: 'claimEventEvent';
      discriminator: [20, 29, 127, 219, 185, 196, 133, 70];
    },
    {
      name: 'closeOrderEvent';
      discriminator: [160, 36, 189, 62, 234, 178, 31, 182];
    },
    {
      name: 'createOrderEvent';
      discriminator: [49, 142, 72, 166, 230, 29, 84, 84];
    },
    {
      name: 'eventCancelled';
      discriminator: [74, 193, 21, 191, 188, 43, 124, 129];
    },
    {
      name: 'eventCreated';
      discriminator: [59, 186, 199, 175, 242, 25, 238, 94];
    },
    {
      name: 'eventResolved';
      discriminator: [10, 219, 196, 209, 32, 58, 80, 212];
    },
    {
      name: 'matchOrderEvent';
      discriminator: [241, 88, 40, 50, 6, 222, 242, 144];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'eventExists';
      msg: 'Event already exists';
    },
    {
      code: 6001;
      name: 'outcomeExists';
      msg: 'Outcome already exists';
    },
    {
      code: 6002;
      name: 'unauthorized';
      msg: 'unauthorized';
    },
    {
      code: 6003;
      name: 'alreadyInitialized';
      msg: 'Already initialized';
    },
    {
      code: 6004;
      name: 'invalidBuyOrderInput';
      msg: 'Invalid Buy Order Input';
    },
    {
      code: 6005;
      name: 'invalidBuyOrderType';
      msg: 'Invalid Buy Order Type';
    },
    {
      code: 6006;
      name: 'invalidSellOrderInput';
      msg: 'Invalid Sell Order Input';
    },
    {
      code: 6007;
      name: 'invalidSellOrderType';
      msg: 'Invalid Sell Order Type';
    },
    {
      code: 6008;
      name: 'accountNotFound';
      msg: 'Account Not Found';
    },
    {
      code: 6009;
      name: 'invalidOrderStatus';
      msg: 'Invalid Order Status';
    },
    {
      code: 6010;
      name: 'invalidOrderOutcome';
      msg: 'Invalid Order Outcome';
    },
    {
      code: 6011;
      name: 'invalidPrice';
      msg: 'Invalid Price';
    },
    {
      code: 6012;
      name: 'invalidOwner';
      msg: 'Invalid Owner';
    },
    {
      code: 6013;
      name: 'invalidEventStatus';
      msg: 'Invalid Event Status';
    },
    {
      code: 6014;
      name: 'invalidOutcomeStatus';
      msg: 'Invalid Outcome Status';
    },
    {
      code: 6015;
      name: 'invalidBalance';
      msg: 'Invalid Balance';
    },
    {
      code: 6016;
      name: 'invalidEventOutcome';
      msg: 'Invalid Event Outcome';
    },
    {
      code: 6017;
      name: 'orderExpired';
      msg: 'Order Expired';
    },
    {
      code: 6018;
      name: 'invalidSignature';
      msg: 'Invalid Signature';
    },
    {
      code: 6019;
      name: 'noWonSharesToClaim';
      msg: 'No Won Shares To Claim';
    },
  ];
  types: [
    {
      name: 'administrator';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'administrator';
            type: 'pubkey';
          },
          {
            name: 'role';
            type: {
              defined: {
                name: 'role';
              };
            };
          },
        ];
      };
    },
    {
      name: 'balance';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'outcomeId';
            type: 'u64';
          },
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'long';
            type: 'u64';
          },
          {
            name: 'short';
            type: 'u64';
          },
          {
            name: 'initLong';
            type: 'u64';
          },
          {
            name: 'initShort';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'claimEventEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'eventId';
            type: 'u64';
          },
          {
            name: 'account';
            type: 'pubkey';
          },
          {
            name: 'outcomeId';
            type: 'u64';
          },
          {
            name: 'totalWinning';
            type: 'u64';
          },
          {
            name: 'returnAmount';
            type: 'u64';
          },
          {
            name: 'winningFee';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'closeOrderEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'orderId';
            type: 'u64';
          },
          {
            name: 'status';
            type: {
              defined: {
                name: 'orderStatus';
              };
            };
          },
        ];
      };
    },
    {
      name: 'config';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'buyFee';
            type: 'u64';
          },
          {
            name: 'sellFee';
            type: 'u64';
          },
          {
            name: 'winningFee';
            type: 'u64';
          },
          {
            name: 'feeWallet';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'createOrderEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'outcomeId';
            type: 'u64';
          },
          {
            name: 'orderId';
            type: 'u64';
          },
          {
            name: 'orderType';
            type: {
              defined: {
                name: 'orderType';
              };
            };
          },
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'value';
            type: 'u64';
          },
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'event';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'eventId';
            type: 'u64';
          },
          {
            name: 'outcomeId';
            type: 'u64';
          },
          {
            name: 'startTime';
            type: 'i64';
          },
          {
            name: 'endTime';
            type: 'i64';
          },
          {
            name: 'status';
            type: {
              defined: {
                name: 'eventStatus';
              };
            };
          },
        ];
      };
    },
    {
      name: 'eventCancelled';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'eventId';
            type: 'u64';
          },
          {
            name: 'eventStatus';
            type: {
              defined: {
                name: 'eventStatus';
              };
            };
          },
          {
            name: 'outcomeStatus';
            type: {
              defined: {
                name: 'outcomeStatus';
              };
            };
          },
        ];
      };
    },
    {
      name: 'eventCreated';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'eventId';
            type: 'u64';
          },
          {
            name: 'outcomeId';
            type: 'u64';
          },
          {
            name: 'startTime';
            type: 'i64';
          },
          {
            name: 'endTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'eventResolved';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'eventId';
            type: 'u64';
          },
          {
            name: 'eventStatus';
            type: {
              defined: {
                name: 'eventStatus';
              };
            };
          },
          {
            name: 'outcomeStatus';
            type: {
              defined: {
                name: 'outcomeStatus';
              };
            };
          },
        ];
      };
    },
    {
      name: 'eventStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'active';
          },
          {
            name: 'ended';
          },
          {
            name: 'cancelled';
          },
        ];
      };
    },
    {
      name: 'globalState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'initialize';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'matchOrderEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'matchOrderId';
            type: 'u64';
          },
          {
            name: 'beMatchedOrderId';
            type: 'u64';
          },
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'filledValue';
            type: 'u64';
          },
          {
            name: 'matchOrderStatus';
            type: {
              defined: {
                name: 'orderStatus';
              };
            };
          },
          {
            name: 'filledAmount';
            type: 'u64';
          },
          {
            name: 'fee';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'order';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'orderId';
            type: 'u64';
          },
          {
            name: 'orderType';
            type: {
              defined: {
                name: 'orderType';
              };
            };
          },
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'value';
            type: 'u64';
          },
          {
            name: 'outcomeId';
            type: 'u64';
          },
          {
            name: 'fillAmount';
            type: 'u64';
          },
          {
            name: 'fillValue';
            type: 'u64';
          },
          {
            name: 'status';
            type: {
              defined: {
                name: 'orderStatus';
              };
            };
          },
          {
            name: 'tokenAccount';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'orderStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'open';
          },
          {
            name: 'matched';
          },
          {
            name: 'filled';
          },
          {
            name: 'cancelled';
          },
        ];
      };
    },
    {
      name: 'orderType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'buyYes';
          },
          {
            name: 'buyNo';
          },
          {
            name: 'sellYes';
          },
          {
            name: 'sellNo';
          },
        ];
      };
    },
    {
      name: 'outcome';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'outcomeId';
            type: 'u64';
          },
          {
            name: 'status';
            type: {
              defined: {
                name: 'outcomeStatus';
              };
            };
          },
        ];
      };
    },
    {
      name: 'outcomeStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'active';
          },
          {
            name: 'won';
          },
          {
            name: 'lost';
          },
          {
            name: 'cancelled';
          },
        ];
      };
    },
    {
      name: 'role';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'operator';
          },
          {
            name: 'administrator';
          },
          {
            name: 'batcher';
          },
          {
            name: 'booker';
          },
        ];
      };
    },
    {
      name: 'tokenSupport';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'token';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'totalClaim';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'outcomeId';
            type: 'u64';
          },
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'totalClaim';
            type: 'u64';
          },
          {
            name: 'winningFee';
            type: 'u64';
          },
        ];
      };
    },
  ];
};
