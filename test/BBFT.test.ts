import { expect } from "chai";
import { ethers } from "hardhat";
import { BBFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BBFT Token", function () {
  let bbft: BBFT;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let dev: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let mockRouter: SignerWithAddress;

  const TOTAL_SUPPLY = ethers.parseEther("10000000000"); // 10B tokens
  const MAX_BUY_AMOUNT = TOTAL_SUPPLY / 100n; // 1% of total supply
  const MAX_SELL_AMOUNT = TOTAL_SUPPLY / 100n; // 1% of total supply
  const MAX_WALLET_AMOUNT = TOTAL_SUPPLY * 2n / 100n; // 2% of total supply

  beforeEach(async function () {
    [owner, treasury, dev, user1, user2, mockRouter] = await ethers.getSigners();

    const BBFTFactory = await ethers.getContractFactory("BBFT");
    bbft = await BBFTFactory.deploy(
      treasury.address,
      dev.address,
      mockRouter.address
    );
    await bbft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await bbft.name()).to.equal("Baby BFT");
      expect(await bbft.symbol()).to.equal("BBFT");
      expect(await bbft.decimals()).to.equal(18);
    });

    it("Should set the correct total supply", async function () {
      expect(await bbft.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should assign the total supply to the owner", async function () {
      expect(await bbft.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should set the correct treasury address", async function () {
      expect(await bbft.TreasuryAddress()).to.equal(treasury.address);
    });

    it("Should set the correct trading limits", async function () {
      expect(await bbft.maxBuyAmount()).to.equal(MAX_BUY_AMOUNT);
      expect(await bbft.maxSellAmount()).to.equal(MAX_SELL_AMOUNT);
      expect(await bbft.maxWalletAmount()).to.equal(MAX_WALLET_AMOUNT);
    });

    it("Should set the correct fees", async function () {
      expect(await bbft.buyFee()).to.equal(4);
      expect(await bbft.sellFee()).to.equal(5);
    });
  });

  describe("ERC20 Basic Functions", function () {
    it("Should transfer tokens correctly", async function () {
      const transferAmount = ethers.parseEther("1000");
      await bbft.transfer(user1.address, transferAmount);
      expect(await bbft.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should approve and transferFrom correctly", async function () {
      const transferAmount = ethers.parseEther("1000");
      await bbft.approve(user1.address, transferAmount);
      expect(await bbft.allowance(owner.address, user1.address)).to.equal(transferAmount);

      await bbft.connect(user1).transferFrom(owner.address, user2.address, transferAmount);
      expect(await bbft.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should fail transfer when insufficient balance", async function () {
      const transferAmount = ethers.parseEther("10000000001"); // More than total supply
      await expect(bbft.transfer(user1.address, transferAmount))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Trading Limits", function () {
    it("Should enforce max buy amount", async function () {
      const excessAmount = MAX_BUY_AMOUNT + ethers.parseEther("1");
      await expect(bbft.transfer(user1.address, excessAmount))
        .to.be.revertedWith("Buy transfer amount exceeds the max buy.");
    });

    it("Should enforce max wallet amount", async function () {
      const excessAmount = MAX_WALLET_AMOUNT + ethers.parseEther("1");
      await expect(bbft.transfer(user1.address, excessAmount))
        .to.be.revertedWith("Cannot Exceed max wallet");
    });

    it("Should allow owner to update limits", async function () {
      const newMaxBuy = ethers.parseEther("2000000000"); // 2B tokens
      await bbft.updateMaxBuyAmount(newMaxBuy);
      expect(await bbft.maxBuyAmount()).to.equal(newMaxBuy);
    });

    it("Should prevent non-owner from updating limits", async function () {
      const newMaxBuy = ethers.parseEther("2000000000");
      await expect(bbft.connect(user1).updateMaxBuyAmount(newMaxBuy))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Fee System", function () {
    it("Should apply buy fee correctly", async function () {
      // Enable trading first
      await bbft.enableTrading(true, 1);
      
      const buyAmount = ethers.parseEther("1000");
      const expectedFee = buyAmount * 4n / 100n; // 4% fee
      
      await bbft.transfer(user1.address, buyAmount);
      expect(await bbft.tokensForTreasury()).to.equal(expectedFee);
    });

    it("Should apply sell fee correctly", async function () {
      // Enable trading first
      await bbft.enableTrading(true, 1);
      
      const sellAmount = ethers.parseEther("1000");
      const expectedFee = sellAmount * 5n / 100n; // 5% fee
      
      await bbft.transfer(user1.address, sellAmount);
      expect(await bbft.tokensForTreasury()).to.equal(expectedFee);
    });

    it("Should allow owner to update fees", async function () {
      await bbft.updateBuyFee(6);
      await bbft.updateSellFee(7);
      expect(await bbft.buyFee()).to.equal(6);
      expect(await bbft.sellFee()).to.equal(7);
    });

    it("Should prevent fees above 30%", async function () {
      await expect(bbft.updateBuyFee(31))
        .to.be.revertedWith("Fees must be 30%  or less");
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await bbft.transferOwnership(user1.address);
      expect(await bbft.owner()).to.equal(user1.address);
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      await expect(bbft.connect(user1).transferOwnership(user2.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to renounce ownership", async function () {
      await bbft.renounceOwnership();
      expect(await bbft.owner()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Treasury Functions", function () {
    it("Should allow treasury to update swap threshold", async function () {
      const newThreshold = ethers.parseEther("1000000");
      await bbft.connect(treasury).updateSwapThreshold(newThreshold);
      expect(await bbft.swapTokensAtAmount()).to.equal(newThreshold);
    });

    it("Should prevent non-treasury from updating swap threshold", async function () {
      const newThreshold = ethers.parseEther("1000000");
      await expect(bbft.connect(user1).updateSwapThreshold(newThreshold))
        .to.be.revertedWith("only TreasuryAddress can change swapThreshold");
    });

    it("Should allow treasury to withdraw stuck ETH", async function () {
      // Send some ETH to the contract
      await owner.sendTransaction({
        to: await bbft.getAddress(),
        value: ethers.parseEther("1")
      });

      const initialBalance = await ethers.provider.getBalance(treasury.address);
      await bbft.connect(treasury).withdrawStuckETH();
      const finalBalance = await ethers.provider.getBalance(treasury.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Trading Control", function () {
    it("Should enable trading correctly", async function () {
      await bbft.enableTrading(true, 1);
      expect(await bbft.tradingActive()).to.be.true;
      expect(await bbft.swapEnabled()).to.be.true;
    });

    it("Should prevent re-enabling trading", async function () {
      await bbft.enableTrading(true, 1);
      await expect(bbft.enableTrading(false, 1))
        .to.be.revertedWith("Cannot re enable trading");
    });

    it("Should allow owner to remove limits", async function () {
      await bbft.removeLimits();
      expect(await bbft.limitsInEffect()).to.be.false;
    });
  });

  describe("Exclusions", function () {
    it("Should allow owner to exclude addresses from fees", async function () {
      await bbft.excludeFromFees(user1.address, true);
      // This would be tested with actual trading, but the function should not revert
    });

    it("Should allow owner to exclude addresses from max transaction", async function () {
      await bbft.excludeFromMaxTransaction(user1.address, true);
      // This would be tested with actual trading, but the function should not revert
    });
  });
});
