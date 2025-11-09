# Database Migration Guide

## Issue
The diagnostics API is failing because the database schema doesn't match the code structure.

## Solution
Run the migration script to update your Supabase database.

## Steps

### 1. Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"

### 2. Run the Migration Script
Copy and paste the contents of `sql/migrate_diagnostics_table.sql` into the SQL Editor and click "Run".

**⚠️ WARNING: This will delete existing data in diagnostics, tests, and appointments tables!**
If you have important data, back it up first.

### 3. Verify the Migration
After running the script, you should see success messages like:
```
Diagnostics table created | 10 columns
Tests table created | 8 columns  
Appointments table created | 8 columns
```

### 4. Test Your Application
1. Refresh your browser
2. Try submitting the medical form again
3. The error should be resolved

## What Changed?

The migration updates the `diagnostics` table structure from:
- OLD: `test_type`, `result` (JSONB), `risk_level`, `prediction_value`
- NEW: `symptom`, `ai_summary`, `hospital`, `scheduled_date`, `test_name`, `status`

It also creates a new `tests` table to store multiple tests per diagnostic entry.

## Rollback (if needed)

If something goes wrong, you can restore the original schema by running `sql/setup_database.sql` again. However, this will also delete all data.
