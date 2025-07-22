import React, { useState } from 'react';
import Head from 'next/head';
import CreateCourseModal, { CourseFormData } from '../components/CreateCourseModal';
import CertificateIssuanceModal from '../components/CertificateIssuanceModal';
import AccountManagement from '../components/AccountManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAppStore } from '../lib/store';
import { usePrivyAuth } from '../lib/usePrivyAuth';
import { 
  BookOpen, 
  Users, 
  Award, 
  Plus,
  Building2,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { ethers } from 'ethers';

// Import contract ABIs and addresses
const ACCOUNT_FACTORY_ABI = [
  "function getUserAccount(address userAddress) external view returns (address)",
  "function hasUserAccount(address userAddress) external view returns (bool)"
];

const USER_ACCOUNT_ABI = [
  "function createCourse(string memory name, string memory description, string memory courseUri, uint256 price, uint256 duration, bool requiresAssessment) external returns (uint256)",
  "function setCourseManager(address _courseManagerAddress) external"
];

const COURSE_MANAGER_ADDRESS = "0x360977e8eBe61af2Bbc2937FAE2F0297Ee8C6ad5";
const ACCOUNT_FACTORY_ADDRESS = "0x6ae719435cAc9003bf49f4107d8a7C65F7E1e810";

const courses = [
  {
    id: 1,
    title: 'Blockchain Development Fundamentals',
    students: 45,
    status: 'Active',
    revenue: '4.5 ETH',
    certificatesIssued: 12,
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    title: 'Advanced Smart Contract Development',
    students: 23,
    status: 'Active',
    revenue: '4.6 ETH',
    certificatesIssued: 8,
    createdAt: '2024-01-15'
  },
  {
    id: 3,
    title: 'Web3 Security Best Practices',
    students: 67,
    status: 'Draft',
    revenue: '0 ETH',
    certificatesIssued: 0,
    createdAt: '2024-02-01'
  }
];

const recentStudents = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    course: 'Blockchain Development Fundamentals',
    enrolledDate: '2024-01-20',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    course: 'Advanced Smart Contract Development',
    enrolledDate: '2024-01-18',
    status: 'Completed'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    course: 'Blockchain Development Fundamentals',
    enrolledDate: '2024-01-15',
    status: 'Active'
  }
];

const stats = [
  { label: 'Total Courses', value: '3', icon: BookOpen },
  { label: 'Active Students', value: '135', icon: Users },
  { label: 'Certificates Issued', value: '20', icon: Award },
  { label: 'Total Revenue', value: '9.1 ETH', icon: TrendingUp }
];

export default function InstitutionDashboard() {
  const { addCourse, addNotification } = useAppStore();
  const { authenticated, privyUser, sendTransaction } = usePrivyAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: number; title: string } | null>(null);

  const handleCreateCourse = async (courseData: CourseFormData) => {
    setIsCreatingCourse(true);
    
    try {
      // Check if user is authenticated with Privy
      if (!authenticated || !privyUser) {
        throw new Error('Please connect your wallet to create courses.');
      }

      // Get the user's wallet address
      const userAddress = privyUser.wallet?.address;
      if (!userAddress) {
        throw new Error('No wallet address found. Please connect your wallet.');
      }

      // Create provider for reading from blockchain
      const rpcProvider = new ethers.providers.JsonRpcProvider(
        'https://alfajores-forno.celo-testnet.org'
      );

      // Check if user has a UserAccount
      const accountFactory = new ethers.Contract(
        ACCOUNT_FACTORY_ADDRESS,
        ACCOUNT_FACTORY_ABI,
        rpcProvider
      );

      const hasAccount = await accountFactory.hasUserAccount(userAddress);
      if (!hasAccount) {
        throw new Error('No institution account found. Please create an institution account first.');
      }

      // Get the UserAccount contract address
      const userAccountAddress = await accountFactory.getUserAccount(userAddress);

      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(courseData.price);

      // Prepare the transaction to call createCourse on UserAccount
      const userAccountContract = new ethers.Contract(
        userAccountAddress,
        USER_ACCOUNT_ABI,
        rpcProvider
      );

      const createCourseData = userAccountContract.interface.encodeFunctionData(
        'createCourse',
        [
          courseData.name,
          courseData.description,
          courseData.courseUri, // This is the IPFS hash from the metadata
          priceInWei,
          courseData.duration,
          courseData.requiresAssessment
        ]
      );

      // Send transaction using Privy
      const transaction = {
        to: userAccountAddress,
        data: createCourseData,
        value: '0x0', // No ETH value needed for this function
      };

      const result = await sendTransaction(transaction);

      // For Privy transactions, we need to wait for the transaction to be mined
      // The result contains the transaction hash, so we need to wait for it
      const receipt = await rpcProvider.waitForTransaction(result.hash);

      // Get the course ID from the event
      const courseCreatedEvent = receipt.logs?.find(
        (log: any) => {
          try {
            const parsedLog = userAccountContract.interface.parseLog(log);
            return parsedLog.name === 'CourseCreated';
          } catch {
            return false;
          }
        }
      );

      if (!courseCreatedEvent) {
        throw new Error('Course creation event not found');
      }

      const parsedLog = userAccountContract.interface.parseLog(courseCreatedEvent);
      const courseId = parsedLog.args.courseId.toNumber();

      // Create course object for local state
      const newCourse = {
        courseId,
        name: courseData.name,
        description: courseData.description,
        courseUri: courseData.courseUri,
        price: courseData.price,
        duration: courseData.duration,
        isActive: true,
        requiresAssessment: courseData.requiresAssessment,
        certificateId: 0,
        totalEnrollments: 0,
        totalCompletions: 0,
        createdAt: Date.now(),
        creator: userAddress,
        // Additional metadata from IPFS
        courseCreator: courseData.courseCreator,
        courseCategory: courseData.courseCategory,
        difficultyLevel: courseData.difficultyLevel,
        studentRequirements: courseData.studentRequirements,
        learningObjectives: courseData.learningObjectives,
        targetAudience: courseData.targetAudience,
        courseImage: courseData.courseImage,
        courseCurriculum: courseData.courseCurriculum,
        publishWithCertificate: courseData.publishWithCertificate,
      };

      addCourse(newCourse);
      addNotification({
        type: 'success',
        title: 'Course Created Successfully!',
        message: `${courseData.name} has been created and stored on IPFS. Course ID: ${courseId}`
      });

      // Close modal
      setIsCreateModalOpen(false);

    } catch (error) {
      console.error('Error creating course:', error);
      
      let errorMessage = 'Failed to create course. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('connect your wallet')) {
          errorMessage = error.message;
        } else if (error.message.includes('No institution account')) {
          errorMessage = error.message;
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to create course. Please ensure you have enough ETH for gas fees.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled by user.';
        } else {
          errorMessage = error.message;
        }
      }

      addNotification({
        type: 'error',
        title: 'Course Creation Failed',
        message: errorMessage
      });
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleOpenCertificateModal = (course: { id: number; title: string }) => {
    setSelectedCourse(course);
    setIsCertificateModalOpen(true);
  };

  // Show login prompt if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please connect your wallet to access the institution dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Institution Dashboard - EduCert</title>
        <meta name="description" content="Manage your courses and students" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Institution Dashboard</h1>
                  <p className="text-primary-100">Manage your courses, students, and certificates.</p>
                  {privyUser?.wallet?.address && (
                    <p className="text-primary-200 text-sm mt-1">
                      Connected: {privyUser.wallet.address.slice(0, 6)}...{privyUser.wallet.address.slice(-4)}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="secondary" size="lg" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
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
                <TabsTrigger value="courses" className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Courses</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Account</span>
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

                {/* Recent Students */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Students</CardTitle>
                      <Button variant="outline">View All Students</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Course
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Enrolled
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                  <div className="text-sm text-gray-500">{student.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.course}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(student.enrolledDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={student.status === 'Completed' ? 'default' : 'secondary'}>
                                  {student.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="ghost">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <Award className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common institutional tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Plus className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Create New Course</h3>
                              <p className="text-sm text-gray-600">Add a new course to your institution</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                          if (courses.length > 0) {
                            handleOpenCertificateModal(courses[0]);
                          } else {
                            addNotification({
                              type: 'info',
                              title: 'No Courses Available',
                              message: 'Create a course first to issue certificates'
                            });
                          }
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <Award className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Issue Certificates</h3>
                              <p className="text-sm text-gray-600">Award certificates to completed students</p>
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
                              <h3 className="font-semibold text-gray-900">Institution Settings</h3>
                              <p className="text-sm text-gray-600">Manage your institution profile</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
                  <div className="flex space-x-2">
                    <Input placeholder="Search courses..." className="w-64" />
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Course
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant={course.status === 'Active' ? 'default' : 'secondary'}>
                            {course.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>Created {new Date(course.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Students:</span>
                              <div className="font-semibold">{course.students}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Revenue:</span>
                              <div className="font-semibold text-primary-600">{course.revenue}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Certificates:</span>
                              <div className="font-semibold">{course.certificatesIssued}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <div className="font-semibold">{course.status}</div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <Users className="w-4 h-4 mr-2" />
                              Manage Students
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenCertificateModal(course)}
                            >
                              <Award className="w-4 h-4 mr-2" />
                              Issue Certificates
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account">
                <AccountManagement userType="institution" />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Create Course Modal */}
        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCourse}
          isCreating={isCreatingCourse}
        />

        {/* Certificate Issuance Modal */}
        {selectedCourse && (
          <CertificateIssuanceModal
            isOpen={isCertificateModalOpen}
            onClose={() => {
              setIsCertificateModalOpen(false);
              setSelectedCourse(null);
            }}
            courseId={selectedCourse.id}
            courseName={selectedCourse.title}
            userAccountAddress={privyUser?.wallet?.address || ''}
            courseManagerAddress={COURSE_MANAGER_ADDRESS}
          />
        )}
      </div>
    </>
  );
} 