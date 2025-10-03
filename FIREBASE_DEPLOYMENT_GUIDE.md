# 🔥 Firebase Studio Deployment - Complete Terminal Guide

## Prerequisites
- Node.js 18+ installed
- Git repository with African Tycoon code
- Google account for Firebase

## Step-by-Step Terminal Instructions

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```
- This opens a browser window
- Sign in with your Google account
- Allow Firebase CLI access
- Return to terminal when complete

### Step 3: Initialize Firebase Project
```bash
firebase init
```

**When prompted, select these options:**
1. **Which Firebase features do you want to set up?**
   - Press `Space` to select:
     - ✅ **Firestore** (for database)
     - ✅ **Hosting** (for web app)
     - ✅ **Functions** (optional)
   - Press `Enter` to confirm

2. **Please select an option:**
   - Choose "Use an existing project" or "Create a new project"
   - If creating new: Enter project name like "african-tycoon"

3. **What file should be used for Firestore Rules?**
   - Press `Enter` (use default: firestore.rules)

4. **What file should be used for Firestore indexes?**
   - Press `Enter` (use default: firestore.indexes.json)

5. **What do you want to use as your public directory?**
   - Type: `out`
   - Press `Enter`

6. **Configure as a single-page app?**
   - Type: `y`
   - Press `Enter`

7. **Set up automatic builds and deploys with GitHub?**
   - Type: `n`
   - Press `Enter`

8. **File public/index.html already exists. Overwrite?**
   - Type: `n`
   - Press `Enter`

### Step 4: Configure Next.js for Firebase Hosting
```bash
# Copy the Firebase-optimized config
copy next.config.firebase.ts next.config.ts
```

### Step 5: Set Up Environment Variables
```bash
# Copy environment template
copy env.example .env.local
```

**Edit `.env.local` with your actual values:**
```env
# Firebase Configuration (get from Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id

# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-project-id.web.app
NEXT_PUBLIC_APP_NAME=African Tycoon
```

### Step 6: Install Dependencies
```bash
npm install
```

### Step 7: Build the Application
```bash
npm run build
```

### Step 8: Deploy to Firebase
```bash
firebase deploy
```

## 🎉 Deployment Complete!

Your app will be available at:
- **Hosting URL**: `https://your-project-id.web.app`
- **Custom Domain**: If configured in Firebase Console

## 🔧 Post-Deployment Configuration

### 1. Configure Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** > **Sign-in method**
4. Enable:
   - ✅ **Email/Password**
   - ✅ **Google**
5. Add your domain to **Authorized domains**:
   - `your-project-id.web.app`
   - `your-custom-domain.com` (if using custom domain)

### 2. Set Up Firestore Security Rules
1. Go to **Firestore Database** > **Rules**
2. Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /achievements/{achievementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /trades/{tradeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```
3. Click **Publish**

### 3. Test Your Deployment
1. Visit your app URL
2. Test authentication (Google, Email/Password)
3. Test MetaMask connection
4. Test trading functionality
5. Test AI features
6. Test achievements system

## 🚨 Troubleshooting

### Common Issues:

**1. Build Errors**
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

**2. Authentication Not Working**
- Check Firebase Console > Authentication > Authorized domains
- Verify environment variables are correct
- Check browser console for errors

**3. Web3 Connection Issues**
- Ensure MetaMask is installed
- Check BSC network configuration
- Verify contract addresses

**4. AI Features Not Working**
- Verify Gemini API key is correct
- Check API quotas in Google AI Studio
- Review browser console for errors

## 📊 Monitoring

### Firebase Console Features:
- **Analytics**: User behavior tracking
- **Performance**: App performance monitoring
- **Crashlytics**: Error tracking
- **Remote Config**: Feature flags
- **A/B Testing**: Experiment with features

## 🔄 Future Deployments

For future updates:
```bash
# Make your changes
git add .
git commit -m "Update description"
git push

# Build and deploy
npm run build
firebase deploy
```

## 🎯 Success Checklist

- [ ] Firebase CLI installed and logged in
- [ ] Firebase project initialized
- [ ] Environment variables configured
- [ ] Application built successfully
- [ ] Deployed to Firebase Hosting
- [ ] Authentication configured
- [ ] Firestore rules set up
- [ ] All features tested
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up

---

**🎉 Congratulations! Your African Tycoon app is now live on Firebase Studio!**
