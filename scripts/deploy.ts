import { ethers } from "hardhat";

async function main() {
  console.log("Starting BBFT deployment...");

  // Get the contract factory
  const BBFT = await ethers.getContractFactory("BBFT");

  // Get deployment parameters from environment or use defaults
  const treasuryAddress = process.env.TREASURY_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Example address
  const devWallet = process.env.DEV_WALLET || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Example address
  
  // Router addresses for different networks
  const network = await ethers.provider.getNetwork();
  let routerAddress: string;
  
  if (network.chainId === 97n) { // BSC Testnet
    routerAddress = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
  } else if (network.chainId === 56n) { // BSC Mainnet
    routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
  } else {
    throw new Error(`Unsupported network with chainId: ${network.chainId}`);
  }

  console.log(`Deploying to network: ${network.name} (${network.chainId})`);
  console.log(`Treasury Address: ${treasuryAddress}`);
  console.log(`Dev Wallet: ${devWallet}`);
  console.log(`Router Address: ${routerAddress}`);

  // Deploy the contract
  const bbft = await BBFT.deploy(treasuryAddress, devWallet, routerAddress);
  await bbft.waitForDeployment();

  const contractAddress = await bbft.getAddress();
  console.log(`BBFT deployed to: ${contractAddress}`);

  // Verify deployment
  console.log("Verifying deployment...");
  const name = await bbft.name();
  const symbol = await bbft.symbol();
  const totalSupply = await bbft.totalSupply();
  const treasury = await bbft.TreasuryAddress();

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
    routerAddress,
    deployedAt: new Date().toISOString(),
    transactionHash: bbft.deploymentTransaction()?.hash
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
