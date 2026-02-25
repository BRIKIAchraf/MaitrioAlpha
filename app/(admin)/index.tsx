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

export default function AdminDashboardScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#1E293B", "#0F172A"]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Business Brain</Text>
                    <Pressable style={styles.notifBtn}>
                        <Ionicons name="notifications" size={20} color="#fff" />
                        <View style={styles.notifDot} />
                    </Pressable>
                </View>
                <Text style={styles.headerSub}>Vue d'ensemble de l'écosystème Maîtrio.</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.statsGrid}>
                    <Pressable style={styles.statPressable} onPress={() => router.push("/(admin)/reporting")}>
                        <AdminStatCard title="GMV" value="45.2k€" trend="+12%" icon="trending-up" color="#10B981" />
                    </Pressable>
                    <AdminStatCard title="Artisans" value="156" trend="+8" icon="construct" color="#6366F1" />
                    <AdminStatCard title="Missions" value="842" trend="+124" icon="briefcase" color="#F59E0B" />
                    <Pressable style={styles.statPressable} onPress={() => router.push("/dispute" as any)}>
                        <AdminStatCard title="Litiges" value="3" trend="-2" icon="alert-circle" color="#EF4444" />
                    </Pressable>
                </View>

                <Text style={styles.sectionTitle}>Actions Prioritaires</Text>
                <View style={styles.actionGrid}>
                    <ActionCard
                        title="Vérifications"
                        sub="12 dossiers en attente"
                        icon="shield-checkmark"
                        color="#3B82F6"
                        onPress={() => router.push("/(admin)/artisans" as any)}
                    />
                    <ActionCard
                        title="Missions"
                        sub="Contrôle en temps réel"
                        icon="map"
                        color="#8B5CF6"
                        onPress={() => router.push("/(admin)/missions" as any)}
                    />
                    <ActionCard
                        title="Litiges"
                        sub="2 médiations critiques"
                        icon="warning"
                        color="#F43F5E"
                        onPress={() => router.push("/dispute" as any)}
                    />
                    <ActionCard
                        title="Alertes"
                        sub="Dispatcher un Push"
                        icon="notifications"
                        color="#6366F1"
                        onPress={() => router.push("/(admin)/notifications" as any)}
                    />
                </View>

                <Text style={styles.sectionTitle}>Activité Récente</Text>
                <View style={styles.logCard}>
                    <LogItem text="Artisan #A42 vérifié par l'Admin" time="il y a 2m" />
                    <LogItem text="Mission #M892 complétée avec succès" time="il y a 15m" />
                    <LogItem text="Nouveau litige ouvert par Client #C22" time="il y a 1h" type="danger" />
                </View>
            </ScrollView>
        </View>
    );
}

function AdminStatCard({ title, value, trend, icon, color }: any) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statLabel}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={[styles.statTrend, { color: trend.startsWith("+") ? "#10B981" : "#EF4444" }]}>{trend}</Text>
        </View>
    );
}

function ActionCard({ title, sub, icon, color, onPress }: any) {
    return (
        <Pressable style={styles.actionCard} onPress={onPress}>
            <View style={[styles.actionIcon, { backgroundColor: color + "15" }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSub}>{sub}</Text>
        </Pressable>
    );
}

function LogItem({ text, time, type }: any) {
    return (
        <View style={styles.logItem}>
            <View style={[styles.logDot, { backgroundColor: type === "danger" ? Colors.danger : Colors.primary }]} />
            <Text style={styles.logText}>{text}</Text>
            <Text style={styles.logTime}>{time}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 20, paddingBottom: 25, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
    headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
    notifBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    notifDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, borderWidth: 2, borderColor: "#1E293B" },
    scrollContent: { padding: 20, paddingBottom: 50 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 30 },
    statCard: { width: (width - 52) / 2, backgroundColor: "#fff", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.borderLight },
    statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    statLabel: { fontSize: 12, color: Colors.textMuted, fontFamily: "Inter_500Medium" },
    statValue: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
    statTrend: { fontSize: 11, fontFamily: "Inter_700Bold", marginTop: 4 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 16 },
    actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 30 },
    actionCard: { width: (width - 52) / 2, backgroundColor: "#fff", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: Colors.borderLight, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 3 },
    actionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    actionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
    actionSub: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
    logCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.borderLight },
    logItem: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 15 },
    logDot: { width: 6, height: 6, borderRadius: 3 },
    logText: { flex: 1, fontSize: 13, color: Colors.text, fontFamily: "Inter_400Regular" },
    logTime: { fontSize: 11, color: Colors.textMuted },
    statPressable: { width: (width - 52) / 2 },
});
