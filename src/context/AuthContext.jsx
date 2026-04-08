import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = getStoredUser();
    if (stored) {
      return {
        name: stored.name || 'CommuniCare User',
        role: stored.role || 'member',
        isAuthenticated: true,
      };
    }

    return {
      name: 'Guest User',
      role: 'member',
      isAuthenticated: false,
    };
  });

  const login = (payload) => {
    setUser({
      name: payload?.name || 'CommuniCare User',
      role: payload?.role || 'member',
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser({ name: 'Guest User', role: 'member', isAuthenticated: false });
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
