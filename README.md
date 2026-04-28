# Code Optimizer Pro (SEOaxe)

A B2B SaaS web app that optimizes HTML for SEO and AEO using Google Gemini.

## Project Structure

This is a **pnpm monorepo** with separate frontend and backend workspaces:

```
Code-Optimizer-Pro/
├── frontend/                    # Frontend applications
│   ├── seoforge/               # Main SEOaxe React app
│   └── mockup-sandbox/         # Mockup sandbox for testing
├── backend/                     # Backend services
│   └── api-server/             # Express 5 API server
├── lib/                         # Shared libraries
│   ├── api-client-react/       # Generated React API hooks
│   ├── api-spec/               # OpenAPI specification
│   ├── api-zod/                # Generated Zod schemas
│   └── db/                     # Database utilities
└── scripts/                     # Build and utility scripts
```

## Tech Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js**: 24
- **Frontend**: React + Vite + Tailwind v4 + wouter + shadcn/ui
- **Backend**: Express 5 calling Google Gemini (`@google/generative-ai`)
- **API contracts**: OpenAPI in `lib/api-spec/openapi.yaml`, codegen via Orval
- **AI**: Google Gemini (model: `gemini-1.5-flash`)

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm (`npm install -g pnpm`)
- Google Gemini API key

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:

**Backend:**
```bash
cd backend/api-server
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY, DATABASE_URL, and admin credentials
```

**Frontend:**
```bash
cd frontend/seoforge
cp .env.example .env
# Edit .env if you need to customize ports or API URL
```

### Development

**Run Backend:**
```bash
# From project root
pnpm --filter @workspace/api-server run dev

# Or from backend/api-server directory
pnpm run dev
```

**Run Frontend:**
```bash
# From project root
pnpm --filter @workspace/seoforge run dev

# Or from frontend/seoforge directory
pnpm run dev
```

**Run Both (in separate terminals):**
```bash
# Terminal 1 - Backend
pnpm --filter @workspace/api-server run dev

# Terminal 2 - Frontend
pnpm --filter @workspace/seoforge run dev
```

### Build

```bash
# Build everything
pnpm run build

# Build only frontend
pnpm --filter @workspace/seoforge run build

# Build only backend
pnpm --filter @workspace/api-server run build
```

### Type Checking

```bash
# Full typecheck
pnpm run typecheck
```

## API Endpoints

All endpoints are under `/api`:

- `GET /healthz` - Health check
- `POST /optimize` - Optimize HTML for SEO
  - Body: `{ html, filename? }`
  - Returns: `{ optimizedHtml, changes[], score }`
- `POST /scan-competitor` - Scan competitor URL
  - Body: `{ url }`
  - Returns: `{ url, title, strategy, beatThem[] }`

All Gemini errors return friendly messages — raw API errors are never surfaced.

## Frontend-Backend Connection

The frontend connects to the backend API through the generated API client:

1. **Base URL Configuration**: Set in `frontend/seoforge/src/main.tsx`
   - Uses `VITE_API_URL` environment variable
   - Defaults to `http://localhost:4000`

2. **CORS**: Backend is configured to accept requests from the frontend
   - Set `FRONTEND_URL` in backend `.env`
   - Defaults to `http://localhost:5173`

3. **API Client**: Generated from OpenAPI spec using Orval
   - Located in `lib/api-client-react`
   - Provides React hooks for all API endpoints

## Environment Variables

### Backend (backend/api-server/.env)
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `GEMINI_API_KEY` - Google Gemini API key (required)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `FRONTEND_URLS` - Optional comma-separated allowlist when multiple frontend origins need access
- `ADMIN_EMAIL` - Bootstrap admin email for login
- `ADMIN_PASSWORD` - Bootstrap admin password for login
- `AUTH_BOOTSTRAP_ADMIN` - Set to `true` only during explicit admin bootstrap/initialization

### Frontend (frontend/seoforge/.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:4000)
- `BASE_PATH` - Base path for routing (default: /)
- `PORT` - Vite dev server port (default: 5173)

## Key Commands

```bash
# Install dependencies
pnpm install

# Regenerate API hooks/Zod from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Run backend
pnpm --filter @workspace/api-server run dev

# Run frontend
pnpm --filter @workspace/seoforge run dev

# Build all
pnpm run build

# Typecheck all
pnpm run typecheck
```

## Architecture

### Frontend (SEOaxe)
- React 19 with TypeScript
- Vite for bundling and dev server
- Tailwind CSS v4 for styling
- shadcn/ui components
- Wouter for routing
- TanStack React Query for data fetching
- Generated API hooks from OpenAPI spec

### Backend (API Server)
- Express 5 for HTTP server
- Google Gemini AI for optimization
- Pino for logging
- CORS enabled for frontend communication
- Modular route structure

### Shared Libraries
- **api-spec**: OpenAPI 3.0 specification
- **api-client-react**: Generated React hooks (via Orval)
- **api-zod**: Generated Zod validation schemas
- **db**: Database utilities (Drizzle ORM)

## Deployment

### Backend
```bash
cd backend/api-server
pnpm run build
pnpm run start
```

### Frontend
```bash
cd frontend/seoforge
pnpm run build
# Serve from dist/public directory
```

## License

MIT
