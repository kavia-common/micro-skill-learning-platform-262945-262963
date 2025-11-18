# Frontend API Client Wiring

- Ensure `.env` contains:
  - `REACT_APP_API_BASE=http://localhost:3001`

- The `src/api/client.js` exposes:
  - `setTokenGetter(() => token)` to provide JWT from your AuthContext
  - `getDefaultApiClient()` to get an axios instance that auto-attaches `Authorization: Bearer <token>` when available

Important:
- Call `setTokenGetter(() => token)` on initial app mount (e.g., in AuthProvider) and whenever the token changes.
- Persist the token (localStorage/sessionStorage) after login/register and restore it on app reload before making API calls.
- On logout, clear storage and call `setTokenGetter(() => null)` (or set token to null) so requests stop sending Authorization.

Example usage with an AuthContext:

```jsx
// src/context/AuthContext.jsx (example)
import React, { createContext, useContext, useMemo, useState } from 'react';
import { setTokenGetter } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const value = useMemo(() => ({ token, setToken }), [token]);

  // Provide token getter to API client so Authorization header is attached
  setTokenGetter(() => token);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

Then in feature code:

```jsx
import api from '../api/client';

async function fetchFeed() {
  const res = await api.get('/api/feed');
  return res.data;
}
```

Authenticated endpoints automatically include `Authorization` if a token is set.

Troubleshooting (401 Unauthorized):
- Confirm you call `setTokenGetter(() => token)` after user logs in and token is stored (state or storage).
- Verify `REACT_APP_API_BASE` points to your running backend (default `http://localhost:3001`).
- Test flow:
  1) `POST /api/auth/register` or `POST /api/auth/login` -> take the returned `token`
  2) Call `GET /api/auth/me` with header `Authorization: Bearer <token>` (inspected in devtools -> Request Headers)
- If CORS errors occur, ensure the backend `CORS_ORIGIN` includes your frontend origin (e.g., `http://localhost:3000`).
