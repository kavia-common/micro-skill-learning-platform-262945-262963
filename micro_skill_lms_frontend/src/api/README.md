# Frontend API Client Wiring

- Ensure `.env` contains:
  - `REACT_APP_API_BASE=http://localhost:3001`

- The `src/api/client.js` exposes:
  - `setTokenGetter(() => token)` to provide JWT from your AuthContext
  - `getDefaultApiClient()` to get an axios instance that auto-attaches `Authorization: Bearer <token>` when available

Example usage with an AuthContext:

```jsx
// src/context/AuthContext.jsx (example)
import React, { createContext, useContext, useMemo, useState } from 'react';
import { setTokenGetter } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const value = useMemo(() => ({ token, setToken }), [token]);

  // Provide token getter to API client
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
