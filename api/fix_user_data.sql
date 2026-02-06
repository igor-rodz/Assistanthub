-- 1. Create Trigger Function to sync Auth User to Profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar, plan, credit_balance)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'starter', -- Default plan
    10 -- Default credits
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Fix Current User (Update missing data for existing users)
update public.profiles
set
  email = auth.users.email,
  name = coalesce(public.profiles.name, auth.users.raw_user_meta_data->>'full_name', 'User')
from auth.users
where public.profiles.id = auth.users.id
and (public.profiles.email is null or public.profiles.name is null or public.profiles.name = 'User');

-- 4. Force PRO plan for specific user (Manual Fix)
update public.profiles
set
  plan = 'pro',
  credit_balance = 700
from auth.users
where public.profiles.id = auth.users.id
and auth.users.email = 'igorhrodrick@gmail.com';
