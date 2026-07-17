-- Question bank for the diagnostic tests, tiered by exam/section/difficulty.
-- Not yet applied — review before running.

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_type text not null check (exam_type in ('GMAT', 'GRE', 'SAT')),
  section text not null,
  subtype text,
  difficulty int not null check (difficulty between 1 and 10),
  tier text not null check (tier in ('snapshot', 'split', 'full_replica', 'all')),
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text,
  option_d text,
  option_e text,
  correct_answer text not null check (correct_answer in ('a', 'b', 'c', 'd', 'e')),
  explanation text,
  created_at timestamptz not null default now()
);
