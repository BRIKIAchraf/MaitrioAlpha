import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Dimensions,
    Switch,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const { width } = Dimensions.get("window");

export default function AvailabilityScreen() {
    const insets = useSafeAreaInsets();
    const [isOnline, setIsOnline] = useState(true);
    const [selectedDays, setSelectedDays] = useState(["Lun", "Mar", "Mer", "Jeu", "Ven"]);

    const toggleOnline = (value: boolean) => {
        setIsOnline(value);
        Haptics.notificationAsync(value ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
    };

    const toggleDay = (day: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isOnline ? [Colors.primary, "#312E81"] : ["#475569", "#1E293B"]}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Disponibilité & Planning</Text>
                </View>
                <View style={styles.statusBox}>
                    <View style={styles.statusInfo}>
                        <Text style={styles.statusLabel}>Mode {isOnline ? "En ligne" : "Hors-ligne"}</Text>
                        <Text style={styles.statusDesc}>
                            {isOnline ? "Vous recevez des demandes en temps réel." : "Vous êtes invisible pour les clients."}
                        </Text>
                    </View>
                    <Switch
                        value={isOnline}
                        onValueChange={toggleOnline}
                        trackColor={{ false: "#94A3B8", true: Colors.accent }}
                        thumbColor="white"
                    />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Mes Jours travaillés</Text>
                <View style={styles.daysGrid}>
                    {DAYS.map((day) => (
                        <Pressable
                            key={day}
                            style={[styles.dayCard, selectedDays.includes(day) && styles.dayCardActive]}
                            onPress={() => toggleDay(day)}
                        >
                            <Text style={[styles.dayText, selectedDays.includes(day) && styles.dayTextActive]}>{day}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Horaires par défaut</Text>
                <View style={styles.timeCard}>
                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={20} color={Colors.primary} />
                        <Text style={styles.timeLabel}>Matin</Text>
                        <Text style={styles.timeValue}>08:00 - 12:00</Text>
                    </View>
                    <View style={styles.timeDivider} />
                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={20} color={Colors.primary} />
                        <Text style={styles.timeLabel}>Après-midi</Text>
                        <Text style={styles.timeValue}>13:30 - 18:30</Text>
                    </View>
                </View>

                <View style={styles.infoBanner}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.infoTitle}>Synchronisation Google Calendar</Text>
                        <Text style={styles.infoText}>Liez votre calendrier perso pour éviter les doublons.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </View>

                <Pressable style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>ENREGISTRER LE PLANNING</Text>
                </Pressable>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 35, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    statusBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", padding: 20, borderRadius: 20 },
    statusInfo: { flex: 1 },
    statusLabel: { color: "white", fontSize: 16, fontFamily: "Inter_700Bold" },
    statusDesc: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 },
    content: { flex: 1, padding: 25 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 15, marginTop: 10 },
    daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 30 },
    dayCard: { width: (width - 80) / 4, height: 50, borderRadius: 12, backgroundColor: "white", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.borderLight },
    dayCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    dayText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
    dayTextActive: { color: "white" },
    timeCard: { backgroundColor: "white", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    timeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
    timeLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text, marginLeft: 10, flex: 1 },
    timeValue: { fontSize: 14, color: Colors.primary, fontFamily: "Inter_700Bold" },
    timeDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 4 },
    infoBanner: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surfaceSecondary, padding: 20, borderRadius: 20, marginTop: 30, gap: 15 },
    infoTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
    infoText: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    saveBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 40 },
    saveBtnText: { color: "white", fontSize: 15, fontFamily: "Inter_800ExtraBold" },
});
