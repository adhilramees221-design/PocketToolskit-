import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Globe } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { theme, setTheme, language, setLanguage } = useAppContext();
  const { t } = useTranslation();
  const [location] = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ml" : "en");
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/tools", label: t("nav.tools") },
    { href: "/about", label: t("nav.about") },
    { href: "/privacy", label: t("nav.privacy") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
            <span className="text-2xl">🚀</span>
            <span className="hidden sm:inline-block tracking-tight">Super Tools Box</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} title="Switch Language">
              <Globe className="h-4 w-4" />
              <span className="sr-only">Switch Language</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="sr-only">Toggle Theme</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t bg-muted/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
          <div className="flex gap-4 mb-2">
            <Link href="/" className="hover:text-primary transition-colors">{t("nav.home")}</Link>
            <Link href="/about" className="hover:text-primary transition-colors">{t("nav.about")}</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">{t("nav.privacy")}</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">{t("nav.contact")}</Link>
          </div>
          <p className="text-sm">{t("footer.text")}</p>
        </div>
      </footer>
    </div>
  );
}
