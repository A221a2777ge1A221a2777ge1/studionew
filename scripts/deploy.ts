import { ethers } from "hardhat";

async function main() {
  console.log("Starting EVANA deployment...");

  // Get the contract factory
  const EVANA = await ethers.getContractFactory("EVANA");

  // Get deployment parameters from environment or use defaults
  const treasuryAddress = process.env.TREASURY_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Example address
  const devWallet = process.env.DEV_WALLET || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Example address

  const network = await ethers.provider.getNetwork();

  console.log(`Deploying to network: ${network.name} (${network.chainId})`);
  console.log(`Treasury Address: ${treasuryAddress}`);
  console.log(`Dev Wallet: ${devWallet}`);

  // Deploy the contract
  const evana = await EVANA.deploy(treasuryAddress, devWallet);
  await evana.waitForDeployment();

  const contractAddress = await evana.getAddress();
  console.log(`EVANA deployed to: ${contractAddress}`);

  // Verify deployment
  console.log("Verifying deployment...");
  const name = await evana.name();
  const symbol = await evana.symbol();
  const totalSupply = await evana.totalSupply();
  const treasury = await evana.treasuryAddress();

  console.log(`Contract Name: ${name}`);
  console.log(`Contract Symbol: ${symbol}`);
  console.log(`Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
  console.log(`Treasury Address: ${treasury}`);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress,
    treasuryAddress,
    devWallet,
    deployedAt: new Date().toISOString(),
    transactionHash: evana.deploymentTransaction()?.hash
  };

  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\nNext Steps:");
  console.log("1. Verify the contract on BscScan");
  console.log("2. Add initial liquidity using addLiquidity()");
  console.log("3. Enable trading using enableTrading(true, 1)");
  console.log("4. Update frontend with contract address");
  console.log("5. Update Firebase config with contract details");

  return deploymentInfo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
