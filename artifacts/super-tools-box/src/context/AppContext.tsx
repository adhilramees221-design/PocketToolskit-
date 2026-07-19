import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type Language = "en" | "ml";

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "light"
  );
  
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("language") as Language) || "en"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <AppContext.Provider value={{ theme, setTheme, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
