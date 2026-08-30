import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import englishTranslations from "@/i18n/english.json";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export type PlatformLanguage = "ar" | "en";

type LanguageContextValue = {
  language: PlatformLanguage;
  isEnglish: boolean;
  direction: "rtl" | "ltr";
  setLanguage: (language: PlatformLanguage) => void;
  toggleLanguage: () => void;
  t: (arabic: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const translations = englishTranslations as Record<string, string>;
const translationMemo = new Map<string, string>();
const MANUAL_LANGUAGE_KEY = "hassad-language-preference";

type DynamicTemplate = { pattern: RegExp; translation: string };
const dynamicTemplates: DynamicTemplate[] = Object.entries(translations)
  .filter(([source, translated]) => source.includes("${") && translated.includes("${"))
  .map(([source, translation]) => {
    const parts = source.split(/\$\{[^}]+\}/g).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return { pattern: new RegExp(`^${parts.join("(.*?)")}$`), translation };
  })
  .sort((a, b) => b.pattern.source.length - a.pattern.source.length);

function normalizeEnglishNumerals(value: string) {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return value
    .replace(/[٠-٩]/g, (digit) => String(digits.indexOf(digit)))
    .replaceAll("٬", ",")
    .replaceAll("٫", ".");
}

function translateValue(value: string) {
  const cached = translationMemo.get(value);
  if (cached) return cached;
  const direct = translations[value];
  if (direct) {
    const localized = normalizeEnglishNumerals(direct);
    translationMemo.set(value, localized);
    return localized;
  }
  for (const { pattern, translation } of dynamicTemplates) {
    const match = value.match(pattern);
    if (!match) continue;
    let captureIndex = 1;
    const localized = translation.replace(/\$\{[^}]+\}/g, () => translateValue(match[captureIndex++] ?? ""));
    const normalized = normalizeEnglishNumerals(localized);
    translationMemo.set(value, normalized);
    return normalized;
  }
  const normalized = normalizeEnglishNumerals(value);
  translationMemo.set(value, normalized);
  return normalized;
}

const translatableAttributes = ["aria-label", "placeholder", "title", "alt"] as const;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<PlatformLanguage>(() => {
    try {
      const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
      if (requestedLanguage === "en" || requestedLanguage === "ar") return requestedLanguage;
      return localStorage.getItem(MANUAL_LANGUAGE_KEY) === "en" ? "en" : "ar";
    } catch {
      return "ar";
    }
  });
  const originalText = useRef(new WeakMap<Text, string>());
  const originalAttributes = useRef(new WeakMap<Element, Map<string, string>>());
  const savedLanguage = trpc.accountPreferences.language.useQuery(undefined, { enabled: Boolean(user) });
  const updateSavedLanguage = trpc.accountPreferences.updateLanguage.useMutation();

  const applyBrowserLanguage = useCallback((nextLanguage: PlatformLanguage, saveAsPreference = false) => {
    setLanguageState(nextLanguage);
    try {
      if (saveAsPreference) localStorage.setItem(MANUAL_LANGUAGE_KEY, nextLanguage);
      const url = new URL(window.location.href);
      if (nextLanguage === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    } catch {
      // Storage can be unavailable in private browsing; the current session remains functional.
    }
  }, []);

  useEffect(() => {
    if (!user || savedLanguage.data === undefined) return;
    const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
    if (requestedLanguage === "ar" || requestedLanguage === "en") return;
    applyBrowserLanguage(savedLanguage.data);
  }, [user, savedLanguage.data, applyBrowserLanguage]);

  const setLanguage = useCallback((nextLanguage: PlatformLanguage) => {
    applyBrowserLanguage(nextLanguage, true);
    if (user) updateSavedLanguage.mutate({ preferredLanguage: nextLanguage });
  }, [applyBrowserLanguage, updateSavedLanguage, user]);

  const t = useCallback((arabic: string) => language === "en" ? translateValue(arabic) : arabic, [language]);

  useEffect(() => {
    const root = document.documentElement;
    const isEnglish = language === "en";
    root.lang = isEnglish ? "en" : "ar";
    root.dir = isEnglish ? "ltr" : "rtl";
    root.dataset.language = language;
    document.body.classList.toggle("platform-ltr", isEnglish);
    document.body.classList.toggle("platform-rtl", !isEnglish);
    document.title = isEnglish ? "Hassad | Agricultural inputs and services" : "حصاد | المدخلات والخدمات الزراعية";

    const translateTextNode = (node: Text) => {
      if (!node.parentElement || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.parentElement.tagName)) return;
      const original = originalText.current.get(node) ?? node.data;
      if (!originalText.current.has(node)) originalText.current.set(node, original);
      if (!isEnglish) {
        node.data = original;
        return;
      }
      const leading = original.match(/^\s*/)?.[0] ?? "";
      const trailing = original.match(/\s*$/)?.[0] ?? "";
      const core = original.slice(leading.length, original.length - trailing.length);
      node.data = `${leading}${translateValue(core)}${trailing}`;
    };

    const translateElementAttributes = (element: Element) => {
      translatableAttributes.forEach((attribute) => {
        const current = element.getAttribute(attribute);
        if (!current) return;
        let originals = originalAttributes.current.get(element);
        if (!originals) {
          originals = new Map();
          originalAttributes.current.set(element, originals);
        }
        const original = originals.get(attribute) ?? current;
        if (!originals.has(attribute)) originals.set(attribute, original);
        element.setAttribute(attribute, isEnglish ? translateValue(original) : original);
      });
    };

    const workQueue: Node[] = [];
    let frame = 0;
    let stopped = false;

    const queueSubtree = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) workQueue.push(node);
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) workQueue.push(walker.currentNode);
    };

    const flushWork = () => {
      frame = 0;
      const startedAt = performance.now();
      while (!stopped && workQueue.length > 0 && performance.now() - startedAt < 7) {
        const node = workQueue.shift();
        if (!node) continue;
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text);
        if (node.nodeType === Node.ELEMENT_NODE) translateElementAttributes(node as Element);
      }
      if (!stopped && workQueue.length > 0) frame = requestAnimationFrame(flushWork);
    };

    const scheduleWork = () => {
      if (!frame) frame = requestAnimationFrame(flushWork);
    };

    queueSubtree(document.body);
    scheduleWork();

    if (!isEnglish) {
      return () => {
        stopped = true;
        if (frame) cancelAnimationFrame(frame);
      };
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach(queueSubtree));
      scheduleWork();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      stopped = true;
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    isEnglish: language === "en",
    direction: language === "en" ? "ltr" : "rtl",
    setLanguage,
    toggleLanguage: () => setLanguage(language === "en" ? "ar" : "en"),
    t,
  }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
