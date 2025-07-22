import { useEffect, useCallback } from 'react'
import { usePrivy, useSendTransaction } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { useAppStore, PrivyUser } from './store'

export const usePrivyAuth = () => {
  const { ready, authenticated, user: privyUser, login, logout } = usePrivy()
  const { sendTransaction } = useSendTransaction()
  const { syncPrivyUser, user } = useAppStore()

  // Send transaction using Privy
  const sendPrivyTransaction = useCallback(async (transaction: any) => {
    if (!authenticated) {
      throw new Error('User not authenticated')
    }

    try {
      const result = await sendTransaction(transaction)
      return result
    } catch (error) {
      console.error('Failed to send transaction:', error)
      throw error
    }
  }, [authenticated, sendTransaction])

  // Sync Privy user data with Zustand store
  useEffect(() => {
    if (ready) {
      if (authenticated && privyUser) {
        syncPrivyUser(privyUser as PrivyUser)
      } else {
        syncPrivyUser(null)
      }
    }
  }, [ready, authenticated, privyUser, syncPrivyUser])

  return {
    ready,
    authenticated,
    user,
    login,
    logout,
    privyUser: privyUser as PrivyUser | null,
    sendTransaction: sendPrivyTransaction,
  }
} 