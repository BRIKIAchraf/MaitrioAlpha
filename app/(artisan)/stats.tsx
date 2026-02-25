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

export default function ArtisanStatsScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerRow}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Mes Performances</Text>
                    <View style={{ width: 44 }} />
                </View>
                <Text style={styles.headerSub}>Suivez l'évolution de votre activité et vos objectifs.</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.statsGrid}>
                    <StatCard title="Revenus" value="1,240€" sub="Ce mois-ci" icon="cash" color="#10B981" />
                    <StatCard title="Missions" value="18" sub="+3 vs Janvier" icon="briefcase" color="#6366F1" />
                    <StatCard title="Avis" value="4.8" sub="124 avis" icon="star" color="#F59E0B" />
                    <StatCard title="Réponse" value="45m" sub="Moyenne" icon="time" color="#EF4444" />
                </View>

                <Text style={styles.sectionTitle}>Progression Annuelle</Text>
                <View style={styles.chartPlaceholder}>
                    <View style={styles.barGroup}>
                        {[40, 60, 45, 80, 70, 90, 100].map((h, i) => (
                            <View key={i} style={styles.barContainer}>
                                <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={[styles.bar, { height: h }]} />
                                <Text style={styles.barLabel}>{["S", "D", "L", "M", "M", "J", "V"][i]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Impact Maîtrio</Text>
                <View style={styles.impactCard}>
                    <View style={styles.impactRow}>
                        <View style={styles.impactIconBox}>
                            <Ionicons name="leaf" size={24} color={Colors.success} />
                        </View>
                        <View style={styles.impactInfo}>
                            <Text style={styles.impactTitle}>Économie Circulaire</Text>
                            <Text style={styles.impactDesc}>Vous avez aidé à réparer 12 objets au lieu de les jeter.</Text>
                        </View>
                    </View>
                    <View style={styles.impactDivider} />
                    <View style={styles.impactRow}>
                        <View style={styles.impactIconBox}>
                            <Ionicons name="people" size={24} color={Colors.info} />
                        </View>
                        <View style={styles.impactInfo}>
                            <Text style={styles.impactTitle}>Score Communautaire</Text>
                            <Text style={styles.impactDesc}>Top 5% des artisans les mieux notés de votre zone.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Pressable style={[styles.exportBtn, { bottom: insets.bottom + 20 }]} onPress={() => { }}>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.exportBtnText}>Exporter mon rapport (PDF)</Text>
            </Pressable>
        </View>
    );
}

function StatCard({ title, value, sub, icon, color }: { title: string; value: string; sub: string; icon: any; color: string }) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statLabel}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statSub}>{sub}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 20, paddingBottom: 25, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
    headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
    scrollContent: { padding: 20, paddingBottom: 120 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 30 },
    statCard: {
        width: (width - 52) / 2,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 20,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    statLabel: { fontSize: 12, color: Colors.textMuted, fontFamily: "Inter_500Medium" },
    statValue: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text, marginVertical: 4 },
    statSub: { fontSize: 11, color: Colors.success, fontFamily: "Inter_600SemiBold" },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 16 },
    chartPlaceholder: {
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 24,
        height: 200,
        justifyContent: "flex-end",
        marginBottom: 30,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    barGroup: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: "100%" },
    barContainer: { alignItems: "center", gap: 8 },
    bar: { width: 12, borderRadius: 6 },
    barLabel: { fontSize: 10, color: Colors.textMuted, fontFamily: "Inter_500Medium" },
    impactCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.borderLight },
    impactRow: { flexDirection: "row", gap: 15, alignItems: "center" },
    impactIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
    impactInfo: { flex: 1 },
    impactTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
    impactDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
    impactDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 15 },
    exportBtn: {
        position: "absolute",
        left: 20,
        right: 20,
        backgroundColor: Colors.text,
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    exportBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
