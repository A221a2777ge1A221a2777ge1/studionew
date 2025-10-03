# African Tycoon - Deployment Guide

This guide provides step-by-step instructions for deploying African Tycoon to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Firebase project created and configured
- [ ] Gemini AI API key obtained
- [ ] Domain name registered (optional)
- [ ] SSL certificate ready (if using custom domain)

### 2. Firebase Configuration
- [ ] Authentication providers enabled (Google, Email/Password)
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Storage bucket created (for user avatars)

### 3. Web3 Configuration
- [ ] BSC network configured
- [ ] Contract addresses verified
- [ ] MetaMask integration tested

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment experience for Next.js applications.

#### Step 1: Prepare for Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

#### Step 2: Configure Environment Variables
Create a `.env.production` file with your production values:

```env
# Firebase Configuration (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_production_measurement_id

# Web3 Configuration
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_PANCAKESWAP_ROUTER=0x10ED43C718714eb63d5aA57B78B54704E256024E
NEXT_PUBLIC_WBNB_ADDRESS=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c

# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_production_gemini_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=African Tycoon
```

#### Step 3: Deploy to Vercel
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Step 4: Configure Custom Domain (Optional)
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain
5. Configure DNS records as instructed

### Option 2: Firebase Hosting

#### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### Step 2: Initialize Firebase Hosting
```bash
firebase init hosting
```

Select:
- Use existing project
- Public directory: `out` (for static export)
- Configure as single-page app: Yes
- Set up automatic builds: No

#### Step 3: Configure Next.js for Static Export
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

#### Step 4: Build and Deploy
```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy
```

### Option 3: Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Step 2: Build and Run Docker Container
```bash
# Build Docker image
docker build -t african-tycoon .

# Run container
docker run -p 3000:3000 --env-file .env.production african-tycoon
```

#### Step 3: Deploy to Cloud Platform
- **AWS**: Use ECS, EKS, or Elastic Beanstalk
- **Google Cloud**: Use Cloud Run or GKE
- **Azure**: Use Container Instances or AKS

## 🔧 Production Configuration

### Firebase Security Rules

Update your Firestore security rules:

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

### Environment Variables for Production

Ensure all environment variables are properly set:

```env
# Production Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_production_measurement_id

# Web3 Configuration
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_PANCAKESWAP_ROUTER=0x10ED43C718714eb63d5aA57B78B54704E256024E
NEXT_PUBLIC_WBNB_ADDRESS=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c

# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_production_gemini_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=African Tycoon
```

## 🔍 Post-Deployment Testing

### 1. Authentication Testing
- [ ] Google OAuth login works
- [ ] Email/password registration works
- [ ] MetaMask connection works
- [ ] User sessions persist correctly

### 2. Trading Functionality
- [ ] Wallet connection works
- [ ] Token balances display correctly
- [ ] Trading interface loads
- [ ] Price feeds update in real-time

### 3. AI Features
- [ ] Market analysis loads
- [ ] Investment strategy generation works
- [ ] Portfolio simulation functions

### 4. Gamification
- [ ] Achievements system works
- [ ] Leaderboard updates
- [ ] Experience points track correctly

### 5. Performance Testing
- [ ] Page load times are acceptable
- [ ] Mobile responsiveness works
- [ ] API calls complete successfully

## 📊 Monitoring and Analytics

### 1. Firebase Analytics
Enable Firebase Analytics to track user behavior:
```javascript
// In your Firebase console, enable Analytics
// Add custom events for trading activities
```

### 2. Error Monitoring
Set up error tracking with Sentry or similar:
```bash
npm install @sentry/nextjs
```

### 3. Performance Monitoring
Use Vercel Analytics or Google Analytics for performance insights.

## 🔒 Security Checklist

- [ ] All API keys are environment variables
- [ ] Firebase security rules are properly configured
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Input validation is implemented
- [ ] Rate limiting is in place
- [ ] Error messages don't expose sensitive information

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Authentication Issues**
   - Verify Firebase configuration
   - Check OAuth redirect URLs
   - Ensure API keys are correct

3. **Web3 Connection Issues**
   - Verify BSC network configuration
   - Check MetaMask connection
   - Ensure contract addresses are correct

4. **AI Features Not Working**
   - Verify Gemini API key
   - Check API quotas and limits
   - Ensure proper error handling

### Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Review Firebase console for errors
3. Test locally with production environment variables
4. Contact support with detailed error information

## 📈 Scaling Considerations

### Database Scaling
- Implement database indexing for frequently queried fields
- Consider read replicas for high-traffic scenarios
- Implement caching strategies

### API Scaling
- Use CDN for static assets
- Implement API rate limiting
- Consider serverless functions for heavy computations

### Monitoring
- Set up alerts for critical metrics
- Monitor error rates and response times
- Track user engagement and retention

---

**Remember**: Always test thoroughly in a staging environment before deploying to production!
