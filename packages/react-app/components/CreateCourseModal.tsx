import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Plus, BookOpen, Clock, DollarSign, FileText, Upload, Image as ImageIcon } from 'lucide-react';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: CourseFormData) => void;
  isCreating?: boolean;
}

export interface CourseFormData {
  name: string;
  description: string;
  price: string;
  duration: number;
  courseUri: string;
  requiresAssessment: boolean;
  // Additional fields for comprehensive course data
  courseCreator: string;
  courseCategory: string;
  difficultyLevel: string;
  studentRequirements: string;
  learningObjectives: string;
  targetAudience: string;
  courseImage: {
    file?: File;
    url?: string;
    ipfsHash?: string;
  };
  courseCurriculum: Array<{
    name: string;
    description: string;
    video?: File;
    videoUrl?: string;
    videoIpfsHash?: string;
    fileName?: string;
    fileSize?: number;
  }>;
  publishWithCertificate: boolean;
}

export default function CreateCourseModal({ isOpen, onClose, onSubmit, isCreating = false }: CreateCourseModalProps) {
  // Component state management
  const [formData, setFormData] = React.useState<CourseFormData>({
    name: '',
    description: '',
    price: '',
    duration: 30,
    courseUri: '',
    requiresAssessment: false,
    courseCreator: '',
    courseCategory: '',
    difficultyLevel: '',
    studentRequirements: '',
    learningObjectives: '',
    targetAudience: '',
    courseImage: {},
    courseCurriculum: [],
    publishWithCertificate: false,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [videoUploadProgress, setVideoUploadProgress] = React.useState<{[key: number]: number}>({});
  const [videoUploadStatus, setVideoUploadStatus] = React.useState<{[key: number]: 'idle' | 'uploading' | 'success' | 'error'}>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Step 1: Upload course image to IPFS (public)
      let courseImageIpfsHash = '';
      if (formData.courseImage.file) {
        setUploadProgress(10);
        courseImageIpfsHash = await uploadFileToIPFS(formData.courseImage.file);
        setUploadProgress(30);
      } else if (formData.courseImage.url) {
        // Handle data URL conversion like AttensysUI
        const blob = dataURLtoBlob(formData.courseImage.url);
        const realFile = new File([blob], `course-image-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        courseImageIpfsHash = await uploadFileToIPFS(realFile);
        setUploadProgress(30);
      }

      // Step 2: Prepare course metadata with proper structure (like AttensysUI)
      const courseMetadata = {
        courseName: formData.name,
        courseDescription: formData.description,
        courseCreator: formData.courseCreator,
        courseCategory: formData.courseCategory,
        difficultyLevel: formData.difficultyLevel,
        studentRequirements: formData.studentRequirements,
        learningObjectives: formData.learningObjectives,
        targetAudience: formData.targetAudience,
        courseImage: courseImageIpfsHash, // Just the IPFS hash, not the full URL
        courseCurriculum: formData.courseCurriculum.map(item => ({
          name: item.name,
          description: item.description,
          video: item.videoIpfsHash || '', // Video IPFS hash if available
          videoIpfsHash: item.videoIpfsHash || '',
          fileName: item.fileName || '',
          fileSize: item.fileSize || 0
        })),
        coursePricing: formData.price,
        publishWithCertificate: formData.publishWithCertificate,
        createdAt: new Date().toISOString(),
        // Additional fields like AttensysUI
        primaryGoal: formData.learningObjectives,
        courseArea: formData.courseCategory,
        courseIdentifier: "1",
        targetAudienceDesc: formData.targetAudience,
        promoAndDiscount: "",
      };

      // Step 3: Upload course metadata to IPFS
      setUploadProgress(50);
      const metadataIpfsHash = await uploadJsonToIPFS(courseMetadata);
      setUploadProgress(70);

      // Step 4: Update form data with IPFS hash
      const finalFormData = {
        ...formData,
        courseUri: metadataIpfsHash,
        courseImage: {
          ...formData.courseImage,
          ipfsHash: courseImageIpfsHash,
        },
      };

      setUploadProgress(90);
      await onSubmit(finalFormData);
      setUploadProgress(100);

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: 30,
        courseUri: '',
        requiresAssessment: false,
        courseCreator: '',
        courseCategory: '',
        difficultyLevel: '',
        studentRequirements: '',
        learningObjectives: '',
        targetAudience: '',
        courseImage: {},
        courseCurriculum: [],
        publishWithCertificate: false,
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
      // Add proper error handling like AttensysUI
      alert('Failed to create course. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const uploadFileToIPFS = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    // For large files (>10MB), use FormData approach to avoid base64 issues
    if (file.size > 10 * 1024 * 1024) {
      return uploadLargeFileToIPFS(file, onProgress);
    }

    // Convert file to base64 for API route
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          
          // Debug: Log data URL info
          console.log('File size:', file.size);
          console.log('Data URL length:', dataUrl?.length);
          console.log('Data URL starts with:', dataUrl?.substring(0, 50));
          console.log('Data URL ends with:', dataUrl?.substring(dataUrl.length - 20));
          
          // Validate data URL format
          if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
            throw new Error('Failed to read file as data URL');
          }

          // Check if data URL is complete (should end with base64 data)
          if (!dataUrl.includes('base64,')) {
            throw new Error('Incomplete data URL - missing base64 data');
          }

          const response = await fetch('/api/pinata/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: dataUrl,
              metadata: {
                name: file.name,
                type: file.type,
              },
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
          }

          const result = await response.json();
          resolve(result.cid);
        } catch (error) {
          console.error('Upload error:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Fallback function for large files using FormData
  const uploadLargeFileToIPFS = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      name: file.name,
      type: file.type,
    }));

    const response = await fetch('/api/pinata/upload-formdata', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Large file upload error:', errorData);
      throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
    }

    const result = await response.json();
    return result.cid;
  };

  const uploadJsonToIPFS = async (data: any): Promise<string> => {
    const response = await fetch('/api/pinata/upload-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        metadata: {
          name: `course-${formData.name}-${Date.now()}`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload course metadata');
    }

    const result = await response.json();
    return result.cid;
  };

  const getIpfsGatewayUrl = (ipfsHash: string, isPrivate: boolean = false): string => {
    if (isPrivate) {
      // Use custom gateway for private content
      return `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${ipfsHash}`;
    } else {
      // Use public gateway for public content
      return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50MB limit for images)
      if (file.size > 50 * 1024 * 1024) {
        alert('Image file size must be less than 50MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
          setFormData(prev => ({
            ...prev,
            courseImage: {
              file,
              url: dataUrl,
            },
          }));
        } else {
          alert('Failed to read image file. Please try again.');
        }
      };
      reader.onerror = () => {
        alert('Failed to read image file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const addCurriculumItem = () => {
    setFormData(prev => ({
      ...prev,
      courseCurriculum: [
        ...prev.courseCurriculum,
        { name: '', description: '' }
      ],
    }));
  };

  const updateCurriculumItem = (index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      courseCurriculum: prev.courseCurriculum.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeCurriculumItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      courseCurriculum: prev.courseCurriculum.filter((_, i) => i !== index),
    }));
  };

  const handleVideoChange = async (index: number, videoFile: File | null) => {
    if (!videoFile) {
      setFormData(prev => ({
        ...prev,
        courseCurriculum: prev.courseCurriculum.map((item, i) =>
          i === index ? { 
            ...item, 
            video: undefined, 
            videoUrl: undefined,
            videoIpfsHash: undefined,
            fileName: undefined, 
            fileSize: undefined 
          } : item
        ),
      }));
      setVideoUploadStatus(prev => ({ ...prev, [index]: 'idle' }));
      setVideoUploadProgress(prev => ({ ...prev, [index]: 0 }));
      return;
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }

    // Validate file size (50MB limit)
    if (videoFile.size > 50 * 1024 * 1024) {
      alert('Video file size must be less than 50MB');
      return;
    }

    setVideoUploadStatus(prev => ({ ...prev, [index]: 'uploading' }));
    setVideoUploadProgress(prev => ({ ...prev, [index]: 0 }));

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setVideoUploadProgress(prev => {
          const current = prev[index] || 0;
          if (current < 90) {
            return { ...prev, [index]: current + 10 };
          }
          return prev;
        });
      }, 200);

      // Upload video to IPFS
      const videoIpfsHash = await uploadFileToIPFS(videoFile, (progress) => {
        setVideoUploadProgress(prev => ({ ...prev, [index]: progress }));
      });

      clearInterval(progressInterval);
      setVideoUploadProgress(prev => ({ ...prev, [index]: 100 }));

      // Update form data with video information
      setFormData(prev => ({
        ...prev,
        courseCurriculum: prev.courseCurriculum.map((item, i) =>
          i === index ? {
            ...item,
            video: videoFile,
            videoIpfsHash: videoIpfsHash,
            fileName: videoFile.name,
            fileSize: videoFile.size,
          } : item
        ),
      }));

      setVideoUploadStatus(prev => ({ ...prev, [index]: 'success' }));

      // Clear success status after 3 seconds
      setTimeout(() => {
        setVideoUploadStatus(prev => ({ ...prev, [index]: 'idle' }));
        setVideoUploadProgress(prev => ({ ...prev, [index]: 0 }));
      }, 3000);

    } catch (error) {
      console.error('Video upload error:', error);
      setVideoUploadStatus(prev => ({ ...prev, [index]: 'error' }));
      setVideoUploadProgress(prev => ({ ...prev, [index]: 0 }));
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setVideoUploadStatus(prev => ({ ...prev, [index]: 'idle' }));
      }, 5000);
    }
  };

  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleVideoChange(index, file);
    }
  };

  // Helper function to convert data URL to blob (like AttensysUI)
  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  };

  // Component render logic
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <CardTitle>Create New Course</CardTitle>
                <CardDescription>Add a new course with IPFS storage</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isSubmitting && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">
                  {uploadProgress < 20 ? 'Uploading course image...' : 
                   uploadProgress < 50 ? 'Uploading videos to IPFS...' :
                   uploadProgress < 70 ? 'Preparing course metadata...' :
                   uploadProgress < 90 ? 'Uploading metadata to IPFS...' : 
                   'Creating course on blockchain...'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {uploadProgress < 20 ? 'Uploading course image to IPFS' : 
                 uploadProgress < 50 ? 'Uploading lecture videos to IPFS' :
                 uploadProgress < 70 ? 'Preparing course metadata' :
                 uploadProgress < 90 ? 'Uploading course metadata to IPFS' : 
                 'Creating smart contract transaction...'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Course Name *</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter course name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

                  {/* Course Creator */}
                  <div className="space-y-2">
                    <Label htmlFor="creator" className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Course Creator *</span>
                    </Label>
                    <Input
                      id="creator"
                      placeholder="Enter creator name"
                      value={formData.courseCreator}
                      onChange={(e) => handleInputChange('courseCreator', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Course Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                    <span>Course Description *</span>
              </Label>
              <Textarea
                id="description"
                    placeholder="Enter course description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Course Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Course Category *</Label>
                    <select
                      id="category"
                      value={formData.courseCategory}
                      onChange={(e) => handleInputChange('courseCategory', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="blockchain">Blockchain</option>
                      <option value="web3">Web3</option>
                      <option value="defi">DeFi</option>
                      <option value="nft">NFT</option>
                      <option value="cryptocurrency">Cryptocurrency</option>
                      <option value="smart-contracts">Smart Contracts</option>
                    </select>
                  </div>

                  {/* Difficulty Level */}
              <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level *</Label>
                    <select
                      id="difficulty"
                      value={formData.difficultyLevel}
                      onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                  required
                    >
                      <option value="">Select level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
              </div>
              
                  {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Duration (days) *</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 30)}
                  required
                />
              </div>
            </div>

                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.name || !formData.description || !formData.courseCreator}
                  className="w-full"
                >
                  Next: Course Details
                </Button>
              </div>
            )}

            {/* Step 2: Course Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Requirements */}
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Student Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="What students should know before taking this course"
                      value={formData.studentRequirements}
                      onChange={(e) => handleInputChange('studentRequirements', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Learning Objectives */}
                  <div className="space-y-2">
                    <Label htmlFor="objectives">Learning Objectives</Label>
                    <Textarea
                      id="objectives"
                      placeholder="What students will learn from this course"
                      value={formData.learningObjectives}
                      onChange={(e) => handleInputChange('learningObjectives', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Textarea
                    id="audience"
                    placeholder="Who this course is designed for"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Course Image Upload */}
            <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Course Image</span>
              </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.courseImage.url ? (
                      <div className="space-y-4">
                        <img 
                          src={formData.courseImage.url} 
                          alt="Course preview" 
                          className="max-w-xs mx-auto rounded-lg"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Upload Course Image
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG, GIF up to 50MB
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep(3)}
                    className="flex-1"
                  >
                    Next: Curriculum & Pricing
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Curriculum & Pricing */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Course Curriculum */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Course Curriculum</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addCurriculumItem}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lecture
                    </Button>
            </div>

                  {formData.courseCurriculum.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                        <h4 className="font-medium">Lecture {index + 1}</h4>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeCurriculumItem(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Lecture title"
                          value={item.name}
                          onChange={(e) => updateCurriculumItem(index, 'name', e.target.value)}
                        />
                        <Textarea
                          placeholder="Lecture description"
                          value={item.description}
                          onChange={(e) => updateCurriculumItem(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>

                      {/* Video Upload Section */}
                      <div className="space-y-2">
                        <Label className="flex items-center space-x-2">
                          <Upload className="w-4 h-4" />
                          <span>Lecture Video</span>
                </Label>
                        
                        {/* Upload Status Display */}
                        {videoUploadStatus[index] === 'uploading' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm font-medium text-blue-800">
                                  Uploading video...
                                </span>
                              </div>
                              <span className="text-sm text-blue-600">
                                {videoUploadProgress[index]}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${videoUploadProgress[index]}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {videoUploadStatus[index] === 'success' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium text-green-800">
                                Video uploaded successfully!
                              </span>
                            </div>
                          </div>
                        )}

                        {videoUploadStatus[index] === 'error' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                              </div>
                              <span className="text-sm font-medium text-red-800">
                                Upload failed. Please try again.
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {item.videoUrl ? (
                          <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Upload className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-green-800">
                                    {item.fileName || 'Video uploaded'}
                                  </p>
                                  {item.fileSize && (
                                    <p className="text-xs text-green-600">
                                      {(item.fileSize / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                  )}
                                  {item.videoIpfsHash && (
                                    <p className="text-xs text-green-600">
                                      IPFS: {item.videoIpfsHash.slice(0, 10)}...
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleVideoChange(index, null)}
                                disabled={videoUploadStatus[index] === 'uploading'}
                              >
                                Change Video
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                              videoUploadStatus[index] === 'uploading' 
                                ? 'border-blue-300 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDrop={(e) => handleVideoDrop(e, index)}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => {
                              if (videoUploadStatus[index] !== 'uploading') {
                                document.getElementById(`video-input-${index}`)?.click();
                              }
                            }}
                          >
                            <Upload className={`w-8 h-8 mx-auto mb-2 ${
                              videoUploadStatus[index] === 'uploading' ? 'text-blue-400' : 'text-gray-400'
                            }`} />
                            <p className="text-sm text-gray-600">
                              <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              MP4, MOV, MKV (max 50MB)
                            </p>
                            <input
                              id={`video-input-${index}`}
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleVideoChange(index, e.target.files?.[0] || null)}
                              className="hidden"
                              disabled={videoUploadStatus[index] === 'uploading'}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Price (ETH) *</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
              />
            </div>

                  {/* Certificate Toggle */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Issue Certificate</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="certificate"
                        checked={formData.publishWithCertificate}
                        onCheckedChange={(checked) => handleInputChange('publishWithCertificate', checked)}
                      />
                      <Label htmlFor="certificate">Automatically issue certificate upon completion</Label>
                    </div>
                  </div>
                </div>

                {/* Validation message */}
                {(!formData.name || !formData.description || !formData.price || !formData.courseCreator || !formData.courseCategory || !formData.difficultyLevel || formData.courseCurriculum.length === 0 || formData.courseCurriculum.some(item => !item.name || !item.description)) && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <div className="font-medium mb-1">Please complete the following:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {!formData.name && <li>Course name</li>}
                      {!formData.description && <li>Course description</li>}
                      {!formData.price && <li>Course price</li>}
                      {!formData.courseCreator && <li>Course creator</li>}
                      {!formData.courseCategory && <li>Course category</li>}
                      {!formData.difficultyLevel && <li>Difficulty level</li>}
                      {formData.courseCurriculum.length === 0 && <li>At least one curriculum item</li>}
                      {formData.courseCurriculum.some(item => !item.name) && <li>All curriculum items need names</li>}
                      {formData.courseCurriculum.some(item => !item.description) && <li>All curriculum items need descriptions</li>}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                    onClick={() => setCurrentStep(2)}
                className="flex-1"
              >
                    Previous
              </Button>
                  
              <Button
                type="submit"
                    disabled={
                      isSubmitting || 
                      isCreating || 
                      !formData.name || 
                      !formData.description || 
                      !formData.price || 
                      !formData.courseCreator ||
                      !formData.courseCategory ||
                      !formData.difficultyLevel ||
                      formData.courseCurriculum.length === 0 ||
                      formData.courseCurriculum.some(item => !item.name || !item.description)
                    }
                className="flex-1"
              >
                    {isSubmitting ? 'Uploading to IPFS...' : isCreating ? 'Creating Course...' : 'Create Course'}
              </Button>
            </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 