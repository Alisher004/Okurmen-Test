export interface Question {
  id: number;
  type: "logic" | "motivation";
  question: { ru: string; kg: string };
  options?: string[];
  correct?: number; // index for logic
}

// Статические вопросы
export const QUESTIONS: Question[] = [
  {
    id: 1,
    type: "logic",
    question: { ru: "2 + 2 = ?", kg: "2 + 2 = ?" },
    options: ["3", "4", "5", "6"],
    correct: 1,
  },
  {
    id: 2,
    type: "logic",
    question: { ru: "Что больше: 5 или 3?", kg: "Эмне чоң: 5 же 3?" },
    options: ["5", "3", "2", "1"],
    correct: 0,
  },
  {
    id: 3,
    type: "logic",
    question: { ru: "Сколько будет 10 - 4?", kg: "10 - 4 канча?" },
    options: ["5", "6", "7", "8"],
    correct: 1,
  },
  {
    id: 4,
    type: "motivation",
    question: {
      ru: "Сколько часов в день вы готовы учиться?",
      kg: "Күнүнө канча саат окууга даярсың?",
    },
  },
  {
    id: 5,
    type: "motivation",
    question: {
      ru: "Почему вы хотите поступить в это учебное заведение?",
      kg: "Эмне үчүн сиз ушул окуу жайына тапшыргыңыз келет?",
    },
  },
];

// Получить вопросы (синхронно)
export function getQuestions(): Question[] {
  return QUESTIONS;
}

// Рассчитать результат
export function calculateResults(
  answers: (number | string | null)[],
  questions: Question[]
): { score: number; percent: number } {
  let score = 0;
  let logicCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (q.type === "logic") {
      logicCount++;
      if (typeof answers[i] === "number" && answers[i] === q.correct) {
        score += 1;
      }
    }
  }

  const percent = logicCount === 0 ? 0 : Math.round((score / logicCount) * 100);

  return { score, percent };
}

// Сохранить результат в Supabase (опционально, с fallback на mock)
export async function saveResult(
  score: number,
  percent: number,
  answers: (number | string | null)[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Пытаемся использовать Supabase, если доступен
    const { supabase } = await import("./supabaseClient");
    
    if (!supabase) {
      console.warn("Supabase not configured, skipping save");
      return { success: true }; // Mock успех
    }
    
    const { error } = await supabase.from("test_attempts").insert({
      user_id: "anonymous", // Для упрощенной версии
      level: "easy",
      score,
      percent,
      answers,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Supabase insert failed, using mock:", error);
      return { success: true }; // Mock успех
    }

    return { success: true };
  } catch (err) {
    // Если Supabase недоступен, просто mock
    console.warn("Supabase not available, using mock");
    return { success: true }; // Mock успех
  }
}
