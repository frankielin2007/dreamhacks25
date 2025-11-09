-- ============================================
-- Create predictions table for ML model logging
-- Run this in your Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(clerk_user_id) ON DELETE SET NULL,
    model TEXT NOT NULL,
    input JSONB NOT NULL,
    probability NUMERIC NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_model ON predictions(model);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy (allow all access since we're using Clerk auth at app layer)
CREATE POLICY "Enable read access for all predictions"
    ON predictions FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all predictions"
    ON predictions FOR INSERT
    WITH CHECK (true);

-- Verification
SELECT 'Predictions table created successfully' as status, count(*) as columns
FROM information_schema.columns 
WHERE table_name = 'predictions';
