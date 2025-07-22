import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAppStore } from '../lib/store'
import { usePrivyAuth } from '../lib/usePrivyAuth'
import Dashboard from '../components/Dashboard'
import { 
  GraduationCap, 
  Shield, 
  Globe, 
  Users, 
  Award,
  BookOpen,
  Building2,
  CheckCircle,
  ArrowRight,
  Star,
  User,
  Settings
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Verifiable Credentials',
    description: 'Blockchain-based certificates that are tamper-proof and instantly verifiable'
  },
  {
    icon: Globe,
    title: 'Global Recognition',
    description: 'Certificates recognized worldwide with transparent verification process'
  },
  {
    icon: Users,
    title: 'Institution Management',
    description: 'Comprehensive tools for educational institutions to manage courses and students'
  },
  {
    icon: Award,
    title: 'Student Achievement',
    description: 'Students can showcase their achievements with verifiable digital credentials'
  }
]

const stats = [
  { label: 'Institutions', value: '50+' },
  { label: 'Courses', value: '200+' },
  { label: 'Certificates', value: '1000+' },
  { label: 'Students', value: '5000+' }
]

const testimonials = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Dean, Computer Science',
    institution: 'Tech University',
    content: 'EduCert has revolutionized how we issue and verify certificates. The blockchain technology ensures authenticity and our students love the digital format.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Student',
    institution: 'Engineering College',
    content: 'Having my certificates on the blockchain gives me confidence that they will be recognized anywhere in the world. The verification process is seamless.',
    rating: 5
  }
]

export default function Home() {
  const { user, setUser } = useAppStore()
  const { ready, authenticated } = usePrivyAuth()

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // Show dashboard if user is authenticated
  // if (authenticated) {
  //   return (
  //     <>
  //       <Head>
  //         <title>Dashboard - EduCert</title>
  //         <meta name="description" content="Your EduCert dashboard" />
  //       </Head>
  //       <div className="min-h-screen bg-gray-50 py-12">
  //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //           <Dashboard />
  //         </div>
  //       </div>
  //     </>
  //   )
  // }

  // Show landing page if user is not authenticated
  const userTypes = [
    {
      type: 'student' as const,
      title: 'Student',
      description: 'Browse courses, earn certificates, and track your progress',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      href: '/student'
    },
    {
      type: 'institution' as const,
      title: 'Institution',
      description: 'Create courses, manage students, and issue certificates',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      href: '/institution'
    },
    {
      type: 'admin' as const,
      title: 'Admin',
      description: 'Manage platform, approve institutions, and monitor activity',
      icon: Settings,
      color: 'from-purple-500 to-purple-600',
      href: '/admin'
    }
  ]

  const handleUserTypeChange = (type: 'student' | 'institution' | 'admin') => {
    setUser({ type })
  }

  return (
    <>
      <Head>
        <title>EduCert - Blockchain-Based Educational Credentials</title>
        <meta name="description" content="Transform education with blockchain-based verifiable credentials. Issue, manage, and verify certificates securely on the Celo network." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Transform Education with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                  {' '}Blockchain Credentials
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Issue, manage, and verify educational certificates securely on the Celo blockchain. 
                Empowering institutions and students with tamper-proof, globally recognized credentials.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/courses">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Explore Courses
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* User Type Selection */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Choose Your Role
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Select your role to access the appropriate dashboard and features
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {userTypes.map((userType) => (
                <Card 
                  key={userType.type} 
                  className={`text-center hover:shadow-lg transition-all cursor-pointer ${
                    user.type === userType.type ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => handleUserTypeChange(userType.type)}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 bg-gradient-to-r ${userType.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <userType.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{userType.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {userType.description}
                    </CardDescription>
                    <Link href={userType.href}>
                      <Button 
                        className={`w-full bg-gradient-to-r ${userType.color} hover:opacity-90`}
                        disabled={user.type === userType.type}
                      >
                        {user.type === userType.type ? 'Current View' : `Go to ${userType.title} Dashboard`}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose EduCert?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built on the Celo blockchain for security, transparency, and global accessibility
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Simple steps to get started with blockchain-based credentials
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Institution Setup</h3>
                <p className="text-gray-600">
                  Educational institutions create accounts and get authorized to issue certificates
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Course Creation</h3>
                <p className="text-gray-600">
                  Institutions create courses and manage student enrollments
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Certificate Issuance</h3>
                <p className="text-gray-600">
                  Upon completion, students receive verifiable blockchain certificates
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="p-6">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-gray-500">{testimonial.institution}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Join the future of education with blockchain-based credentials. 
              Connect your wallet and start exploring courses today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                  Explore Courses
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-primary-600 hover:bg-white hover:text-primary-600">
                  Verify Certificate
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">EduCert</span>
                </div>
                <p className="text-gray-400">
                  Transforming education with blockchain-based verifiable credentials.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/courses" className="hover:text-white transition-colors">Courses</Link></li>
                  <li><Link href="/verify" className="hover:text-white transition-colors">Verify Certificates</Link></li>
                  <li><Link href="/institution" className="hover:text-white transition-colors">Institution Dashboard</Link></li>
                  <li><Link href="/student" className="hover:text-white transition-colors">Student Dashboard</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Connect</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Discord</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">GitHub</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 EduCert. All rights reserved. Built on Celo blockchain.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

