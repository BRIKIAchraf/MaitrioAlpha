import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert, FlatList, KeyboardAvoidingView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useMissions } from "@/context/mission-context";
import { useSupport, TicketPriority } from "@/context/support-context";
import * as Linking from "expo-linking";

const CATEGORIES = ["Paiement", "Mission", "Litige", "Compte", "Technique", "Autre"];
const PRIORITIES: { key: TicketPriority; label: string; color: string }[] = [
  { key: "low", label: "Basse", color: Colors.info },
  { key: "medium", label: "Moyenne", color: Colors.warning },
  { key: "high", label: "Haute", color: Colors.danger },
  { key: "urgent", label: "Urgente", color: "#DC2626" },
];

export default function SupportTicketScreen() {
  const insets = useSafeAreaInsets();
  const { ticketId } = useLocalSearchParams<{ ticketId?: string }>();
  const { user } = useAuth();
  const { tickets, createTicket, addResponse } = useSupport();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Autre");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [responseText, setResponseText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const existingTicket = ticketId ? tickets.find((t) => t.id === ticketId) : null;

  async function handleCreate() {
    if (!user || !subject.trim() || !description.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir le sujet et la description.");
      return;
    }
    setIsSending(true);
    await createTicket({
      userId: user.id,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      category,
      photos: [],
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSending(false);
    Alert.alert("Ticket cree", "Notre equipe vous repondra dans les plus brefs delais.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  async function handleSendResponse() {
    if (!user || !responseText.trim() || !existingTicket) return;
    setIsSending(true);
    await addResponse(existingTicket.id, user.id, user.name, responseText.trim());
    setResponseText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSending(false);
  }

  if (existingTicket) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 8 }]}
        >
          <View style={styles.headerBar}>
            <Pressable style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>{existingTicket.subject}</Text>
              <Text style={styles.headerSubtitle}>{existingTicket.category}</Text>
            </View>
          </View>
        </LinearGradient>

        <FlatList
          data={existingTicket.responses}
          keyExtractor={(item) => item.id}
          scrollEnabled={!!existingTicket.responses.length}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.ticketDescription}>
              <Text style={styles.ticketDescLabel}>Description du probleme</Text>
              <Text style={styles.ticketDescText}>{existingTicket.description}</Text>
              <Text style={styles.ticketDescDate}>{new Date(existingTicket.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.isAdmin ? styles.adminBubble : styles.userBubble]}>
              <View style={styles.messageHeader}>
                <Ionicons name={item.isAdmin ? "shield-checkmark" : "person"} size={14} color={item.isAdmin ? Colors.info : Colors.accent} />
                <Text style={styles.messageSender}>{item.senderName}</Text>
              </View>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.messageTime}>
                {new Date(item.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          )}
        />

        <View style={[styles.inputBar, { paddingBottom: insets.bottom || (Platform.OS === "web" ? 34 : 16) }]}>
          <TextInput
            style={styles.responseInput}
            value={responseText}
            onChangeText={setResponseText}
            placeholder="Votre message..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.8 }, !responseText.trim() && { opacity: 0.5 }]}
            onPress={handleSendResponse}
            disabled={!responseText.trim() || isSending}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
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
          <Text style={styles.headerTitle}>Nouveau ticket</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Sujet</Text>
          <TextInput
            style={styles.textInput}
            value={subject}
            onChangeText={setSubject}
            placeholder="Decrivez brievement votre probleme..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Categorie</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Priorite</Text>
          <View style={styles.chipRow}>
            {PRIORITIES.map((p) => (
              <Pressable key={p.key} style={[styles.chip, priority === p.key && { backgroundColor: p.color + "18", borderColor: p.color }]} onPress={() => setPriority(p.key)}>
                <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                <Text style={[styles.chipText, priority === p.key && { color: p.color }]}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={styles.emailSupportBtn}
          onPress={() => {
            Linking.openURL("mailto:support@eliteflow.fr");
          }}
        >
          <Ionicons name="mail-open-outline" size={18} color={Colors.primary} />
          <Text style={styles.emailSupportText}>Contacter par Email direct</Text>
        </Pressable>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Expliquez en detail votre probleme..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9 }, (!subject.trim() || !description.trim()) && { opacity: 0.5 }]}
          onPress={handleCreate}
          disabled={isSending || !subject.trim() || !description.trim()}
        >
          <LinearGradient colors={[Colors.accent, Colors.accentLight]} style={styles.submitBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="paper-plane" size={20} color={Colors.primary} />
            <Text style={styles.submitBtnText}>{isSending ? "Envoi en cours..." : "Envoyer le ticket"}</Text>
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
  headerInfo: { flex: 1 },
  headerSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  formContent: { padding: 20, gap: 20 },
  field: { gap: 8 },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  textInput: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  textArea: { minHeight: 120 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  chipTextActive: { color: Colors.accent },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  submitBtn: { borderRadius: 16, overflow: "hidden" },
  submitBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.primary },
  messagesContent: { padding: 20, gap: 12 },
  ticketDescription: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 8, marginBottom: 8 },
  ticketDescLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  ticketDescText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  ticketDescDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  messageBubble: { borderRadius: 16, padding: 14, gap: 6, maxWidth: "85%" },
  adminBubble: { backgroundColor: Colors.infoLight, alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: Colors.accentSoft, alignSelf: "flex-end", borderBottomRightRadius: 4 },
  messageHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  messageSender: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.text },
  messageText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  messageTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, alignSelf: "flex-end" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight, backgroundColor: Colors.surface },
  responseInput: { flex: 1, backgroundColor: Colors.surfaceSecondary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, maxHeight: 100, borderWidth: 1, borderColor: Colors.border },
  sendBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  emailSupportBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed" },
  emailSupportText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.primary },
});
