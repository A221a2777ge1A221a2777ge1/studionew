import { AuthForm } from "@/components/auth-form";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden">
      {/* Tribal Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full tribal-pattern"></div>
      </div>
      
      {/* Decorative Elements with original color scheme */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full opacity-20 animate-pulse delay-500"></div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
        <div className="flex flex-col items-center gap-8 text-center max-w-2xl">
          {/* Title with original color scheme */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-green-400 via-green-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
              DreamCoin
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-yellow-500 mx-auto rounded-full"></div>
          </div>
          
          {/* Subtitle with original theme */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Embark on your journey to build a crypto empire with the wisdom of African heritage. 
            Experience the power of AI-driven investment strategies in a beautifully crafted platform.
          </p>
        </div>
        
        <div className="mt-12 w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
