-- =====================================================
-- Online Entrance Exam System - Database Schema
-- Supabase PostgreSQL with Row Level Security
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Auto-create profile on user signup (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. QUESTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level TEXT NOT NULL CHECK (level IN ('easy', 'medium')),
    type TEXT NOT NULL CHECK (type IN ('logic', 'motivation')),
    question_ru TEXT NOT NULL,
    question_kg TEXT NOT NULL,
    options JSONB,
    correct_answer INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
-- Students can read active questions (from active tests)
CREATE POLICY "Students can read active questions"
    ON questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'student'
        )
        AND EXISTS (
            SELECT 1 FROM tests
            WHERE tests.level = questions.level
            AND tests.is_active = true
        )
    );

-- Admins have full access to questions
CREATE POLICY "Admins can manage questions"
    ON questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 3. TESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level TEXT NOT NULL CHECK (level IN ('easy', 'medium')),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    time_limit_minutes INTEGER NOT NULL CHECK (time_limit_minutes > 0),
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tests
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tests
-- Students can read active tests
CREATE POLICY "Students can read active tests"
    ON tests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'student'
        )
        AND is_active = true
    );

-- Admins have full access to tests
CREATE POLICY "Admins can manage tests"
    ON tests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 4. TEST_ATTEMPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('easy', 'medium')),
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
    percent INTEGER NOT NULL DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
    logic_level TEXT CHECK (logic_level IN ('weak', 'medium', 'high')),
    answers JSONB NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_level ON test_attempts(user_id, level);

-- Enable RLS on test_attempts
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_attempts
-- Students can insert their own attempts
CREATE POLICY "Students can insert own attempts"
    ON test_attempts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'student'
        )
        AND user_id = auth.uid()
    );

-- Students can read their own attempts only
CREATE POLICY "Students can read own attempts"
    ON test_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'student'
        )
        AND user_id = auth.uid()
    );

-- Admins can read all attempts
CREATE POLICY "Admins can read all attempts"
    ON test_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Prevent updates/deletes via RLS (only insert and read)
CREATE POLICY "No updates to test attempts"
    ON test_attempts FOR UPDATE
    USING (false);

CREATE POLICY "No deletes to test attempts"
    ON test_attempts FOR DELETE
    USING (false);

-- =====================================================
-- 5. HELPER FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to calculate score and percent, and assign logic_level
CREATE OR REPLACE FUNCTION calculate_test_results(
    p_user_id UUID,
    p_level TEXT,
    p_answers JSONB
)
RETURNS TABLE (
    calculated_score INTEGER,
    calculated_percent INTEGER,
    calculated_logic_level TEXT
) AS $$
DECLARE
    v_total_questions INTEGER;
    v_correct_count INTEGER := 0;
    v_score INTEGER := 0;
    v_percent INTEGER := 0;
    v_logic_level TEXT;
    v_question RECORD;
    v_answer_value INTEGER;
    v_question_index INTEGER := 0;
BEGIN
    -- Get total questions for the level
    SELECT COUNT(*) INTO v_total_questions
    FROM questions
    WHERE level = p_level AND type = 'logic';
    
    IF v_total_questions = 0 THEN
        RAISE EXCEPTION 'No logic questions found for level %', p_level;
    END IF;

    -- Calculate score by checking each logic question
    -- Support both answer formats:
    -- 1. Object: {"question_id": answer_index}
    -- 2. Array: [answer1, answer2, ...] (ordered by question creation)
    FOR v_question IN 
        SELECT id, correct_answer
        FROM questions
        WHERE level = p_level AND type = 'logic'
        ORDER BY created_at
    LOOP
        -- Try to get answer by question ID first (object format)
        v_answer_value := (p_answers->>v_question.id::TEXT)::INTEGER;
        
        -- If not found, try array format (indexed by question order)
        IF v_answer_value IS NULL AND jsonb_typeof(p_answers) = 'array' THEN
            v_answer_value := (p_answers->>v_question_index)::INTEGER;
        END IF;
        
        -- Check if answer is correct
        IF v_answer_value IS NOT NULL AND v_question.correct_answer IS NOT NULL THEN
            IF v_answer_value = v_question.correct_answer THEN
                v_correct_count := v_correct_count + 1;
            END IF;
        END IF;
        
        v_question_index := v_question_index + 1;
    END LOOP;
    
    v_score := v_correct_count;
    v_percent := ROUND((v_correct_count::DECIMAL / v_total_questions::DECIMAL) * 100);
    
    -- Assign logic_level based on percent
    IF v_percent >= 0 AND v_percent <= 40 THEN
        v_logic_level := 'weak';
    ELSIF v_percent >= 41 AND v_percent <= 70 THEN
        v_logic_level := 'medium';
    ELSIF v_percent >= 71 AND v_percent <= 100 THEN
        v_logic_level := 'high';
    ELSE
        v_logic_level := NULL;
    END IF;
    
    RETURN QUERY SELECT v_score, v_percent, v_logic_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-calculate score, percent, and logic_level before insert
CREATE OR REPLACE FUNCTION before_test_attempt_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_result RECORD;
BEGIN
    -- Calculate results
    SELECT * INTO v_result
    FROM calculate_test_results(NEW.user_id, NEW.level, NEW.answers);
    
    -- Set calculated values
    NEW.score := v_result.calculated_score;
    NEW.percent := v_result.calculated_percent;
    NEW.logic_level := v_result.calculated_logic_level;
    
    -- Set finished_at if not provided
    IF NEW.finished_at IS NULL THEN
        NEW.finished_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_before_test_attempt_insert ON test_attempts;
CREATE TRIGGER trigger_before_test_attempt_insert
    BEFORE INSERT ON test_attempts
    FOR EACH ROW
    EXECUTE FUNCTION before_test_attempt_insert();

-- =====================================================
-- 6. RPC FUNCTIONS (Public API)
-- =====================================================

-- RPC: Submit test attempt (prevents duplicate attempts per level)
CREATE OR REPLACE FUNCTION submit_test_attempt(
    p_level TEXT,
    p_answers JSONB,
    p_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    attempt_id UUID,
    score INTEGER,
    percent INTEGER,
    logic_level TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
    v_existing_attempt UUID;
    v_result RECORD;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Check user role
    SELECT role INTO v_user_role
    FROM profiles
    WHERE id = v_user_id;
    
    IF v_user_role != 'student' THEN
        RAISE EXCEPTION 'Only students can submit test attempts';
    END IF;
    
    -- Check if user already attempted this level
    SELECT id INTO v_existing_attempt
    FROM test_attempts
    WHERE user_id = v_user_id AND level = p_level
    LIMIT 1;
    
    IF v_existing_attempt IS NOT NULL THEN
        RAISE EXCEPTION 'You have already attempted the test for level %. Only one attempt per level is allowed.', p_level;
    END IF;
    
    -- Validate level
    IF p_level NOT IN ('easy', 'medium') THEN
        RAISE EXCEPTION 'Invalid level. Must be "easy" or "medium"';
    END IF;
    
    -- Check if test is active
    IF NOT EXISTS (
        SELECT 1 FROM tests
        WHERE level = p_level AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Test for level % is not active', p_level;
    END IF;
    
    -- Insert test attempt (trigger will calculate score, percent, logic_level)
    INSERT INTO test_attempts (user_id, level, answers, started_at, finished_at)
    VALUES (v_user_id, p_level, p_answers, p_started_at, NOW())
    RETURNING id, score, percent, logic_level
    INTO v_result.attempt_id, v_result.score, v_result.percent, v_result.logic_level;
    
    RETURN QUERY SELECT 
        v_result.attempt_id,
        v_result.score,
        v_result.percent,
        v_result.logic_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get active questions for a level (for students)
CREATE OR REPLACE FUNCTION get_active_questions(p_level TEXT)
RETURNS TABLE (
    id UUID,
    level TEXT,
    type TEXT,
    question_ru TEXT,
    question_kg TEXT,
    options JSONB,
    correct_answer INTEGER
) AS $$
DECLARE
    v_user_role TEXT;
BEGIN
    -- Get current user
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Check user role
    SELECT role INTO v_user_role
    FROM profiles
    WHERE id = auth.uid();
    
    -- Students can only get questions if test is active
    IF v_user_role = 'student' THEN
        IF NOT EXISTS (
            SELECT 1 FROM tests
            WHERE level = p_level AND is_active = true
        ) THEN
            RAISE EXCEPTION 'Test for level % is not active', p_level;
        END IF;
    -- Admins can always get questions
    ELSIF v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized access';
    END IF;
    
    RETURN QUERY
    SELECT 
        q.id,
        q.level,
        q.type,
        q.question_ru,
        q.question_kg,
        q.options,
        -- Only return correct_answer for admins
        CASE WHEN v_user_role = 'admin' THEN q.correct_answer ELSE NULL END as correct_answer
    FROM questions q
    WHERE q.level = p_level
    ORDER BY q.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get user's test attempts (students see own, admins see all)
CREATE OR REPLACE FUNCTION get_test_attempts(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    level TEXT,
    score INTEGER,
    percent INTEGER,
    logic_level TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_current_user_id UUID;
    v_user_role TEXT;
BEGIN
    v_current_user_id := auth.uid();
    
    IF v_current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Get user role
    SELECT role INTO v_user_role
    FROM profiles
    WHERE id = v_current_user_id;
    
    -- Students can only see their own attempts
    IF v_user_role = 'student' THEN
        IF p_user_id IS NOT NULL AND p_user_id != v_current_user_id THEN
            RAISE EXCEPTION 'Students can only view their own attempts';
        END IF;
        RETURN QUERY
        SELECT 
            ta.id,
            ta.user_id,
            ta.level,
            ta.score,
            ta.percent,
            ta.logic_level,
            ta.started_at,
            ta.finished_at
        FROM test_attempts ta
        WHERE ta.user_id = v_current_user_id
        ORDER BY ta.started_at DESC;
    -- Admins can see all attempts or filter by user_id
    ELSIF v_user_role = 'admin' THEN
        RETURN QUERY
        SELECT 
            ta.id,
            ta.user_id,
            ta.level,
            ta.score,
            ta.percent,
            ta.logic_level,
            ta.started_at,
            ta.finished_at
        FROM test_attempts ta
        WHERE (p_user_id IS NULL OR ta.user_id = p_user_id)
        ORDER BY ta.started_at DESC;
    ELSE
        RAISE EXCEPTION 'Unauthorized access';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Check if user can attempt test (returns if they already attempted)
CREATE OR REPLACE FUNCTION can_attempt_test(p_level TEXT)
RETURNS TABLE (
    can_attempt BOOLEAN,
    existing_attempt_id UUID,
    existing_score INTEGER,
    existing_percent INTEGER
) AS $$
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
    v_existing RECORD;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    SELECT role INTO v_user_role
    FROM profiles
    WHERE id = v_user_id;
    
    IF v_user_role != 'student' THEN
        RAISE EXCEPTION 'Only students can attempt tests';
    END IF;
    
    -- Check for existing attempt
    SELECT id, score, percent INTO v_existing
    FROM test_attempts
    WHERE user_id = v_user_id AND level = p_level
    LIMIT 1;
    
    -- Check if test is active
    IF NOT EXISTS (
        SELECT 1 FROM tests
        WHERE level = p_level AND is_active = true
    ) THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::INTEGER, NULL::INTEGER;
        RETURN;
    END IF;
    
    IF v_existing.id IS NULL THEN
        RETURN QUERY SELECT true, NULL::UUID, NULL::INTEGER, NULL::INTEGER;
    ELSE
        RETURN QUERY SELECT 
            false, 
            v_existing.id, 
            v_existing.score, 
            v_existing.percent;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_questions_level_type ON questions(level, type);
CREATE INDEX IF NOT EXISTS idx_tests_level_active ON tests(level, is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON questions TO authenticated;
GRANT SELECT ON tests TO authenticated;
GRANT SELECT, INSERT ON test_attempts TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION submit_test_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_questions TO authenticated;
GRANT EXECUTE ON FUNCTION get_test_attempts TO authenticated;
GRANT EXECUTE ON FUNCTION can_attempt_test TO authenticated;