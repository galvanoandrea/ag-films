-- ============================================================
-- AG FILMS — Database Schema
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor
-- Or via: supabase db push (if using Supabase CLI)
-- ============================================================

-- ─── Storage Buckets ─────────────────────────────────────────
-- Public bucket: watermarked previews served directly
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos-watermarked',
  'photos-watermarked',
  true,
  52428800, -- 50 MB
  ARRAY['image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Private bucket: original files (only accessible via signed URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos-original',
  'photos-original',
  false,
  209715200, -- 200 MB
  ARRAY['image/jpeg', 'image/png', 'image/tiff', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ─── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  date        DATE NOT NULL,
  date_label  TEXT NOT NULL,        -- e.g. "12 Mag 2024"
  location    TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('sport', 'street', 'drone')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                      TEXT NOT NULL,
  event_id                   UUID REFERENCES events(id) ON DELETE SET NULL,
  price                      INTEGER NOT NULL CHECK (price > 0), -- euro cents
  storage_path_watermarked   TEXT NOT NULL,
  storage_path_original      TEXT NOT NULL,
  published                  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id                  UUID NOT NULL REFERENCES photos(id),
  stripe_session_id         TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id  TEXT,
  amount                    INTEGER NOT NULL,          -- euro cents
  customer_email            TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'completed', 'failed')),
  download_token            TEXT UNIQUE,
  download_expires_at       TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS photos_event_id_idx     ON photos(event_id);
CREATE INDEX IF NOT EXISTS photos_published_idx    ON photos(published);
CREATE INDEX IF NOT EXISTS photos_created_at_idx   ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_session_id_idx   ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS orders_token_idx        ON orders(download_token);
CREATE INDEX IF NOT EXISTS orders_photo_id_idx     ON orders(photo_id);

-- ─── Row Level Security ───────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Events: anyone can read (used for gallery filters)
CREATE POLICY "events_public_read"
  ON events FOR SELECT
  USING (true);

-- Photos: anyone can read published photos
CREATE POLICY "photos_public_read"
  ON photos FOR SELECT
  USING (published = true);

-- Orders: no public access; all writes done via service role
-- (The service role key bypasses RLS entirely)

-- ─── Storage Policies ────────────────────────────────────────

-- Watermarked bucket: public read
CREATE POLICY "wm_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos-watermarked');

-- Both buckets: only service role can insert/update/delete
-- (handled automatically since service role bypasses RLS)
