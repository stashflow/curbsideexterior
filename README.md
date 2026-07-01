# CURBSIDE EXTERIOR CO.

Premium exterior cleaning website and booking app built with Next.js, Stripe, Neon, and ZeptoMail-ready transactional email hooks.

## What This Includes

- Premium marketing homepage
- Online booking and quote flow
- Pressure washing pricing engine
- Trash can cleaning one-time and monthly request flow
- ZIP and distance-based service area logic from `30067`
- Stripe checkout integration for deposits and one-time payments
- Admin portal for leads, upcoming work, and past jobs
- Terms and privacy pages
- Add-to-home-screen prompt and PWA manifest

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Required Environment Variables

Copy `.env.example` to `.env.local` for local development.

```env
DATABASE_URL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

ADMIN_USERNAME=ere
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

ZEPTOMAIL_API_URL=
ZEPTOMAIL_API_TOKEN=
ZEPTOMAIL_FROM_EMAIL=

AI_CALLER_WEBHOOK_SECRET=
BLOB_READ_WRITE_TOKEN=

OPENAI_API_KEY=
OPENAI_ESTIMATOR_MODEL=
```

## Neon Setup

1. Create a Neon database.
2. Run the SQL in [database/schema.sql](./database/schema.sql).
3. Copy the connection string into `DATABASE_URL`.

## Stripe Setup

1. Add your secret key to `STRIPE_SECRET_KEY`.
2. Create a webhook endpoint:
   - `https://your-domain.com/api/stripe/webhook`
3. Subscribe to:
   - `checkout.session.completed`
4. Copy the webhook secret into `STRIPE_WEBHOOK_SECRET`.

## ZeptoMail Setup

Use Zoho Mail for normal inboxes and ZeptoMail for automated confirmation emails.

Set:
- `ZEPTOMAIL_API_URL`
- `ZEPTOMAIL_API_TOKEN`
- `ZEPTOMAIL_FROM_EMAIL`

## Uploads, AI Caller, and AI Estimator

Set `BLOB_READ_WRITE_TOKEN` to enable customer photo uploads through Vercel Blob.

Set `AI_CALLER_WEBHOOK_SECRET` if the AI caller lead endpoint is enabled.

Set `OPENAI_API_KEY` to enable AI-assisted admin estimates. `OPENAI_ESTIMATOR_MODEL` is optional and defaults to the app's configured model.

## Admin Login

The owner admin portal lives at:

- `/admin/login`

Username defaults to:

- `ere`

Password comes from:

- `ADMIN_PASSWORD`

## Important Notes

- Without `DATABASE_URL`, booking submissions still calculate quotes, but they will not save.
- Without Stripe env vars, bookings will not create live checkout sessions.
- Without ZeptoMail env vars, confirmation emails are skipped.
- In production, `ADMIN_SESSION_SECRET` must be set or admin session signing will fail closed.
- Run [database/schema.sql](./database/schema.sql) before production traffic so booking, subscriber, testimonial, Stripe webhook, and admin money tables exist.

## Commands

```bash
npm run dev
npm run lint
npm run build
```
