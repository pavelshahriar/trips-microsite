-- ─────────────────────────────────────────────────────────────────────────────
-- Trip Vault — Supabase schema migration
-- Run this in the Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Vault profiles (onboarding state per user) ─────────────────────────────
CREATE TABLE IF NOT EXISTS vault_profiles (
  id                UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email             TEXT NOT NULL,
  onboarding_done   BOOLEAN DEFAULT FALSE,
  gift_confirmed    BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vault_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON vault_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON vault_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON vault_profiles FOR UPDATE
  USING (id = auth.uid());


-- ── 2. Vault photos ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_photos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  uploaded_by     TEXT NOT NULL,   -- email, denormalized for display
  storage_path    TEXT NOT NULL,   -- path in the vault-photos bucket
  caption         TEXT,
  is_public       BOOLEAN DEFAULT FALSE,  -- TRUE = visible in crew album
  is_gift_selfie  BOOLEAN DEFAULT FALSE,  -- TRUE = taken during onboarding
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vault_photos ENABLE ROW LEVEL SECURITY;

-- Users can see their own photos AND public photos from anyone
CREATE POLICY "Users can view own and public photos"
  ON vault_photos FOR SELECT
  USING (user_id = auth.uid() OR is_public = TRUE);

CREATE POLICY "Users can insert their own photos"
  ON vault_photos FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own photos"
  ON vault_photos FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own photos"
  ON vault_photos FOR DELETE
  USING (user_id = auth.uid());


-- ── 3. Vault docs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_docs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  uploaded_by  TEXT NOT NULL,   -- email, denormalized for display
  storage_path TEXT NOT NULL,   -- path in the vault-docs bucket
  filename     TEXT NOT NULL,
  doc_type     TEXT DEFAULT 'other',  -- 'hotel' | 'flight' | 'ticket' | 'itinerary' | 'other'
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vault_docs ENABLE ROW LEVEL SECURITY;

-- All authenticated crew can see all docs (they're already allowlisted by middleware)
CREATE POLICY "Authenticated users can view all docs"
  ON vault_docs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own docs"
  ON vault_docs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own docs"
  ON vault_docs FOR DELETE
  USING (user_id = auth.uid());


-- ── 4. Storage buckets ────────────────────────────────────────────────────────
-- Run these too. If buckets already exist, the INSERT will be a no-op.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault-photos',
  'vault-photos',
  TRUE,  -- public bucket: images served directly via URL (no signed URLs needed)
  10485760,  -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'vault-docs',
  'vault-docs',
  FALSE,  -- private bucket: docs served via signed URLs
  20971520  -- 20 MB per file
)
ON CONFLICT (id) DO NOTHING;


-- ── 5. Storage RLS policies ───────────────────────────────────────────────────

-- Photos bucket — authenticated users can upload and view
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'vault-photos');

CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vault-photos');

CREATE POLICY "Users can delete their own photo objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'vault-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Docs bucket — authenticated users only
CREATE POLICY "Authenticated users can upload docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'vault-docs');

CREATE POLICY "Authenticated users can view docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'vault-docs');

CREATE POLICY "Users can delete their own doc objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'vault-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
