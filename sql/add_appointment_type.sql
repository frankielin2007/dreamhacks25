-- Add appointment_type column to appointments table
-- This distinguishes between test appointments and consultation appointments

-- Add the appointment_type column with default value 'test'
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_type TEXT 
DEFAULT 'test' 
CHECK (appointment_type IN ('test', 'consultation'));

-- Create index for filtering by appointment type
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(appointment_type);

-- Comment for documentation
COMMENT ON COLUMN appointments.appointment_type IS 'Type of appointment: test (for diagnostic tests) or consultation (for high-risk patient doctor visits)';
