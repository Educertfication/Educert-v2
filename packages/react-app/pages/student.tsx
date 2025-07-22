import React from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle,
  Play,
  GraduationCap,
  TrendingUp,
  Calendar
} from 'lucide-react';

const enrolledCourses = [
  {
    id: 1,
    title: 'Blockchain Development Fundamentals',
    institution: 'Tech University',
    progress: 75,
    status: 'In Progress',
    nextLesson: 'Smart Contract Basics',
    estimatedCompletion: '2 weeks',
    certificateId: null
  },
  {
    id: 2,
    title: 'Web3 Frontend Development',
    institution: 'Digital Academy',
    progress: 100,
    status: 'Completed',
    nextLesson: null,
    estimatedCompletion: null,
    certificateId: 'CERT-2024-001'
  },
  {
    id: 3,
    title: 'DeFi Protocol Design',
    institution: 'Finance Institute',
    progress: 25,
    status: 'In Progress',
    nextLesson: 'Liquidity Pools',
    estimatedCompletion: '8 weeks',
    certificateId: null
  }
];

const certificates = [
  {
    id: 'CERT-2024-001',
    course: 'Web3 Frontend Development',
    institution: 'Digital Academy',
    issuedDate: '2024-01-15',
    status: 'Active',
    verificationUrl: '/verify/CERT-2024-001'
  }
];

const stats = [
  { label: 'Courses Enrolled', value: '3', icon: BookOpen },
  { label: 'Certificates Earned', value: '1', icon: Award },
  { label: 'Hours Completed', value: '45', icon: Clock },
  { label: 'Completion Rate', value: '85%', icon: TrendingUp }
];

export default function StudentDashboard() {
  return (
    <>
      <Head>
        <title>Student Dashboard - EduCert</title>
        <meta name="description" content="Manage your courses and certificates" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Student Dashboard</h1>
                <p className="text-primary-100">Welcome back! Track your progress and manage your certificates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enrolled Courses */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Browse More Courses
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={course.status === 'Completed' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {course.progress}% Complete
                      </div>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.institution}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      
                      {course.nextLesson && (
                        <div className="text-sm">
                          <span className="text-gray-600">Next: </span>
                          <span className="font-medium">{course.nextLesson}</span>
                        </div>
                      )}
                      
                      {course.estimatedCompletion && (
                        <div className="text-sm">
                          <span className="text-gray-600">Estimated completion: </span>
                          <span className="font-medium">{course.estimatedCompletion}</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        {course.status === 'In Progress' ? (
                          <Button size="sm" className="flex-1">
                            <Play className="w-4 h-4 mr-2" />
                            Continue
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="flex-1">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        )}
                        
                        {course.certificateId && (
                          <Button size="sm" variant="outline">
                            <Award className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Certificates */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Certificates</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="default">Active</Badge>
                      <Award className="w-6 h-6 text-primary-600" />
                    </div>
                    <CardTitle className="text-lg">{cert.course}</CardTitle>
                    <CardDescription>{cert.institution}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Certificate ID:</span>
                        <span className="font-mono">{cert.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Issued:</span>
                        <span>{new Date(cert.issuedDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Award className="w-4 h-4 mr-2" />
                          View Certificate
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {certificates.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                  <p className="text-gray-600 mb-4">Complete your courses to earn verifiable blockchain certificates.</p>
                  <Button>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Completed lesson: Smart Contract Basics</p>
                      <p className="text-xs text-gray-500">Blockchain Development Fundamentals • 2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Earned certificate: Web3 Frontend Development</p>
                      <p className="text-xs text-gray-500">Digital Academy • 1 week ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Enrolled in: DeFi Protocol Design</p>
                      <p className="text-xs text-gray-500">Finance Institute • 2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
} 