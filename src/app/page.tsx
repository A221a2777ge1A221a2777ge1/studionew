import { AuthForm } from "@/components/auth-form";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* African Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-20 animate-pulse delay-500"></div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
        <div className="flex flex-col items-center gap-8 text-center max-w-2xl">
          {/* Title with African-inspired styling */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-lg">
              DreamCoin
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-500 to-red-500 mx-auto rounded-full"></div>
          </div>
          
          {/* Subtitle with African theme */}
          <p className="text-lg sm:text-xl text-gray-700 max-w-xl leading-relaxed">
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
