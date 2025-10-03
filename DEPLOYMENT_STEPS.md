# African Tycoon - Step-by-Step Deployment Instructions

## 🚀 Pre-Deployment Checklist

Before deploying African Tycoon, ensure you have completed the following:

### Required Accounts & Services
- [ ] **Firebase Account**: Create at [Firebase Console](https://console.firebase.google.com/)
- [ ] **Google AI Account**: Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] **Vercel Account**: Sign up at [Vercel](https://vercel.com/) (recommended)
- [ ] **Domain Name**: Register a domain (optional but recommended)
- [ ] **MetaMask Wallet**: For testing Web3 functionality

### Required Information
- [ ] Firebase project configuration details
- [ ] Gemini AI API key
- [ ] Domain name (if using custom domain)
- [ ] SSL certificate (if using custom domain)

---

## 📋 Step-by-Step Deployment Process

### Step 1: Firebase Project Setup

#### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `african-tycoon`
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

#### 1.2 Configure Authentication
1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable the following providers:
   - **Email/Password**: Click "Email/Password" and enable
   - **Google**: Click "Google" and enable
3. Add your domain to authorized domains:
   - `localhost` (for development)
   - `your-domain.vercel.app` (for production)
   - `your-custom-domain.com` (if using custom domain)

#### 1.3 Create Firestore Database
1. Go to "Firestore Database" > "Create database"
2. Choose "Start in production mode"
3. Select a location (choose closest to your users)
4. Click "Done"

#### 1.4 Configure Firestore Security Rules
1. Go to "Firestore Database" > "Rules"
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Achievements are readable by all authenticated users
    match /achievements/{achievementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Leaderboard is publicly readable
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Trading history is private to users
    match /trades/{tradeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click "Publish"

#### 1.5 Get Firebase Configuration
1. Go to "Project Settings" (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" > Web app (</>) icon
4. Register app name: `African Tycoon`
5. Copy the Firebase configuration object
6. Save these values for environment variables

### Step 2: Google Gemini AI Setup

#### 2.1 Get API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Save for environment variables

### Step 3: Prepare Environment Variables

#### 3.1 Create Environment File
Create a `.env.local` file in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# Web3 Configuration
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_PANCAKESWAP_ROUTER=0x10ED43C718714eb63d5aA57B78B54704E256024E
NEXT_PUBLIC_WBNB_ADDRESS=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c

# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002
NEXT_PUBLIC_APP_NAME=African Tycoon
```

#### 3.2 Replace Placeholder Values
Replace all `your_*_here` placeholders with actual values from Firebase and Gemini.

### Step 4: Local Testing

#### 4.1 Install Dependencies
```bash
npm install
```

#### 4.2 Start Development Server
```bash
npm run dev
```

#### 4.3 Test Application
1. Open `http://localhost:9002`
2. Test authentication (Google, email/password, MetaMask)
3. Test trading functionality
4. Test AI features
5. Test achievements system
6. Verify all features work correctly

### Step 5: Deploy to Vercel (Recommended)

#### 5.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 5.2 Login to Vercel
```bash
vercel login
```

#### 5.3 Deploy to Vercel
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name: **african-tycoon**
- Directory: **./**
- Override settings? **No**

#### 5.4 Configure Environment Variables in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Add all environment variables from your `.env.local` file
5. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL

#### 5.5 Redeploy with Environment Variables
```bash
vercel --prod
```

### Step 6: Configure Custom Domain (Optional)

#### 6.1 Add Domain in Vercel
1. Go to your project in Vercel Dashboard
2. Go to "Settings" > "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

#### 6.2 Update Firebase Authorized Domains
1. Go to Firebase Console > Authentication > Settings
2. Add your custom domain to authorized domains
3. Update environment variables with new domain

### Step 7: Final Testing

#### 7.1 Test Production Deployment
1. Visit your deployed URL
2. Test all authentication methods
3. Test trading functionality
4. Test AI features
5. Test achievements system
6. Test on mobile devices

#### 7.2 Performance Testing
1. Check page load times
2. Test on different devices
3. Verify mobile responsiveness
4. Check error handling

### Step 8: Monitoring Setup

#### 8.1 Enable Firebase Analytics
1. Go to Firebase Console > Analytics
2. Enable Google Analytics
3. Set up custom events for tracking

#### 8.2 Set up Error Monitoring
1. Consider adding Sentry for error tracking
2. Monitor Vercel function logs
3. Set up alerts for critical errors

---

## 🔧 Alternative Deployment Options

### Option A: Firebase Hosting

#### A.1 Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### A.2 Initialize Firebase Hosting
```bash
firebase init hosting
```

#### A.3 Configure for Static Export
Update `next.config.ts`:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

#### A.4 Build and Deploy
```bash
npm run build
firebase deploy
```

### Option B: Docker Deployment

#### B.1 Create Dockerfile
```dockerfile
FROM node:18-alpine AS base
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
```

#### B.2 Build and Run
```bash
docker build -t african-tycoon .
docker run -p 3000:3000 --env-file .env.local african-tycoon
```

---

## 🚨 Troubleshooting

### Common Issues

#### Issue 1: Firebase Authentication Not Working
**Solution:**
- Check Firebase configuration in environment variables
- Verify authorized domains in Firebase Console
- Ensure API keys are correct

#### Issue 2: Web3 Connection Fails
**Solution:**
- Check BSC network configuration
- Verify MetaMask is installed and unlocked
- Ensure contract addresses are correct

#### Issue 3: AI Features Not Working
**Solution:**
- Verify Gemini API key is correct
- Check API quotas and limits
- Ensure proper error handling

#### Issue 4: Build Failures
**Solution:**
- Check all environment variables are set
- Verify all dependencies are installed
- Check for TypeScript errors

### Getting Help

1. **Check Logs**: Review Vercel function logs or Firebase logs
2. **Test Locally**: Reproduce issues in local development
3. **Check Documentation**: Review README.md and DEPLOYMENT.md
4. **Contact Support**: Create GitHub issues for bugs

---

## ✅ Post-Deployment Checklist

After successful deployment, verify:

- [ ] Application loads correctly
- [ ] Authentication works (all methods)
- [ ] Trading functionality works
- [ ] AI features work
- [ ] Achievements system works
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable
- [ ] Error handling works
- [ ] Analytics are tracking
- [ ] Security is properly configured

---

## 🎉 Congratulations!

Your African Tycoon application is now live and ready for users! 

### Next Steps:
1. **Monitor Performance**: Keep an eye on user engagement and performance metrics
2. **Gather Feedback**: Collect user feedback for future improvements
3. **Plan Updates**: Plan feature updates based on user needs
4. **Scale Infrastructure**: Scale as user base grows

**Welcome to the African Tycoon community! 🚀**
