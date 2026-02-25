import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const COURSES = [
    { id: "1", title: "Installation Pompe à Chaleur", level: "Avancé", duration: "4h", progress: 60, image: "thermometer" },
    { id: "2", title: "Normes Éco-Responsables 2025", level: "Obligatoire", duration: "2h", progress: 100, image: "leaf" },
    { id: "3", title: "Relation Client Maîtrio", level: "Débutant", duration: "1h", progress: 10, image: "school" },
];

export default function AcademyScreen() {
    const insets = useSafeAreaInsets();
    const [tab, setTab] = useState<"courses" | "recycling">("courses");

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, "#312E81"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Maîtrio Academy</Text>
                </View>
                <Text style={styles.headerDesc}>Devenez un artisan d'élite et engagez-vous pour la planète.</Text>
            </LinearGradient>

            <View style={styles.tabContainer}>
                <Pressable
                    style={[styles.tab, tab === "courses" && styles.activeTab]}
                    onPress={() => setTab("courses")}
                >
                    <Text style={[styles.tabText, tab === "courses" && styles.activeTabText]}>Formations</Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, tab === "recycling" && styles.activeTab]}
                    onPress={() => setTab("recycling")}
                >
                    <Text style={[styles.tabText, tab === "recycling" && styles.activeTabText]}>Recyclage</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {tab === "courses" ? (
                    <>
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statVal}>12</Text>
                                <Text style={styles.statLabel}>Heures de cours</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statVal}>3</Text>
                                <Text style={styles.statLabel}>Certificats</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Formations en cours</Text>
                        {COURSES.map((course) => (
                            <View key={course.id} style={styles.courseCard}>
                                <View style={styles.courseIconBox}>
                                    <MaterialCommunityIcons name={course.image as any} size={32} color={Colors.primary} />
                                </View>
                                <View style={styles.courseInfo}>
                                    <View style={styles.levelRow}>
                                        <Text style={styles.levelText}>{course.level}</Text>
                                        <Text style={styles.durationText}>{course.duration}</Text>
                                    </View>
                                    <Text style={styles.courseTitle}>{course.title}</Text>
                                    <View style={styles.progressRow}>
                                        <View style={styles.progressBarContainer}>
                                            <View style={[styles.progressBar, { width: `${course.progress}%` }]} />
                                        </View>
                                        <Text style={styles.progressPct}>{course.progress}%</Text>
                                    </View>
                                </View>
                                <Ionicons name="play-circle" size={32} color={Colors.primary} />
                            </View>
                        ))}
                    </>
                ) : (
                    <View style={styles.recyclingView}>
                        <View style={styles.ecoCard}>
                            <Ionicons name="leaf" size={40} color="#059669" />
                            <Text style={styles.ecoTitle}>Impact Éco-Artisan</Text>
                            <Text style={styles.ecoDesc}>Vous avez recyclé 45kg de cuivre cette semaine.</Text>
                            <View style={styles.pointsBadge}>
                                <Text style={styles.pointsText}>+450 Points Maîtrio</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Matériaux Valorisés</Text>
                        <View style={styles.materialRow}>
                            <View style={styles.materialBox}>
                                <Text style={styles.matLabel}>Cuivre</Text>
                                <Text style={styles.matVal}>12.5 kg</Text>
                            </View>
                            <View style={styles.materialBox}>
                                <Text style={styles.matLabel}>Fer</Text>
                                <Text style={styles.matVal}>84 kg</Text>
                            </View>
                        </View>

                        <Pressable style={styles.logBtn}>
                            <Ionicons name="camera" size={24} color="white" />
                            <Text style={styles.logBtnText}>Scanner un ticket de recyclage</Text>
                        </Pressable>

                        <View style={styles.partnerCard}>
                            <Text style={styles.partnerTitle}>Partenaires Recyclage</Text>
                            <Text style={styles.partnerDesc}>Présentez votre QR Code Maîtrio chez Derichebourg pour doubler vos points.</Text>
                        </View>
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 30 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    headerDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
    tabContainer: { flexDirection: "row", backgroundColor: "white", padding: 6, margin: 20, borderRadius: 16, marginTop: -25, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 },
    tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
    activeTab: { backgroundColor: Colors.primary },
    tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
    activeTabText: { color: "white" },
    content: { flex: 1, paddingHorizontal: 20 },
    statsRow: { flexDirection: "row", gap: 15, marginBottom: 25 },
    statBox: { flex: 1, backgroundColor: "white", padding: 15, borderRadius: 20, alignItems: "center" },
    statVal: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: Colors.primary },
    statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 15 },
    courseCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 16, borderRadius: 24, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    courseIconBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    courseInfo: { flex: 1, marginLeft: 15 },
    levelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    levelText: { fontSize: 10, fontFamily: "Inter_700Bold", color: Colors.primary, backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    durationText: { fontSize: 10, color: Colors.textMuted },
    courseTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text, marginBottom: 10 },
    progressRow: { flexDirection: "row", alignItems: "center" },
    progressBarContainer: { flex: 1, height: 6, backgroundColor: "#F1F5F9", borderRadius: 3, marginRight: 10 },
    progressBar: { height: 6, borderRadius: 3, backgroundColor: Colors.primary },
    progressPct: { fontSize: 11, fontFamily: "Inter_700Bold", color: Colors.textMuted },
    recyclingView: { flex: 1 },
    ecoCard: { backgroundColor: "white", borderRadius: 24, padding: 30, alignItems: "center", marginBottom: 25 },
    ecoTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 15 },
    ecoDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginTop: 8, lineHeight: 20 },
    pointsBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginTop: 20 },
    pointsText: { color: "#059669", fontFamily: "Inter_700Bold", fontSize: 14 },
    materialRow: { flexDirection: "row", gap: 15, marginBottom: 25 },
    materialBox: { flex: 1, backgroundColor: "white", padding: 20, borderRadius: 20 },
    matLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 5 },
    matVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
    logBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 },
    logBtnText: { color: "white", fontSize: 16, fontFamily: "Inter_600SemiBold" },
    partnerCard: { backgroundColor: "#F8FAFC", borderStyle: "dashed", borderWidth: 1, borderColor: Colors.border, padding: 20, borderRadius: 20 },
    partnerTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
    partnerDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
});
