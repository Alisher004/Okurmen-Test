import { useLocation, useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { useI18n } from "../i18n";

function Result() {
  const { state } = useLocation() as any;
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  if (!state) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>{lang === "ru" ? "Результаты недоступны" : "Натыйжалар жок"}</p>
        <button 
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {lang === "ru" ? "Главная" : "Башкы бет"}
        </button>
      </div>
    );
  }

  const { score, percent, totalQuestions } = state;

  const getLevelText = () => {
    if (percent < 40) {
      return lang === "ru" ? "Слабый" : "Алсыз";
    } else if (percent < 70) {
      return lang === "ru" ? "Средний" : "Орточо";
    } else {
      return lang === "ru" ? "Высокий" : "Жогорку";
    }
  };

  const getLevelColor = () => {
    if (percent < 40) return "#ef4444"; // red
    if (percent < 70) return "#f59e0b"; // orange
    return "#10b981"; // green
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ marginBottom: "20px" }}>
        {lang === "ru" ? "Результаты теста" : "Тесттин натыйжасы"}
      </h2>

      <div style={{ marginBottom: "30px" }}>
        <div style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "10px" }}>
          {score} / {totalQuestions || 0}
        </div>
        <div style={{ fontSize: "36px", fontWeight: "bold", color: getLevelColor(), marginBottom: "10px" }}>
          {percent}%
        </div>
        <div style={{ fontSize: "20px", marginTop: "10px" }}>
          {lang === "ru" ? "Уровень" : "Деңгээл"}: {getLevelText()}
        </div>
      </div>

      <ProgressBar percent={percent} />

      <div style={{ marginTop: "30px", display: "flex", gap: "12px", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
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
          {lang === "ru" ? "Вернуться на главную" : "Башкы бетке кайтуу"}
        </button>
        <button
          onClick={() => navigate("/test")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
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
          {lang === "ru" ? "Пройти тест ещё раз" : "Тестти кайра өтүү"}
        </button>
      </div>
    </div>
  );
}

export default Result;