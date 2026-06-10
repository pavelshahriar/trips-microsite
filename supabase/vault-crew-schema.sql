-- ── vault_crew table ─────────────────────────────────────────────────────────
-- Stores the authorised crew list for Trip Vault.
-- Writes are done via service role key only (bypasses RLS).
-- Reads are available to any authenticated user (middleware + admin panel).

create table if not exists vault_crew (
  id            uuid        primary key default gen_random_uuid(),
  email         text        unique not null,
  display_name  text        not null,
  -- provider must exactly match Supabase's app_metadata.provider value:
  --   'google'   → signed in with Google OAuth
  --   'facebook' → signed in with Facebook OAuth
  --   'email'    → signed in with magic link
  provider      text        not null check (provider in ('google', 'facebook', 'email')),
  is_admin      boolean     not null default false,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- RLS: enable, but only restrict writes (service role bypasses RLS for writes)
alter table vault_crew enable row level security;

-- All authenticated users can read the crew list (needed by middleware + admin panel)
create policy "authenticated can read vault_crew"
  on vault_crew for select
  to authenticated
  using (true);

-- ── Seed: Shah as the initial admin ──────────────────────────────────────────
-- Update provider here if you change your preferred sign-in method.
insert into vault_crew (email, display_name, provider, is_admin, is_active)
values ('shahriar.tanvir@gmail.com', 'Shah', 'google', true, true)
on conflict (email) do update set
  provider  = excluded.provider,
  is_admin  = excluded.is_admin,
  is_active = true;
