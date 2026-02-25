import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    Pressable,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const CATEGORIES = [
    { id: "1", name: "Plomberie", icon: "water" },
    { id: "2", name: "Électricité", icon: "flash" },
    { id: "3", name: "Serrurerie", icon: "key" },
    { id: "4", name: "Chauffage", icon: "thermometer" },
    { id: "5", name: "Peinture", icon: "brush" },
    { id: "6", name: "Climatisation", icon: "snow" },
];

const MOCK_ARTISANS = [
    { id: "1", name: "Jean Moreau", category: "Plomberie", rating: 4.9, reviews: 124, price: "€€", distance: "1.2 km", verified: true },
    { id: "2", name: "Marc Durand", category: "Électricité", rating: 4.8, reviews: 89, price: "€€€", distance: "2.5 km", verified: true },
    { id: "3", name: "Sophie Petit", category: "Plomberie", rating: 4.7, reviews: 56, price: "€", distance: "0.8 km", verified: false },
    { id: "4", name: "Luc Simon", category: "Serrurerie", rating: 5.0, reviews: 210, price: "€€€", distance: "3.1 km", verified: true },
];

export default function SearchScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [filterRating, setFilterRating] = useState(0);

    const filteredArtisans = useMemo(() => {
        return MOCK_ARTISANS.filter(artisan => {
            const matchesQuery = artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                artisan.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory ? artisan.category === selectedCategory : true;
            const matchesRating = artisan.rating >= filterRating;
            return matchesQuery && matchesCategory && matchesRating;
        });
    }, [searchQuery, selectedCategory, filterRating]);

    const toggleCategory = (catName: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCategory(selectedCategory === catName ? null : catName);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, "#312E81"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Quoi ? (ex: Plombier, Fuite...)"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat.id}
                            style={[styles.categoryBtn, selectedCategory === cat.name && styles.categoryBtnActive]}
                            onPress={() => toggleCategory(cat.name)}
                        >
                            <Ionicons name={cat.icon as any} size={18} color={selectedCategory === cat.name ? "white" : "rgba(255,255,255,0.7)"} />
                            <Text style={[styles.categoryText, selectedCategory === cat.name && styles.categoryTextActive]}>{cat.name}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </LinearGradient>

            <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>{filteredArtisans.length} artisans trouvés</Text>
                <Pressable style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={20} color={Colors.primary} />
                    <Text style={styles.filterBtnText}>Filtres</Text>
                </Pressable>
            </View>

            <FlatList
                data={filteredArtisans}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() => router.push(`/(client)/artisan/${item.id}`)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={24} color={Colors.textMuted} />
                            </View>
                            <View style={styles.cardInfo}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    {item.verified && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
                                </View>
                                <Text style={styles.category}>{item.category} • {item.distance}</Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={14} color="#F59E0B" />
                                    <Text style={styles.ratingText}>{item.rating} ({item.reviews} avis)</Text>
                                    <Text style={styles.priceText}>{item.price}</Text>
                                </View>
                            </View>
                        </View>
                        <Pressable style={styles.bookBtn}>
                            <Text style={styles.bookBtnText}>Profil Complet</Text>
                        </Pressable>
                    </Pressable>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={60} color={Colors.border} />
                        <Text style={styles.emptyText}>Aucun artisan ne correspond à votre recherche.</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", marginHorizontal: 20, paddingHorizontal: 15, height: 50, borderRadius: 15 },
    searchIcon: { marginRight: 10 },
    input: { flex: 1, color: "white", fontFamily: "Inter_500Medium" },
    categoriesScroll: { marginTop: 20, paddingLeft: 20 },
    categoryBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginRight: 10, gap: 8 },
    categoryBtnActive: { backgroundColor: "rgba(255,255,255,0.3)" },
    categoryText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_600SemiBold" },
    categoryTextActive: { color: "white" },
    resultsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 25, marginTop: 20, marginBottom: 15 },
    resultsTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
    filterBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    filterBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.primary },
    listContent: { padding: 20 },
    card: { backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    cardHeader: { flexDirection: "row", marginBottom: 15 },
    avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    cardInfo: { flex: 1, marginLeft: 15 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    name: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
    category: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
    ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    ratingText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary, marginLeft: 4, marginRight: 10 },
    priceText: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.primary },
    bookBtn: { width: "100%", height: 44, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, alignItems: "center", justifyContent: "center" },
    bookBtnText: { color: Colors.primary, fontSize: 14, fontFamily: "Inter_700Bold" },
    emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 100 },
    emptyText: { marginTop: 20, fontSize: 14, color: Colors.textMuted, textAlign: "center", paddingHorizontal: 50 },
});
