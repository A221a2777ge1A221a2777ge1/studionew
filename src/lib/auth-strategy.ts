/**
 * Authentication Strategy Manager
 * Handles the coordination between Google Auth and MetaMask on mobile browsers
 */

export interface AuthStrategy {
  method: 'google' | 'metamask' | 'hybrid';
  priority: number;
  isAvailable: boolean;
  description: string;
}

export class AuthStrategyManager {
  private static strategies: AuthStrategy[] = [
    {
      method: 'hybrid',
      priority: 1,
      isAvailable: false,
      description: 'Google Auth + MetaMask (Best for mobile)'
    },
    {
      method: 'google',
      priority: 2,
      isAvailable: false,
      description: 'Google Authentication Only'
    },
    {
      method: 'metamask',
      priority: 3,
      isAvailable: false,
      description: 'MetaMask Wallet Only'
    }
  ];

  static detectAvailableStrategies(): AuthStrategy[] {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const hasMetaMask = !!(window as any).ethereum;
    const isMetaMaskBrowser = userAgent.includes('MetaMask') || userAgent.includes('WebView');

    console.log('🔍 [AUTH STRATEGY] Detecting available strategies:', {
      userAgent,
      isMobile,
      hasMetaMask,
      isMetaMaskBrowser
    });

    // Update strategy availability
    this.strategies.forEach(strategy => {
      switch (strategy.method) {
        case 'hybrid':
          // Hybrid works best on mobile browsers with MetaMask
          strategy.isAvailable = isMobile && hasMetaMask && !isMetaMaskBrowser;
          break;
        case 'google':
          // Google auth works on all browsers
          strategy.isAvailable = true;
          break;
        case 'metamask':
          // MetaMask works when available
          strategy.isAvailable = hasMetaMask;
          break;
      }
    });

    return this.strategies.filter(s => s.isAvailable).sort((a, b) => a.priority - b.priority);
  }

  static getRecommendedStrategy(): AuthStrategy | null {
    const available = this.detectAvailableStrategies();
    return available.length > 0 ? available[0] : null;
  }

  static canUseHybridAuth(): boolean {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const hasMetaMask = !!(window as any).ethereum;
    const isMetaMaskBrowser = userAgent.includes('MetaMask') || userAgent.includes('WebView');

    // Hybrid auth works when:
    // 1. On mobile device
    // 2. MetaMask is available (extension or app)
    // 3. NOT in MetaMask browser (to avoid conflicts)
    return isMobile && hasMetaMask && !isMetaMaskBrowser;
  }

  static getAuthFlowInstructions(): string[] {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const hasMetaMask = !!(window as any).ethereum;
    const isMetaMaskBrowser = userAgent.includes('MetaMask') || userAgent.includes('WebView');

    if (isMetaMaskBrowser) {
      return [
        "You're using MetaMask browser",
        "Google Auth will use redirect method",
        "MetaMask wallet connection works directly",
        "Both authentication methods are fully supported"
      ];
    } else if (isMobile && hasMetaMask) {
      return [
        "You're on mobile with MetaMask available",
        "Recommended: Use Google Auth first",
        "Then connect MetaMask wallet separately",
        "This provides the best user experience"
      ];
    } else if (isMobile && !hasMetaMask) {
      return [
        "You're on mobile without MetaMask",
        "Use Google Auth for authentication",
        "Install MetaMask app for wallet features",
        "Or use MetaMask browser for full functionality"
      ];
    } else {
      return [
        "You're on desktop",
        "Google Auth uses popup method",
        "MetaMask extension works directly",
        "Both methods work seamlessly together"
      ];
    }
  }
}
