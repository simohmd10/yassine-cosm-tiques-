import { createContext, useContext, useState, ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "@/i18n";

interface LanguageContextType {
  lang:    Lang;
  setLang: (l: Lang) => void;
  t:       (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("iherb_lang");
    return (saved === "en" || saved === "fr") ? saved : "fr";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("iherb_lang", l);
  };

  const t = (key: TranslationKey): string => translations[lang][key] as string;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
