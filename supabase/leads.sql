-- Leads captured through the phone-OTP data-capture flow.
-- Run this in the Supabase SQL editor for the project.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  target_country text not null,
  target_course text not null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Authenticated users may insert a row for themselves only.
-- No select/update/delete policies exist, so those actions are denied by default.
create policy "Users can insert their own lead"
  on public.leads
  for insert
  to authenticated
  with check (auth.uid() = user_id);
