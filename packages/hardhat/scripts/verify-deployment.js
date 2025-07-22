const hre = require("hardhat");

async function main() {
  console.log("Verifying deployment configuration...");
  console.log("Network:", hre.network.name);

  // Get deployment addresses from deployments.json
  const fs = require('fs');
  const path = require('path');
  const deploymentsPath = path.join(__dirname, '..', 'deployments.json');
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ deployments.json not found. Run deployment first.");
    return;
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
  const networkDeployment = deployments.networks[hre.network.name];

  if (!networkDeployment) {
    console.log(`❌ No deployment found for network: ${hre.network.name}`);
    return;
  }

  console.log("✓ Found deployment for network:", hre.network.name);
  console.log("Deployed at:", networkDeployment.deployedAt);

  const contracts = networkDeployment.contracts;
  console.log("\nContract Addresses:");
  Object.entries(contracts).forEach(([name, address]) => {
    console.log(`  ${name}: ${address}`);
  });

  // Verify contract connections
  console.log("\nVerifying contract connections...");

  try {
    // Get contract instances
    const Certificate = await hre.ethers.getContractFactory("Certificate");
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const CourseManager = await hre.ethers.getContractFactory("CourseManager");

    const certificate = Certificate.attach(contracts.Certificate);
    const factory = AccountFactory.attach(contracts.AccountFactory);
    const courseManager = CourseManager.attach(contracts.CourseManager);

    // Check factory address in CourseManager
    const factoryAddressInCourseManager = await courseManager.factoryAddress();
    console.log("✓ CourseManager factory address:", factoryAddressInCourseManager);
    console.log("  Expected:", contracts.AccountFactory);
    console.log("  Match:", factoryAddressInCourseManager === contracts.AccountFactory);

    // Check certificate address in CourseManager
    const certificateAddressInCourseManager = await courseManager.certificateContract();
    console.log("✓ CourseManager certificate address:", certificateAddressInCourseManager);
    console.log("  Expected:", contracts.Certificate);
    console.log("  Match:", certificateAddressInCourseManager === contracts.Certificate);

    // Check courseManager address in AccountFactory
    const courseManagerAddressInFactory = await factory.courseManagerAddress();
    console.log("✓ AccountFactory courseManager address:", courseManagerAddressInFactory);
    console.log("  Expected:", contracts.CourseManager);
    console.log("  Match:", courseManagerAddressInFactory === contracts.CourseManager);

    // Check factory address in Certificate
    const factoryAddressInCertificate = await certificate.factoryAddress();
    console.log("✓ Certificate factory address:", factoryAddressInCertificate);
    console.log("  Expected:", contracts.AccountFactory);
    console.log("  Match:", factoryAddressInCertificate === contracts.AccountFactory);

    // Check if sample course exists
    if (contracts.SampleCourseId) {
      const course = await courseManager.getCourse(contracts.SampleCourseId);
      console.log("✓ Sample course found:", course.name);
      console.log("  Creator:", course.creator);
      console.log("  Price:", hre.ethers.utils.formatEther(course.price), "ETH");
    }

    // Check if sample institution account exists
    if (contracts.SampleInstitutionAccount) {
      const creator = await courseManager.getCreator(contracts.SampleInstitutionAccount);
      console.log("✓ Sample institution found:", creator.name);
      console.log("  Active:", creator.isActive);
      console.log("  Total courses:", creator.totalCourses.toString());
    }

    console.log("\n🎉 All contract connections verified successfully!");

  } catch (error) {
    console.error("❌ Error verifying contracts:", error.message);
  }
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exitCode = 1;
}); 