const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the deployer's signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the Certificate contract first
  console.log("Deploying Certificate contract...");
  const Certificate = await ethers.getContractFactory("Certificate");
  const nft = await Certificate.deploy(
    "https://educert.com/api/metadata/", // URI for metadata
    deployer.address // Initial owner
  );
  await nft.deployed();
  const nftAddress = nft.address;
  console.log("Certificate contract deployed to:", nftAddress);

  // Deploy the CourseManager contract
  console.log("Deploying CourseManager contract...");
  const CourseManager = await ethers.getContractFactory("CourseManager");
  const courseManager = await CourseManager.deploy(
    ethers.constants.AddressZero, // Will be set after factory deployment
    nftAddress,
    deployer.address // Initial owner
  );
  await courseManager.deployed();
  const courseManagerAddress = courseManager.address;
  console.log("CourseManager deployed to:", courseManagerAddress);

  // Deploy the AccountFactory contract
  console.log("Deploying AccountFactory contract...");
  const AccountFactory = await ethers.getContractFactory("AccountFactory");
  const factory = await AccountFactory.deploy(nftAddress);
  await factory.deployed();
  const factoryAddress = factory.address;
  console.log("AccountFactory deployed to:", factoryAddress);

  // Set up contract integrations
  console.log("Setting up contract integrations...");
  
  // Set the factory address in CourseManager
  await courseManager.setFactoryAddress(factoryAddress);
  console.log("Factory address set in CourseManager");

  // Set the CourseManager address in AccountFactory
  await factory.setCourseManager(courseManagerAddress);
  console.log("CourseManager address set in AccountFactory");

  // Authorize the deployer as a creator in CourseManager
  console.log("Authorizing deployer as creator...");
  await courseManager.authorizeCreator(deployer.address, "Platform Admin");
  console.log("Deployer authorized as creator");

  console.log("\n=== Deployment Summary ===");
  console.log("Certificate Contract:", nftAddress);
  console.log("CourseManager Contract:", courseManagerAddress);
  console.log("AccountFactory Contract:", factoryAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("========================\n");

  console.log("All contracts deployed and configured successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 