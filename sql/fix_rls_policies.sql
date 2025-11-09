-- ============================================
-- Fix RLS Policies for Service Role Access
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Users can insert their own diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Users can update their own diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Users can view their own tests" ON tests;
DROP POLICY IF EXISTS "Users can insert their own tests" ON tests;
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;

-- Create new RLS policies that allow all access (since we're using Clerk, not Supabase auth)
-- For diagnostics
CREATE POLICY "Enable read access for all users"
    ON diagnostics FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users"
    ON diagnostics FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users"
    ON diagnostics FOR UPDATE
    USING (true);

-- For tests
CREATE POLICY "Enable read access for all tests"
    ON tests FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all tests"
    ON tests FOR INSERT
    WITH CHECK (true);

-- For appointments
CREATE POLICY "Enable read access for all appointments"
    ON appointments FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all appointments"
    ON appointments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all appointments"
    ON appointments FOR UPDATE
    USING (true);

-- Verification
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE tablename IN ('diagnostics', 'tests', 'appointments')
ORDER BY tablename, policyname;
