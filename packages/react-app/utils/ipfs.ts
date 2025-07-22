import { pinata } from './pinata';

export interface CourseMetadata {
  courseName: string;
  courseDescription: string;
  courseCreator: string;
  courseCategory: string;
  difficultyLevel: string;
  studentRequirements: string;
  learningObjectives: string;
  targetAudience: string;
  courseImage: string; // IPFS hash
  courseCurriculum: Array<{
    name: string;
    description: string;
    video?: string; // IPFS hash or URL
    videoUrl?: string; // Full URL
    videoIpfsHash?: string; // IPFS hash
    fileName?: string;
    fileSize?: number;
  }>;
  coursePricing: string;
  publishWithCertificate: boolean;
  createdAt: string;
}

export const getIpfsGatewayUrl = (ipfsHash: string, isPrivate: boolean = false): string => {
  if (isPrivate) {
    // Use custom gateway for private content
    const customGateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'gateway.pinata.cloud';
    return `https://${customGateway}/ipfs/${ipfsHash}`;
  } else {
    // Use public gateway for public content
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  }
};

export const fetchCourseMetadata = async (ipfsHash: string): Promise<CourseMetadata | null> => {
  try {
    // Try public gateway first for course metadata
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course metadata: ${response.statusText}`);
    }

    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching course metadata from IPFS:', error);
    return null;
  }
};

export const uploadCourseImage = async (file: File): Promise<string> => {
  try {
    const result = await pinata.upload.file(file);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading course image:', error);
    throw new Error('Failed to upload course image to IPFS');
  }
};

export const uploadCourseMetadata = async (metadata: CourseMetadata): Promise<string> => {
  try {
    const result = await pinata.upload.json(metadata);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading course metadata:', error);
    throw new Error('Failed to upload course metadata to IPFS');
  }
}; 