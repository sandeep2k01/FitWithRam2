-- ==========================================
-- FitWithRam — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ==========================================

-- PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  age integer,
  height numeric,
  goal text,
  role text default 'member' check (role in ('member', 'admin')),
  plan text default 'free' check (plan in ('free', 'monthly', 'yearly', 'lifetime')),
  is_premium boolean default false,
  plan_expires_at timestamptz,
  created_at timestamptz default now()
);

-- EXERCISES
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text,
  equipment text,
  description text,
  created_at timestamptz default now()
);

-- WORKOUTS
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text,
  duration_minutes integer default 0,
  total_volume numeric default 0,
  notes text,
  created_at timestamptz default now()
);

-- WORKOUT EXERCISES (exercises within a workout)
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id),
  order_index integer default 0,
  created_at timestamptz default now()
);

-- SETS
create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid references public.workout_exercises(id) on delete cascade not null,
  reps integer,
  weight numeric,
  completed boolean default false,
  created_at timestamptz default now()
);

-- MEASUREMENTS
create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  weight numeric,
  body_fat numeric,
  chest numeric,
  waist numeric,
  hips numeric,
  notes text,
  created_at timestamptz default now()
);

-- PROGRAMS (created by admin/Ram)
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  level text default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  duration_weeks integer,
  goal text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- DIET PLANS (created by Ram)
create table public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  daily_calories integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  created_at timestamptz default now()
);

-- DIET MEALS (meals within a diet plan)
create table public.diet_meals (
  id uuid primary key default gen_random_uuid(),
  diet_plan_id uuid references public.diet_plans(id) on delete cascade not null,
  meal_name text,
  foods text,
  calories integer,
  time_of_day text,
  order_index integer default 0
);

-- USER DIET PLANS (which plan is assigned to which user)
create table public.user_diet_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  diet_plan_id uuid references public.diet_plans(id),
  assigned_at timestamptz default now()
);

-- FOOD LOGS (daily food logging)
create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  food_name text not null,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  meal_type text,
  created_at timestamptz default now()
);

-- PAYMENTS
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan text not null,
  amount numeric not null,
  razorpay_payment_id text,
  razorpay_order_id text,
  status text default 'success',
  created_at timestamptz default now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.sets enable row level security;
alter table public.measurements enable row level security;
alter table public.food_logs enable row level security;
alter table public.payments enable row level security;
alter table public.user_diet_plans enable row level security;

-- Profiles: users see own, admin sees all
create policy "users_own_profile" on public.profiles for all using (auth.uid() = id);
create policy "admin_all_profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Workouts: users own data
create policy "users_own_workouts" on public.workouts for all using (auth.uid() = user_id);
create policy "admin_all_workouts" on public.workouts for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Workout exercises and sets (via workout ownership)
create policy "users_own_workout_exercises" on public.workout_exercises for all using (
  exists (select 1 from public.workouts where id = workout_id and user_id = auth.uid())
);
create policy "users_own_sets" on public.sets for all using (
  exists (select 1 from public.workout_exercises we join public.workouts w on w.id = we.workout_id where we.id = workout_exercise_id and w.user_id = auth.uid())
);

-- Measurements
create policy "users_own_measurements" on public.measurements for all using (auth.uid() = user_id);

-- Food logs
create policy "users_own_food_logs" on public.food_logs for all using (auth.uid() = user_id);

-- Payments
create policy "users_own_payments" on public.payments for all using (auth.uid() = user_id);
create policy "admin_all_payments" on public.payments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Exercises: public read
alter table public.exercises enable row level security;
create policy "exercises_public_read" on public.exercises for select using (true);
create policy "admin_manage_exercises" on public.exercises for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Programs: public read
alter table public.programs enable row level security;
create policy "programs_public_read" on public.programs for select using (true);
create policy "admin_manage_programs" on public.programs for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Diet plans: public read
alter table public.diet_plans enable row level security;
alter table public.diet_meals enable row level security;
create policy "diet_plans_public_read" on public.diet_plans for select using (true);
create policy "diet_meals_public_read" on public.diet_meals for select using (true);
create policy "admin_manage_diet_plans" on public.diet_plans for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_manage_diet_meals" on public.diet_meals for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- User diet plans
create policy "users_own_diet_plan" on public.user_diet_plans for all using (auth.uid() = user_id);
create policy "admin_manage_user_diet_plans" on public.user_diet_plans for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ==========================================
-- SEED EXERCISES
-- ==========================================
insert into public.exercises (name, muscle_group, equipment) values
('Bench Press', 'Chest', 'Barbell'),
('Incline Bench Press', 'Chest', 'Barbell'),
('Dumbbell Bench Press', 'Chest', 'Dumbbell'),
('Cable Fly', 'Chest', 'Cable'),
('Push Up', 'Chest', 'Bodyweight'),
('Pull Up', 'Back', 'Bodyweight'),
('Bent Over Row', 'Back', 'Barbell'),
('Lat Pulldown', 'Back', 'Cable'),
('Seated Cable Row', 'Back', 'Cable'),
('Deadlift', 'Back', 'Barbell'),
('Overhead Press', 'Shoulders', 'Barbell'),
('Lateral Raise', 'Shoulders', 'Dumbbell'),
('Front Raise', 'Shoulders', 'Dumbbell'),
('Face Pull', 'Shoulders', 'Cable'),
('Barbell Curl', 'Biceps', 'Barbell'),
('Dumbbell Curl', 'Biceps', 'Dumbbell'),
('Hammer Curl', 'Biceps', 'Dumbbell'),
('Preacher Curl', 'Biceps', 'Barbell'),
('Triceps Pushdown', 'Triceps', 'Cable'),
('Skull Crusher', 'Triceps', 'Barbell'),
('Close Grip Bench Press', 'Triceps', 'Barbell'),
('Squat', 'Legs', 'Barbell'),
('Leg Press', 'Legs', 'Machine'),
('Romanian Deadlift', 'Legs', 'Barbell'),
('Leg Curl', 'Legs', 'Machine'),
('Leg Extension', 'Legs', 'Machine'),
('Calf Raise', 'Legs', 'Machine'),
('Plank', 'Core', 'Bodyweight'),
('Crunch', 'Core', 'Bodyweight'),
('Cable Crunch', 'Core', 'Cable'),
('Running', 'Cardio', 'Treadmill'),
('Cycling', 'Cardio', 'Bike');

-- ==========================================
-- MAKE A USER ADMIN (run after first signup)
-- Replace with your actual email
-- ==========================================
-- update public.profiles set role = 'admin' where email = 'ram@fitwithram.com';
