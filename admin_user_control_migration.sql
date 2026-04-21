-- Run this in your Supabase SQL Editor
-- Correct table names: food_logs (not meals), food_logs has no separate "meals" table

-- Step 1: Add new profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fitness_level TEXT DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS weight NUMERIC,
  ADD COLUMN IF NOT EXISTS diet_plan JSONB;

-- (age, height, goal already exist in the schema)

-- Step 2: Drop old admin policies if they exist
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all workouts" ON public.workouts;
DROP POLICY IF EXISTS "Admin can delete any workout" ON public.workouts;
DROP POLICY IF EXISTS "Admin can read all food_logs" ON public.food_logs;
DROP POLICY IF EXISTS "Admin can delete any food_log" ON public.food_logs;

-- Step 3: Create admin policies using the existing is_admin() function

CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can delete any workout"
  ON public.workouts FOR DELETE
  USING (public.is_admin());

CREATE POLICY "Admin can read all food_logs"
  ON public.food_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can delete any food_log"
  ON public.food_logs FOR DELETE
  USING (public.is_admin());
