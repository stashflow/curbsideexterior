CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram_handle TEXT,
  primary_service TEXT NOT NULL,
  frequency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lead',
  property_type TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  distance_miles NUMERIC(6,2),
  travel_surcharge INTEGER NOT NULL DEFAULT 0,
  preferred_date DATE NOT NULL,
  preferred_time_window TEXT NOT NULL,
  scheduled_date DATE,
  scheduled_time_window TEXT,
  quote_total INTEGER NOT NULL DEFAULT 0,
  deposit_due INTEGER NOT NULL DEFAULT 0,
  payment_mode TEXT NOT NULL,
  stripe_checkout_session_id TEXT,
  stripe_payment_status TEXT,
  customer_action_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  heavy_stain_level TEXT,
  bins_count INTEGER,
  gate_code_needed BOOLEAN NOT NULL DEFAULT FALSE,
  gate_code TEXT,
  driveway_sqft INTEGER,
  walkway_sqft INTEGER,
  patio_sqft INTEGER,
  house_sqft INTEGER,
  fence_linear_feet INTEGER,
  photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  referral_source TEXT,
  owner_notes TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  sms_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  email_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  quote_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_preferred_slot_idx ON bookings (preferred_date, preferred_time_window, status);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_action_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text;

CREATE INDEX IF NOT EXISTS bookings_customer_action_token_idx ON bookings (customer_action_token);

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  zip TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'subscribed',
  cadence TEXT NOT NULL DEFAULT 'balanced',
  email_consent BOOLEAN NOT NULL DEFAULT TRUE,
  unsubscribe_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  unsubscribed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS subscribers_status_idx ON subscribers (status);
CREATE INDEX IF NOT EXISTS subscribers_next_send_idx ON subscribers (next_send_at);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS testimonials_status_idx ON testimonials (status);
CREATE INDEX IF NOT EXISTS testimonials_created_at_idx ON testimonials (created_at DESC);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_postgames (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL DEFAULT '',
  job_date DATE NOT NULL,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT NOT NULL DEFAULT '',
  original_quote INTEGER NOT NULL DEFAULT 0,
  final_charged INTEGER NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'None',
  discount_amount INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Card',
  payment_status TEXT NOT NULL DEFAULT 'Paid',
  workers JSONB NOT NULL DEFAULT '[]'::jsonb,
  expenses JSONB NOT NULL DEFAULT '[]'::jsonb,
  split JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_postgames_job_date_idx ON admin_postgames (job_date DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  paid_by TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT '',
  reimbursable BOOLEAN NOT NULL DEFAULT FALSE,
  reimbursed BOOLEAN NOT NULL DEFAULT FALSE,
  related_job TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  postgame_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_expenses_date_idx ON admin_expenses (date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_expenses_postgame_id_idx ON admin_expenses (postgame_id);
