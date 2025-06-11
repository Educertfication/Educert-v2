# 🎓 EduCert - Certificate Verification Platform

A **decentralized platform** for issuing and verifying **non-transferable digital certificates** on the **Celo blockchain**. EduCert empowers educational institutions, event organizers, and online platforms to securely issue tamper-proof certificates, while allowing anyone to verify authenticity transparently.

> ✅ Powered by Celo | 🛡️ Secured by Smart Contracts | 🔍 Transparent & Verifiable

---

## 🔑 Core Features

* **Account Management**

  * Anyone can create an account (on the mvp, anyone can create an organization account, in the road map, organization will undergo verification and approval workflow)
  * Each wallet address can only register an org once
  * Account creation, status management, and role assignment

* **Certificate Issuance & Verification**

  * Mint and assign **non-transferable ERC1155 certificates**
  * Public, on-chain verification of certificate authenticity
  * Role-based permission to issue/burn certificates

* **Role-Based Access Control**

  * Admins, institutions, and regular users have distinct privileges
  * Fine-grained control over who can issue and revoke certificates

* **On-Chain Transparency**

  * Certificate metadata and records stored on-chain
  * Easy integration with external verification tools

---

## 🧠 Smart Contract Architecture

### 🏭 `AccountFactory` Contract

* Facilitates account creation
* Maintains a registry of user profiles with:

  * Name, role, and creation timestamp
* Allows owner to **deactivate/reactivate** accounts

### 🧾 `Certificate` Contract

* ERC1155 standard-based implementation
* Certificates are **non-transferable**
* Only authorized accounts can:

  * Mint new certificates
  * Burn/revoke existing certificates

### 👤 `UserAccount` Contract

* Represents individual user data
* Stores information needed to verify account activity

---

## 🌐 Network & Deployment Details

| Contract       | Network                | Address                                                                                                                                        |
| -------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| AccountFactory | Celo Alfajores Testnet | `0x504195e2a73A2Cd0f3c691e49ADC93E509cFdA79` [🔗 Blockscout](https://alfajores.celoscan.io/address/0x504195e2a73A2Cd0f3c691e49ADC93E509cFdA79) |
| Certificate    | Celo Alfajores Testnet | `0x73bb8f35F79e7472Af9E5657e8DCD15b22E8B7C6` [🔗 Blockscout](https://alfajores.celoscan.io/address/0x73bb8f35F79e7472Af9E5657e8DCD15b22E8B7C6) |                                                                                                  |

---

## 🚀 Roadmap

### ✅ Completed

* [x] Deploy core contracts to Alfajores testnet
* [x] Implement role-based certificate issuance
* [x] Non-transferable ERC1155 design
* [x] Account creation & validation
* [x] Public on-chain certificate verification

### 🔜 In Progress / Coming Soon

* [ ] 🌐 **Frontend Web App**

  * Intuitive dashboard for issuers and recipients
  * QR code generation for verifying certificates
* [ ] 🧾 **Custom Metadata Support**

  * Include course title, date, instructor, and unique serial ID
* [ ] 🧩 **IPFS Integration**

  * Store supporting documents and images off-chain via IPFS
* [ ] 🔐 **ZK Verification Module**

  * Private verifications using zero-knowledge proofs

### 📅 Planned Features

* [ ] 🧑‍🎓 **Student Profile Pages**

  * Showcase earned certificates and badges
* [ ] 🏫 **Institution Onboarding Workflow**

  * Apply and get verified as an educational provider
* [ ] 🪪 **NFT Credential Badge System**

  * Gamified non-transferable badges for bootcamps, hackathons, etc.
* [ ] 📊 **Analytics Dashboard**

  * Track certificate issuance statistics
* [ ] 🤝 **Integration with Learning Platforms**

  * Plug-and-play module for online course providers like Moodle, Google Classroom

---
