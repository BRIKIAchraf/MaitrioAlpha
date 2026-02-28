import React, { useState, useEffect } from "react";
import * as RN from "react-native";
import { RefreshControl, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";

interface Mission {
    id: string;
    title: string;
    clientName?: string;
    artisanName?: string;
    status: string;
    address?: string;
}

export default function AdminMissionControlScreen() {
    const insets = useSafeAreaInsets();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        try {
            setIsLoading(true);
            const res = await apiRequest("GET", "/api/missions"); // Assuming this returns all for admin
            const data = await res.json();
            setMissions(data);
        } catch (error) {
            console.error("Failed to fetch missions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RN.View style={styles.container}>
            <LinearGradient colors={["#1E293B", "#475569"]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <RN.View style={styles.headerRow}>
                    <RN.Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </RN.Pressable>
                    <RN.Text style={styles.headerTitle}>Mission Control</RN.Text>
                    <RN.View style={{ width: 44 }} />
                </RN.View>
                <RN.Text style={styles.headerSub}>Suivi en temps réel des flux opérationnels.</RN.Text>
            </LinearGradient>

            <RN.ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMissions} />}
            >
                <RN.View style={styles.mapPlaceholder}>
                    <Ionicons name="map" size={40} color={Colors.primary} />
                    <RN.Text style={styles.mapText}>Chargement de la Map Monde...</RN.Text>
                    <RN.View style={styles.dotPulse} />
                </RN.View>

                <RN.View style={styles.filterRow}>
                    <RN.Text style={styles.sectionTitle}>Trafic Actif ({missions.length})</RN.Text>
                    <RN.View style={styles.filterBtn}>
                        <Ionicons name="filter" size={16} color={Colors.textMuted} />
                    </RN.View>
                </RN.View>

                {missions.map((m) => (
                    <RN.View key={m.id} style={styles.missionCard}>
                        <RN.View style={styles.cardHeader}>
                            <RN.View style={styles.missionInfo}>
                                <RN.Text style={styles.missionTitle}>{m.title}</RN.Text>
                                <RN.Text style={styles.missionArea}>{m.address || "Zone indéfinie"}</RN.Text>
                            </RN.View>
                            <RN.View style={[styles.statusTag, { backgroundColor: getStatusColor(m.status) + "20" }]}>
                                <RN.View style={[styles.statusDot, { backgroundColor: getStatusColor(m.status) }]} />
                                <RN.Text style={[styles.statusText, { color: getStatusColor(m.status) }]}>{m.status.toUpperCase()}</RN.Text>
                            </RN.View>
                        </RN.View>

                        <RN.View style={styles.flowRow}>
                            <RN.View style={styles.participant}>
                                <RN.View style={styles.avatarMini}><Ionicons name="person" size={12} color={Colors.textMuted} /></RN.View>
                                <RN.Text style={styles.partName}>{m.clientName || "Client"}</RN.Text>
                                <RN.Text style={styles.partLabel}>Client</RN.Text>
                            </RN.View>
                            <Ionicons name="swap-horizontal" size={16} color={Colors.border} />
                            <RN.View style={styles.participant}>
                                <RN.View style={styles.avatarMini}><Ionicons name="construct" size={12} color={Colors.textMuted} /></RN.View>
                                <RN.Text style={styles.partName}>{m.artisanName || "Artisan"}</RN.Text>
                                <RN.Text style={styles.partLabel}>Artisan</RN.Text>
                            </RN.View>
                        </RN.View>

                        <RN.Pressable style={styles.viewBtn} onPress={() => router.push({ pathname: "/mission/[id]", params: { id: m.id } })}>
                            <RN.Text style={styles.viewBtnText}>Intervenir en médiateur</RN.Text>
                        </RN.Pressable>
                    </RN.View>
                ))}
            </RN.ScrollView>
        </RN.View>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case "in_progress": return Colors.success;
        case "en_route": return Colors.info;
        case "check_in": return Colors.warning;
        default: return Colors.textMuted;
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 20, paddingBottom: 25, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
    headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
    scrollContent: { padding: 20 },
    mapPlaceholder: { height: 180, backgroundColor: Colors.surfaceSecondary, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 30, gap: 10, borderWidth: 1, borderColor: Colors.borderLight, borderStyle: "dashed" },
    mapText: { fontSize: 14, color: Colors.textMuted, fontFamily: "Inter_500Medium" },
    dotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
    filterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
    filterBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.borderLight },
    missionCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        ...Platform.select({
            web: {
                boxShadow: `0px 2px 4px rgba(0,0,0,0.05)`,
            },
            default: {
                // No extra shadow needed if border is enough or kept as is
            }
        })
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
    missionInfo: { flex: 1 },
    missionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
    missionArea: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    statusTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10, fontFamily: "Inter_800ExtraBold" },
    flowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: Colors.surfaceSecondary, borderRadius: 16, padding: 15, marginBottom: 15 },
    participant: { alignItems: "center", gap: 4 },
    avatarMini: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
    partName: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.text },
    partLabel: { fontSize: 10, color: Colors.textMuted },
    viewBtn: { paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.surfaceSecondary, alignItems: "center" },
    viewBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.primary },
});
