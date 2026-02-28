import React, { useEffect, useState } from "react";
import * as RN from "react-native";
import { Link, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";

interface Dispute {
    id: string;
    missionTitle: string;
    artisanName: string;
    status: string;
    date: string;
    reason: string;
    severity: string;
}

export default function DisputeCenterScreen() {
    const insets = useSafeAreaInsets();
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            setIsLoading(true);
            const res = await apiRequest("GET", "/api/disputes"); // For the current client
            const data = await res.json();
            setDisputes(data);
        } catch (error) {
            console.error("Failed to fetch disputes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RN.View style={styles.container}>
            <LinearGradient colors={[Colors.danger, "#991B1B"]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <RN.View style={styles.headerRow}>
                    <RN.Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </RN.Pressable>
                    <RN.Text style={styles.headerTitle}>Centre de Litiges</RN.Text>
                    <RN.View style={{ width: 44 }} />
                </RN.View>
                <RN.Text style={styles.headerSub}>Votre sécurité est notre priorité. Nos médiateurs interviennent sous 24h.</RN.Text>
            </LinearGradient>

            <RN.ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RN.RefreshControl refreshing={isLoading} onRefresh={fetchDisputes} />}
            >
                <RN.View style={styles.summaryBox}>
                    <RN.View style={styles.summaryItem}>
                        <RN.Text style={styles.summaryValue}>{disputes.filter((d) => d.status !== "resolved").length}</RN.Text>
                        <RN.Text style={styles.summaryLabel}>En cours</RN.Text>
                    </RN.View>
                    <RN.View style={styles.summaryDivider} />
                    <RN.View style={styles.summaryItem}>
                        <RN.Text style={styles.summaryValue}>{disputes.filter((d) => d.status === "resolved").length}</RN.Text>
                        <RN.Text style={styles.summaryLabel}>Résolus</RN.Text>
                    </RN.View>
                </RN.View>

                <RN.Text style={styles.sectionTitle}>Mes Dossiers</RN.Text>
                {disputes.map((dispute) => (
                    <RN.Pressable key={dispute.id} style={styles.disputeCard} onPress={() => RN.Alert.alert("Détails", "Détails du litige bientôt disponibles.")}>
                        <RN.View style={styles.cardHeader}>
                            <RN.View style={[styles.statusBadge, { backgroundColor: getStatusColor(dispute.status) + "20" }]}>
                                <RN.Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>{getStatusLabel(dispute.status)}</RN.Text>
                            </RN.View>
                            <RN.Text style={styles.date}>{new Date(dispute.date).toLocaleDateString()}</RN.Text>
                        </RN.View>
                        <RN.Text style={styles.missionTitle}>{dispute.missionTitle}</RN.Text>
                        <RN.Text style={styles.artisanName}>Contre: {dispute.artisanName}</RN.Text>
                        <RN.View style={styles.reasonRow}>
                            <Ionicons name="alert-circle" size={14} color={Colors.textMuted} />
                            <RN.Text style={styles.reasonText}>{dispute.reason}</RN.Text>
                        </RN.View>
                        <RN.View style={styles.cardFooter}>
                            <RN.Text style={styles.detailsLink}>Ouvrir le dossier</RN.Text>
                            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                        </RN.View>
                    </RN.Pressable>
                ))}

                <RN.View style={styles.mediationInfo}>
                    <LinearGradient colors={[Colors.primary + "10", Colors.primary + "05"]} style={styles.mediationGrad}>
                        <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
                        <RN.View style={{ flex: 1 }}>
                            <RN.Text style={styles.mediationTitle}>Protection Maîtrio</RN.Text>
                            <RN.Text style={styles.mediationText}>
                                Tous vos paiements sont bloqués jusqu'à résolution. En cas de blocage, un médiateur certifié intervient.
                            </RN.Text>
                        </RN.View>
                    </LinearGradient>
                </RN.View>
            </RN.ScrollView>

            <RN.Pressable style={[styles.newDisputeBtn, { bottom: insets.bottom + 20 }]} onPress={() => RN.Alert.alert("Nouveau Litige", "Veuillez sélectionner une mission terminée dans votre historique pour initier un litige.")}>
                <RN.Text style={styles.newDisputeText}>Signaler un nouveau problème</RN.Text>
            </RN.Pressable>
        </RN.View>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case "mediator_review": return Colors.warning;
        case "resolved": return Colors.success;
        default: return Colors.textMuted;
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case "mediator_review": return "En cours de médiation";
        case "resolved": return "Dossier Résolu";
        default: return status;
    }
}

const styles = RN.StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
    headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", lineHeight: 18 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    summaryBox: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        marginTop: -40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4
    },
    summaryItem: { flex: 1, alignItems: "center" },
    summaryValue: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
    summaryLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
    summaryDivider: { width: 1, height: "100%", backgroundColor: Colors.borderLight },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 30, marginBottom: 16 },
    disputeCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    date: { fontSize: 12, color: Colors.textMuted },
    missionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
    artisanName: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
    reasonRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
    reasonText: { fontSize: 12, color: Colors.textMuted, fontStyle: "italic" },
    cardFooter: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 15, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12 },
    detailsLink: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.primary },
    mediationInfo: { marginTop: 25 },
    mediationGrad: { flexDirection: "row", alignItems: "center", gap: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: Colors.primary + "20" },
    mediationTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.primary },
    mediationText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
    newDisputeBtn: {
        position: "absolute",
        left: 20,
        right: 20,
        backgroundColor: "#fff",
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.danger,
        shadowColor: Colors.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    newDisputeText: { color: Colors.danger, fontSize: 14, fontFamily: "Inter_700Bold" },
});
