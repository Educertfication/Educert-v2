// Deployment configuration for Celo Alfajores testnet
export const DEPLOYMENT_CONFIG = {
  network: 'celo-alfajores',
  chainId: 44787,
  rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  blockExplorer: 'https://celo-alfajores.blockscout.com',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
  },
  contracts: {
    Certificate: '0xA2efe1AC0aA3b2fCb53CCC9b2d110855F79415A5',
    AccountFactory: '0x6ae719435cAc9003bf49f4107d8a7C65F7E1e810',
    CourseManager: '0x360977e8eBe61af2Bbc2937FAE2F0297Ee8C6ad5',
    SampleInstitutionAccount: '0xaDAf107B49f360960b18Ad6DAC128fA81aB65091',
  },
  sampleData: {
    courseId: '1',
    courseName: 'Blockchain Fundamentals',
    coursePrice: '0.01',
    courseDuration: 30,
  },
  deployedAt: '2025-07-20T11:00:06.203Z',
} as const;

// Environment-specific configuration
export const getDeploymentConfig = () => {
  const env = process.env.NEXT_PUBLIC_NETWORK || 'celo-alfajores';
  
  switch (env) {
    case 'celo-alfajores':
      return DEPLOYMENT_CONFIG;
    case 'celo':
      // Mainnet configuration (to be added when deployed)
      return {
        ...DEPLOYMENT_CONFIG,
        network: 'celo',
        chainId: 42220,
        rpcUrl: 'https://forno.celo.org',
        blockExplorer: 'https://explorer.celo.org',
        contracts: {
          // Mainnet addresses will be added here
        },
      };
    default:
      return DEPLOYMENT_CONFIG;
  }
};

// Contract address getters
export const getContractAddress = (contractName: keyof typeof DEPLOYMENT_CONFIG.contracts) => {
  return DEPLOYMENT_CONFIG.contracts[contractName];
};

// Network configuration for wallet connection
export const NETWORK_CONFIG = {
  chainId: DEPLOYMENT_CONFIG.chainId,
  chainName: 'Celo Alfajores Testnet',
  nativeCurrency: DEPLOYMENT_CONFIG.nativeCurrency,
  rpcUrls: [DEPLOYMENT_CONFIG.rpcUrl],
  blockExplorerUrls: [DEPLOYMENT_CONFIG.blockExplorer],
};

export default DEPLOYMENT_CONFIG; 