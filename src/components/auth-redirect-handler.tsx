"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function AuthRedirectHandler() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [isHandlingRedirect, setIsHandlingRedirect] = useState(false);

  useEffect(() => {
    const handleRedirectResult = async () => {
      // Only handle redirect if we're on the home page and not already authenticated
      if (window.location.pathname === '/' && !user && !loading && !isHandlingRedirect) {
        setIsHandlingRedirect(true);
        
        try {
          console.log('🔍 [AUTH REDIRECT] Checking for redirect result...');
          
          // Check if we have a redirect result in localStorage
          const redirectUrl = localStorage.getItem('google_auth_redirect_url');
          
          if (redirectUrl) {
            console.log('🔍 [AUTH REDIRECT] Found redirect URL, clearing and redirecting...');
            localStorage.removeItem('google_auth_redirect_url');
            
            // Wait a bit for auth state to update
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          }
        } catch (error) {
          console.error('🔍 [AUTH REDIRECT] Error handling redirect:', error);
        } finally {
          setIsHandlingRedirect(false);
        }
      }
    };

    // Handle redirect result when component mounts
    handleRedirectResult();
  }, [user, loading, router, isHandlingRedirect]);

  // Show loading state while handling redirect
  if (isHandlingRedirect) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-sm text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}
