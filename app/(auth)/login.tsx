import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top || 44 }]}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#FAFBFF", "#EFF3FF"]}
          style={StyleSheet.absoluteFill}
        />

        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.logoSmall}>
            <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.logoGrad}>
              <Ionicons name="home" size={24} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Bon retour</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte Maitrio</Text>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.9 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.loginBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginBtnText}>Se connecter</Text>
                )}
              </LinearGradient>
            </Pressable>

            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Comptes de démo :</Text>
              {[
                { email: "client@demo.com", label: "Client" },
                { email: "artisan@demo.com", label: "Artisan" },
                { email: "admin@demo.com", label: "Admin" },
              ].map((acc) => (
                <Pressable
                  key={acc.email}
                  style={({ pressed }) => [styles.demoBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => { setEmail(acc.email); setPassword("demo"); }}
                >
                  <Text style={styles.demoBtnText}>{acc.label}: {acc.email}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [styles.registerLink, pressed && { opacity: 0.7 }]}
              onPress={() => router.replace("/(auth)/register")}
            >
              <Text style={styles.registerLinkText}>Pas encore de compte ? </Text>
              <Text style={styles.registerLinkBold}>S'inscrire</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: { padding: 16, alignSelf: "flex-start" },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },
  logoSmall: { marginBottom: 24, alignSelf: "center" },
  logoGrad: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 28, fontWeight: "800", color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 28 },
  form: { gap: 16 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 12, padding: 14,
  },
  errorText: { fontSize: 13, color: Colors.danger, flex: 1 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: Colors.text },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, height: 52, fontSize: 15,
    color: Colors.text, paddingVertical: 0,
  },
  eyeBtn: { padding: 4 },
  loginBtn: { marginTop: 4, borderRadius: 16, overflow: "hidden" },
  loginBtnGrad: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  loginBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  demoSection: { gap: 6, backgroundColor: Colors.surfaceSecondary, borderRadius: 12, padding: 14 },
  demoTitle: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary, marginBottom: 2 },
  demoBtn: {
    backgroundColor: Colors.surface, borderRadius: 8,
    padding: 10, borderWidth: 1, borderColor: Colors.border,
  },
  demoBtnText: { fontSize: 12, color: Colors.primary },
  registerLink: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 8,
  },
  registerLinkText: { fontSize: 14, color: Colors.textSecondary },
  registerLinkBold: { fontSize: 14, fontWeight: "600", color: Colors.primary },
});
