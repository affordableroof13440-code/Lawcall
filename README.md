# Lawcall

Lawcall is a development starter for an AI-assisted legal intake platform for personal-injury and workplace-harassment inquiries.

> Lawcall is not a law firm and must not provide legal advice, promise representation, or decide whether a claim is legally valid.

## Current repository

- `apps/web` — responsive dashboard preview
- `apps/api` — minimal Node.js health-check API
- `database/schema.sql` — initial PostgreSQL schema (not yet tenant-hardened)
- `workers/cloudflare` — Cloudflare implementation checklist
- `scripts` — local development and web build helpers

## Run locally

Requires Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the dashboard at http://localhost:3000. The API health endpoint is http://localhost:8787/api/health.

Build the web preview:

```bash
npm run build
```

## Integration direction

The planned voice stack is xAI Grok Voice with SIP/VoIP and Cloudflare infrastructure. A SIP provider has not yet been selected. Do not configure production calling until the provider, xAI webhook verification, consent flow, and tenant authentication are implemented.

## Important limitations

This is a scaffold, not a production MVP. The dashboard uses placeholder metrics. The API does not save intake data. Authentication, multi-tenant authorization, xAI voice/SIP, Cloudflare D1/Workers/Durable Objects/R2, recording controls, email/CRM delivery, and automated tests remain to be implemented.

**Do not enter real client, medical, employment, or other sensitive information.** Before handling real callers, implement tenant isolation, role-based access, verified webhooks, encryption, retention/deletion controls, audit logging, recording consent, and a legal/privacy/security review.
