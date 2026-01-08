import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";

function Home() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px", fontSize: "28px" }}>
        {t("pages.home.welcome") || (lang === "ru" ? "Добро пожаловать" : "Кош келдиңиз")}
      </h1>
      <p style={{ marginBottom: "30px", fontSize: "16px", color: "#6b7280" }}>
        {lang === "ru" 
          ? "Пройдите тест для оценки ваших знаний" 
          : "Билимдериңизди баалоо үчүн тесттен өтүңүз"}
      </p>
      <button
        onClick={() => navigate("/test")}
        style={{
          padding: "14px 32px",
          fontSize: "18px",
          fontWeight: "bold",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#3b82f6";
        }}
      >
        {t("app.start") || (lang === "ru" ? "Начать тест" : "Тестти баштоо")}
      </button>
    </div>
  );
}

export default Home;