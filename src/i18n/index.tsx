import React, { createContext, useContext, useState } from "react";
import ru from "./ru.json";
import kg from "./kg.json";

type Lang = "ru" | "kg";

const dictionaries: Record<Lang, any> = {
  ru,
  kg,
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "ru",
  setLang: () => {},
  t: () => "",
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("ru");

  const t = (path: string) => {
    const parts = path.split(".");
    let cur: any = dictionaries[lang];
    for (const p of parts) {
      if (!cur) return path;
      cur = cur[p];
    }
    return typeof cur === "string" ? cur : path;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

export { useI18n as useTranslation };
