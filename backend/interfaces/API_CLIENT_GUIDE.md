# API Client Guide

This guide shows how a frontend should call the backend with the correct base URL and Authorization header.

## Base URL

Set environment variable on the frontend:
- `REACT_APP_API_BASE=http://localhost:3001`

## Authorization Header

After `POST /api/auth/login` or `POST /api/auth/register`, store the returned `token`. Use it for authenticated calls:

Example (fetch):
```js
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

async function getMe(token) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // critical
    },
    credentials: 'include', // optional; backend does allow credentials
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}
```

Public endpoints (no Authorization needed):
- `GET /api/feed`
- `GET /api/modules`
- `GET /api/modules/{moduleId}`
- `GET /api/videos/{videoId}`
- `GET /api/quiz/video/{videoId}`

Authenticated endpoints (require Authorization):
- `GET /api/auth/me`
- `GET /api/progress`
- `GET /api/progress/module/{moduleId}`
- `POST /api/progress/track`
- `POST /api/quiz/attempts`
