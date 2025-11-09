-- ============================================
-- FluxCare Database Setup Script
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create Users Table
-- This stores user profile information synced from Clerk
CREATE TABLE IF NOT EXISTS users (
    clerk_user_id TEXT PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    street_address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    insurance_provider TEXT,
    insurance_id TEXT,
    group_number TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Create Diagnostics Table
-- Stores all medical test results (diabetes, heart disease, etc.)
CREATE TABLE IF NOT EXISTS diagnostics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
    test_type TEXT NOT NULL CHECK (test_type IN ('diabetes', 'heart_disease', 'general')),
    result JSONB NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    prediction_value NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for diagnostics
CREATE INDEX IF NOT EXISTS idx_diagnostics_user_id ON diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_test_type ON diagnostics(test_type);
CREATE INDEX IF NOT EXISTS idx_diagnostics_created_at ON diagnostics(created_at DESC);

-- 3. Create Appointments Table
-- Manages appointment scheduling between patients and doctors
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
    diagnostic_id UUID NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ,
    appointment_time TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_diagnostic_id ON appointments(diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies
-- Users can read and update their own data
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can view their own diagnostics
CREATE POLICY "Users can view their own diagnostics"
    ON diagnostics FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own diagnostics"
    ON diagnostics FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can view their own appointments
CREATE POLICY "Users can view their own appointments"
    ON appointments FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own appointments"
    ON appointments FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own appointments"
    ON appointments FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- Optional: Insert Sample Data for Testing
-- ============================================

-- Note: Replace 'user_2mG3AXm6Db2cVBdviw1hgdQhCr3' with an actual Clerk user ID from your application

-- Sample user (uncomment and modify after you have a real user ID)
/*
INSERT INTO users (clerk_user_id, email, first_name, last_name, onboarding_completed)
VALUES (
    'user_2mG3AXm6Db2cVBdviw1hgdQhCr3',
    'test@example.com',
    'John',
    'Doe',
    true
) ON CONFLICT (clerk_user_id) DO NOTHING;
*/

-- Sample diagnostic (uncomment after creating a user)
/*
INSERT INTO diagnostics (user_id, test_type, result, risk_level, prediction_value)
VALUES (
    'user_2mG3AXm6Db2cVBdviw1hgdQhCr3',
    'diabetes',
    '{"glucose": 140, "bmi": 28.5, "age": 45}'::jsonb,
    'high',
    0.75
) ON CONFLICT DO NOTHING;
*/

-- ============================================
-- Verification Queries
-- ============================================

-- Check that all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'diagnostics', 'appointments');

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'diagnostics', 'appointments');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'diagnostics', 'appointments');
