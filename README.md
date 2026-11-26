# Lawcall

Lawcall is an inbound legal-intake and call-management platform for personal-injury and workplace-harassment inquiries.

> Legal intake is not legal advice. The AI must collect facts, not promise representation or evaluate legal validity.

## Applications

- `apps/web` — call dashboard
- `apps/api` — REST API and integration endpoints

## Services

- `services/voice` — LiveKit voice-room and VoIP integration contracts
- `services/ai` — Groq-powered summarization and 0–100 lead scoring
- `services/scheduling` — consultation scheduling
- `services/notifications` — SMS and email notifications

## Infrastructure

- `database/schema.sql` — PostgreSQL schema
- `workers/cloudflare` — Cloudflare API/ingress Worker
- `shared/types` — shared TypeScript types

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

Deploy the API behind a Cloudflare Worker or Tunnel. Configure LiveKit for the telephony connection and Groq for AI processing. Store recordings in an encrypted object-storage/R2 bucket.
