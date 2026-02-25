import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/context/auth-context";
import { MissionProvider } from "@/context/mission-context";
import { ChatProvider } from "@/context/chat-context";
import { SupportProvider } from "@/context/support-context";

SplashScreen.preventAutoHideAsync();

import { useSegments, router } from "expo-router";
import { useAuth } from "@/context/auth-context";

function RootLayoutNav() {
  const segments = useSegments();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inClientGroup = segments[0] === "(client)";
    const inArtisanGroup = segments[0] === "(artisan)";
    const inAdminGroup = segments[0] === "(admin)";

    if (!user && !inAuthGroup && segments.length > 0 && (segments[0] as string) !== "index") {
      // Not logged in and trying to access a protected route
      router.replace("/");
    } else if (user && inAuthGroup) {
      // Logged in and trying to access auth pages
      if (user.role === "client") router.replace("/(client)");
      else if (user.role === "artisan") router.replace("/(artisan)");
      else if (user.role === "admin") router.replace("/(admin)");
    } else if (user && user.role === "client" && (inArtisanGroup || inAdminGroup)) {
      router.replace("/(client)");
    } else if (user && user.role === "artisan" && (inClientGroup || inAdminGroup)) {
      router.replace("/(artisan)");
    } else if (user && user.role === "admin" && (inClientGroup || inArtisanGroup)) {
      router.replace("/(admin)");
    }
  }, [user, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="(client)" />
      <Stack.Screen name="(artisan)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="mission/new" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="mission/[id]" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="housing" />
      <Stack.Screen name="support" />
      <Stack.Screen name="support-ticket" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="kyc" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <AuthProvider>
              <MissionProvider>
                <ChatProvider>
                  <SupportProvider>
                    <RootLayoutNav />
                  </SupportProvider>
                </ChatProvider>
              </MissionProvider>
            </AuthProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
