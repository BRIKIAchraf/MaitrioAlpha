import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { conversations, messages, sendMessage, markAsRead } = useChat();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const conversation = conversations.find((c) => c.id === id);
  const convMessages = (messages[id] || []).slice().reverse();

  useEffect(() => {
    if (id && user) {
      markAsRead(id, user.id);
    }
  }, [id, user]);

  async function handleSend() {
    if (!text.trim() || !user || !id) return;
    const msgText = text.trim();
    setText("");
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(id, user.id, user.name, msgText);
    setIsSending(false);
  }

  if (!conversation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top || (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={styles.headerBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Conversation introuvable</Text>
        </View>
      </View>
    );
  }

  const otherName = user?.role === "client" ? conversation.artisanName : conversation.clientName;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 8 }]}
        >
          <View style={styles.headerBar}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <View style={styles.headerInfo}>
              <View style={styles.headerAvatar}>
                <Ionicons
                  name={user?.role === "client" ? "construct" : "person"}
                  size={18}
                  color={Colors.primary}
                />
              </View>
              <View>
                <Text style={styles.headerName}>{otherName}</Text>
                <Text style={styles.headerMission} numberOfLines={1}>{conversation.missionTitle}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <FlatList
          ref={flatListRef}
          data={convMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: 16 },
          ]}
          inverted
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!convMessages.length}
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.id;
            return <MessageBubble message={item} isMe={isMe} />;
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <View style={styles.emptyChatIcon}>
                <Ionicons name="chatbubbles-outline" size={32} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyChatText}>Commencez la conversation</Text>
              <Text style={styles.emptyChatSub}>Discutez des détails de la mission avec {otherName}</Text>
            </View>
          }
        />

        <View
          style={[
            styles.inputBar,
            { paddingBottom: insets.bottom ? insets.bottom + 4 : Platform.OS === "web" ? 34 : 12 },
          ]}
        >
          <Pressable style={styles.attachBtn} onPress={() => Alert.alert("Photo", "Fonctionnalité d'envoi de photo bientôt disponible.")}>
            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
          </Pressable>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Écrivez un message..."
              placeholderTextColor={Colors.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={1000}
            />
          </View>
          <Pressable style={styles.voiceBtn} onPress={() => Alert.alert("Vocal", "L'envoi de messages vocaux arrive bientôt.")}>
            <Ionicons name="mic-outline" size={24} color={Colors.primary} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              !text.trim() && styles.sendBtnDisabled,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleSend}
            disabled={!text.trim() || isSending}
          >
            <LinearGradient
              colors={text.trim() ? [Colors.primary, Colors.primaryLight] : [Colors.surfaceSecondary, Colors.surfaceSecondary]}
              style={styles.sendBtnGrad}
            >
              <Ionicons
                name="paper-plane"
                size={18}
                color={text.trim() ? "#fff" : Colors.textMuted}
              />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, isMe }: { message: any; isMe: boolean }) {
  return (
    <View style={[styles.bubbleWrapper, isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperOther]}>
      {!isMe && (
        <View style={styles.senderAvatar}>
          <Ionicons name="person" size={12} color={Colors.primary} />
        </View>
      )}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        {isMe ? (
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            style={styles.bubbleMeGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bubbleMeText}>{message.text}</Text>
          </LinearGradient>
        ) : (
          <Text style={styles.bubbleOtherText}>{message.text}</Text>
        )}
      </View>
      <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerBar: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(201,168,76,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  headerMission: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  messagesList: { paddingHorizontal: 16, paddingTop: 16, gap: 4 },
  bubbleWrapper: { marginVertical: 3, maxWidth: "80%" },
  bubbleWrapperMe: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubbleWrapperOther: { alignSelf: "flex-start", alignItems: "flex-start", flexDirection: "row", gap: 8 },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.infoLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  bubble: { borderRadius: 18, overflow: "hidden" },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleOther: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleMeGrad: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomRightRadius: 4 },
  bubbleMeText: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#FFFFFF", lineHeight: 22 },
  bubbleOtherText: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 22 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 3 },
  bubbleTimeMe: { textAlign: "right" },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 60 },
  emptyChatIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyChatText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyChatSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
  },
  messageInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    lineHeight: 22,
  },
  sendBtn: { borderRadius: 20 },
  sendBtnDisabled: {},
  sendBtnGrad: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 16, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  attachBtn: { padding: 10 },
  voiceBtn: { padding: 10 },
});
