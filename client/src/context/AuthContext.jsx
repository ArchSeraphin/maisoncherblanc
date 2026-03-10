import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [admin, setAdmin] = useState(null);

  const login = useCallback(async (email, password) => {
    const res = await fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur de connexion');
    }
    const data = await res.json();
    setAccessToken(data.accessToken);
    setAdmin(data.admin);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/admin/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setAccessToken(null);
    setAdmin(null);
  }, []);

  const refreshToken = useCallback(async () => {
    const res = await fetch('/admin/refresh', { method: 'POST', credentials: 'include' });
    if (!res.ok) throw new Error('Session expirée');
    const data = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  }, []);

  const authFetch = useCallback(async (url, options = {}) => {
    let token = accessToken;
    const makeRequest = async (t) => {
      return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          Authorization: `Bearer ${t}`,
        },
      });
    };

    let res = await makeRequest(token);

    if (res.status === 401) {
      const data = await res.json().catch(() => ({}));
      if (data.expired) {
        try {
          token = await refreshToken();
          res = await makeRequest(token);
        } catch {
          setAccessToken(null);
          setAdmin(null);
          throw new Error('Session expirée');
        }
      }
    }

    return res;
  }, [accessToken, refreshToken]);

  return (
    <AuthContext.Provider value={{ accessToken, admin, login, logout, authFetch, isLoggedIn: !!accessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
