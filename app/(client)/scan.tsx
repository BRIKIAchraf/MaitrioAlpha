import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    Animated,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

export default function VisionScanScreen() {
    const insets = useSafeAreaInsets();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<null | { title: string, desc: string, price: string }>(null);

    const scanLineY = new Animated.Value(0);
    const hudOpacity = new Animated.Value(0.6);

    useEffect(() => {
        if (isScanning) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanLineY, { toValue: 300, duration: 2000, useNativeDriver: true }),
                    Animated.timing(scanLineY, { toValue: 0, duration: 2000, useNativeDriver: true }),
                ])
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(hudOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
                    Animated.timing(hudOpacity, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [isScanning]);

    const handleStartScan = () => {
        setIsScanning(true);
        setScanResult(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Simulate AI analysis
        setTimeout(() => {
            setIsScanning(false);
            setScanResult({
                title: "Fuite Joint de Culasse (Robinet)",
                desc: "L'analyse visuelle détecte une usure critique du joint 12/17. Risque de dégât des eaux sous 48h.",
                price: "85€ - 110€"
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 4000);
    };

    return (
        <View style={styles.container}>
            {/* "Camera" Background Mock */}
            <View style={styles.cameraMock}>
                <LinearGradient colors={["#1E293B", "#0F172A"]} style={styles.cameraOverlay} />
                <MaterialCommunityIcons name="water-pump" size={120} color="rgba(255,255,255,0.1)" />
            </View>

            {/* Viewfinder UI */}
            <View style={styles.viewfinderContainer}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />

                {isScanning && (
                    <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
                )}

                <Animated.View style={[styles.hud, { opacity: hudOpacity }]}>
                    <View style={styles.hudRow}>
                        <Text style={styles.hudText}>AI SENSORS: ACTIVE</Text>
                        <Text style={styles.hudText}>FPS: 60</Text>
                    </View>
                    <View style={styles.hudRow}>
                        <Text style={styles.hudText}>DEPTH: 1.2m</Text>
                        <Text style={styles.hudText}>PARTS IDENTIFIED: 3</Text>
                    </View>
                </Animated.View>
            </View>

            {/* Result Card */}
            {scanResult && (
                <View style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                        <View style={styles.aiBadge}>
                            <Text style={styles.aiBadgeText}>DIAGNOSTIC IA</Text>
                        </View>
                        <Text style={styles.resultPrice}>{scanResult.price}</Text>
                    </View>
                    <Text style={styles.resultTitle}>{scanResult.title}</Text>
                    <Text style={styles.resultDesc}>{scanResult.desc}</Text>

                    <Pressable style={styles.bookBtn} onPress={() => router.push("/(client)/search")}>
                        <Text style={styles.bookBtnText}>Réserver cet Artisan maintenant</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </Pressable>
                </View>
            )}

            {/* Controls */}
            <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
                <Pressable style={styles.closeBtn} onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="white" />
                </Pressable>

                {!scanResult && (
                    <Pressable
                        style={[styles.scanBtn, isScanning && styles.scanBtnActive]}
                        onPress={handleStartScan}
                        disabled={isScanning}
                    >
                        <View style={styles.scanBtnInner}>
                            {isScanning ? (
                                <Text style={styles.scanningText}>ANALYSE...</Text>
                            ) : (
                                <Ionicons name="scan" size={40} color="white" />
                            )}
                        </View>
                    </Pressable>
                )}

                <View style={styles.spacer} />
            </View>

            <Text style={styles.instruction}>Filmez la panne à environ 30cm pour un diagnostic précis.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },
    cameraMock: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
    cameraOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
    viewfinderContainer: {
        position: "absolute",
        top: height * 0.2,
        left: 40,
        right: 40,
        height: 300,
        borderWidth: 0,
    },
    cornerTopLeft: { position: "absolute", top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: Colors.primary, borderTopLeftRadius: 20 },
    cornerTopRight: { position: "absolute", top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: Colors.primary, borderTopRightRadius: 20 },
    cornerBottomLeft: { position: "absolute", bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: Colors.primary, borderBottomLeftRadius: 20 },
    cornerBottomRight: { position: "absolute", bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: Colors.primary, borderBottomRightRadius: 20 },
    scanLine: { height: 2, backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 10 },
    hud: { position: "absolute", top: -60, left: 0, right: 0, gap: 4 },
    hudRow: { flexDirection: "row", justifyContent: "space-between" },
    hudText: { color: Colors.primary, fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
    controls: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
    closeBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    scanBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.3)", padding: 8 },
    scanBtnActive: { opacity: 0.7 },
    scanBtnInner: { flex: 1, borderRadius: 40, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
    scanningText: { color: "white", fontSize: 12, fontFamily: "Inter_700Bold" },
    spacer: { width: 60 },
    instruction: { position: "absolute", top: 100, left: 40, right: 40, textAlign: "center", color: "white", fontSize: 14, fontFamily: "Inter_400Regular", opacity: 0.7 },
    resultCard: { position: "absolute", bottom: 150, left: 20, right: 20, backgroundColor: "white", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    aiBadge: { backgroundColor: "#F0FDF4", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    aiBadgeText: { color: "#16A34A", fontSize: 10, fontFamily: "Inter_700Bold" },
    resultPrice: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primary },
    resultTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 8 },
    resultDesc: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20, lineHeight: 20 },
    bookBtn: { backgroundColor: Colors.primary, height: 54, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    bookBtnText: { color: "white", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
