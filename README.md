# EduCert - Certificate Verification Platform

A decentralized platform for issuing and verifying certificates on the Celo blockchain.

## Features

- Anyone can create an account
- Each address can only create one account
- Certificate issuance and verification
- Role-based access control
- Non-transferable certificates

## Smart Contracts

### AccountFactory Contract
- Allows anyone to create an account
- Manages account creation and status
- Stores account details (name, role, creation time)
- Owner can deactivate/reactivate accounts

### Certificate Contract
- ERC1155-based certificate tokens
- Non-transferable certificates
- Only authorized accounts can mint/burn certificates

### UserAccount Contract
- **Network**: Celo Alfajores Testnet
- **Contract Address**: `0x6CFAB81a5992e057038aa3Eb95908Bb41F6e9891`
- **Deployer**: `0x62Bc8aE3c235dEd14Ebf9Fe8F72e827204c4EFE4`
- **Verification**: [View on Blockscout](https://celo-alfajores.blockscout.com/address/0x6CFAB81a5992e057038aa3Eb95908Bb41F6e9891#code)

## Contract Deployments

### Certificate Contract
- **Network**: Celo Alfajores Testnet
- **Contract Address**: `0x73bb8f35F79e7472Af9E5657e8DCD15b22E8B7C6`
- **Deployer**: `0x62Bc8aE3c235dEd14Ebf9Fe8F72e827204c4EFE4`
- **Verification**: [View on Blockscout](https://celo-alfajores.blockscout.com/address/0x73bb8f35F79e7472Af9E5657e8DCD15b22E8B7C6#code)

### AccountFactory Contract
- **Network**: Celo Alfajores Testnet
- **Contract Address**: `0x504195e2a73A2Cd0f3c691e49ADC93E509cFdA79`
- **Deployer**: `0x62Bc8aE3c235dEd14Ebf9Fe8F72e827204c4EFE4`
- **Verification**: [View on Blockscout](https://celo-alfajores.blockscout.com/address/0x504195e2a73A2Cd0f3c691e49ADC93E509cFdA79#code)

## Deployment

### Prerequisites
- Node.js and Yarn
- A wallet with CELO tokens for deployment
- Private key for deployment

### Environment Setup
1. Create a `.env` file in the `packages/hardhat` directory:
```
PRIVATE_KEY=your_private_key_here
```

### Deployment Steps

1. Install dependencies:
```bash
yarn install
```

2. Deploy contracts to Celo Alfajores testnet:
```bash
cd packages/hardhat
yarn hardhat run scripts/deploy-factory.js --network celo-alfajores
```

3. After deployment, you'll get:
- Certificate Contract: `0x73bb8f35F79e7472Af9E5657e8DCD15b22E8B7C6`
- AccountFactory Contract: `0x504195e2a73A2Cd0f3c691e49ADC93E509cFdA79`

### Creating an Account

Anyone can create an account by calling the `createAccount` function:
```solidity
function createAccount(string memory _name, string memory _role) external
```

Parameters:
- `_name`: The name of the account holder
- `_role`: The role assigned to the account

Example using ethers.js:
```javascript
const factory = new ethers.Contract(factoryAddress, factoryABI, signer);
await factory.createAccount("John Doe", "Student");
```

### Account Management

1. Check Account Status:
```solidity
function getAccountDetails(address _account) external view returns (
    bool isActive,
    string memory name,
    string memory role,
    uint256 createdAt
)
```

2. Deactivate Account (Owner only):
```solidity
function deactivateAccount(address _account) external onlyOwner
```

3. Reactivate Account (Owner only):
```solidity
function reactivateAccount(address _account) external onlyOwner
```

## Development

### Local Development
1. Start local blockchain:
```bash
yarn hardhat node
```

2. Deploy to local network:
```bash
yarn hardhat run scripts/deploy-factory.js --network localhost
```

### Testing
```bash
yarn hardhat test
```

## Security

- Only authorized accounts can mint/burn certificates
- Owner can manage account status
- Non-transferable certificates
- Input validation for all functions

## License

This project is licensed under the MIT License - see the LICENSE file for details. 