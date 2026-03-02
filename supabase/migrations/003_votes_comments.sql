-- 003_votes_comments.sql

-- VOTES
create table if not exists public.votes (
  id bigserial primary key,
  meme_id bigint not null references public.memes(id) on delete cascade,
  user_id uuid not null,
  value int not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (meme_id, user_id)
);

create index if not exists idx_votes_meme on public.votes(meme_id);

alter table public.votes enable row level security;

drop policy if exists "votes_select" on public.votes;
create policy "votes_select"
on public.votes
for select
to anon, authenticated
using (
  exists (select 1 from public.memes m where m.id = meme_id and m.status = 'approved')
  OR user_id = auth.uid()
  OR public.is_admin(auth.uid())
);

drop policy if exists "votes_insert_own" on public.votes;
create policy "votes_insert_own"
on public.votes
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "votes_update_own" on public.votes;
create policy "votes_update_own"
on public.votes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "votes_delete_own" on public.votes;
create policy "votes_delete_own"
on public.votes
for delete
to authenticated
using (user_id = auth.uid());

-- COMMENTS
create table if not exists public.comments (
  id bigserial primary key,
  meme_id bigint not null references public.memes(id) on delete cascade,
  user_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_meme on public.comments(meme_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "comments_select" on public.comments;
create policy "comments_select"
on public.comments
for select
to anon, authenticated
using (
  exists (select 1 from public.memes m where m.id = meme_id and m.status = 'approved')
  OR user_id = auth.uid()
  OR public.is_admin(auth.uid())
);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
on public.comments
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "comments_delete_own_or_admin" on public.comments;
create policy "comments_delete_own_or_admin"
on public.comments
for delete
to authenticated
using (user_id = auth.uid() OR public.is_admin(auth.uid()));