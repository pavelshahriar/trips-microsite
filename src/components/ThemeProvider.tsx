"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ThemeId } from "@/lib/themes";
import { DEFAULT_THEME } from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        const stored = localStorage.getItem("wc26-theme") as ThemeId | null;
        if (stored) setThemeState(stored);
      }
    } catch {
      // localStorage unavailable or broken — fall back to default theme
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        localStorage.setItem("wc26-theme", theme);
      }
    } catch {
      // localStorage unavailable or broken — theme still applies via data-theme attr
    }
  }, [theme, mounted]);

  function setTheme(t: ThemeId) {
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
