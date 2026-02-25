import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const FIXED_PRICES = [
    {
        category: "Plomberie",
        icon: "water-pump",
        items: [
            { id: "p1", name: "Dégorgement domestique", price: "120€", duration: "1h", detail: "Forfait déplacement + 1h MO" },
            { id: "p2", name: "Remplacement de joint", price: "80€", duration: "30min", detail: "Petite fuite robinet" },
            { id: "p3", name: "Réparation chasse d'eau", price: "150€", duration: "1h", detail: "Hors pièces complexes" },
        ]
    },
    {
        category: "Serrurerie",
        icon: "lock",
        items: [
            { id: "s1", name: "Ouverture de porte claquée", price: "90€", duration: "20min", detail: "Tarif jour (8h-20h)" },
            { id: "s2", name: "Remplacement cylindre standard", price: "180€", duration: "45min", detail: "Pièce incluse" },
        ]
    },
    {
        category: "Électricité",
        icon: "flash",
        items: [
            { id: "e1", name: "Recherche de panne", price: "110€", duration: "1h", detail: "Diagnostic complet" },
            { id: "e2", name: "Remplacement prise/interrupteur", price: "85€", duration: "30min", detail: "Hors matériel" },
        ]
    }
];

export default function PriceCatalogScreen() {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState("");

    const filteredPrices = FIXED_PRICES.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    })).filter(cat => cat.items.length > 0);

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, "#1E3A8A"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Transparence Radicale</Text>
                </View>
                <Text style={styles.headerDesc}>Les tarifs Maîtrio sont fixes et sans surprise.</Text>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher une panne..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.badgeBanner}>
                    <MaterialCommunityIcons name="shield-check" size={24} color={Colors.primary} />
                    <View style={styles.badgeTextContainer}>
                        <Text style={styles.badgeTitle}>Assuré par Allianz</Text>
                        <Text style={styles.badgeDesc}>Chaque mission est couverte jusqu'à 1M€.</Text>
                    </View>
                </View>

                {filteredPrices.map((cat, idx) => (
                    <View key={idx} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name={cat.icon as any} size={24} color={Colors.primary} />
                            <Text style={styles.sectionTitle}>{cat.category}</Text>
                        </View>
                        <View style={styles.card}>
                            {cat.items.map((item, i) => (
                                <View key={item.id} style={[styles.item, i === cat.items.length - 1 && styles.lastItem]}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemDetail}>{item.detail} • {item.duration}</Text>
                                    </View>
                                    <View style={styles.priceTag}>
                                        <Text style={styles.priceValue}>{item.price}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.guaranteeCard}>
                    <Ionicons name="time" size={32} color="white" />
                    <Text style={styles.guaranteeTitle}>Garantie Chrono</Text>
                    <Text style={styles.guaranteeDesc}>Retard {">"} 30 min ? Frais de service offerts.</Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 22, fontFamily: "Inter_700Bold", marginLeft: 15 },
    headerDesc: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
    searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 16, paddingHorizontal: 15, height: 50 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: Colors.text },
    content: { flex: 1, padding: 20 },
    badgeBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 15, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: "#E2E8F0" },
    badgeTextContainer: { marginLeft: 12 },
    badgeTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
    badgeDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    section: { marginBottom: 25 },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, paddingLeft: 5 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginLeft: 10 },
    card: { backgroundColor: "white", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    item: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    lastItem: { borderBottomWidth: 0 },
    itemInfo: { flex: 1, paddingRight: 10 },
    itemName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text },
    itemDetail: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
    priceTag: { backgroundColor: "#F0FDF4", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    priceValue: { color: "#16A34A", fontFamily: "Inter_700Bold", fontSize: 16 },
    guaranteeCard: { backgroundColor: Colors.primary, borderRadius: 24, padding: 25, alignItems: "center", justifyContent: "center", marginTop: 10 },
    guaranteeTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 12 },
    guaranteeDesc: { color: "rgba(255,255,255,0.8)", fontSize: 14, textAlign: "center", marginTop: 8 },
});
