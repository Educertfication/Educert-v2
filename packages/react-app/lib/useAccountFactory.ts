import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAppStore, useAccounts, useAccountFactoryState } from './store';
import { AccountFactoryService, Account, CreateAccountParams } from './accountFactory';
import { demoAccounts, demoFactoryState } from './demoData';
import { usePrivyAuth } from './usePrivyAuth';

// Contract address - this should come from environment or deployment config
const ACCOUNT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_ACCOUNT_FACTORY_ADDRESS || '';

export const useAccountFactory = () => {
  const [service, setService] = useState<AccountFactoryService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    setAccounts, 
    addAccount, 
    updateAccount, 
    setAccountFactoryState,
    addNotification,
    setLoading,
    setError 
  } = useAppStore();
  
  const accounts = useAccounts();
  const factoryState = useAccountFactoryState();
  const { authenticated, sendTransaction } = usePrivyAuth();

  // Load factory state
  const loadFactoryState = useCallback(async (accountFactoryService: AccountFactoryService) => {
    try {
      const [owner, paused, courseManagerAddress, nftAddress, totalAccounts] = await Promise.all([
        accountFactoryService.getOwner(),
        accountFactoryService.isPaused(),
        accountFactoryService.getCourseManagerAddress(),
        accountFactoryService.getNftAddress(),
        accountFactoryService.getTotalAccounts(),
      ]);

      setAccountFactoryState({
        owner,
        paused,
        courseManagerAddress,
        nftAddress,
        totalAccounts,
      });
    } catch (error) {
      console.error('Failed to load factory state:', error);
    }
  }, [setAccountFactoryState]);

  // Load all accounts
  const loadAccounts = useCallback(async (accountFactoryService: AccountFactoryService) => {
    try {
      const accounts = await accountFactoryService.getAllAccounts();
      setAccounts(accounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  }, [setAccounts]);

  // Initialize service when wallet is available
  const initializeService = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (isInitialized) {
      console.log('Service already initialized, skipping...');
      return;
    }

    try {
      console.log('Initializing AccountFactory service...', { 
        hasContractAddress: !!ACCOUNT_FACTORY_ADDRESS, 
        authenticated
      });

      // For demo purposes, load demo data if no contract address is configured
      if (!ACCOUNT_FACTORY_ADDRESS) {
        console.log('Loading demo data for AccountFactory...');
        setAccounts(demoAccounts);
        setAccountFactoryState(demoFactoryState);
        setIsInitialized(true);
        return;
      }

      console.log('Creating AccountFactory service...');
      const accountFactoryService = new AccountFactoryService(ACCOUNT_FACTORY_ADDRESS);
      setService(accountFactoryService);
      setIsInitialized(true);
      
      console.log('Loading initial state...');
      // Load initial state
      await loadFactoryState(accountFactoryService);
      await loadAccounts(accountFactoryService);
      console.log('AccountFactory service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AccountFactory service:', error);
      // Fallback to demo data
      setAccounts(demoAccounts);
      setAccountFactoryState(demoFactoryState);
      setIsInitialized(true);
      setError('Failed to initialize AccountFactory service, using demo data');
    }
  }, [isInitialized, setError, setAccounts, setAccountFactoryState, loadFactoryState, loadAccounts]);

  // Initialize on mount only
  useEffect(() => {
    if (!isInitialized && !service) {
      console.log('Initial mount - initializing service...');
      initializeService();
    }
  }, []); // Empty dependency array - only run on mount

  // Re-initialize when authentication state changes (but only if not already initialized)
  useEffect(() => {
    if (authenticated && !isInitialized && !service) {
      console.log('Authentication changed - initializing service...');
      initializeService();
    }
  }, [authenticated, isInitialized, service, initializeService]);

  // Get user's specific account
  const getUserAccount = useCallback(async (userAddress: string) => {
    if (!isInitialized) {
      throw new Error('AccountFactory service not initialized');
    }

    try {
      if (service) {
        const account = await service.getAccount(userAddress);
        return account;
      } else {
        // Demo mode - find in local accounts
        return accounts.find(acc => acc.accountAddress.toLowerCase() === userAddress.toLowerCase()) || null;
      }
    } catch (error) {
      console.error('Failed to get user account:', error);
      return null;
    }
  }, [isInitialized, service, accounts]);

  // Check if user has an account
  const hasUserAccount = useCallback(async (userAddress: string) => {
    if (!isInitialized) {
      return false;
    }

    try {
      if (service) {
        return await service.hasUserAccount(userAddress);
      } else {
        // Demo mode - check in local accounts
        return accounts.some(acc => acc.accountAddress.toLowerCase() === userAddress.toLowerCase());
      }
    } catch (error) {
      console.error('Failed to check if user has account:', error);
      return false;
    }
  }, [isInitialized, service, accounts]);

  // Get course manager address from UserAccount
  const getUserAccountCourseManager = useCallback(async (userAccountAddress: string) => {
    if (!isInitialized) {
      throw new Error('AccountFactory service not initialized');
    }

    try {
      if (service) {
        const courseManagerAddress = await service.getUserAccountCourseManager(userAccountAddress);
        return courseManagerAddress;
      } else {
        // Demo mode - return demo course manager address
        return '0x1234567890123456789012345678901234567890';
      }
    } catch (error) {
      console.error('Failed to get user account course manager:', error);
      return null;
    }
  }, [isInitialized, service]);

  // Create account
  const createAccount = useCallback(async (params: CreateAccountParams) => {
    console.log('Creating account...', { isInitialized, hasService: !!service, params });
    
    if (!isInitialized) {
      console.error('Service not initialized, attempting to initialize...');
      try {
        await initializeService();
      } catch (error) {
        console.error('Failed to initialize service:', error);
        throw new Error('AccountFactory service not initialized');
      }
    }

    setLoading(true);
    try {
      if (service && authenticated) {
        // Real contract interaction using Privy
        console.log('Using real contract service with Privy...');
        const transaction = service.createAccountTransaction(params);
        const result = await sendTransaction(transaction);
        console.log('Transaction result:', result);
        
        // Wait a bit for the transaction to be processed, then refresh data
        setTimeout(async () => {
          await loadAccounts(service);
        }, 2000);
      } else {
        // Demo mode - simulate account creation
        console.log('Using demo mode...');
        const newAccount: Account = {
          name: params.name,
          accountAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          createdAt: Math.floor(Date.now() / 1000),
          isActive: true,
        };
        addAccount(newAccount);
      }
      
      addNotification({
        type: 'success',
        title: 'Account Created',
        message: `Account "${params.name}" has been successfully created!`
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      console.error('Account creation failed:', error);
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isInitialized, service, loadAccounts, addAccount, addNotification, setError, setLoading, initializeService, authenticated, sendTransaction]);

  // Set course manager (owner only)
  const setCourseManager = useCallback(async (courseManagerAddress: string) => {
    if (!isInitialized) {
      throw new Error('AccountFactory service not initialized');
    }

    setLoading(true);
    try {
      if (service && authenticated) {
        // Real contract interaction using Privy
        const transaction = service.setCourseManagerTransaction(courseManagerAddress);
        await sendTransaction(transaction);
      }
      
      // Update factory state
      setAccountFactoryState({ courseManagerAddress });
      
      addNotification({
        type: 'success',
        title: 'Course Manager Set',
        message: 'Course manager address has been updated successfully!'
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set course manager';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isInitialized, service, setAccountFactoryState, addNotification, setError, setLoading, authenticated, sendTransaction]);

  // Set course manager on UserAccount (institution users)
  const setUserAccountCourseManager = useCallback(async (userAccountAddress: string, courseManagerAddress: string) => {
    if (!isInitialized) {
      throw new Error('AccountFactory service not initialized');
    }

    setLoading(true);
    try {
      if (service && authenticated) {
        // Real contract interaction using Privy - call UserAccount contract
        const transaction = service.setUserAccountCourseManagerTransaction(userAccountAddress, courseManagerAddress);
        await sendTransaction(transaction);
      }
      
      addNotification({
        type: 'success',
        title: 'Course Manager Set',
        message: 'Course manager has been set for your institution successfully!'
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set course manager';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isInitialized, service, addNotification, setError, setLoading, authenticated, sendTransaction]);

  // Deactivate account (owner only)
  const deactivateAccount = useCallback(async (userAddress: string) => {
    if (!isInitialized) {
      throw new Error('AccountFactory service not initialized');
    }

    setLoading(true);
    try {
      if (service && authenticated) {
        // Real contract interaction using Privy
        const transaction = service.deactivateAccountTransaction(userAddress);
        await sendTransaction(transaction);
      }
      
      // Update account in store
      updateAccount(userAddress, { isActive: false });
      
      addNotification({
        type: 'success',
        title: 'Account Deactivated',
        message: 'Account has been deactivated successfully!'
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate account';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isInitialized, service, updateAccount, addNotification, setError, setLoading, authenticated, sendTransaction]);

  // Activate account (owner only)
  const activateAccount = useCallback(async (userAddress: string) => {
    if (!isInitialized) {
      throw new Error('AccountFactory service not initialized');
    }

    setLoading(true);
    try {
      if (service && authenticated) {
        // Real contract interaction using Privy
        const transaction = service.activateAccountTransaction(userAddress);
        await sendTransaction(transaction);
      }
      
      // Update account in store
      updateAccount(userAddress, { isActive: true });
      
      addNotification({
        type: 'success',
        title: 'Account Activated',
        message: 'Account has been activated successfully!'
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate account';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isInitialized, service, updateAccount, addNotification, setError, setLoading, authenticated, sendTransaction]);

  // Pause factory (owner only)
  const pauseFactory = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('AccountFactory service not initialized');
    }

    setLoading(true);
    try {
      if (service && authenticated) {
        // Real contract interaction using Privy
        const transaction = service.pauseTransaction();
        await sendTransaction(transaction);
      }
      
      setAccountFactoryState({ paused: true });
      
      addNotification({
        type: 'success',
        title: 'Factory Paused',
        message: 'Account factory has been paused successfully!'
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pause factory';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isInitialized, service, setAccountFactoryState, addNotification, setError, setLoading, authenticated, sendTransaction]);

  // Unpause factory (owner only)
  const unpauseFactory = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('AccountFactory service not initialized');
    }

    setLoading(true);
    try {
      if (service && authenticated) {
        // Real contract interaction using Privy
        const transaction = service.unpauseTransaction();
        await sendTransaction(transaction);
      }
      
      setAccountFactoryState({ paused: false });
      
      addNotification({
        type: 'success',
        title: 'Factory Unpaused',
        message: 'Account factory has been unpaused successfully!'
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unpause factory';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isInitialized, service, setAccountFactoryState, addNotification, setError, setLoading, authenticated, sendTransaction]);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      if (service) {
        await Promise.all([
          loadFactoryState(service),
          loadAccounts(service)
        ]);
      } else {
        // Demo mode - reload demo data
        setAccounts(demoAccounts);
        setAccountFactoryState(demoFactoryState);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [isInitialized, service, loadFactoryState, loadAccounts, setAccounts, setAccountFactoryState]);

  return {
    // State
    accounts,
    factoryState,
    isInitialized,
    
    // Actions
    initializeService,
    createAccount,
    setCourseManager,
    setUserAccountCourseManager,
    deactivateAccount,
    activateAccount,
    pauseFactory,
    unpauseFactory,
    refreshData,
    getUserAccount,
    getUserAccountCourseManager,
    hasUserAccount,
    
    // Utilities
    getActiveAccounts: () => accounts.filter(account => account.isActive),
    getInactiveAccounts: () => accounts.filter(account => !account.isActive),
  };
}; 