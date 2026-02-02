-- Create transactions table to log webhooks
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  perfectpay_code text,
  user_id text references public.profiles(id), -- Changed to text to match profiles.id
  amount decimal(10,2),
  status integer, -- sale_status_enum
  payment_method integer,
  payload jsonb,
  processed_at timestamp with time zone default now()
);

-- Update profiles table with subscription fields
alter table public.profiles
add column if not exists subscription_status text default 'inactive', -- active, canceled, past_due
add column if not exists subscription_plan text, -- e.g. 'premium'
add column if not exists subscription_expires_at timestamp with time zone;

-- Enable RLS
alter table public.transactions enable row level security;

-- Policy: Only service role can full access
create policy "Service role manages transactions"
  on public.transactions
  using ( auth.role() = 'service_role' )
  with check ( auth.role() = 'service_role' );

-- Optional: Allow users to view their own transactions?
-- create policy "Users view own transactions"
--   on public.transactions for select
--   USING ( auth.uid() = user_id );
