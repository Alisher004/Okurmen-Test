import { useState } from "react";
import { useI18n } from "../i18n";
import type { Question } from "../services/api";

interface QuestionProps {
  question: Question;
  onAnswer: (answer: number | string) => void;
}

export default function Question({ question, onAnswer }: QuestionProps) {
  const { lang } = useI18n();
  const [input, setInput] = useState("");

  if (question.type === "logic") {
    return (
      <div>
        <p>{question.question[lang]}</p>
        {question.options!.map((opt, idx) => (
          <div key={idx}>
            <label>
              <input
                name={`q-${question.id}`}
                type="radio"
                onChange={() => onAnswer(idx)}
              />
              {opt}
            </label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p>{question.question[lang]}</p>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={lang === "ru" ? "Ваш ответ" : "Жооп"}
      />
      <button onClick={() => onAnswer(input)}>Submit</button>
    </div>
  );
}
