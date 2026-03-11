import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth, UserRole } from "@/context/auth-context";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const params = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<UserRole>((params.role as UserRole) || "client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await register({ name: name.trim(), email: email.trim(), password, role, phone });
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'inscription");
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
        <LinearGradient colors={["#FAFBFF", "#EFF3FF"]} style={StyleSheet.absoluteFill} />

        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez la communauté Maitrio</Text>

          {/* Role toggle */}
          <View style={styles.roleToggle}>
            {(["client", "artisan"] as UserRole[]).map((r) => (
              <Pressable
                key={r}
                style={({ pressed }) => [
                  styles.roleBtn,
                  role === r && styles.roleBtnActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setRole(r)}
              >
                <Ionicons
                  name={r === "client" ? "person" : "construct"}
                  size={16}
                  color={role === r ? "#FFF" : Colors.textSecondary}
                />
                <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                  {r === "client" ? "Client" : "Artisan"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {[
              { label: "Nom complet *", icon: "person-outline", value: name, set: setName, placeholder: "Jean Dupont", type: "default" },
              { label: "Email *", icon: "mail-outline", value: email, set: setEmail, placeholder: "jean@email.com", type: "email-address" },
              { label: "Téléphone", icon: "call-outline", value: phone, set: setPhone, placeholder: "+33 6 12 34 56 78", type: "phone-pad" },
            ].map((f) => (
              <View key={f.label} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={f.icon as any} size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={f.value}
                    onChangeText={f.set}
                    keyboardType={f.type as any}
                    autoCapitalize={f.type === "email-address" ? "none" : "words"}
                    autoCorrect={false}
                  />
                </View>
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe *</Text>
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
              style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.9 }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.registerBtnGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.registerBtnText}>Créer mon compte</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.loginLink, pressed && { opacity: 0.7 }]}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text style={styles.loginLinkText}>Déjà un compte ? </Text>
              <Text style={styles.loginLinkBold}>Se connecter</Text>
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
  content: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 24 },
  roleToggle: { flexDirection: "row", gap: 10, marginBottom: 24 },
  roleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
  },
  roleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleBtnText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  roleBtnTextActive: { color: "#FFF" },
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
    borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 52, fontSize: 15, color: Colors.text, paddingVertical: 0 },
  eyeBtn: { padding: 4 },
  registerBtn: { marginTop: 4, borderRadius: 16, overflow: "hidden" },
  registerBtnGrad: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  registerBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  loginLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  loginLinkText: { fontSize: 14, color: Colors.textSecondary },
  loginLinkBold: { fontSize: 14, fontWeight: "600", color: Colors.primary },
});
