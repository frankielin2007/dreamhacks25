# FluxCare 🏥

**AI-Powered Primary Care Platform**

FluxCare is a comprehensive healthcare management system that combines artificial intelligence with modern web technologies to streamline primary care workflows. The platform features intelligent risk assessments, automated care plans, and seamless appointment scheduling—all in one elegant interface.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)

---

## ✨ Features

### For Patients
- 🤖 **AI Diagnostic Chat** - Describe symptoms in natural language
- 📊 **Risk Assessments** - Framingham CVD and diabetes predictions
- 📅 **Appointment Scheduling** - Book tests and consultations
- 📱 **Test Results Dashboard** - View all diagnostic results
- 🔔 **Email Notifications** - Get appointment confirmations
- 🌓 **Dark Mode Support** - Comfortable viewing any time

### For Doctors
- 👨‍⚕️ **Patient Dashboard** - Manage all appointments in one place
- 🎯 **Priority Care** - Identify high-risk patients automatically
- ✅ **Quick Actions** - Confirm or cancel appointments
- 📈 **Visual Analytics** - Track appointment statistics
- 🏥 **Patient Details** - Access complete medical information

### Technical Highlights
- ⚡ **Real-time Updates** - Instant status changes
- 🔒 **Role-based Access** - Secure patient/doctor separation
- 🎨 **Modern UI** - Glass morphism with Framer Motion
- 📱 **Fully Responsive** - Works on all devices
- 🛡️ **Type-safe** - End-to-end TypeScript

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account
- Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/frankielin2007/dreamhacks25.git
   cd dreamhacks25
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # Supabase Database
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   
   # Resend Email
   RESEND_API_KEY=re_...
   
   # AI API (Optional)
   OPENAI_API_KEY=sk-...
   ```

4. **Set up the database**
   
   Run the SQL scripts in your Supabase SQL Editor in this order:
   ```sql
   -- 1. Create base tables
   sql/setup_database.sql
   
   -- 2. Create predictions table
   sql/create_predictions_table.sql
   
   -- 3. Add appointment types
   sql/add_appointment_type.sql
   
   -- 4. Fix RLS policies
   sql/fix_rls_policies.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
dreamhacks25/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── appointments/   # Patient appointment management
│   │   ├── diagnostics/    # Diagnostic workflows
│   │   ├── doctor/         # Doctor dashboard
│   │   ├── tests/          # Test results
│   │   └── start/          # AI chat start
│   ├── (marketing)/        # Public marketing pages
│   ├── api/                # API routes
│   │   ├── appointments/   # Appointment CRUD
│   │   ├── chat/           # AI chat endpoint
│   │   ├── predict-*/      # ML predictions
│   │   └── send-appointment-email/
│   └── globals.css         # Global styles
├── components/
│   ├── app/                # App layout components
│   ├── diagnostics/        # Diagnostic flow components
│   ├── doctor/             # Doctor dashboard components
│   ├── marketing/          # Landing page components
│   └── ui/                 # Shadcn/ui components
├── lib/
│   ├── auth/               # Authentication utilities
│   ├── risk/               # Risk calculation algorithms
│   └── validation/         # Form validation schemas
├── sql/                    # Database migration scripts
└── docs/                   # Documentation

```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Shadcn/ui** - Accessible component library
- **Lucide React** - Beautiful icons

### Backend
- **Supabase** - PostgreSQL database with real-time
- **Clerk** - Authentication and user management
- **Resend** - Email notifications
- **OpenAI API** - AI-powered diagnostics

### Machine Learning
- **Framingham Algorithm** - Cardiovascular risk scoring
- **Diabetes Prediction Model** - Type 2 diabetes risk

---

## 📖 Key Documentation

- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Quick Start](./QUICKSTART.md) - Get running in 5 minutes
- [Appointment System](./QUICKSTART_APPOINTMENT_TYPES.md) - Appointment features
- [ML Implementation](./ML_IMPLEMENTATION_COMPLETE.md) - Risk algorithms
- [Brand System](./BRAND_SYSTEM.md) - Design guidelines
- [Migration Guide](./MIGRATION_GUIDE.md) - Version updates

---

## 🎨 Design System

FluxCare uses a custom brand system with:
- **Primary**: `#6366F1` (Indigo) - Trust and professionalism
- **Accent**: `#22D3EE` (Cyan) - Innovation and technology
- **Typography**: Sora (display), Inter (body)
- **Glass Morphism**: Modern translucent cards
- **Dark Mode**: Full support with smooth transitions

---

## 🔐 Security

- ✅ Row Level Security (RLS) on all database tables
- ✅ Clerk authentication with role-based access
- ✅ Environment variables for sensitive data
- ✅ Type-safe API routes with validation
- ✅ HIPAA-compliant data handling

---

## 📝 License

This project is part of DreamHacks 2025 hackathon.

---

## 🙏 Acknowledgments

- **Clerk** - Authentication infrastructure
- **Supabase** - Database and real-time functionality
- **Shadcn** - UI component system
- **Vercel** - Next.js framework and hosting
- **Resend** - Email delivery

---

## 📧 Contact

Built with ❤️ by Team FluxCare for DreamHacks 2025

For questions or support, please open an issue on GitHub.

---

**Made with Next.js, TypeScript, and modern web technologies** 🚀

