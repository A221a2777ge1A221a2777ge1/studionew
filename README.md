# African Tycoon - Gamified Cryptocurrency Trading Platform

![African Tycoon Banner](https://via.placeholder.com/1200x400/32CD32/FFFFFF?text=African+Tycoon)

African Tycoon is a comprehensive, gamified cryptocurrency trading platform that combines the power of AI-driven investment strategies with an engaging African-themed design. Built with Next.js, Firebase, and Web3 technologies, it provides users with a unique trading experience on the Binance Smart Chain (BSC) ecosystem.

## 🌟 Features

### 🔐 Authentication & Security
- **Multi-method Authentication**: Google OAuth, MetaMask wallet connection, and email/password
- **Firebase Security**: Secure user management and data storage
- **Wallet Integration**: Seamless MetaMask and Web3 wallet connectivity

### 💰 Trading & Portfolio Management
- **PancakeSwap Integration**: Direct token swapping with live price feeds
- **Real-time Balances**: BNB and token balance tracking
- **Slippage Control**: Customizable slippage tolerance settings
- **Transaction History**: Complete trade history and analytics

### 🤖 AI-Powered Investment Strategies
- **Gemini AI Integration**: Intelligent market analysis and strategy recommendations
- **Portfolio Simulation**: 30-day performance projections
- **Risk Assessment**: Personalized risk tolerance analysis
- **Market Insights**: Real-time market trend analysis

### 🏆 Gamification & Achievements
- **Achievement System**: Unlock rewards through trading milestones
- **Leaderboard Rankings**: Compete with other traders
- **Experience Points**: Level up through trading activities
- **Token Rewards**: Earn tokens for completing achievements

### 🎨 African-Themed Design
- **Color Palette**: Vibrant green (#32CD32) and gold (#FFD700) inspired by African landscapes
- **Tribal Patterns**: Custom CSS patterns and animations
- **Responsive Design**: Mobile-first approach with seamless adaptation
- **Dark Theme**: Optimized for trading environments

### 🔧 MCP Pattern Implementation
- **Model Context Protocol**: Easy debugging and scaling capabilities
- **Event-driven Architecture**: Centralized event management
- **AI Integration**: Seamless AI service integration
- **Scalable Design**: Built for future expansion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- MetaMask wallet (for Web3 features)
- Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/african-tycoon.git
   cd african-tycoon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Web3 Configuration
   NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
   NEXT_PUBLIC_PANCAKESWAP_ROUTER=0x10ED43C718714eb63d5aA57B78B54704E256024E
   NEXT_PUBLIC_WBNB_ADDRESS=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c

   # AI Configuration
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:9002
   NEXT_PUBLIC_APP_NAME=African Tycoon
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:9002`

## 🏗️ Project Structure

```
african-tycoon/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (app)/             # Protected app routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── trade/         # Trading interface
│   │   │   ├── investment-strategy/ # AI strategy page
│   │   │   ├── achievements/  # Achievements system
│   │   │   ├── leaderboard/   # User rankings
│   │   │   └── profile/       # User profile
│   │   ├── globals.css        # Global styles with African theme
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── auth-form.tsx     # Authentication forms
│   │   ├── header.tsx        # Navigation header
│   │   └── ...
│   ├── lib/                  # Utility libraries
│   │   ├── firebase.ts       # Firebase configuration
│   │   ├── web3.ts          # Web3 and BSC integration
│   │   ├── auth.ts          # Authentication service
│   │   ├── ai-investment.ts # AI investment strategies
│   │   ├── mcp-pattern.ts   # MCP pattern implementation
│   │   └── utils.ts         # General utilities
│   └── hooks/               # Custom React hooks
├── docs/                    # Documentation
├── public/                  # Static assets
└── ...
```

## 🔧 Configuration

### Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)
2. **Enable Authentication** with Google and Email/Password providers
3. **Create Firestore database** in production mode
4. **Configure security rules**:

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
     }
   }
   ```

### Web3 Configuration

1. **BSC Network Setup**: The app is configured for BSC Mainnet
2. **Contract Addresses**: PancakeSwap router and WBNB addresses are pre-configured
3. **MetaMask Integration**: Users can connect their MetaMask wallets

### AI Configuration

1. **Gemini AI Setup**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **API Integration**: Configure the Gemini API for investment strategy generation

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables** in Vercel dashboard:
   - Add all environment variables from `.env.local`
   - Set production URLs

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   firebase init hosting
   firebase deploy
   ```

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t african-tycoon .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.local african-tycoon
   ```

## 📱 Mobile App (Future)

The platform is designed with mobile-first principles and can be easily converted to a React Native app using:
- Expo or React Native CLI
- Firebase SDK for React Native
- Web3 libraries for mobile

## 🔒 Security Considerations

- **Environment Variables**: Never commit sensitive keys to version control
- **Firebase Rules**: Implement proper security rules for data access
- **Web3 Security**: Validate all transactions and user inputs
- **API Keys**: Rotate API keys regularly
- **HTTPS**: Always use HTTPS in production

## 🧪 Testing

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join our community discussions
- **Email**: support@africantycoon.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core trading functionality
- ✅ AI investment strategies
- ✅ Achievement system
- ✅ Mobile-responsive design

### Phase 2 (Q2 2024)
- 🔄 Advanced charting and analytics
- 🔄 Social trading features
- 🔄 NFT integration
- 🔄 Mobile app development

### Phase 3 (Q3 2024)
- 📋 Multi-chain support (Ethereum, Polygon)
- 📋 Advanced AI features
- 📋 Institutional trading tools
- 📋 API for third-party integrations

## 🙏 Acknowledgments

- **PancakeSwap** for DEX integration
- **Firebase** for backend services
- **Google AI** for Gemini integration
- **Shadcn/ui** for UI components
- **African Design Community** for inspiration

---

**Built with ❤️ for the African crypto community**

*Empowering traders with AI-driven strategies and gamified experiences*