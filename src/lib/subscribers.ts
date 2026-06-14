import { sendMarketingWelcomeEmail } from "@/lib/email";
import { getSql } from "@/lib/db";
import {
  getCampaignForMonth,
  getNextMarketingSendAt,
  type MarketingCadence,
} from "@/lib/marketing";

export interface SubscriberRecord {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  first_name: string | null;
  zip: string | null;
  source: string;
  status: string;
  cadence: MarketingCadence;
  email_consent: boolean;
  unsubscribe_token: string;
  unsubscribed_at: string | null;
  last_sent_at: string | null;
  next_send_at: string | null;
  notes: string | null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createOrUpdateSubscriber(input: {
  email: string;
  firstName?: string;
  zip?: string;
  source?: string;
  cadence?: MarketingCadence;
}) {
  const sql = getSql();
  if (!sql) return null;

  const now = new Date();
  const nextSendAt = getNextMarketingSendAt({
    now,
    cadence: input.cadence ?? "balanced",
  });

  const result = await sql`
    INSERT INTO subscribers (
      email, first_name, zip, source, cadence, email_consent, status, unsubscribed_at, next_send_at, updated_at
    ) VALUES (
      ${normalizeEmail(input.email)},
      ${input.firstName?.trim() || null},
      ${input.zip?.trim() || null},
      ${input.source ?? "website"},
      ${input.cadence ?? "balanced"},
      TRUE,
      'subscribed',
      NULL,
      ${nextSendAt.toISOString()},
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      first_name = COALESCE(EXCLUDED.first_name, subscribers.first_name),
      zip = COALESCE(EXCLUDED.zip, subscribers.zip),
      source = EXCLUDED.source,
      cadence = EXCLUDED.cadence,
      email_consent = TRUE,
      status = 'subscribed',
      unsubscribed_at = NULL,
      next_send_at = ${nextSendAt.toISOString()},
      updated_at = NOW()
    RETURNING *
  `;
  return ((result as SubscriberRecord[])[0] ?? null);
}

export async function subscribeAndWelcome(input: {
  email: string;
  firstName?: string;
  zip?: string;
  source?: string;
  cadence?: MarketingCadence;
}) {
  const subscriber = await createOrUpdateSubscriber(input);
  if (!subscriber) return null;

  try {
    await sendMarketingWelcomeEmail(subscriber);
  } catch {}

  return subscriber;
}

export async function unsubscribeSubscriberByToken(token: string) {
  const sql = getSql();
  if (!sql) return null;

  const result = await sql`
    UPDATE subscribers
    SET
      status = 'unsubscribed',
      email_consent = FALSE,
      unsubscribed_at = NOW(),
      next_send_at = NULL,
      updated_at = NOW()
    WHERE unsubscribe_token = ${token}
    RETURNING *
  `;
  return ((result as SubscriberRecord[])[0] ?? null);
}

export async function getAllSubscribers() {
  const sql = getSql();
  if (!sql) return [];

  const result = await sql`
    SELECT * FROM subscribers
    ORDER BY created_at DESC
  `;

  return Array.isArray(result) ? (result as SubscriberRecord[]) : [];
}

export function getSubscriberCampaignSummary(subscriber: SubscriberRecord) {
  const nextDate = subscriber.next_send_at ? new Date(subscriber.next_send_at) : new Date();
  const campaign = getCampaignForMonth(nextDate.getMonth() + 1);
  return {
    subject: campaign.subject,
    headline: campaign.headline,
    nextDate: subscriber.next_send_at,
  };
}
