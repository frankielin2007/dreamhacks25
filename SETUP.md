# 🚀 FluxCare Setup Guide

Complete step-by-step guide to get the FluxCare healthcare application running locally.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- A **Supabase** account - [Sign up](https://supabase.com/)
- A **Clerk** account - [Sign up](https://clerk.com/)
- A **Resend** account - [Sign up](https://resend.com/)
- A **FastAPI ML backend** (running separately)

---

## 🛠️ Step 1: Install Dependencies

Dependencies have already been installed, but if you need to reinstall:

```bash
npm install
```

---

## 🔐 Step 2: Configure Environment Variables

A `.env.local` file has been created in the root directory. You need to fill in the actual values:

### 2.1 Supabase Setup

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project (or use existing)
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**
5. Update in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
   ```

### 2.2 Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application (or use existing)
3. Go to **API Keys**
4. Copy your **Publishable Key** and **Secret Key**
5. Update in `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### 2.3 Resend Setup

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Update in `.env.local`:
   ```bash
   RESEND_API_KEY=re_...
   ```

### 2.4 FastAPI Backend

If running locally (default):
```bash
FAST_API_URL=http://localhost:8000
```

If deployed, use your deployment URL.

---

## 🗄️ Step 3: Setup Supabase Database

1. Open your Supabase project
2. Go to **SQL Editor**
3. Open the file `sql/setup_database.sql` (created in this repo)
4. Copy and paste the entire SQL script
5. Click **Run** to execute

This will create:
- ✅ `users` table (with onboarding fields)
- ✅ `diagnostics` table (for test results)
- ✅ `appointments` table (for scheduling)
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for timestamp updates

**Verify tables were created:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'diagnostics', 'appointments');
```

---

## 🔗 Step 4: Setup Clerk Webhook

The app needs to sync user creation from Clerk to Supabase.

### 4.1 Local Development (using ngrok)

1. Install ngrok: `brew install ngrok` (macOS) or download from [ngrok.com](https://ngrok.com/)
2. Start your Next.js app: `npm run dev`
3. In a new terminal, expose your local server:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 4.2 Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) → **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - Local: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Production: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
5. Copy the **Signing Secret**
6. Update in `.env.local`:
   ```bash
   CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
   ```

---

## 🤖 Step 5: Setup FastAPI ML Backend

The application expects a FastAPI backend with ML models for predictions.

### Required Endpoints:

#### POST `/predict-diabetes`
```json
{
  "features": [pregnancies, glucose, blood_pressure, skin_thickness, insulin, bmi, diabetes_pedigree, age]
}
```

**Response:**
```json
{
  "prediction": 0 or 1,
  "probability": 0.0 to 1.0
}
```

#### POST `/predict-heart`
```json
{
  "features": [age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal]
}
```

**Response:**
```json
{
  "prediction": 0 or 1,
  "probability": 0.0 to 1.0
}
```

### Running the ML Backend:

1. Make sure your FastAPI server is running on port 8000
2. Test with curl:
   ```bash
   curl http://localhost:8000/predict-diabetes -X POST -H "Content-Type: application/json" -d '{"features": [1, 85, 66, 29, 0, 26.6, 0.351, 31]}'
   ```

---

## 🚀 Step 6: Run the Application

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## 🧪 Step 7: Test the Application

### 7.1 Create a Test User

1. Go to `http://localhost:3000`
2. Click **Sign Up**
3. Create a new account
4. You should be redirected to `/onboarding`

### 7.2 Complete Onboarding

Fill in the onboarding form with:
- Phone number
- Address (street, city, state, zip)
- Insurance information (optional)

### 7.3 Test Diagnostics

1. Go to `/dashboard`
2. Run a diabetes or heart disease test
3. Enter test parameters
4. The ML model should predict risk
5. If risk > 50%, an appointment option appears

### 7.4 Verify Database

Check Supabase to confirm:
- User was created in `users` table
- Diagnostic result saved in `diagnostics` table
- Appointment created in `appointments` table (if applicable)

---

## 📁 Project Structure

```
dreamhacks25/
├── app/
│   ├── api/                    # API routes
│   │   ├── appointments/       # Appointment management
│   │   ├── chat/              # AI chat endpoint
│   │   ├── diagnostics/       # Diagnostic CRUD
│   │   ├── onboarding/        # User onboarding
│   │   ├── predict-diabetes/  # ML diabetes prediction
│   │   ├── predict-heart/     # ML heart prediction
│   │   ├── send-appointment-email/ # Email notifications
│   │   └── webhooks/clerk/    # Clerk user sync
│   ├── dashboard/             # Main dashboard
│   ├── appointments/          # Appointments page
│   ├── diagnostics/[id]/      # Diagnostic details
│   ├── doctor/                # Doctor dashboard
│   └── onboarding/            # Onboarding page
├── components/                # React components
├── sql/                       # Database setup scripts
├── utils/                     # Utility functions
├── .env.local                 # Environment variables (you fill this)
├── .env.example              # Environment template
└── package.json              # Dependencies
```

---

## 🎯 Key Features

### Authentication
- ✅ Clerk-based authentication
- ✅ Protected routes via middleware
- ✅ Automatic user sync to Supabase

### Onboarding
- ✅ First-time user profile completion
- ✅ Insurance and contact information
- ✅ Automatic redirect to dashboard after completion

### Diagnostics
- ✅ Diabetes risk prediction (8 parameters)
- ✅ Heart disease risk prediction (13 parameters)
- ✅ ML-powered predictions via FastAPI
- ✅ Results stored in database

### Appointments
- ✅ Automatic appointment booking for high-risk results
- ✅ Email notifications via Resend
- ✅ Appointment management (view, cancel, confirm)
- ✅ Doctor dashboard to view all appointments

### AI Chat
- ✅ Context-aware medical chat
- ✅ Access to user medical history

---

## ⚠️ Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Make sure `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Issue: "Failed to fetch ML prediction"
**Solution:** 
- Ensure FastAPI backend is running on port 8000
- Check `FAST_API_URL` in `.env.local`
- Verify ML endpoints are responding

### Issue: "Webhook not working"
**Solution:**
- For local dev, use ngrok to expose localhost
- Verify webhook URL in Clerk dashboard
- Check `CLERK_WEBHOOK_SIGNING_SECRET` is correct
- Look at Clerk webhook logs for errors

### Issue: "Foreign key violation" in database
**Solution:** User must exist in `users` table before creating diagnostics or appointments. The webhook should create the user automatically.

### Issue: "RLS policy" errors
**Solution:** The app uses server-side Supabase client with service role key, so RLS shouldn't block operations. If you see RLS errors, check your Supabase policies.

---

## 🔒 Security Notes

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Use Row Level Security (RLS) in production
- ✅ Validate all user inputs on the server side
- ✅ Use HTTPS in production
- ✅ Rotate API keys regularly

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Add all environment variables in Vercel dashboard
4. Update Clerk webhook URL to production domain
5. Deploy

### Environment Variables for Production

Make sure to set all variables from `.env.local` in your deployment platform.

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

## 🆘 Need Help?

- Check the `docs/` folder for specific feature documentation
- Review API route files for implementation details
- Check Supabase logs for database errors
- Check Clerk logs for authentication issues

---

## ✅ Quick Start Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured with all values
- [ ] Supabase database tables created
- [ ] Clerk webhook configured
- [ ] FastAPI backend running
- [ ] Application running (`npm run dev`)
- [ ] Test user created and onboarding completed
- [ ] Test diagnostic performed successfully

---

**You're all set! 🎉 Start building amazing healthcare experiences with FluxCare!**
