import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function ArtisanGrowthScreen() {
    const insets = useSafeAreaInsets();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={["#312E81", "#1E1B4B"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Reputation & Badges</Text>
                </View>
                <View style={styles.bigScoreBox}>
                    <Text style={styles.bigScore}>4.9</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(s => <Ionicons key={s} name="star" size={20} color={Colors.accent} />)}
                    </View>
                    <Text style={styles.scoreSub}>Excellent • Top 5% des artisans</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Vos Badges Maîtrio</Text>
                <View style={styles.badgesGrid}>
                    <BadgeCard icon="flash" label="Ultra-Rapide" desc="Réponse en < 15min" color="#FBBF24" active />
                    <BadgeCard icon="shield-check" label="Expert Vérifié" desc="Diplômes validés" color="#3B82F6" active />
                    <BadgeCard icon="leaf" label="Eco-Artisan" desc="Pionnier recyclage" color="#10B981" active />
                    <BadgeCard icon="heart" label="Chouchou" desc="10 clients fidèles" color="#EF4444" active={false} />
                </View>

                <View style={styles.impactCard}>
                    <Text style={styles.impactTitle}>Impact Social & Environnemental</Text>
                    <View style={styles.impactRow}>
                        <ImpactItem val="85kg" label="Cuivre Recyclé" icon="leaf" color="#10B981" />
                        <ImpactItem val="12" label="Emplois Créés" icon="briefcase" color="#3B82F6" />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Analyse des Avis</Text>
                <View style={styles.reviewsStats}>
                    <ReviewBar label="Compétence" val={5.0} color={Colors.primary} />
                    <ReviewBar label="Ponctualité" val={4.8} color="#FBBF24" />
                    <ReviewBar label="Propreté" val={4.9} color="#10B981" />
                    <ReviewBar label="Communication" val={4.7} color="#6366F1" />
                </View>

                <Pressable style={styles.shareBtn}>
                    <Ionicons name="share-social-outline" size={20} color="white" />
                    <Text style={styles.shareBtnText}>PARTAGER MON PROFIL ELITE</Text>
                </Pressable>

                <View style={{ height: 100 }} />
            </View>
        </ScrollView>
    );
}

function BadgeCard({ icon, label, desc, color, active }: { icon: any; label: string; desc: string; color: string; active: boolean }) {
    return (
        <View style={[styles.badgeCard, !active && styles.badgeLocked]}>
            <View style={[styles.badgeIcon, { backgroundColor: color + (active ? "20" : "10") }]}>
                <MaterialCommunityIcons name={icon} size={30} color={active ? color : Colors.textMuted} />
            </View>
            <Text style={[styles.badgeLabel, !active && { color: Colors.textMuted }]}>{label}</Text>
            <Text style={styles.badgeDesc}>{active ? desc : "Bientôt disponible..."}</Text>
            {!active && <Ionicons name="lock-closed" size={14} color={Colors.textMuted} style={styles.lockIcon} />}
        </View>
    );
}

function ImpactItem({ val, label, icon, color }: { val: string; label: string; icon: any; color: string }) {
    return (
        <View style={styles.impactItem}>
            <View style={[styles.impactIcon, { backgroundColor: color + "15" }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.impactVal}>{val}</Text>
            <Text style={styles.impactLabel}>{label}</Text>
        </View>
    );
}

function ReviewBar({ label, val, color }: { label: string; val: number; color: string }) {
    return (
        <View style={styles.reviewBarRow}>
            <View style={styles.reviewLabels}>
                <Text style={styles.reviewLabel}>{label}</Text>
                <Text style={styles.reviewVal}>{val.toFixed(1)}/5</Text>
            </View>
            <View style={styles.barContainer}>
                <View style={[styles.barFill, { width: `${(val / 5) * 100}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    bigScoreBox: { alignItems: "center" },
    bigScore: { fontSize: 60, fontFamily: "Inter_900Black", color: "white" },
    starsRow: { flexDirection: "row", gap: 5, marginVertical: 10 },
    scoreSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_600SemiBold" },
    content: { flex: 1, padding: 25 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 20 },
    badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 15, marginBottom: 30 },
    badgeCard: { width: (width - 65) / 2, backgroundColor: "white", padding: 16, borderRadius: 24, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, position: "relative" },
    badgeLocked: { opacity: 0.6 },
    badgeIcon: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    badgeLabel: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center" },
    badgeDesc: { fontSize: 11, color: Colors.textMuted, textAlign: "center", marginTop: 4 },
    lockIcon: { position: "absolute", top: 10, right: 10 },
    impactCard: { backgroundColor: "white", borderRadius: 24, padding: 25, marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    impactTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 20 },
    impactRow: { flexDirection: "row", gap: 20 },
    impactItem: { flex: 1, alignItems: "center" },
    impactIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    impactVal: { fontSize: 20, fontFamily: "Inter_800ExtraBold", color: Colors.text },
    impactLabel: { fontSize: 12, color: Colors.textSecondary },
    reviewsStats: { gap: 15, marginBottom: 30 },
    reviewBarRow: { gap: 8 },
    reviewLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    reviewLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
    reviewVal: { fontSize: 12, color: Colors.textMuted },
    barContainer: { height: 6, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 3 },
    shareBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    shareBtnText: { color: "white", fontSize: 14, fontFamily: "Inter_800ExtraBold" },
});
