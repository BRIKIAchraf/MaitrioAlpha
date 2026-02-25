import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, FlatList, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useMissions } from "@/context/mission-context";

type TabKey = "all" | "received" | "pending";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getArtisanMissions, getMissionsByClient } = useMissions();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const isArtisan = user?.role === "artisan";
  const missions = isArtisan
    ? user ? getArtisanMissions(user.id) : []
    : user ? getMissionsByClient(user.id) : [];

  const completedMissions = missions.filter((m) => m.status === "completed" || m.status === "validated");
  const totalRevenue = completedMissions.reduce((sum, m) => sum + (m.budget || 0), 0);
  const pendingRevenue = missions.filter((m) => m.status === "completed" && m.payment?.status !== "released").reduce((sum, m) => sum + (m.budget || 0), 0);
  const releasedRevenue = totalRevenue - pendingRevenue;
  const commissionMultiplier = 0.15; // 15% commission
  const totalFees = isArtisan ? totalRevenue * commissionMultiplier : 0;
  const netRevenue = totalRevenue - totalFees;

  const transactions = completedMissions.map((m) => ({
    id: m.id,
    title: m.title,
    amount: m.budget || 0,
    date: m.checkOutTime || m.updatedAt,
    status: m.payment?.status === "released" ? "released" : "pending",
    category: m.category,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = activeTab === "all" ? transactions : transactions.filter((t) => t.status === (activeTab === "received" ? "released" : "pending"));

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
          <Text style={styles.headerTitle}>{isArtisan ? "Portefeuille" : "Paiements"}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{isArtisan ? "Revenus totaux" : "Total depense"}</Text>
          <Text style={styles.balanceValue}>{totalRevenue}EUR</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <View style={[styles.balanceDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.balanceStatText}>{releasedRevenue}EUR {isArtisan ? "recu" : "paye"}</Text>
            </View>
            <View style={styles.balanceStat}>
              <View style={[styles.balanceDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.balanceStatText}>{pendingRevenue}EUR en attente</Text>
            </View>
          </View>
          {isArtisan ? (
            <View style={styles.commissionBox}>
              <Text style={styles.commissionText}>Commission (15%): -{totalFees.toFixed(2)}€</Text>
              <Text style={styles.commissionNet}>Net: {netRevenue.toFixed(2)}€</Text>
            </View>
          ) : (
            <Pressable style={styles.rechargeBtn} onPress={() => Alert.alert("Recharger", "Redirection vers le gateway de paiement...")}>
              <Ionicons name="card-outline" size={16} color={Colors.primary} />
              <Text style={styles.rechargeText}>Recharger le solde</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.tabRow}>
          {(["all", "received", "pending"] as TabKey[]).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === "all" ? "Tout" : tab === "received" ? (isArtisan ? "Recu" : "Paye") : "En attente"}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Aucune transaction</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            scrollEnabled={!!filtered.length}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.transactionCard, pressed && { opacity: 0.95 }]}
                onPress={() => router.push({ pathname: "/mission/[id]", params: { id: item.id } })}
              >
                <View style={[styles.transactionIcon, { backgroundColor: item.status === "released" ? Colors.successLight : Colors.warningLight }]}>
                  <Ionicons
                    name={item.status === "released" ? "checkmark-circle" : "time"}
                    size={20}
                    color={item.status === "released" ? Colors.success : Colors.warning}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[styles.transactionAmountText, { color: item.status === "released" ? Colors.success : Colors.warning }]}>
                    {isArtisan ? "+" : "-"}{item.amount}EUR
                  </Text>
                  <Text style={styles.transactionStatus}>{item.status === "released" ? "Confirme" : "En attente"}</Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerBar: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  balanceCard: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, padding: 20, gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  balanceLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  balanceValue: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  balanceRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  balanceStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  balanceDot: { width: 8, height: 8, borderRadius: 4 },
  balanceStatText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  body: { flex: 1, padding: 20, gap: 16 },
  tabRow: { flexDirection: "row", backgroundColor: Colors.surfaceSecondary, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: Colors.surface, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  tabTextActive: { color: Colors.text, fontFamily: "Inter_600SemiBold" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  transactionCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  transactionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  transactionDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  transactionAmount: { alignItems: "flex-end" },
  transactionAmountText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  transactionStatus: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  commissionBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  commissionText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  commissionNet: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.accent },
  rechargeBtn: { marginTop: 12, backgroundColor: Colors.accent, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  rechargeText: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.primary },
});
