-- ClinicPlus Supabase Schema
-- Run this in your Supabase project SQL Editor (https://supabase.com/dashboard)

CREATE TABLE IF NOT EXISTS wait_reports (
  id SERIAL PRIMARY KEY,
  facility_id TEXT NOT NULL,
  service TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  time_of_day TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  facility TEXT NOT NULL,
  service TEXT NOT NULL,
  doctor TEXT DEFAULT '',
  diagnosis TEXT DEFAULT '',
  prescriptions TEXT DEFAULT '',
  next_date TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS translation_cache (
  id SERIAL PRIMARY KEY,
  source_lang TEXT NOT NULL DEFAULT 'en',
  target_lang TEXT NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_lang, target_lang, source_text)
);
