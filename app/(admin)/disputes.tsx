import React, { useEffect, useState } from "react";
import * as RN from "react-native";
import { FlatList, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";

interface Dispute {
    id: string;
    ref: string;
    clientName?: string;
    artisanName?: string;
    status: string;
    severity: string;
}

export default function DisputeCenter() {
    const insets = useSafeAreaInsets();
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            setIsLoading(true);
            const res = await apiRequest("GET", "/api/admin/disputes"); // Assuming this exists
            const data = await res.json();
            setDisputes(data);
        } catch (error) {
            console.error("Failed to fetch disputes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RN.View style={[styles.container, { paddingTop: insets.top }]}>
            <RN.View style={styles.header}>
                <RN.Text style={styles.title}>Centre de Litiges</RN.Text>
                <RN.Text style={styles.subtitle}>Médiation et résolution de conflits</RN.Text>
            </RN.View>

            <RN.FlatList
                data={disputes}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                onRefresh={fetchDisputes}
                refreshing={isLoading}
                renderItem={({ item }: { item: any }) => (
                    <RN.Pressable style={styles.card}>
                        <RN.View style={styles.cardHeader}>
                            <RN.View style={[styles.severity, { backgroundColor: getSeverityColor(item.severity) }]} />
                            <RN.Text style={styles.ref}>#{item.ref || item.id.slice(0, 8)}</RN.Text>
                            <RN.View style={[styles.status, { backgroundColor: item.status === "résolu" ? Colors.successLight : Colors.warningLight }]}>
                                <RN.Text style={[styles.statusText, { color: item.status === "résolu" ? Colors.success : Colors.warning }]}>
                                    {item.status}
                                </RN.Text>
                            </RN.View>
                        </RN.View>

                        <RN.View style={styles.participants}>
                            <RN.View style={styles.participant}>
                                <RN.Text style={styles.role}>Client</RN.Text>
                                <RN.Text style={styles.name}>{item.clientName || "N/A"}</RN.Text>
                            </RN.View>
                            <Ionicons name="swap-horizontal" size={16} color={Colors.textMuted} />
                            <RN.View style={styles.participant}>
                                <RN.Text style={styles.role}>Artisan</RN.Text>
                                <RN.Text style={styles.name}>{item.artisanName || "N/A"}</RN.Text>
                            </RN.View>
                        </RN.View>

                        <RN.View style={styles.footer}>
                            <RN.Text style={styles.footerAction}>Ouvrir le dossier</RN.Text>
                            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                        </RN.View>
                    </RN.Pressable>
                )}
            />
        </RN.View>
    );
}

function getSeverityColor(sev: string) {
    switch (sev) {
        case "high": return Colors.danger;
        case "medium": return Colors.warning;
        default: return Colors.info;
    }
}

const styles = RN.StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { padding: 20 },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
    subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
    list: { paddingHorizontal: 20, gap: 14 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        ...Platform.select({
            web: {
                boxShadow: `0px 4px 8px ${Colors.shadow}`,
            },
            default: {
                shadowColor: Colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 3
            }
        })
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 15 },
    severity: { width: 4, height: 16, borderRadius: 2 },
    ref: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
    status: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase" },
    participants: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.borderLight,
        marginBottom: 12
    },
    participant: { alignItems: "center", gap: 2 },
    role: { fontSize: 10, color: Colors.textMuted, fontFamily: "Inter_400Regular" },
    name: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
    footer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 },
    footerAction: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.primary }
});
