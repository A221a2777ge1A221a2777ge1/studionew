"use client"

import * as React from "react"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

type Theme = "light" | "dark" | "system"

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(
  undefined
)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
}: { children: React.ReactNode, defaultTheme?: Theme, storageKey?: string }) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme
    }
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    } catch (e) {
      return defaultTheme
    }
  })

  useIsomorphicLayoutEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    let systemTheme: Theme = 'light';
    if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
        systemTheme = 'dark';
    }

    const effectiveTheme = theme === "system" ? systemTheme : theme

    root.classList.add(effectiveTheme)
    root.style.colorScheme = effectiveTheme
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme)
      } catch (e) {
        // storage is not available
      }
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
