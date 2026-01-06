export interface Question {
  id: number;
  type: "logic" | "motivation";
  question: { ru: string; kg: string };
  options?: string[];
  correct?: number; // index for logic
}

const mockQuestions: Question[] = [
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
    type: "motivation",
    question: {
      ru: "Сколько часов в день вы готовы учиться?",
      kg: "Күнүнө канча саат окууга даярсың?",
    },
  },
];

export function fetchQuestions(): Promise<Question[]> {
  return new Promise((res) => setTimeout(() => res(mockQuestions), 300));
}

export function submitResults(payload: { answers: (number | string | null)[]; questions: Question[] }): Promise<{ score: number }>{
  const { answers, questions } = payload;
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (q.type === "logic" && typeof answers[i] === "number") {
      if (answers[i] === q.correct) score += 1;
    }
  }
  return new Promise((res) => setTimeout(() => res({ score }), 300));
}
