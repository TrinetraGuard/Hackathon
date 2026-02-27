import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthChange, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from "@/services/auth";
import type { AppUser, UserRole } from "@/types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const appUser = await authSignIn(email, password);
    setUser(appUser);
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole = "user") => {
    const appUser = await authSignUp(email, password, displayName, role);
    setUser(appUser);
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
