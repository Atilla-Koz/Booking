'use client';

import type { LoginInput, RegisterInput } from '@booking/shared';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
} from '@/lib/api/auth';
import { bootstrapSession } from '@/lib/api/client';

type User = {
  userId: string;
};

type AuthContextValue = {
  user: User | null;
  isLoadingAuth: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const restored = await bootstrapSession();
      if (isMounted && restored) {
        setUser({ userId: restored.userId });
      }
      if (isMounted) {
        setIsLoadingAuth(false);
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoadingAuth,
      login: async (input) => {
        const data = await loginApi(input);
        setUser({ userId: data.userId });
      },
      register: async (input) => {
        const data = await registerApi(input);
        setUser({ userId: data.userId });
      },
      logout: () => {
        logoutApi();
        setUser(null);
      },
    }),
    [isLoadingAuth, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
