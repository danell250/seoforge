# Production Runbook

This runbook is for launch verification and incident response for SEOaxe backend.

## Quick Commands

- Backend preflight + compile validation:
  - `pnpm --filter @workspace/api-server run verify:production`
- Full workspace typecheck:
  - `pnpm -w run typecheck`

## Readiness Signals

- `GET /api/healthz`
  - Liveness probe. Expected: `200` + `{ "status": "ok" }`.
- `GET /api/readyz`
  - Readiness probe. Expected: `200` + `{ "status": "ready", ... }`.
  - `503` indicates degraded state. Inspect:
    - `checks.database`
    - `checks.env`
    - `checks.ai`
    - `missingEnv`

## Incident: Backend fails to boot

### Symptoms

- Service exits on startup.
- Logs include missing env errors (`DATABASE_URL`, auth/payments vars, etc).

### Actions

1. Run preflight locally:
   - `pnpm --filter @workspace/api-server run preflight`
2. Add/fix missing env vars in deployment platform.
3. Redeploy and verify:
   - `GET /api/healthz`
   - `GET /api/readyz`

## Incident: Page Repair / Site Repair failing

### Symptoms

- `/api/optimize` requests fail or degrade.
- Site crawler completes discovery but optimize step fails pages.

### Actions

1. Check readiness:
   - `checks.ai === "fallback-mode"` means Gemini is missing/unavailable, but fallback should still respond.
2. Verify backend logs for route errors in `/api/optimize`.
3. If fallback responses are acceptable temporarily, keep service live.
4. Restore `GEMINI_API_KEY` to return to full AI optimization mode.

## Incident: Payment flow failing

### Symptoms

- Create order/capture fails.
- Webhooks rejected due to signature issues.

### Actions

1. Confirm env vars:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_WEBHOOK_SECRET`
2. Check webhook endpoint logs:
   - `/api/payments/paypal/webhook`
   - `/api/payments/stitch/webhook`
3. Verify provider sends required signature headers.
4. Replay provider test webhook and confirm `processed: true` for valid events.

## Incident: Auth/session failures

### Symptoms

- Users cannot log in.
- Protected routes return 401 after login.

### Actions

1. Confirm cookie-domain/origin setup:
   - `FRONTEND_URLS` includes exact frontend origins.
2. Verify CSRF behavior:
   - State-changing requests with session cookies require valid `Origin`/`Referer`.
3. Confirm admin bootstrap vars:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `AUTH_BOOTSTRAP_ADMIN` (bootstrap only when needed)

## Incident: Rate limiting not working

### Symptoms

- Unexpected unlimited auth/payment attempts.

### Actions

1. Check logs for missing `rate_limit_buckets` table warnings.
2. Ensure DB schema is current.
3. Sensitive routes use strict fallback limiter (`failOpen: false`) and should still throttle in-memory.

## Escalation / Rollback

1. If critical paths are down, rollback to last known good deploy.
2. Keep fallback mode active where possible to preserve user functionality.
3. After rollback, run `verify:production` on the candidate fix before re-deploying.
