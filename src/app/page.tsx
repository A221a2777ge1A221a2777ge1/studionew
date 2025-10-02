import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <Logo className="h-16 w-16 sm:h-20 sm:w-20" />
            <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight text-primary">
              African Tycoon
            </h1>
        </div>
        <p className="text-md sm:text-lg text-muted-foreground max-w-xl">
          The ultimate gamified crypto trading experience. Build your empire, climb the leaderboard, and become a legend.
        </p>
      </div>
      <div className="mt-10 w-full">
        <AuthForm />
      </div>
    </main>
  );
}
