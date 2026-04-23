-- ============================================================
-- FitWithRam — Rollback Online/Offline Training Features
-- Run this in Supabase SQL Editor to completely undo the changes
-- ============================================================

-- 1. Drop the inquiries table
DROP TABLE IF EXISTS public.inquiries CASCADE;

-- 2. Remove the new fields from programs table
ALTER TABLE public.programs
  DROP COLUMN IF EXISTS fitness_goal,
  DROP COLUMN IF EXISTS training_type,
  DROP COLUMN IF EXISTS days_per_week;

-- 3. Remove the assigned program field from profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS assigned_program_id;
