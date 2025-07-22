import { NextApiRequest, NextApiResponse } from 'next';
import { PinataSDK } from 'pinata-web3';

// Configure API route to handle larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // JSON payloads can be large with course metadata
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
    const { data, metadata } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Upload JSON data to Pinata
    const uploadResult = await pinata.upload.json(data);

    return res.status(200).json({
      success: true,
      cid: uploadResult.IpfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`,
    });
  } catch (error) {
    console.error('Pinata JSON upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
} 