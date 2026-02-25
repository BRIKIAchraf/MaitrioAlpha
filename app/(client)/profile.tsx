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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useMissions } from "@/context/mission-context";

export default function ClientProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { getMissionsByClient } = useMissions();

  const missions = user ? getMissionsByClient(user.id) : [];
  const completedMissions = missions.filter((m) => m.status === "completed");
  const totalSpent = completedMissions.reduce((acc, m) => acc + (m.budget || 0), 0);

  function handleLogout() {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
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

  const score = user?.housingScore ?? 72;
  const scoreColor = score >= 80 ? Colors.success : score >= 60 ? Colors.warning : Colors.danger;

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={[{ paddingBottom: Platform.OS === "web" ? 34 : 100 }]}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 20 }]}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase() || "C"}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}

        <View style={styles.statsRow}>
          <StatItem value={missions.length.toString()} label="Missions" />
          <View style={styles.statDivider} />
          <StatItem value={completedMissions.length.toString()} label="Terminées" />
          <View style={styles.statDivider} />
          <StatItem value={`${totalSpent}€`} label="Total dépensé" />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.scoreSection}>
          <View style={styles.scoreSectionHeader}>
            <Text style={styles.scoreSectionTitle}>Score Logement</Text>
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor + "20" }]}>
              <Text style={[styles.scoreBadgeText, { color: scoreColor }]}>{score}/100</Text>
            </View>
          </View>
          <View style={styles.scoreBarContainer}>
            <View style={[styles.scoreBarBg]}>
              <LinearGradient
                colors={[scoreColor + "80", scoreColor]}
                style={[styles.scoreBarFill, { width: `${score}%` as any }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
          <Text style={styles.scoreDesc}>
            {score >= 80
              ? "Excellent logement bien entretenu"
              : score >= 60
              ? "Logement en bon état général"
              : "Des travaux d'amélioration sont recommandés"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Mon compte</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" label="Modifier le profil" onPress={() => {}} />
          <MenuDivider />
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => {}} />
          <MenuDivider />
          <MenuItem icon="shield-checkmark-outline" label="Sécurité" onPress={() => {}} />
          <MenuDivider />
          <MenuItem icon="help-circle-outline" label="Aide & Support" onPress={() => {}} />
        </View>

        <Text style={styles.sectionTitle}>Légal</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="document-text-outline" label="Conditions générales" onPress={() => {}} />
          <MenuDivider />
          <MenuItem icon="lock-closed-outline" label="Politique de confidentialité" onPress={() => {}} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>

        <Text style={styles.version}>Maison v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={styles.menuItemIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.menuItemLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

function MenuDivider() {
  return <View style={styles.menuDivider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingBottom: 28, alignItems: "center", gap: 4 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarInitial: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  userEmail: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  userPhone: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
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
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  body: { padding: 20, gap: 12 },
  scoreSection: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  scoreSectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scoreSectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  scoreBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  scoreBarContainer: {},
  scoreBarBg: { height: 8, backgroundColor: Colors.surfaceSecondary, borderRadius: 4, overflow: "hidden" },
  scoreBarFill: { height: "100%", borderRadius: 4 },
  scoreDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
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
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.text },
  menuDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 66 },
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
