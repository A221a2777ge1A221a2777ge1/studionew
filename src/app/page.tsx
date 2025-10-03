import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <Logo className="h-24 w-24 sm:h-32 sm:w-32" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gradient">
              African Tycoon
            </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
          Build your crypto empire with the ultimate gamified trading platform. 
          Experience the power of AI-driven investment strategies and African-inspired design.
        </p>
      </div>
      <div className="mt-10 w-full">
        <AuthForm />
      </div>
    </main>
  );
}
