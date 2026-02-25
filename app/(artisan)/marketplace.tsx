import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    TextInput,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const MOCK_ITEMS = [
    { id: "1", title: "Lot de 10 Vannes 1/4", price: 85, condition: "Neuf", type: "stock", image: "water-pump" },
    { id: "2", title: "Perceuse Hilti TE 6-A", price: 210, condition: "Occasion", type: "used", image: "drill" },
    { id: "3", title: "Câble RO2V 3G2.5 (50m)", price: 65, condition: "Neuf", type: "stock", image: "cable-data" },
];

export default function MarketplaceScreen() {
    const insets = useSafeAreaInsets();
    const [tab, setTab] = useState<"buy" | "sell">("buy");

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, "#312E81"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Marketplace & Stock</Text>
                </View>
                <Text style={styles.headerDesc}>Achetez votre matériel au meilleur prix ou revendez vos surplus.</Text>
            </LinearGradient>

            <View style={styles.tabContainer}>
                <Pressable
                    style={[styles.tab, tab === "buy" && styles.activeTab]}
                    onPress={() => setTab("buy")}
                >
                    <Text style={[styles.tabText, tab === "buy" && styles.activeTabText]}>Acheter</Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, tab === "sell" && styles.activeTab]}
                    onPress={() => setTab("sell")}
                >
                    <Text style={[styles.tabText, tab === "sell" && styles.activeTabText]}>Mes Annonces</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={Colors.textMuted} />
                    <TextInput placeholder="Rechercher un outil, matériel..." style={styles.searchInput} />
                </View>

                <View style={styles.promoBanner}>
                    <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.promoGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <View style={styles.promoInfo}>
                            <Text style={styles.promoTitle}>Vente de Matériel d'Occasion</Text>
                            <Text style={styles.promoDesc}>Entre pros Maîtrio. Zéro commission.</Text>
                        </View>
                        <MaterialCommunityIcons name="tools" size={40} color="rgba(255,255,255,0.3)" />
                    </LinearGradient>
                </View>

                <Text style={styles.sectionTitle}>Annonces Récentes</Text>
                {MOCK_ITEMS.map((item) => (
                    <View key={item.id} style={styles.productCard}>
                        <View style={styles.productIconBox}>
                            <MaterialCommunityIcons name={item.image as any} size={30} color={Colors.primary} />
                        </View>
                        <View style={styles.productInfo}>
                            <View style={styles.conditionRow}>
                                <Text style={[styles.conditionTag, { backgroundColor: item.condition === 'Neuf' ? '#ECFDF5' : '#FFFBEB', color: item.condition === 'Neuf' ? '#059669' : '#D97706' }]}>
                                    {item.condition}
                                </Text>
                                <Text style={styles.itemType}>{item.type === 'stock' ? 'Surstock' : 'Matériel'}</Text>
                            </View>
                            <Text style={styles.productTitle}>{item.title}</Text>
                            <Text style={styles.productPrice}>{item.price}€</Text>
                        </View>
                        <Pressable style={styles.buyBtn}>
                            <Text style={styles.buyBtnText}>Voir</Text>
                        </Pressable>
                    </View>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>

            <Pressable style={styles.fab}>
                <Ionicons name="add" size={30} color="white" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 30 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    headerDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
    tabContainer: { flexDirection: "row", backgroundColor: "white", padding: 6, margin: 20, borderRadius: 16, marginTop: -25, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 },
    tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
    activeTab: { backgroundColor: Colors.primary },
    tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
    activeTabText: { color: "white" },
    content: { flex: 1, paddingHorizontal: 20 },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 15, height: 50, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: Colors.borderLight },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
    promoBanner: { marginBottom: 25 },
    promoGrad: { padding: 20, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    promoInfo: { flex: 1 },
    promoTitle: { color: "white", fontSize: 16, fontFamily: "Inter_700Bold" },
    promoDesc: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 15 },
    productCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 16, borderRadius: 24, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    productIconBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    productInfo: { flex: 1, marginLeft: 15 },
    conditionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    conditionTag: { fontSize: 10, fontFamily: "Inter_700Bold", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    itemType: { fontSize: 10, color: Colors.textMuted, fontFamily: "Inter_600SemiBold" },
    productTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
    productPrice: { fontSize: 16, fontFamily: "Inter_800ExtraBold", color: Colors.primary, marginTop: 4 },
    buyBtn: { backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
    buyBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.primary },
    fab: { position: "absolute", bottom: 100, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
});
