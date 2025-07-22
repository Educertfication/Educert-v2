import { NextApiRequest, NextApiResponse } from 'next';
import { PinataSDK } from 'pinata-web3';

// Configure API route to handle larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Increase size limit to 50MB
    },
  },
};

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || "",
  pinataGateway: process.env.GATEWAY_URL || "https://gateway.pinata.cloud",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, metadata } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Debug: Log file info
    console.log('Received file type:', typeof file);
    console.log('File length:', file?.length);
    console.log('File starts with:', file?.substring(0, 50));
    console.log('File ends with:', file?.substring(Math.max(0, file.length - 50)));

    // Validate that file is a data URL
    if (typeof file !== 'string' || !file.startsWith('data:')) {
      return res.status(400).json({ error: 'Invalid file format. Expected data URL.' });
    }

    // Check file size (base64 is ~33% larger than original)
    const base64Size = file.length;
    const estimatedOriginalSize = Math.ceil((base64Size * 3) / 4);
    
    if (estimatedOriginalSize > 50 * 1024 * 1024) { // 50MB limit
      return res.status(413).json({ 
        error: 'File too large', 
        details: `File size exceeds 50MB limit. Estimated size: ${(estimatedOriginalSize / (1024 * 1024)).toFixed(2)}MB` 
      });
    }

    // Extract base64 data and validate format
    const dataUrlMatch = file.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      console.error('Invalid data URL format. File starts with:', file.substring(0, 100));
      return res.status(400).json({ error: 'Invalid data URL format' });
    }

    const [, mimeType, base64Data] = dataUrlMatch;

    // Validate base64 data
    if (!base64Data || base64Data.length === 0) {
      return res.status(400).json({ error: 'Empty base64 data' });
    }

    // Check if base64 string is valid (only contains valid base64 characters)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64Data)) {
      console.error('Invalid base64 characters. Base64 data starts with:', base64Data.substring(0, 100));
      return res.status(400).json({ error: 'Invalid base64 characters detected' });
    }

    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Create file object
      const fileName = metadata?.name || `file-${Date.now()}`;
      const fileObject = new File([blob], fileName, { type: blob.type });

      // Upload file to Pinata
      const uploadResult = await pinata.upload.file(fileObject);

      return res.status(200).json({
        success: true,
        cid: uploadResult.IpfsHash,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`,
      });
    } catch (base64Error) {
      console.error('Base64 conversion error:', base64Error);
      return res.status(400).json({ 
        error: 'Failed to convert base64 data',
        details: 'The file data appears to be corrupted or in an invalid format'
      });
    }
  } catch (error) {
    console.error('Pinata upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
} 