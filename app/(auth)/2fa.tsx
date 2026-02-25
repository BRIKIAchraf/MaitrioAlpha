import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

export default function TwoFactorAuthScreen() {
    const insets = useSafeAreaInsets();
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputs = useRef<TextInput[]>([]);

    const handleTextChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const verifyCode = () => {
        const fullCode = code.join("");
        if (fullCode.length === 6) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Succès", "Double authentification activée !");
            router.back();
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Erreur", "Veuillez entrer le code à 6 chiffres.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color={Colors.text} />
                </Pressable>

                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Maîtrio Shield</Text>
                    <Text style={styles.subtitle}>
                        La double authentification (2FA) sécurise votre compte lors des transactions importantes.
                    </Text>
                </View>

                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputs.current[index] = ref as any)}
                            style={styles.codeInput}
                            value={digit}
                            onChangeText={(text) => handleTextChange(text, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                                    inputs.current[index - 1]?.focus();
                                }
                            }}
                        />
                    ))}
                </View>

                <Text style={styles.resendText}>Pas reçu de code ? <Text style={styles.resendLink}>Renvoyer</Text></Text>

                <View style={styles.footer}>
                    <Pressable style={styles.verifyBtn} onPress={verifyCode}>
                        <LinearGradient
                            colors={[Colors.primary, Colors.primaryLight]}
                            style={styles.verifyBtnGrad}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.verifyBtnText}>Vérifier & Activer</Text>
                        </LinearGradient>
                    </Pressable>
                    <Text style={styles.trustInfo}>
                        <Ionicons name="lock-closed" size={12} color={Colors.textMuted} /> Vos données sont chiffrées de bout en bout.
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { flex: 1, paddingHorizontal: 25 },
    backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -10 },
    header: { alignItems: "center", marginTop: 40, gap: 15 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + "10", alignItems: "center", justifyContent: "center" },
    title: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
    subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
    codeContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 50 },
    codeInput: {
        width: 45,
        height: 55,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.border,
        textAlign: "center",
        fontSize: 22,
        fontFamily: "Inter_700Bold",
        color: Colors.primary,
    },
    resendText: { textAlign: "center", marginTop: 30, color: Colors.textMuted, fontSize: 14 },
    resendLink: { color: Colors.primary, fontFamily: "Inter_600SemiBold" },
    footer: { marginTop: "auto", marginBottom: 40, gap: 15 },
    verifyBtn: { borderRadius: 16, overflow: "hidden" },
    verifyBtnGrad: { paddingVertical: 18, alignItems: "center" },
    verifyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
    trustInfo: { textAlign: "center", fontSize: 12, color: Colors.textMuted, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
});
