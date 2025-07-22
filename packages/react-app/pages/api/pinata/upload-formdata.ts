import { NextApiRequest, NextApiResponse } from 'next';
import { PinataSDK } from 'pinata-web3';
import formidable from 'formidable';
import { promises as fs } from 'fs';

// Configure API route to handle larger payloads
export const config = {
  api: {
    bodyParser: false, // Disable body parser for FormData
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
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];
    const metadata = fields.metadata?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Read the file
    const fileBuffer = await fs.readFile(file.filepath);
    const fileObject = new File([fileBuffer], file.originalFilename || 'file', {
      type: file.mimetype || 'application/octet-stream',
    });

    // Parse metadata
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        console.warn('Failed to parse metadata:', e);
      }
    }

    // Upload file to Pinata
    const uploadResult = await pinata.upload.file(fileObject);

    // Clean up temporary file
    try {
      await fs.unlink(file.filepath);
    } catch (e) {
      console.warn('Failed to clean up temporary file:', e);
    }

    return res.status(200).json({
      success: true,
      cid: uploadResult.IpfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`,
    });
  } catch (error) {
    console.error('Pinata FormData upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
} 