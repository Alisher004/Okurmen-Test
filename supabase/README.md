# Supabase Database Schema - Online Entrance Exam System

This directory contains the complete database schema for the online entrance exam system using Supabase (PostgreSQL + Auth + Row Level Security).

## 📋 Table of Contents

- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [Row Level Security (RLS)](#row-level-security-rls)
- [RPC Functions](#rpc-functions)
- [Usage Examples](#usage-examples)
- [Business Logic](#business-logic)

## 🚀 Setup Instructions

### 1. Run the Schema in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and execute the SQL script
5. Verify all tables, policies, and functions were created successfully

### 2. Create Initial Admin User

After running the schema, create an admin user:

```sql
-- Option 1: Via Supabase Auth UI (recommended)
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Enter email and password
-- 4. After user is created, update the profile:

UPDATE profiles
SET role = 'admin', full_name = 'Admin User'
WHERE email = 'admin@example.com';
```

Or programmatically:

```typescript
// In your application code
const { data, error } = await supabase.auth.signUp({
  email: 'admin@example.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'Admin User',
      role: 'admin'
    }
  }
});

// After user is created, ensure the profile is updated
await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('email', 'admin@example.com');
```

### 3. Seed Initial Data (Optional)

Create a test and some questions:

```sql
-- Create a test
INSERT INTO tests (level, total_questions, time_limit_minutes, is_active)
VALUES ('easy', 10, 30, true);

-- Create sample questions
INSERT INTO questions (level, type, question_ru, question_kg, options, correct_answer)
VALUES 
  (
    'easy',
    'logic',
    '2 + 2 = ?',
    '2 + 2 = ?',
    '["3", "4", "5", "6"]'::jsonb,
    1
  ),
  (
    'easy',
    'logic',
    'Что больше: 5 или 3?',
    'Эмне чоң: 5 же 3?',
    '["5", "3", "2", "1"]'::jsonb,
    0
  ),
  (
    'easy',
    'motivation',
    'Сколько часов в день вы готовы учиться?',
    'Күнүнө канча саат окууга даярсың?',
    NULL,
    NULL
  );
```

## 📊 Database Schema

### Tables Overview

#### 1. `profiles`
Stores user profile information linked to Supabase Auth.

- `id` (UUID, PK): References `auth.users.id`
- `full_name` (TEXT): User's full name
- `email` (TEXT): User's email (unique)
- `role` (TEXT): Either `'admin'` or `'student'`
- `created_at` (TIMESTAMP): Account creation time

#### 2. `questions`
Stores exam questions.

- `id` (UUID, PK): Question identifier
- `level` (TEXT): `'easy'` or `'medium'`
- `type` (TEXT): `'logic'` or `'motivation'`
- `question_ru` (TEXT): Question text in Russian
- `question_kg` (TEXT): Question text in Kyrgyz
- `options` (JSONB): Array of answer options (only for logic questions)
- `correct_answer` (INTEGER): Index of correct answer (only for logic questions)

#### 3. `tests`
Defines test configurations.

- `id` (UUID, PK): Test identifier
- `level` (TEXT): `'easy'` or `'medium'`
- `total_questions` (INTEGER): Number of questions in the test
- `time_limit_minutes` (INTEGER): Time limit for completing the test
- `is_active` (BOOLEAN): Whether the test is currently active

#### 4. `test_attempts`
Stores student test attempts and results.

- `id` (UUID, PK): Attempt identifier
- `user_id` (UUID, FK): References `profiles.id`
- `level` (TEXT): Test level attempted
- `score` (INTEGER): Number of correct answers (auto-calculated)
- `percent` (INTEGER): Percentage score 0-100 (auto-calculated)
- `logic_level` (TEXT): `'weak'`, `'medium'`, or `'high'` (auto-assigned)
- `answers` (JSONB): Student's answers
- `started_at` (TIMESTAMP): When test was started
- `finished_at` (TIMESTAMP): When test was completed

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Profiles
- ✅ Users can view/update their own profile
- ✅ Admins can view all profiles

### Questions
- ✅ Students can read active questions (from active tests)
- ✅ Admins have full CRUD access

### Tests
- ✅ Students can read active tests only
- ✅ Admins have full CRUD access

### Test Attempts
- ✅ Students can insert their own attempts
- ✅ Students can read only their own attempts
- ✅ Admins can read all attempts
- ❌ No updates or deletes allowed (immutable records)

## 🔧 RPC Functions

### 1. `submit_test_attempt(p_level, p_answers, p_started_at)`

Submits a test attempt for the authenticated student.

**Parameters:**
- `p_level` (TEXT): `'easy'` or `'medium'`
- `p_answers` (JSONB): Student's answers (see format below)
- `p_started_at` (TIMESTAMP, optional): When test was started (defaults to NOW())

**Returns:**
- `attempt_id` (UUID)
- `score` (INTEGER)
- `percent` (INTEGER)
- `logic_level` (TEXT)

**Behavior:**
- Prevents duplicate attempts per level
- Validates test is active
- Auto-calculates score, percent, and logic_level

**Answer Format:**
```json
// Option 1: Object format (recommended)
{
  "question-uuid-1": 0,
  "question-uuid-2": 1,
  "question-uuid-3": "some text answer"
}

// Option 2: Array format (ordered by question creation)
[0, 1, "some text answer"]
```

### 2. `get_active_questions(p_level)`

Retrieves active questions for a specific level.

**Parameters:**
- `p_level` (TEXT): `'easy'` or `'medium'`

**Returns:** Questions with correct_answer visible only to admins

### 3. `get_test_attempts(p_user_id)`

Retrieves test attempts.

**Parameters:**
- `p_user_id` (UUID, optional): Filter by user ID (admins only)

**Returns:** Test attempts (students see own, admins see all)

### 4. `can_attempt_test(p_level)`

Checks if a student can attempt a test (hasn't already attempted).

**Parameters:**
- `p_level` (TEXT): `'easy'` or `'medium'`

**Returns:**
- `can_attempt` (BOOLEAN)
- `existing_attempt_id` (UUID, if exists)
- `existing_score` (INTEGER, if exists)
- `existing_percent` (INTEGER, if exists)

## 💻 Usage Examples

### Student: Check if can attempt test

```typescript
const { data, error } = await supabase
  .rpc('can_attempt_test', { p_level: 'easy' });

if (data && data[0].can_attempt) {
  // Student can take the test
} else {
  // Student already attempted
  console.log('Previous score:', data[0].existing_score);
}
```

### Student: Get active questions

```typescript
const { data, error } = await supabase
  .rpc('get_active_questions', { p_level: 'easy' });

// Note: correct_answer will be null for students
```

### Student: Submit test attempt

```typescript
const answers = {
  "question-uuid-1": 1,
  "question-uuid-2": 0,
  "question-uuid-3": "I am highly motivated"
};

const { data, error } = await supabase
  .rpc('submit_test_attempt', {
    p_level: 'easy',
    p_answers: answers,
    p_started_at: new Date().toISOString()
  });

if (data) {
  console.log('Score:', data[0].score);
  console.log('Percent:', data[0].percent);
  console.log('Logic Level:', data[0].logic_level);
}
```

### Student: Get own test attempts

```typescript
const { data, error } = await supabase
  .rpc('get_test_attempts');
```

### Admin: Create a question

```typescript
const { data, error } = await supabase
  .from('questions')
  .insert({
    level: 'easy',
    type: 'logic',
    question_ru: '2 + 2 = ?',
    question_kg: '2 + 2 = ?',
    options: ['3', '4', '5', '6'],
    correct_answer: 1
  });
```

### Admin: Create/activate a test

```typescript
const { data, error } = await supabase
  .from('tests')
  .insert({
    level: 'easy',
    total_questions: 10,
    time_limit_minutes: 30,
    is_active: true
  });
```

### Admin: View all test attempts

```typescript
// Get all attempts
const { data, error } = await supabase
  .rpc('get_test_attempts');

// Get attempts for specific user
const { data, error } = await supabase
  .rpc('get_test_attempts', { p_user_id: 'user-uuid' });
```

## 🧮 Business Logic

### Score Calculation

1. Only **logic questions** are scored
2. **Motivation questions** are not scored (they're for assessment purposes)
3. Score = number of correct logic answers
4. Percent = (score / total_logic_questions) × 100

### Logic Level Assignment

Based on percent score:
- **0-40%**: `'weak'`
- **41-70%**: `'medium'`
- **71-100%**: `'high'`

### Duplicate Prevention

- Each student can only attempt each level (`easy`, `medium`) **once**
- Attempts are immutable (cannot be updated or deleted)
- The system automatically prevents duplicate submissions

### Auto-Calculations

All calculations happen automatically via database triggers:
- `score` and `percent` are calculated on insert
- `logic_level` is assigned based on percent
- `finished_at` is set to current time if not provided

## 🔐 Security Notes

1. **Passwords**: Never stored or exposed - handled entirely by Supabase Auth
2. **Email**: Used as unique user identifier
3. **RLS**: All tables enforce Row Level Security
4. **Correct Answers**: Hidden from students in API responses
5. **Immutable Attempts**: Test attempts cannot be modified after submission

## 🧪 Testing

After setup, verify:

1. ✅ RLS policies are active
2. ✅ Students can only see their own attempts
3. ✅ Students cannot see correct answers
4. ✅ Admins can manage all data
5. ✅ Duplicate attempts are prevented
6. ✅ Score calculation works correctly

## 📝 Notes

- The schema uses `SECURITY DEFINER` for RPC functions to bypass RLS when needed
- All timestamps use `TIMESTAMP WITH TIME ZONE`
- JSONB is used for flexible answer storage
- Indexes are created for common query patterns
- The profile is automatically created when a user signs up via the trigger

