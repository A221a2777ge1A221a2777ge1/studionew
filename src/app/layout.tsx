import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthRedirectHandler } from "@/components/auth-redirect-handler";
import { UserProvider } from "@/contexts/UserContext";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';


export const metadata: Metadata = {
  title: 'African Tycoon',
  description: 'Build your crypto empire with African Tycoon - The ultimate gamified cryptocurrency trading platform with AI-powered investment strategies.',
  keywords: 'cryptocurrency, trading, DeFi, BSC, PancakeSwap, gamification, African, investment, AI',
  authors: [{ name: 'African Tycoon Team' }],
  openGraph: {
    title: 'African Tycoon',
    description: 'Build your crypto empire with African Tycoon',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <UserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange={false}
              storageKey="dreamcoin-theme"
            >
              {children}
              <Toaster />
              <AuthRedirectHandler />
            </ThemeProvider>
          </UserProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
