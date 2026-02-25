import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
    ActivityIndicator,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/query-client";

interface WalletData {
    id: string;
    balance: number;
    currency: string;
    transactions: {
        id: string;
        amount: number;
        type: string;
        description: string;
        createdAt: string;
    }[];
}

export default function ArtisanWalletScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadWallet();
    }, [user?.id]);

    async function loadWallet() {
        try {
            const res = await apiRequest("GET", `/api/wallet/${user?.id}`);
            const data = await res.json();
            setWallet(data);
        } catch (e) {
            console.error("Failed to load wallet:", e);
        }
        setLoading(false);
    }

    const handleInstantPayout = () => {
        if (!wallet || wallet.balance <= 0) return;

        Alert.alert(
            "Instant Payout",
            `Voulez-vous transferer ${wallet.balance.toFixed(2)}EUR immediatement vers votre compte ? (Frais: 0EUR)`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Transferer maintenant",
                    onPress: () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert("Succes", "L'argent a ete envoye vers votre compte bancaire.");
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, "#1E3A8A"]} style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 50 : 0)) + 20 }]}>
                <Text style={styles.headerTitle}>Portefeuille</Text>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Solde disponible</Text>
                    <Text style={styles.balanceAmount}>{wallet?.balance?.toFixed(2) || "0.00"} EUR</Text>
                    <Text style={styles.balanceCurrency}>Devise: {wallet?.currency || "EUR"}</Text>
                </View>

                <Pressable
                    style={({ pressed }) => [styles.payoutBtn, pressed && { opacity: 0.8 }]}
                    onPress={handleInstantPayout}
                >
                    <Ionicons name="flash" size={18} color={Colors.primary} />
                    <Text style={styles.payoutBtnText}>Instant Payout</Text>
                </Pressable>
            </LinearGradient>

            <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={styles.sectionTitle}>Historique des transactions</Text>
                {wallet?.transactions && wallet.transactions.length > 0 ? (
                    wallet.transactions.map((tx) => (
                        <View key={tx.id} style={styles.txCard}>
                            <View style={[styles.txIcon, {
                                backgroundColor: tx.type === "credit" ? Colors.successLight : tx.type === "escrow" ? Colors.warningLight : Colors.dangerLight
                            }]}>
                                <Ionicons
                                    name={tx.type === "credit" ? "arrow-down" : tx.type === "escrow" ? "lock-closed" : "arrow-up"}
                                    size={18}
                                    color={tx.type === "credit" ? Colors.success : tx.type === "escrow" ? Colors.warning : Colors.danger}
                                />
                            </View>
                            <View style={styles.txContent}>
                                <Text style={styles.txTitle} numberOfLines={1}>{tx.description || tx.type}</Text>
                                <Text style={styles.txDate}>
                                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                                </Text>
                            </View>
                            <Text style={[styles.txAmount, {
                                color: tx.type === "credit" ? Colors.success : tx.type === "debit" ? Colors.danger : Colors.warning
                            }]}>
                                {tx.type === "credit" ? "+" : tx.type === "debit" ? "-" : ""}{tx.amount.toFixed(2)}EUR
                            </Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="wallet-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>Aucune transaction</Text>
                        <Text style={styles.emptySubtext}>Vos revenus apparaitront ici apres vos missions</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 24, paddingBottom: 24 },
    headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "white", marginBottom: 20 },
    balanceCard: {
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        marginBottom: 16,
    },
    balanceLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
    balanceAmount: { fontSize: 36, fontFamily: "Inter_700Bold", color: "white", marginTop: 4 },
    balanceCurrency: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 4 },
    payoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        borderRadius: 14,
        paddingVertical: 14,
        gap: 8,
    },
    payoutBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.primary },
    body: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 16 },
    txCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        gap: 12,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 2,
    },
    txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    txContent: { flex: 1 },
    txTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
    txDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
    txAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
    emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
    emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text },
    emptySubtext: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center" },
});
