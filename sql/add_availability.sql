-- Add doctor availability system
-- Stores available time slots for appointment scheduling by weekday

-- Drop the old table if it exists (it has the wrong schema with 'date' column)
DROP TABLE IF EXISTS doctor_availability CASCADE;

-- Create doctor_availability table
CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id TEXT NOT NULL, -- Clerk user ID of doctor
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    available_slots JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of time slots: ["09:00", "09:30", "10:00"]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doctor_id, day_of_week), -- One row per doctor per weekday
    CHECK (day_of_week >= 0 AND day_of_week <= 6)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_day_of_week ON doctor_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_day ON doctor_availability(doctor_id, day_of_week);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_doctor_availability_updated_at ON doctor_availability;
CREATE TRIGGER update_doctor_availability_updated_at
    BEFORE UPDATE ON doctor_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Doctors can manage their own availability
CREATE POLICY "Doctors can view their own availability"
    ON doctor_availability FOR SELECT
    USING (doctor_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Doctors can insert their own availability"
    ON doctor_availability FOR INSERT
    WITH CHECK (doctor_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Doctors can update their own availability"
    ON doctor_availability FOR UPDATE
    USING (doctor_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow all authenticated users to view availability (for booking)
CREATE POLICY "Everyone can view doctor availability"
    ON doctor_availability FOR SELECT
    USING (true);

-- Add booked_slots tracking to appointments (optional - for double-booking prevention)
-- This helps track which specific time slot was booked
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS time_slot TEXT;

CREATE INDEX IF NOT EXISTS idx_appointments_time_slot ON appointments(appointment_date, time_slot);

-- Comment for documentation
COMMENT ON TABLE doctor_availability IS 'Stores doctor available time slots for appointment scheduling by recurring weekday';
COMMENT ON COLUMN doctor_availability.day_of_week IS 'Day of week: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday';
COMMENT ON COLUMN doctor_availability.available_slots IS 'Array of available time slots in HH:MM format, e.g., ["09:00", "09:30", "10:00"]';
COMMENT ON COLUMN appointments.time_slot IS 'Specific time slot booked from doctor availability, e.g., "09:00"';
