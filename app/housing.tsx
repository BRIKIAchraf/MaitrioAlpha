import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useMissions } from "@/context/mission-context";

const { width } = Dimensions.get("window");

const SCORE_CATEGORIES = [
  { key: "debarras", label: "Débarras", icon: "trash", score: 85, maxScore: 100, color: "#6B7280" },
  { key: "nettoyage", label: "Nettoyage", icon: "sparkles", score: 92, maxScore: 100, color: "#06B6D4" },
  { key: "serrurier", label: "Serrurier", icon: "key", score: 100, maxScore: 100, color: "#F59E0B" },
  { key: "plomberie", label: "Plomberie", icon: "water", score: 82, maxScore: 100, color: "#3B82F6" },
  { key: "electricite", label: "Électricité", icon: "flash", score: 72, maxScore: 100, color: "#FBBF24" },
  { key: "frigoriste", label: "Frigoriste", icon: "snow", score: 88, maxScore: 100, color: "#60A5FA" },
];

export default function HousingDossierScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getMissionsByClient } = useMissions();

  const missions = user ? getMissionsByClient(user.id) : [];
  const completedMissions = missions.filter((m) => m.status === "completed" || m.status === "validated");
  const overallScore = user?.housingScore ?? 72;
  const scoreColor = overallScore >= 80 ? Colors.success : overallScore >= 60 ? Colors.warning : Colors.danger;
  const scoreLabel = overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Bon" : "A ameliorer";

  return (
    <View style={[styles.container]}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 8 }]}
      >
        <View style={styles.headerBar}>
          <Pressable style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Dossier Logement</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{overallScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={[styles.scoreStatus, { color: scoreColor }]}>{scoreLabel}</Text>
            <Text style={styles.scoreDesc}>Score de sante de votre logement</Text>
          </View>
          <View style={styles.scoreProgressTrack}>
            <LinearGradient
              colors={[scoreColor, scoreColor + "80"]}
              style={[styles.scoreProgressFill, { width: `${overallScore}%` as any }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            <Text style={styles.statValue}>{completedMissions.length}</Text>
            <Text style={styles.statLabel}>Interventions</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="calendar" size={22} color={Colors.info} />
            <Text style={styles.statValue}>{missions.length}</Text>
            <Text style={styles.statLabel}>Total missions</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.accent} />
            <Text style={styles.statValue}>{overallScore >= 80 ? "A" : overallScore >= 60 ? "B" : "C"}</Text>
            <Text style={styles.statLabel}>Classement</Text>
          </View>
        </View>

        <View style={styles.alertsBox}>
          <View style={styles.alertsHeader}>
            <Ionicons name="notifications" size={18} color={Colors.warning} />
            <Text style={styles.alertsTitle}>Alertes Entretien</Text>
          </View>
          <View style={styles.alertItem}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>Révision chaudière recommandée d'ici 30 jours</Text>
          </View>
          <View style={styles.alertItem}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>Curage des gouttières à prévoir (automne)</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Detail par categorie</Text>
        {SCORE_CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + "18" }]}>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat.label}</Text>
                <View style={styles.categoryBar}>
                  <View style={[styles.categoryBarFill, { width: `${cat.score}%` as any, backgroundColor: cat.color }]} />
                </View>
              </View>
              <Text style={[styles.categoryScore, { color: cat.color }]}>{cat.score}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Documents & Factures PDF</Text>
        <View style={styles.docsList}>
          {completedMissions.map((m) => (
            <Pressable key={m.id} style={styles.docItem} onPress={() => Alert.alert("Ouverture", "Génération du PDF de la mission " + m.title)}>
              <View style={styles.docIcon}>
                <Ionicons name="document-text" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>Facture - {m.title}</Text>
                <Text style={styles.docDate}>{new Date(m.checkOutTime || m.updatedAt).toLocaleDateString()}</Text>
              </View>
              <Ionicons name="download-outline" size={18} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recommandations</Text>
        <View style={styles.recommendCard}>
          <View style={[styles.recommendIcon, { backgroundColor: Colors.warningLight }]}>
            <Ionicons name="alert-circle" size={20} color={Colors.warning} />
          </View>
          <View style={styles.recommendInfo}>
            <Text style={styles.recommendTitle}>Menuiserie a reviser</Text>
            <Text style={styles.recommendDesc}>Score de 65/100 - Planifiez une inspection</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.recommendBtn, pressed && { opacity: 0.8 }]} onPress={() => router.push({ pathname: "/mission/new", params: { category: "menuiserie" } })}>
            <Text style={styles.recommendBtnText}>Planifier</Text>
          </Pressable>
        </View>

        <View style={styles.recommendCard}>
          <View style={[styles.recommendIcon, { backgroundColor: Colors.infoLight }]}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
          </View>
          <View style={styles.recommendInfo}>
            <Text style={styles.recommendTitle}>Controle electrique</Text>
            <Text style={styles.recommendDesc}>Derniere inspection il y a 6 mois</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.recommendBtn, pressed && { opacity: 0.8 }]} onPress={() => router.push({ pathname: "/mission/new", params: { category: "electricite" } })}>
            <Text style={styles.recommendBtnText}>Planifier</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.reportBtn, pressed && { opacity: 0.9 }]}
          onPress={() => Alert.alert("Rapport PDF", "Le rapport detaille de votre logement sera genere et telecharge.")}
        >
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.reportBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.reportBtnText}>Telecharger le rapport PDF</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerBar: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  scrollContent: { padding: 20, gap: 16 },
  scoreCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, alignItems: "center", gap: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4 },
  scoreCircle: { flexDirection: "row", alignItems: "baseline" },
  scoreNumber: { fontSize: 48, fontFamily: "Inter_700Bold" },
  scoreMax: { fontSize: 18, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  scoreInfo: { alignItems: "center" },
  scoreStatus: { fontSize: 16, fontFamily: "Inter_700Bold" },
  scoreDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  scoreProgressTrack: { width: "100%", height: 8, backgroundColor: Colors.surfaceSecondary, borderRadius: 4, overflow: "hidden" },
  scoreProgressFill: { height: "100%", borderRadius: 4 },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, alignItems: "center", gap: 6, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text },
  categoryCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  categoryHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  categoryIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  categoryInfo: { flex: 1, gap: 6 },
  categoryName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  categoryBar: { height: 6, backgroundColor: Colors.surfaceSecondary, borderRadius: 3, overflow: "hidden" },
  categoryBarFill: { height: "100%", borderRadius: 3 },
  categoryScore: { fontSize: 18, fontFamily: "Inter_700Bold" },
  alertsBox: { backgroundColor: Colors.warningLight, padding: 16, borderRadius: 18, marginBottom: 8, borderWidth: 1, borderColor: Colors.warning + "30" },
  alertsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  alertsTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.warning },
  alertItem: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  alertDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.warning },
  alertText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text },
  docsList: { gap: 10, paddingBottom: 10 },
  docItem: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, padding: 12, borderRadius: 14, gap: 12, borderWidth: 1, borderColor: Colors.borderLight },
  docIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  docName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  docDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  recommendCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  recommendIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  recommendInfo: { flex: 1 },
  recommendTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  recommendDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  recommendBtn: { backgroundColor: Colors.accentSoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  recommendBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.accent },
  reportBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  reportBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
  reportBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
});
