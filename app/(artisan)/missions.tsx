import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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

const FILTERS = [
  { key: "available", label: "Disponibles" },
  { key: "my", label: "Mes missions" },
];

const CATEGORY_ICONS: Record<string, string> = {
  plomberie: "water",
  electricite: "flash",
  peinture: "color-palette",
  menuiserie: "hammer",
  jardinage: "leaf",
  nettoyage: "sparkles",
  climatisation: "thermometer",
  maconnerie: "construct",
  autre: "build",
};

export default function ArtisanMissionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getAvailableMissions, getArtisanMissions, acceptMission, refreshMissions } = useMissions();
  const [filter, setFilter] = useState("available");

  useEffect(() => {
    if (user) refreshMissions(user.id, "artisan");
  }, [user?.id]);

  const available = getAvailableMissions();
  const my = user ? getArtisanMissions(user.id) : [];
  const list = filter === "available" ? available : my;

  async function handleAccept(missionId: string) {
    if (!user) return;
    Alert.alert("Accepter la mission ?", "Vous vous engagez à réaliser cette mission dans les délais convenus.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Accepter",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await acceptMission(missionId, user.id, user.name);
          setFilter("my");
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top || (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Missions</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{filter === "available" ? available.length : my.length}</Text>
        </View>
      </View>

      <View style={styles.filterToggle}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            {filter === f.key && (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
            <Text style={[styles.filterTabText, filter === f.key && styles.filterTabTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          !list.length && styles.listEmpty,
          { paddingBottom: Platform.OS === "web" ? 34 : 100 },
        ]}
        scrollEnabled={!!list.length}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
            onPress={() => router.push({ pathname: "/mission/[id]", params: { id: item.id } })}
          >
            <View style={styles.cardHeader}>
              <View style={styles.catIconBox}>
                <Ionicons name={(CATEGORY_ICONS[item.category] || "build") as any} size={22} color={Colors.accent} />
              </View>
              <View style={styles.cardHeaderInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardClient}>{item.clientName}</Text>
              </View>
              {item.budget && (
                <View style={styles.budgetBadge}>
                  <Text style={styles.budgetText}>{item.budget}€</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.metaText} numberOfLines={1}>{item.address}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.metaText}>{formatDate(item.scheduledDate)} à {item.scheduledTime}</Text>
              </View>
            </View>

            {filter === "available" ? (
              <Pressable
                style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.9 }]}
                onPress={() => handleAccept(item.id)}
              >
                <LinearGradient
                  colors={[Colors.accent, Colors.accentLight]}
                  style={styles.acceptBtnGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  <Text style={styles.acceptBtnText}>Accepter la mission</Text>
                </LinearGradient>
              </Pressable>
            ) : (
              <View style={styles.statusRow}>
                <StatusBadge status={item.status} />
                <Pressable
                  style={styles.detailBtn}
                  onPress={() => router.push({ pathname: "/mission/[id]", params: { id: item.id } })}
                >
                  <Text style={styles.detailBtnText}>Détails</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                </Pressable>
              </View>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={36} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === "available" ? "Aucune mission disponible" : "Aucune mission acceptée"}
            </Text>
            <Text style={styles.emptyText}>
              {filter === "available"
                ? "De nouvelles missions apparaîtront ici"
                : "Acceptez des missions pour les voir ici"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "En attente", color: Colors.warning, bg: Colors.warningLight },
    accepted: { label: "Accepté", color: Colors.info, bg: Colors.infoLight },
    in_progress: { label: "En cours", color: Colors.primary, bg: Colors.infoLight },
    completed: { label: "Terminé", color: Colors.success, bg: Colors.successLight },
    cancelled: { label: "Annulé", color: Colors.danger, bg: Colors.dangerLight },
  };
  const c = config[status] || config.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  countPill: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2 },
  countText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.primary },
  filterToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 4,
  },
  filterTab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, overflow: "hidden" },
  filterTabActive: {},
  filterTabText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  filterTabTextActive: { color: "#FFFFFF" },
  listContent: { paddingHorizontal: 20, gap: 12 },
  listEmpty: { flex: 1 },
  card: {
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
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  catIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: Colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  cardClient: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 },
  budgetBadge: { backgroundColor: Colors.accentSoft, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  budgetText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.accent },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  cardMeta: { gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, flex: 1 },
  acceptBtn: { borderRadius: 12, overflow: "hidden" },
  acceptBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  acceptBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.primary },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  detailBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.primary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 80 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center", maxWidth: 260 },
});
