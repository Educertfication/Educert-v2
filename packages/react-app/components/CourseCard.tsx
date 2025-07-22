import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BookOpen, 
  Users, 
  Clock, 
  DollarSign, 
  Award, 
  Eye, 
  Edit, 
  Trash2,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { fetchCourseMetadata, CourseMetadata, getIpfsGatewayUrl } from '../utils/ipfs';

interface CourseCardProps {
  course: {
    courseId: number;
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
    creator: string;
    courseCreator?: string;
    courseCategory?: string;
    difficultyLevel?: string;
    courseImage?: {
      file?: File;
      url?: string;
      ipfsHash?: string;
    };
  };
  onEdit?: (courseId: number) => void;
  onDelete?: (courseId: number) => void;
  onView?: (courseId: number) => void;
}

export default function CourseCard({ course, onEdit, onDelete, onView }: CourseCardProps) {
  const [metadata, setMetadata] = useState<CourseMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      if (course.courseUri && (course.courseUri.startsWith('Qm') || course.courseUri.startsWith('bafy'))) {
        setIsLoadingMetadata(true);
        try {
          const courseMetadata = await fetchCourseMetadata(course.courseUri);
          setMetadata(courseMetadata);
        } catch (error) {
          console.error('Failed to load course metadata:', error);
        } finally {
          setIsLoadingMetadata(false);
        }
      }
    };

    loadMetadata();
  }, [course.courseUri]);

  const getCourseImage = () => {
    if (course.courseImage?.url) {
      return course.courseImage.url;
    }
    if (course.courseImage?.ipfsHash) {
      // Images are stored on public Pinata, so use public gateway
      return `https://gateway.pinata.cloud/ipfs/${course.courseImage.ipfsHash}`;
    }
    if (metadata?.courseImage) {
      // If metadata contains a full URL, use it directly
      if (metadata.courseImage.startsWith('http')) {
        return metadata.courseImage;
      }
      // Otherwise, assume it's a hash and use public gateway
      return `https://gateway.pinata.cloud/ipfs/${metadata.courseImage}`;
    }
    return null;
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'blockchain':
        return 'bg-blue-100 text-blue-800';
      case 'web3':
        return 'bg-purple-100 text-purple-800';
      case 'defi':
        return 'bg-green-100 text-green-800';
      case 'nft':
        return 'bg-pink-100 text-pink-800';
      case 'cryptocurrency':
        return 'bg-orange-100 text-orange-800';
      case 'smart-contracts':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-accent-50">
        {getCourseImage() ? (
          <img
            src={getCourseImage()!}
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-4 right-4">
          <Badge variant={course.isActive ? "default" : "secondary"}>
            {course.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="absolute bottom-4 left-4">
          <Badge className="bg-white/90 text-gray-900">
            <DollarSign className="w-3 h-3 mr-1" />
            {course.price} ETH
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {course.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {course.description}
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {course.courseCategory && (
            <Badge className={getCategoryColor(course.courseCategory)}>
              {course.courseCategory}
            </Badge>
          )}
          {course.difficultyLevel && (
            <Badge className={getDifficultyColor(course.difficultyLevel)}>
              {course.difficultyLevel}
            </Badge>
          )}
          {course.requiresAssessment && (
            <Badge variant="outline">
              <Award className="w-3 h-3 mr-1" />
              Assessment Required
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {course.totalEnrollments}
            </div>
            <div className="text-xs text-gray-500">Students</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {course.totalCompletions}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {course.duration}
            </div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
        </div>

        {metadata && showFullDetails && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">Learning Objectives</h4>
              <p className="text-sm text-gray-600">{metadata.learningObjectives}</p>
            </div>
            
            {metadata.studentRequirements && (
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Requirements</h4>
                <p className="text-sm text-gray-600">{metadata.studentRequirements}</p>
              </div>
            )}

            {metadata.targetAudience && (
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Target Audience</h4>
                <p className="text-sm text-gray-600">{metadata.targetAudience}</p>
              </div>
            )}

            {metadata.courseCurriculum && metadata.courseCurriculum.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Curriculum ({metadata.courseCurriculum.length} lectures)</h4>
                <div className="space-y-2">
                  {metadata.courseCurriculum.map((lecture, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{lecture.name}</div>
                        <div className="text-gray-600 text-xs">{lecture.description}</div>
                      </div>
                      {lecture.videoIpfsHash && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getIpfsGatewayUrl(lecture.videoIpfsHash!, true), '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Watch
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created by: {metadata.courseCreator}</span>
              <span>Created: {new Date(metadata.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="flex space-x-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(course.courseId)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            )}
            
            {course.courseUri && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(getIpfsGatewayUrl(course.courseUri), '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                IPFS
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(course.courseId)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(course.courseId)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {metadata && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setShowFullDetails(!showFullDetails)}
          >
            {showFullDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        )}

        {isLoadingMetadata && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-sm text-gray-500">Loading metadata...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 