import { useState, useEffect } from 'react';
import { Question, getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../services/api';
import { useI18n } from '../i18n';

const QuestionsAdmin = () => {
  const { lang } = useI18n();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<Partial<Question>>({
    text: '',
    level: 'beginner',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      setMessage({ type: 'error', text: lang === 'ru' ? 'Ошибка загрузки вопросов' : 'Суроолорду жүктөө катасы' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'correctAnswer' ? parseInt(value) : value,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions,
    }));
  };

  const resetForm = () => {
    setFormData({
      text: '',
      level: 'beginner',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text || !formData.options?.some(o => o.trim())) {
      setMessage({ type: 'error', text: lang === 'ru' ? 'Заполните все поля' : 'Бардык чөлөктөрдү толуктаңыз' });
      return;
    }

    try {
      if (editingId) {
        const updated = await updateQuestion(editingId, formData);
        if (updated) {
          setMessage({ type: 'success', text: lang === 'ru' ? 'Вопрос обновлён' : 'Суроо жаңыланды' });
          resetForm();
          loadQuestions();
        }
      } else {
        const created = await createQuestion(formData as Omit<Question, 'id'>);
        if (created) {
          setMessage({ type: 'success', text: lang === 'ru' ? 'Вопрос создан' : 'Суроо түзүлдү' });
          resetForm();
          loadQuestions();
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: lang === 'ru' ? 'Ошибка операции' : 'Операциялык ката' });
    }
  };

  const handleEdit = (question: Question) => {
    setFormData(question);
    setEditingId(question.id);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'ru' ? 'Удалить вопрос?' : 'Суроону очуруу керебиби?')) {
      return;
    }

    try {
      const success = await deleteQuestion(id);
      if (success) {
        setMessage({ type: 'success', text: lang === 'ru' ? 'Вопрос удалён' : 'Суроо очурулду' });
        loadQuestions();
      }
    } catch (error) {
      setMessage({ type: 'error', text: lang === 'ru' ? 'Ошибка удаления' : 'Очуруу катасы' });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>{lang === 'ru' ? 'Управление вопросами' : 'Суроолорду башкаруу'}</h2>

      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#dc2626',
          borderRadius: '4px',
        }}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{editingId ? (lang === 'ru' ? 'Редактировать' : 'Өзгөртүү') : (lang === 'ru' ? 'Добавить вопрос' : 'Суроо кошуу')}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label>{lang === 'ru' ? 'Текст вопроса' : 'Суроонун текстик'}</label>
            <textarea
              name="text"
              value={formData.text || ''}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontFamily: 'inherit',
              }}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>{lang === 'ru' ? 'Уровень сложности' : 'Кыйындык деңгээли'}</label>
              <select
                name="level"
                value={formData.level || 'beginner'}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              >
                <option value="beginner">{lang === 'ru' ? 'Начинающий' : 'Баштапкы'}</option>
                <option value="intermediate">{lang === 'ru' ? 'Средний' : 'Орточо'}</option>
                <option value="advanced">{lang === 'ru' ? 'Продвинутый' : 'Өркүндүү'}</option>
              </select>
            </div>

            <div>
              <label>{lang === 'ru' ? 'Правильный ответ (индекс)' : 'Туура жооп (индекси)'}</label>
              <input
                type="number"
                name="correctAnswer"
                value={formData.correctAnswer || 0}
                onChange={handleInputChange}
                min="0"
                max="3"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          {/* Options */}
          <div>
            <label>{lang === 'ru' ? 'Варианты ответов' : 'Жооп вариантилары'}</label>
            {(formData.options || []).map((option, index) => (
              <input
                key={index}
                type="text"
                value={option || ''}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`${lang === 'ru' ? 'Вариант' : 'Вариант'} ${index + 1}`}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            ))}
          </div>

          <div>
            <label>{lang === 'ru' ? 'Объяснение' : 'Түшүндүрүү'}</label>
            <textarea
              name="explanation"
              value={formData.explanation || ''}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontFamily: 'inherit',
              }}
              rows={2}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {editingId ? (lang === 'ru' ? 'Сохранить' : 'Сактоо') : (lang === 'ru' ? 'Добавить' : 'Кошуу')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {lang === 'ru' ? 'Отмена' : 'Болдур'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Questions List */}
      <div>
        <h3>{lang === 'ru' ? 'Список вопросов' : 'Суроолордун тизмеси'} ({questions.length})</h3>
        {isLoading ? (
          <p>{lang === 'ru' ? 'Загрузка...' : 'Жүктүүдө...'}</p>
        ) : questions.length === 0 ? (
          <p>{lang === 'ru' ? 'Вопросы не найдены' : 'Суроолор табылган жок'}</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {questions.map((question) => (
              <div
                key={question.id}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                }}
              >
                <h4>{question.text}</h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  {lang === 'ru' ? 'Уровень:' : 'Деңгээли:'} {question.level}
                </p>
                <div style={{ marginBottom: '12px' }}>
                  {question.options.map((opt, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: idx === question.correctAnswer ? '#d1fae5' : '#f3f4f6',
                        borderRadius: '4px',
                        marginBottom: '4px',
                      }}
                    >
                      {idx === question.correctAnswer ? '✓' : ''} {opt}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(question)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {lang === 'ru' ? 'Редактировать' : 'Өзгөртүү'}
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {lang === 'ru' ? 'Удалить' : 'Очуруу'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsAdmin;
