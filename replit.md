# SEOForge

## Overview

SEOForge is a B2B SaaS web app that optimizes HTML for SEO and AEO using Google Gemini.
Users paste HTML or upload a ZIP, see side-by-side diffs, get a health score, sitemap/robots, and can scan competitor URLs.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js**: 24
- **Frontend**: React + Vite + Tailwind v4 + wouter + shadcn/ui (artifacts/seoforge)
- **Backend**: Express 5 (artifacts/api-server) calling Google Gemini (`@google/generative-ai`, model `gemini-1.5-flash`)
- **API contracts**: OpenAPI in `lib/api-spec/openapi.yaml`, codegen via Orval into `lib/api-client-react` and `lib/api-zod`
- **AI**: Google Gemini, key in env var `GEMINI_API_KEY`

## Endpoints (under `/api`)

- `GET /healthz`
- `POST /optimize` — body `{ html, filename? }` → `{ optimizedHtml, changes[], score }`
- `POST /scan-competitor` — body `{ url }` → `{ url, title, strategy, beatThem[] }`

All Gemini errors return a friendly `"Optimization failed, please try again."` / `"Scan failed, please try again."` — raw API errors are never surfaced.

## Key Commands

- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/Zod
- `pnpm --filter @workspace/api-server run dev` — run API server locally
