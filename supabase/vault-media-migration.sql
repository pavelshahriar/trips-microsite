-- ─────────────────────────────────────────────────────────────────────────────
-- Trip Vault — media metadata migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add all new columns to vault_photos
ALTER TABLE vault_photos
  ADD COLUMN IF NOT EXISTS media_type        TEXT        NOT NULL DEFAULT 'photo'
    CHECK (media_type IN ('photo', 'video')),
  ADD COLUMN IF NOT EXISTS file_size         BIGINT,
  ADD COLUMN IF NOT EXISTS original_filename TEXT,
  ADD COLUMN IF NOT EXISTS mime_type         TEXT,
  ADD COLUMN IF NOT EXISTS width             INTEGER,
  ADD COLUMN IF NOT EXISTS height            INTEGER,
  ADD COLUMN IF NOT EXISTS duration_secs     FLOAT8,          -- video duration in seconds
  ADD COLUMN IF NOT EXISTS taken_at          TIMESTAMPTZ,     -- EXIF / recording timestamp
  ADD COLUMN IF NOT EXISTS location_lat      FLOAT8,
  ADD COLUMN IF NOT EXISTS location_lng      FLOAT8,
  ADD COLUMN IF NOT EXISTS location_name     TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_path    TEXT;            -- for videos: path to JPEG thumb in vault-photos

-- 2. Index for timeline ordering (COALESCE falls back to created_at when taken_at is null)
CREATE INDEX IF NOT EXISTS vault_photos_timeline_idx
  ON vault_photos (COALESCE(taken_at, created_at) ASC);

-- 3. Verify — run this SELECT to confirm the new columns exist:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'vault_photos'
-- ORDER BY ordinal_position;

-- ─────────────────────────────────────────────────────────────────────────────
-- IMPORTANT: Storage bucket settings to update via Supabase Dashboard
-- ─────────────────────────────────────────────────────────────────────────────
-- After running this SQL, go to:
--   Storage → vault-photos → Edit bucket
--
-- 1. Allowed MIME types — add:
--      video/mp4, video/quicktime, video/x-msvideo, video/webm,
--      video/x-matroska, image/heic, image/heif
--
-- 2. Max upload size — increase to at least 200 MB for videos
--    (free tier default is 50 MB per file)
-- ─────────────────────────────────────────────────────────────────────────────
