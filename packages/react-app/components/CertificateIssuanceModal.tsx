import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Award, 
  Users, 
  CheckCircle, 
  XCircle, 
  Search, 
  RefreshCw,
  User,
  Calendar,
  Clock,
  GraduationCap
} from 'lucide-react';
import { ethers } from 'ethers';
import { usePrivyAuth } from '../lib/usePrivyAuth';
import { useAppStore } from '../lib/store';

// Contract ABIs
const USER_ACCOUNT_ABI = [
  "function issueCertificateForCourse(uint256 courseId, address student) external",
  "function getCourseStudents(uint256 courseId) external view returns (address[])",
  "function hasStudentCompleted(address student, uint256 courseId) external view returns (bool)",
  "function hasStudentCertificate(address student, uint256 courseId) external view returns (bool)"
];

const COURSE_MANAGER_ABI = [
  "function getCourse(uint256 courseId) external view returns (tuple(uint256 courseId, address creator, string name, string description, string courseUri, uint256 price, uint256 duration, bool isActive, bool requiresAssessment, uint256 certificateId, uint256 totalEnrollments, uint256 totalCompletions, uint256 createdAt))",
  "function getEnrollment(address student, uint256 courseId) external view returns (tuple(address student, uint256 courseId, uint256 enrolledAt, bool isCompleted, bool certificateIssued, uint256 completedAt))",
  "function getCourseStudents(uint256 courseId) external view returns (address[])"
];

interface Student {
  address: string;
  name?: string;
  email?: string;
  enrolledAt: number;
  completedAt?: number;
  isCompleted: boolean;
  certificateIssued: boolean;
}

interface CertificateIssuanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseName: string;
  userAccountAddress: string;
  courseManagerAddress: string;
}

export default function CertificateIssuanceModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  userAccountAddress,
  courseManagerAddress
}: CertificateIssuanceModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuingCertificates, setIssuingCertificates] = useState<string[]>([]);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const { sendTransaction } = usePrivyAuth();
  const { addNotification } = useAppStore();

  // Load course students and their completion status
  useEffect(() => {
    if (isOpen && userAccountAddress && courseManagerAddress) {
      loadCourseStudents();
    }
  }, [isOpen, userAccountAddress, courseManagerAddress, courseId]);

  // Filter students based on search term
  useEffect(() => {
    const filtered = students.filter(student => 
      student.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const loadCourseStudents = async () => {
    setLoading(true);
    try {
      console.log('Loading course students with params:', {
        courseId,
        userAccountAddress,
        courseManagerAddress
      });

      const provider = new ethers.providers.JsonRpcProvider(
        'https://alfajores-forno.celo-testnet.org'
      );

      const userAccountContract = new ethers.Contract(
        userAccountAddress,
        USER_ACCOUNT_ABI,
        provider
      );

      const courseManagerContract = new ethers.Contract(
        courseManagerAddress,
        COURSE_MANAGER_ABI,
        provider
      );

      // Get course details first to verify the course exists
      console.log('Getting course details for courseId:', courseId);
      try {
        const course = await courseManagerContract.getCourse(courseId);
        console.log('Course details:', course);
        setCourseDetails(course);
      } catch (error) {
        console.error('Course not found:', error);
        addNotification({
          type: 'info',
          title: 'Demo Mode',
          message: `Course with ID ${courseId} not found on blockchain. Showing demo data for testing.`
        });
        setIsDemoMode(true); // Set demo mode if course not found
        
        // Show demo students for testing
        const demoStudents: Student[] = [
          {
            address: '0x1234567890123456789012345678901234567890',
            name: 'John Doe',
            email: 'john.doe@example.com',
            enrolledAt: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
            completedAt: Math.floor(Date.now() / 1000) - 86400 * 5, // 5 days ago
            isCompleted: true,
            certificateIssued: false
          },
          {
            address: '0x2345678901234567890123456789012345678901',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            enrolledAt: Math.floor(Date.now() / 1000) - 86400 * 25, // 25 days ago
            completedAt: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
            isCompleted: true,
            certificateIssued: true
          },
          {
            address: '0x3456789012345678901234567890123456789012',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            enrolledAt: Math.floor(Date.now() / 1000) - 86400 * 15, // 15 days ago
            completedAt: undefined,
            isCompleted: false,
            certificateIssued: false
          }
        ];
        
        setStudents(demoStudents);
        return;
      }

      // Get all students enrolled in this course - use CourseManager directly
      console.log('Getting course students for courseId:', courseId);
      const studentAddresses = await courseManagerContract.getCourseStudents(courseId);
      console.log('Student addresses:', studentAddresses);
      
      if (!studentAddresses || studentAddresses.length === 0) {
        console.log('No students found for this course');
        addNotification({
          type: 'info',
          title: 'No Students Found',
          message: 'No students enrolled yet. Showing demo data for testing purposes.'
        });
        
        // Show demo students for testing when no real students found
        const demoStudents: Student[] = [
          {
            address: '0x1234567890123456789012345678901234567890',
            name: 'John Doe',
            email: 'john.doe@example.com',
            enrolledAt: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
            completedAt: Math.floor(Date.now() / 1000) - 86400 * 5, // 5 days ago
            isCompleted: true,
            certificateIssued: false
          },
          {
            address: '0x2345678901234567890123456789012345678901',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            enrolledAt: Math.floor(Date.now() / 1000) - 86400 * 25, // 25 days ago
            completedAt: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
            isCompleted: true,
            certificateIssued: true
          },
          {
            address: '0x3456789012345678901234567890123456789012',
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            enrolledAt: Math.floor(Date.now() / 1000) - 86400 * 15, // 15 days ago
            completedAt: undefined,
            isCompleted: false,
            certificateIssued: false
          },
          {
            address: '0x4567890123456789012345678901234567890123',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            enrolledAt: Math.floor(Date.now() / 1000) - 86400 * 20, // 20 days ago
            completedAt: Math.floor(Date.now() / 1000) - 86400 * 1, // 1 day ago
            isCompleted: true,
            certificateIssued: false
          },
          {
            address: '0x5678901234567890123456789012345678901234',
            name: 'David Brown',
            email: 'david.brown@example.com',
            enrolledAt: Math.floor(Date.now() / 1000) - 86400 * 10, // 10 days ago
            completedAt: undefined,
            isCompleted: false,
            certificateIssued: false
          }
        ];
        
        setIsDemoMode(true);
        setStudents(demoStudents);
        return;
      }
      
      // Get enrollment details for each student
      const studentPromises = studentAddresses.map(async (address: string) => {
        try {
          const enrollment = await courseManagerContract.getEnrollment(address, courseId);
          const isCompleted = await userAccountContract.hasStudentCompleted(address, courseId);
          const hasCertificate = await userAccountContract.hasStudentCertificate(address, courseId);
          
          return {
            address,
            enrolledAt: enrollment.enrolledAt.toNumber(),
            completedAt: enrollment.completedAt.toNumber(),
            isCompleted,
            certificateIssued: hasCertificate
          };
        } catch (error) {
          console.error(`Error getting enrollment for student ${address}:`, error);
          // Return a default enrollment if there's an error
          return {
            address,
            enrolledAt: 0,
            completedAt: 0,
            isCompleted: false,
            certificateIssued: false
          };
        }
      });

      const studentData = await Promise.all(studentPromises);
      console.log('Student data:', studentData);
      setStudents(studentData);
    } catch (error) {
      console.error('Failed to load course students:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Load Students',
        message: `Could not load course students: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (studentAddress: string) => {
    if (!sendTransaction) {
      addNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to issue certificates.'
      });
      return;
    }

    setIssuingCertificates(prev => [...prev, studentAddress]);
    
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://alfajores-forno.celo-testnet.org'
      );

      const userAccountContract = new ethers.Contract(
        userAccountAddress,
        USER_ACCOUNT_ABI,
        provider
      );

      const issueCertificateData = userAccountContract.interface.encodeFunctionData(
        'issueCertificateForCourse',
        [courseId, studentAddress]
      );

      const transaction = {
        to: userAccountAddress,
        data: issueCertificateData,
        value: '0x0', // No ETH value needed for this function
      };

      const result = await sendTransaction(transaction);
      const receipt = await provider.waitForTransaction(result.hash);

      // Update local state
      setStudents(prev => prev.map(student => 
        student.address === studentAddress 
          ? { ...student, certificateIssued: true }
          : student
      ));

      addNotification({
        type: 'success',
        title: 'Certificate Issued',
        message: `Certificate issued successfully to ${studentAddress.slice(0, 6)}...${studentAddress.slice(-4)}`
      });
    } catch (error) {
      console.error('Failed to issue certificate:', error);
      addNotification({
        type: 'error',
        title: 'Certificate Issuance Failed',
        message: 'Failed to issue certificate. Please try again.'
      });
    } finally {
      setIssuingCertificates(prev => prev.filter(addr => addr !== studentAddress));
    }
  };

  const handleIssueAllCertificates = async () => {
    const eligibleStudents = students.filter(student => 
      student.isCompleted && !student.certificateIssued
    );

    if (eligibleStudents.length === 0) {
      addNotification({
        type: 'info',
        title: 'No Eligible Students',
        message: 'No eligible students found for certificate issuance'
      });
      return;
    }

    if (!confirm(`Issue certificates to ${eligibleStudents.length} eligible students?`)) {
      return;
    }

    setIssuingCertificates(eligibleStudents.map(s => s.address));

    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://alfajores-forno.celo-testnet.org'
      );

      const userAccountContract = new ethers.Contract(
        userAccountAddress,
        USER_ACCOUNT_ABI,
        provider
      );

      // Issue certificates to all eligible students
      for (const student of eligibleStudents) {
        try {
          const issueCertificateData = userAccountContract.interface.encodeFunctionData(
            'issueCertificateForCourse',
            [courseId, student.address]
          );

          const transaction = {
            to: userAccountAddress,
            data: issueCertificateData,
            value: '0x0',
          };

          const result = await sendTransaction(transaction);
          await provider.waitForTransaction(result.hash);
          
          // Update local state
          setStudents(prev => prev.map(s => 
            s.address === student.address 
              ? { ...s, certificateIssued: true }
              : s
          ));
        } catch (error) {
          console.error(`Failed to issue certificate to ${student.address}:`, error);
        }
      }

      addNotification({
        type: 'success',
        title: 'Certificates Issued',
        message: `Successfully issued certificates to ${eligibleStudents.length} students`
      });
    } catch (error) {
      console.error('Failed to issue certificates:', error);
      addNotification({
        type: 'error',
        title: 'Certificate Issuance Failed',
        message: 'Some certificates failed to issue. Please check the console for details.'
      });
    } finally {
      setIssuingCertificates([]);
    }
  };

  const getStudentStatus = (student: Student) => {
    if (student.certificateIssued) {
      return { status: 'Certificate Issued', variant: 'default' as const, icon: Award };
    } else if (student.isCompleted) {
      return { status: 'Completed', variant: 'secondary' as const, icon: CheckCircle };
    } else {
      return { status: 'In Progress', variant: 'outline' as const, icon: Clock };
    }
  };

  const eligibleStudentsCount = students.filter(s => s.isCompleted && !s.certificateIssued).length;
  const completedStudentsCount = students.filter(s => s.isCompleted).length;
  const certificateIssuedCount = students.filter(s => s.certificateIssued).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Issue Certificates</h3>
            <p className="text-sm text-gray-600">Course: {courseName}</p>
            {isDemoMode && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  🧪 Demo Mode - Showing test data (no real students found). Certificate issuance is disabled.
                </p>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="w-4 h-4" />
          </Button>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-lg font-bold">{students.length}</div>
                  <div className="text-xs text-gray-600">Total Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-lg font-bold">{completedStudentsCount}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-lg font-bold">{certificateIssuedCount}</div>
                  <div className="text-xs text-gray-600">Certificates Issued</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCourseStudents}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {eligibleStudentsCount > 0 && (
            <Button
              onClick={handleIssueAllCertificates}
              disabled={issuingCertificates.length > 0 || isDemoMode}
              className="bg-green-600 hover:bg-green-700"
            >
              <Award className="w-4 h-4 mr-2" />
              Issue All ({eligibleStudentsCount})
            </Button>
          )}
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">Loading students...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No students found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => {
                const status = getStudentStatus(student);
                const StatusIcon = status.icon;
                
                return (
                  <Card key={student.address} className="hover:bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {student.name || `${student.address.slice(0, 6)}...${student.address.slice(-4)}`}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {student.address}
                            </div>
                            <div className="text-xs text-gray-400">
                              Enrolled: {new Date(student.enrolledAt * 1000).toLocaleDateString()}
                              {student.completedAt && (
                                <span className="ml-2">
                                  • Completed: {new Date(student.completedAt * 1000).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant={status.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.status}
                          </Badge>
                          
                          {student.isCompleted && !student.certificateIssued && (
                            <Button
                              size="sm"
                              onClick={() => handleIssueCertificate(student.address)}
                              disabled={issuingCertificates.includes(student.address) || isDemoMode}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {issuingCertificates.includes(student.address) ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Issuing...
                                </>
                              ) : (
                                <>
                                  <Award className="w-4 h-4 mr-2" />
                                  Issue Certificate
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 