import React from "react";
import { useI18n } from "../i18n";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={() => setLang("ru")}
        disabled={lang === "ru"}
        style={{
          padding: "8px 16px",
          fontSize: "14px",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          backgroundColor: lang === "ru" ? "#3b82f6" : "#ffffff",
          color: lang === "ru" ? "white" : "#374151",
          cursor: lang === "ru" ? "default" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {t("language.ru") || "Русский"}
      </button>
      <button
        onClick={() => setLang("kg")}
        disabled={lang === "kg"}
        style={{
          padding: "8px 16px",
          fontSize: "14px",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          backgroundColor: lang === "kg" ? "#3b82f6" : "#ffffff",
          color: lang === "kg" ? "white" : "#374151",
          cursor: lang === "kg" ? "default" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {t("language.kg") || "Кыргызча"}
      </button>
    </div>
  );
}
