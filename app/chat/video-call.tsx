import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

export default function VideoCallScreen() {
    const insets = useSafeAreaInsets();
    const [isMuted, setIsMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const endCall = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Simulated Remote Video (Background) */}
            <LinearGradient colors={["#1E293B", "#0F172A"]} style={styles.remoteVideo}>
                <Ionicons name="person" size={120} color="rgba(255,255,255,0.1)" />
                <Text style={styles.remoteName}>Jean Moreau (Artisan)</Text>
            </LinearGradient>

            {/* Simulated Local Video (Overlay) */}
            <View style={[styles.localVideo, { top: insets.top + 20 }]}>
                {cameraOff ? (
                    <View style={styles.cameraOffPlaceholder}>
                        <Ionicons name="videocam-off" size={24} color="white" />
                    </View>
                ) : (
                    <LinearGradient colors={["#4B5563", "#1F2937"]} style={styles.cameraPreview} />
                )}
            </View>

            {/* Header info */}
            <View style={[styles.topOverlay, { top: insets.top + 20 }]}>
                <View style={styles.timerBadge}>
                    <View style={styles.redDot} />
                    <Text style={styles.timerText}>{formatDuration(duration)}</Text>
                </View>
                <View style={[styles.secureBadge, { backgroundColor: Colors.success + "20" }]}>
                    <Ionicons name="lock-closed" size={12} color={Colors.success} />
                    <Text style={[styles.secureText, { color: Colors.success }]}>Chiffré A2A</Text>
                </View>
            </View>

            {/* Bottom Controls */}
            <View style={[styles.controls, { paddingBottom: insets.bottom + 30 }]}>
                <View style={styles.controlsRow}>
                    <ControlButton
                        icon={isMuted ? "mic-off" : "mic"}
                        onPress={() => setIsMuted(!isMuted)}
                        active={isMuted}
                    />
                    <ControlButton
                        icon={cameraOff ? "videocam-off" : "videocam"}
                        onPress={() => setCameraOff(!cameraOff)}
                        active={cameraOff}
                    />
                    <Pressable style={styles.endCallBtn} onPress={endCall}>
                        <MaterialCommunityIcons name="phone-hangup" size={32} color="white" />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

function ControlButton({ icon, onPress, active }: { icon: any; onPress: () => void; active: boolean }) {
    return (
        <Pressable
            style={[styles.controlBtn, active && styles.controlBtnActive]}
            onPress={onPress}
        >
            <Ionicons name={icon} size={24} color={active ? "white" : "white"} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },
    remoteVideo: { flex: 1, alignItems: "center", justifyContent: "center" },
    remoteName: { color: "white", fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 20 },
    localVideo: { position: "absolute", right: 20, width: 120, height: 180, borderRadius: 20, overflow: "hidden", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
    cameraPreview: { flex: 1 },
    cameraOffPlaceholder: { flex: 1, backgroundColor: "#374151", alignItems: "center", justifyContent: "center" },
    topOverlay: { position: "absolute", left: 20, gap: 10 },
    timerBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, marginRight: 8 },
    timerText: { color: "white", fontSize: 14, fontFamily: "Inter_700Bold" },
    secureBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    secureText: { fontSize: 10, fontFamily: "Inter_700Bold" },
    controls: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 30 },
    controlsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" },
    controlBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    controlBtnActive: { backgroundColor: Colors.danger },
    endCallBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.danger, alignItems: "center", justifyContent: "center", shadowColor: Colors.danger, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
});
