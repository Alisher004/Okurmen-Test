import React from "react";
import { useI18n } from "../i18n";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <div>
      <button disabled={lang === "ru"} onClick={() => setLang("ru")}>{t("language.ru")}</button>
      <button disabled={lang === "kg"} onClick={() => setLang("kg")}>{t("language.kg")}</button>
    </div>
  );
}
