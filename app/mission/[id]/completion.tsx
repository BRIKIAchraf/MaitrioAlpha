import React, { useState, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Alert,
    Dimensions,
    Platform,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useMissions } from "@/context/mission-context";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/query-client";

const { width } = Dimensions.get("window");

export default function MissionCompletionScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { getMission } = useMissions();
    const mission = getMission(id as string);
    const [signed, setSigned] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);

    const setupCanvas = useCallback((node: any) => {
        if (Platform.OS !== "web" || !node) return;
        const canvas = node as HTMLCanvasElement;
        canvasRef.current = canvas;
        canvas.width = Math.min(width - 50, 500);
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "#1E3A5F";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }

        canvas.onmousedown = (e: MouseEvent) => {
            isDrawing.current = true;
            const rect = canvas.getBoundingClientRect();
            ctx?.beginPath();
            ctx?.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        };
        canvas.onmousemove = (e: MouseEvent) => {
            if (!isDrawing.current) return;
            const rect = canvas.getBoundingClientRect();
            ctx?.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx?.stroke();
        };
        canvas.onmouseup = () => {
            isDrawing.current = false;
        };
        canvas.onmouseleave = () => {
            isDrawing.current = false;
        };

        canvas.ontouchstart = (e: TouchEvent) => {
            e.preventDefault();
            isDrawing.current = true;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ctx?.beginPath();
            ctx?.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
        };
        canvas.ontouchmove = (e: TouchEvent) => {
            e.preventDefault();
            if (!isDrawing.current) return;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            ctx?.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
            ctx?.stroke();
        };
        canvas.ontouchend = () => {
            isDrawing.current = false;
        };
    }, []);

    const handleClearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        setSigned(false);
        setSignatureData(null);
    };

    const handleSaveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            setSigned(true);
            setSignatureData("mock-signature-data");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return;
        }
        const data = canvas.toDataURL("image/png");
        setSignatureData(data);
        setSigned(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const finalizeMission = async () => {
        if (!signed || !signatureData) {
            Alert.alert("Signature manquante", "Le client doit signer pour valider la fin des travaux.");
            return;
        }

        setIsProcessing(true);
        try {
            await apiRequest("POST", `/api/missions/${id}/signature`, {
                signatureData,
                signedBy: user?.id,
            });

            await apiRequest("POST", `/api/missions/${id}/complete`);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                "Mission Terminee",
                "L'argent a ete transfere sur votre portefeuille. Le client recevra sa facture par email.",
                [{ text: "Retour au Dashboard", onPress: () => router.push("/(artisan)") }]
            );
        } catch (e: any) {
            Alert.alert("Erreur", e.message || "Une erreur est survenue");
        }
        setIsProcessing(false);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <LinearGradient colors={["#0F172A", "#1E293B"]} style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 50 : 0)) + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Fin de Mission</Text>
                </View>
                <Text style={styles.headerDesc}>Mission #{id?.toString().slice(-4).toUpperCase()}</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Recapitulatif Final</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Intervention</Text>
                        <Text style={styles.value}>{mission?.title || "Mission"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Total</Text>
                        <Text style={styles.totalValue}>{mission?.finalPrice || mission?.estimatedPrice || "---"}EUR</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Signature Electronique (Client)</Text>
                <Text style={styles.sectionDesc}>En signant, vous attestez de la bonne realisation des travaux et autorisez le deblocage immediat des fonds.</Text>

                {Platform.OS === "web" ? (
                    <View style={styles.canvasWrapper}>
                        {!signed ? (
                            <>
                                <canvas
                                    ref={setupCanvas}
                                    style={{
                                        border: "2px dashed #CBD5E1",
                                        borderRadius: 16,
                                        cursor: "crosshair",
                                        touchAction: "none",
                                    }}
                                />
                                <View style={styles.canvasBtnRow}>
                                    <Pressable style={styles.clearBtn} onPress={handleClearSignature}>
                                        <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                                        <Text style={styles.clearBtnText}>Effacer</Text>
                                    </Pressable>
                                    <Pressable style={styles.saveBtn} onPress={handleSaveSignature}>
                                        <Ionicons name="checkmark" size={16} color="white" />
                                        <Text style={styles.saveBtnText}>Valider la signature</Text>
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <View style={styles.signedContainer}>
                                <Ionicons name="checkmark-done" size={60} color={Colors.success} />
                                <Text style={styles.signedText}>Signe par le Client</Text>
                                <Pressable onPress={handleClearSignature}>
                                    <Text style={styles.resignText}>Resigner</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                ) : (
                    <Pressable
                        style={[styles.signaturePad, signed && styles.signaturePadSigned]}
                        onPress={handleSaveSignature}
                    >
                        {signed ? (
                            <View style={styles.signedContainer}>
                                <Ionicons name="checkmark-done" size={60} color={Colors.success} />
                                <Text style={styles.signedText}>Signe par le Client</Text>
                            </View>
                        ) : (
                            <Text style={styles.signPlaceholder}>Signez ici sur l'ecran</Text>
                        )}
                    </Pressable>
                )}

                <View style={styles.infoBox}>
                    <Ionicons name="flash" size={20} color={Colors.accent} />
                    <Text style={styles.infoText}>Instant Payout active : Fonds transferes en 0.2s apres signature.</Text>
                </View>

                <Pressable
                    style={[styles.finishBtn, isProcessing && styles.finishBtnDisabled]}
                    onPress={finalizeMission}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.finishBtnText}>FINALISER ET RECEVOIR LE PAIEMENT</Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 35, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    headerDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
    content: { flex: 1, padding: 25 },
    summaryCard: { backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    summaryTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 15 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    label: { fontSize: 14, color: Colors.textMuted },
    value: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
    totalValue: { fontSize: 18, fontFamily: "Inter_800ExtraBold", color: Colors.primary },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 8 },
    sectionDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 18, marginBottom: 20 },
    canvasWrapper: { alignItems: "center", marginBottom: 20 },
    canvasBtnRow: { flexDirection: "row", gap: 12, marginTop: 12 },
    clearBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.danger },
    clearBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.danger },
    saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.success },
    saveBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "white" },
    signaturePad: { width: "100%", height: 200, backgroundColor: "white", borderRadius: 20, borderWidth: 2, borderStyle: "dashed", borderColor: Colors.border, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    signaturePadSigned: { borderStyle: "solid", borderColor: Colors.success, backgroundColor: "#F0FDF4" },
    signPlaceholder: { color: Colors.textMuted, fontFamily: "Inter_500Medium" },
    signedContainer: { alignItems: "center", paddingVertical: 20 },
    signedText: { marginTop: 10, color: Colors.success, fontFamily: "Inter_700Bold" },
    resignText: { marginTop: 8, color: Colors.primary, fontFamily: "Inter_600SemiBold", textDecorationLine: "underline" },
    infoBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFBEB", padding: 15, borderRadius: 16, gap: 10, marginVertical: 20 },
    infoText: { flex: 1, fontSize: 12, color: "#92400E", fontFamily: "Inter_600SemiBold" },
    finishBtn: { backgroundColor: Colors.primary, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    finishBtnDisabled: { opacity: 0.6 },
    finishBtnText: { color: "white", fontSize: 16, fontFamily: "Inter_800ExtraBold", letterSpacing: 1 },
});
