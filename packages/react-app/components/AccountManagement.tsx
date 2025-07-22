import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import CreateAccountModal, { CreateAccountFormData } from './CreateAccountModal';
import { 
  UserPlus, 
  Building2, 
  Users, 
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Shield,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Lock
} from 'lucide-react';
import { useAccountFactory } from '../lib/useAccountFactory';
import { useUser, useLoading, Account, useAppStore } from '../lib/store';
import { usePrivyAuth } from '../lib/usePrivyAuth';

interface AccountManagementProps {
  userType: 'admin' | 'institution';
}

export default function AccountManagement({ userType }: AccountManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courseManagerAddress, setCourseManagerAddress] = useState('');
  const [userAccount, setUserAccount] = useState<Account | null>(null);
  const [showCourseManagerModal, setShowCourseManagerModal] = useState(false);
  const [userCourseManagerAddress, setUserCourseManagerAddress] = useState<string>('');
  const [userHasAccount, setUserHasAccount] = useState<boolean | null>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  const user = useUser();
  const loading = useLoading();
  const { authenticated, login } = usePrivyAuth();
  const { addNotification } = useAppStore();
  
  const {
    accounts,
    factoryState,
    isInitialized,
    initializeService,
    createAccount,
    setCourseManager,
    setUserAccountCourseManager,
    deactivateAccount,
    activateAccount,
    pauseFactory,
    unpauseFactory,
    refreshData,
    getActiveAccounts,
    getInactiveAccounts,
    getUserAccount,
    getUserAccountCourseManager,
    hasUserAccount,
  } = useAccountFactory();

  // Load user's specific account for institution users
  useEffect(() => {
    const loadUserAccount = async () => {
      if (userType === 'institution' && user.address && isInitialized) {
        setIsCheckingAccount(true);
        try {
          // First check if user has an account
          const hasAccount = await hasUserAccount(user.address);
          setUserHasAccount(hasAccount);
          
          if (hasAccount) {
            // Only try to get account details if user has an account
            const account = await getUserAccount(user.address);
            setUserAccount(account);
            
            // If we have the account, also load the course manager address
            if (account) {
              const courseManagerAddress = await getUserAccountCourseManager(account.accountAddress);
              setUserCourseManagerAddress(courseManagerAddress || '');
            }
          } else {
            // User doesn't have an account, clear any existing account data
            setUserAccount(null);
            setUserCourseManagerAddress('');
          }
        } catch (error) {
          console.error('Failed to load user account:', error);
          setUserHasAccount(false);
          setUserAccount(null);
        } finally {
          setIsCheckingAccount(false);
        }
      }
    };

    loadUserAccount();
  }, [userType, user.address, isInitialized, getUserAccount, getUserAccountCourseManager, hasUserAccount]);

  // Filter accounts based on user type and search
  const getFilteredAccounts = () => {
    if (userType === 'institution') {
      // For institution users, only show their own account
      if (!userAccount) return [];
      
      const matchesSearch = userAccount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           userAccount.accountAddress.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && userAccount.isActive) ||
                           (filterStatus === 'inactive' && !userAccount.isActive);
      
      return matchesSearch && matchesStatus ? [userAccount] : [];
    } else {
      // For admin users, show all accounts with filtering
      return accounts.filter(account => {
        const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             account.accountAddress.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'active' && account.isActive) ||
                             (filterStatus === 'inactive' && !account.isActive);
        return matchesSearch && matchesStatus;
      });
    }
  };

  const filteredAccounts = getFilteredAccounts();
  const activeAccounts = userType === 'institution' ? (userAccount?.isActive ? 1 : 0) : getActiveAccounts().length;
  const inactiveAccounts = userType === 'institution' ? (userAccount?.isActive ? 0 : 1) : getInactiveAccounts().length;

  const handleCreateAccount = async (data: CreateAccountFormData) => {
    try {
      await createAccount(data);
      setShowCreateForm(false);
      
      // Refresh user account data after creating account
      if (userType === 'institution' && user.address && isInitialized) {
        const userAddress = user.address; // Store to avoid TypeScript null check issues
        // Wait a bit for the transaction to be processed
        setTimeout(async () => {
          try {
            const hasAccount = await hasUserAccount(userAddress);
            setUserHasAccount(hasAccount);
            
            if (hasAccount) {
              const account = await getUserAccount(userAddress);
              setUserAccount(account);
            }
          } catch (error) {
            console.error('Failed to refresh user account after creation:', error);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const handleSetCourseManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseManagerAddress.trim()) return;

    try {
      await setCourseManager(courseManagerAddress);
      setCourseManagerAddress('');
    } catch (error) {
      console.error('Failed to set course manager:', error);
    }
  };

  const handleToggleAccountStatus = async (accountAddress: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateAccount(accountAddress);
      } else {
        await activateAccount(accountAddress);
      }
    } catch (error) {
      console.error('Failed to toggle account status:', error);
    }
  };

  const handleToggleFactoryPause = async () => {
    try {
      if (factoryState.paused) {
        await unpauseFactory();
      } else {
        await pauseFactory();
      }
    } catch (error) {
      console.error('Failed to toggle factory pause:', error);
    }
  };

  // Course Manager Modal Component
  const CourseManagerModal = () => {
    const [managerAddress, setManagerAddress] = useState('');
    const [useConnectedWallet, setUseConnectedWallet] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const addressToSet = useConnectedWallet ? user.address : managerAddress;
        if (!addressToSet) {
          throw new Error('Please provide a valid address');
        }

        if (userType === 'institution' && userAccount) {
          // For institution users, call UserAccount contract
          await setUserAccountCourseManager(userAccount.accountAddress, addressToSet);
          // Refresh the course manager address
          const newCourseManagerAddress = await getUserAccountCourseManager(userAccount.accountAddress);
          setUserCourseManagerAddress(newCourseManagerAddress || '');
        } else {
          // For admin users, call AccountFactory contract
          await setCourseManager(addressToSet);
        }

        setShowCourseManagerModal(false);
        setManagerAddress('');
        setUseConnectedWallet(true);
        
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Course Manager Updated',
          message: `Course manager has been successfully set to ${addressToSet.slice(0, 6)}...${addressToSet.slice(-4)}`
        });
      } catch (error) {
        console.error('Failed to set course manager:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showCourseManagerModal ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Set Course Manager</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCourseManagerModal(false)}
              disabled={isSubmitting}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="connected-wallet"
                  checked={useConnectedWallet}
                  onChange={() => setUseConnectedWallet(true)}
                  className="text-primary-600"
                />
                <label htmlFor="connected-wallet" className="text-sm font-medium">
                  Use Connected Wallet
                </label>
              </div>
              
              {useConnectedWallet && user.address && (
                <div className="ml-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Wallet Address:</p>
                  <p className="text-sm font-mono text-gray-800 break-all">
                    {user.address}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="external-address"
                  checked={!useConnectedWallet}
                  onChange={() => setUseConnectedWallet(false)}
                  className="text-primary-600"
                />
                <label htmlFor="external-address" className="text-sm font-medium">
                  Use External Address
                </label>
              </div>
              
              {!useConnectedWallet && (
                <div className="ml-6">
                  <Input
                    placeholder="0x..."
                    value={managerAddress}
                    onChange={(e) => setManagerAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the address that will manage courses for this institution
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCourseManagerModal(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (!useConnectedWallet && !managerAddress.trim())}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Setting...
                  </>
                ) : (
                  'Set Course Manager'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Authentication status component
  const AuthenticationStatus = () => {
    if (!authenticated) {
      return (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800">Authentication Required</h4>
                <p className="text-sm text-yellow-700">
                  Connect your wallet to interact with the blockchain
                </p>
              </div>
              <Button onClick={login} variant="outline" size="sm">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!isInitialized) {
      return (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">Initializing Service</h4>
                <p className="text-sm text-blue-700">
                  Setting up blockchain connection...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800">Wallet Connected</h4>
              <p className="text-sm text-green-700">
                {user.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'Ready to interact'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Authentication Status */}
      <AuthenticationStatus />

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {userType === 'institution' ? (userAccount ? 1 : 0) : accounts.length}
                </div>
                <div className="text-sm text-gray-600">
                  {userType === 'institution' ? 'My Account' : 'Total Accounts'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeAccounts}</div>
                <div className="text-sm text-gray-600">Active Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{inactiveAccounts}</div>
                <div className="text-sm text-gray-600">Inactive Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                factoryState.paused ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {factoryState.paused ? (
                  <Pause className="w-5 h-5 text-red-600" />
                ) : (
                  <Play className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold">
                  {factoryState.paused ? 'Paused' : 'Active'}
                </div>
                <div className="text-xs text-gray-600">Factory Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Controls */}
      {userType === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Admin Controls</span>
            </CardTitle>
            <CardDescription>Manage factory settings and course manager</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Factory Pause Control */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Factory Status</h4>
                <p className="text-sm text-gray-600">
                  {factoryState.paused ? 'Factory is currently paused' : 'Factory is active'}
                </p>
              </div>
              <Button
                onClick={handleToggleFactoryPause}
                disabled={loading || !authenticated || !isInitialized}
                variant={factoryState.paused ? 'default' : 'outline'}
              >
                {factoryState.paused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Unpause
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            </div>

            {/* Course Manager Setting */}
            <form onSubmit={handleSetCourseManager} className="space-y-3">
              <div>
                <Label htmlFor="courseManager">Course Manager Address</Label>
                <div className="flex space-x-2">
                  <Input
                    id="courseManager"
                    placeholder="0x..."
                    value={courseManagerAddress}
                    onChange={(e) => setCourseManagerAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || !courseManagerAddress.trim() || !authenticated || !isInitialized}>
                    Set
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Institution Course Manager Section */}
      {userType === 'institution' && userAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Course Manager Settings</span>
            </CardTitle>
            <CardDescription>Manage who can create and manage courses for your institution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info Section */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <Settings className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">What is a Course Manager?</h4>
                  <p className="text-sm text-blue-700">
                    The course manager is the address that can create, edit, and manage courses for your institution. 
                    This can be your own wallet address or another address you trust to manage your courses.
                  </p>
                </div>
              </div>
            </div>

            {/* Current Course Manager Display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Current Course Manager</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {userCourseManagerAddress ? (
                      <span className="font-mono text-xs break-all">
                        {userCourseManagerAddress}
                      </span>
                    ) : (
                      'No course manager set'
                    )}
                  </p>
                </div>
                <Badge variant={userCourseManagerAddress ? 'default' : 'secondary'}>
                  {userCourseManagerAddress ? 'Active' : 'Not Set'}
                </Badge>
              </div>
            </div>

            {/* Set Course Manager Button */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Update Course Manager</h4>
                <p className="text-sm text-gray-600">
                  Set who can create and manage courses for your institution
                </p>
              </div>
              <Button
                onClick={() => setShowCourseManagerModal(true)}
                disabled={!authenticated || !isInitialized}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Set Course Manager
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={async () => {
                  if (user.address && userAccount) {
                    try {
                      await setUserAccountCourseManager(userAccount.accountAddress, user.address);
                      // Refresh the course manager address
                      const newCourseManagerAddress = await getUserAccountCourseManager(userAccount.accountAddress);
                      setUserCourseManagerAddress(newCourseManagerAddress || '');
                      addNotification({
                        type: 'success',
                        title: 'Course Manager Updated',
                        message: 'You have been set as the course manager for this institution'
                      });
                    } catch (error) {
                      console.error('Failed to set course manager:', error);
                    }
                  }
                }}
                disabled={!authenticated || !isInitialized || !user.address || !userAccount || loading}
                variant="outline"
                className="justify-start"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Setting...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Set as Myself
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowCourseManagerModal(true)}
                disabled={!authenticated || !isInitialized}
                variant="outline"
                className="justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Set Custom Address
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Account Section - For admin users or institution users without accounts */}
      {(userType === 'admin' || (userType === 'institution' && userHasAccount === false)) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Create New Account</span>
                </CardTitle>
                <CardDescription>
                  {userType === 'admin' 
                    ? 'Set up a new institutional account' 
                    : 'Create your institution account to start managing courses'
                  }
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                disabled={!authenticated || !isInitialized || isCheckingAccount}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Loading state for institution users checking account existence */}
      {userType === 'institution' && isCheckingAccount && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <h4 className="font-semibold">Checking Account Status</h4>
                <p className="text-sm text-gray-600">Verifying if you have an institution account...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateAccount}
        isLoading={loading}
      />

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search accounts by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
                size="sm"
              >
                Inactive
              </Button>
              <Button
                onClick={refreshData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userType === 'institution' ? 'My Account' : `Accounts (${filteredAccounts.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No accounts found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAccounts.map((account) => (
                <div
                  key={account.accountAddress}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{account.name}</h4>
                      <p className="text-sm text-gray-600 font-mono">
                        {account.accountAddress.slice(0, 10)}...{account.accountAddress.slice(-8)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {userType === 'institution' && userCourseManagerAddress && (
                          <Badge 
                            variant={userCourseManagerAddress.toLowerCase() === user.address?.toLowerCase() ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {userCourseManagerAddress.toLowerCase() === user.address?.toLowerCase() ? 'Course Manager' : 'Not Manager'}
                          </Badge>
                        )}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(account.createdAt * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {userType === 'admin' && (
                      <Button
                        size="sm"
                        variant={account.isActive ? 'outline' : 'default'}
                        onClick={() => handleToggleAccountStatus(account.accountAddress, account.isActive)}
                        disabled={loading || !authenticated || !isInitialized}
                      >
                        {account.isActive ? (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Manager Modal */}
      <CourseManagerModal />
    </div>
  );
} 