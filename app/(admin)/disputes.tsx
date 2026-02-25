import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const MOCK_DISPUTES = [
    { id: "1", ref: "MS-8291", client: "Marie D.", artisan: "Jean D.", status: "ouvert", severity: "high" },
    { id: "2", ref: "MS-7712", client: "Lucas M.", artisan: "Sophie B.", status: "en cours", severity: "medium" },
    { id: "3", ref: "MS-9010", client: "Emma R.", artisan: "Luc P.", status: "résolu", severity: "low" },
];

export default function DisputeCenter() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Centre de Litiges</Text>
                <Text style={styles.subtitle}>Médiation et résolution de conflits</Text>
            </View>

            <FlatList
                data={MOCK_DISPUTES}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <Pressable style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.severity, { backgroundColor: getSeverityColor(item.severity) }]} />
                            <Text style={styles.ref}>#{item.ref}</Text>
                            <View style={[styles.status, { backgroundColor: item.status === "résolu" ? Colors.successLight : Colors.warningLight }]}>
                                <Text style={[styles.statusText, { color: item.status === "résolu" ? Colors.success : Colors.warning }]}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.participants}>
                            <View style={styles.participant}>
                                <Text style={styles.role}>Client</Text>
                                <Text style={styles.name}>{item.client}</Text>
                            </View>
                            <Ionicons name="swap-horizontal" size={16} color={Colors.textMuted} />
                            <View style={styles.participant}>
                                <Text style={styles.role}>Artisan</Text>
                                <Text style={styles.name}>{item.artisan}</Text>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerAction}>Ouvrir le dossier</Text>
                            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
}

function getSeverityColor(sev: string) {
    switch (sev) {
        case "high": return Colors.danger;
        case "medium": return Colors.warning;
        default: return Colors.info;
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { padding: 20 },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
    subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
    list: { paddingHorizontal: 20, gap: 14 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 3
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
