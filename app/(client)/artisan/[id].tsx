import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Dimensions,
    Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

interface ArtisanDetail {
    name: string;
    category: string;
    rating: number;
    reviewsCount: number;
    price: number;
    description: string;
    portfolio: string[];
    certifications: string[];
    reviews: { id: string; user: string; rating: number; comment: string; date: string; }[];
    verified: boolean;
}

const MOCK_DETAILS: Record<string, ArtisanDetail> = {
    "1": {
        name: "Ahmed Mansour",
        category: "Plomberie",
        rating: 4.8,
        reviewsCount: 124,
        price: 45,
        description: "Artisan plombier avec 10 ans d'expérience. Spécialiste des installations complexes et du dépannage d'urgence. Disponible 7j/7 pour vos fuites, installations de sanitaires et robinetterie.",
        portfolio: [
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400",
            "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400",
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400",
        ],
        certifications: ["Kbis Vérifié", "Assurance RC Pro", "Diplôme d'État Plomberie"],
        reviews: [
            { id: "r1", user: "Clara D.", rating: 5, comment: "Travail impeccable et très ponctuel. Je recommande vivement Ahmed !", date: "Il y a 2 jours" },
            { id: "r2", user: "Marc P.", rating: 4, comment: "Bonne prestation, un peu cher mais la qualité est là.", date: "Il y a 1 semaine" },
        ],
        verified: true,
    },
    // Default fallback for other IDs
    default: {
        name: "Artisan Elite",
        category: "Multiservices",
        rating: 5.0,
        reviewsCount: 12,
        price: 40,
        description: "Artisan qualifié prêt à vous aider pour tous vos besoins domestiques.",
        portfolio: [
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400",
        ],
        certifications: ["Vérifié par Maîtrio"],
        reviews: [],
        verified: true,
    }
};

export default function ArtisanDetailsScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const artisan = (id && MOCK_DETAILS[id as string]) || MOCK_DETAILS.default;
    const [activeTab, setActiveTab] = useState("portfolio");

    return (
        <View style={styles.container}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <LinearGradient colors={["rgba(27,44,78,0.8)", "transparent"]} style={styles.heroOverlay} />
                    <Image
                        source={{ uri: artisan.portfolio[0] }}
                        style={styles.heroImage}
                    />
                    <Pressable
                        style={[styles.backBtn, { top: insets.top + 10 }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </Pressable>
                </View>

                <View style={styles.content}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarLarge}>
                            <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.avatarInner}>
                                <Text style={styles.avatarText}>{artisan.name.charAt(0)}</Text>
                            </LinearGradient>
                            {artisan.verified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                                </View>
                            )}
                        </View>

                        <View style={styles.headerInfo}>
                            <Text style={styles.name}>{artisan.name}</Text>
                            <Text style={styles.category}>{artisan.category}</Text>
                        </View>

                        <View style={styles.ratingBox}>
                            <Text style={styles.ratingValue}>{artisan.rating}</Text>
                            <Ionicons name="star" size={16} color={Colors.accent} />
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Avis</Text>
                            <Text style={styles.statValue}>{artisan.reviewsCount}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Expérience</Text>
                            <Text style={styles.statValue}>8 ans</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Tarif</Text>
                            <Text style={styles.statValue}>{artisan.price}€/h</Text>
                        </View>
                    </View>

                    <Text style={styles.description}>{artisan.description}</Text>

                    <View style={styles.certSection}>
                        <Text style={styles.sectionTitle}>Certifications & Garanties</Text>
                        <View style={styles.certList}>
                            {artisan.certifications.map((cert: string, i: number) => (
                                <View key={i} style={styles.certTag}>
                                    <Ionicons name="shield-checkmark-outline" size={14} color={Colors.primary} />
                                    <Text style={styles.certText}>{cert}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.tabs}>
                        <Pressable
                            style={[styles.tab, activeTab === "portfolio" && styles.tabActive]}
                            onPress={() => setActiveTab("portfolio")}
                        >
                            <Text style={[styles.tabText, activeTab === "portfolio" && styles.tabTextActive]}>Portfolio</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === "reviews" && styles.tabActive]}
                            onPress={() => setActiveTab("reviews")}
                        >
                            <Text style={[styles.tabText, activeTab === "reviews" && styles.tabTextActive]}>Avis</Text>
                        </Pressable>
                    </View>

                    {activeTab === "portfolio" ? (
                        <View style={styles.portfolioGrid}>
                            {artisan.portfolio.map((img: string, i: number) => (
                                <Image key={i} source={{ uri: img }} style={styles.portfolioImg} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.reviewsList}>
                            {artisan.reviews.length > 0 ? artisan.reviews.map((review: any) => (
                                <View key={review.id} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <Text style={styles.reviewUser}>{review.user}</Text>
                                        <View style={styles.stars}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Ionicons key={s} name="star" size={12} color={s <= review.rating ? Colors.accent : Colors.border} />
                                            ))}
                                        </View>
                                    </View>
                                    <Text style={styles.reviewComment}>{review.comment}</Text>
                                    <Text style={styles.reviewDate}>{review.date}</Text>
                                </View>
                            )) : (
                                <Text style={styles.noReviews}>Aucun avis pour le moment.</Text>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 15 }]}>
                <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>Estimation totale</Text>
                    <Text style={styles.priceValue}>À confirmer</Text>
                </View>
                <Pressable
                    style={styles.bookBtn}
                    onPress={() => router.push({ pathname: "/mission/new", params: { artisanId: id, category: artisan.category } })}
                >
                    <Text style={styles.bookBtnText}>Réserver maintenant</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    hero: { height: 280, position: "relative" },
    heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    backBtn: {
        position: "absolute",
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flex: 1,
        backgroundColor: "#fff",
        marginTop: -30,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
    },
    profileHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    avatarLarge: { position: "relative" },
    avatarInner: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontSize: 32, fontFamily: "Inter_700Bold" },
    verifiedBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#fff", borderRadius: 12 },
    headerInfo: { flex: 1, marginLeft: 20 },
    name: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
    category: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },
    ratingBox: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.accentSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    ratingValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.accent },
    statsRow: {
        flexDirection: "row",
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 20,
        padding: 15,
        marginBottom: 25,
    },
    statItem: { flex: 1, alignItems: "center" },
    statLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
    statValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.primary },
    statDivider: { width: 1, height: "100%", backgroundColor: Colors.border },
    description: { fontSize: 15, lineHeight: 24, color: Colors.textSecondary, marginBottom: 25 },
    certSection: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 15 },
    certList: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    certTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.infoLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
    certText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.primary },
    tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.borderLight, marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
    tabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
    tabText: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textMuted },
    tabTextActive: { color: Colors.primary, fontFamily: "Inter_700Bold" },
    portfolioGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    portfolioImg: { width: (width - 58) / 2, height: 180, borderRadius: 16 },
    reviewsList: { gap: 15 },
    reviewCard: { backgroundColor: Colors.surfaceSecondary, padding: 16, borderRadius: 16 },
    reviewHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    reviewUser: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
    stars: { flexDirection: "row" },
    reviewComment: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
    reviewDate: { fontSize: 12, color: Colors.textMuted, marginTop: 10 },
    noReviews: { textAlign: "center", color: Colors.textMuted, marginTop: 20 },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 20,
    },
    priceInfo: { flex: 1 },
    priceLabel: { fontSize: 12, color: Colors.textMuted },
    priceValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primary, marginTop: 2 },
    bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16 },
    bookBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
