# Production Launch Checklist

Use this checklist before promoting a deploy branch to production.

## 1) Branch + CI Gate

- [ ] Changes are on a deploy branch (`main`, `staging`, or `release/*`).
- [ ] GitHub Actions workflow `backend-production-verify` is passing.
- [ ] No unresolved migration or schema tasks remain.

## 2) Required Backend Environment Variables

- [ ] `PORT`
- [ ] `DATABASE_URL`
- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_PASSWORD`
- [ ] `PAYPAL_CLIENT_ID`
- [ ] `PAYPAL_CLIENT_SECRET`
- [ ] `PAYPAL_WEBHOOK_SECRET`

## 3) Recommended Environment Variables

- [ ] `GEMINI_API_KEY` (enables AI mode instead of fallback mode)
- [ ] `STITCH_EXPRESS_CLIENT_ID`
- [ ] `STITCH_EXPRESS_CLIENT_SECRET`
- [ ] `STITCH_EXPRESS_WEBHOOK_SECRET`
- [ ] `STITCH_EXPRESS_REDIRECT_URL`
- [ ] `FRONTEND_URLS` includes every live frontend origin

## 4) Pre-Deploy Validation (Local or CI Runner)

- [ ] Run `pnpm --filter @workspace/api-server run verify:production`.
- [ ] Run `pnpm -w run typecheck`.
- [ ] Confirm backend build succeeds.

## 5) Deploy + Runtime Checks

- [ ] Deploy backend.
- [ ] Confirm `GET /api/healthz` returns `200` and `{ "status": "ok" }`.
- [ ] Confirm `GET /api/readyz` returns `200` with `status: "ready"`.
- [ ] Confirm `readyz.checks.ai` is expected (`configured` or `fallback-mode`).

## 6) Critical Feature Smoke Tests

- [ ] Auth login + protected route access works.
- [ ] `Repair Page` request succeeds end-to-end.
- [ ] `Repair Site` crawl + optimize + download flow works.
- [ ] PayPal create-order + capture flow works in test mode.
- [ ] PayPal webhook endpoint returns success for a signed test event.
- [ ] Stitch checkout/webhook flow works if enabled.

## 7) Security / Reliability Verifications

- [ ] CSRF protection rejects cross-origin state-changing requests.
- [ ] Payment + auth routes enforce rate limits.
- [ ] Error responses are structured JSON (no uncaught stack traces to clients).
- [ ] Logs show no boot-time configuration errors.

## 8) Post-Launch Monitoring (First 60 Minutes)

- [ ] Watch backend logs for 5xx spikes.
- [ ] Watch payment webhook logs for signature errors.
- [ ] Watch readiness endpoint for degradations.
- [ ] Validate user can complete at least one successful end-to-end repair flow.
