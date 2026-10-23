import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useApp } from "./AppContext";
export type Lang = "en" | "zh";
const LanguageContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
}>({ lang: "en", setLang: () => {} });
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useApp();
  const [lang, setLanguage] = useState<Lang>("en");
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem("language")
      .then((value) => {
        if (active && (value === "en" || value === "zh")) setLanguage(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (settings.language === "en" || settings.language === "zh")
      setLanguage(settings.language);
  }, [settings.language]);
  const setLang = (value: Lang) => {
    setLanguage(value);
    void AsyncStorage.setItem("language", value).catch(() => {});
  };
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
export function useCopy() {
  const { lang } = useLanguage();
  return (en: string, zh: string) => (lang === "zh" ? zh : en);
}
