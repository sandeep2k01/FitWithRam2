# FitWithRam — Full Stack Gym Platform

A complete gym management platform with workout tracking, diet plans, progress analytics, and Razorpay payments.

## Tech Stack
- **Frontend**: React + Vite, React Router, Recharts, Zustand
- **Backend**: Supabase (Auth + Database + RLS)
- **Payments**: Razorpay
- **Styling**: Pure CSS with CSS Variables

---

## How to Open the Site (Step by Step)

### Prerequisites
Install these first if you don't have them:
1. **Node.js** — Download from https://nodejs.org (LTS version)
2. **Git** (optional) — https://git-scm.com

### Step 1 — Set Up Supabase (Free)
1. Go to https://supabase.com → Sign Up → Create New Project
2. Wait for project to start (~2 minutes)
3. Go to **SQL Editor** → paste the entire contents of `supabase_schema.sql` → click **Run**
4. Go to **Settings → API** and copy:
   - `Project URL` 
   - `anon / public` key

### Step 2 — Set Up Razorpay (Free test account)
1. Go to https://razorpay.com → Sign Up
2. Go to **Settings → API Keys** → Generate Test Key
3. Copy the **Key ID** (starts with `rzp_test_...`)

### Step 3 — Configure Environment
1. In the project folder, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Open `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```

### Step 4 — Install & Run
Open terminal in the project folder and run:
```bash
npm install
npm run dev
```

Then open your browser and go to:
```
http://localhost:5173
```

**That's it! The site is live on your computer.**

---

## Make Ram an Admin

After signing up with Ram's email:
1. Go to Supabase → **SQL Editor**
2. Run:
```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```
3. Log out and log back in → you'll see the Admin Panel link

---

## Page Structure

```
/                     → Landing page (public)
/signup               → Create account
/login                → Sign in
/forgot-password      → Reset password

/dashboard            → Member home (stats, chart, recent workouts)
/dashboard/workouts   → Workout history
/dashboard/workouts/log → Log a new workout (live session)
/dashboard/exercises  → Exercise library
/dashboard/progress   → Charts, body measurements
/dashboard/diet       → Diet plan + calorie tracking
/dashboard/payments   → Upgrade to premium (Razorpay)
/dashboard/profile    → Edit profile, change password

/admin                → Admin overview (members, revenue)
/admin/members        → Manage all members, change plans
/admin/programs       → Create/manage workout programs
/admin/diet           → Create diet plans, assign to members
/admin/payments       → View all payment history
```

---

## Deploy to Internet (Vercel — Free)

1. Push code to GitHub
2. Go to https://vercel.com → Import repo
3. Add environment variables (same as your .env)
4. Click Deploy → Your site gets a live URL like `fitwithram.vercel.app`

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts + plan info |
| `exercises` | Exercise library (pre-seeded) |
| `workouts` | Logged workout sessions |
| `workout_exercises` | Exercises within each workout |
| `sets` | Individual sets (weight + reps) |
| `measurements` | Body measurements over time |
| `programs` | Workout programs created by Ram |
| `diet_plans` | Diet plans created by Ram |
| `diet_meals` | Individual meals in each plan |
| `user_diet_plans` | Which plan is assigned to which member |
| `food_logs` | Daily food/calorie logs |
| `payments` | Razorpay payment records |
