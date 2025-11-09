-- ============================================
-- Migration: Update diagnostics table structure
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop the old diagnostics table if it exists (BE CAREFUL - this deletes data!)
-- Only do this if you don't have production data yet
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS diagnostics CASCADE;
DROP TABLE IF EXISTS tests CASCADE;

-- Create the new diagnostics table with the correct structure
CREATE TABLE diagnostics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
    symptom TEXT NOT NULL,
    ai_summary TEXT NOT NULL,
    hospital TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    test_name TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tests table to store multiple tests per diagnostic
CREATE TABLE tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diagnostic_id UUID NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    test_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    result_file TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate appointments table with correct foreign key
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
    diagnostic_id UUID NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ,
    appointment_time TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_diagnostics_user_id ON diagnostics(user_id);
CREATE INDEX idx_diagnostics_created_at ON diagnostics(created_at DESC);
CREATE INDEX idx_tests_diagnostic_id ON tests(diagnostic_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_diagnostic_id ON appointments(diagnostic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_diagnostics_updated_at ON diagnostics;
CREATE TRIGGER update_diagnostics_updated_at
    BEFORE UPDATE ON diagnostics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tests_updated_at ON tests;
CREATE TRIGGER update_tests_updated_at
    BEFORE UPDATE ON tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for diagnostics
CREATE POLICY "Users can view their own diagnostics"
    ON diagnostics FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own diagnostics"
    ON diagnostics FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own diagnostics"
    ON diagnostics FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create RLS Policies for tests
CREATE POLICY "Users can view their own tests"
    ON tests FOR SELECT
    USING (diagnostic_id IN (SELECT id FROM diagnostics WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can insert their own tests"
    ON tests FOR INSERT
    WITH CHECK (diagnostic_id IN (SELECT id FROM diagnostics WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Create RLS Policies for appointments
CREATE POLICY "Users can view their own appointments"
    ON appointments FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own appointments"
    ON appointments FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own appointments"
    ON appointments FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Verification
SELECT 'Diagnostics table created' as status, count(*) as columns
FROM information_schema.columns 
WHERE table_name = 'diagnostics';

SELECT 'Tests table created' as status, count(*) as columns
FROM information_schema.columns 
WHERE table_name = 'tests';

SELECT 'Appointments table created' as status, count(*) as columns
FROM information_schema.columns 
WHERE table_name = 'appointments';
