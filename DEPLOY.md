# SEOForge Deployment Guide

## Vercel + Render Setup

### 1. Backend (Render)

1. Create new **Web Service** on Render
2. Connect your GitHub repo
3. Configure:
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     npm install -g pnpm && pnpm install && pnpm -r --filter "./lib/**" --filter "./backend/**" run build
     ```
   - **Start Command:** `cd backend/api-server && node --enable-source-maps ./dist/index.mjs`
   - **Plan:** Standard ($7/month minimum for always-on)

4. **Environment Variables:**
   | Variable | Value | Description |
   |----------|-------|-------------|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render default port |
   | `DATABASE_URL` | (your postgres) | Postgres connection string |
   | `GEMINI_API_KEY` | (your key) | Google Gemini API |
   | `RESEND_API_KEY` | (your key) | Email service |
   | `ADMIN_EMAIL` | `you@example.com` | Admin login email |
   | `ADMIN_PASSWORD` | (generate) | Admin login password |
   | `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Frontend URL |

5. **Database:**
   - Create Postgres instance on Render (or Neon/Supabase)
   - Run migrations (manual for now):
     ```bash
     cd lib/db && npx drizzle-kit migrate
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

- Add custom domain on Vercel
- Update `CORS_ORIGIN` on Render to match
- Update `REPLIT_DEV_DOMAIN` references in email templates

### 4. Post-Deploy Checklist

- [ ] Admin user created (auto on first boot)
- [ ] Test login flow
- [ ] Test page optimization
- [ ] Test dashboard stats
- [ ] Domain monitoring (if paid plans active)

## Plan Limits

| Plan | Page Optimizations | Domains Monitored |
|------|-------------------|-------------------|
| Free | 3/month | 0 (locked preview) |
| Starter | 20/month | 5 |
| Agency | Unlimited | 5 |

## Monitoring

- Backend logs: Render dashboard
- Frontend errors: Vercel analytics
- Database: Drizzle ORM + Postgres logs

## Troubleshooting

**CORS errors:** Check `CORS_ORIGIN` matches your frontend URL exactly

**Database connection:** Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`

**Build failures:** Ensure pnpm is installed globally in Render

**API 403 errors:** Check user's `plan` column in database
