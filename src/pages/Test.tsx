import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "../components/Timer";
import Question from "../components/Question";
import { getQuestions, calculateResults, saveResult } from "../services/api";
import type { Question as Q } from "../services/api";
import { useI18n } from "../i18n";

const TIME_LIMIT_SECONDS = 20 * 60; // 20 минут

export default function Test() {
  const questions = getQuestions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>(
    Array(questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  function handleAnswer(answer: number | string) {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answer;
    setAnswers(newAnswers);

    // Переход к следующему вопросу
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Последний вопрос - автоматически submit
      handleSubmit(newAnswers);
    }
  }

  async function handleSubmit(finalAnswers?: (number | string | null)[]) {
    const finalAnswersData = finalAnswers ?? answers;
    const { score, percent } = calculateResults(finalAnswersData, questions);
    
    // Попытка сохранить (опционально)
    await saveResult(score, percent, finalAnswersData);

    navigate("/result", { 
      state: { 
        score, 
        percent,
        totalQuestions: questions.filter(q => q.type === "logic").length
      } 
    });
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{t("pages.test.inProgress") || "Тест жүрүүдө"}</h2>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          {timeDisplay}
        </div>
      </div>

      {/* Timer работает в фоне, обновляет timeLeft через onTick */}
      <Timer 
        initialTime={TIME_LIMIT_SECONDS} 
        onTimeUp={() => handleSubmit()} 
        onTick={(s) => setTimeLeft(s)} 
      />

      <div style={{ marginTop: "30px" }}>
        <p style={{ marginBottom: "10px" }}>
          {currentIndex + 1} / {questions.length}
        </p>
        <Question question={questions[currentIndex]} onAnswer={handleAnswer} />
      </div>
    </div>
  );
}