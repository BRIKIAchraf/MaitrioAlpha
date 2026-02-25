import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

export default function DisputeCenterScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const { data: disputes = [], isLoading } = useQuery({
        queryKey: ["disputes", user?.id],
        queryFn: () => apiRequest(`/disputes?userId=${user?.id}`),
        enabled: !!user?.id,
    });

    const activeCount = disputes.filter((d: any) => d.status !== 'resolved').length;
    const resolvedCount = disputes.filter((d: any) => d.status === 'resolved').length;

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#991B1B", "#7F1D1D"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Centre de Litiges</Text>
                </View>
                <Text style={styles.headerDesc}>Médiation Maîtrio : Un arbitre humain intervient sous 2H.</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{activeCount}</Text>
                        <Text style={styles.statLabel}>En cours</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{resolvedCount}</Text>
                        <Text style={styles.statLabel}>Résolus</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Vos dossiers de médiation</Text>
                {disputes.map((dispute: any) => (
                    <Pressable
                        key={dispute.id}
                        style={styles.disputeCard}
                        onPress={() => router.push(`/dispute/${dispute.id}`)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.statusBadge, { backgroundColor: dispute.status === 'mediation' || dispute.status === 'open' ? '#FEF2F2' : '#F0FDF4' }]}>
                                <Text style={[styles.statusText, { color: dispute.status === 'mediation' || dispute.status === 'open' ? '#991B1B' : '#16A34A' }]}>
                                    {dispute.status === 'mediation' ? 'Médiation' : dispute.status === 'open' ? 'Ouvert' : 'Résolu'}
                                </Text>
                            </View>
                            <Text style={styles.disputeDate}>{new Date(dispute.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</Text>
                        </View>
                        <Text style={styles.missionTitle}>{dispute.reason}</Text>
                        <View style={styles.partyRow}>
                            <Ionicons name="alert-circle-outline" size={14} color={Colors.textMuted} />
                            <Text style={styles.partyText}>Dossier #{dispute.id.slice(0, 8)}</Text>
                        </View>
                        <View style={styles.footer}>
                            <Text style={styles.footerLink}>Voir la conversation d'arbitrage</Text>
                            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                        </View>
                    </Pressable>
                ))}
                {disputes.length === 0 && (
                    <View style={styles.emptyItems}>
                        <Ionicons name="shield-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>Aucun litige en cours.</Text>
                    </View>
                )}

                <View style={styles.helpBox}>
                    <Text style={styles.helpTitle}>Comment ça marche ?</Text>
                    <Text style={styles.helpText}>1. Un expert Maîtrio analyse les photos et les messages.</Text>
                    <Text style={styles.helpText}>2. Une solution amiable (remboursement partiel, reprise) est proposée.</Text>
                    <Text style={styles.helpText}>3. En dernier recours, l'assurance Maîtrio intervient.</Text>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FDF2F2" },
    header: { paddingHorizontal: 25, paddingBottom: 30 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    headerDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
    content: { flex: 1, padding: 20 },
    statsRow: { flexDirection: "row", gap: 15, marginBottom: 25 },
    statBox: { flex: 1, backgroundColor: "white", padding: 15, borderRadius: 20, alignItems: "center" },
    statVal: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: "#991B1B" },
    statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 15 },
    disputeCard: { backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontFamily: "Inter_700Bold" },
    disputeDate: { fontSize: 12, color: Colors.textMuted },
    missionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 8 },
    partyRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 15 },
    partyText: { fontSize: 13, color: Colors.textSecondary },
    footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 12 },
    footerLink: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.primary },
    helpBox: { backgroundColor: "#FEE2E2", padding: 20, borderRadius: 24, marginTop: 10 },
    helpTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#991B1B", marginBottom: 10 },
    helpText: { fontSize: 13, color: "#991B1B", marginBottom: 6, opacity: 0.8 },
    emptyItems: { alignItems: "center", marginTop: 40, opacity: 0.5 },
    emptyText: { color: Colors.textMuted, fontSize: 14, marginTop: 10 },
});
