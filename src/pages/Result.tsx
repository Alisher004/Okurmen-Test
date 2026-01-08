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
        <button onClick={() => navigate("/")}>
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
      return lang === "ru" ? "Средний" : "Орто";
    } else {
      return lang === "ru" ? "Высокий" : "Жогору";
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

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {lang === "ru" ? "Вернуться на главную" : "Башкы бетке кайтуу"}
      </button>
    </div>
  );
}

export default Result;