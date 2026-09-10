create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null default '' check (char_length(excerpt) <= 500),
  content text not null default '',
  cover_image_url text,
  cover_image_alt text check (cover_image_alt is null or char_length(cover_image_alt) <= 180),
  author_name text not null default 'Line & İba',
  category text not null default 'Saç Rehberi' check (char_length(category) <= 80),
  tags text[] not null default '{}',
  language text not null default 'tr' check (language in ('tr', 'en')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_featured boolean not null default false,
  meta_title text check (meta_title is null or char_length(meta_title) <= 70),
  meta_description text check (meta_description is null or char_length(meta_description) <= 170),
  canonical_url text,
  og_image_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index blogs_public_feed_idx
  on public.blogs (language, is_featured desc, published_at desc)
  where status = 'published';

create index blogs_updated_at_idx on public.blogs (updated_at desc);

create or replace function public.set_blog_timestamps()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published' or new.published_at is null) then
    new.published_at := coalesce(new.published_at, now());
  elsif new.status = 'draft' then
    new.published_at := null;
  end if;
  return new;
end;
$$;

create trigger blogs_set_timestamps
before insert or update on public.blogs
for each row execute function public.set_blog_timestamps();

alter table public.blogs enable row level security;

create policy "published blogs are public"
  on public.blogs for select
  to anon, authenticated
  using (
    status = 'published'
    or exists (select 1 from public.admin_profiles p where p.user_id = auth.uid())
  );

create policy "admins can create blogs"
  on public.blogs for insert
  to authenticated
  with check (
    exists (select 1 from public.admin_profiles p where p.user_id = auth.uid())
    and created_by = auth.uid()
  );

create policy "admins can update blogs"
  on public.blogs for update
  to authenticated
  using (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()));

create policy "admins can delete blogs"
  on public.blogs for delete
  to authenticated
  using (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-media',
  'blog-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "blog media is public"
  on storage.objects for select
  to public
  using (bucket_id = 'blog-media');

create policy "admins can upload blog media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'blog-media'
    and exists (select 1 from public.admin_profiles p where p.user_id = auth.uid())
  );

create policy "admins can update blog media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'blog-media'
    and exists (select 1 from public.admin_profiles p where p.user_id = auth.uid())
  );

create policy "admins can delete blog media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'blog-media'
    and exists (select 1 from public.admin_profiles p where p.user_id = auth.uid())
  );

grant select on public.blogs to anon, authenticated;
grant insert, update, delete on public.blogs to authenticated;
