-- ============================================================
-- FitWithRam v2 — Training Features Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Update programs table with new fields
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS fitness_goal   TEXT,
  ADD COLUMN IF NOT EXISTS training_type  TEXT DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS days_per_week  INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS ram_notes      TEXT,
  ADD COLUMN IF NOT EXISTS is_active      BOOLEAN DEFAULT true;

-- 2. Update profiles with assigned program
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS assigned_program_id UUID REFERENCES public.programs(id);

-- 3. Create inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name            TEXT NOT NULL,
  phone                TEXT,
  email                TEXT,
  fitness_goal         TEXT NOT NULL,
  training_type        TEXT NOT NULL DEFAULT 'offline',
  preferred_time       TEXT,
  location             TEXT,
  message              TEXT,
  status               TEXT NOT NULL DEFAULT 'pending',
  assigned_program_id  UUID REFERENCES public.programs(id),
  assigned_diet_id     UUID REFERENCES public.diet_plans(id),
  ram_notes            TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 5. Members can view/insert their own inquiries
DROP POLICY IF EXISTS "Members can view own inquiries" ON public.inquiries;
CREATE POLICY "Members can view own inquiries"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can insert own inquiries" ON public.inquiries;
CREATE POLICY "Members can insert own inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Admin full access to inquiries
DROP POLICY IF EXISTS "Admin full access to inquiries" ON public.inquiries;
CREATE POLICY "Admin full access to inquiries"
  ON public.inquiries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. Admin can update profiles (to assign programs)
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
