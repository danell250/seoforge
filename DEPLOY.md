# SEOaxe Deployment Guide

## Vercel + Render Setup

### 1. Backend (Render)

1. Create new **Web Service** on Render
2. Connect your GitHub repo
3. Configure:
   - **Runtime:** Node
   - **Build Command:** `corepack enable && corepack prepare pnpm@10.33.0 --activate && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build:prod`
   - **Start Command:** `cd backend/api-server && node --enable-source-maps ./dist/index.mjs`
   - **Plan:** Standard ($7/month minimum for always-on)

4. **Environment Variables:**
   | Variable | Value | Description |
   |----------|-------|-------------|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render default port |
   | `AUTH_BOOTSTRAP_ADMIN` | `true` | **Required** to create admin user on first boot |
   | `DATABASE_URL` | (your postgres) | Postgres connection string |
   | `GEMINI_API_KEY` | (your key) | Google Gemini API |
   | `BREVO_API_KEY` | (your key) | Email service (brevo.com) |
   | `STITCH_EXPRESS_CLIENT_ID` | (your Stitch client ID) | Server-side Stitch Express API client ID |
   | `STITCH_EXPRESS_CLIENT_SECRET` | (your Stitch client secret) | Server-side Stitch Express API secret |
   | `STITCH_EXPRESS_WEBHOOK_SECRET` | (your webhook signing secret) | Svix signing secret returned when registering the webhook |
   | `STITCH_EXPRESS_REDIRECT_URL` | `https://www.seoaxe.site/checkout?payment=return` | Registered Stitch redirect URL after checkout |
   | `PAYPAL_CLIENT_ID` | (your key) | PayPal API client ID |
   | `PAYPAL_CLIENT_SECRET` | (your key) | PayPal API client secret |
   | `PAYPAL_WEBHOOK_SECRET` | (your key) | PayPal webhook HMAC secret |
   | `ADMIN_EMAIL` | `you@example.com` | **Your admin login email** |
   | `ADMIN_PASSWORD` | (your password) | **Your admin login password** |
   | `FRONTEND_URLS` | `https://www.seoaxe.site,https://seoaxe.site` | Allowed frontend origins |

   ⚠️ **Important:** Set `ADMIN_EMAIL` to your actual email and `ADMIN_PASSWORD` to a strong password (min 8 chars). These are your login credentials.

5. **Database:**
   - Create Postgres instance on Render (or Neon/Supabase)
   - Run migrations (manual for now):
     ```bash
     cd lib/db && npx drizzle-kit migrate
     ```
   - Run backend production preflight locally before deploy:
     ```bash
     pnpm --filter @workspace/api-server run verify:production
     ```

### 2. Frontend (Vercel)

1. Create new project on Vercel
2. Connect same GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend/seoforge`
   - **Build Command:** (Vercel auto-detects)
   - **Output Directory:** `dist`

4. **Environment Variables:**
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://your-render-service.onrender.com/api` |

### 3. Domain Setup (Optional)

- Add `www.seoaxe.site` as the custom domain on Vercel
- Update `FRONTEND_URLS` on Render to match your frontend domains
- Update `REPLIT_DEV_DOMAIN` references in email templates

### 4. Post-Deploy Checklist

- [ ] Admin user created (auto on first boot)
- [ ] Test login flow
- [ ] Test Stitch checkout from `/checkout?plan=starter`
- [ ] Register Stitch webhook URL: `https://your-render-service.onrender.com/api/payments/stitch/webhook`
- [ ] Replay or complete a test payment and confirm the webhook returns 200
- [ ] Test page optimization (`/api/optimize`)
- [ ] Confirm readiness endpoint returns ready (`/api/readyz`)
- [ ] Test dashboard stats
- [ ] Domain monitoring (if paid plans active)

## Plan Limits

| Plan | Page Optimizations | Domains Monitored |
|------|-------------------|-------------------|
| Free | 3/month | 0 (locked preview) |
| Starter | 20/month | 5 |
| Agency | Unlimited | 5 |

## Costs

| Service | Cost |
|---------|------|
| Render Web (Standard) | $7 |
| Render Postgres (Starter) | $7 |
| Vercel (Hobby) | $0 |
| Gemini API | Free tier |
| Brevo | Free tier (300 emails/day) |

**Total: ~$14/month**

## Email Setup

Get your Brevo API key:
1. Sign up at [brevo.com](https://brevo.com)
2. Go to SMTP & API → API Keys
3. Create a new key and copy it to `BREVO_API_KEY`

## Monitoring

- Backend logs: Render dashboard
- Frontend errors: Vercel analytics
- Database: Drizzle ORM + Postgres logs

## Troubleshooting

**CORS errors:** Check `FRONTEND_URLS` contains every frontend origin exactly (including protocol)

**Database connection:** Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`

**Build failures:** Ensure pnpm is installed globally in Render

**API 403 errors:** Check user's `plan` column in database
