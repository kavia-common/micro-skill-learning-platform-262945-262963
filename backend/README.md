# Backend (Express) - Micro Skill LMS

- Security middleware: helmet + express-rate-limit enabled globally.
- CORS:
  - Allowed origins: set via CORS_ORIGIN (comma-separated). Authorization header is allowed and preflight handled. `Vary: Origin` is set.
- Auth:
  - Protected routes use Supabase-or-legacy JWT middleware.
  - Requires SUPABASE_URL to validate Supabase JWTs via JWKS at `${SUPABASE_URL}/auth/v1/keys`.
  - If verification fails, falls back to legacy JWTs signed with JWT_SECRET for migration.

Key endpoints:
- GET /api/feed -> { items: VideoItem[], nextCursor: string|null }
- POST /api/progress/track -> { moduleId, videoId?, completed } -> 201 and updated progress
- GET /api/quiz/video/:videoId -> { questions: [...] } (no correctness)
- POST /api/quiz/attempts -> { videoId?, moduleId?, answers: [{questionId, selectedAnswerIds: string[]}] } -> 201 { attempt, result }

See /docs for OpenAPI.
