-- Run this in your Supabase SQL Editor

-- Add new profile fields for admin-controlled training
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS fitness_level TEXT DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS goal TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS weight NUMERIC,
  ADD COLUMN IF NOT EXISTS height NUMERIC,
  ADD COLUMN IF NOT EXISTS diet_plan JSONB;

-- Allow admin to update any user's profile (RLS policy)
-- Run this only if RLS is enabled on profiles table
CREATE POLICY IF NOT EXISTS "Admin can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admin to read all profiles (may already exist)
CREATE POLICY IF NOT EXISTS "Admin can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admin to read all workouts
CREATE POLICY IF NOT EXISTS "Admin can read all workouts"
  ON workouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admin to delete any workout
CREATE POLICY IF NOT EXISTS "Admin can delete any workout"
  ON workouts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admin to read all meals
CREATE POLICY IF NOT EXISTS "Admin can read all meals"
  ON meals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow admin to delete any meal
CREATE POLICY IF NOT EXISTS "Admin can delete any meal"
  ON meals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
