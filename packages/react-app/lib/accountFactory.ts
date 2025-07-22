import { ethers } from 'ethers';
import AccountFactoryABI from './AccountFactory.json';

export interface Account {
  name: string;
  accountAddress: string;
  createdAt: number;
  isActive: boolean;
}

export interface CreateAccountParams {
  name: string;
  duration: number;
}

export class AccountFactoryService {
  private contractAddress: string;
  private abi: any;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
    this.abi = AccountFactoryABI;
  }

  // Create transaction data for createAccount
  createAccountTransaction(params: CreateAccountParams) {
    const iface = new ethers.utils.Interface(this.abi);
    const data = iface.encodeFunctionData('createAccount', [params.name, params.duration]);
    
    return {
      to: this.contractAddress,
      data: data,
    };
  }

  // Create transaction data for setCourseManager (AccountFactory - admin only)
  setCourseManagerTransaction(courseManagerAddress: string) {
    const iface = new ethers.utils.Interface(this.abi);
    const data = iface.encodeFunctionData('setCourseManager', [courseManagerAddress]);
    
    return {
      to: this.contractAddress,
      data: data,
    };
  }

  // Create transaction data for setCourseManager on UserAccount (institution users)
  setUserAccountCourseManagerTransaction(userAccountAddress: string, courseManagerAddress: string) {
    // UserAccount ABI for setCourseManager function
    const userAccountABI = [
      "function setCourseManager(address _courseManagerAddress) external"
    ];
    const iface = new ethers.utils.Interface(userAccountABI);
    const data = iface.encodeFunctionData('setCourseManager', [courseManagerAddress]);
    
    return {
      to: userAccountAddress,
      data: data,
    };
  }

  // Create transaction data for deactivateAccount
  deactivateAccountTransaction(userAddress: string) {
    const iface = new ethers.utils.Interface(this.abi);
    const data = iface.encodeFunctionData('deactivateAccount', [userAddress]);
    
    return {
      to: this.contractAddress,
      data: data,
    };
  }

  // Create transaction data for activateAccount
  activateAccountTransaction(userAddress: string) {
    const iface = new ethers.utils.Interface(this.abi);
    const data = iface.encodeFunctionData('activateAccount', [userAddress]);
    
    return {
      to: this.contractAddress,
      data: data,
    };
  }

  // Create transaction data for pause
  pauseTransaction() {
    const iface = new ethers.utils.Interface(this.abi);
    const data = iface.encodeFunctionData('pause');
    
    return {
      to: this.contractAddress,
      data: data,
    };
  }

  // Create transaction data for unpause
  unpauseTransaction() {
    const iface = new ethers.utils.Interface(this.abi);
    const data = iface.encodeFunctionData('unpause');
    
    return {
      to: this.contractAddress,
      data: data,
    };
  }

  // For read operations, we'll need a provider
  private getProvider() {
    // For demo purposes, we'll use a public provider
    // In production, you might want to use a more reliable provider
    return new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
  }

  // Get all accounts (read operation)
  async getAllAccounts(): Promise<Account[]> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      const accounts = await contract.getAllAccounts();
      return accounts.map((account: any) => ({
        name: account.name,
        accountAddress: account.accountAddress,
        createdAt: account.createdAt.toNumber(),
        isActive: account.isActive,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get account by user address (read operation)
  async getAccount(userAddress: string): Promise<Account> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      const account = await contract.getAccount(userAddress);
      return {
        name: account.name,
        accountAddress: account.accountAddress,
        createdAt: account.createdAt.toNumber(),
        isActive: account.isActive,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user account address (read operation)
  async getUserAccount(userAddress: string): Promise<string> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      return await contract.getUserAccount(userAddress);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check if user has account (read operation)
  async hasUserAccount(userAddress: string): Promise<boolean> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      return await contract.hasUserAccount(userAddress);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check if account is authorized (read operation)
  async isAccountAuthorized(accountAddress: string): Promise<boolean> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      return await contract.isAccountAuthorized(accountAddress);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get total accounts (read operation)
  async getTotalAccounts(): Promise<number> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      const result = await contract.getTotalAccounts();
      return result.toNumber();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get active accounts (read operation)
  async getActiveAccounts(): Promise<Account[]> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      const accounts = await contract.getActiveAccounts();
      return accounts.map((account: any) => ({
        name: account.name,
        accountAddress: account.accountAddress,
        createdAt: account.createdAt.toNumber(),
        isActive: account.isActive,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get account contract state (read operation)
  async getAccountContractState(contractAccount: string): Promise<boolean> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      return await contract.getAccountContractState(contractAccount);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get owner (read operation)
  async getOwner(): Promise<string> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      return await contract.owner();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check if paused (read operation)
  async isPaused(): Promise<boolean> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      return await contract.paused();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get course manager address (read operation)
  async getCourseManagerAddress(): Promise<string> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      return await contract.courseManagerAddress();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get NFT address (read operation)
  async getNftAddress(): Promise<string> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(this.contractAddress, this.abi, provider);
      return await contract.nftAddress();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get course manager address from UserAccount (read operation)
  async getUserAccountCourseManager(userAccountAddress: string): Promise<string> {
    try {
      const provider = this.getProvider();
      // UserAccount ABI for courseManagerAddress
      const userAccountABI = [
        "function courseManagerAddress() external view returns (address)"
      ];
      const contract = new ethers.Contract(userAccountAddress, userAccountABI, provider);
      return await contract.courseManagerAddress();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    console.error('AccountFactory service error:', error);
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unknown error occurred');
  }
}

export const createAccountFactoryService = (
  contractAddress: string
): AccountFactoryService => {
  return new AccountFactoryService(contractAddress);
}; 