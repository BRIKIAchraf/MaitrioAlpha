import React, { useState, useRef, useCallback } from "react";
import * as RN from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useMissions } from "@/context/mission-context";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/query-client";

const { width } = RN.Dimensions.get("window");

import * as ImagePicker from "expo-image-picker";

export default function MissionCompletionScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { getMission, updateMission } = useMissions();
    const mission = getMission(id as string);
    const [signed, setSigned] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setCapturedPhoto(result.assets[0].uri);
        }
    };

    const uploadFile = async (uri: string) => {
        const formData = new FormData();
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image`;

        // @ts-ignore
        formData.append("file", { uri, name: filename, type });

        const res = await fetch(`${process.env.EXPO_PUBLIC_DOMAIN || 'http://localhost:5000'}/api/upload`, {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
    };

    const setupCanvas = useCallback((node: any) => {
        if (RN.Platform.OS !== "web" || !node) return;
        const canvas = node as HTMLCanvasElement;
        canvasRef.current = canvas;
        canvas.width = Math.min(RN.Dimensions.get("window").width - 50, 500);
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
            RN.Alert.alert("Signature manquante", "Le client doit signer pour valider la fin des travaux.");
            return;
        }

        if (!capturedPhoto) {
            RN.Alert.alert("Photo manquante", "Vous devez prendre une photo des travaux terminés.");
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Upload the photo
            const photoUrl = await uploadFile(capturedPhoto);

            // 2. Save signature
            await apiRequest("POST", `/api/missions/${id}/signature`, {
                signatureData,
                signedBy: user?.id,
            });

            // 3. Mark as complete with the photo URL
            // Assuming the mission object allows an array of completion photos
            await apiRequest("POST", `/api/missions/${id}/complete`, {
                report: "Travaux terminés et validés par le client.",
                completionPhotos: [photoUrl],
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            RN.Alert.alert(
                "Mission Terminée",
                "L'argent a été transféré sur votre portefeuille. Le client recevra sa facture par email.",
                [{ text: "Retour au Dashboard", onPress: () => router.push("/(artisan)") }]
            );
        } catch (e: any) {
            RN.Alert.alert("Erreur", e.message || "Une erreur est survenue");
        }
        setIsProcessing(false);
    };

    return (
        <RN.ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <LinearGradient colors={["#0F172A", "#1E293B"]} style={[styles.header, { paddingTop: (insets.top || (RN.Platform.OS === "web" ? 50 : 0)) + 20 }]}>
                <RN.View style={styles.headerRow}>
                    <RN.Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </RN.Pressable>
                    <RN.Text style={styles.headerTitle}>Fin de Mission</RN.Text>
                </RN.View>
                <RN.Text style={styles.headerDesc}>Mission #{id?.toString().slice(-4).toUpperCase()}</RN.Text>
            </LinearGradient>

            <RN.View style={styles.content}>
                <RN.View style={styles.summaryCard}>
                    <RN.Text style={styles.summaryTitle}>Récapitulatif Final</RN.Text>
                    <RN.View style={styles.row}>
                        <RN.Text style={styles.label}>Intervention</RN.Text>
                        <RN.Text style={styles.value}>{mission?.title || "Mission"}</RN.Text>
                    </RN.View>
                    <RN.View style={styles.row}>
                        <RN.Text style={styles.label}>Total</RN.Text>
                        <RN.Text style={styles.totalValue}>{mission?.finalPrice || mission?.estimatedPrice || "---"}€</RN.Text>
                    </RN.View>
                </RN.View>

                <RN.Text style={styles.sectionTitle}>Photo des travaux</RN.Text>
                <RN.Pressable style={styles.photoContainer} onPress={pickImage}>
                    {capturedPhoto ? (
                        <RN.Image source={{ uri: capturedPhoto }} style={styles.capturedPhoto} />
                    ) : (
                        <RN.View style={styles.photoPlaceholder}>
                            <Ionicons name="camera" size={40} color={Colors.textMuted} />
                            <RN.Text style={styles.photoPlaceholderText}>Prendre une photo</RN.Text>
                        </RN.View>
                    )}
                </RN.Pressable>

                <RN.Text style={styles.sectionTitle}>Signature Électronique (Client)</RN.Text>
                <RN.Text style={styles.sectionDesc}>En signant, vous attestez de la bonne réalisation des travaux et autorisez le déblocage immédiat des fonds.</RN.Text>

                {RN.Platform.OS === "web" ? (
                    <RN.View style={styles.canvasWrapper}>
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
                                <RN.View style={styles.canvasBtnRow}>
                                    <RN.Pressable style={styles.clearBtn} onPress={handleClearSignature}>
                                        <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                                        <RN.Text style={styles.clearBtnText}>Effacer</RN.Text>
                                    </RN.Pressable>
                                    <RN.Pressable style={styles.saveBtn} onPress={handleSaveSignature}>
                                        <Ionicons name="checkmark" size={16} color="white" />
                                        <RN.Text style={styles.saveBtnText}>Valider la signature</RN.Text>
                                    </RN.Pressable>
                                </RN.View>
                            </>
                        ) : (
                            <RN.View style={styles.signedContainer}>
                                <Ionicons name="checkmark-done" size={60} color={Colors.success} />
                                <RN.Text style={styles.signedText}>Signé par le Client</RN.Text>
                                <RN.Pressable onPress={handleClearSignature}>
                                    <RN.Text style={styles.resignText}>Resigner</RN.Text>
                                </RN.Pressable>
                            </RN.View>
                        )}
                    </RN.View>
                ) : (
                    <RN.Pressable
                        style={[styles.signaturePad, signed && styles.signaturePadSigned]}
                        onPress={handleSaveSignature}
                    >
                        {signed ? (
                            <RN.View style={styles.signedContainer}>
                                <Ionicons name="checkmark-done" size={60} color={Colors.success} />
                                <RN.Text style={styles.signedText}>Signé par le Client</RN.Text>
                            </RN.View>
                        ) : (
                            <RN.Text style={styles.signPlaceholder}>Signez ici sur l'écran</RN.Text>
                        )}
                    </RN.Pressable>
                )}

                <RN.View style={styles.infoBox}>
                    <Ionicons name="flash" size={20} color={Colors.accent} />
                    <RN.Text style={styles.infoText}>Instant Payout activé : Fonds transférés en 0.2s après signature.</RN.Text>
                </RN.View>

                <RN.Pressable
                    style={[styles.finishBtn, isProcessing && styles.finishBtnDisabled]}
                    onPress={finalizeMission}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <RN.ActivityIndicator color="white" />
                    ) : (
                        <RN.Text style={styles.finishBtnText}>FINALISER ET RECEVOIR LE PAIEMENT</RN.Text>
                    )}
                </RN.Pressable>
            </RN.View>
        </RN.ScrollView>
    );
}

const styles = RN.StyleSheet.create({
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
    photoContainer: { width: "100%", height: 200, backgroundColor: "white", borderRadius: 20, marginBottom: 25, overflow: "hidden", borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed", justifyContent: "center", alignItems: "center" },
    photoPlaceholder: { alignItems: "center", gap: 8 },
    photoPlaceholderText: { color: Colors.textMuted, fontSize: 14, fontFamily: "Inter_500Medium" },
    capturedPhoto: { width: "100%", height: "100%", resizeMode: "cover" },
});
