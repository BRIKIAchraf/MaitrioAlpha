import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const MAINTENANCE_ITEMS = [
    {
        id: "1",
        title: "Chaudière à Gaz",
        lastService: "Octobre 2024",
        status: "good",
        health: 85,
        nextService: "Octobre 2025",
        icon: "fire"
    },
    {
        id: "2",
        title: "Climatisation Salon",
        lastService: "Mai 2023",
        status: "warning",
        health: 45,
        nextService: "Immédiat",
        icon: "air-conditioner"
    },
    {
        id: "3",
        title: "Tableau Électrique",
        lastService: "Janvier 2022",
        status: "danger",
        health: 20,
        nextService: "Urgent",
        icon: "flash"
    }
];

export default function MaintenanceScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0F172A", "#1E293B"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Sérénité Maîtrio</Text>
                </View>
                <Text style={styles.headerDesc}>Maintenance préventive intelligente de votre domicile.</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.scoreCard}>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.scoreLabel}>Santé Globale Habitat</Text>
                        <Text style={styles.scoreValue}>68%</Text>
                        <Text style={styles.scoreSub}>Moyen - 2 actions requises</Text>
                    </View>
                    <View style={styles.scoreProgress}>
                        {/* Progress circle mock */}
                        <View style={styles.progressCircle} />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Vos Équipements</Text>

                {MAINTENANCE_ITEMS.map((item) => (
                    <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name={item.icon as any} size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemDate}>Dernière révision: {item.lastService}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: item.status === 'good' ? '#F0FDF4' : item.status === 'warning' ? '#FFFBEB' : '#FEF2F2' }]}>
                                <Text style={[styles.statusText, { color: item.status === 'good' ? '#16A34A' : item.status === 'warning' ? '#D97706' : '#DC2626' }]}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.healthRow}>
                            <View style={styles.healthBarContainer}>
                                <View style={[styles.healthBar, { width: `${item.health}%`, backgroundColor: item.health > 70 ? '#22C55E' : item.health > 30 ? '#F59E0B' : '#EF4444' }]} />
                            </View>
                            <Text style={styles.healthPercent}>{item.health}%</Text>
                        </View>

                        <View style={styles.itemFooter}>
                            <View>
                                <Text style={styles.nextLabel}>Prochaine révision</Text>
                                <Text style={styles.nextValue}>{item.nextService}</Text>
                            </View>
                            <Pressable style={styles.bookBtn} onPress={() => router.push("/(client)/search")}>
                                <Text style={styles.bookText}>Planifier</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}

                <View style={styles.tipCard}>
                    <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.tipGrad}>
                        <Ionicons name="sunny" size={24} color="white" />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Conseil Automne</Text>
                            <Text style={styles.tipDesc}>C'est le moment de purger vos radiateurs pour économiser 15% sur votre facture.</Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 35, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    headerDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
    content: { flex: 1, padding: 25 },
    scoreCard: { backgroundColor: "white", borderRadius: 24, padding: 20, flexDirection: "row", marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    scoreInfo: { flex: 1 },
    scoreLabel: { fontSize: 13, color: Colors.textMuted, fontFamily: "Inter_500Medium" },
    scoreValue: { fontSize: 32, fontFamily: "Inter_800ExtraBold", color: Colors.text, marginVertical: 4 },
    scoreSub: { fontSize: 12, color: "#F59E0B", fontFamily: "Inter_600SemiBold" },
    scoreProgress: { width: 60, alignItems: "center", justifyContent: "center" },
    progressCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 5, borderColor: "#3B82F6", borderRightColor: "#E2E8F0" },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 15 },
    itemCard: { backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    itemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text },
    itemDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    healthRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    healthBarContainer: { flex: 1, height: 8, backgroundColor: "#F1F5F9", borderRadius: 4, marginRight: 10 },
    healthBar: { height: 8, borderRadius: 4 },
    healthPercent: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.textMuted },
    itemFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 15 },
    nextLabel: { fontSize: 11, color: Colors.textMuted, fontFamily: "Inter_500Medium" },
    nextValue: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.primary },
    bookBtn: { backgroundColor: "#F1F5F9", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
    bookText: { color: Colors.primary, fontSize: 13, fontFamily: "Inter_700Bold" },
    tipCard: { marginTop: 10 },
    tipGrad: { borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center" },
    tipContent: { marginLeft: 15, flex: 1 },
    tipTitle: { color: "white", fontSize: 16, fontFamily: "Inter_700Bold" },
    tipDesc: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4, lineHeight: 18 },
});
