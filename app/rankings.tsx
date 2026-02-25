import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const RANKINGS = [
    { id: "1", name: "Jean Durand", score: 4.9, missions: 124, speciality: "Plomberie", rank: 1 },
    { id: "2", name: "Marc Lefebvre", score: 4.8, missions: 98, speciality: "Électricité", rank: 2 },
    { id: "3", name: "Luc Petit", score: 4.8, missions: 85, speciality: "Serrurier", rank: 3 },
    { id: "4", name: "Sophie Bernard", score: 4.7, missions: 72, speciality: "Peinture", rank: 4 },
    { id: "5", name: "Pierre Martin", score: 4.6, missions: 65, speciality: "Menuiserie", rank: 5 },
];

export default function RankingsScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={[styles.header, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 8 }]}
            >
                <View style={styles.headerBar}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Classement Artisans</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.podium}>
                    <View style={[styles.podiumItem, { paddingTop: 20 }]}>
                        <View style={[styles.podiumRank, { backgroundColor: "#E5E7EB" }]}>
                            <Text style={styles.podiumRankText}>2</Text>
                        </View>
                        <Text style={styles.podiumName}>{RANKINGS[1].name.split(" ")[0]}</Text>
                        <Text style={styles.podiumScore}>{RANKINGS[1].score}</Text>
                    </View>

                    <View style={styles.podiumItem}>
                        <View style={[styles.podiumRank, { backgroundColor: Colors.accent, width: 60, height: 60, borderRadius: 30 }]}>
                            <Ionicons name="trophy" size={28} color={Colors.primary} />
                        </View>
                        <Text style={[styles.podiumName, { fontFamily: "Inter_700Bold" }]}>{RANKINGS[0].name.split(" ")[0]}</Text>
                        <Text style={styles.podiumScore}>{RANKINGS[0].score}</Text>
                    </View>

                    <View style={[styles.podiumItem, { paddingTop: 30 }]}>
                        <View style={[styles.podiumRank, { backgroundColor: "#D1D5DB" }]}>
                            <Text style={styles.podiumRankText}>3</Text>
                        </View>
                        <Text style={styles.podiumName}>{RANKINGS[2].name.split(" ")[0]}</Text>
                        <Text style={styles.podiumScore}>{RANKINGS[2].score}</Text>
                    </View>
                </View>
            </LinearGradient>

            <FlatList
                data={RANKINGS.slice(3)}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.rankCard}>
                        <Text style={styles.rankNum}>#{item.rank}</Text>
                        <View style={styles.rankInfo}>
                            <Text style={styles.rankName}>{item.name}</Text>
                            <Text style={styles.rankSpec}>{item.speciality} • {item.missions} missions</Text>
                        </View>
                        <View style={styles.rankScore}>
                            <Ionicons name="star" size={14} color={Colors.accent} />
                            <Text style={styles.rankScoreText}>{item.score}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 20, paddingBottom: 30 },
    headerBar: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
    headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#FFFFFF", textAlign: "center" },
    podium: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end" },
    podiumItem: { alignItems: "center", gap: 8 },
    podiumRank: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    podiumRankText: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primary },
    podiumName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFF" },
    podiumScore: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
    list: { padding: 20, gap: 12 },
    rankCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, padding: 16, borderRadius: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
    rankNum: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.textMuted, width: 30 },
    rankInfo: { flex: 1 },
    rankName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
    rankSpec: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 },
    rankScore: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.accentSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    rankScoreText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.accent },
});
