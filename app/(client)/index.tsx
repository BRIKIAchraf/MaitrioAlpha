import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
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

const QUICK_ACTIONS = [
  { key: "serrurier", label: "Serrurier", icon: "key", color: "#F59E0B" },
  { key: "plomberie", label: "Plomberie", icon: "water", color: "#3B82F6" },
  { key: "electricite", label: "Électricité", icon: "flash", color: "#FBBF24" },
  { key: "debarras", label: "Débarras", icon: "trash", color: "#6B7280" },
  { key: "nettoyage", label: "Nettoyage", icon: "sparkles", color: "#06B6D4" },
  { key: "frigoriste", label: "Frigoriste", icon: "snow", color: "#60A5FA" },
];

export default function ClientHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { missions, refreshMissions } = useMissions();

  useEffect(() => {
    if (user) {
      refreshMissions(user.id, user.role);
    }
  }, [user?.id]);

  const activeMissions = missions.filter((m) =>
    ["pending", "accepted", "in_progress", "en_route", "arrived"].includes(m.status)
  );
  const completedCount = missions.filter((m) => ["completed", "validated"].includes(m.status)).length;

  const greeting = getGreeting();

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : 100 }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 16 }]}
      >
        <View style={styles.headerDecor} />
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName} numberOfLines={1}>{user?.name?.split(" ")[0] || "Client"}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.notifBtn, pressed && { opacity: 0.7 }]}
            onPress={() => { }}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>Score Logement</Text>
            <Text style={styles.scoreValue}>{user?.housingScore ?? 72}</Text>
            <ScoreBar score={user?.housingScore ?? 72} />
          </View>
          <View style={styles.scoreRight}>
            <View style={styles.scoreStat}>
              <Text style={styles.scoreStatValue}>{missions.length}</Text>
              <Text style={styles.scoreStatLabel}>Missions</Text>
            </View>
            <View style={styles.scoreStatDivider} />
            <View style={styles.scoreStat}>
              <Text style={styles.scoreStatValue}>{completedCount}</Text>
              <Text style={styles.scoreStatLabel}>Terminées</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.searchEntry}
          onPress={() => router.push("/mission/new")}
        >
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
          <Text style={styles.searchPlaceholder}>Rechercher un artisan (Plombier, Électricien...)</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.body}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.promoSlider}
          contentContainerStyle={styles.promoContent}
        >
          <Pressable onPress={() => router.push("/(client)/scan")}>
            <LinearGradient colors={["#6366F1", "#4F46E5"]} style={styles.promoCard}>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>IA Scan Direct</Text>
                <Text style={styles.promoSub}>Diagnostiquez votre panne en 10s</Text>
              </View>
              <Ionicons name="scan" size={40} color="rgba(255,255,255,0.3)" />
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.push("/(client)/prices")}>
            <LinearGradient colors={[Colors.accent, "#B8860B"]} style={styles.promoCard}>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>Prix Fixes</Text>
                <Text style={styles.promoSub}>Transparence Axa/Allianz</Text>
              </View>
              <Ionicons name="pricetag" size={40} color="rgba(255,255,255,0.3)" />
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.push("/(client)/maintenance")}>
            <LinearGradient colors={["#10B981", "#059669"]} style={styles.promoCard}>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>Sérénité</Text>
                <Text style={styles.promoSub}>Maintenance préventive</Text>
              </View>
              <Ionicons name="shield-checkmark" size={40} color="rgba(255,255,255,0.3)" />
            </LinearGradient>
          </Pressable>
        </ScrollView>
        {!user?.verified && (
          <Pressable
            style={styles.verifyBanner}
            onPress={() => Alert.alert("Vérification", "Un email de confirmation vous a été envoyé à " + user?.email)}
          >
            <View style={styles.verifyIcon}>
              <Ionicons name="mail-unread" size={20} color={Colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyTitle}>Vérifiez votre email</Text>
              <Text style={styles.verifyText}>Sécurisez votre compte pour accéder à toutes les fonctions.</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [styles.newMissionBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/mission/new");
          }}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.accentLight]}
            style={styles.newMissionBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add-circle" size={22} color={Colors.primary} />
            <Text style={styles.newMissionBtnText}>Nouvelle demande</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </LinearGradient>
        </Pressable>

        <SectionHeader title="Catégories" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsRow}
        >
          {QUICK_ACTIONS.map(({ key, ...action }) => (
            <QuickActionBtn
              key={key}
              {...action}
              onPress={() => {
                Haptics.selectionAsync();
                router.push({ pathname: "/mission/new", params: { category: key } });
              }}
            />
          ))}
        </ScrollView>

        {activeMissions.length > 0 && (
          <>
            <SectionHeader title="Missions en cours" actionLabel="Voir tout" onAction={() => router.push("/(client)/missions")} />
            {activeMissions.slice(0, 3).map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onPress={() => router.push({ pathname: "/mission/[id]", params: { id: mission.id } })}
              />
            ))}
          </>
        )}

        {activeMissions.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="home-outline" size={36} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Aucune mission active</Text>
            <Text style={styles.emptySubtitle}>Créez votre première demande pour trouver un artisan qualifié</Text>
          </View>
        )}

        <Pressable
          style={styles.referralBanner}
          onPress={() => router.push("/(client)/referral")}
        >
          <LinearGradient colors={["#6366F1", "#4F46E5"]} style={styles.referralGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={styles.referralInfo}>
              <Text style={styles.referralTitle}>Gagnez 10€ de crédit</Text>
              <Text style={styles.referralDesc}>Partagez Maîtrio avec vos amis</Text>
            </View>
            <Ionicons name="gift" size={30} color="white" />
          </LinearGradient>
        </Pressable>

        <SectionHeader title="Nos engagements" />
        <View style={styles.pledgesGrid}>
          <PledgeCard icon="shield-checkmark" title="Artisans vérifiés" text="100% des artisans passent une vérification d'identité" color={Colors.info} />
          <PledgeCard icon="time" title="Réactivité" text="Réponse garantie en moins de 2 heures" color={Colors.success} />
          <PledgeCard icon="card" title="Paiement sécurisé" text="Votre paiement est protégé jusqu'à validation" color={Colors.accent} />
          <PledgeCard icon="star" title="Satisfaction" text="98% de clients satisfaits de nos artisans" color={Colors.warning} />
        </View>
      </View>
    </ScrollView>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = score / 100;
  const color = score >= 80 ? Colors.success : score >= 60 ? Colors.warning : Colors.danger;
  return (
    <View style={styles.scoreBar}>
      <View style={[styles.scoreBarFill, { width: `${score}%` as any, backgroundColor: color }]} />
    </View>
  );
}

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && (
        <Pressable onPress={onAction} style={({ pressed }) => pressed && { opacity: 0.6 }}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function QuickActionBtn({ label, icon, color, onPress }: { label: string; icon: any; color: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.93); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
    >
      <Animated.View style={[styles.quickAction, animStyle]}>
        <View style={[styles.quickActionIcon, { backgroundColor: color + "18" }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function MissionCard({ mission, onPress }: { mission: any; onPress: () => void }) {
  const statusConfig = getMissionStatusConfig(mission.status);
  return (
    <Pressable
      style={({ pressed }) => [styles.missionCard, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
      onPress={onPress}
    >
      <View style={styles.missionCardRow}>
        <View style={[styles.missionCategoryIcon, { backgroundColor: Colors.accentSoft }]}>
          <Ionicons name={(CATEGORY_ICONS[mission.category] || "build") as any} size={20} color={Colors.accent} />
        </View>
        <View style={styles.missionCardContent}>
          <Text style={styles.missionCardTitle} numberOfLines={1}>{mission.title}</Text>
          <Text style={styles.missionCardSub} numberOfLines={1}>{mission.address}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>
      <View style={styles.missionCardFooter}>
        <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
        <Text style={styles.missionCardDate}>{formatDate(mission.scheduledDate || mission.createdAt)}</Text>
        {(mission.estimatedPrice || mission.finalPrice) && (
          <>
            <View style={styles.dotDivider} />
            <Text style={styles.missionCardBudget}>{mission.finalPrice || (typeof mission.estimatedPrice === 'number' ? mission.estimatedPrice : '')}€</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

function PledgeCard({ icon, title, text, color }: { icon: any; title: string; text: string; color: string }) {
  return (
    <View style={styles.pledgeCard}>
      <View style={[styles.pledgeIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.pledgeTitle}>{title}</Text>
      <Text style={styles.pledgeText}>{text}</Text>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour,";
  if (h < 18) return "Bon après-midi,";
  return "Bonsoir,";
}

function formatDate(d: string) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function getMissionStatusConfig(status: string) {
  switch (status) {
    case "pending": return { label: "En attente", color: Colors.warning, bg: Colors.warningLight };
    case "accepted": return { label: "Accepté", color: Colors.info, bg: Colors.infoLight };
    case "in_progress": return { label: "En cours", color: Colors.primary, bg: Colors.infoLight };
    case "completed": return { label: "Terminé", color: Colors.success, bg: Colors.successLight };
    case "cancelled": return { label: "Annulé", color: Colors.danger, bg: Colors.dangerLight };
    default: return { label: status, color: Colors.textMuted, bg: Colors.surfaceSecondary };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingBottom: 24, position: "relative", overflow: "hidden" },
  headerDecor: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -60,
    right: -60,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  scoreLeft: { flex: 1 },
  scoreLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  scoreValue: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#FFFFFF", lineHeight: 42 },
  scoreBar: { height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, marginTop: 8, overflow: "hidden" },
  scoreBarFill: { height: "100%", borderRadius: 2 },
  scoreRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreStat: { alignItems: "center" },
  scoreStatValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  scoreStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  scoreStatDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  searchEntry: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchPlaceholder: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginLeft: 10,
  },
  promoSlider: { marginTop: 10, marginBottom: 5 },
  promoContent: { gap: 12, paddingRight: 20 },
  promoCard: {
    width: 260,
    height: 100,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoText: { flex: 1 },
  promoTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  promoSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  body: { padding: 20, gap: 4 },
  verifyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warningLight,
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.warning + "30",
  },
  verifyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verifyTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  verifyText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 },
  newMissionBtn: { marginBottom: 8, borderRadius: 18, overflow: "hidden" },
  newMissionBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 18,
  },
  newMissionBtnText: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.primary, marginLeft: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text },
  sectionAction: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.primary },
  quickActionsRow: { gap: 10, paddingVertical: 4 },
  quickAction: { alignItems: "center", gap: 8, width: 72 },
  quickActionIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.text, textAlign: "center" },
  missionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  missionCardRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  missionCategoryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  missionCardContent: { flex: 1 },
  missionCardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  missionCardSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  missionCardFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  missionCardDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  dotDivider: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },
  missionCardBudget: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.accent },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center", maxWidth: 280 },
  pledgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
  pledgeCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  pledgeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pledgeTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  pledgeText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 16 },
  referralBanner: { marginBottom: 20, borderRadius: 20, overflow: "hidden" },
  referralGrad: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
  referralInfo: { flex: 1 },
  referralTitle: { color: "white", fontSize: 16, fontFamily: "Inter_700Bold" },
  referralDesc: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
});
