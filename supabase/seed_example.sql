-- =====================================================
-- Example Seed Data for Online Entrance Exam System
-- Run this AFTER running schema.sql
-- =====================================================

-- =====================================================
-- 1. Create Test Configurations
-- =====================================================

-- Easy level test
INSERT INTO tests (level, total_questions, time_limit_minutes, is_active)
VALUES ('easy', 10, 30, true)
ON CONFLICT DO NOTHING;

-- Medium level test
INSERT INTO tests (level, total_questions, time_limit_minutes, is_active)
VALUES ('medium', 15, 45, false) -- Inactive by default
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. Create Sample Questions (Easy Level)
-- =====================================================

-- Logic Questions
INSERT INTO questions (level, type, question_ru, question_kg, options, correct_answer)
VALUES 
  -- Question 1
  (
    'easy',
    'logic',
    '2 + 2 = ?',
    '2 + 2 = ?',
    '["3", "4", "5", "6"]'::jsonb,
    1  -- Answer index: 0-based, so 1 = "4"
  ),
  -- Question 2
  (
    'easy',
    'logic',
    'Что больше: 5 или 3?',
    'Эмне чоң: 5 же 3?',
    '["5", "3", "2", "1"]'::jsonb,
    0  -- Answer index: 0 = "5"
  ),
  -- Question 3
  (
    'easy',
    'logic',
    'Сколько будет 10 - 4?',
    '10 - 4 канча?',
    '["5", "6", "7", "8"]'::jsonb,
    1  -- Answer index: 1 = "6"
  ),
  -- Question 4
  (
    'easy',
    'logic',
    'Какой день следует после понедельника?',
    'Дүйшөмбүдөн кийин кайсы күн келет?',
    '["Воскресенье", "Понедельник", "Вторник", "Среда"]'::jsonb,
    2  -- Answer index: 2 = "Вторник"
  ),
  -- Question 5
  (
    'easy',
    'logic',
    'Если у вас 3 яблока и вы дали 1 другу, сколько осталось?',
    'Эгерде сизде 3 алма болсо жана сиз 1 досуңузга берсеңиз, канчасы калды?',
    '["1", "2", "3", "4"]'::jsonb,
    1  -- Answer index: 1 = "2"
  );

-- Motivation Questions (no correct_answer, no options)
INSERT INTO questions (level, type, question_ru, question_kg, options, correct_answer)
VALUES 
  -- Question 6
  (
    'easy',
    'motivation',
    'Сколько часов в день вы готовы учиться?',
    'Күнүнө канча саат окууга даярсың?',
    NULL,
    NULL
  ),
  -- Question 7
  (
    'easy',
    'motivation',
    'Почему вы хотите поступить в это учебное заведение?',
    'Эмне үчүн сиз ушул окуу жайына тапшыргыңыз келет?',
    NULL,
    NULL
  ),
  -- Question 8
  (
    'easy',
    'motivation',
    'Какие у вас планы на будущее?',
    'Келечегиңиз боюнча кандай пландарыңыз бар?',
    NULL,
    NULL
  );

-- =====================================================
-- 3. Create Sample Questions (Medium Level)
-- =====================================================

-- Logic Questions for Medium Level
INSERT INTO questions (level, type, question_ru, question_kg, options, correct_answer)
VALUES 
  -- Question 1
  (
    'medium',
    'logic',
    'Если x + 5 = 12, то чему равно x?',
    'Эгерде x + 5 = 12 болсо, анда x эмнени туюнтат?',
    '["5", "6", "7", "8"]'::jsonb,
    2  -- Answer index: 2 = "7"
  ),
  -- Question 2
  (
    'medium',
    'logic',
    'Какой процент составляет 25 из 100?',
    '25 100дөн канча пайыз?',
    '["15%", "20%", "25%", "30%"]'::jsonb,
    2  -- Answer index: 2 = "25%"
  ),
  -- Question 3
  (
    'medium',
    'logic',
    'Если последовательность чисел: 2, 4, 8, 16, то следующее число?',
    'Эгерде сандар катарлашуусу: 2, 4, 8, 16 болсо, анда кийинки сан?',
    '["24", "32", "40", "48"]'::jsonb,
    1  -- Answer index: 1 = "32"
  );

-- Motivation Questions for Medium Level
INSERT INTO questions (level, type, question_ru, question_kg, options, correct_answer)
VALUES 
  (
    'medium',
    'motivation',
    'Как вы планируете применять полученные знания?',
    'Алынган билимдерди кантип колдонмоңуз келет?',
    NULL,
    NULL
  ),
  (
    'medium',
    'motivation',
    'Опишите ваши сильные стороны',
    'Күчтүү тараптарыңызды сүрөттөп бериңиз',
    NULL,
    NULL
  );

-- =====================================================
-- 4. Notes
-- =====================================================

-- After running this seed data:
-- 1. Create admin user via Supabase Auth UI or programmatically
-- 2. Update admin profile:
--    UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
-- 3. Students will be auto-created when they sign up via Supabase Auth
-- 4. To activate medium level test:
--    UPDATE tests SET is_active = true WHERE level = 'medium';

