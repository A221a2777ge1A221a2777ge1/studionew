/**
 * Mobile Detection Test Utility
 * This file helps test mobile detection functionality
 */

export const testMobileDetection = () => {
  if (typeof window === 'undefined') {
    console.log('🔍 [MOBILE TEST] Running on server side');
    return;
  }

  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const hasMetaMask = !!(window as any).ethereum;
  const isMetaMaskBrowser = userAgent.includes('MetaMask') || userAgent.includes('WebView');

  console.log('🔍 [MOBILE TEST] Mobile Detection Results:', {
    userAgent,
    isAndroid,
    isMobile,
    hasMetaMask,
    isMetaMaskBrowser,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  });

  return {
    isAndroid,
    isMobile,
    hasMetaMask,
    isMetaMaskBrowser,
    userAgent
  };
};

export const testAuthenticationFlow = () => {
  console.log('🔍 [AUTH TEST] Testing authentication flow detection...');
  
  const mobileTest = testMobileDetection();
  
  if (mobileTest?.isMobile) {
    console.log('🔍 [AUTH TEST] Mobile device detected - will use redirect method for Google auth');
  } else {
    console.log('🔍 [AUTH TEST] Desktop device detected - will use popup method for Google auth');
  }
  
  if (mobileTest?.hasMetaMask) {
    console.log('🔍 [AUTH TEST] MetaMask detected - direct connection available');
  } else {
    console.log('🔍 [AUTH TEST] MetaMask not detected - will show installation instructions');
  }
  
  return mobileTest;
};
