# micro-skill-learning-platform-262945-262963

## Environment wiring

- Frontend (React):
  - Ensure `.env` contains `REACT_APP_API_BASE=http://localhost:3001` for local development.
  - Optional mirrors: `REACT_APP_BACKEND_URL=http://localhost:3001`, `REACT_APP_FRONTEND_URL=http://localhost:3000`.

- Backend (Express):
  - Required envs (see `backend/.env.example`):
    - `PORT=3001`
    - `CORS_ORIGIN=http://localhost:3000` (supports comma-separated list)
    - `JWT_SECRET=<strong-random-value>`
    - `DATABASE_URL="file:./data/dev.db"` (SQLite default) and `DATABASE_PROVIDER=sqlite`
  - CORS is configured with `credentials: true` and allows `Authorization` header.

## API client usage

- Authenticated requests must include header:
  - `Authorization: Bearer <JWT token>`
- Public endpoints (feed/modules/video) do not require the header.
- Auth endpoints:
  - `POST /api/auth/register` -> `{ user, token }`
  - `POST /api/auth/login` -> `{ user, token }`
  - `GET /api/auth/me` requires `Authorization` header.

## Local run

1) Backend:
```
cd backend
cp .env.example .env  # then set JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

2) Frontend:
```
cd micro_skill_lms_frontend
cp .env.example .env
npm install
npm start
```

Visit:
- Backend docs: http://localhost:3001/docs
- Frontend app: http://localhost:3000