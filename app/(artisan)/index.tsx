import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useMissions } from "@/context/mission-context";

const { width } = Dimensions.get("window");

const CATEGORY_ICONS: Record<string, string> = {
  debarras: "trash",
  nettoyage: "sparkles",
  serrurier: "key",
  plomberie: "water",
  electricite: "flash",
  frigoriste: "snow",
  peinture: "color-palette",
  menuiserie: "hammer",
  jardinage: "leaf",
  climatisation: "thermometer",
  maconnerie: "construct",
  autre: "build",
};

export default function ArtisanDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getAvailableMissions, getArtisanMissions, refreshMissions } = useMissions();

  useEffect(() => {
    if (user) refreshMissions(user.id, "artisan");
  }, [user?.id]);

  const available = getAvailableMissions();
  const myMissions = user ? getArtisanMissions(user.id) : [];
  const activeMission = myMissions.find((m) => m.status === "in_progress");
  const completedMissions = myMissions.filter((m) => m.status === "completed" || m.status === "validated");
  const completedCount = completedMissions.length;
  const disputeCount = myMissions.filter((m) => m.status === "disputed").length;
  const ratingSum = completedMissions.reduce((sum, m) => sum + (m.rating?.overall || 0), 0);
  const avgRating = completedCount > 0 ? ratingSum / completedCount : 0;

  // Trust Score calculation (Mock logic)
  const trustScore = Math.min(5, 4 + (completedCount * 0.1) - (disputeCount * 0.5));
  const badge = trustScore >= 4.5 ? "Elite" : trustScore >= 4.0 ? "Pro" : "Vérifié";
  const revenue = user?.revenue ?? completedCount * 150;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : 100 }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 16 }]}
      >
        <View style={styles.headerDecor} />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Dashboard Artisan</Text>
            <View style={styles.nameRow}>
              <Text style={styles.artisanName}>{user?.name?.split(" ")[0] || "Artisan"}</Text>
              <View style={[styles.trustBadge, { backgroundColor: badge === "Elite" ? Colors.accent : badge === "Pro" ? Colors.primary : Colors.textMuted }]}>
                <Text style={styles.trustBadgeText}>{badge}</Text>
              </View>
            </View>
          </View>
          <Pressable
            style={[
              styles.kycBadge,
              {
                backgroundColor:
                  user?.kycStatus === "verified"
                    ? "rgba(34, 197, 94, 0.2)"
                    : "rgba(245, 158, 11, 0.2)",
              },
            ]}
          >
            <Ionicons
              name={user?.kycStatus === "verified" ? "shield-checkmark" : "time-outline"}
              size={14}
              color={user?.kycStatus === "verified" ? Colors.success : Colors.warning}
            />
            <Text
              style={[
                styles.kycText,
                { color: user?.kycStatus === "verified" ? Colors.success : Colors.warning },
              ]}
            >
              {user?.kycStatus === "verified" ? "KYC Vérifié" : "En cours"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <Pressable
            style={styles.statPressable}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(artisan)/wallet");
            }}
          >
            <StatCard value={`${revenue}€`} label="Portefeuille" icon="wallet-outline" />
          </Pressable>
          <StatCard value={completedCount.toString()} label="Terminées" icon="checkmark-circle-outline" />
          <Pressable
            style={styles.statPressable}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(artisan)/growth");
            }}
          >
            <StatCard value={`${trustScore}/5`} label="Elite Score" icon="star-outline" gold />
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {activeMission && (
          <Pressable
            style={({ pressed }) => [styles.activeMissionBanner, pressed && { opacity: 0.95 }]}
            onPress={() => router.push({ pathname: "/mission/[id]", params: { id: activeMission.id } })}
          >
            <LinearGradient
              colors={[Colors.success + "20", Colors.success + "10"]}
              style={styles.activeMissionBannerGrad}
            >
              <View style={styles.activeMissionDot} />
              <View style={styles.activeMissionInfo}>
                <Text style={styles.activeMissionLabel}>Mission en cours</Text>
                <Text style={styles.activeMissionTitle}>{activeMission.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.success} />
            </LinearGradient>
          </Pressable>
        )}

        {user?.kycStatus !== "verified" && (
          <Pressable
            style={styles.kycWarningBanner}
            onPress={() => router.push("/(artisan)/kyc")}
          >
            <Ionicons name="alert-circle" size={24} color={Colors.warning} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.kycWarningTitle}>Action Requise : KYC</Text>
              <Text style={styles.kycWarningText}>Veuillez soumettre vos documents pour débloquer les missions.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.warning} />
          </Pressable>
        )}

        <View style={styles.trustSection}>
          <View style={styles.trustSectionHeader}>
            <Text style={styles.sectionTitle}>Trust Score</Text>
            <Text style={styles.trustScoreValue}>{trustScore}</Text>
          </View>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= Math.floor(trustScore) ? "star" : s - 0.5 <= trustScore ? "star-half" : "star-outline"}
                size={20}
                color={Colors.accent}
              />
            ))}
            <Text style={styles.trustRating}>({completedCount} avis)</Text>
          </View>
          <View style={styles.trustProgressBar}>
            <LinearGradient
              colors={[Colors.accent, Colors.accentLight]}
              style={[styles.trustProgressFill, { width: `${(trustScore / 5) * 100}%` as any }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        <View style={styles.proSection}>
          <Text style={styles.sectionTitle}>Maîtrio Academy & Services</Text>
          <View style={styles.proGrid}>
            <ProCard
              title="Academy"
              icon="school-outline"
              color="#6366F1"
              onPress={() => router.push("/(artisan)/academy")}
            />
            <ProCard
              title="Mes Services"
              icon="list-outline"
              color="#3B82F6"
              onPress={() => router.push("/(artisan)/services")}
            />
            <ProCard
              title="Marketplace"
              icon="cart-outline"
              color="#10B981"
              onPress={() => router.push("/(artisan)/marketplace")}
            />
            <ProCard
              title="Disponibilité"
              icon="calendar-outline"
              color="#EF4444"
              onPress={() => router.push("/(artisan)/availability")}
            />
            <ProCard
              title="Mon Portfolio"
              icon="images-outline"
              color="#F59E0B"
              onPress={() => router.push("/(artisan)/portfolio")}
            />
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Missions disponibles ({available.length})</Text>
          <Pressable onPress={() => router.push("/(artisan)/missions")}>
            <Text style={styles.sectionLink}>Voir tout</Text>
          </Pressable>
        </View>

        {available.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={28} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Aucune mission disponible</Text>
          </View>
        ) : (
          available.slice(0, 3).map((mission) => (
            <AvailableMissionCard
              key={mission.id}
              mission={mission}
              onPress={() => router.push({ pathname: "/mission/[id]", params: { id: mission.id } })}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function ProCard({ title, icon, color, onPress }: { title: string; icon: any; color: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.proCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
      onPress={onPress}
    >
      <View style={[styles.proIconBox, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.proCardTitle}>{title}</Text>
    </Pressable>
  );
}

function StatCard({ value, label, icon, gold }: { value: string; label: string; icon: any; gold?: boolean }) {
  return (
    <View style={[styles.statCard, gold && styles.statCardGold]}>
      <View style={[styles.statCardIcon, gold && styles.statCardIconGold]}>
        <Ionicons name={icon} size={18} color={gold ? Colors.primary : "rgba(255,255,255,0.8)"} />
      </View>
      <Text style={[styles.statCardValue, gold && styles.statCardValueGold]}>{value}</Text>
      <Text style={[styles.statCardLabel, gold && styles.statCardLabelGold]}>{label}</Text>
    </View>
  );
}

function AvailableMissionCard({ mission, onPress }: { mission: any; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.missionCard, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
      onPress={onPress}
    >
      <View style={styles.missionCardHeader}>
        <View style={styles.missionCatIcon}>
          <Ionicons name={(CATEGORY_ICONS[mission.category] || "build") as any} size={20} color={Colors.accent} />
        </View>
        <View style={styles.missionCardInfo}>
          <Text style={styles.missionCardTitle}>{mission.title}</Text>
          <Text style={styles.missionCardClient}>{mission.clientName}</Text>
        </View>
        {mission.budget && (
          <View style={styles.budgetBadge}>
            <Text style={styles.budgetText}>{mission.budget}€</Text>
          </View>
        )}
      </View>
      <Text style={styles.missionCardDesc} numberOfLines={2}>{mission.description}</Text>
      <View style={styles.missionCardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.footerText} numberOfLines={1}>{mission.address}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.footerText}>{formatDate(mission.scheduledDate)}</Text>
        </View>
      </View>
      <View style={styles.acceptBtn}>
        <LinearGradient
          colors={[Colors.accent, Colors.accentLight]}
          style={styles.acceptBtnGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.acceptBtnText}>Voir la mission</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </LinearGradient>
      </View>
    </Pressable>
  );
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingBottom: 24, position: "relative", overflow: "hidden" },
  headerDecor: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -60,
    right: -40,
  },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  artisanName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  trustBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  trustBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  kycBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  kycText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 14,
    gap: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statCardGold: { backgroundColor: Colors.accent, borderColor: Colors.accentLight },
  statCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  statCardIconGold: { backgroundColor: "rgba(27,44,78,0.1)" },
  statCardValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  statCardValueGold: { color: Colors.primary },
  statCardLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  statCardLabelGold: { color: Colors.primary },
  body: { padding: 20, gap: 12 },
  activeMissionBanner: { borderRadius: 16, overflow: "hidden" },
  activeMissionBannerGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.success + "40",
  },
  activeMissionDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  activeMissionInfo: { flex: 1 },
  activeMissionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.success },
  activeMissionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  trustSection: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  trustSectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text },
  trustScoreValue: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.accent },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  trustRating: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginLeft: 8 },
  trustProgressBar: { height: 6, backgroundColor: Colors.surfaceSecondary, borderRadius: 3, overflow: "hidden" },
  trustProgressFill: { height: "100%", borderRadius: 3 },
  proSection: { marginTop: 10 },
  proGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 15 },
  proCard: {
    width: (width - 52) / 2,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
  },
  proIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  proCardTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionLink: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.accent },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  missionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  missionCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  missionCatIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  missionCardInfo: { flex: 1 },
  missionCardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  missionCardClient: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  budgetBadge: { backgroundColor: Colors.accentSoft, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  budgetText: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.accent },
  missionCardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  missionCardFooter: { flexDirection: "row", gap: 16 },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, flex: 1 },
  acceptBtn: { borderRadius: 12, overflow: "hidden" },
  acceptBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  acceptBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.primary },
  statPressable: { flex: 1 },
  kycWarningBanner: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.warning + "10", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.warning + "30", marginBottom: 12 },
  kycWarningTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.warning },
  kycWarningText: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
