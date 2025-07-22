import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { useUser, useAppStore } from '../lib/store'
import { usePrivyAuth } from '../lib/usePrivyAuth'
import { User, Building2, Shield, GraduationCap, Copy, Check } from 'lucide-react'

const UserProfile: React.FC = () => {
  const user = useUser()
  const { setUser, addNotification } = useAppStore()
  const { authenticated, privyUser } = usePrivyAuth()
  const [isSettingRole, setIsSettingRole] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  if (!authenticated || !privyUser) {
    return null
  }

  const handleSetRole = (role: 'student' | 'institution' | 'admin') => {
    setUser({ type: role })
    setIsSettingRole(false)
  }

  const handleCopyAddress = async () => {
    if (!user.address) return

    try {
      await navigator.clipboard.writeText(user.address)
      setCopiedAddress(true)
      addNotification({
        type: 'success',
        title: 'Address Copied',
        message: 'Wallet address copied to clipboard'
      })
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedAddress(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy address to clipboard'
      })
    }
  }

  const roleIcons = {
    student: GraduationCap,
    institution: Building2,
    admin: Shield,
  }

  const roleColors = {
    student: 'bg-blue-100 text-blue-800',
    institution: 'bg-green-100 text-green-800',
    admin: 'bg-red-100 text-red-800',
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Profile</span>
        </CardTitle>
        <CardDescription>
          Your EduCert account information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <span className="text-sm">{user.email || 'Not provided'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Wallet:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono text-xs">
                {user.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'Not connected'}
              </span>
              {user.address && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  title="Copy address"
                >
                  {copiedAddress ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-500" />
                  )}
                </Button>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Account Type:</span>
            {user.type ? (
              <Badge className={roleColors[user.type]}>
                {React.createElement(roleIcons[user.type], { className: "w-3 h-3 mr-1" })}
                {user.type}
              </Badge>
            ) : (
              <Badge variant="outline">Not set</Badge>
            )}
          </div>
        </div>

        {/* Set Role Section */}
        {!user.type && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Set your account type:</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSetRole('student')}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Student - Enroll in courses and earn certificates
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSetRole('institution')}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Institution - Create courses and issue certificates
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSetRole('admin')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin - Manage the platform
              </Button>
            </div>
          </div>
        )}

        {/* Change Role Section */}
        {user.type && (
          <div className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingRole(!isSettingRole)}
              className="w-full"
            >
              Change Account Type
            </Button>
            
            {isSettingRole && (
              <div className="mt-3 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleSetRole('student')}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleSetRole('institution')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Institution
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleSetRole('admin')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UserProfile 