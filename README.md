# micro-skill-learning-platform-262945-262963

This workspace contains:
- backend (Express + Prisma + Swagger) at `backend/`
- a thin example frontend folder plus the primary frontend in sibling workspace `../micro-skill-learning-platform-262945-262962/micro_skill_lms_frontend`

Below is a consolidated environment and integration guide plus an end‑to‑end verification checklist.

## 1) Environment variables (confirmed)

Frontend (React) — file: `../micro-skill-learning-platform-262945-262962/micro_skill_lms_frontend/.env.example`
- REACT_APP_API_BASE=http://localhost:3001
- REACT_APP_SUPABASE_URL=<your-supabase-url>
- REACT_APP_SUPABASE_KEY=<your-supabase-anon-key>
- REACT_APP_FRONTEND_URL=http://localhost:3000  # optional, used for Supabase email redirect

Notes:
- Frontend uses Supabase-based auth (`src/api/supabaseClient.js` and `src/api/AuthContext.jsx`) and auto-attaches Authorization: Bearer <access_token> to protected calls via axios interceptor (`src/api/client.js`).
- Ensure the values are present in `.env` before `npm start`.

Backend (Express) — file: `backend/.env.example`
- PORT=3001
- CORS_ORIGIN=http://localhost:3000            # can be comma-separated; must match frontend origin(s)
- JWT_SECRET=<strong-random-value>             # legacy fallback token during migration
- DATABASE_PROVIDER=sqlite
- DATABASE_URL="file:./data/dev.db"            # default SQLite
- SUPABASE_URL=<your-supabase-url>             # used to fetch JWKS for Supabase JWT verification

Notes:
- CORS is configured to allow Authorization header and sets Vary: Origin.
- Supabase JWKS are fetched from `${SUPABASE_URL}/auth/v1/keys` in `src/middleware/supabaseAuth.js`.

Integration docs are present and aligned:
- Frontend docs: `../micro-skill-learning-platform-262945-262962/micro_skill_lms_frontend/src/api/README.md` and `src/context/README.md`
- Backend docs: `backend/README.md`, OpenAPI at `backend/interfaces/openapi.json`, and live Swagger UI at `/docs`

## 2) Local run

1) Backend:
```
cd backend
cp .env.example .env   # fill in SUPABASE_URL, CORS_ORIGIN, JWT_SECRET if needed
npm install
npm run db:setup       # prisma generate + migrate + seed with demo data
npm run dev
```

2) Frontend:
```
cd ../micro-skill-learning-platform-262945-262962/micro_skill_lms_frontend
cp .env.example .env   # set REACT_APP_SUPABASE_URL/KEY, API base, etc.
npm install
npm start
```

Open:
- Backend docs: http://localhost:3001/docs
- Frontend app: http://localhost:3000

## 3) End‑to‑End Verification Checklist

A. Services up
- [ ] Backend running on 3001; http://localhost:3001/docs renders Swagger.
- [ ] Frontend running on 3000 and loads without errors.

B. Public content endpoints
- [ ] Frontend Sidebar shows modules (GET /api/modules) — should list seed modules.
- [ ] Feed loads (GET /api/feed) — scroll shows pagination; “Scroll to load more” then “No more videos” when done.
- [ ] Video details lazy-load for selection (GET /api/videos/{videoId}) — Summary text appears in side panel.

C. Supabase authentication
- [ ] On http://localhost:3000/login, use Register or Login with Supabase credentials.
- [ ] After login, TopNav shows “Logout”; Profile shows your email.
- [ ] Backend `GET /api/auth/supabase/me` returns `{ user }` when called from the app (check Network tab).

D. Quiz flow
- [ ] On Video Feed, click “Take Quiz” in Summary panel.
- [ ] Questions load from `GET /api/quiz/video/{videoId}` (no correctness flags exposed).
- [ ] Submit answers; POST `/api/quiz/attempts` returns `{ attempt, result }` and modal shows score.

E. Progress tracking
- [ ] Start a video; upon play/end, client posts to `/api/progress/track` with `{ moduleId, videoId, completed }`.
- [ ] Profile page progress bar reflects overall percent after some completions (GET `/api/progress`).
- [ ] Module page shows per-module progress updated (GET `/api/progress/module/{moduleId}`).

F. CORS and auth headers
- [ ] From DevTools Network, verify protected calls include `Authorization: Bearer <token>`.
- [ ] If 401 occurs, confirm:
  - Backend `.env` SUPABASE_URL set and server restarted.
  - CORS_ORIGIN matches `http://localhost:3000`.
  - Frontend `.env` REACT_APP_SUPABASE_URL/KEY configured.

G. Seed data sanity
- [ ] Seeded videos play (short sample mp4 URLs).
- [ ] Modules/videos appear ordered; quizzes have 3 questions each with 4 options.

## 4) Notes and troubleshooting

- 401 Unauthorized on protected routes:
  - Ensure Supabase session exists (after sign in).
  - Verify frontend environment values and axios interceptor are active.
- CORS errors:
  - Double-check `CORS_ORIGIN` exact match (scheme, host, port).
- Database issues:
  - Re-run `npm run db:setup` after modifying `schema.prisma`.

This document, backend/README.md, and the frontend API docs together provide accurate integration guidance for the current codebase.
