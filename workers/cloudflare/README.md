# Cloudflare deployment (next integration step)

The repository is being prepared for Cloudflare Workers. Before deploying a public intake endpoint, implement:
- verified xAI webhook signatures and replay protection;
- tenant-scoped authentication and authorization;
- D1 schema/migrations with tenant_id on every tenant-owned record;
- Durable Object call-session coordination;
- R2 recording storage with consent, retention, and access controls;
- secrets via Wrangler secrets (never commit credentials).

The current Node API is development-only and deliberately does not persist intake submissions.
