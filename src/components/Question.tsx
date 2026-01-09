import { useState } from "react";
import { useI18n } from "../i18n";
import type { Question } from "../services/api";

interface QuestionProps {
  question: Question;
  onAnswer: (answer: number | string) => void;
}

export default function Question({ question, onAnswer }: QuestionProps) {
  const { lang } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ marginBottom: "20px", fontSize: "18px" }}>
        {question.text}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {question.options.map((opt, idx) => (
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
              backgroundColor: selected === idx ? "#dbeafe" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (selected !== idx) {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = selected === idx ? "#dbeafe" : "transparent";
            }}
          >
            <input
              name={`q-${question.id}`}
              type="radio"
              checked={selected === idx}
              onChange={() => {
                setSelected(idx);
                setTimeout(() => onAnswer(idx), 100);
              }}
              style={{ marginRight: "10px", width: "18px", height: "18px", cursor: "pointer" }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {question.explanation && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#f0fdf4",
          borderLeft: "4px solid #10b981",
          borderRadius: "4px",
          fontSize: "14px",
        }}>
          <strong>{lang === 'ru' ? 'Объяснение:' : 'Түшүндүрүү:'}</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}
