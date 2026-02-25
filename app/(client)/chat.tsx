import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";

export default function ClientChatScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getConversationsForUser } = useChat();

  const conversations = user ? getConversationsForUser(user.id) : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top || (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {conversations.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{conversations.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.listEmpty,
          { paddingBottom: Platform.OS === "web" ? 34 : 100 },
        ]}
        scrollEnabled={!!conversations.length}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.convCard, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
            onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="construct" size={20} color={Colors.primary} />
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.unreadDot}>
                  <Text style={styles.unreadDotText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.convInfo}>
              <View style={styles.convTop}>
                <Text style={styles.artisanName}>{item.artisanName}</Text>
                {item.lastMessageAt && (
                  <Text style={styles.timeText}>{formatTime(item.lastMessageAt)}</Text>
                )}
              </View>
              <Text style={styles.missionTitle} numberOfLines={1}>{item.missionTitle}</Text>
              {item.lastMessage && (
                <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
              )}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={40} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Aucun message</Text>
            <Text style={styles.emptyText}>
              Vos conversations avec les artisans apparaîtront ici
            </Text>
          </View>
        }
      />
    </View>
  );
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  listContent: { paddingHorizontal: 20, gap: 10 },
  listEmpty: { flex: 1 },
  convCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.infoLight,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  unreadDotText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  convInfo: { flex: 1, gap: 3 },
  convTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  artisanName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  timeText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  missionTitle: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.primary },
  lastMsg: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 80 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center", maxWidth: 260 },
});
