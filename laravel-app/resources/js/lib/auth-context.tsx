import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { api } from "@/lib/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: string | null;
  roleName: string | null;
  permissions: string[];
  storeId: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasPermission: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** True for the built-in Admin role and anyone whose permission set was
 * granted every catalog key — mirrors how the Roles module treats "Admin"
 * as implicitly all-powerful rather than requiring every key to be listed. */
function isAdmin(user: AuthUser | null): boolean {
  return user?.roleName === "Admin" || user?.role === "ADMIN";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: AuthUser }>("/auth/me")
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ data: AuthUser }>("/auth/login", { email, password });
    setUser(res.data.data);
    return res.data.data;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (key: string) => isAdmin(user) || (user?.permissions.includes(key) ?? false),
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
