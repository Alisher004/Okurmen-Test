const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Question {
  id: string;
  text: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Получить все вопросы с сервера
export async function getQuestions(): Promise<Question[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

// Получить вопросы по уровню сложности
export async function getQuestionsByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<Question[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/level/${level}`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

// Получить один вопрос
export async function getQuestion(id: string): Promise<Question | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching question:', error);
    return null;
  }
}

// Создать вопрос
export async function createQuestion(question: Omit<Question, 'id'>): Promise<Question | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });
    if (!response.ok) {
      throw new Error('Failed to create question');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating question:', error);
    return null;
  }
}

// Обновить вопрос
export async function updateQuestion(id: string, question: Partial<Question>): Promise<Question | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });
    if (!response.ok) {
      throw new Error('Failed to update question');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating question:', error);
    return null;
  }
}

// Удалить вопрос
export async function deleteQuestion(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting question:', error);
    return false;
  }
}

// Рассчитать результат
export function calculateResults(
  answers: (number | string | null)[],
  questions: Question[]
): { score: number; percent: number } {
  let score = 0;
  let totalQuestions = questions.length;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (typeof answers[i] === "number" && answers[i] === q.correctAnswer) {
      score += 1;
    }
  }

  const percent = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);

  return { score, percent };
}

// Сохранить результат на наш backend
export async function saveResult(
  score: number,
  percent: number,
  answers: (number | string | null)[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, percent, answers, createdAt: new Date().toISOString() }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn('Failed to save attempt:', text);
      return { success: false, error: text };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Error saving attempt:', err?.message || err);
    return { success: false, error: String(err) };
  }
}
