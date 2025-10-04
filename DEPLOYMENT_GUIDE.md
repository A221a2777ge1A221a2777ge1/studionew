# African Tycoon - Production Deployment Guide

This guide provides step-by-step instructions for deploying the African Tycoon application to production, including the BBFT smart contract, Firebase backend, and frontend application.

## 📋 Prerequisites

- Node.js 20+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- MetaMask wallet with BNB for gas fees
- GitHub repository with Actions enabled
- Firebase project created

## 🏗️ Phase 1: Smart Contract Deployment

### Step 1: Prepare Contract Deployment

1. **Set up environment variables**
   ```bash
   # Create .env file for contract deployment
   cp env.example .env
   
   # Add your private keys and addresses
   PRIVATE_KEY_TESTNET=your_testnet_private_key
   PRIVATE_KEY_MAINNET=your_mainnet_private_key
   TREASURY_ADDRESS=your_treasury_wallet_address
   DEV_WALLET=your_developer_wallet_address
   BSCSCAN_API_KEY=your_bscscan_api_key
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Step 2: Deploy to BSC Testnet

1. **Deploy contract**
   ```bash
   npm run deploy:testnet
   ```

2. **Verify deployment**
   - Check the console output for contract address
   - Visit the contract on [BscScan Testnet](https://testnet.bscscan.com)
   - Verify the contract is deployed correctly

3. **Test contract functions**
   - Connect MetaMask to BSC Testnet
   - Test basic functions like `balanceOf`, `transfer`
   - Test owner functions if you have owner privileges

### Step 3: Deploy to BSC Mainnet

1. **Deploy contract**
   ```bash
   npm run deploy:mainnet
   ```

2. **Verify on BscScan**
   - Go to [BscScan.com](https://bscscan.com)
   - Navigate to your contract address
   - Click "Verify and Publish"
   - Use these settings:
     - Compiler Type: Solidity (Single file)
     - Compiler Version: 0.8.20
     - License: MIT
     - Source Code: Copy from `contracts/BBFT.sol`

3. **Initialize contract**
   ```bash
   # Add initial liquidity (requires BNB and tokens)
   # Enable trading
   # Set up treasury functions
   ```

## 🔥 Phase 2: Firebase Backend Setup

### Step 1: Configure Firebase Project

1. **Create Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project: "tapearn-studionew"
   - Enable Authentication, Firestore, Storage, and Hosting

2. **Set up Authentication**
   - Enable Google provider
   - Enable Email/Password provider
   - Configure authorized domains

3. **Configure Firestore**
   - Create database in production mode
   - Deploy security rules from `firestore.rules`
   - Deploy indexes from `firestore.indexes.json`

4. **Configure Storage**
   - Deploy storage rules from `storage.rules`

### Step 2: Deploy Firebase Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Step 3: Set up Contract Configuration

1. **Create contract config document**
   ```bash
   firebase firestore:set config/contract '{
     "address": "0x...",
     "abiVersion": "1.0.0",
     "deployedAt": "2024-01-01T00:00:00Z",
     "network": "bsc",
     "routerAddress": "0x10ED43C718714eb63d5aA57B78B54704E256024E",
     "treasuryAddress": "0x...",
     "devWallet": "0x...",
     "isActive": true
   }'
   ```

## 🚀 Phase 3: Frontend Deployment

### Step 1: Set up GitHub Secrets

1. **Go to repository Settings > Secrets and variables > Actions**
2. **Add the following secrets:**

   ```
   # Firebase Configuration
   FIREBASE_SERVICE_ACCOUNT
   FIREBASE_PROJECT_ID
   FIREBASE_API_KEY
   FIREBASE_AUTH_DOMAIN
   FIREBASE_STORAGE_BUCKET
   FIREBASE_MESSAGING_SENDER_ID
   FIREBASE_APP_ID
   FIREBASE_MEASUREMENT_ID
   
   # Web3 Configuration
   BSC_RPC_URL
   BSC_TESTNET_RPC_URL
   PANCAKESWAP_ROUTER
   PANCAKESWAP_TESTNET_ROUTER
   WBNB_ADDRESS
   
   # BBFT Contract Configuration
   BBFT_CONTRACT_ADDRESS
   BBFT_TREASURY_ADDRESS
   BBFT_DEV_WALLET
   
   # Deployment Keys
   PRIVATE_KEY_TESTNET
   PRIVATE_KEY_MAINNET
   ```

### Step 2: Configure Environment Variables

1. **Create production environment file**
   ```bash
   # .env.production
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tapearn-studionew.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tapearn-studionew
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tapearn-studionew.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
   NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
   NEXT_PUBLIC_PANCAKESWAP_ROUTER=0x10ED43C718714eb63d5aA57B78B54704E256024E
   NEXT_PUBLIC_PANCAKESWAP_TESTNET_ROUTER=0xD99D1c33F9fC3444f8101754aBC46c52416550D1
   NEXT_PUBLIC_WBNB_ADDRESS=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c
   
   NEXT_PUBLIC_BBFT_CONTRACT_ADDRESS=your_deployed_contract_address
   NEXT_PUBLIC_BBFT_TREASURY_ADDRESS=your_treasury_address
   NEXT_PUBLIC_BBFT_DEV_WALLET=your_dev_wallet
   
   NEXT_PUBLIC_APP_URL=https://tapearn-studionew.web.app
   NEXT_PUBLIC_APP_NAME=African Tycoon
   ```

### Step 3: Deploy to Firebase Hosting

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

3. **Verify deployment**
   - Visit your Firebase hosting URL
   - Test all major functionality
   - Verify MetaMask integration works

## 🔄 Phase 4: CI/CD Setup

### Step 1: GitHub Actions Configuration

1. **The workflow files are already configured:**
   - `.github/workflows/deploy.yml` - Main deployment workflow
   - `.github/workflows/deploy-contract.yml` - Contract deployment workflow

2. **Push to main branch triggers automatic deployment**

### Step 2: Manual Contract Deployment

1. **Use GitHub Actions workflow**
   - Go to Actions tab in your repository
   - Select "Deploy BBFT Contract"
   - Click "Run workflow"
   - Fill in the required parameters

## ✅ Phase 5: Post-Deployment Verification

### Step 1: Functional Testing

1. **Authentication Testing**
   - Test Google OAuth login
   - Test MetaMask wallet connection
   - Verify user profiles are created in Firestore

2. **Trading Testing**
   - Connect MetaMask to BSC network
   - Test token swapping functionality
   - Verify slippage tolerance works
   - Check transaction history

3. **Contract Integration Testing**
   - Verify BBFT contract is accessible
   - Test token balance queries
   - Verify trading functions work

### Step 2: Security Verification

1. **Firebase Security Rules**
   - Verify Firestore rules are properly configured
   - Test that users can only access their own data
   - Verify admin functions are protected

2. **Contract Security**
   - Verify contract is properly verified on BscScan
   - Test owner-only functions
   - Verify fee mechanisms work correctly

### Step 3: Performance Testing

1. **Load Testing**
   - Test with multiple concurrent users
   - Verify Firebase quotas are sufficient
   - Check response times

2. **Mobile Testing**
   - Test on various mobile devices
   - Verify responsive design works
   - Test MetaMask mobile integration

## 🚨 Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check private key has sufficient BNB for gas
   - Verify network configuration
   - Check constructor parameters

2. **Firebase Deployment Fails**
   - Verify Firebase CLI is logged in
   - Check project ID matches
   - Verify environment variables are set

3. **MetaMask Connection Issues**
   - Verify BSC network is added to MetaMask
   - Check RPC URLs are correct
   - Verify contract address is correct

4. **Build Failures**
   - Check all environment variables are set
   - Verify dependencies are installed
   - Check for TypeScript errors

### Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [BSC Documentation](https://docs.bnbchain.org/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Next.js Documentation](https://nextjs.org/docs)

## 📊 Monitoring and Maintenance

### Step 1: Set up Monitoring

1. **Firebase Monitoring**
   - Enable Firebase Performance Monitoring
   - Set up Firebase Crashlytics
   - Monitor Firestore usage

2. **Contract Monitoring**
   - Monitor contract events
   - Track transaction volumes
   - Monitor treasury balances

### Step 2: Regular Maintenance

1. **Weekly Tasks**
   - Check Firebase quotas
   - Monitor error logs
   - Verify contract functions

2. **Monthly Tasks**
   - Update dependencies
   - Review security rules
   - Backup important data

3. **Quarterly Tasks**
   - Security audit
   - Performance optimization
   - Feature updates

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ BBFT contract is deployed and verified on BscScan
- ✅ Firebase backend is configured and secure
- ✅ Frontend is deployed and accessible
- ✅ MetaMask integration works on BSC
- ✅ Token swapping functionality works
- ✅ User authentication works
- ✅ CI/CD pipeline is functional
- ✅ All security rules are properly configured

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review the logs in GitHub Actions
3. Check Firebase console for errors
4. Verify all environment variables are set correctly
5. Contact support if issues persist

---

**Congratulations! Your African Tycoon application is now live and ready for users! 🚀**
