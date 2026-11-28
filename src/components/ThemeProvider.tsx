
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("kbc-theme");
    const initialTheme: Theme = savedTheme === "dark" ? "dark" : "light";

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";

    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("kbc-theme", nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {mounted ? children : children}
    </ThemeContext.Provider>
  );
}

export function useKbcTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useKbcTheme must be used inside ThemeProvider");
  }

  return context;
}
