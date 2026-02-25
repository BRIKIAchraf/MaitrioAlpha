import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();

  const isWeb = Platform.OS === "web";
  const logoOpacity = useSharedValue(isWeb ? 1 : 0);
  const logoScale = useSharedValue(isWeb ? 1 : 0.7);
  const titleOpacity = useSharedValue(isWeb ? 1 : 0);
  const titleTranslate = useSharedValue(isWeb ? 0 : 30);
  const subtitleOpacity = useSharedValue(isWeb ? 1 : 0);
  const cardsOpacity = useSharedValue(isWeb ? 1 : 0);
  const cardsTranslate = useSharedValue(isWeb ? 0 : 40);
  const buttonsOpacity = useSharedValue(isWeb ? 1 : 0);

  useEffect(() => {
    if (isLoading || user || isWeb) return;

    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    logoScale.value = withDelay(200, withSpring(1, { damping: 12 }));
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    titleTranslate.value = withDelay(500, withTiming(0, { duration: 600 }));
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    cardsOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));
    cardsTranslate.value = withDelay(900, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    buttonsOpacity.value = withDelay(1100, withTiming(1, { duration: 600 }));
  }, [isLoading, user]);


  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));
  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: cardsTranslate.value }],
  }));
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  if (isLoading) return null;
  if (user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top || (Platform.OS === "web" ? 67 : 0), paddingBottom: insets.bottom || (Platform.OS === "web" ? 34 : 0) }]}>
      <LinearGradient
        colors={["#FAFBFF", "#EFF3FF", "#E8F0FE"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <View style={styles.header}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            style={styles.logoGradient}
          >
            <Ionicons name="home" size={36} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.logoAccent}>
            <LinearGradient
              colors={[Colors.accent, Colors.accentLight]}
              style={styles.logoAccentGrad}
            />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.brandName, titleStyle]}>Elite Flow</Animated.Text>
        <Animated.Text style={[styles.tagline, subtitleStyle]}>
          Le luxe de la sérénité{"\n"}au service de votre habitat
        </Animated.Text>
      </View>

      <Animated.View style={[styles.featureCards, cardsStyle]}>
        <FeatureCard
          icon="shield-checkmark"
          title="Artisans certifiés"
          subtitle="Tous vérifiés KYC"
        />
        <FeatureCard
          icon="star"
          title="Trust Score"
          subtitle="Avis vérifiés"
        />
        <FeatureCard
          icon="flash"
          title="Rapide"
          subtitle="Réponse en 2h"
        />
      </Animated.View>

      <Animated.View style={[styles.roleSection, buttonsStyle]}>
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
      </Animated.View>
    </View>
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
  icon,
  title,
  subtitle,
  onPress,
  primary,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
  primary?: boolean;
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
        <Text style={[styles.roleCardTitle, primary && styles.roleCardTitlePrimary]}>{title}</Text>
        <Text style={[styles.roleCardSub, primary && styles.roleCardSubPrimary]}>{subtitle}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={primary ? "rgba(255,255,255,0.6)" : Colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  decorCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(201, 168, 76, 0.06)",
    top: -80,
    right: -80,
  },
  decorCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(27, 44, 78, 0.04)",
    bottom: 150,
    left: -60,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoAccent: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.background,
    overflow: "hidden",
  },
  logoAccentGrad: {
    flex: 1,
  },
  brandName: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  featureCards: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    marginTop: 32,
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureCardTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    textAlign: "center",
  },
  featureCardSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
  },
  roleSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 12,
  },
  roleTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 4,
  },
  roleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  roleCardPrimary: {
    borderColor: "transparent",
  },
  roleCardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  roleCardIconBoxPrimary: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  roleCardText: {
    flex: 1,
    gap: 3,
  },
  roleCardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  roleCardTitlePrimary: {
    color: "#FFFFFF",
  },
  roleCardSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  roleCardSubPrimary: {
    color: "rgba(255,255,255,0.7)",
  },
  loginLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loginLinkText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  loginLinkBold: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
});
