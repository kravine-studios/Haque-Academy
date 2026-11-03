-- ============================================================
-- Haque Academy — Supabase setup
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- ---------- Gallery ----------
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  title text not null,
  category text not null,
  created_at timestamptz not null default now()
);

alter table gallery_items enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public can read gallery" on gallery_items;
drop policy if exists "Admins can insert gallery" on gallery_items;
drop policy if exists "Admins can update gallery" on gallery_items;
drop policy if exists "Admins can delete gallery" on gallery_items;
drop policy if exists "Public can insert gallery" on gallery_items;
drop policy if exists "Public can update gallery" on gallery_items;
drop policy if exists "Public can delete gallery" on gallery_items;

create policy "Public can read gallery"
  on gallery_items for select
  using (true);

create policy "Public can insert gallery"
  on gallery_items for insert
  with check (true);

create policy "Public can update gallery"
  on gallery_items for update
  using (true);

create policy "Public can delete gallery"
  on gallery_items for delete
  using (true);

-- ---------- Notices ----------
create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  heading text not null,
  date date not null,
  description text not null default '',
  file_url text,
  file_name text,
  created_at timestamptz not null default now()
);

alter table notices enable row level security;

drop policy if exists "Public can read notices" on notices;
drop policy if exists "Admins can insert notices" on notices;
drop policy if exists "Admins can update notices" on notices;
drop policy if exists "Admins can delete notices" on notices;
drop policy if exists "Public can insert notices" on notices;
drop policy if exists "Public can update notices" on notices;
drop policy if exists "Public can delete notices" on notices;

create policy "Public can read notices"
  on notices for select
  using (true);

create policy "Public can insert notices"
  on notices for insert
  with check (true);

create policy "Public can update notices"
  on notices for update
  using (true);

create policy "Public can delete notices"
  on notices for delete
  using (true);

-- ============================================================
-- Storage buckets (creates public buckets)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('notices', 'notices', true)
on conflict (id) do nothing;

-- Drop existing storage policies if re-running
drop policy if exists "Public read gallery files" on storage.objects;
drop policy if exists "Public read notice files" on storage.objects;
drop policy if exists "Admins upload gallery files" on storage.objects;
drop policy if exists "Admins delete gallery files" on storage.objects;
drop policy if exists "Admins upload notice files" on storage.objects;
drop policy if exists "Admins delete notice files" on storage.objects;
drop policy if exists "Public upload gallery files" on storage.objects;
drop policy if exists "Public delete gallery files" on storage.objects;
drop policy if exists "Public upload notice files" on storage.objects;
drop policy if exists "Public delete notice files" on storage.objects;

-- Allow public read of files in both buckets
create policy "Public read gallery files"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Public read notice files"
  on storage.objects for select
  using (bucket_id = 'notices');

-- Allow uploading and deleting files
create policy "Public upload gallery files"
  on storage.objects for insert
  with check (bucket_id = 'gallery');

create policy "Public delete gallery files"
  on storage.objects for delete
  using (bucket_id = 'gallery');

create policy "Public upload notice files"
  on storage.objects for insert
  with check (bucket_id = 'notices');

create policy "Public delete notice files"
  on storage.objects for delete
  using (bucket_id = 'notices');

-- ============================================================
-- Seed the gallery
-- ============================================================
insert into gallery_items (src, title, category) values
  ('https://images.pexels.com/photos/37169819/pexels-photo-37169819.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', 'Inter-School Cricket Victory', 'Sports'),
  ('https://images.pexels.com/photos/3231358/pexels-photo-3231358.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', 'Classroom Learning', 'Education'),
  ('https://images.pexels.com/photos/8926832/pexels-photo-8926832.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', 'Science Exhibition', 'Events'),
  ('https://images.pexels.com/photos/37107330/pexels-photo-37107330.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', 'Patna Zoo Visit', 'Trips'),
  ('https://images.pexels.com/photos/16118310/pexels-photo-16118310.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', 'Independence Day Celebration', 'Events'),
  ('https://images.pexels.com/photos/9714143/pexels-photo-9714143.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200', 'Multi Sports Program', 'Sports')
on conflict do nothing;

-- ---------- Annual Events ----------
create table if not exists annual_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_name text not null, -- E.g. image URL or icon key like 'FlaskConical'
  color text not null, -- E.g. 'bg-blue-50 text-blue-600'
  created_at timestamptz not null default now()
);

alter table annual_events enable row level security;

drop policy if exists "Public can read annual_events" on annual_events;
drop policy if exists "Admins can insert annual_events" on annual_events;
drop policy if exists "Admins can update annual_events" on annual_events;
drop policy if exists "Admins can delete annual_events" on annual_events;
drop policy if exists "Public can insert annual_events" on annual_events;
drop policy if exists "Public can update annual_events" on annual_events;
drop policy if exists "Public can delete annual_events" on annual_events;

create policy "Public can read annual_events"
  on annual_events for select
  using (true);

create policy "Public can insert annual_events"
  on annual_events for insert
  with check (true);

create policy "Public can update annual_events"
  on annual_events for update
  using (true);

create policy "Public can delete annual_events"
  on annual_events for delete
  using (true);

-- Intentionally keep annual_events empty on setup.
-- Legitimate events are created and managed through the admin dashboard only.
-- Any sample or demo entries must not be re-seeded during project setup or redeploys.
