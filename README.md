# 🎓 EduCert - Decentralized Certificate Verification Platform

A **decentralized platform** for issuing and verifying **non-transferable digital certificates** on the **Celo**. EduCert empowers educational institutions, course creators, and online learning platforms to securely offer online courses & issue tamper-proof certificates for these courses, while allowing anyone to verify authenticity transparently.

> ✅ Powered by Celo | 🛡️ Secured by Smart Contracts | 🔍 Transparent & Verifiable | 💰 Monetized Learning

---

## 🎯 What is EduCert?

EduCert is a comprehensive **Web3 education platform** that revolutionizes how educational credentials are issued, managed, and verified. Built on the Celo blockchain, it provides a complete ecosystem for:

- **Educational Institutions**: Create courses, manage enrollments, and issue verifiable certificates
- **Students**: Earn verifiable certificates and showcase achievements globally
- **Employers/Verifiers**: Instantly verify certificate authenticity on-chain

### 🏗️ Architecture Overview

EduCert operates on a **three-tier smart contract architecture**:

1. **AccountFactory** - Manages institution registration and account creation
2. **CourseManager** - Handles course creation, enrollment, and certificate issuance
3. **Certificate** - ERC1155 non-transferable NFTs representing achievements

---

## 👥 Target Users & Use Cases

### 🏫 Educational Institutions
- **Universities & Colleges**: Issue degree certificates and course completion credentials
- **Online Learning Platforms**: Integrate blockchain verification into existing systems
- **Corporate Training Providers**: Issue professional development certificates
- **Bootcamps & Workshops**: Provide verifiable completion certificates

### 👨‍🎓 Students & Learners
- **University Students**: Receive verifiable degree and course certificates
- **Online Learners**: Earn certificates from various platforms with unified verification
- **Professionals**: Obtain continuing education credits and certifications
- **Job Seekers**: Showcase verifiable skills and achievements to employers

### 🏢 Employers & Verifiers
- **HR Departments**: Verify candidate credentials instantly
- **Recruitment Agencies**: Validate candidate qualifications
- **Professional Bodies**: Verify continuing education requirements
- **Government Agencies**: Validate educational credentials for licensing

---

## 💼 Business Model & Revenue Streams

### 🎯 Primary Revenue Model: **Course Monetization**

EduCert operates on a **commission-based revenue model** where:

1. **Course Creators** set their own course prices (in ETH)
2. **Platform Fee**: EduCert takes a percentage of each course sale
3. **Smart Contract Revenue**: Fees are automatically collected on-chain
4. **Scalable Model**: Revenue grows with platform adoption

### 💰 Revenue Streams

| Revenue Stream | Description | Target |
|---------------|-------------|---------|
| **Course Commission** | Percentage of course sales | Primary revenue |
| **Premium Features** | Advanced analytics, bulk operations | Institutions |
| **API Access** | Third-party integrations | Enterprise clients |
| **Verification Services** | Premium verification features | Employers/Verifiers |
| **White-label Solutions** | Custom deployments for institutions | Enterprise |


## 🔧 Technical Architecture

### 🏭 Smart Contract System

#### **AccountFactory Contract** (`0x6ae719435cAc9003bf49f4107d8a7C65F7E1e810`)
- **Purpose**: Institution registration and account management
- **Features**:
  - Account creation with role-based permissions
  - Institution verification and approval workflow
  - Account activation/deactivation controls
  - Integration with CourseManager for course creation

#### **CourseManager Contract** (`0x360977e8eBe61af2Bbc2937FAE2F0297Ee8C6ad5`)
- **Purpose**: Course lifecycle management and certificate issuance
- **Features**:
  - Course creation with pricing and duration
  - Student enrollment and progress tracking
  - Completion verification and certificate issuance
  - Revenue distribution and analytics
  - Creator authorization and management

#### **Certificate Contract** (`0xA2efe1AC0aA3b2fCb53CCC9b2d110855F79415A5`)
- **Purpose**: Non-transferable ERC1155 certificate NFTs
- **Features**:
  - Immutable certificate issuance
  - On-chain verification capabilities
  - Non-transferable design prevents fraud
  - Metadata storage for certificate details

### 🌐 Frontend Architecture

#### **Technology Stack**
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: Radix UI + Tailwind CSS
- **Authentication**: Privy for Web3 wallet integration
- **State Management**: Zustand for global state
- **Blockchain Integration**: Ethers.js + Wagmi
- **Deployment**: Netlify for frontend hosting

#### **User Interfaces**

##### **🏫 Institution Dashboard**
- Course creation and management
- Student enrollment tracking
- Certificate issuance workflow
- Revenue analytics and reporting
- Account settings and profile management

##### **👨‍🎓 Student Dashboard**
- Course enrollment and progress tracking
- Certificate collection and display
- Learning analytics and achievements
- Profile management and wallet integration

##### **🔍 Certificate Verification**
- Public verification interface
- QR code generation for certificates
- Bulk verification capabilities
- Verification history and analytics

##### **⚙️ Admin Panel**
- Platform-wide analytics
- Institution approval workflow
- System configuration and management
- Revenue tracking and distribution

---

## 🌐 Network & Deployment Status

### ✅ **Live on Celo Alfajores Testnet**

| Contract | Address | Status | Explorer |
|----------|---------|--------|----------|
| **AccountFactory** | `0x6ae719435cAc9003bf49f4107d8a7C65F7E1e810` | ✅ Deployed & Verified | [🔗 View](https://celo-alfajores.blockscout.com/address/0x6ae719435cAc9003bf49f4107d8a7C65F7E1e810) |
| **CourseManager** | `0x360977e8eBe61af2Bbc2937FAE2F0297Ee8C6ad5` | ✅ Deployed & Verified | [🔗 View](https://celo-alfajores.blockscout.com/address/0x360977e8eBe61af2Bbc2937FAE2F0297Ee8C6ad5) |
| **Certificate** | `0xA2efe1AC0aA3b2fCb53CCC9b2d110855F79415A5` | ✅ Deployed & Verified | [🔗 View](https://celo-alfajores.blockscout.com/address/0xA2efe1AC0aA3b2fCb53CCC9b2d110855F79415A5) |
| **Sample Institution** | `0xaDAf107B49f360960b18Ad6DAC128fA81aB65091` | ✅ Created | [🔗 View](https://celo-alfajores.blockscout.com/address/0xaDAf107B49f360960b18Ad6DAC128fA81aB65091) |

### 🌍 **Network Configuration**
- **Network**: Celo Alfajores Testnet
- **Chain ID**: 44787
- **RPC URL**: `https://alfajores-forno.celo-testnet.org`
- **Block Explorer**: `https://celo-alfajores.blockscout.com`
- **Native Currency**: CELO

---

## 🚀 Current Status & Next Steps

### ✅ **Completed Features**

- [x] **Smart Contract Development**
  - AccountFactory with institution management
  - CourseManager with full course lifecycle
  - Certificate contract with ERC1155 implementation
  - Complete integration and testing

- [x] **Frontend Development**
  - Institution dashboard with course management
  - Student dashboard with progress tracking
  - Certificate verification interface
  - Admin panel for platform management
  - Wallet integration and authentication

- [x] **Deployment & Testing**
  - All contracts deployed to Alfajores testnet
  - Contract verification on block explorer
  - Sample data and institution creation
  - Integration testing and validation

### 🔄 **In Progress**

- [ ] **Production Deployment**
  - Mainnet contract deployment on Celo
  - Production environment setup
  - Smart contract integrations
  - Security audit and optimization

- [ ] **Advanced Features**
  - IPFS integration for certificate metadata
  - Advanced analytics and reporting
  - API development for third-party integrations


## 💡 Why EduCert Matters

### 🎯 **Problem Solved**
- **Certificate Fraud**: Eliminates fake certificates through blockchain verification
- **Verification Costs**: Reduces time and cost of credential verification
- **Global Recognition**: Enables worldwide recognition of educational achievements
- **Monetization**: Provides new revenue streams for educational content creators

### 🌟 **Key Advantages**
- **Decentralized**: No single point of failure or control
- **Transparent**: All transactions and verifications are public
- **Cost-Effective**: Lower fees compared to traditional verification services
- **Scalable**: Can handle millions of certificates and verifications
- **Interoperable**: Works with existing educational systems

### 🎓 **Impact on Education**
- **Democratization**: Makes quality education credentials accessible globally
- **Innovation**: Enables new educational business models
- **Trust**: Builds trust in online education and remote learning
- **Efficiency**: Streamlines credential verification processes

---

## 🤝 Getting Started

### **For Institutions**
1. Connect your wallet (MetaMask, WalletConnect) or simply login with email
2. Set up your institution account
3. Create courses and set pricing
4. Start enrolling students, upload courses & issuing certificates

### **For Students**
1. Browse available courses
2. Enroll and complete courses
3. Receive verifiable certificates
4. Share certificates with employers

### **For Verifiers**
1. Use the verification interface
2. Enter certificate details or scan QR codes
3. Get instant verification results
4. Access verification history and analytics

