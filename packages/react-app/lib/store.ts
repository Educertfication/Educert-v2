import { create } from 'zustand'

// Types
export interface PrivyUser {
  id: string
  email?: { address: string }
  wallet?: { address: string }
  linkedAccounts: any[]
  createdAt: Date
  isGuest: boolean
}

export interface User {
  address: string | null
  type: 'admin' | 'institution' | 'student' | null
  institution: Institution | null
  // Privy integration
  privyId?: string
  email?: string
  isGuest?: boolean
  createdAt?: Date
}

export interface Institution {
  address: string
  name: string
  courseDuration: number
  isActive: boolean
  totalCourses: number
  totalCertificates: number
}

// AccountFactory types
export interface Account {
  name: string
  accountAddress: string
  createdAt: number
  isActive: boolean
}

export interface CreateAccountParams {
  name: string
  duration: number
}

export interface AccountFactoryState {
  owner: string
  paused: boolean
  courseManagerAddress: string
  nftAddress: string
  totalAccounts: number
}

export interface Course {
  courseId: number
  name: string
  description: string
  courseUri: string
  price: string
  duration: number
  isActive: boolean
  requiresAssessment: boolean
  certificateId: number
  totalEnrollments: number
  totalCompletions: number
  createdAt: number
  creator: string
}

export interface Enrollment {
  student: string
  courseId: number
  enrolledAt: number
  isCompleted: boolean
  certificateIssued: boolean
  completedAt: number
}

export interface Certificate {
  id: number
  courseId: number
  studentAddress: string
  issuedAt: number
  isRevoked: boolean
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
}

export interface ModalState {
  isOpen: boolean
  type: string | null
  data: any
}

// Store interface
interface AppState {
  // User state
  user: User
  setUser: (user: Partial<User>) => void
  clearUser: () => void
  syncPrivyUser: (privyUser: PrivyUser | null) => void

  // AccountFactory state
  accounts: Account[]
  setAccounts: (accounts: Account[]) => void
  addAccount: (account: Account) => void
  updateAccount: (accountAddress: string, updates: Partial<Account>) => void
  removeAccount: (accountAddress: string) => void

  accountFactoryState: AccountFactoryState
  setAccountFactoryState: (state: Partial<AccountFactoryState>) => void

  // Data state
  courses: Course[]
  setCourses: (courses: Course[]) => void
  addCourse: (course: Course) => void
  updateCourse: (courseId: number, updates: Partial<Course>) => void

  enrollments: Enrollment[]
  setEnrollments: (enrollments: Enrollment[]) => void
  addEnrollment: (enrollment: Enrollment) => void
  updateEnrollment: (courseId: number, studentAddress: string, updates: Partial<Enrollment>) => void

  certificates: Certificate[]
  setCertificates: (certificates: Certificate[]) => void
  addCertificate: (certificate: Certificate) => void

  // UI state
  loading: boolean
  setLoading: (loading: boolean) => void

  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  modal: ModalState
  openModal: (type: string, data?: any) => void
  closeModal: () => void

  // Error state
  error: string | null
  setError: (error: string | null) => void
  clearError: () => void
}

// Initial state
const initialState = {
  user: {
    address: null,
    type: 'student' as const, // Demo: default to student for navigation
    institution: null,
  },
  accounts: [],
  accountFactoryState: {
    owner: '',
    paused: false,
    courseManagerAddress: '',
    nftAddress: '',
    totalAccounts: 0,
  },
  courses: [],
  enrollments: [],
  certificates: [],
  loading: false,
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  error: null,
}

// Create store
export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  // User actions
  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
  clearUser: () => set({ user: initialState.user }),
  syncPrivyUser: (privyUser) => {
    if (!privyUser) {
      set({ user: initialState.user })
      return
    }
    
    const userData: Partial<User> = {
      privyId: privyUser.id,
      email: privyUser.email?.address,
      isGuest: privyUser.isGuest,
      createdAt: privyUser.createdAt,
      address: privyUser.wallet?.address || null,
    }
    
    set((state) => ({ user: { ...state.user, ...userData } }))
  },

  // AccountFactory actions
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((state) => ({ 
    accounts: [...state.accounts, account] 
  })),
  updateAccount: (accountAddress, updates) => set((state) => ({
    accounts: state.accounts.map(account => 
      account.accountAddress === accountAddress ? { ...account, ...updates } : account
    )
  })),
  removeAccount: (accountAddress) => set((state) => ({
    accounts: state.accounts.filter(account => account.accountAddress !== accountAddress)
  })),
  setAccountFactoryState: (state) => set((currentState) => ({ 
    accountFactoryState: { ...currentState.accountFactoryState, ...state } 
  })),

  // Course actions
  setCourses: (courses) => set({ courses }),
  addCourse: (course) => set((state) => ({ 
    courses: [...state.courses, course] 
  })),
  updateCourse: (courseId, updates) => set((state) => ({
    courses: state.courses.map(course => 
      course.courseId === courseId ? { ...course, ...updates } : course
    )
  })),

  // Enrollment actions
  setEnrollments: (enrollments) => set({ enrollments }),
  addEnrollment: (enrollment) => set((state) => ({ 
    enrollments: [...state.enrollments, enrollment] 
  })),
  updateEnrollment: (courseId, studentAddress, updates) => set((state) => ({
    enrollments: state.enrollments.map(enrollment => 
      enrollment.courseId === courseId && enrollment.student === studentAddress
        ? { ...enrollment, ...updates }
        : enrollment
    )
  })),

  // Certificate actions
  setCertificates: (certificates) => set({ certificates }),
  addCertificate: (certificate) => set((state) => ({ 
    certificates: [...state.certificates, certificate] 
  })),

  // UI actions
  setLoading: (loading) => set({ loading }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      }
    ]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] }),

  // Modal actions
  openModal: (type, data) => set({ 
    modal: { isOpen: true, type, data } 
  }),
  closeModal: () => set({ 
    modal: { isOpen: false, type: null, data: null } 
  }),

  // Error actions
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))

// Selectors
export const useUser = () => useAppStore((state) => state.user)
export const useAccounts = () => useAppStore((state) => state.accounts)
export const useAccountFactoryState = () => useAppStore((state) => state.accountFactoryState)
export const useCourses = () => useAppStore((state) => state.courses)
export const useEnrollments = () => useAppStore((state) => state.enrollments)
export const useCertificates = () => useAppStore((state) => state.certificates)
export const useLoading = () => useAppStore((state) => state.loading)
export const useNotifications = () => useAppStore((state) => state.notifications)
export const useModal = () => useAppStore((state) => state.modal)
export const useError = () => useAppStore((state) => state.error) 