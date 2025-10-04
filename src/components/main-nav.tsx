"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils"
import { Compass, LayoutDashboard, ShieldCheck, Trophy, Users, Coins } from "lucide-react";

export const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/trade", label: "Trade", icon: Coins },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/achievements", label: "Achievements", icon: ShieldCheck },
    { href: "/referrals", label: "Referrals", icon: Users },
]

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
        {navLinks.map((link) => (
            <Link
                key={link.href}
                href={link.href}
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
                )}
            >
                {link.label}
            </Link>
        ))}
    </nav>
  )
}
