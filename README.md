# micro-skill-learning-platform-262945-262963

## Environment wiring

- Frontend (React):
  - Ensure `.env` contains:
    - `REACT_APP_API_BASE=http://localhost:3001` for local development
    - `REACT_APP_FRONTEND_URL=http://localhost:3000` (optional, used for Supabase email redirect)
    - Supabase public vars:
      - `REACT_APP_SUPABASE_URL=<your-supabase-url>`
      - `REACT_APP_SUPABASE_KEY=<your-supabase-anon-key>`

- Backend (Express):
  - Required envs (see `backend/.env.example`):
    - `PORT=3001`
    - `CORS_ORIGIN=http://localhost:3000` (supports comma-separated list; must exactly match frontend origin)
    - `JWT_SECRET=<strong-random-value>` (kept for legacy tokens during migration)
    - `DATABASE_URL="file:./data/dev.db"` (SQLite default) and `DATABASE_PROVIDER=sqlite`
    - `SUPABASE_URL=<your-supabase-url>` (used to fetch JWKS for JWT verification)
  - CORS is configured with `credentials: true`, allows `Authorization` header on preflight, and sets `Vary: Origin`.

## API client usage

- Authenticated requests must include header:
  - `Authorization: Bearer <access token>`
- With Supabase, the frontend automatically attaches the current session access token via an axios interceptor configured by `AuthContext` (`src/api/AuthContext.jsx`).

- Auth endpoints (migration period):
  - Supabase: `GET /api/auth/supabase/me` -> `{ user }` (Supabase or legacy token accepted)
  - Legacy (temporary): 
    - `POST /api/auth/register` -> `{ user, token }`
    - `POST /api/auth/login` -> `{ user, token }`
    - `GET /api/auth/me` -> `{ user }`

## Supabase Auth Migration

- Backend validates Supabase JWTs using JWKS from `${SUPABASE_URL}/auth/v1/keys`.
- Middleware attempts Supabase verification first; if it fails, it falls back to legacy local JWTs (using `JWT_SECRET`) during a migration window.
- On first Supabase user access, a local `User` row is upserted by email (no password stored for Supabase-managed users).
- Protected routes (progress, quiz submission) rely on the new middleware and `req.user`.

Legacy routes (`/api/auth/register`, `/api/auth/login`) continue to work during the migration window but are deprecated.

## Auth troubleshooting

If the frontend shows "Authentication failed" or protected endpoints return 401:
- Ensure backend `.env` has `SUPABASE_URL` set and the server restarted.
- Confirm `CORS_ORIGIN` includes the exact frontend origin (e.g., `http://localhost:3000`). For multiple origins, use a comma-separated list.
- Verify the frontend attaches `Authorization: Bearer <access_token>` to protected endpoints (the interceptor should do this automatically once logged in).
- CORS preflight: the backend accepts the `Authorization` header and sets `Vary: Origin`. If you use a proxy/CDN, ensure it forwards Origin and does not strip Authorization.
- Quick checks:
  - Frontend: sign up/sign in via Supabase; then reload page to verify session persists.
  - Backend: `GET /api/auth/supabase/me` with Authorization -> should return `{ user }`
  - Progress: `GET /api/progress` with Authorization -> should return your progress list.

## Local run

1) Backend:
```
cd backend
cp .env.example .env  # set SUPABASE_URL, JWT_SECRET, and CORS_ORIGIN
npm install
npm run db:setup      # runs prisma generate, migrate dev --name init, and seeds
npm run dev
```

If you modify backend/prisma/schema.prisma later, regenerate and migrate:
```
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed    # optional: reseed to refresh demo content
```

2) Frontend:
```
cd micro_skill_lms_frontend
cp .env.example .env   # set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY
npm install
npm install @supabase/supabase-js
npm start
```

Visit:
- Backend docs: http://localhost:3001/docs
- Frontend app: http://localhost:3000
