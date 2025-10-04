# BBFT Smart Contract

## Overview
The BBFT (Baby BFT) token is a BEP-20 token deployed on the BNB Smart Chain with automated market maker integration and fee mechanisms.

## Contract Details
- **Name**: Baby BFT
- **Symbol**: BBFT
- **Decimals**: 18
- **Total Supply**: 10,000,000,000 BBFT
- **Network**: BNB Smart Chain (BSC)

## Constructor Parameters
```solidity
constructor(
    address _TreasuryAddress,    // Treasury wallet address
    address _devWallet,          // Developer wallet address  
    address _routerAddress       // DEX router address (PancakeSwap)
)
```

## Key Features
- **Trading Limits**: Max buy/sell amounts and wallet limits
- **Fee System**: Buy fee (4%) and sell fee (5%)
- **Automated Swapping**: Automatic token-to-BNB conversion for treasury
- **Ownership Controls**: Owner-only functions for critical operations
- **Treasury Management**: Dedicated treasury address for fee collection

## Deployment Instructions

### Testnet Deployment
1. Use BSC Testnet router: `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`
2. Set treasury and dev addresses
3. Deploy and verify on BscScan Testnet

### Mainnet Deployment  
1. Use PancakeSwap router: `0x10ED43C718714eb63d5aA57B78B54704E256024E`
2. Set production treasury and dev addresses
3. Deploy and verify on BscScan Mainnet

## Post-Deployment Steps
1. Add initial liquidity using `addLiquidity()`
2. Enable trading using `enableTrading(true, 1)`
3. Update frontend with contract address
4. Configure Firebase with contract details

## Security Notes
- Owner functions are protected with `onlyOwner` modifier
- Treasury functions require treasury address
- Trading limits can be removed after stabilization
- Fees are capped at 30% maximum
