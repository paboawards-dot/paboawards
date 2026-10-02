-- =====================================================================
--  PABO AWARDS — SCHÉMA COMPLET (tables, sécurité, fonctions, stockage)
--  Supabase > SQL Editor > New query > coller > Run
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- Paramètres généraux (une seule ligne) ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  votes_enabled boolean not null default true,        -- interrupteur général (ouvrir/fermer les votes)
  selections_at timestamptz,
  votes_open_at timestamptz,
  votes_close_at timestamptz,
  ceremony_at timestamptz,
  vote_unit_price int not null default 100 check (vote_unit_price >= 100),
  max_votes_per_payment int check (max_votes_per_payment is null or max_votes_per_payment >= 1),
  contact_phone text, contact_whatsapp text, contact_email text,
  facebook_url text, instagram_url text, tiktok_url text,
  updated_at timestamptz not null default now()
);

-- ---------- Univers & catégories ----------
create table if not exists public.universes (
  id serial primary key,
  slug text unique not null,
  name text not null,
  tagline text,
  color text not null default '#8b5cf6',
  sort int not null default 0
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  universe_id int not null references public.universes(id),
  color text not null default '#8b5cf6',
  emoji text not null default '🏆',
  image_url text,
  status text not null default 'open' check (status in ('open','closed')),
  extended_until timestamptz,                         -- prolongation exceptionnelle
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Candidats ----------
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  photo_url text,
  gallery text[] not null default '{}',
  bio text,
  info text,
  status text not null default 'active' check (status in ('active','hidden')),
  votes_count int not null default 0 check (votes_count >= 0),
  created_at timestamptz not null default now()
);
create index if not exists candidates_category_idx on public.candidates(category_id);

-- ---------- Actualités & partenaires ----------
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  images text[] not null default '{}',
  published boolean not null default true,
  published_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  description text,
  logo_url text,
  images text[] not null default '{}',
  visible boolean not null default true,
  sort int not null default 0
);

-- ---------- Transactions (traçabilité complète) ----------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,                           -- identifiant envoyé à CinetPay = n° de transaction
  candidate_id uuid not null references public.candidates(id) on delete restrict,
  votes int not null check (votes > 0),
  amount int not null check (amount > 0),
  currency text not null default 'XOF',
  method text not null check (method in ('orange','mtn','moov','wave')),
  country text not null default 'CI',
  phone text not null,
  phone_hash text not null,
  ip_hash text,
  status text not null default 'pending'
    check (status in ('pending','confirmed','failed','expired','flagged')),
  provider_ref text,
  provider_payload jsonb,
  payment_url text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  last_check_at timestamptz
);
create index if not exists tx_status_idx on public.transactions(status);
create index if not exists tx_candidate_idx on public.transactions(candidate_id);
create index if not exists tx_ip_idx on public.transactions(ip_hash, created_at);
create index if not exists tx_phone_idx on public.transactions(phone_hash, created_at);

-- ---------- Journal d'activité & admin ----------
create table if not exists public.audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  actor text,
  action text not null,
  entity text,
  entity_id text,
  details jsonb
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- =====================================================================
--  SÉCURITÉ (RLS) : le public LIT seulement. Toute écriture passe par le
--  serveur (clé service_role), jamais par le navigateur.
-- =====================================================================
alter table public.settings     enable row level security;
alter table public.universes    enable row level security;
alter table public.categories   enable row level security;
alter table public.candidates   enable row level security;
alter table public.news         enable row level security;
alter table public.partners     enable row level security;
alter table public.transactions enable row level security;
alter table public.audit_log    enable row level security;
alter table public.admin_users  enable row level security;

drop policy if exists "read settings"   on public.settings;
drop policy if exists "read universes"  on public.universes;
drop policy if exists "read categories" on public.categories;
drop policy if exists "read candidates" on public.candidates;
drop policy if exists "read news"       on public.news;
drop policy if exists "read partners"   on public.partners;
create policy "read settings"   on public.settings   for select using (true);
create policy "read universes"  on public.universes  for select using (true);
create policy "read categories" on public.categories for select using (true);
create policy "read candidates" on public.candidates for select using (status = 'active');
create policy "read news"       on public.news       for select using (published);
create policy "read partners"   on public.partners   for select using (visible);

revoke all on all tables in schema public from anon, authenticated;
grant select on public.settings, public.universes, public.categories,
               public.candidates, public.news, public.partners to anon, authenticated;

-- ---------- Garde-fou : les votes ne se modifient pas "à la main" ----------
create or replace function public.guard_votes_count() returns trigger
language plpgsql as $$
begin
  if new.votes_count is distinct from old.votes_count
     and coalesce(current_setting('pabo.allow_votes', true), '') <> '1' then
    raise exception 'votes_count ne peut être modifié que par une transaction confirmée';
  end if;
  return new;
end $$;
drop trigger if exists candidates_guard on public.candidates;
create trigger candidates_guard before update on public.candidates
  for each row execute function public.guard_votes_count();

-- ---------- Confirmation d'un paiement : atomique et idempotente ----------
create or replace function public.confirm_transaction(p_ref text, p_amount int, p_payload jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare t public.transactions%rowtype;
begin
  select * into t from public.transactions where ref = p_ref for update;
  if not found then return 'not_found'; end if;
  if t.status = 'confirmed' then return 'already'; end if;
  if t.amount <> p_amount then
    update public.transactions set status = 'flagged', provider_payload = p_payload where id = t.id;
    return 'amount_mismatch';
  end if;
  perform set_config('pabo.allow_votes', '1', true);
  update public.transactions
     set status = 'confirmed', confirmed_at = now(), provider_payload = p_payload
   where id = t.id;
  update public.candidates set votes_count = votes_count + t.votes where id = t.candidate_id;
  perform set_config('pabo.allow_votes', '', true);
  return 'confirmed';
end $$;

create or replace function public.fail_transaction(p_ref text, p_payload jsonb)
returns void language sql security definer set search_path = public as $$
  update public.transactions set status = 'failed', provider_payload = p_payload
   where ref = p_ref and status = 'pending';
$$;

create or replace function public.expire_pending() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update public.transactions set status = 'expired'
   where status = 'pending' and created_at < now() - interval '30 minutes';
  get diagnostics n = row_count;
  return n;
end $$;

revoke execute on function public.confirm_transaction(text, int, jsonb) from public, anon, authenticated;
revoke execute on function public.fail_transaction(text, jsonb)         from public, anon, authenticated;
revoke execute on function public.expire_pending()                      from public, anon, authenticated;
grant  execute on function public.confirm_transaction(text, int, jsonb) to service_role;
grant  execute on function public.fail_transaction(text, jsonb)         to service_role;
grant  execute on function public.expire_pending()                      to service_role;

-- ---------- Statistiques publiques (jamais de montants) ----------
create or replace function public.public_stats() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'votes',      coalesce((select sum(votes) from transactions where status = 'confirmed'), 0),
    'voters',     (select count(distinct phone_hash) from transactions where status = 'confirmed'),
    'artists',    (select count(*) from candidates where status = 'active'),
    'categories', (select count(*) from categories)
  );
$$;
grant execute on function public.public_stats() to anon, authenticated;

-- =====================================================================
--  STOCKAGE DES IMAGES (bucket public "media" — images uniquement)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects for select using (bucket_id = 'media');
-- (aucune règle d'écriture : seuls les envois faits par le serveur de l'admin sont possibles)

-- =====================================================================
--  STATISTIQUES ADMIN (réservées au serveur : jamais accessibles au public)
-- =====================================================================
create or replace function public.admin_stats() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'votes',     coalesce((select sum(votes)  from transactions where status = 'confirmed'), 0),
    'revenue',   coalesce((select sum(amount) from transactions where status = 'confirmed'), 0),
    'confirmed', (select count(*) from transactions where status = 'confirmed'),
    'pending',   (select count(*) from transactions where status = 'pending'),
    'failed',    (select count(*) from transactions where status in ('failed','expired')),
    'flagged',   (select count(*) from transactions where status = 'flagged'),
    'voters',    (select count(distinct phone_hash) from transactions where status = 'confirmed'),
    'per_category', coalesce((
      select json_agg(x) from (
        select c.category_id, sum(t.votes) as votes, sum(t.amount) as revenue
        from transactions t join candidates c on c.id = t.candidate_id
        where t.status = 'confirmed' group by c.category_id) x), '[]'::json),
    'daily', coalesce((
      select json_agg(d order by d.day) from (
        select to_char(date_trunc('day', confirmed_at), 'YYYY-MM-DD') as day, sum(amount) as revenue, sum(votes) as votes
        from transactions where status = 'confirmed' and confirmed_at > now() - interval '14 days'
        group by 1) d), '[]'::json)
  );
$$;
revoke execute on function public.admin_stats() from public, anon, authenticated;
grant  execute on function public.admin_stats() to service_role;
