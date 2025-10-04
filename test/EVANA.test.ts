import { expect } from "chai";
import { ethers } from "hardhat";
import { EVANA } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EVANA Token", function () {
  let evana: EVANA;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let dev: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const TOTAL_SUPPLY = ethers.parseEther("10000000000"); // 10B tokens
  const MAX_BUY_AMOUNT = TOTAL_SUPPLY / 100n; // 1% of total supply
  const MAX_SELL_AMOUNT = TOTAL_SUPPLY / 100n; // 1% of total supply
  const MAX_WALLET_AMOUNT = TOTAL_SUPPLY * 2n / 100n; // 2% of total supply

  beforeEach(async function () {
    [owner, treasury, dev, user1, user2] = await ethers.getSigners();

    const EVANAFactory = await ethers.getContractFactory("EVANA");
    evana = await EVANAFactory.deploy(
      treasury.address,
      dev.address
    );
    await evana.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await evana.name()).to.equal("EVANA");
      expect(await evana.symbol()).to.equal("EVANA");
      expect(await evana.decimals()).to.equal(18);
    });

    it("Should set the correct total supply", async function () {
      expect(await evana.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should assign the total supply to the owner", async function () {
      expect(await evana.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should set the correct treasury address", async function () {
      expect(await evana.treasuryAddress()).to.equal(treasury.address);
    });

    it("Should set the correct initial fees", async function () {
      expect(await evana.buyFee()).to.equal(4);
      expect(await evana.sellFee()).to.equal(5);
    });

    it("Should set the correct initial limits", async function () {
      expect(await evana.maxBuyAmount()).to.equal(MAX_BUY_AMOUNT);
      expect(await evana.maxSellAmount()).to.equal(MAX_SELL_AMOUNT);
      expect(await evana.maxWalletAmount()).to.equal(MAX_WALLET_AMOUNT);
    });
  });

  describe("ERC20 Basic Functions", function () {
    it("Should transfer tokens correctly", async function () {
      const transferAmount = ethers.parseEther("1000");
      await evana.transfer(user1.address, transferAmount);
      expect(await evana.balanceOf(user1.address)).to.equal(transferAmount);
      expect(await evana.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - transferAmount);
    });

    it("Should approve and transferFrom correctly", async function () {
      const transferAmount = ethers.parseEther("1000");
      await evana.approve(user1.address, transferAmount);
      expect(await evana.allowance(owner.address, user1.address)).to.equal(transferAmount);

      await evana.connect(user1).transferFrom(owner.address, user2.address, transferAmount);
      expect(await evana.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await evana.allowance(owner.address, user1.address)).to.equal(0);
    });

    it("Should not allow transfer from zero address", async function () {
      await expect(
        evana.connect(user1).transferFrom(ethers.ZeroAddress, user2.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("ERC20: transfer from the zero address");
    });

    it("Should not allow transfer to zero address", async function () {
      await expect(
        evana.transfer(ethers.ZeroAddress, ethers.parseEther("1000"))
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });
  });

  describe("Fee System", function () {
    it("Should apply buy fee correctly", async function () {
      // Enable trading first
      await evana.enableTrading(true, 1);
      
      // Simulate a buy by transferring from owner to user (this would be from DEX)
      const buyAmount = ethers.parseEther("1000");
      const expectedFee = (buyAmount * 4n) / 100n; // 4% buy fee
      
      await evana.transfer(user1.address, buyAmount);
      expect(await evana.balanceOf(user1.address)).to.equal(buyAmount - expectedFee);
      expect(await evana.balanceOf(evana.target)).to.equal(expectedFee);
    });

    it("Should apply sell fee correctly", async function () {
      // Enable trading first
      await evana.enableTrading(true, 1);
      
      // Give user some tokens first
      await evana.transfer(user1.address, ethers.parseEther("10000"));
      
      // Simulate a sell by transferring from user to owner (this would be to DEX)
      const sellAmount = ethers.parseEther("1000");
      const expectedFee = (sellAmount * 5n) / 100n; // 5% sell fee
      
      await evana.connect(user1).transfer(owner.address, sellAmount);
      expect(await evana.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - ethers.parseEther("10000") + sellAmount - expectedFee);
      expect(await evana.balanceOf(evana.target)).to.equal(expectedFee);
    });

    it("Should not apply fees to excluded addresses", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      // Owner is excluded from fees
      await evana.transfer(user1.address, transferAmount);
      expect(await evana.balanceOf(user1.address)).to.equal(transferAmount);
      expect(await evana.balanceOf(evana.target)).to.equal(0);
    });
  });

  describe("Trading Limits", function () {
    it("Should enforce max buy amount", async function () {
      // Enable trading
      await evana.enableTrading(true, 1);
      
      const maxBuy = await evana.maxBuyAmount();
      const overLimit = maxBuy + ethers.parseEther("1");
      
      await expect(
        evana.transfer(user1.address, overLimit)
      ).to.be.revertedWith("Buy transfer amount exceeds the max buy");
    });

    it("Should enforce max sell amount", async function () {
      // Enable trading
      await evana.enableTrading(true, 1);
      
      // Give user tokens
      await evana.transfer(user1.address, ethers.parseEther("10000"));
      
      const maxSell = await evana.maxSellAmount();
      const overLimit = maxSell + ethers.parseEther("1");
      
      await expect(
        evana.connect(user1).transfer(owner.address, overLimit)
      ).to.be.revertedWith("Sell transfer amount exceeds the max sell");
    });

    it("Should enforce max wallet amount", async function () {
      const maxWallet = await evana.maxWalletAmount();
      const overLimit = maxWallet + ethers.parseEther("1");
      
      await expect(
        evana.transfer(user1.address, overLimit)
      ).to.be.revertedWith("Cannot exceed max wallet");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update fees", async function () {
      await evana.updateBuyFee(10);
      await evana.updateSellFee(15);
      
      expect(await evana.buyFee()).to.equal(10);
      expect(await evana.sellFee()).to.equal(15);
    });

    it("Should not allow non-owner to update fees", async function () {
      await expect(
        evana.connect(user1).updateBuyFee(10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to remove limits", async function () {
      await evana.removeLimits();
      expect(await evana.limitsInEffect()).to.be.false;
    });

    it("Should allow owner to exclude addresses from fees", async function () {
      await evana.excludeFromFees(user1.address, true);
      // This would be tested by checking the internal mapping, but it's private
      // We can test by ensuring the address is excluded from fee calculations
    });

    it("Should allow owner to set treasury address", async function () {
      await evana.setTreasuryAddress(user1.address);
      expect(await evana.treasuryAddress()).to.equal(user1.address);
    });
  });

  describe("Treasury Functions", function () {
    it("Should allow treasury to update swap threshold", async function () {
      const newThreshold = ethers.parseEther("1000");
      await evana.connect(treasury).updateSwapThreshold(ethers.formatEther(newThreshold));
      expect(await evana.swapTokensAtAmount()).to.equal(newThreshold);
    });

    it("Should not allow non-treasury to update swap threshold", async function () {
      await expect(
        evana.connect(user1).updateSwapThreshold("1000")
      ).to.be.revertedWith("Caller is not the treasury");
    });

    it("Should allow treasury to perform manual swap", async function () {
      // First, we need some tokens in the contract
      await evana.transfer(evana.target, ethers.parseEther("1000"));
      
      // Enable trading and swap
      await evana.enableTrading(true, 1);
      await evana.connect(treasury).manualSwap();
    });

    it("Should not allow non-treasury to perform manual swap", async function () {
      await expect(
        evana.connect(user1).manualSwap()
      ).to.be.revertedWith("Caller is not the treasury");
    });
  });

  describe("Trading Control", function () {
    it("Should allow owner to enable trading", async function () {
      await evana.enableTrading(true, 1);
      expect(await evana.tradingActive()).to.be.true;
      expect(await evana.swapEnabled()).to.be.true;
    });

    it("Should not allow trading to be enabled twice", async function () {
      await evana.enableTrading(true, 1);
      await expect(
        evana.enableTrading(true, 1)
      ).to.be.revertedWith("Trading is already active");
    });

    it("Should not allow non-owner to enable trading", async function () {
      await expect(
        evana.connect(user1).enableTrading(true, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Security Features", function () {
    it("Should not allow zero address as treasury", async function () {
      await expect(
        evana.setTreasuryAddress(ethers.ZeroAddress)
      ).to.be.revertedWith("Treasury address cannot be zero");
    });

    it("Should not allow fees over 30%", async function () {
      await expect(
        evana.updateBuyFee(31)
      ).to.be.revertedWith("Fees must be 30% or less");
    });

    it("Should not allow max buy amount below 0.1%", async function () {
      const minAmount = (TOTAL_SUPPLY * 1n) / 1000n; // 0.1%
      await expect(
        evana.updateMaxBuyAmount(ethers.formatEther(minAmount - 1n))
      ).to.be.revertedWith("Cannot set max buy amount lower than 0.1%");
    });
  });
});
