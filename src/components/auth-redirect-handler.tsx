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
      // Handle redirect when user becomes authenticated
      if (user && userProfile && !loading && !isHandlingRedirect) {
        setIsHandlingRedirect(true);
        
        try {
          console.log('🔍 [AUTH REDIRECT] User authenticated, redirecting to dashboard:', {
            uid: user.uid,
            email: user.email,
            displayName: userProfile.displayName
          });
          
          // Clear any redirect URL
          localStorage.removeItem('google_auth_redirect_url');
          
          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          console.error('🔍 [AUTH REDIRECT] Error handling redirect:', error);
        } finally {
          setIsHandlingRedirect(false);
        }
      }
    };

    // Handle redirect result when user becomes authenticated
    handleRedirectResult();
  }, [user, userProfile, loading, router, isHandlingRedirect]);

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
