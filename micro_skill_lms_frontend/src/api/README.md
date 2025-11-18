# Frontend API Client Wiring

- Ensure `.env` contains:
  - `REACT_APP_API_BASE=http://localhost:3001`

- The `src/api/client.js` exposes:
  - `setTokenGetter(() => token)` to provide JWT from your AuthContext
  - `getDefaultApiClient()` to get an axios instance that auto-attaches `Authorization: Bearer <token>` when available

Important:
- Use the provided production-ready context: `src/api/AuthContext.jsx` (not the `.example.jsx`).
- Call `setTokenGetter(() => token)` on initial app mount (e.g., in AuthProvider) and whenever the token changes.
- Persist the token (localStorage/sessionStorage) after login/register and restore it on app reload before making API calls.
- On logout, clear storage and call `setTokenGetter(() => null)` (or set token to null) so requests stop sending Authorization.

Quick usage:

```jsx
// App.jsx
import React from 'react';
import { AuthProvider } from './api/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      {/* your routes/components */}
    </AuthProvider>
  );
}
```

Then in feature code:

```jsx
import api from '../api/client';

async function fetchFeed() {
  const res = await api.get('/api/feed'); // public
  return res.data;
}

async function fetchMe() {
  const res = await api.get('/api/auth/me'); // protected; Authorization auto-attached
  return res.data;
}
```

Route prefixes (frontend must use these as-is):
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- Progress: `/api/progress`, `/api/progress/module/:moduleId`, `/api/progress/track`
- Quiz: `/api/quiz/video/:videoId`, `/api/quiz/attempts`

Troubleshooting (401 Unauthorized):
- Confirm you call `setTokenGetter(() => token)` after user logs in and token is stored (state or storage).
- Verify `REACT_APP_API_BASE` points to your running backend (default `http://localhost:3001`).
- Test flow:
  1) `POST /api/auth/register` or `POST /api/auth/login` -> should return `{ user, token }`
  2) Call `GET /api/auth/me` with header `Authorization: Bearer <token>` (check devtools -> Request Headers)
- If CORS errors occur, ensure the backend `CORS_ORIGIN` includes your frontend origin (e.g., `http://localhost:3000`). The backend already allows `Authorization` and sets `Vary: Origin`.
