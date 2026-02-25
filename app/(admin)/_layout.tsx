import React, { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";

export default function AdminLayout() {
    const { user } = useAuth();

    if (!user || user.role !== "admin") return null;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.borderLight,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontFamily: "Inter_500Medium",
                    fontSize: 11,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="users"
                options={{
                    title: "Utilisateurs",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="artisans"
                options={{
                    title: "Artisans",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="construct" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="disputes"
                options={{
                    title: "Litiges",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="alert-circle" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
