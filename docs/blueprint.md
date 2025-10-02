# **App Name**: African Tycoon

## Core Features:

- User Authentication: Secure user login and registration using Firebase Authentication, with options for Google Auth, and MetaMask integration.
- Wallet Dashboard: Display user's wallet balance (BNB + token balance), a leaderboard preview, and quick action buttons for buying and selling tokens.
- Token Trading: Enable users to trade tokens by fetching live token prices from PancakeSwap API, inputting trade amounts, setting slippage tolerance, and executing transactions via PancakeSwap router.
- Leaderboard Ranking: Rank users based on holdings or game score, fetching data from Firestore collection.
- Profile Management: Allow users to manage their profile, including wallet address, username, avatar, logout functionality, and dark/light mode switch.
- Intelligent Investment Tool: An AI-driven tool that analyzes user's current investment and simulates optimal strategy to help with investment decisions by fetching relevant information from historical investment patterns, market dynamics, user risk appetite and tolerance.
- Gamified Achievements: Allows the users to earn rewards through game achievements which can be exchanged into tokens. Achievement events shall be stored in a Firestore database.

## Style Guidelines:

- Primary color: Vibrant green (#32CD32), inspired by lush African landscapes and symbolizing growth and prosperity.
- Background color: Soft, desaturated green (#222), providing a clean and unobtrusive backdrop.
- Accent color: Rich gold (#FFD700), evoking wealth and success, used for key interactive elements and highlights.
- Font pairing: 'Poppins' (sans-serif) for headlines, and 'PT Sans' (sans-serif) for body text, balancing modernity with readability.
- Use custom-designed icons that reflect African tribal patterns, such as geometric shapes in a variety of colors, integrated into the design to enhance the user experience.
- Mobile-first responsive layout with a clear, intuitive navigation structure, designed to adapt seamlessly to different screen sizes and resolutions.
- Subtle, gamified animations such as progress bars filling up, tokens animating during trading, and celebratory effects for achievements, creating a dynamic and engaging user experience.