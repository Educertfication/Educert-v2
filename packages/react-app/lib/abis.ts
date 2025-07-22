import CertificateABI from './abis/Certificate.json';
import AccountFactoryABI from './abis/AccountFactory.json';
import CourseManagerABI from './abis/CourseManager.json';
import UserAccountABI from './abis/UserAccount.json';

export const ABIs = {
  Certificate: CertificateABI,
  AccountFactory: AccountFactoryABI,
  CourseManager: CourseManagerABI,
  UserAccount: UserAccountABI,
} as const;

export type ContractName = keyof typeof ABIs;

export default ABIs; 