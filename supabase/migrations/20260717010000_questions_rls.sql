-- Read-only access to the question bank for authenticated test-takers.
-- No insert/update/delete policies exist, so those are denied for everyone
-- via the API. Admin content changes go through the Supabase dashboard
-- directly (postgres role bypasses RLS) until proper admin-role-scoped
-- write policies are added.

alter table public.questions enable row level security;

create policy "Authenticated users can read questions"
  on public.questions
  for select
  to authenticated
  using (true);
