import React, { useState, useEffect } from "react";
// @ts-ignore
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    RefreshControl,
    Alert,
    Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Artisan {
    id: string;
    name: string;
    email: string;
    kycStatus: "pending" | "verified" | "rejected";
    categories: string[];
}

export default function ArtisanVerificationScreen() {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();

    const artisansQuery = useQuery<Artisan[]>({
        queryKey: ["/api/artisans"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/artisans");
            return res.json();
        },
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await apiRequest("PATCH", `/ api / artisans / ${id} `, { kycStatus: status });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/artisans"] });
        },
    });

    const handleVerify = (id: string, name: string) => {
        Alert.alert(
            "Vérification",
            `Souhaitez - vous valider le profil de ${name} ?`,
            [
                { text: "Rejeter", style: "destructive", onPress: () => verifyMutation.mutate({ id, status: "rejected" }) },
                { text: "Annuler", style: "cancel" },
                { text: "Valider", onPress: () => verifyMutation.mutate({ id, status: "verified" }) },
            ]
        );
    };

    const artisans = artisansQuery.data || [];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Vérification Artisans</Text>
            </View>

            <FlatList
                data={artisans}
                keyExtractor={(item: Artisan) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={artisansQuery.isLoading}
                        onRefresh={() => artisansQuery.refetch()}
                    />
                }
                contentContainerStyle={styles.list}
                renderItem={({ item }: { item: Artisan }) => (
                    <View style={styles.card}>
                        <View style={styles.cardInfo}>
                            <Text style={styles.artisanName}>{item.name}</Text>
                            <Text style={styles.artisanEmail}>{item.email}</Text>
                            <View style={styles.badgeRow}>
                                {item.categories.map((cat: string) => (
                                    <View key={cat} style={styles.catBadge}>
                                        <Text style={styles.catText}>{cat}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={styles.actions}>
                            <Pressable
                                style={[styles.btn, item.kycStatus === "verified" && styles.btnActive]}
                                onPress={() => handleVerify(item.id, item.name)}
                            >
                                <Ionicons
                                    name={item.kycStatus === "verified" ? "checkmark-circle" : "shield-checkmark-outline"}
                                    size={20}
                                    color={item.kycStatus === "verified" ? "#fff" : Colors.primary}
                                />
                            </Pressable>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
    list: { padding: 15, gap: 15 },
    card: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        ...Platform.select({
            web: {
                boxShadow: `0px 2px 4px ${Colors.shadow} `,
            },
            default: {
                shadowColor: Colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }
        })
    },
    cardInfo: { flex: 1, gap: 4 },
    artisanName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text },
    artisanEmail: { fontSize: 13, color: Colors.textMuted },
    badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
    catBadge: { backgroundColor: Colors.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    catText: { fontSize: 10, color: Colors.accent, fontFamily: "Inter_700Bold" },
    actions: { marginLeft: 10 },
    btn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.surfaceSecondary,
        alignItems: "center",
        justifyContent: "center",
    },
    btnActive: { backgroundColor: Colors.success },
});
