-- 001_init.sql
create extension if not exists pgcrypto;

-- MEMES
create table if not exists public.memes (
  id bigserial primary key,
  owner_id uuid not null,
  title text not null,
  image_path text not null,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_memes_status_created on public.memes(status, created_at desc);
create index if not exists idx_memes_owner on public.memes(owner_id);

alter table public.memes enable row level security;

-- ROLES
create table if not exists public.user_roles (
  user_id uuid primary key,
  role text not null check (role in ('admin','user'))
);

alter table public.user_roles enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = uid and ur.role = 'admin'
  );
$$;

-- user_roles policies
drop policy if exists "users can read own role" on public.user_roles;
create policy "users can read own role"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "admins can manage roles" on public.user_roles;
create policy "admins can manage roles"
on public.user_roles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- memes policies (approved OR own OR admin)
drop policy if exists "read approved or own or admin" on public.memes;
create policy "read approved or own or admin"
on public.memes
for select
to anon, authenticated
using (
  status = 'approved'
  OR owner_id = auth.uid()
  OR public.is_admin(auth.uid())
);

drop policy if exists "users can insert own memes" on public.memes;
create policy "users can insert own memes"
on public.memes
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "owner or admin can update memes" on public.memes;
create policy "owner or admin can update memes"
on public.memes
for update
to authenticated
using (owner_id = auth.uid() OR public.is_admin(auth.uid()))
with check (owner_id = auth.uid() OR public.is_admin(auth.uid()));

drop policy if exists "owner or admin can delete memes" on public.memes;
create policy "owner or admin can delete memes"
on public.memes
for delete
to authenticated
using (owner_id = auth.uid() OR public.is_admin(auth.uid()));