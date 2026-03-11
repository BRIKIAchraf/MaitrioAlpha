import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { router, Redirect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LinearGradient
          colors={["#FAFBFF", "#EFF3FF", "#E8F0FE"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingLogo}>
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.logoGradient}>
            <Ionicons name="home" size={36} color="#FFF" />
          </LinearGradient>
        </View>
        <Text style={styles.loadingText}>Maitrio</Text>
      </View>
    );
  }

  if (user) {
    if (user.role === "client") return <Redirect href="/(client)" />;
    if (user.role === "artisan") return <Redirect href="/(artisan)" />;
    if (user.role === "admin") return <Redirect href="/(admin)" />;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#FAFBFF", "#EFF3FF", "#E8F0FE"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      {/* Header / Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.logoGradient}>
            <Ionicons name="home" size={36} color="#FFF" />
          </LinearGradient>
          <View style={styles.logoAccent}>
            <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={{ flex: 1 }} />
          </View>
        </View>
        <Text style={styles.brandName}>Maitrio</Text>
        <Text style={styles.tagline}>
          Le luxe de la sérénité{"\n"}au service de votre habitat
        </Text>
      </View>

      {/* Feature cards */}
      <View style={styles.featureCards}>
        <FeatureCard icon="shield-checkmark" title="Artisans certifiés" subtitle="Tous vérifiés KYC" />
        <FeatureCard icon="star" title="Trust Score" subtitle="Avis vérifiés" />
        <FeatureCard icon="flash" title="Rapide" subtitle="Réponse en 2h" />
      </View>

      {/* Role selection */}
      <View style={styles.roleSection}>
        <Text style={styles.roleTitle}>Je suis...</Text>

        <RoleCard
          icon="person-circle-outline"
          title="Client"
          subtitle="Je recherche un artisan pour mes travaux"
          onPress={() => router.push({ pathname: "/(auth)/register", params: { role: "client" } })}
          primary
        />
        <RoleCard
          icon="construct-outline"
          title="Artisan"
          subtitle="Je propose mes services professionnels"
          onPress={() => router.push({ pathname: "/(auth)/register", params: { role: "artisan" } })}
        />

        <Pressable
          style={({ pressed }) => [styles.loginLink, pressed && { opacity: 0.7 }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginLinkText}>Déjà un compte ? </Text>
          <Text style={styles.loginLinkBold}>Se connecter</Text>
        </Pressable>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Comptes de démonstration</Text>
          <Text style={styles.demoText}>client@demo.com / artisan@demo.com / admin@demo.com</Text>
          <Text style={styles.demoText}>Mot de passe : demo (min. 4 caractères)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <View style={styles.featureCard}>
      <Ionicons name={icon} size={22} color={Colors.accent} />
      <Text style={styles.featureCardTitle}>{title}</Text>
      <Text style={styles.featureCardSub}>{subtitle}</Text>
    </View>
  );
}

function RoleCard({
  icon, title, subtitle, onPress, primary,
}: {
  icon: any; title: string; subtitle: string; onPress: () => void; primary?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.roleCard,
        primary && styles.roleCardPrimary,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
      onPress={onPress}
    >
      {primary && (
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
      <View style={[styles.roleCardIconBox, primary && styles.roleCardIconBoxPrimary]}>
        <Ionicons name={icon} size={28} color={primary ? Colors.primary : Colors.accent} />
      </View>
      <View style={styles.roleCardText}>
        <Text style={[styles.roleCardTitle, primary && { color: "#FFF" }]}>{title}</Text>
        <Text style={[styles.roleCardSub, primary && { color: "rgba(255,255,255,0.75)" }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={primary ? "rgba(255,255,255,0.6)" : Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingLogo: { marginBottom: 16 },
  loadingText: { fontSize: 24, fontWeight: "700", color: Colors.primary },
  decorCircle1: {
    position: "absolute", width: 300, height: 300, borderRadius: 150,
    backgroundColor: "rgba(201,168,76,0.06)", top: -80, right: -80,
  },
  decorCircle2: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(27,44,78,0.04)", bottom: 200, left: -60,
  },
  header: { alignItems: "center", paddingTop: 20, paddingHorizontal: 24 },
  logoContainer: { position: "relative", marginBottom: 20 },
  logoGradient: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  logoAccent: {
    position: "absolute", bottom: -4, right: -4,
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.background, overflow: "hidden",
  },
  brandName: { fontSize: 36, fontWeight: "800", color: Colors.text, letterSpacing: -0.5 },
  tagline: {
    fontSize: 16, color: Colors.textSecondary,
    textAlign: "center", marginTop: 8, lineHeight: 24,
  },
  featureCards: { flexDirection: "row", gap: 10, paddingHorizontal: 24, marginTop: 32 },
  featureCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 16,
    padding: 14, alignItems: "center", gap: 6,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  featureCardTitle: { fontSize: 11, fontWeight: "600", color: Colors.text, textAlign: "center" },
  featureCardSub: { fontSize: 10, color: Colors.textMuted, textAlign: "center" },
  roleSection: { paddingHorizontal: 24, paddingTop: 28, gap: 12 },
  roleTitle: { fontSize: 18, fontWeight: "600", color: Colors.text, marginBottom: 4 },
  roleCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 18,
    flexDirection: "row", alignItems: "center", gap: 14,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 4,
    borderWidth: 1, borderColor: Colors.border, overflow: "hidden",
  },
  roleCardPrimary: { borderColor: "transparent" },
  roleCardIconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.accentSoft,
    alignItems: "center", justifyContent: "center",
  },
  roleCardIconBoxPrimary: { backgroundColor: "rgba(255,255,255,0.2)" },
  roleCardText: { flex: 1, gap: 3 },
  roleCardTitle: { fontSize: 16, fontWeight: "600", color: Colors.text },
  roleCardSub: { fontSize: 12, color: Colors.textSecondary },
  loginLink: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 16,
  },
  loginLinkText: { fontSize: 14, color: Colors.textSecondary },
  loginLinkBold: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  demoBox: {
    backgroundColor: Colors.infoLight, borderRadius: 12,
    padding: 16, gap: 4, marginTop: 4,
  },
  demoTitle: { fontSize: 12, fontWeight: "600", color: Colors.info },
  demoText: { fontSize: 11, color: Colors.textSecondary },
});
