import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/lib/query-client";

export type UserRole = "client" | "artisan" | "admin";

export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  role: UserRole;
  verified?: boolean;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  trustScore?: number;
  housingScore?: number;
  kycStatus?: "pending" | "verified" | "rejected";
  revenue?: number;
  createdAt: string;
  artisanProfile?: any;
  wallet?: any;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "@maison_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch { }
    setIsLoading(false);
  }

  async function login(username: string, password: string) {
    const res = await apiRequest("POST", "/api/auth/login", { username, password });
    const data = await res.json();
    const u: User = {
      ...data,
      name: [data.firstName, data.lastName].filter(Boolean).join(" ") || data.username,
      email: data.email || "",
      createdAt: data.createdAt || new Date().toISOString(),
    };
    setUser(u);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }

  async function register(data: RegisterData) {
    const nameParts = data.name.split(" ");
    const firstName = nameParts[0] || data.name;
    const lastName = nameParts.slice(1).join(" ") || "";
    const username = data.email.split("@")[0] + "." + Date.now().toString(36);

    const res = await apiRequest("POST", "/api/auth/register", {
      username,
      password: data.password,
      email: data.email,
      phone: data.phone,
      firstName,
      lastName,
      role: data.role,
    });
    const created = await res.json();
    const u: User = {
      ...created,
      name: data.name,
      email: data.email,
      createdAt: created.createdAt || new Date().toISOString(),
    };
    setUser(u);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  async function updateUser(data: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
