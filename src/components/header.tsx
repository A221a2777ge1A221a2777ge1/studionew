import Link from "next/link";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="hidden font-bold sm:inline-block text-lg text-primary">
              Dreamcoin
            </span>
          </Link>
          <MainNav />
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
