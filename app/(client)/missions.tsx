import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useMissions, MissionStatus } from "@/context/mission-context";
import { getMissionStatusConfig } from "./index";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "accepted", label: "Acceptées" },
  { key: "in_progress", label: "En cours" },
  { key: "completed", label: "Terminées" },
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

export default function ClientMissionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getMissionsByClient } = useMissions();
  const [filter, setFilter] = useState("all");

  const all = user ? getMissionsByClient(user.id) : [];
  const filtered = filter === "all" ? all : all.filter((m) => m.status === filter);

  return (
    <View style={[styles.container, { paddingTop: insets.top || (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes missions</Text>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/mission/new");
          }}
        >
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.addBtnGrad}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            {filter === f.key && (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 34 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="construct-outline" size={36} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Aucune mission</Text>
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "Vous n'avez pas encore créé de demande"
                : "Aucune mission dans cette catégorie"}
            </Text>
            {filter === "all" && (
              <Pressable
                style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.9 }]}
                onPress={() => router.push("/mission/new")}
              >
                <Text style={styles.createBtnText}>Créer une demande</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filtered.map((mission) => {
            const status = getMissionStatusConfig(mission.status);
            return (
              <Pressable
                key={mission.id}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
                onPress={() => router.push({ pathname: "/mission/[id]", params: { id: mission.id } })}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.catIcon, { backgroundColor: Colors.accentSoft }]}>
                    <Ionicons name={(CATEGORY_ICONS[mission.category] || "build") as any} size={20} color={Colors.accent} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{mission.title}</Text>
                    <Text style={styles.cardCategory}>{mission.category}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>

                <Text style={styles.cardDesc} numberOfLines={2}>{mission.description}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.footerText} numberOfLines={1}>{mission.address}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.footerText}>{formatDate(mission.scheduledDate)}</Text>
                  </View>
                  {mission.budget ? (
                    <View style={styles.footerItem}>
                      <Ionicons name="cash-outline" size={13} color={Colors.accent} />
                      <Text style={[styles.footerText, { color: Colors.accent, fontFamily: "Inter_600SemiBold" }]}>{mission.budget}€</Text>
                    </View>
                  ) : null}
                </View>

                {mission.artisanName && (
                  <View style={styles.artisanRow}>
                    <View style={styles.artisanAvatar}>
                      <Ionicons name="person" size={14} color={Colors.primary} />
                    </View>
                    <Text style={styles.artisanName}>{mission.artisanName}</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  addBtn: { borderRadius: 14, overflow: "hidden" },
  addBtnGrad: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  filtersRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    overflow: "hidden",
  },
  filterChipActive: {},
  filterChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  filterChipTextActive: { color: "#FFFFFF" },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, gap: 12 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center" },
  createBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 14,
  },
  createBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
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
  catIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  cardCategory: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2, textTransform: "capitalize" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  cardFooter: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  artisanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  artisanAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.infoLight,
    alignItems: "center",
    justifyContent: "center",
  },
  artisanName: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.primary },
});
