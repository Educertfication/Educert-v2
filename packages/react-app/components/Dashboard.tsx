import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useUser } from '../lib/store'
import { usePrivyAuth } from '../lib/usePrivyAuth'
import { 
  GraduationCap, 
  Building2, 
  Shield, 
  BookOpen, 
  Award, 
  Users,
  Plus,
  Settings
} from 'lucide-react'
import Link from 'next/link'

const Dashboard: React.FC = () => {
  const user = useUser()
  const { authenticated } = usePrivyAuth()

  if (!authenticated) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Not authenticated</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please log in to access your dashboard.
        </p>
      </div>
    )
  }

  if (!user.type) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Account type not set</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please set your account type in your profile to access the dashboard.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/profile">
              <Settings className="mr-2 h-4 w-4" />
              Go to Profile
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const dashboardContent = {
    student: {
      icon: GraduationCap,
      title: 'Student Dashboard',
      description: 'Manage your courses and certificates',
      stats: [
        { label: 'Enrolled Courses', value: '0', icon: BookOpen },
        { label: 'Completed Courses', value: '0', icon: Award },
        { label: 'Certificates Earned', value: '0', icon: Award },
      ],
      actions: [
        { label: 'Browse Courses', href: '/courses', icon: BookOpen },
        { label: 'My Certificates', href: '/certificates', icon: Award },
      ]
    },
    institution: {
      icon: Building2,
      title: 'Institution Dashboard',
      description: 'Manage your courses and students',
      stats: [
        { label: 'Total Courses', value: '0', icon: BookOpen },
        { label: 'Total Students', value: '0', icon: Users },
        { label: 'Certificates Issued', value: '0', icon: Award },
      ],
      actions: [
        { label: 'Create Course', href: '/create-course', icon: Plus },
        { label: 'Manage Students', href: '/students', icon: Users },
        { label: 'Issue Certificates', href: '/certificates', icon: Award },
      ]
    },
    admin: {
      icon: Shield,
      title: 'Admin Dashboard',
      description: 'Manage the platform and institutions',
      stats: [
        { label: 'Total Institutions', value: '0', icon: Building2 },
        { label: 'Total Students', value: '0', icon: Users },
        { label: 'Total Certificates', value: '0', icon: Award },
      ],
      actions: [
        { label: 'Manage Institutions', href: '/institutions', icon: Building2 },
        { label: 'Platform Settings', href: '/settings', icon: Settings },
        { label: 'View Analytics', href: '/analytics', icon: Award },
      ]
    }
  }

  const content = dashboardContent[user.type]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg">
          <content.icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
          <p className="text-gray-600">{content.description}</p>
        </div>
        <Badge className="ml-auto">
          {user.type}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and navigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.actions.map((action) => (
              <Button key={action.label} variant="outline" asChild className="h-auto p-4 flex flex-col items-start space-y-2">
                <Link href={action.href}>
                  <action.icon className="h-5 w-5" />
                  <span>{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest actions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="mx-auto h-8 w-8 mb-2" />
            <p>No recent activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard 