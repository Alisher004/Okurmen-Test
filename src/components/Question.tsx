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
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ marginBottom: "20px", fontSize: "18px" }}>
          {question.question[lang]}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {question.options!.map((opt, idx) => (
            <label
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <input
                name={`q-${question.id}`}
                type="radio"
                onChange={() => onAnswer(idx)}
                style={{ marginRight: "10px", width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ marginBottom: "20px", fontSize: "18px" }}>
        {question.question[lang]}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === "ru" ? "Ваш ответ" : "Жооп"}
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "12px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "16px",
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
        <button
          onClick={() => {
            if (input.trim()) {
              onAnswer(input);
            }
          }}
          disabled={!input.trim()}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: input.trim() ? "#3b82f6" : "#9ca3af",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: input.trim() ? "pointer" : "not-allowed",
            alignSelf: "flex-start",
          }}
        >
          {lang === "ru" ? "Далее" : "Кийинки"}
        </button>
      </div>
    </div>
  );
}
