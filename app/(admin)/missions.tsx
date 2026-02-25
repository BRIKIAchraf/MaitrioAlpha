import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const MOCK_ACTIVE_MISSIONS = [
    { id: "m1", title: "Panne Électrique", client: "Dounia B.", artisan: "Ahmed M.", status: "in_progress", area: "Paris 15" },
    { id: "m2", title: "Canalisation Bouchée", client: "Sami K.", artisan: "Lucas B.", status: "en_route", area: "Lyon 3" },
    { id: "m3", title: "Fuite Gaz Urgente", client: "Yasmine H.", artisan: "Claire D.", status: "check_in", area: "Nantes Centre" },
];

export default function AdminMissionControlScreen() {
    const insets = useSafeAreaInsets();
    const [missions, setMissions] = useState(MOCK_ACTIVE_MISSIONS);

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#1E293B", "#475569"]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerRow}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Mission Control</Text>
                    <View style={{ width: 44 }} />
                </View>
                <Text style={styles.headerSub}>Suivi en temps réel des flux opérationnels.</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.mapPlaceholder}>
                    <Ionicons name="map" size={40} color={Colors.primary} />
                    <Text style={styles.mapText}>Chargement de la Map Monde...</Text>
                    <View style={styles.dotPulse} />
                </View>

                <View style={styles.filterRow}>
                    <Text style={styles.sectionTitle}>Trafic Actif ({missions.length})</Text>
                    <View style={styles.filterBtn}>
                        <Ionicons name="filter" size={16} color={Colors.textMuted} />
                    </View>
                </View>

                {missions.map((m) => (
                    <View key={m.id} style={styles.missionCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.missionInfo}>
                                <Text style={styles.missionTitle}>{m.title}</Text>
                                <Text style={styles.missionArea}>{m.area}</Text>
                            </View>
                            <View style={[styles.statusTag, { backgroundColor: getStatusColor(m.status) + "20" }]}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(m.status) }]} />
                                <Text style={[styles.statusText, { color: getStatusColor(m.status) }]}>{m.status.toUpperCase()}</Text>
                            </View>
                        </View>

                        <View style={styles.flowRow}>
                            <View style={styles.participant}>
                                <View style={styles.avatarMini}><Ionicons name="person" size={12} color={Colors.textMuted} /></View>
                                <Text style={styles.partName}>{m.client}</Text>
                                <Text style={styles.partLabel}>Client</Text>
                            </View>
                            <Ionicons name="swap-horizontal" size={16} color={Colors.border} />
                            <View style={styles.participant}>
                                <View style={styles.avatarMini}><Ionicons name="construct" size={12} color={Colors.textMuted} /></View>
                                <Text style={styles.partName}>{m.artisan}</Text>
                                <Text style={styles.partLabel}>Artisan</Text>
                            </View>
                        </View>

                        <Pressable style={styles.viewBtn} onPress={() => router.push({ pathname: "/mission/[id]", params: { id: m.id } })}>
                            <Text style={styles.viewBtnText}>Intervenir en médiateur</Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>
        </View>
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
    missionCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: Colors.borderLight },
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
