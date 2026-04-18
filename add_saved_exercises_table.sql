create table if not exists public.saved_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, exercise_id)
);

alter table public.saved_exercises enable row level security;

drop policy if exists "users_own_saved_exercises" on public.saved_exercises;
create policy "users_own_saved_exercises" on public.saved_exercises
  for all using (auth.uid() = user_id);
