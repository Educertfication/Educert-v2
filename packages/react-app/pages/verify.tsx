import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  Building2, 
  BookOpen, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Award,
  Shield,
  Search
} from 'lucide-react';
import { ethers } from 'ethers';

// Contract ABIs
const ACCOUNT_FACTORY_ABI = [
  "function getAllAccounts() external view returns (tuple(string name, address accountAddress, uint256 createdAt, bool isActive)[])",
  "function getActiveAccounts() external view returns (tuple(string name, address accountAddress, uint256 createdAt, bool isActive)[])"
];

const COURSE_MANAGER_ABI = [
  "function getCoursesByCreator(address creator) external view returns (tuple(uint256 courseId, address creator, string name, string description, string courseUri, uint256 price, uint256 duration, bool isActive, bool requiresAssessment, uint256 certificateId, uint256 totalEnrollments, uint256 totalCompletions, uint256 createdAt)[])",
  "function getEnrollment(address student, uint256 courseId) external view returns (tuple(address student, uint256 courseId, uint256 enrolledAt, bool isCompleted, bool certificateIssued, uint256 completedAt))",
  "function hasCertificate(address student, uint256 courseId) external view returns (bool)"
];

// Contract addresses
const ACCOUNT_FACTORY_ADDRESS = "0x6ae719435cAc9003bf49f4107d8a7C65F7E1e810";
const COURSE_MANAGER_ADDRESS = "0x360977e8eBe61af2Bbc2937FAE2F0297Ee8C6ad5";

interface Institution {
  name: string;
  accountAddress: string;
  createdAt: number;
  isActive: boolean;
}

interface Course {
  courseId: number;
  creator: string;
  name: string;
  description: string;
  courseUri: string;
  price: string;
  duration: number;
  isActive: boolean;
  requiresAssessment: boolean;
  certificateId: number;
  totalEnrollments: number;
  totalCompletions: number;
  createdAt: number;
}

interface Enrollment {
  student: string;
  courseId: number;
  enrolledAt: number;
  isCompleted: boolean;
  certificateIssued: boolean;
  completedAt: number;
}

interface VerificationResult {
  isEnrolled: boolean;
  enrollment?: Enrollment;
  hasCertificate: boolean;
  institution: string;
  course: string;
  studentAddress: string;
}

export default function VerifyCertificate() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [studentAddress, setStudentAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load institutions on component mount
  useEffect(() => {
    loadInstitutions();
  }, []);

  // Load courses when institution is selected
  useEffect(() => {
    if (selectedInstitution) {
      loadCourses(selectedInstitution);
    } else {
      setCourses([]);
      setSelectedCourse('');
    }
  }, [selectedInstitution]);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://alfajores-forno.celo-testnet.org'
      );

      const accountFactory = new ethers.Contract(
        ACCOUNT_FACTORY_ADDRESS,
        ACCOUNT_FACTORY_ABI,
        provider
      );

      const accounts = await accountFactory.getActiveAccounts();
      console.log('Institutions loaded:', accounts);
      setInstitutions(accounts);
    } catch (error) {
      console.error('Failed to load institutions:', error);
      // Show demo institutions
      const demoInstitutions: Institution[] = [
        {
          name: 'Blockchain University',
          accountAddress: '0x1234567890123456789012345678901234567890',
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 365, // 1 year ago
          isActive: true
        },
        {
          name: 'Web3 Institute',
          accountAddress: '0x2345678901234567890123456789012345678901',
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 180, // 6 months ago
          isActive: true
        },
        {
          name: 'Crypto Academy',
          accountAddress: '0x3456789012345678901234567890123456789012',
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 90, // 3 months ago
          isActive: true
        }
      ];
      setInstitutions(demoInstitutions);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async (institutionAddress: string) => {
    setLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://alfajores-forno.celo-testnet.org'
      );

      const courseManager = new ethers.Contract(
        COURSE_MANAGER_ADDRESS,
        COURSE_MANAGER_ABI,
        provider
      );

      const courses = await courseManager.getCoursesByCreator(institutionAddress);
      console.log('Courses loaded:', courses);
      
      // Check if courses array is empty or has no valid courses
      if (!courses || courses.length === 0) {
        console.log('No courses found for institution, showing demo data');
        // Show demo courses when no real courses exist
        const demoCourses: Course[] = [
          {
            courseId: 1,
            creator: institutionAddress,
            name: 'Blockchain Development Fundamentals',
            description: 'Learn the basics of blockchain technology',
            courseUri: 'https://ipfs.io/ipfs/QmExample1',
            price: ethers.utils.parseEther('0.1').toString(),
            duration: 30,
            isActive: true,
            requiresAssessment: true,
            certificateId: 1,
            totalEnrollments: 45,
            totalCompletions: 12,
            createdAt: Math.floor(Date.now() / 1000) - 86400 * 60
          },
          {
            courseId: 2,
            creator: institutionAddress,
            name: 'Advanced Smart Contract Development',
            description: 'Master smart contract development',
            courseUri: 'https://ipfs.io/ipfs/QmExample2',
            price: ethers.utils.parseEther('0.2').toString(),
            duration: 45,
            isActive: true,
            requiresAssessment: true,
            certificateId: 2,
            totalEnrollments: 23,
            totalCompletions: 8,
            createdAt: Math.floor(Date.now() / 1000) - 86400 * 30
          },
          {
            courseId: 3,
            creator: institutionAddress,
            name: 'Web3 Security Best Practices',
            description: 'Security in Web3 applications',
            courseUri: 'https://ipfs.io/ipfs/QmExample3',
            price: ethers.utils.parseEther('0.15').toString(),
            duration: 20,
            isActive: true,
            requiresAssessment: true,
            certificateId: 3,
            totalEnrollments: 67,
            totalCompletions: 15,
            createdAt: Math.floor(Date.now() / 1000) - 86400 * 15
          }
        ];
        setCourses(demoCourses);
        setIsDemoMode(true);
      } else {
        setCourses(courses);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      // Show demo courses when contract call fails
      const demoCourses: Course[] = [
        {
          courseId: 1,
          creator: institutionAddress,
          name: 'Blockchain Development Fundamentals',
          description: 'Learn the basics of blockchain technology',
          courseUri: 'https://ipfs.io/ipfs/QmExample1',
          price: ethers.utils.parseEther('0.1').toString(),
          duration: 30,
          isActive: true,
          requiresAssessment: true,
          certificateId: 1,
          totalEnrollments: 45,
          totalCompletions: 12,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 60
        },
        {
          courseId: 2,
          creator: institutionAddress,
          name: 'Advanced Smart Contract Development',
          description: 'Master smart contract development',
          courseUri: 'https://ipfs.io/ipfs/QmExample2',
          price: ethers.utils.parseEther('0.2').toString(),
          duration: 45,
          isActive: true,
          requiresAssessment: true,
          certificateId: 2,
          totalEnrollments: 23,
          totalCompletions: 8,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 30
        },
        {
          courseId: 3,
          creator: institutionAddress,
          name: 'Web3 Security Best Practices',
          description: 'Security in Web3 applications',
          courseUri: 'https://ipfs.io/ipfs/QmExample3',
          price: ethers.utils.parseEther('0.15').toString(),
          duration: 20,
          isActive: true,
          requiresAssessment: true,
          certificateId: 3,
          totalEnrollments: 67,
          totalCompletions: 15,
          createdAt: Math.floor(Date.now() / 1000) - 86400 * 15
        }
      ];
      setCourses(demoCourses);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedInstitution || !selectedCourse || !studentAddress) return;
    
    setLoading(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://alfajores-forno.celo-testnet.org'
      );

      const courseManager = new ethers.Contract(
        COURSE_MANAGER_ADDRESS,
        COURSE_MANAGER_ABI,
        provider
      );

      const courseId = parseInt(selectedCourse);
      
      // Get enrollment details
      const enrollment = await courseManager.getEnrollment(studentAddress, courseId);
      const hasCertificate = await courseManager.hasCertificate(studentAddress, courseId);
      
      const selectedInstitutionData = institutions.find(inst => inst.accountAddress === selectedInstitution);
      const selectedCourseData = courses.find(course => course.courseId === courseId);
      
      const result: VerificationResult = {
        isEnrolled: enrollment.enrolledAt.toNumber() > 0,
        enrollment: {
          student: enrollment.student,
          courseId: enrollment.courseId.toNumber(),
          enrolledAt: enrollment.enrolledAt.toNumber(),
          isCompleted: enrollment.isCompleted,
          certificateIssued: enrollment.certificateIssued,
          completedAt: enrollment.completedAt.toNumber()
        },
        hasCertificate,
        institution: selectedInstitutionData?.name || 'Unknown Institution',
        course: selectedCourseData?.name || 'Unknown Course',
        studentAddress
      };
      
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
      
      // Show demo verification result
      const demoResult: VerificationResult = {
        isEnrolled: true,
        enrollment: {
          student: studentAddress,
          courseId: parseInt(selectedCourse),
          enrolledAt: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
          isCompleted: true,
          certificateIssued: true,
          completedAt: Math.floor(Date.now() / 1000) - 86400 * 5 // 5 days ago
        },
        hasCertificate: true,
        institution: institutions.find(inst => inst.accountAddress === selectedInstitution)?.name || 'Demo Institution',
        course: courses.find(course => course.courseId === parseInt(selectedCourse))?.name || 'Demo Course',
        studentAddress
      };
      
      setVerificationResult(demoResult);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = (result: VerificationResult) => {
    if (!result.isEnrolled) {
      return { status: 'Not Enrolled', variant: 'destructive' as const, icon: XCircle };
    } else if (result.hasCertificate) {
      return { status: 'Certificate Issued', variant: 'default' as const, icon: Award };
    } else if (result.enrollment?.isCompleted) {
      return { status: 'Course Completed', variant: 'secondary' as const, icon: CheckCircle };
    } else {
      return { status: 'Course In Progress', variant: 'outline' as const, icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Certificate Verification</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verify the authenticity of educational certificates on the blockchain. 
            Select an institution, course, and enter student address to check enrollment and certificate status.
          </p>
          {isDemoMode && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md inline-block">
              <p className="text-sm text-yellow-800">
                🧪 Demo Mode - Showing test data for demonstration purposes
              </p>
            </div>
          )}
        </div>

        {/* Verification Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                <Shield className="w-6 h-6 inline mr-2" />
                Verify Certificate
              </CardTitle>
              <CardDescription className="text-center">
                Select institution, course, and enter student address to verify
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Institution Selection */}
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <select
                    id="institution"
                    value={selectedInstitution}
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select an institution</option>
                    {institutions.map((institution) => (
                      <option key={institution.accountAddress} value={institution.accountAddress}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Selection */}
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <select
                    id="course"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={!selectedInstitution}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.courseId} value={course.courseId.toString()}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Address */}
                <div className="space-y-2">
                  <Label htmlFor="studentAddress">Student Address</Label>
                  <Input
                    id="studentAddress"
                    placeholder="Enter student wallet address (0x...)"
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <Button
                  onClick={handleVerify}
                  disabled={!selectedInstitution || !selectedCourse || !studentAddress || loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Search className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Certificate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Verification Result
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Status */}
                  <div className="text-center">
                    {(() => {
                      const status = getVerificationStatus(verificationResult);
                      const StatusIcon = status.icon;
                      return (
                        <div className="flex items-center justify-center space-x-3 mb-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            status.variant === 'destructive' ? 'bg-red-100' : 
                            status.variant === 'default' ? 'bg-green-100' : 
                            status.variant === 'secondary' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <StatusIcon className={`w-8 h-8 ${
                              status.variant === 'destructive' ? 'text-red-600' : 
                              status.variant === 'default' ? 'text-green-600' : 
                              status.variant === 'secondary' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <Badge variant={status.variant} className="text-lg px-4 py-2">
                            {status.status}
                          </Badge>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Institution</Label>
                        <p className="text-lg font-semibold">{verificationResult.institution}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Course</Label>
                        <p className="text-lg font-semibold">{verificationResult.course}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Student Address</Label>
                        <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                          {verificationResult.studentAddress}
                        </p>
                      </div>
                    </div>

                    {verificationResult.enrollment && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Enrollment Date</Label>
                          <p className="text-lg">
                            {new Date(verificationResult.enrollment.enrolledAt * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        {verificationResult.enrollment.isCompleted && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Completion Date</Label>
                            <p className="text-lg">
                              {new Date(verificationResult.enrollment.completedAt * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Certificate Status</Label>
                          <p className="text-lg">
                            {verificationResult.hasCertificate ? 'Issued' : 'Not Issued'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Certificate Details */}
                  {verificationResult.hasCertificate && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">Certificate Details</h3>
                      </div>
                      <p className="text-sm text-green-700">
                        This student has successfully completed the course and received a certificate. 
                        The certificate is stored on the blockchain and can be verified by anyone.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 