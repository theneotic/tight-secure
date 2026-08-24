import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

const THEME_PREFERENCE_KEY = "tight-secure-theme-preference";

export function resolveTheme(preference: ThemePreference, systemTheme: Theme): Theme {
  return preference === "system" ? systemTheme : preference;
}

function readSystemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredPreference(fallback: Theme): ThemePreference {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(THEME_PREFERENCE_KEY) ?? localStorage.getItem("theme");
  return stored === "system" || stored === "light" || stored === "dark" ? stored : "system";
}

interface ThemeContextType {
  theme: Theme;
  preference: ThemePreference;
  toggleTheme?: () => void;
  setPreference?: (preference: ThemePreference) => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [systemTheme, setSystemTheme] = useState<Theme>(readSystemTheme);
  const [preference, setPreference] = useState<ThemePreference>(() =>
    switchable ? readStoredPreference(defaultTheme) : defaultTheme
  );
  const theme = resolveTheme(preference, systemTheme);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemTheme(mediaQuery.matches ? "dark" : "light");

    updateSystemTheme();
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      if (preference === "system") {
        localStorage.removeItem(THEME_PREFERENCE_KEY);
        localStorage.removeItem("theme");
      } else {
        localStorage.setItem(THEME_PREFERENCE_KEY, preference);
        localStorage.removeItem("theme");
      }
    }
  }, [preference, switchable, theme]);

  const toggleTheme = switchable
    ? () => {
        setPreference(theme === "light" ? "dark" : "light");
      }
    : undefined;

  const updatePreference = switchable ? setPreference : undefined;

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setPreference: updatePreference, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
