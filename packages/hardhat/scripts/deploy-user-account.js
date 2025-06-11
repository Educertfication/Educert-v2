const hre = require("hardhat");

async function main() {
  console.log("Deploying UserAccount contract...");

  // Get the deployer's signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with the account:", deployer.address);

  // Get the contract factory
  const UserAccount = await hre.ethers.getContractFactory("UserAccount");

  // Deploy the contract with constructor arguments
  const userAccount = await UserAccount.deploy(
    "Example Institution", // name_
    deployer.address,      // propietor_
    365,                   // _duration (in days)
    1,                     // certificateID (starting from 1)
    "0x73bb8f35F79e7472Af9E5657e8DCD15b22E8B7C6", // _nftAddress (Certificate contract)
    deployer.address       // _owner
  );

  // Wait for deployment to finish
  await userAccount.deployed();

  console.log("UserAccount deployed to:", userAccount.address);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await userAccount.deployTransaction.wait(5);

  // Verify the contract on Blockscout
  console.log("Verifying contract on Blockscout...");
  try {
    await hre.run("verify:verify", {
      address: userAccount.address,
      constructorArguments: [
        "Example Institution",
        deployer.address,
        365,
        1,
        "0x73bb8f35F79e7472Af9E5657e8DCD15b22E8B7C6",
        deployer.address
      ],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.log("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 