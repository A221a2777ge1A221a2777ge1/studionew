"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { navLinks } from "./main-nav"
import { Logo } from "./logo"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link
            href="/dashboard"
            className="flex items-center"
            onClick={() => setOpen(false)}
        >
            <Logo className="h-8 w-8 mr-2" />
            <span className="font-bold text-lg text-primary">Dreamcoin</span>
        </Link>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-2">
            {navLinks.map(
              (item) =>
                item.href && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("text-lg transition-colors hover:text-primary",
                       pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
