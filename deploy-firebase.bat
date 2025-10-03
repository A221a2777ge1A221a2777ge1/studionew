@echo off
echo 🔥 African Tycoon - Firebase Studio Deployment Script
echo ==================================================

REM Step 1: Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Installing...
    npm install -g firebase-tools
) else (
    echo ✅ Firebase CLI is installed
)

REM Step 2: Login to Firebase (manual step required)
echo 🔐 Please login to Firebase:
echo Run: firebase login
echo This will open a browser window for authentication
pause

REM Step 3: Initialize Firebase (manual step required)
echo 🚀 Initializing Firebase project...
echo Run: firebase init
echo Select: Firestore, Hosting, Functions (optional)
echo Configure as single-page app: Yes
echo Public directory: out
pause

REM Step 4: Install dependencies
echo 📦 Installing dependencies...
npm install

REM Step 5: Create environment file
echo ⚙️ Setting up environment variables...
if not exist .env.local (
    echo Creating .env.local from template...
    copy env.example .env.local
    echo ⚠️  Please update .env.local with your Firebase and API keys
    echo Required:
    echo - Firebase configuration
    echo - Gemini AI API key
    pause
)

REM Step 6: Build the application
echo 🏗️ Building the application...
npm run build

REM Step 7: Deploy to Firebase
echo 🚀 Deploying to Firebase...
firebase deploy

echo ✅ Deployment complete!
echo 🌐 Your app should be live at: https://your-project-id.web.app
echo 📊 Check Firebase Console for analytics and management
pause
