-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Auth bootstrap (profiles + roles + RLS)
-- Run ONCE in the Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to commit: contains no secrets, only schema/policy definitions.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre text,
  role text not null default 'viewer' check (role in ('viewer','editor','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper: fetch the caller's own role, bypassing RLS on this one lookup.
-- (Avoids self-referential RLS recursion — policies below call this instead
-- of querying `profiles` directly for the admin check.)
create or replace function public.current_user_role()
returns text
language sql security definer stable set search_path = public
as $$ select role from public.profiles where id = auth.uid(); $$;

drop policy if exists "select_own_profile" on public.profiles;
create policy "select_own_profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "select_all_if_admin" on public.profiles;
create policy "select_all_if_admin" on public.profiles
  for select using (public.current_user_role() = 'admin');

drop policy if exists "update_own_profile" on public.profiles;
create policy "update_own_profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "update_any_if_admin" on public.profiles;
create policy "update_any_if_admin" on public.profiles
  for update using (public.current_user_role() = 'admin');

-- No insert/delete policies: rows are created exclusively by the trigger
-- below (security definer) and never directly by client-side code.

-- Guard: only admins may change the `role` column — even on their own row.
-- Prevents privilege escalation via a crafted client-side update call.
create or replace function public.protect_role_column()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and public.current_user_role() is distinct from 'admin' then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_role_before_update on public.profiles;
create trigger protect_role_before_update
  before update on public.profiles
  for each row execute procedure public.protect_role_column();

-- Auto-provision a profile row whenever someone signs up (email or Google).
-- The project owner's email is bootstrapped as admin so there's always at
-- least one account able to manage roles; everyone else starts as viewer.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nombre, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    case when lower(new.email) = 'arojas@ologistics.com' then 'admin' else 'viewer' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
