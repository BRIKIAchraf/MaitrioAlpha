import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useMissions } from "@/context/mission-context";

export default function ArtisanProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { getArtisanMissions } = useMissions();

  const missions = user ? getArtisanMissions(user.id) : [];
  const completedMissions = missions.filter((m) => m.status === "completed");
  const totalRevenue = user?.revenue ?? completedMissions.length * 150;
  const trustScore = user?.trustScore ?? 4.2;

  function handleLogout() {
    Alert.alert("Déconnexion", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : 100 }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 20 }]}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase() || "A"}</Text>
          </View>
          {user?.kycStatus === "verified" && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
            </View>
          )}
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}

        <View style={styles.kycRow}>
          <View
            style={[
              styles.kycChip,
              { backgroundColor: user?.kycStatus === "verified" ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)" },
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
              {user?.kycStatus === "verified" ? "Identité vérifiée" : "Vérification en cours"}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value={missions.length.toString()} label="Missions" />
          <View style={styles.statDiv} />
          <Stat value={completedMissions.length.toString()} label="Terminées" />
          <View style={styles.statDiv} />
          <Stat value={`${totalRevenue}€`} label="Revenus" />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.trustCard}>
          <View style={styles.trustCardHeader}>
            <Text style={styles.trustCardTitle}>Trust Score</Text>
            <View style={styles.trustScorePill}>
              <Ionicons name="star" size={14} color={Colors.primary} />
              <Text style={styles.trustScorePillText}>{trustScore}/5</Text>
            </View>
          </View>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= Math.floor(trustScore) ? "star" : "star-outline"}
                size={22}
                color={Colors.accent}
              />
            ))}
          </View>
          <View style={styles.trustBar}>
            <LinearGradient
              colors={[Colors.accent, Colors.accentLight]}
              style={[styles.trustBarFill, { width: `${(trustScore / 5) * 100}%` as any }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.trustNote}>{completedMissions.length} avis vérifiés</Text>
        </View>

        {user?.kycStatus !== "verified" && (
          <Pressable
            style={({ pressed }) => [styles.kycBanner, pressed && { opacity: 0.9 }]}
            onPress={() => {}}
          >
            <LinearGradient
              colors={[Colors.warning + "20", Colors.warning + "10"]}
              style={styles.kycBannerGrad}
            >
              <Ionicons name="document-text-outline" size={24} color={Colors.warning} />
              <View style={styles.kycBannerText}>
                <Text style={styles.kycBannerTitle}>Complétez votre KYC</Text>
                <Text style={styles.kycBannerSub}>Uploadez vos documents pour commencer à recevoir des missions</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.warning} />
            </LinearGradient>
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Mon compte</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" label="Modifier le profil" />
          <Div />
          <MenuItem icon="document-text-outline" label="Mes documents KYC" />
          <Div />
          <MenuItem icon="card-outline" label="Paiements & virements" />
          <Div />
          <MenuItem icon="notifications-outline" label="Notifications" />
          <Div />
          <MenuItem icon="help-circle-outline" label="Aide & Support" />
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>

        <Text style={styles.version}>Maison Artisan v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label }: { icon: any; label: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]} onPress={() => {}}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={20} color={Colors.accent} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

function Div() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingBottom: 28, alignItems: "center", gap: 4 },
  avatarContainer: { position: "relative", marginBottom: 8 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 30,
    backgroundColor: "rgba(201, 168, 76, 0.3)",
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 34, fontFamily: "Inter_700Bold", color: Colors.accent },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  email: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  phone: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  kycRow: { marginTop: 8 },
  kycChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  kycText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 24,
  },
  stat: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", marginTop: 2 },
  statDiv: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  body: { padding: 20, gap: 12 },
  trustCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  trustCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trustCardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text },
  trustScorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trustScorePillText: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.primary },
  starsRow: { flexDirection: "row", gap: 4 },
  trustBar: { height: 6, backgroundColor: Colors.surfaceSecondary, borderRadius: 3, overflow: "hidden" },
  trustBarFill: { height: "100%", borderRadius: 3 },
  trustNote: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  kycBanner: { borderRadius: 16, overflow: "hidden" },
  kycBannerGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.warning + "30",
  },
  kycBannerText: { flex: 1 },
  kycBannerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  kycBannerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 8 },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 66 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: Colors.dangerLight,
    borderRadius: 16,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.danger },
  version: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center", paddingTop: 8 },
});
