-- Create premium_scripts table
create table if not exists public.premium_scripts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text default 'Geral',
  script_content text not null,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.premium_scripts enable row level security;

-- Create policies

-- Allow Read for everyone (authenticated users)
create policy "Allow read for authenticated users" 
  on public.premium_scripts for select 
  to authenticated 
  using (true);

-- Allow All for Service Role (Admin API uses this implicitly, but explicit policy is good practice if using user impersonation, 
-- usually service_role bypasses RLS, so this is just for safety/completeness if we use admin user later)
-- Note: Service Role KEY bypasses RLS by default. Admin operations using getSupabase(true) will work.

-- If you want to restrict write to specific user emails (optional, but good for security if service role leaks):
-- create policy "Allow write for admins only"
--   on public.premium_scripts for all
--   to authenticated
--   using (auth.email() in ('admin@example.com'));
