import React from 'react'
import Link from 'next/link'
import { useUser } from '../lib/store'
import { Button } from './ui/button'
import { 
  GraduationCap, 
  Menu, 
  X,
  User,
  Building2,
  BookOpen,
  Shield
} from 'lucide-react'
import { cn } from '../lib/utils'
import { usePrivyAuth } from '../lib/usePrivyAuth'

interface HeaderProps {
  className?: string
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const user = useUser()
  const { ready, authenticated, login, logout, privyUser } = usePrivyAuth()

  const navigation = [
    { name: 'Home', href: '/', icon: GraduationCap },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Verify Certificate', href: '/verify', icon: Shield },
    ...(user.type === 'institution' ? [
      { name: 'Institution Dashboard', href: '/institution', icon: Building2 }
    ] : []),
    ...(user.type === 'student' ? [
      { name: 'Student Dashboard', href: '/student', icon: User }
    ] : []),
    ...(user.type === 'admin' ? [
      { name: 'Admin', href: '/admin', icon: User }
    ] : []),
  ]

  // console.log("user", user)
  // console.log("privyUser", privyUser)

  return (
    <header className={cn("bg-white border-b border-gray-200 sticky top-0 z-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduCert</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            
          {ready && authenticated ? (
          <div className="flex items-center space-x-2">
            {/* {user.email && (
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.email}
              </span>
            )} */}
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            <Button onClick={logout} variant="outline"
              size="sm"
              className="flex items-center space-x-2">
              Log Out
            </Button>
          </div>
        ) : (
          <Button onClick={login} variant="outline"
          size="sm"
          className="flex items-center space-x-2">Log In</Button>
        )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
       