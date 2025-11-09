# Framingham ML Models Implementation Progress

## ✅ Completed (Steps 1-5)

### 1. Database Schema
- Created `sql/create_predictions_table.sql`
- Table structure: `predictions(id, user_id, model, input, probability, label, created_at)`
- **Action Required:** Run this SQL script in Supabase SQL Editor

### 2. TypeScript Infrastructure  
- ✅ `lib/risk/schema.ts` - Zod validation schemas for both models
- ✅ `lib/risk/map.ts` - Backward compatibility mappers for old payloads
- ✅ `lib/risk/framinghamCvd.ts` - CVD risk calculator with sex-specific coefficients
- ✅ `lib/risk/framinghamDiabetes.ts` - Diabetes risk calculator with logistic regression

### 3. Key Features Implemented
- **CVD Calculator:** Uses Framingham 2008 model with natural logarithms, handles treated/untreated BP
- **Diabetes Calculator:** Uses Framingham Offspring model with 10 indicator variables
- **Mappers:** Detect old vs new payload formats, provide missing field lists
- **Risk Buckets:** CVD (low<5%, borderline 5-7.5%, intermediate 7.5-20%, high>20%), Diabetes (low<10%, intermediate 10-20%, high>20%)

## 🚧 Remaining Work

### 6-7. Update API Routes (HIGH PRIORITY)
Update `app/api/predict-diabetes/route.ts` and `app/api/predict-heart/route.ts`:

```typescript
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { mapIncomingDiabetesPayload } from "@/lib/risk/map";
import { computeFraminghamDiabetes } from "@/lib/risk/framinghamDiabetes";
import { framinghamDiabetesSchema } from "@/lib/risk/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = await auth();
    
    // 1. Map payload (handles old and new formats)
    const { mapped, isOldFormat, missingFields } = mapIncomingDiabetesPayload(body);
    
    // 2. Check for missing required fields
    if (missingFields.length > 0) {
      return NextResponse.json({
        error: "Missing required fields for accurate risk calculation",
        missingFields,
        message: `Please provide: ${missingFields.join(", ")}`,
      }, { status: 400 });
    }
    
    // 3. Validate with Zod
    const validatedInput = framinghamDiabetesSchema.parse(mapped);
    
    // 4. Try FastAPI first if configured
    const fastApiUrl = process.env.FAST_API_URL;
    if (fastApiUrl && fastApiUrl !== 'mock') {
      try {
        const response = await fetch(`${fastApiUrl}/predict-diabetes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: [...] }),
        });
        if (response.ok) {
          const mlResult = await response.json();
          // Log to Supabase asynchronously
          logPrediction(userId, 'framingham_dm_2007', validatedInput, mlResult.probability, 'remote');
          return NextResponse.json(mlResult);
        }
      } catch (err) {
        console.log("FastAPI unavailable, falling back to local calculator");
      }
    }
    
    // 5. Compute locally with Framingham
    const result = computeFraminghamDiabetes(validatedInput);
    const risk = result.probability;
    const riskPct = Math.round(risk * 1000) / 10;
    const prediction = riskPct > 20 ? 1 : 0;
    
    // 6. Log to Supabase
    logPrediction(userId, 'framingham_dm_2007', validatedInput, risk, result.label);
    
    // 7. Return in expected format
    return NextResponse.json({
      testId: body.testId ?? null,
      prediction,
      probability: risk,
      message: 'Computed locally via Framingham Offspring Diabetes Model (2007)',
      inputData: body,
      rawResponse: {
        model: 'framingham_dm_2007',
        riskPercentage: riskPct,
        label: result.label,
        details: result.details,
      },
    });
  } catch (error) {
    // Handle errors
  }
}

async function logPrediction(userId, model, input, probability, label) {
  try {
    const supabase = createSupabaseServerClient();
    await supabase.from('predictions').insert({
      user_id: userId,
      model,
      input: JSON.stringify(input),
      probability,
      label,
    });
  } catch (err) {
    console.error("Failed to log prediction:", err);
    // Don't fail the request
  }
}
```

**Similar pattern for predict-heart route** using `mapIncomingCvdPayload`, `computeFraminghamCvd`, and `framinghamCvdSchema`.

### 8-9. Update Frontend Forms (MEDIUM PRIORITY)
File: `app/diagnostics/[id]/page.tsx`

**DiabetesTestModal** - Replace fields:
```typescript
// OLD: pregnancies, glucose, blood_pressure, skin_thickness, insulin, diabetes_pedigree
// NEW: sex (dropdown), age, bmi, sbp, onBpTherapy (checkbox), hdl, tg (triglycerides), fastingGlucose, parentalHistory (checkbox)

<Label>Sex</Label>
<select name="sex" required>
  <option value="">Select...</option>
  <option value="male">Male</option>
  <option value="female">Female</option>
</select>

<Label>HDL Cholesterol (mg/dL)</Label>
<Input type="number" name="hdl" placeholder="40-100" required />

<Label>Triglycerides (mg/dL)</Label>
<Input type="number" name="tg" placeholder="30-400" required />

<Label>Fasting Glucose (mg/dL)</Label>
<Input type="number" name="fastingGlucose" placeholder="70-126" required />

<Label>
  <Input type="checkbox" name="onBpTherapy" />
  Currently on blood pressure medication
</Label>

<Label>
  <Input type="checkbox" name="parentalHistory" />
  Parent has/had diabetes
</Label>
```

**CardiovascularTestModal** - Add fields:
```typescript
// ADD: hdl, treated (checkbox)
// KEEP: age, sex, totalChol (from totChol), sbp (from sysBP), smoker (from is_smoking), diabetes

<Label>HDL Cholesterol (mg/dL)</Label>
<Input type="number" name="hdl" placeholder="20-100" required />

<Label>
  <Input type="checkbox" name="treated" />
  Currently on blood pressure medication
</Label>
```

Add disclaimer text:
```tsx
<p className="text-sm text-gray-500 mt-4">
  ⓘ Educational risk estimate based on published Framingham models; not a medical diagnosis.
</p>
```

### 10. Tests (LOW PRIORITY)
Create `lib/risk/__tests__/calculators.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { computeFraminghamCvd } from '../framinghamCvd';
import { computeFraminghamDiabetes } from '../framinghamDiabetes';

describe('Framingham CVD', () => {
  it('calculates low risk for healthy female', () => {
    const result = computeFraminghamCvd({
      sex: 'female',
      age: 45,
      totalChol: 180,
      hdl: 60,
      sbp: 110,
      treated: false,
      smoker: false,
      diabetes: false,
    });
    expect(result.label).toBe('low');
    expect(result.probability).toBeLessThan(0.05);
  });
  
  it('calculates high risk for male with multiple factors', () => {
    const result = computeFraminghamCvd({
      sex: 'male',
      age: 65,
      totalChol: 280,
      hdl: 35,
      sbp: 160,
      treated: true,
      smoker: true,
      diabetes: true,
    });
    expect(result.label).toBe('high');
    expect(result.probability).toBeGreaterThan(0.20);
  });
});
```

### 11. Environment Variables
Create `.env.local.sample`:
```bash
# FastAPI Backend (optional - falls back to local Framingham calculators)
FAST_API_URL=http://localhost:8000
# Use 'mock' to force local calculation

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Resend (email)
RESEND_API_KEY=your_resend_key

# Cloudflare Workers AI (chat)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

## Testing the Implementation

1. **Run predictions table SQL** in Supabase
2. **Test old payload format:**
   ```bash
   curl -X POST http://localhost:3000/api/predict-diabetes \
     -H "Content-Type: application/json" \
     -d '{"testId":"test1","pregnancies":6,"glucose":148,"blood_pressure":72,"skin_thickness":35,"insulin":0,"bmi":33.6,"diabetes_pedigree":0.627,"age":50}'
   ```
   Expected: Should return with computed Framingham risk

3. **Test new payload format:**
   ```bash
   curl -X POST http://localhost:3000/api/predict-diabetes \
     -H "Content-Type: application/json" \
     -d '{"testId":"test2","sex":"female","age":55,"bmi":32,"sbp":140,"onBpTherapy":true,"hdl":45,"tg":180,"fastingGlucose":110,"parentalHistory":true}'
   ```
   Expected: Should return accurate Framingham Diabetes risk

## Current Status Summary

✅ **Working:** Core calculators, mappers, schemas  
🚧 **TODO:** API route refactoring, form updates, tests  
📊 **Models:** Framingham CVD 2008 (General), Framingham Diabetes 2007 (Offspring)  
🎯 **Goal:** Keep response format, add local fallback, log predictions
