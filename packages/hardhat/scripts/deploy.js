const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Certificate = await hre.ethers.getContractFactory("Certificate");
  const certificate = await Certificate.deploy(
    "https://api.certificate-verifier.com/metadata/", // Update this with your actual metadata URI
    deployer.address // Set the deployer as the initial owner
  );

  await certificate.deployed();
  console.log("Certificate deployed to:", certificate.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 