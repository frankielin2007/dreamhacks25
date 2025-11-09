# 🚀 Quick Start: Implementing Appointment Types

## Step 1: Run SQL Migration (REQUIRED)

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL:

```sql
-- Add appointment_type column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_type TEXT 
DEFAULT 'test' 
CHECK (appointment_type IN ('test', 'consultation'));

-- Create index for filtering by appointment type
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(appointment_type);

-- Update existing high-risk appointments to be consultations
UPDATE appointments
SET appointment_type = 'consultation'
WHERE notes LIKE '%HIGH RISK%' OR is_high_risk = true;

-- Add column comment
COMMENT ON COLUMN appointments.appointment_type IS 'Type of appointment: test (for diagnostic tests) or consultation (for high-risk patient doctor visits)';
```

4. Click **Run** or press `Cmd/Ctrl + Enter`
5. Verify success message appears

## Step 2: Restart Your Development Server

```bash
# If your dev server is running, stop it (Ctrl+C)
# Then restart:
npm run dev
```

## Step 3: View the Dashboard

1. Navigate to: `http://localhost:3000/doctor`
2. You should now see:
   - **Purple badges** 🩺 labeled "Consultation" for high-risk appointments
   - **Blue badges** 🧪 labeled "Test" for regular test appointments

## Step 4: Test the Feature

### Test Regular Appointment (Should show Blue "Test" badge):
1. Go to `/start` and start a new diagnostic
2. Complete the chat flow
3. Book an appointment as a regular patient
4. Check doctor dashboard - should show **blue "Test" badge**

### Test High-Risk Consultation (Should show Purple "Consultation" badge):
1. Start a new diagnostic that triggers high risk (≥20%)
2. Book the high-priority consultation
3. Check doctor dashboard - should show **purple "Consultation" badge**

## Expected Results

### ✅ Success Indicators:
- [ ] SQL migration runs without errors
- [ ] Doctor dashboard loads successfully
- [ ] Existing appointments show badges (most likely "Test" in blue)
- [ ] High-risk appointments show "Consultation" in purple
- [ ] New test appointments show "Test" in blue
- [ ] New consultations show "Consultation" in purple
- [ ] Badges appear in both card view and detail modal
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode colors look good

### 🔧 If Something Goes Wrong:

**SQL Error:**
- Check if column already exists: `SELECT appointment_type FROM appointments LIMIT 1;`
- If exists, skip the ALTER TABLE line

**Dashboard Not Updating:**
- Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Check browser console for errors
- Restart dev server

**Badges Not Showing:**
- Check browser console for React errors
- Verify Lucide icons imported correctly
- Check if appointment_type field is in database

## What Changed?

### Files Modified:
1. ✅ `/sql/add_appointment_type.sql` - NEW migration file
2. ✅ `/app/api/appointments/route.ts` - Sets appointment_type on creation
3. ✅ `/components/doctor/DoctorDashboardClient.tsx` - Displays badges
4. ✅ `/app/(app)/doctor/page.tsx` - Updated interface

### UI Improvements:
- Better responsive grid (works on all screen sizes)
- Consistent spacing and alignment
- Text truncation to prevent overflow
- Uniform button widths
- High-risk highlighting preserved

## Quick Reference

### Appointment Type Logic:
```typescript
// In booking API:
appointment_type: isHighRisk ? "consultation" : "test"

// High-risk triggers:
- isHighRisk: true flag in booking request
- Cardiovascular risk ≥ 20%
- Flagged by HighRiskCareScheduling component
```

### Badge Colors:
```typescript
// Consultation (High-Risk):
bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300

// Test (Regular):
bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300
```

## Need Help?

Check these files for details:
- `APPOINTMENT_TYPE_UPDATE.md` - Complete technical documentation
- `APPOINTMENT_TYPE_VISUAL_GUIDE.md` - Visual examples and design guide
- `sql/add_appointment_type.sql` - Database migration script

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify SQL migration ran successfully
3. Ensure dev server restarted after code changes
4. Clear browser cache if UI doesn't update
5. Check Supabase logs for API errors

---

**That's it! You're ready to go.** 🎉

The doctor dashboard now clearly distinguishes between diagnostic test appointments and high-risk patient consultations with visual badges and improved UI.
