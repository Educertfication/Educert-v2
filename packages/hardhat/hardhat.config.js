require("dotenv").config({ path: ".env" });
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
// require("hardhat-celo"); // Removed to fix verify task conflict
require("@nomicfoundation/hardhat-verify");

const defaultNetwork = "hardhat";

// This is the mnemonic used by celo-devchain
const DEVCHAIN_MNEMONIC =
  "concert load couple harbor equip island argue ramp clarify fence smart topic";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork,
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: DEVCHAIN_MNEMONIC,
      },
    },
    'celo-alfajores': {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 44787,
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42220,
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: 0,
    alice: 1,
    bob: 2,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deployments: "./deployments",
  },
  etherscan: {
    apiKey: {
      'celo-alfajores': 'empty'
    },
    customChains: [
      {
        network: "celo-alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://celo-alfajores.blockscout.com/api",
          browserURL: "https://celo-alfajores.blockscout.com"
        }
      }
    ]
  },
};

// Task definitions below the config export
const { task } = require("hardhat/config");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

task(
  "devchain-keys",
  "Prints the private keys associated with the devchain",
  async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    const hdNode = hre.ethers.HDNodeWallet.fromMnemonic(
      hre.ethers.Mnemonic.fromPhrase(DEVCHAIN_MNEMONIC)
    );
    for (let i = 0; i < accounts.length; i++) {
      const account = hdNode.derivePath(`m/44'/60'/0'/0/${i}`);
      console.log(
        `Account ${i}\nAddress: ${account.address}\nKey: ${account.privateKey}`
      );
    }
  }
);

task("create-account", "Prints a new private key", async (taskArgs, hre) => {
  const wallet = hre.ethers.Wallet.createRandom();
  console.log(`PRIVATE_KEY="${wallet.privateKey}"`);
  console.log(`Your account address: ${wallet.address}`);
});

task(
  "print-account",
  "Prints the address of the account associated with the private key in .env file",
  async (taskArgs, hre) => {
    if (!process.env.PRIVATE_KEY) {
      console.error("PRIVATE_KEY not set in .env");
      return;
    }
    const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY);
    console.log(`Account: ${wallet.address}`);
  }
);