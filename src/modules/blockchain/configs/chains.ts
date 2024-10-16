export const CHAINS = {
  1: {
    chainId: 1,
    isMainnet: true,
    name: 'Ethereum Mainnet',
    url: 'https://crimson-winter-sun.quiknode.pro/61be3a327202898dfb8894b6d25731af801c98bf',
    explorerUrl: 'https://etherscan.io',
  },
  5: {
    chainId: 5,
    isMainnet: false,
    name: 'Ethereum Goerli Testnet',
    url: 'https://eth-goerli.api.onfinality.io/public',
    explorerUrl: 'https://goerli.etherscan.io',
  },
  168587773: {
    chainId: 168587773,
    isMainnet: false,
    name: 'Blast Testnet',
    url: 'https://sepolia.blast.io',
    explorerUrl: 'https://testnet.blastscan.io',
  },
  1010: {
    chainId: 101,
    isMainnet: false,
    name: 'Solana Devnet',
    url: process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com',
    explorerUrl: 'https://testnet.blastscan.io',
  },
  101: {
    chainId: 101,
    isMainnet: true,
    name: 'Solana Mainnet',
    url: process.env.SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
  },
};

export const SOLANA_RPC_ENDPOINT =
  process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com';
