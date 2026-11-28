
"use client";

import { Moon, Sun } from "lucide-react";
import { useKbcTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useKbcTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      className="kbc-theme-toggle"
    >
      {theme === "light" ? (
        <>
          <Moon size={18} />
          <span>Dark mode</span>
        </>
      ) : (
        <>
          <Sun size={18} />
          <span>Light mode</span>
        </>
      )}
    </button>
  );
}
