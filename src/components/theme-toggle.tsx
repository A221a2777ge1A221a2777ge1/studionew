"use client"

import * as React from "react"
import { useTheme } from "@/hooks/use-theme"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, isLoading, isChanging } = useTheme()

  if (isLoading) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        disabled
        aria-label="Loading theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Loading theme</span>
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      disabled={isChanging}
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
        isChanging ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
