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

  // Deploy the AccountFactory contract
  console.log("Deploying AccountFactory contract...");
  const AccountFactory = await ethers.getContractFactory("AccountFactory");
  const factory = await AccountFactory.deploy(deployer.address); // Set deployer as initial owner
  await factory.deployed();
  const factoryAddress = factory.address;
  console.log("AccountFactory deployed to:", factoryAddress);

  // Set the certificate contract in the factory
  console.log("Setting certificate contract in factory...");
  await factory.setCertificateContract(nftAddress);
  console.log("Certificate contract set in factory");

  // Initialize the Certificate contract with the factory address
  console.log("Initializing Certificate contract with factory address...");
  await nft.initializeFactory(factoryAddress);
  console.log("Certificate contract initialized with factory address");

  // Test account creation (optional)
  console.log("\nTesting account creation...");
  try {
    const tx = await factory.createAccount("Test Account", "Student");
    await tx.wait();
    console.log("Test account created successfully!");
  } catch (error) {
    console.log("Test account creation failed:", error.message);
  }

  // Verify the contracts on Celo Explorer
  console.log("\nWaiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

  console.log("Verifying Certificate contract...");
  try {
    await hre.run("verify:verify", {
      address: nftAddress,
      constructorArguments: [
        "https://educert.com/api/metadata/",
        deployer.address
      ],
    });
  } catch (error) {
    console.log("Certificate verification failed:", error);
  }

  console.log("Verifying AccountFactory contract...");
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [deployer.address],
    });
  } catch (error) {
    console.log("AccountFactory verification failed:", error);
  }

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Certificate Contract:", nftAddress);
  console.log("AccountFactory Contract:", factoryAddress);
  console.log("\nImportant Notes:");
  console.log("1. Anyone can create an account using the createAccount function");
  console.log("2. Each address can only create one account");
  console.log("3. Account creation requires a name and role");
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 