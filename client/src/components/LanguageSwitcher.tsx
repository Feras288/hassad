import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

/** Persistent toggle so every public page and dashboard can switch direction and copy. */
export default function LanguageSwitcher() {
  const [location] = useLocation();
  const { isEnglish, toggleLanguage } = useLanguage();
  if (location === "/admin" || location.startsWith("/admin/")) return null;
  return <button type="button" onClick={toggleLanguage} className="language-switcher" aria-label={isEnglish ? "Switch to Arabic" : "Switch to English"} title={isEnglish ? "العربية" : "English"}><Languages className="h-4 w-4" /><span>{isEnglish ? "العربية" : "English"}</span></button>;
}
