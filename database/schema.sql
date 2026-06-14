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
  heavy_stain_level TEXT,
  bins_count INTEGER,
  gate_code_needed BOOLEAN NOT NULL DEFAULT FALSE,
  gate_code TEXT,
  driveway_sqft INTEGER,
  walkway_sqft INTEGER,
  patio_sqft INTEGER,
  house_sqft INTEGER,
  fence_linear_feet INTEGER,
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

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
