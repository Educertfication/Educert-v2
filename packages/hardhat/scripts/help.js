console.log("🚀 Educert v2 Deployment Commands");
console.log("=".repeat(50));

console.log("\n📋 Available Scripts:");
console.log("1. deploy.js - Main deployment script");
console.log("2. deploy-test.js - Test deployment with full verification");
console.log("3. verify-deployment.js - Verify existing deployment");
console.log("4. help.js - This help message");

console.log("\n🔧 Deployment Commands:");
console.log("npx hardhat run scripts/deploy.js --network localhost");
console.log("npx hardhat run scripts/deploy.js --network alfajores");
console.log("npx hardhat run scripts/deploy.js --network celo");

console.log("\n🧪 Test Deployment Commands:");
console.log("npx hardhat run scripts/deploy-test.js --network localhost");
console.log("npx hardhat run scripts/deploy-test.js --network alfajores");

console.log("\n✅ Verification Commands:");
console.log("npx hardhat run scripts/verify-deployment.js --network localhost");
console.log("npx hardhat run scripts/verify-deployment.js --network alfajores");

console.log("\n🧪 Testing Commands:");
console.log("npx hardhat test test/CourseManager.test.js");
console.log("npx hardhat test");

console.log("\n🔍 Contract Verification (after deployment):");
console.log("npx hardhat verify --network alfajores <CertificateAddress> <metadataURI> <ownerAddress>");
console.log("npx hardhat verify --network alfajores <AccountFactoryAddress> <certificateAddress>");
console.log("npx hardhat verify --network alfajores <CourseManagerAddress> <factoryAddress> <certificateAddress> <ownerAddress>");

console.log("\n📁 Configuration Files:");
console.log("- deployments.json - Contract addresses for each network");
console.log("- hardhat.config.js - Network configuration");
console.log("- DEPLOYMENT.md - Detailed deployment guide");

console.log("\n🎯 Quick Start:");
console.log("1. npx hardhat node");
console.log("2. npx hardhat run scripts/deploy.js --network localhost");
console.log("3. npx hardhat run scripts/verify-deployment.js --network localhost");
console.log("4. npx hardhat test test/CourseManager.test.js");

console.log("\n📖 For detailed information, see DEPLOYMENT.md"); 