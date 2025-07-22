const hre = require("hardhat");

async function main() {
  const [deployer, institution, student1, student2] = await hre.ethers.getSigners();
  console.log("Deploying contracts for testing with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Step 1: Deploy Certificate contract
  console.log("\n1. Deploying Certificate contract...");
  const Certificate = await hre.ethers.getContractFactory("Certificate");
  const certificate = await Certificate.deploy(
    "https://educert.com/api/metadata/",
    deployer.address
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
    factory.address,
    certificate.address,
    deployer.address
  );
  await courseManager.deployed();
  console.log("CourseManager deployed to:", courseManager.address);

  // Step 4: Initialize contract integrations
  console.log("\n4. Initializing contract integrations...");
  
  await courseManager.setFactoryAddress(factory.address);
  await factory.setCourseManager(courseManager.address);
  await certificate.initializeFactory(factory.address);
  console.log("✓ All contract integrations initialized");

  // Step 5: Create institution account
  console.log("\n5. Creating institution account...");
  await factory.connect(institution).CreateAccount("Test University", 365);
  const institutionAccountAddress = await factory.SingleAccount(institution.address);
  console.log("✓ Institution account created:", institutionAccountAddress);

  // Step 6: Set up UserAccount
  console.log("\n6. Setting up UserAccount...");
  const UserAccount = await hre.ethers.getContractFactory("UserAccount");
  const userAccount = UserAccount.attach(institutionAccountAddress);
  await userAccount.connect(institution).setCourseManager(courseManager.address);
  await courseManager.authorizeCreator(institutionAccountAddress, "Test University");
  console.log("✓ UserAccount configured and authorized");

  // Step 7: Create test course
  console.log("\n7. Creating test course...");
  const createCourseTx = await userAccount.connect(institution).createCourse(
    "Blockchain Fundamentals",
    "Learn the basics of blockchain technology",
    "https://ipfs.io/course/blockchain-fundamentals",
    hre.ethers.utils.parseEther("0.01"),
    30,
    true
  );
  const createCourseReceipt = await createCourseTx.wait();
  const courseCreatedEvent = createCourseReceipt.events.find(e => e.event === "CourseCreated");
  const courseId = courseCreatedEvent.args.courseId;
  console.log("✓ Test course created with ID:", courseId.toString());

  // Step 8: Test enrollment
  console.log("\n8. Testing student enrollment...");
  await courseManager.connect(student1).enrollInCourse(courseId);
  const isEnrolled = await courseManager.isEnrolled(student1.address, courseId);
  console.log("✓ Student enrolled:", isEnrolled);

  // Step 9: Test course completion
  console.log("\n9. Testing course completion...");
  await courseManager.connect(student1).completeCourse(courseId);
  const hasCompleted = await courseManager.hasCompleted(student1.address, courseId);
  console.log("✓ Course completed:", hasCompleted);

  // Step 10: Test certificate issuance
  console.log("\n10. Testing certificate issuance...");
  await userAccount.connect(institution).issueCertificateForCourse(courseId, student1.address);
  const hasCertificate = await courseManager.hasCertificate(student1.address, courseId);
  console.log("✓ Certificate issued:", hasCertificate);

  // Step 11: Verify certificate NFT
  const course = await courseManager.getCourse(courseId);
  const certificateId = course.certificateId;
  const balance = await certificate.balanceOf(student1.address, certificateId);
  console.log("✓ Certificate NFT balance:", balance.toString());

  // Step 12: Display final summary
  console.log("\n" + "=".repeat(60));
  console.log("TEST DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Institution:", institution.address);
  console.log("Student1:", student1.address);
  console.log("Student2:", student2.address);
  console.log("Certificate:", certificate.address);
  console.log("AccountFactory:", factory.address);
  console.log("CourseManager:", courseManager.address);
  console.log("Institution Account:", institutionAccountAddress);
  console.log("Test Course ID:", courseId.toString());
  console.log("Test Certificate ID:", certificateId.toString());
  console.log("=".repeat(60));

  console.log("\n🎉 Test deployment and verification completed successfully!");
  console.log("\nAll core functionality tested:");
  console.log("✓ Contract deployment");
  console.log("✓ Contract integration");
  console.log("✓ Institution account creation");
  console.log("✓ Course creation");
  console.log("✓ Student enrollment");
  console.log("✓ Course completion");
  console.log("✓ Certificate issuance");
  console.log("✓ NFT minting");

  // Export addresses for frontend use
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    institution: institution.address,
    student1: student1.address,
    student2: student2.address,
    certificate: certificate.address,
    accountFactory: factory.address,
    courseManager: courseManager.address,
    institutionAccount: institutionAccountAddress,
    testCourseId: courseId.toString(),
    testCertificateId: certificateId.toString()
  };

  console.log("\nDeployment info for frontend:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((error) => {
  console.error("Test deployment failed:", error);
  process.exitCode = 1;
}); 