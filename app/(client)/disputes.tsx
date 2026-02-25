import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const MOCK_DISPUTES = [
    {
        id: "d1",
        missionTitle: "Réparation Fuite Cuisine",
        artisanName: "Ahmed Mansour",
        status: "mediator_review",
        date: "24 Fév 2026",
        reason: "Travail non terminé",
        severity: "medium",
    },
    {
        id: "d2",
        missionTitle: "Installation Tableau Électrique",
        artisanName: "Lucas Bernard",
        status: "resolved",
        date: "12 Jan 2026",
        reason: "Retard excessif",
        severity: "low",
    },
];

export default function DisputeCenterScreen() {
    const insets = useSafeAreaInsets();
    const [disputes, setDisputes] = useState(MOCK_DISPUTES);

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.danger, "#991B1B"]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerRow}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Centre de Litiges</Text>
                    <View style={{ width: 44 }} />
                </View>
                <Text style={styles.headerSub}>Votre sécurité est notre priorité. Nos médiateurs interviennent sous 24h.</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.summaryBox}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{disputes.filter(d => d.status !== "resolved").length}</Text>
                        <Text style={styles.summaryLabel}>En cours</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{disputes.filter(d => d.status === "resolved").length}</Text>
                        <Text style={styles.summaryLabel}>Résolus</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Mes Dossiers</Text>
                {disputes.map((dispute) => (
                    <Pressable key={dispute.id} style={styles.disputeCard} onPress={() => Alert.alert("Détails", "Détails du litige bientôt disponibles.")}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dispute.status) + "20" }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>{getStatusLabel(dispute.status)}</Text>
                            </View>
                            <Text style={styles.date}>{dispute.date}</Text>
                        </View>
                        <Text style={styles.missionTitle}>{dispute.missionTitle}</Text>
                        <Text style={styles.artisanName}>Contre: {dispute.artisanName}</Text>
                        <View style={styles.reasonRow}>
                            <Ionicons name="alert-circle" size={14} color={Colors.textMuted} />
                            <Text style={styles.reasonText}>{dispute.reason}</Text>
                        </View>
                        <View style={styles.cardFooter}>
                            <Text style={styles.detailsLink}>Ouvrir le dossier</Text>
                            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                        </View>
                    </Pressable>
                ))}

                <View style={styles.mediationInfo}>
                    <LinearGradient colors={[Colors.primary + "10", Colors.primary + "05"]} style={styles.mediationGrad}>
                        <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.mediationTitle}>Protection Maîtrio</Text>
                            <Text style={styles.mediationText}>
                                Tous vos paiements sont bloqués jusqu'à résolution. En cas de blocage, un médiateur certifié intervient.
                            </Text>
                        </View>
                    </LinearGradient>
                </View>
            </ScrollView>

            <Pressable style={[styles.newDisputeBtn, { bottom: insets.bottom + 20 }]} onPress={() => Alert.alert("Nouveau Litige", "Veuillez sélectionner une mission terminée dans votre historique pour initier un litige.")}>
                <Text style={styles.newDisputeText}>Signaler un nouveau problème</Text>
            </Pressable>
        </View>
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

const styles = StyleSheet.create({
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
