// Contract ABIs - Using proper function signatures that match the actual contracts
const accountFactoryAbi = [
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{"type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "string", "name": "name"}, {"type": "string", "name": "email"}],
    "name": "registerStudent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "string", "name": "name"}, {"type": "string", "name": "email"}, {"type": "string", "name": "description"}],
    "name": "registerInstitution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "institution"}, {"type": "bool", "name": "verified"}],
    "name": "verifyInstitution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "institution"}],
    "name": "isInstitutionVerified",
    "outputs": [{"type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "institution"}],
    "name": "getInstitutionInfo",
    "outputs": [
      {"type": "string", "name": "name"},
      {"type": "string", "name": "email"},
      {"type": "string", "name": "description"},
      {"type": "bool", "name": "isVerified"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "student"}],
    "name": "getStudentInfo",
    "outputs": [
      {"type": "string", "name": "name"},
      {"type": "string", "name": "email"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getInstitutionCount",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "string", "name": "name"}, {"type": "string", "name": "email"}],
    "name": "updateStudentProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const certificateAbi = [
  {
    "inputs": [{"type": "address", "name": "student"}, {"type": "string", "name": "course"}],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256", "name": "certificateId"}],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256", "name": "certificateId"}],
    "name": "verifyCertificate",
    "outputs": [{"type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256", "name": "certificateId"}],
    "name": "getCertificate",
    "outputs": [
      {"type": "address", "name": "student"},
      {"type": "address", "name": "institution"},
      {"type": "string", "name": "course"},
      {"type": "uint256", "name": "issuedAt"},
      {"type": "bool", "name": "isRevoked"},
      {"type": "string", "name": "metadata"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCertificateCount",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "student"}],
    "name": "getCertificatesByStudent",
    "outputs": [{"type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "institution"}],
    "name": "getCertificatesByInstitution",
    "outputs": [{"type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const courseManagerAbi = [
  {
    "inputs": [
      {"type": "string", "name": "name"},
      {"type": "string", "name": "description"},
      {"type": "uint256", "name": "duration"}
    ],
    "name": "createCourse",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256", "name": "courseId"}, {"type": "address", "name": "student"}],
    "name": "enrollStudent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256", "name": "courseId"}],
    "name": "getCourse",
    "outputs": [
      {"type": "string", "name": "name"},
      {"type": "string", "name": "description"},
      {"type": "uint256", "name": "duration"},
      {"type": "address", "name": "institution"},
      {"type": "bool", "name": "isActive"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCourseCount",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "institution"}],
    "name": "getCoursesByInstitution",
    "outputs": [{"type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256", "name": "courseId"}],
    "name": "getEnrolledStudents",
    "outputs": [{"type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract addresses (replace with actual deployed addresses)
const CONTRACT_ADDRESSES = {
  accountFactory: '0x...', // Replace with actual address
  certificate: '0x...', // Replace with actual address
  courseManager: '0x...', // Replace with actual address
};

export const contractConfig = {
  accountFactory: {
    address: CONTRACT_ADDRESSES.accountFactory as `0x${string}`,
    abi: accountFactoryAbi,
  },
  certificate: {
    address: CONTRACT_ADDRESSES.certificate as `0x${string}`,
    abi: certificateAbi,
  },
  courseManager: {
    address: CONTRACT_ADDRESSES.courseManager as `0x${string}`,
    abi: courseManagerAbi,
  },
}; 