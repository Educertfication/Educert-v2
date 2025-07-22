import React, { useState } from 'react';
import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import AccountManagement from '../components/AccountManagement';
import { 
  Building2, 
  Users, 
  Award, 
  Shield,
  Settings,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

const institutions = [
  {
    id: 1,
    name: 'Tech University',
    address: '0x1234567890123456789012345678901234567890',
    status: 'Active',
    courses: 5,
    students: 150,
    certificates: 45
  },
  {
    id: 2,
    name: 'Digital Academy',
    address: '0x2345678901234567890123456789012345678901',
    status: 'Active',
    courses: 3,
    students: 89,
    certificates: 23
  },
  {
    id: 3,
    name: 'Finance Institute',
    address: '0x3456789012345678901234567890123456789012',
    status: 'Pending',
    courses: 0,
    students: 0,
    certificates: 0
  }
];

const stats = [
  { label: 'Total Institutions', value: '3', icon: Building2 },
  { label: 'Total Students', value: '239', icon: Users },
  { label: 'Total Certificates', value: '68', icon: Award },
  { label: 'Active Courses', value: '8', icon: Shield }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <Head>
        <title>Admin Dashboard - EduCert</title>
        <meta name="description" content="Admin dashboard for managing the platform" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-primary-100">Manage institutions, monitor platform activity, and ensure quality.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="accounts" className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Account Management</span>
                </TabsTrigger>
                <TabsTrigger value="institutions" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Institutions</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats */}
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

                {/* Platform Statistics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">New Institutions</span>
                          <span className="font-semibold">2</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">New Students</span>
                          <span className="font-semibold">45</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Certificates Issued</span>
                          <span className="font-semibold">12</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Courses Created</span>
                          <span className="font-semibold">3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>System Health</CardTitle>
                      <CardDescription>Platform status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Smart Contracts</span>
                          <Badge variant="default">Healthy</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Database</span>
                          <Badge variant="default">Healthy</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">API Services</span>
                          <Badge variant="default">Healthy</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Uptime</span>
                          <span className="font-semibold text-green-600">99.9%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Manage Institutions</h3>
                              <p className="text-sm text-gray-600">Approve, suspend, or manage institutions</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <Award className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Certificate Verification</h3>
                              <p className="text-sm text-gray-600">Verify and manage certificates</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Settings className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Platform Settings</h3>
                              <p className="text-sm text-gray-600">Configure platform parameters</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Account Management Tab */}
              <TabsContent value="accounts">
                <AccountManagement userType="admin" />
              </TabsContent>

              {/* Institutions Tab */}
              <TabsContent value="institutions">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Institutions</h2>
                    <Button>
                      <Building2 className="w-4 h-4 mr-2" />
                      Add Institution
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {institutions.map((institution) => (
                      <Card key={institution.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge variant={institution.status === 'Active' ? 'default' : 'secondary'}>
                              {institution.status}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{institution.name}</CardTitle>
                          <CardDescription className="font-mono text-xs">
                            {institution.address.slice(0, 10)}...{institution.address.slice(-8)}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-semibold text-gray-900">{institution.courses}</div>
                                <div className="text-gray-600">Courses</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-gray-900">{institution.students}</div>
                                <div className="text-gray-600">Students</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-gray-900">{institution.certificates}</div>
                                <div className="text-gray-600">Certificates</div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              {institution.status === 'Pending' ? (
                                <>
                                  <Button size="sm" className="flex-1">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </>
  );
} 