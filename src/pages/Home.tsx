import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { t, lang } = useI18n();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px", fontSize: "28px" }}>
        {t("pages.home.welcome") || (lang === "ru" ? "Добро пожаловать" : "Кош келдиңиз")}
      </h1>
      <p style={{ marginBottom: "30px", fontSize: "16px", color: "#6b7280" }}>
        {isLoggedIn
          ? (lang === "ru" 
            ? "Пройдите тест для оценки ваших знаний" 
            : "Билимдериңизди баалоо үчүн тесттен өтүңүз")
          : (lang === "ru"
            ? "Пожалуйста, войдите или зарегистрируйтесь, чтобы начать тест"
            : "Тестти баштоо үчүн сураныч, кирүү же катталуу кылыңыз")
        }
      </p>
      {isLoggedIn ? (
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
      ) : (
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/login")}
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
            {lang === "ru" ? "Войти" : "Кирүү"}
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "14px 32px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#059669";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#10b981";
            }}
          >
            {lang === "ru" ? "Регистрация" : "Катталуу"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;