import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";

type DocStatus = "not_uploaded" | "uploading" | "uploaded" | "verified" | "rejected";

interface KycDocument {
  key: string;
  label: string;
  description: string;
  icon: string;
  status: DocStatus;
}

export default function KycScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [documents, setDocuments] = useState<KycDocument[]>([
    { key: "identity", label: "Piece d'identite", description: "CNI, passeport ou titre de sejour en cours de validite", icon: "card-outline", status: user?.kycStatus === "verified" ? "verified" : "not_uploaded" },
    { key: "insurance", label: "Assurance RC Pro", description: "Attestation d'assurance responsabilite civile professionnelle", icon: "shield-outline", status: user?.kycStatus === "verified" ? "verified" : "not_uploaded" },
    { key: "diploma", label: "Diplome / Certification", description: "Diplome professionnel ou certification de competence", icon: "ribbon-outline", status: user?.kycStatus === "verified" ? "verified" : "not_uploaded" },
    { key: "kbis", label: "Extrait KBIS / SIREN", description: "Document attestant de votre inscription au registre du commerce", icon: "business-outline", status: user?.kycStatus === "verified" ? "verified" : "not_uploaded" },
  ]);
  const [isVerifying, setIsVerifying] = useState(false);

  const uploadedCount = documents.filter((d) => d.status === "uploaded" || d.status === "verified").length;
  const allUploaded = uploadedCount === documents.length;
  const allVerified = documents.every((d) => d.status === "verified");
  const kycProgress = (uploadedCount / documents.length) * 100;

  function handleUpload(key: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDocuments((prev) =>
      prev.map((d) => (d.key === key ? { ...d, status: "uploading" as DocStatus } : d))
    );
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) => (d.key === key ? { ...d, status: "uploaded" as DocStatus } : d))
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  }

  async function handleVerify() {
    if (!allUploaded) {
      Alert.alert("Documents manquants", "Veuillez telecharger tous les documents requis avant de lancer la verification.");
      return;
    }
    setIsVerifying(true);
    setTimeout(async () => {
      setDocuments((prev) => prev.map((d) => ({ ...d, status: "verified" as DocStatus })));
      if (updateUser) {
        await updateUser({ kycStatus: "verified" });
      }
      setIsVerifying(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Verification reussie", "Votre identite a ete verifiee avec succes. Votre profil est maintenant certifie.");
    }, 3000);
  }

  function getStatusConfig(status: DocStatus) {
    switch (status) {
      case "not_uploaded": return { label: "Non telecharge", color: Colors.textMuted, icon: "cloud-upload-outline" };
      case "uploading": return { label: "Envoi...", color: Colors.info, icon: "sync-outline" };
      case "uploaded": return { label: "En attente", color: Colors.warning, icon: "time-outline" };
      case "verified": return { label: "Verifie", color: Colors.success, icon: "checkmark-circle" };
      case "rejected": return { label: "Refuse", color: Colors.danger, icon: "close-circle" };
    }
  }

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
          <Text style={styles.headerTitle}>Verification KYC</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progression</Text>
            <Text style={styles.progressValue}>{uploadedCount}/{documents.length}</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={allVerified ? [Colors.success, Colors.success + "80"] : [Colors.accent, Colors.accentLight]}
              style={[styles.progressFill, { width: `${kycProgress}%` as any }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressStatus}>
            {allVerified ? "Verification complete" : allUploaded ? "Pret pour la verification" : "Documents en attente"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {allVerified && (
          <View style={styles.verifiedBanner}>
            <Ionicons name="shield-checkmark" size={28} color={Colors.success} />
            <View style={styles.verifiedInfo}>
              <Text style={styles.verifiedTitle}>Profil certifie</Text>
              <Text style={styles.verifiedDesc}>Votre identite et vos qualifications ont ete verifiees</Text>
            </View>
          </View>
        )}

        {documents.map((doc) => {
          const sc = getStatusConfig(doc.status);
          return (
            <View key={doc.key} style={styles.docCard}>
              <View style={styles.docHeader}>
                <View style={[styles.docIcon, { backgroundColor: sc.color + "18" }]}>
                  <Ionicons name={doc.icon as any} size={22} color={sc.color} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docLabel}>{doc.label}</Text>
                  <Text style={styles.docDesc}>{doc.description}</Text>
                </View>
              </View>
              <View style={styles.docFooter}>
                <View style={styles.docStatus}>
                  <Ionicons name={sc.icon as any} size={14} color={sc.color} />
                  <Text style={[styles.docStatusText, { color: sc.color }]}>{sc.label}</Text>
                </View>
                {(doc.status === "not_uploaded" || doc.status === "rejected") && (
                  <Pressable
                    style={({ pressed }) => [styles.uploadBtn, pressed && { opacity: 0.8 }]}
                    onPress={() => handleUpload(doc.key)}
                  >
                    <Ionicons name="cloud-upload" size={16} color={Colors.accent} />
                    <Text style={styles.uploadBtnText}>Telecharger</Text>
                  </Pressable>
                )}
                {doc.status === "uploading" && <ActivityIndicator size="small" color={Colors.info} />}
              </View>
            </View>
          );
        })}

        {allUploaded && !allVerified && (
          <Pressable
            style={({ pressed }) => [styles.verifyBtn, pressed && { opacity: 0.9 }]}
            onPress={handleVerify}
            disabled={isVerifying}
          >
            <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={styles.verifyBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {isVerifying ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={22} color={Colors.primary} />
                  <Text style={styles.verifyBtnText}>Lancer la verification</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}

        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.infoText}>
            La verification KYC est obligatoire pour exercer sur la plateforme. Vos documents sont chiffres et stockes en securite.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerBar: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  progressCard: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16, padding: 18, gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  progressValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  progressTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressStatus: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  scrollContent: { padding: 20, gap: 14 },
  verifiedBanner: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: Colors.successLight, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.success + "30" },
  verifiedInfo: { flex: 1 },
  verifiedTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.success },
  verifiedDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  docCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  docHeader: { flexDirection: "row", gap: 12 },
  docIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  docInfo: { flex: 1 },
  docLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  docDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  docFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  docStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  docStatusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  uploadBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.accentSoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  uploadBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.accent },
  verifyBtn: { borderRadius: 16, overflow: "hidden", marginTop: 4 },
  verifyBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
  verifyBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.primary },
  infoSection: { flexDirection: "row", gap: 10, padding: 14, backgroundColor: Colors.surfaceSecondary, borderRadius: 12 },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, lineHeight: 18 },
});
