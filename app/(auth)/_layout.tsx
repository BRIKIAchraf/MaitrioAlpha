import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useAuth } from "@/context/auth-context";

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
