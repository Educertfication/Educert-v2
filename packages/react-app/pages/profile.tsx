import React from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import UserProfile from '../components/UserProfile'
import { usePrivyAuth } from '../lib/usePrivyAuth'
import { Button } from '../components/ui/button'
import { GraduationCap, LogIn } from 'lucide-react'
import Link from 'next/link'

const ProfilePage: NextPage = () => {
  const { ready, authenticated } = usePrivyAuth()

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to EduCert
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please log in to access your profile
            </p>
          </div>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/">
                <LogIn className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Profile - EduCert</title>
        <meta name="description" content="Manage your EduCert profile and account settings" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="mt-2 text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>
            
            <UserProfile />
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage 