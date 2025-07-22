// import { ethers } from 'ethers';
// import { ABIs, ContractName } from './abis';
// import { DEPLOYMENT_CONFIG } from './deployment';

// // Contract instance types
// export type ContractInstance = ethers.Contract;

// // Contract configuration type
// export interface ContractConfig {
//   address: string;
//   abi: any;
//   signer?: ethers.Signer;
// }

// // Get contract configuration
// export const getContractConfig = (contractName: ContractName): ContractConfig => {
//   // Handle UserAccount contracts which don't have a fixed address
//   if (contractName === 'UserAccount') {
//     throw new Error('UserAccount contracts are created dynamically. Use the specific address.');
//   }
  
//   const address = DEPLOYMENT_CONFIG.contracts[contractName];
//   if (!address) {
//     throw new Error(`Contract address not found for ${contractName}`);
//   }
  
//   return {
//     address,
//     abi: ABIs[contractName],
//   };
// };

// // Create contract instance
// export const createContractInstance = (
//   contractName: ContractName,
//   signer?: ethers.Signer
// ): ContractInstance => {
//   const config = getContractConfig(contractName);
//   const provider = signer?.provider || ethers.getDefaultProvider(DEPLOYMENT_CONFIG.rpcUrl);
  
//   return new ethers.Contract(
//     config.address,
//     config.abi,
//     signer || provider
//   );
// };

// // Contract interaction helpers
// export class ContractInteractions {
//   private signer: ethers.Signer;
//   private provider: ethers.providers.Provider;

//   constructor(signer: ethers.Signer) {
//     this.signer = signer;
//     this.provider = signer.provider!;
//   }

//   // Account Factory interactions
//   async createAccount(name: string, duration: number) {
//     const factory = createContractInstance('AccountFactory', this.signer);
//     const tx = await factory.createAccount(name, duration);
//     return await tx.wait();
//   }

//   async getUserAccount(userAddress: string): Promise<string> {
//     const factory = createContractInstance('AccountFactory', this.signer);
//     return await factory.getUserAccount(userAddress);
//   }

//   async hasUserAccount(userAddress: string): Promise<boolean> {
//     const factory = createContractInstance('AccountFactory', this.signer);
//     return await factory.hasUserAccount(userAddress);
//   }

//   // Course Manager interactions
//   async getCourse(courseId: number) {
//     const courseManager = createContractInstance('CourseManager', this.signer);
//     return await courseManager.getCourse(courseId);
//   }

//   async getActiveCourses() {
//     const courseManager = createContractInstance('CourseManager', this.signer);
//     return await courseManager.getActiveCourses();
//   }

//   async enrollInCourse(courseId: number) {
//     const courseManager = createContractInstance('CourseManager', this.signer);
//     const tx = await courseManager.enrollInCourse(courseId);
//     return await tx.wait();
//   }

//   async completeCourse(courseId: number) {
//     const courseManager = createContractInstance('CourseManager', this.signer);
//     const tx = await courseManager.completeCourse(courseId);
//     return await tx.wait();
//   }

//   // User Account interactions (for institutions)
//   async createCourse(
//     userAccountAddress: string,
//     name: string,
//     description: string,
//     courseUri: string,
//     price: string,
//     duration: number,
//     requiresAssessment: boolean
//   ) {
//     const userAccount = new ethers.Contract(
//       userAccountAddress,
//       ABIs.UserAccount,
//       this.signer
//     );
    
//     const tx = await userAccount.createCourse(
//       name,
//       description,
//       courseUri,
//       ethers.utils.parseEther(price),
//       duration,
//       requiresAssessment
//     );
//     return await tx.wait();
//   }

//   async issueCertificate(
//     userAccountAddress: string,
//     courseId: number,
//     studentAddress: string
//   ) {
//     const userAccount = new ethers.Contract(
//       userAccountAddress,
//       ABIs.UserAccount,
//       this.signer
//     );
    
//     const tx = await userAccount.issueCertificateForCourse(courseId, studentAddress);
//     return await tx.wait();
//   }

//   // Certificate interactions
//   async getCertificateBalance(account: string, certificateId: number): Promise<number> {
//     const certificate = createContractInstance('Certificate', this.signer);
//     const balance = await certificate.balanceOf(account, certificateId);
//     return Number(balance);
//   }

//   // Utility functions
//   async getAccountBalance(address: string): Promise<string> {
//     const balance = await this.provider.getBalance(address);
//     return ethers.utils.formatEther(balance);
//   }

//   async getNetworkInfo() {
//     const network = await this.provider.getNetwork();
//     return {
//       chainId: network.chainId,
//       name: network.name,
//     };
//   }
// }

// // Event listeners
// export const createEventFilter = (
//   contractName: ContractName,
//   eventName: string,
//   fromBlock?: number
// ) => {
//   const contract = createContractInstance(contractName);
//   return contract.filters[eventName]();
// };

// // Transaction helpers
// export const waitForTransaction = async (txHash: string, provider: ethers.providers.Provider) => {
//   return await provider.waitForTransaction(txHash);
// };

// export const formatEther = (wei: ethers.BigNumberish): string => {
//   return ethers.utils.formatEther(wei);
// };

// export const parseEther = (ether: string): ethers.BigNumber => {
//   return ethers.utils.parseEther(ether);
// };

// // Error handling
// export class ContractError extends Error {
//   constructor(message: string, public code?: string, public data?: any) {
//     super(message);
//     this.name = 'ContractError';
//   }
// }

// export const handleContractError = (error: any): ContractError => {
//   if (error.code === 'ACTION_REJECTED') {
//     return new ContractError('Transaction was rejected by user');
//   }
  
//   if (error.code === 'INSUFFICIENT_FUNDS') {
//     return new ContractError('Insufficient funds for transaction');
//   }
  
//   if (error.reason) {
//     return new ContractError(error.reason, error.code, error.data);
//   }
  
//   return new ContractError(error.message || 'Unknown contract error');
// };

// export default ContractInteractions; 