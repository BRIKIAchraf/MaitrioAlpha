import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useMissions, MissionCategory } from "@/context/mission-context";
import { calculateDynamicEstimation, EstimationResult } from "@/utils/estimation-engine";
import { BlurView } from "expo-blur";
import { useChat } from "@/context/chat-context";

type Step = 1 | 2 | 3;

const CATEGORIES: { key: MissionCategory; label: string; icon: string; color: string }[] = [
  { key: "debarras", label: "Débarras", icon: "trash", color: "#6B7280" },
  { key: "nettoyage", label: "Nettoyage", icon: "sparkles", color: "#06B6D4" },
  { key: "serrurier", label: "Serrurier", icon: "key", color: "#F59E0B" },
  { key: "plomberie", label: "Plomberie", icon: "water", color: "#3B82F6" },
  { key: "electricite", label: "Électricité", icon: "flash", color: "#FBBF24" },
  { key: "frigoriste", label: "Frigoriste", icon: "snow", color: "#60A5FA" },
  { key: "peinture", label: "Peinture", icon: "color-palette", color: "#EC4899" },
  { key: "menuiserie", label: "Menuiserie", icon: "hammer", color: "#8B5CF6" },
  { key: "jardinage", label: "Jardinage", icon: "leaf", color: "#22C55E" },
  { key: "climatisation", label: "Climatisation", icon: "thermometer", color: "#F97316" },
  { key: "maconnerie", label: "Maçonnerie", icon: "construct", color: "#78350F" },
  { key: "autre", label: "Autre", icon: "build", color: "#14B8A6" },
];

const TIMES = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

export default function NewMissionScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createMission } = useMissions();
  const params = useLocalSearchParams<{ category?: string }>();

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<MissionCategory | "">((params.category as MissionCategory) || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [budget, setBudget] = useState("");
  const [scheduledDate, setScheduledDate] = useState(getTomorrow());
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [estimation, setEstimation] = useState<EstimationResult | null>(null);

  React.useEffect(() => {
    if (category && (title || description)) {
      const result = calculateDynamicEstimation(
        category as MissionCategory,
        title,
        description,
        "normal", // Default urgency for estimation
        scheduledTime,
        scheduledDate
      );
      setEstimation(result);
    }
  }, [category, title, description, scheduledTime, scheduledDate]);

  function getTomorrow() {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
  }

  function handleNext() {
    setError("");
    if (step === 1) {
      if (!category) { setError("Sélectionnez une catégorie"); return; }
      if (!title.trim()) { setError("Entrez un titre pour la mission"); return; }
      if (!description.trim()) { setError("Décrivez votre besoin"); return; }
    }
    if (step === 2) {
      if (!address.trim()) { setError("Entrez l'adresse des travaux"); return; }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => (s + 1) as Step);
  }

  async function handleSubmit() {
    if (!user || !category) return;
    setIsLoading(true);
    try {
      const mission = await createMission({
        clientId: user.id,
        clientName: user.name,
        category: category as MissionCategory,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        scheduledDate,
        scheduledTime,
        photos: [],
        budget: budget ? parseInt(budget, 10) : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismissAll();
      router.push({ pathname: "/mission/[id]", params: { id: mission.id } });
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedCat = CATEGORIES.find((c) => c.key === category);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.container, { paddingTop: insets.top || (Platform.OS === "web" ? 67 : 44) }]}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Nouvelle demande</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.progressItem}>
              <View
                style={[
                  styles.progressDot,
                  s <= step && styles.progressDotActive,
                  s === step && styles.progressDotCurrent,
                ]}
              >
                {s < step ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={[styles.progressNum, s <= step && { color: "#fff" }]}>{s}</Text>
                )}
              </View>
              {s < 3 && (
                <View style={[styles.progressLine, s < step && styles.progressLineActive]} />
              )}
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Quel type de travaux ?</Text>
              <Text style={styles.stepSubtitle}>Sélectionnez une catégorie et décrivez votre besoin</Text>

              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.key}
                    style={[styles.catCard, category === cat.key && styles.catCardActive]}
                    onPress={() => {
                      setCategory(cat.key);
                      Haptics.selectionAsync();
                    }}
                  >
                    {category === cat.key && (
                      <LinearGradient
                        colors={[Colors.primary + "15", Colors.primary + "08"]}
                        style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                      />
                    )}
                    <View
                      style={[styles.catIcon, { backgroundColor: cat.color + "20" }]}
                    >
                      <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                    </View>
                    <Text style={[styles.catLabel, category === cat.key && styles.catLabelActive]}>{cat.label}</Text>
                    {category === cat.key && (
                      <View style={styles.catCheck}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>

              <InputField
                label="Titre de la mission *"
                placeholder="Ex: Fuite robinet cuisine"
                value={title}
                onChangeText={setTitle}
              />
              <TextAreaField
                label="Description détaillée *"
                placeholder="Décrivez le problème, les travaux à effectuer, toute information utile..."
                value={description}
                onChangeText={setDescription}
              />

              {estimation && category && (
                <View style={styles.estimationCard}>
                  <BlurView intensity={Platform.OS === "ios" ? 40 : 100} tint="light" style={styles.estimationBlur}>
                    <LinearGradient
                      colors={["rgba(201,168,76,0.1)", "rgba(255,255,255,0.05)"]}
                      style={styles.estimationGrad}
                    >
                      <View style={styles.estimationHeader}>
                        <View style={styles.aiBadge}>
                          <Ionicons name="sparkles" size={12} color={Colors.accent} />
                          <Text style={styles.aiBadgeText}>CONCIERGE IA</Text>
                        </View>
                        <Text style={styles.estimationTitle}>Estimation instantanée</Text>
                      </View>

                      <View style={styles.estimationGrid}>
                        <View style={styles.estimationItem}>
                          <Ionicons name="cash-outline" size={16} color={Colors.accent} />
                          <View>
                            <Text style={styles.estimationLabel}>Prix estimé</Text>
                            <Text style={styles.estimationValue}>{estimation.minPrice}€ - {estimation.maxPrice}€</Text>
                          </View>
                        </View>
                        <View style={styles.estimationItem}>
                          <Ionicons name="time-outline" size={16} color={Colors.accent} />
                          <View>
                            <Text style={styles.estimationLabel}>Durée prévue</Text>
                            <Text style={styles.estimationValue}>{estimation.duration}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.complexityTrack}>
                        <Text style={styles.complexityLabel}>Complexité: {estimation.complexityScore}/10</Text>
                        <View style={styles.complexityBar}>
                          <View style={[styles.complexityFill, { width: `${estimation.complexityScore * 10}%` as any }]} />
                        </View>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </View>
              )}
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Où et quand ?</Text>
              <Text style={styles.stepSubtitle}>Précisez l'adresse et la disponibilité souhaitée</Text>

              <InputField
                label="Adresse des travaux *"
                placeholder="Ex: 12 Rue de la Paix, Paris 75001"
                value={address}
                onChangeText={setAddress}
                icon="location-outline"
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Budget estimé (optionnel)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="cash-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Montant en €"
                    placeholderTextColor={Colors.textMuted}
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                  />
                  <Text style={styles.currencyLabel}>€</Text>
                </View>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Planification</Text>
              <Text style={styles.stepSubtitle}>Choisissez une date et un créneau horaire</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date souhaitée</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor={Colors.textMuted}
                    value={scheduledDate}
                    onChangeText={setScheduledDate}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Créneau horaire</Text>
                <View style={styles.timesGrid}>
                  {TIMES.map((t) => (
                    <Pressable
                      key={t}
                      style={[styles.timeChip, scheduledTime === t && styles.timeChipActive]}
                      onPress={() => {
                        setScheduledTime(t);
                        Haptics.selectionAsync();
                      }}
                    >
                      {scheduledTime === t && (
                        <LinearGradient
                          colors={[Colors.primary, Colors.primaryLight]}
                          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      )}
                      <Text style={[styles.timeChipText, scheduledTime === t && styles.timeChipTextActive]}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Récapitulatif</Text>
                <SummaryRow icon="construct-outline" label="Catégorie" value={selectedCat?.label || category} />
                <SummaryRow icon="document-text-outline" label="Mission" value={title} />
                <SummaryRow icon="location-outline" label="Adresse" value={address} />
                <SummaryRow icon="calendar-outline" label="Date" value={`${scheduledDate} à ${scheduledTime}`} />
                {budget && <SummaryRow icon="cash-outline" label="Budget" value={`${budget}€`} />}
              </View>
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom || (Platform.OS === "web" ? 34 : 16) }]}>
          {step > 1 && (
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
              onPress={() => {
                setStep((s) => (s - 1) as Step);
                setError("");
              }}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.text} />
              <Text style={styles.backBtnText}>Retour</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.nextBtn,
              step === 1 && { flex: 1 },
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              isLoading && { opacity: 0.7 },
            ]}
            onPress={step === 3 ? handleSubmit : handleNext}
            disabled={isLoading}
          >
            <LinearGradient
              colors={step === 3 ? [Colors.accent, Colors.accentLight] : [Colors.primary, Colors.primaryLight]}
              style={styles.nextBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color={step === 3 ? Colors.primary : "#fff"} />
              ) : (
                <>
                  <Text style={[styles.nextBtnText, step === 3 && { color: Colors.primary }]}>
                    {step === 3 ? "Publier la demande" : "Continuer"}
                  </Text>
                  <Ionicons
                    name={step === 3 ? "paper-plane" : "chevron-forward"}
                    size={18}
                    color={step === 3 ? Colors.primary : "#fff"}
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  icon?: any;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && <Ionicons name={icon} size={18} color={Colors.textMuted} style={styles.inputIcon} />}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

function TextAreaField({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}

function SummaryRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={icon} size={15} color={Colors.textMuted} />
      <Text style={styles.summaryLabel}>{label}:</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: Colors.text },
  progressContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 40, paddingVertical: 16 },
  progressItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  progressDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  progressDotCurrent: { borderColor: Colors.primary },
  progressNum: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  progressLine: { flex: 1, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: Colors.primary },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  stepContent: { gap: 18 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  stepSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: -10 },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCard: {
    width: "30%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    position: "relative",
    overflow: "hidden",
  },
  catCardActive: { borderColor: Colors.primary },
  catIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  catLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textSecondary, textAlign: "center" },
  catLabelActive: { color: Colors.primary },
  catCheck: { position: "absolute", top: 6, right: 6 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  textAreaWrapper: { height: 100, alignItems: "flex-start", paddingVertical: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text },
  textArea: { height: 80, lineHeight: 22 },
  currencyLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  timesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  timeChipActive: { borderColor: "transparent" },
  timeChipText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.text },
  timeChipTextActive: { color: "#FFFFFF" },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text, marginBottom: 4 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary, width: 80 },
  summaryValue: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.danger, flex: 1 },
  bottomBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
  },
  backBtnText: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.text },
  nextBtn: { flex: 2, borderRadius: 14, overflow: "hidden" },
  nextBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  estimationCard: { marginTop: 8, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(201,168,76,0.2)" },
  estimationBlur: { flex: 1 },
  estimationGrad: { padding: 16, gap: 12 },
  estimationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(201,168,76,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  aiBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.accent, letterSpacing: 0.5 },
  estimationTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
  estimationGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  estimationItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.5)", padding: 10, borderRadius: 12 },
  estimationLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  estimationValue: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
  complexityTrack: { gap: 6 },
  complexityLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  complexityBar: { height: 4, backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 2, overflow: "hidden" },
  complexityFill: { height: "100%", backgroundColor: Colors.accent, borderRadius: 2 },
});
