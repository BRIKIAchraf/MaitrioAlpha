import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const MOCK_MESSAGES = [
    { id: "1", sender: "Maîtrio Arbitre", text: "Bonjour, je suis votre médiateur. J'ai bien reçu les photos du robinet qui fuit toujours.", time: "10:00", isAdmin: true },
    { id: "2", sender: "Alice M. (Client)", text: "Le raccord n'est pas serré et l'eau coule sous l'évier.", time: "10:05", isAdmin: false },
    { id: "3", sender: "Jean P. (Artisan)", text: "J'ai pourtant testé avant de partir. Je peux repasser ce soir.", time: "10:12", isAdmin: false },
];

export default function DisputeDetailScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState("");

    const sendMessage = () => {
        if (!message) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setMessage("");
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
            <LinearGradient colors={["#991B1B", "#7F1D1D"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Médiation #LIT-{id}</Text>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Arbitre en ligne</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 20 }}>
                <View style={styles.infoBanner}>
                    <Ionicons name="shield-checkmark" size={20} color="#991B1B" />
                    <Text style={styles.infoText}>Conversation tripartie sécurisée. Maîtrio garantit l'impartialité.</Text>
                </View>

                {MOCK_MESSAGES.map((msg) => (
                    <View key={msg.id} style={[styles.messageBubble, msg.isAdmin && styles.adminBubble]}>
                        <Text style={[styles.senderName, msg.isAdmin && styles.adminSender]}>{msg.sender}</Text>
                        <Text style={[styles.messageText, msg.isAdmin && styles.adminText]}>{msg.text}</Text>
                        <Text style={styles.messageTime}>{msg.time}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
                <Pressable style={styles.attachBtn}>
                    <Ionicons name="add" size={24} color={Colors.textMuted} />
                </Pressable>
                <TextInput
                    style={styles.input}
                    placeholder="Écrivez votre message..."
                    value={message}
                    onChangeText={setMessage}
                />
                <Pressable style={styles.sendBtn} onPress={sendMessage}>
                    <Ionicons name="send" size={20} color="white" />
                </Pressable>
            </View>

            <View style={styles.resolutionActions}>
                <Pressable style={styles.suggestBtn}>
                    <Text style={styles.suggestBtnText}>Proposer une solution amiable</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 20 },
    headerRow: { flexDirection: "row", alignItems: "center" },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitleContainer: { marginLeft: 15 },
    headerTitle: { color: "white", fontSize: 18, fontFamily: "Inter_700Bold" },
    statusBadge: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success, marginRight: 6 },
    statusText: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_600SemiBold" },
    chatArea: { flex: 1 },
    infoBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEE2E2", padding: 12, borderRadius: 12, gap: 8, marginBottom: 20 },
    infoText: { flex: 1, fontSize: 11, color: "#991B1B", fontFamily: "Inter_500Medium" },
    messageBubble: { backgroundColor: "white", padding: 15, borderRadius: 18, marginBottom: 15, maxWidth: "85%", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
    adminBubble: { backgroundColor: "#1E293B", alignSelf: "center", maxWidth: "95%" },
    senderName: { fontSize: 11, fontFamily: "Inter_700Bold", color: Colors.textSecondary, marginBottom: 4 },
    adminSender: { color: Colors.accent },
    messageText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
    adminText: { color: "white" },
    messageTime: { fontSize: 10, color: Colors.textMuted, marginTop: 4, textAlign: "right" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 15, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
    attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    input: { flex: 1, marginHorizontal: 12, height: 40, backgroundColor: "#F1F5F9", borderRadius: 20, paddingHorizontal: 15, fontSize: 14 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
    resolutionActions: { padding: 15, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#F1F5F9" },
    suggestBtn: { backgroundColor: "#F9FAFB", height: 50, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed" },
    suggestBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
});
