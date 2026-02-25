import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface QuoteItem {
    id: string;
    label: string;
    price: number;
}

export default function InteractiveQuoteScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState<QuoteItem[]>([
        { id: "1", label: "Déplacement", price: 45 },
        { id: "2", label: "Main d'œuvre (1h)", price: 65 },
    ]);
    const [newItemLabel, setNewItemLabel] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");

    const addItem = () => {
        if (!newItemLabel || !newItemPrice) return;
        setItems([...items, { id: Date.now().toString(), label: newItemLabel, price: parseFloat(newItemPrice) }]);
        setNewItemLabel("");
        setNewItemPrice("");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const removeItem = (itemId: string) => {
        setItems(items.filter(i => i.id !== itemId));
    };

    const total = items.reduce((sum, item) => sum + item.price, 0);
    const commission = total * 0.15; // 15% Maîtrio commission
    const finalAmount = total + commission;

    const sendQuote = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
            "Devis envoyé",
            "Le client a été notifié. Il doit valider le paiement séquestre pour démarrer la mission.",
            [{ text: "OK", onPress: () => router.back() }]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, "#1E3A8A"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Nouveau Devis Interactif</Text>
                </View>
                <Text style={styles.headerDesc}>Mission #{id?.toString().slice(-4).toUpperCase()}</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Éléments du devis</Text>
                </View>

                <View style={styles.quoteCard}>
                    {items.map((item) => (
                        <View key={item.id} style={styles.quoteItem}>
                            <View style={styles.itemMain}>
                                <Text style={styles.itemLabel}>{item.label}</Text>
                                <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
                            </View>
                            <Pressable onPress={() => removeItem(item.id)}>
                                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                            </Pressable>
                        </View>
                    ))}

                    <View style={styles.addItemRow}>
                        <TextInput
                            style={[styles.input, { flex: 2 }]}
                            placeholder="Désignation (ex: Joint 12/17)"
                            value={newItemLabel}
                            onChangeText={setNewItemLabel}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Prix €"
                            value={newItemPrice}
                            keyboardType="numeric"
                            onChangeText={setNewItemPrice}
                        />
                        <Pressable style={styles.addBtn} onPress={addItem}>
                            <Ionicons name="add" size={24} color="white" />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total HT (Artisan)</Text>
                        <Text style={styles.summaryValue}>{total.toFixed(2)}€</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Frais Maîtrio (15%)</Text>
                        <Text style={styles.summaryValue}>{commission.toFixed(2)}€</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total TTC Client</Text>
                        <Text style={styles.totalValue}>{finalAmount.toFixed(2)}€</Text>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={24} color={Colors.primary} />
                    <Text style={styles.infoText}>
                        L'argent sera bloqué par Maîtrio dès validation par le client. Vous serez payé instantanément à la signature.
                    </Text>
                </View>

                <Pressable style={styles.submitBtn} onPress={sendQuote}>
                    <Text style={styles.submitBtnText}>ENVOYER LE DEVIS AU CLIENT</Text>
                </Pressable>

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
    sectionHeader: { marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
    quoteCard: { backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    quoteItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    itemMain: { flex: 1 },
    itemLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
    itemPrice: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    addItemRow: { flexDirection: "row", gap: 10, marginTop: 20 },
    input: { height: 48, backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 15, fontSize: 14, fontFamily: "Inter_400Regular" },
    addBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
    summaryCard: { backgroundColor: "#1E293B", borderRadius: 24, padding: 25, marginBottom: 25 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    summaryLabel: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "Inter_400Regular" },
    summaryValue: { color: "white", fontSize: 16, fontFamily: "Inter_600SemiBold" },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 15 },
    totalLabel: { color: "white", fontSize: 18, fontFamily: "Inter_700Bold" },
    totalValue: { color: Colors.accent, fontSize: 22, fontFamily: "Inter_800ExtraBold" },
    infoBox: { flexDirection: "row", gap: 12, marginBottom: 30 },
    infoText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
    submitBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    submitBtnText: { color: "white", fontSize: 16, fontFamily: "Inter_800ExtraBold", letterSpacing: 1 },
});
