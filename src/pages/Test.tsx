import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "../components/Timer";
import Question from "../components/Question";
import { fetchQuestions, submitResults } from "../services/api";
import type { Question as Q } from "../services/api";
import { useI18n } from "../i18n";

export default function Test() {
  const [questions, setQuestions] = useState<Q[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    fetchQuestions().then((qs) => {
      setQuestions(qs);
      setAnswers(Array(qs.length).fill(null));
      setLoading(false);
    });
  }, []);

  function handleAnswer(answer: number | string) {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answer;
    setAnswers(newAnswers);

    // move forward automatically; no skipping/backwards
    if (currentIndex + 1 < questions.length) setCurrentIndex((i) => i + 1);
    else handleSubmit(newAnswers);
  }

  async function handleSubmit(finalAnswers?: (number | string | null)[]) {
    const payloadAnswers = finalAnswers ?? answers;
    const res = await submitResults({ answers: payloadAnswers, questions });
    const logicCount = questions.filter((q) => q.type === "logic").length;
    const percent = logicCount === 0 ? 0 : (res.score / logicCount) * 100;
    navigate("/result", { state: { score: res.score, percent, answers: payloadAnswers, questions } });
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{t("pages.test.inProgress")}</h2>
      <Timer initialTime={20 * 60} onTimeUp={() => handleSubmit()} onTick={(s) => setTimeLeft(s)} />

      <div>
        <p>
          {currentIndex + 1} / {questions.length}
        </p>
        <Question question={questions[currentIndex]} onAnswer={handleAnswer} />
      </div>
      <div>Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</div>
    </div>
  );
}