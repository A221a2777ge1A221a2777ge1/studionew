#!/bin/bash

echo "🔥 African Tycoon - Firebase Studio Deployment Script"
echo "=================================================="

# Step 1: Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI is installed"
fi

# Step 2: Login to Firebase (manual step required)
echo "🔐 Please login to Firebase:"
echo "Run: firebase login"
echo "This will open a browser window for authentication"
read -p "Press Enter after you've completed the login..."

# Step 3: Initialize Firebase (manual step required)
echo "🚀 Initializing Firebase project..."
echo "Run: firebase init"
echo "Select: Firestore, Hosting, Functions (optional)"
echo "Configure as single-page app: Yes"
echo "Public directory: out"
read -p "Press Enter after Firebase init is complete..."

# Step 4: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 5: Create environment file
echo "⚙️ Setting up environment variables..."
if [ ! -f .env.local ]; then
    echo "Creating .env.local from template..."
    cp env.example .env.local
    echo "⚠️  Please update .env.local with your Firebase and API keys"
    echo "Required:"
    echo "- Firebase configuration"
    echo "- Gemini AI API key"
    read -p "Press Enter after updating .env.local..."
fi

# Step 6: Build the application
echo "🏗️ Building the application..."
npm run build

# Step 7: Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at: https://your-project-id.web.app"
echo "📊 Check Firebase Console for analytics and management"
