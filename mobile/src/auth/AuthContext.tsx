import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as api from "../api/client";
import { TokenResponse, User } from "../api/types";

const TOKEN_KEY = "plantpals_token";
const USER_KEY = "plantpals_user";

interface AuthState {
  ready: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const [token, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (token && storedUser) {
        api.setAuthToken(token);
        setUser(JSON.parse(storedUser));
      }
      setReady(true);
    })();
  }, []);

  const storeSession = useCallback(async (session: TokenResponse) => {
    api.setAuthToken(session.access_token);
    setUser(session.user);
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, session.access_token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
    ]);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await api.post<TokenResponse>("/auth/login", {
        email,
        password,
      });
      await storeSession(session);
    },
    [storeSession]
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const session = await api.post<TokenResponse>("/auth/register", {
        email,
        password,
        display_name: displayName,
      });
      await storeSession(session);
    },
    [storeSession]
  );

  const logout = useCallback(async () => {
    api.setAuthToken(null);
    setUser(null);
    queryClient.clear();
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  }, [queryClient]);

  const value = useMemo(
    () => ({ ready, user, login, register, logout }),
    [ready, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
