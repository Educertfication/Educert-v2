import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  isAdmin: boolean;
  isInstitution: boolean;
  isStudent: boolean;
  userAddress: string | null;
  userProfile: {
    name: string;
    email: string;
    type: 'admin' | 'institution' | 'student' | null;
  } | null;
  setUserRole: (role: 'admin' | 'institution' | 'student') => void;
  setUserAddress: (address: string) => void;
  setUserProfile: (profile: { name: string; email: string; type: 'admin' | 'institution' | 'student' }) => void;
  clearUser: () => void;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      isAdmin: false,
      isInstitution: false,
      isStudent: false,
      userAddress: null,
      userProfile: null,
      
      setUserRole: (role) => set({
        isAdmin: role === 'admin',
        isInstitution: role === 'institution',
        isStudent: role === 'student',
      }),
      
      setUserAddress: (address) => set({ userAddress: address }),
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      clearUser: () => set({
        isAdmin: false,
        isInstitution: false,
        isStudent: false,
        userAddress: null,
        userProfile: null,
      }),
    }),
    {
      name: 'user-storage',
    }
  )
); 