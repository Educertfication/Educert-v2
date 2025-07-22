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
  
  // Set factory address in CourseManager
  await courseManager.setFactoryAddress(factory.address);
  console.log("✓ Factory address set in CourseManager");

  // Set CourseManager address in AccountFactory
  await factory.setCourseManager(courseManager.address);
  console.log("✓ CourseManager address set in AccountFactory");

  // Initialize factory address in Certificate
  await certificate.initializeFactory(factory.address);
  console.log("✓ Factory address initialized in Certificate");

  // Step 5: Create a sample institution account using the same deployer
  console.log("\n5. Creating sample institution account...");
  
  // Create institution account using deployer
  await factory.connect(deployer).createAccount("Sample University", 365);
  const institutionAccountAddress = await factory.getUserAccount(deployer.address);
  console.log("✓ Institution account created:", institutionAccountAddress);

  // Get UserAccount contract instance
  const UserAccount = await hre.ethers.getContractFactory("UserAccount");
  const userAccount = UserAccount.attach(institutionAccountAddress);

  // Set CourseManager in the UserAccount
  await userAccount.connect(deployer).setCourseManager(courseManager.address);
  console.log("✓ CourseManager set in UserAccount");

  // Authorize the institution as a creator
  await courseManager.authorizeCreator(institutionAccountAddress, "Sample University");
  console.log("✓ Institution authorized as creator");

  // Step 6: Create a sample course
  console.log("\n6. Creating sample course...");
  const createCourseTx = await userAccount.connect(deployer).createCourse(
    "Blockchain Fundamentals",
    "Learn the basics of blockchain technology and smart contracts",
    "https://ipfs.io/course/blockchain-fundamentals",
    hre.ethers.utils.parseEther("0.01"), // 0.01 CELO price
    30, // 30 days duration
    true // requires assessment
  );
  const createCourseReceipt = await createCourseTx.wait();
  const courseCreatedEvent = createCourseReceipt.events.find(e => e.event === "CourseCreated");
  const courseId = courseCreatedEvent.args.courseId;
  console.log("✓ Sample course created with ID:", courseId.toString());

  // Step 7: Save deployment addresses
  console.log("\n7. Saving deployment addresses...");
  const addresses = {
    Certificate: certificate.address,
    AccountFactory: factory.address,
    CourseManager: courseManager.address,
    SampleInstitutionAccount: institutionAccountAddress,
    SampleCourseId: courseId.toString()
  };
  
  await updateDeployments("celo-alfajores", addresses);

  // Step 8: Display deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY - CELO ALFAJORES");
  console.log("=".repeat(60));
  console.log("Network: celo-alfajores");
  console.log("Deployer:", deployer.address);
  console.log("Certificate:", certificate.address);
  console.log("AccountFactory:", factory.address);
  console.log("CourseManager:", courseManager.address);
  console.log("Sample Institution Account:", institutionAccountAddress);
  console.log("Sample Course ID:", courseId.toString());
  console.log("=".repeat(60));

  // Step 9: Verify contract addresses are properly set
  console.log("\n8. Verifying contract configurations...");
  
  const factoryAddressInCourseManager = await courseManager.factoryAddress();
  const certificateAddressInCourseManager = await courseManager.certificateContract();
  const courseManagerAddressInFactory = await factory.courseManagerAddress();
  const factoryAddressInCertificate = await certificate.factoryAddress();

  console.log("✓ CourseManager factory address:", factoryAddressInCourseManager);
  console.log("✓ CourseManager certificate address:", certificateAddressInCourseManager);
  console.log("✓ AccountFactory courseManager address:", courseManagerAddressInFactory);
  console.log("✓ Certificate factory address:", factoryAddressInCertificate);

  // Step 10: Verify sample data
  console.log("\n9. Verifying sample data...");
  
  const course = await courseManager.getCourse(courseId);
  console.log("✓ Sample course name:", course.name);
  console.log("✓ Sample course creator:", course.creator);
  console.log("✓ Sample course price:", hre.ethers.utils.formatEther(course.price), "CELO");
  console.log("✓ Sample course duration:", course.duration.toString(), "days");

  const creator = await courseManager.getCreator(institutionAccountAddress);
  console.log("✓ Institution creator name:", creator.name);
  console.log("✓ Institution creator courses:", creator.totalCourses.toString());

  console.log("\n🎉 Deployment completed successfully on Celo Alfajores!");
  console.log("\nNext steps:");
  console.log("1. Verify contracts on Celo Alfajores block explorer");
  console.log("2. Test course enrollment and completion");
  console.log("3. Test certificate issuance");
  console.log("4. Deploy frontend application");
  console.log("5. Check deployments.json for contract addresses");
  
  console.log("\n🔍 Contract Verification Commands:");
  console.log(`npx hardhat verify --network celo-alfajores ${certificate.address} "https://educert.com/api/metadata/" ${deployer.address}`);
  console.log(`npx hardhat verify --network celo-alfajores ${factory.address} ${certificate.address}`);
  console.log(`npx hardhat verify --network celo-alfajores ${courseManager.address} ${factory.address} ${certificate.address} ${deployer.address}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
}); 