import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "client" | "artisan" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isPremium?: boolean;
  loyaltyPoints?: number;
  trustScore?: number;
  kycStatus?: "pending" | "verified" | "rejected";
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "@maitrio_user";

// Demo accounts for testing
const DEMO_ACCOUNTS: Record<string, User> = {
  "client@demo.com": {
    id: "c1",
    name: "Sophie Martin",
    email: "client@demo.com",
    role: "client",
    isPremium: false,
    loyaltyPoints: 350,
    trustScore: 92,
    kycStatus: "verified",
    createdAt: new Date().toISOString(),
  },
  "artisan@demo.com": {
    id: "a1",
    name: "Mohamed Benali",
    email: "artisan@demo.com",
    role: "artisan",
    trustScore: 95,
    kycStatus: "verified",
    createdAt: new Date().toISOString(),
  },
  "admin@demo.com": {
    id: "adm1",
    name: "Admin Maitrio",
    email: "admin@demo.com",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setIsLoading(false);
  }

  async function login(email: string, password: string) {
    const demoUser = DEMO_ACCOUNTS[email.toLowerCase()];
    if (demoUser && password.length >= 4) {
      setUser(demoUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      return;
    }
    throw new Error("Identifiants invalides. Utilisez client@demo.com, artisan@demo.com ou admin@demo.com");
  }

  async function register(data: RegisterData) {
    const newUser: User = {
      id: "u_" + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      isPremium: false,
      loyaltyPoints: 0,
      trustScore: 0,
      kycStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  function updateUser(data: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, register, logout, updateUser }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
