import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const NOTIF_TEMPLATES = [
    { id: "1", title: "Alerte Météo (Froid)", body: "Période de gel annoncée. Pensez à isoler vos tuyaux extérieurs !", target: "clients" },
    { id: "2", title: "Mise à jour Maîtrio", body: "Une nouvelle interface est disponible. Redémarrez l'application.", target: "all" },
    { id: "3", title: "Rappel Documents", body: "Certains de vos documents expirent bientôt. Mettez-les à jour.", target: "artisans" },
];

export default function NotificationAdminScreen() {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [target, setTarget] = useState<"all" | "clients" | "artisans">("all");
    const [isSending, setIsSending] = useState(false);

    const sendBlast = () => {
        if (!title || !body) return;
        setIsSending(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(() => {
            setIsSending(false);
            Alert.alert("Succès", `Notification envoyée à ${target === 'all' ? 'tous les utilisateurs' : target}.`);
            setTitle("");
            setBody("");
        }, 1500);
    };

    const useTemplate = (t: any) => {
        setTitle(t.title);
        setBody(t.body);
        setTarget(t.target);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#4F46E5", "#3730A3"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Dispatch Center</Text>
                </View>
                <Text style={styles.headerDesc}>Envoyez des Push, SMS et Emails via Firebase & Twilio.</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Composer une alerte</Text>
                <View style={styles.formCard}>
                    <TextInput
                        style={styles.input}
                        placeholder="Titre de la notification"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Contenu du message..."
                        multiline
                        value={body}
                        onChangeText={setBody}
                    />

                    <View style={styles.targetRow}>
                        <TargetBtn label="Tous" active={target === "all"} onPress={() => setTarget("all")} />
                        <TargetBtn label="Clients" active={target === "clients"} onPress={() => setTarget("clients")} />
                        <TargetBtn label="Artisans" active={target === "artisans"} onPress={() => setTarget("artisans")} />
                    </View>

                    <Pressable
                        style={[styles.sendBtn, isSending && styles.sendBtnDisabled]}
                        onPress={sendBlast}
                        disabled={isSending}
                    >
                        <MaterialCommunityIcons name="send" size={20} color="white" />
                        <Text style={styles.sendBtnText}>{isSending ? "ENVOI..." : "DISPATCHER L'ALERTE"}</Text>
                    </Pressable>
                </View>

                <Text style={styles.sectionTitle}>Modèles Rapides</Text>
                {NOTIF_TEMPLATES.map((t) => (
                    <Pressable key={t.id} style={styles.templateCard} onPress={() => useTemplate(t)}>
                        <View style={styles.templateIcon}>
                            <Ionicons name="bookmark" size={20} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.templateTitle}>{t.title}</Text>
                            <Text style={styles.templateBody} numberOfLines={1}>{t.body}</Text>
                        </View>
                    </Pressable>
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function TargetBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
        <Pressable
            style={[styles.targetBtn, active && styles.targetBtnActive]}
            onPress={onPress}
        >
            <Text style={[styles.targetBtnText, active && styles.targetBtnTextActive]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 30 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    headerDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 15, marginTop: 10 },
    formCard: { backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 25, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    input: { backgroundColor: "#F1F5F9", borderRadius: 12, padding: 15, fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 12 },
    textArea: { height: 100, textAlignVertical: "top" },
    targetRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
    targetBtn: { flex: 1, height: 40, borderRadius: 10, borderWeight: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" },
    targetBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    targetBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
    targetBtnTextActive: { color: "white" },
    sendBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    sendBtnDisabled: { opacity: 0.6 },
    sendBtnText: { color: "white", fontSize: 14, fontFamily: "Inter_800ExtraBold" },
    templateCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 15, borderRadius: 16, marginBottom: 10, gap: 12 },
    templateIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
    templateTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
    templateBody: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
