-- 002_storage.sql
-- Bucket: memes (create in dashboard; this file documents/sets policies)

drop policy if exists "auth users can upload memes" on storage.objects;
create policy "auth users can upload memes"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'memes');

drop policy if exists "public can read meme images" on storage.objects;
create policy "public can read meme images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'memes');