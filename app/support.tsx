import React from "react";
import { View, Text, StyleSheet, Pressable, Platform, FlatList } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useSupport, TicketStatus } from "@/context/support-context";

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string; icon: string }> = {
  open: { label: "Ouvert", color: Colors.warning, bg: Colors.warningLight, icon: "alert-circle" },
  in_progress: { label: "En cours", color: Colors.info, bg: Colors.infoLight, icon: "time" },
  resolved: { label: "Resolu", color: Colors.success, bg: Colors.successLight, icon: "checkmark-circle" },
  closed: { label: "Ferme", color: Colors.textMuted, bg: Colors.surfaceSecondary, icon: "lock-closed" },
};

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getTicketsForUser } = useSupport();

  const tickets = user ? getTicketsForUser(user.id) : [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 8 }]}
      >
        <View style={styles.headerBar}>
          <Pressable style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Support</Text>
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push("/support-ticket")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      {tickets.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="help-buoy-outline" size={40} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Aucun ticket</Text>
          <Text style={styles.emptySubtitle}>Contactez notre equipe en cas de probleme</Text>
          <Pressable
            style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.9 }]}
            onPress={() => router.push("/support-ticket")}
          >
            <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={styles.createBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="add-circle" size={20} color={Colors.primary} />
              <Text style={styles.createBtnText}>Nouveau ticket</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          scrollEnabled={!!tickets.length}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sc = STATUS_CONFIG[item.status];
            return (
              <Pressable
                style={({ pressed }) => [styles.ticketCard, pressed && { opacity: 0.95 }]}
                onPress={() => router.push({ pathname: "/support-ticket", params: { ticketId: item.id } })}
              >
                <View style={styles.ticketHeader}>
                  <View style={[styles.priorityDot, { backgroundColor: item.priority === "urgent" || item.priority === "high" ? Colors.danger : item.priority === "medium" ? Colors.warning : Colors.info }]} />
                  <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon as any} size={12} color={sc.color} />
                    <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                  </View>
                </View>
                <Text style={styles.ticketDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketDate}>{new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</Text>
                  <Text style={styles.ticketCategory}>{item.category}</Text>
                  {item.responses.length > 0 && (
                    <View style={styles.responseCount}>
                      <Ionicons name="chatbubble-outline" size={12} color={Colors.textMuted} />
                      <Text style={styles.responseCountText}>{item.responses.length}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerBar: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center" },
  createBtn: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
  createBtnGrad: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14 },
  createBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.primary },
  listContent: { padding: 20, gap: 12 },
  ticketCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  ticketHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  ticketSubject: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  ticketDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  ticketFooter: { flexDirection: "row", alignItems: "center", gap: 12 },
  ticketDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  ticketCategory: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.accent },
  responseCount: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto" },
  responseCountText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
