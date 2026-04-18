-- Run this in Supabase SQL Editor to link your NEW uniquely downloaded GIFs!

ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS gif_url text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS instructions text;

