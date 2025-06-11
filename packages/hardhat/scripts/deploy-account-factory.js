const hre = require("hardhat");
require("@nomiclabs/hardhat-ethers");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AccountFactory with the account:", deployer.address);

  // Deploy the AccountFactory contract
  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const factory = await AccountFactory.deploy(deployer.address);

  await factory.deployed();
  console.log("AccountFactory deployed to:", factory.address);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await factory.deployTransaction.wait(5);

  // Verify the contract on the block explorer
  console.log("Verifying contract on block explorer...");
  try {
    await hre.run("verify:verify", {
      address: factory.address,
      constructorArguments: [deployer.address],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }

  // If you have already deployed the Certificate contract, you can set it here
  const certificateAddress = "0xB31c2fa3491795EE57c471DcfDFef4B932d93C55"; // Replace with your Certificate contract address
  console.log("Setting Certificate contract address:", certificateAddress);
  
  const tx = await factory.setCertificateContract(certificateAddress);
  await tx.wait();
  console.log("Certificate contract address set successfully");

  // Log deployment information
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Network:", hre.network.name);
  console.log("AccountFactory Address:", factory.address);
  console.log("Deployer Address:", deployer.address);
  console.log("Certificate Contract:", certificateAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 