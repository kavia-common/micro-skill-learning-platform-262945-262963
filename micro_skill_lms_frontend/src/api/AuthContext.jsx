import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { setTokenGetter } from './client';

/**
 * PUBLIC_INTERFACE
 * AuthContext with token persistence and axios Authorization wiring.
 * - On mount, restores token/user from localStorage and sets the token getter.
 * - After login/register, persists { token, user } and updates axios token getter.
 * - On logout, clears storage and unsets token so Authorization header is removed.
 */
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** This is a public function component that provides authentication state and token wiring. */
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Initialize from localStorage on first mount
  useEffect(() => {
    try {
      const persistedToken = window.localStorage.getItem('auth_token');
      const persistedUser = window.localStorage.getItem('auth_user');
      if (persistedToken) {
        setToken(persistedToken);
      }
      if (persistedUser) {
        setUser(JSON.parse(persistedUser));
      }
    } catch {
      // ignore storage access issues
    }
  }, []);

  // Wire token getter to axios on every token change and at startup
  useEffect(() => {
    setTokenGetter(() => token);
  }, [token]);

  const loginSuccess = useCallback(({ user: u, token: t }) => {
    if (t) {
      window.localStorage.setItem('auth_token', t);
      setToken(t);
    }
    if (u) {
      window.localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
    }
  }, []);

  const logout = useCallback(() => {
    // Clear persistence and in-memory state
    window.localStorage.removeItem('auth_token');
    window.localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
    // Also clear token getter to stop sending Authorization header
    setTokenGetter(() => null);
  }, []);

  const value = useMemo(
    () => ({ token, user, setToken, setUser, loginSuccess, logout }),
    [token, user, loginSuccess, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** This is a public function to access auth state and helpers. */
  return useContext(AuthContext);
}
