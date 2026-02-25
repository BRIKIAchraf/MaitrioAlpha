import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const MOCK_WAITING_ARTISANS = [
    { id: "a1", name: "Marc Dupont", specialty: "Plombier", date: "24 Fév 2026", status: "pending_docs" },
    { id: "a2", name: "Sophie Martin", specialty: "Électricienne", date: "24 Fév 2026", status: "pending_kyc" },
    { id: "a3", name: "Jean Moreau", specialty: "Chauffagiste", date: "23 Fév 2026", status: "pending_docs" },
];

export default function ArtisanVerificationScreen() {
    const insets = useSafeAreaInsets();
    const [artisans, setArtisans] = useState(MOCK_WAITING_ARTISANS);

    const approveArtisan = (id: string) => {
        Alert.alert("Approuver", "Confirmer la validation du profil artisan ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Approuver", onPress: () => setArtisans(artisans.filter(a => a.id !== id)) }
        ]);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#1E293B", "#334155"]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerRow}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Vérifications</Text>
                    <View style={{ width: 44 }} />
                </View>
                <Text style={styles.headerSub}>Audit des nouveaux professionnels rejoignant Maîtrio.</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.tabRow}>
                    <Pressable style={[styles.tab, styles.tabActive]}><Text style={styles.tabTextActive}>À vérifier ({artisans.length})</Text></Pressable>
                    <Pressable style={styles.tab}><Text style={styles.tabText}>Rejetés</Text></Pressable>
                    <Pressable style={styles.tab}><Text style={styles.tabText}>Bloqués</Text></Pressable>
                </View>

                {artisans.map((artisan) => (
                    <View key={artisan.id} style={styles.artisanCard}>
                        <View style={styles.cardTop}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={24} color={Colors.textMuted} />
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.name}>{artisan.name}</Text>
                                <Text style={styles.specialty}>{artisan.specialty}</Text>
                                <Text style={styles.date}>Incrit le {artisan.date}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: artisan.status === "pending_kyc" ? Colors.warning + "20" : Colors.info + "20" }]}>
                                <Text style={[styles.statusText, { color: artisan.status === "pending_kyc" ? Colors.warning : Colors.info }]}>
                                    {artisan.status === "pending_kyc" ? "KYC" : "DOCS"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.docList}>
                            <DocItem label="Carte d'Identité" checked={artisan.status !== "pending_kyc"} />
                            <DocItem label="Assurance Décennale" checked={artisan.status === "pending_kyc"} />
                            <DocItem label="Kbis / Extrait Sirene" checked={false} />
                        </View>

                        <View style={styles.actions}>
                            <Pressable style={styles.rejectBtn} onPress={() => { }}>
                                <Text style={styles.rejectText}>Rejeter</Text>
                            </Pressable>
                            <Pressable style={styles.approveBtn} onPress={() => approveArtisan(artisan.id)}>
                                <Text style={styles.approveText}>Approuver le profil</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

function DocItem({ label, checked }: { label: string; checked: boolean }) {
    return (
        <View style={styles.docItem}>
            <Ionicons name={checked ? "checkmark-circle" : "time"} size={14} color={checked ? Colors.success : Colors.textMuted} />
            <Text style={[styles.docLabel, !checked && styles.docLabelPending]}>{label}</Text>
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
    scrollContent: { padding: 20 },
    tabRow: { flexDirection: "row", gap: 10, marginBottom: 25 },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceSecondary },
    tabActive: { backgroundColor: Colors.primary },
    tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
    tabTextActive: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
    artisanCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.borderLight, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 20 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
    info: { flex: 1 },
    name: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
    specialty: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
    date: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontFamily: "Inter_800ExtraBold" },
    docList: { gap: 10, marginBottom: 20, padding: 15, backgroundColor: Colors.surfaceSecondary, borderRadius: 16 },
    docItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    docLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.text },
    docLabelPending: { color: Colors.textMuted, fontWeight: "400" },
    actions: { flexDirection: "row", gap: 12 },
    rejectBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.danger, alignItems: "center" },
    rejectText: { color: Colors.danger, fontSize: 14, fontFamily: "Inter_700Bold" },
    approveBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center" },
    approveText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
});
