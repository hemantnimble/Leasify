// contracts-hardhat/scripts/deploy.ts

import { ethers } from "hardhat";

async function main() {
  console.log("Deploying LeaseFactory to Sepolia...\n");

  const signers = await ethers.getSigners();

  // ✅ Check signers exist before accessing
  if (!signers || signers.length === 0) {
    throw new Error(
      "No signers found. Check DEPLOYER_PRIVATE_KEY in your .env file."
    );
  }

  const deployer = signers[0];
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH\n");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance. Get Sepolia ETH from a faucet.");
  }

  const Factory = await ethers.getContractFactory("LeaseFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();

  console.log("✅ LeaseFactory deployed to:", factoryAddress);
  console.log(
    "🔍 View on Etherscan:",
    `https://sepolia.etherscan.io/address/${factoryAddress}`
  );
  console.log("\n📝 Add to your .env:");
  console.log(`LEASE_FACTORY_ADDRESS="${factoryAddress}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});