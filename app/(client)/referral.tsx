import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Share,
    Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function ReferralScreen() {
    const insets = useSafeAreaInsets();
    const [referralCount, setReferralCount] = useState(3);

    const onShare = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const result = await Share.share({
                message: "Hey ! Utilise Maîtrio pour tes travaux, c'est l'app la plus fiable. Voici mon code parrainage : MAITRIO-PROMO-2024",
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={["#6366F1", "#4F46E5"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Parrainage & Cadeaux</Text>
                </View>
                <View style={styles.heroContent}>
                    <MaterialCommunityIcons name="gift-outline" size={80} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.heroTitle}>Gagnez 10€ par ami</Text>
                    <Text style={styles.heroDesc}>Offrez 10€ à vos amis sur leur première mission et recevez 10€ en crédit Maîtrio.</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.codeCard}>
                    <Text style={styles.codeLabel}>Votre code de parrainage</Text>
                    <Pressable style={styles.codeBox} onPress={onShare}>
                        <Text style={styles.codeText}>MAITRIO-PROMO-2024</Text>
                        <Ionicons name="copy-outline" size={20} color={Colors.primary} />
                    </Pressable>
                    <Pressable style={styles.shareBtn} onPress={onShare}>
                        <Text style={styles.shareBtnText}>INVITER DES AMIS</Text>
                    </Pressable>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>{referralCount}</Text>
                        <Text style={styles.statLabel}>Parrainages</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>30€</Text>
                        <Text style={styles.statLabel}>Gagnés</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Maîtrio Pass • Premium</Text>
                <LinearGradient colors={["#1E293B", "#0F172A"]} style={styles.passCard}>
                    <View style={styles.passHeader}>
                        <View style={styles.passBadge}>
                            <Ionicons name="flash" size={14} color={Colors.accent} />
                            <Text style={styles.passBadgeText}>MEMBRE ELITE</Text>
                        </View>
                        <MaterialCommunityIcons name="integrated-circuit-chip" size={40} color="rgba(255,255,255,0.1)" />
                    </View>
                    <Text style={styles.passUser}>Status : Actif jusqu'au 12/05</Text>
                    <View style={styles.passBenefits}>
                        <BenefitItem icon="timer-outline" text="Interventions prioritaires < 30min" />
                        <BenefitItem icon="cash-outline" text="-15% sur les frais de service" />
                        <BenefitItem icon="shield-checkmark-outline" text="Garantie Maîtrio Gold incluse" />
                    </View>
                    <Pressable style={styles.managePassBtn}>
                        <Text style={styles.managePassText}>Gérer mon abonnement</Text>
                    </Pressable>
                </LinearGradient>

                <View style={{ height: 100 }} />
            </View>
        </ScrollView>
    );
}

function BenefitItem({ icon, text }: { icon: any; text: string }) {
    return (
        <View style={styles.benefitItem}>
            <Ionicons name={icon} size={18} color={Colors.accent} />
            <Text style={styles.benefitText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    heroContent: { alignItems: "center" },
    heroTitle: { color: "white", fontSize: 24, fontFamily: "Inter_800ExtraBold", marginTop: 15 },
    heroDesc: { color: "rgba(255,255,255,0.8)", fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 20, paddingHorizontal: 20 },
    content: { flex: 1, padding: 25 },
    codeCard: { backgroundColor: "white", borderRadius: 30, padding: 25, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, marginTop: -50 },
    codeLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, textAlign: "center" },
    codeBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F1F5F9", padding: 15, borderRadius: 15, marginTop: 15, borderStyle: "dashed", borderWidth: 1, borderColor: Colors.primary },
    codeText: { fontSize: 16, fontFamily: "Inter_800ExtraBold", color: Colors.primary, letterSpacing: 1 },
    shareBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 20 },
    shareBtnText: { color: "white", fontSize: 14, fontFamily: "Inter_800ExtraBold" },
    statsRow: { flexDirection: "row", gap: 15, marginTop: 30, marginBottom: 35 },
    statBox: { flex: 1, backgroundColor: "white", padding: 20, borderRadius: 24, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    statVal: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: Colors.text },
    statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 20 },
    passCard: { padding: 25, borderRadius: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
    passHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
    passBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5 },
    passBadgeText: { color: Colors.accent, fontSize: 11, fontFamily: "Inter_800ExtraBold" },
    passUser: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 20 },
    passBenefits: { gap: 12, marginBottom: 25 },
    benefitItem: { flexDirection: "row", alignItems: "center", gap: 12 },
    benefitText: { color: "white", fontSize: 14, fontFamily: "Inter_500Medium" },
    managePassBtn: { borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderStyle: "dashed" },
    managePassText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
