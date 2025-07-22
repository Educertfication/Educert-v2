const hre = require("hardhat");
const { updateDeployments } = require("./update-deployments");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Step 1: Deploy Certificate contract
  console.log("\n1. Deploying Certificate contract...");
  const Certificate = await hre.ethers.getContractFactory("Certificate");
  const certificate = await Certificate.deploy(
    "https://educert.com/api/metadata/", // Metadata URI
    deployer.address // Initial owner
  );
  await certificate.deployed();
  console.log("Certificate deployed to:", certificate.address);

  // Step 2: Deploy AccountFactory contract
  console.log("\n2. Deploying AccountFactory contract...");
  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const factory = await AccountFactory.deploy(certificate.address);
  await factory.deployed();
  console.log("AccountFactory deployed to:", factory.address);

  // Step 3: Deploy CourseManager contract
  console.log("\n3. Deploying CourseManager contract...");
  const CourseManager = await hre.ethers.getContractFactory("CourseManager");
  const courseManager = await CourseManager.deploy(
    factory.address, // Factory address
    certificate.address, // Certificate contract address
    deployer.address // Initial owner
  );
  await courseManager.deployed();
  console.log("CourseManager deployed to:", courseManager.address);

  // Step 4: Initialize contract integrations
  console.log("\n4. Initializing contract integrations...");
  
  // Set factory address in Certificate contract
  await certificate.initializeFactory(factory.address);
  console.log("✓ Factory address set in Certificate");

  // Set factory address in CourseManager
  await courseManager.setFactoryAddress(factory.address);
  console.log("✓ Factory address set in CourseManager");

  // Set CourseManager address in AccountFactory
  await factory.setCourseManager(courseManager.address);
  console.log("✓ CourseManager address set in AccountFactory");

  // Step 5: Authorize deployer as creator
  console.log("\n5. Authorizing deployer as creator...");
  await courseManager.authorizeCreator(deployer.address, "Platform Admin");
  console.log("✓ Deployer authorized as creator");

  // Step 6: Update deployments file
  console.log("\n6. Updating deployments file...");
  await updateDeployments({
    Certificate: certificate.address,
    AccountFactory: factory.address,
    CourseManager: courseManager.address,
    deployer: deployer.address
  });
  console.log("✓ Deployments file updated");

  console.log("\n=== Deployment Summary ===");
  console.log("Certificate Contract:", certificate.address);
  console.log("AccountFactory Contract:", factory.address);
  console.log("CourseManager Contract:", courseManager.address);
  console.log("Deployer Address:", deployer.address);
  console.log("========================\n");

  console.log("🎉 All contracts deployed and configured successfully!");
  console.log("\nNext steps:");
  console.log("1. Create institution accounts using AccountFactory.createAccount()");
  console.log("2. Authorize institutions as creators in CourseManager");
  console.log("3. Create courses and manage enrollments");
  console.log("4. Issue certificates for completed courses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 