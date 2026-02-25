import React from "react";
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

const { width } = Dimensions.get("window");

export default function AdminReportingScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#1E293B", "#0F172A"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Business Intel & Analytics</Text>
                </View>
                <Text style={styles.headerDesc}>Suivi des performances réseau en temps réel.</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.kpiGrid}>
                    <KpiCard title="CA Global" value="245.8k€" delta="+12%" />
                    <KpiCard title="Missions" value="1,420" delta="+5%" />
                    <KpiCard title="Artisans" value="385" delta="+22" />
                    <KpiCard title="Taux Satisfaction" value="96.2%" delta="+0.4%" />
                </View>

                <Text style={styles.sectionTitle}>Performance par Zone (Paris)</Text>
                <View style={styles.zoneList}>
                    <ZoneItem rank={1} name="Paris 15e" volume="42 missions" ca="12,450€" trend="up" />
                    <ZoneItem rank={2} name="Paris 16e" volume="38 missions" ca="15,200€" trend="up" />
                    <ZoneItem rank={3} name="Boulogne-Bill." volume="29 missions" ca="8,100€" trend="down" />
                    <ZoneItem rank={4} name="Paris 11e" volume="22 missions" ca="6,400€" trend="up" />
                </View>

                <Text style={styles.sectionTitle}>Commissions Maîtrio (15%)</Text>
                <View style={styles.commissionCard}>
                    <View style={styles.commRow}>
                        <Text style={styles.commLabel}>Ce mois (Fév)</Text>
                        <Text style={styles.commValue}>36,870€</Text>
                    </View>
                    <View style={styles.commBarContainer}>
                        <View style={[styles.commBarFill, { width: "75%" }]} />
                    </View>
                    <Text style={styles.commSubtitle}>Objectif : 45,000€ (82%)</Text>
                </View>

                <Pressable style={styles.exportBtn}>
                    <Ionicons name="download-outline" size={20} color="white" />
                    <Text style={styles.exportBtnText}>EXPORTER RAPPORT PDF / CSV</Text>
                </Pressable>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function KpiCard({ title, value, delta }: { title: string; value: string; delta: string }) {
    return (
        <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{title}</Text>
            <Text style={styles.kpiValue}>{value}</Text>
            <View style={styles.deltaBox}>
                <Ionicons name="trending-up" size={12} color={Colors.success} />
                <Text style={styles.deltaText}>{delta}</Text>
            </View>
        </View>
    );
}

function ZoneItem({ rank, name, volume, ca, trend }: { rank: number; name: string; volume: string; ca: string; trend: 'up' | 'down' }) {
    return (
        <View style={styles.zoneItem}>
            <Text style={styles.zoneRank}>#{rank}</Text>
            <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{name}</Text>
                <Text style={styles.zoneVolume}>{volume}</Text>
            </View>
            <View style={styles.zoneStats}>
                <Text style={styles.zoneCa}>{ca}</Text>
                <Ionicons
                    name={trend === 'up' ? "arrow-up" : "arrow-down"}
                    size={14}
                    color={trend === 'up' ? Colors.success : Colors.danger}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F1F5F9" },
    header: { paddingHorizontal: 25, paddingBottom: 30 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    headerDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
    content: { flex: 1, padding: 20 },
    kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 25 },
    kpiCard: { width: (width - 52) / 2, backgroundColor: "white", padding: 16, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    kpiLabel: { fontSize: 12, color: Colors.textMuted, fontFamily: "Inter_500Medium" },
    kpiValue: { fontSize: 18, fontFamily: "Inter_800ExtraBold", color: Colors.text, marginTop: 4 },
    deltaBox: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    deltaText: { fontSize: 11, color: Colors.success, fontFamily: "Inter_700Bold", marginLeft: 4 },
    sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 15, marginTop: 10 },
    zoneList: { backgroundColor: "white", borderRadius: 24, padding: 10, marginBottom: 20 },
    zoneItem: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    zoneRank: { fontSize: 12, fontFamily: "Inter_800ExtraBold", color: Colors.textMuted, width: 30 },
    zoneInfo: { flex: 1 },
    zoneName: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
    zoneVolume: { fontSize: 12, color: Colors.textSecondary },
    zoneStats: { alignItems: "flex-end", gap: 4 },
    zoneCa: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.primary },
    commissionCard: { backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 25 },
    commRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    commLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
    commValue: { fontSize: 20, fontFamily: "Inter_800ExtraBold", color: Colors.primary },
    commBarContainer: { height: 8, backgroundColor: "#F1F5F9", borderRadius: 4, overflow: "hidden" },
    commBarFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },
    commSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 10, textAlign: "right" },
    exportBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    exportBtnText: { color: "white", fontSize: 14, fontFamily: "Inter_800ExtraBold" },
});
