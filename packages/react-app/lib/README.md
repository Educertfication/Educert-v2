# Educert v2 - React App Utilities

This directory contains utility files for interacting with the Educert smart contracts on the Celo blockchain.

## Files Overview

### `abis.ts`
Exports all contract ABIs for easy import in React components.

```typescript
import { ABIs, ContractName } from './utils/abis';

// Available contracts
const contractNames: ContractName[] = ['Certificate', 'AccountFactory', 'CourseManager', 'UserAccount'];
```

### `deployment.ts`
Contains deployment configuration including contract addresses and network settings.

```typescript
import { DEPLOYMENT_CONFIG, getContractAddress } from './utils/deployment';

// Get contract address
const factoryAddress = getContractAddress('AccountFactory');

// Network configuration for wallet connection
const networkConfig = DEPLOYMENT_CONFIG;
```

### `contracts.ts`
Provides helper classes and functions for contract interactions.

```typescript
import { ContractInteractions, createContractInstance } from './utils/contracts';

// Create contract interactions instance
const interactions = new ContractInteractions(signer);

// Create account
await interactions.createAccount('University Name', 365);

// Get user account
const accountAddress = await interactions.getUserAccount(userAddress);
```

## Contract Addresses (Celo Alfajores)

| Contract | Address |
|----------|---------|
| Certificate | `0xA2efe1AC0aA3b2fCb53CCC9b2d110855F79415A5` |
| AccountFactory | `0x6ae719435cAc9003bf49f4107d8a7C65F7E1e810` |
| CourseManager | `0x360977e8eBe61af2Bbc2937FAE2F0297Ee8C6ad5` |
| Sample Institution | `0xaDAf107B49f360960b18Ad6DAC128fA81aB65091` |

## Network Configuration

- **Network**: Celo Alfajores Testnet
- **Chain ID**: 44787
- **RPC URL**: `https://alfajores-forno.celo-testnet.org`
- **Block Explorer**: `https://celo-alfajores.blockscout.com`
- **Native Currency**: CELO

## Usage Examples

### 1. Creating an Institution Account

```typescript
import { ContractInteractions } from './utils/contracts';

const interactions = new ContractInteractions(signer);

try {
  const tx = await interactions.createAccount('My University', 365);
  console.log('Account created:', tx);
} catch (error) {
  console.error('Failed to create account:', error);
}
```

### 2. Creating a Course

```typescript
const userAccountAddress = await interactions.getUserAccount(signer.address);

const tx = await interactions.createCourse(
  userAccountAddress,
  'Blockchain Fundamentals',
  'Learn the basics of blockchain technology',
  'https://ipfs.io/course/blockchain-fundamentals',
  '0.01', // 0.01 CELO
  30, // 30 days
  true // requires assessment
);
```

### 3. Enrolling in a Course

```typescript
// Enroll in course with ID 1
const tx = await interactions.enrollInCourse(1);
console.log('Enrolled in course:', tx);
```

### 4. Completing a Course

```typescript
// Complete course with ID 1
const tx = await interactions.completeCourse(1);
console.log('Course completed:', tx);
```

### 5. Issuing a Certificate

```typescript
// Issue certificate for student
const tx = await interactions.issueCertificate(
  userAccountAddress,
  1, // course ID
  studentAddress
);
console.log('Certificate issued:', tx);
```

### 6. Checking Certificate Balance

```typescript
const balance = await interactions.getCertificateBalance(
  studentAddress,
  1 // certificate ID
);
console.log('Certificate balance:', balance);
```

## Error Handling

The utilities include comprehensive error handling:

```typescript
import { handleContractError, ContractError } from './utils/contracts';

try {
  await interactions.createAccount('Test', 365);
} catch (error) {
  const contractError = handleContractError(error);
  console.error('Contract error:', contractError.message);
}
```

## Event Listening

Listen to contract events:

```typescript
import { createEventFilter } from './utils/contracts';

// Listen to AccountCreated events
const filter = createEventFilter('AccountFactory', 'AccountCreated');
const events = await contract.queryFilter(filter);
```

## Transaction Helpers

Utility functions for transaction handling:

```typescript
import { formatEther, parseEther, waitForTransaction } from './utils/contracts';

// Format wei to ether
const etherAmount = formatEther(weiAmount);

// Parse ether to wei
const weiAmount = parseEther('0.01');

// Wait for transaction
const receipt = await waitForTransaction(txHash, provider);
```

## ABI Files

The `abis/` directory contains individual JSON files for each contract:

- `Certificate.json` - ERC1155 certificate contract
- `AccountFactory.json` - Factory for creating institution accounts
- `CourseManager.json` - Course management and enrollment
- `UserAccount.json` - Institution-specific account contract

## Testing

To test the utilities:

1. Connect to Celo Alfajores testnet
2. Ensure you have test CELO tokens
3. Use the sample institution account for testing
4. Test course creation, enrollment, and certificate issuance

## Deployment

The contracts are deployed and verified on Celo Alfajores. You can view them on the block explorer:

- [Certificate Contract](https://celo-alfajores.blockscout.com/address/0xA2efe1AC0aA3b2fCb53CCC9b2d110855F79415A5)
- [AccountFactory Contract](https://celo-alfajores.blockscout.com/address/0x6ae719435cAc9003bf49f4107d8a7C65F7E1e810)
- [CourseManager Contract](https://celo-alfajores.blockscout.com/address/0x360977e8eBe61af2Bbc2937FAE2F0297Ee8C6ad5)

## Notes

- All transactions require CELO for gas fees
- UserAccount contracts are created dynamically by the AccountFactory
- Certificate NFTs are non-transferable
- Course creators must be authorized before creating courses
- All contract interactions require proper error handling 