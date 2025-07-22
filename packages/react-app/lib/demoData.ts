import { Account, AccountFactoryState } from './store';

// Demo AccountFactory state
export const demoFactoryState: AccountFactoryState = {
  owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  paused: false,
  courseManagerAddress: '0x8ba1f109551bD432803012645Hac136c772c3c7',
  nftAddress: '0x1234567890123456789012345678901234567890',
  totalAccounts: 5,
};

// Demo accounts
export const demoAccounts: Account[] = [
  {
    name: 'Tech University',
    accountAddress: '0x1234567890123456789012345678901234567890',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
    isActive: true,
  },
  {
    name: 'Digital Academy',
    accountAddress: '0x2345678901234567890123456789012345678901',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 15, // 15 days ago
    isActive: true,
  },
  {
    name: 'Finance Institute',
    accountAddress: '0x3456789012345678901234567890123456789012',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
    isActive: false,
  },
  {
    name: 'Blockchain School',
    accountAddress: '0x4567890123456789012345678901234567890123',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 45, // 45 days ago
    isActive: true,
  },
  {
    name: 'AI Learning Center',
    accountAddress: '0x5678901234567890123456789012345678901234',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 3, // 3 days ago
    isActive: true,
  },
];

// Demo course manager addresses
export const demoCourseManagerAddresses = [
  '0x8ba1f109551bD432803012645Hac136c772c3c7',
  '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  '0x1234567890123456789012345678901234567890',
];

// Demo NFT addresses
export const demoNftAddresses = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
];

// Demo duration options for account creation
export const demoDurationOptions = [
  { value: 30, label: '30 days', description: 'Short-term course' },
  { value: 90, label: '90 days', description: 'Standard course' },
  { value: 180, label: '180 days', description: 'Long-term course' },
  { value: 365, label: '365 days', description: 'Year-long program' },
];

// Demo account statistics
export const demoAccountStats = {
  totalAccounts: demoAccounts.length,
  activeAccounts: demoAccounts.filter(acc => acc.isActive).length,
  inactiveAccounts: demoAccounts.filter(acc => !acc.isActive).length,
  recentAccounts: demoAccounts.filter(acc => 
    acc.createdAt > Math.floor(Date.now() / 1000) - 86400 * 7
  ).length,
};

// Demo factory events
export const demoFactoryEvents = [
  {
    type: 'AccountCreated',
    name: 'Tech University',
    userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    accountAddress: '0x1234567890123456789012345678901234567890',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 30,
  },
  {
    type: 'AccountCreated',
    name: 'Digital Academy',
    userAddress: '0x8ba1f109551bD432803012645Hac136c772c3c7',
    accountAddress: '0x2345678901234567890123456789012345678901',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 15,
  },
  {
    type: 'AccountDeactivated',
    userAddress: '0x3456789012345678901234567890123456789012',
    accountAddress: '0x3456789012345678901234567890123456789012',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
  },
  {
    type: 'CourseManagerSet',
    courseManagerAddress: '0x8ba1f109551bD432803012645Hac136c772c3c7',
    timestamp: Math.floor(Date.now() / 1000) - 86400 * 60,
  },
];

// Helper function to get demo data
export const getDemoData = () => ({
  factoryState: demoFactoryState,
  accounts: demoAccounts,
  stats: demoAccountStats,
  events: demoFactoryEvents,
  courseManagerAddresses: demoCourseManagerAddresses,
  nftAddresses: demoNftAddresses,
  durationOptions: demoDurationOptions,
}); 