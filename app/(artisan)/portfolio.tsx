import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

const MOCK_PROJECTS = [
    { id: "1", title: "Rénovation Salle de Bain", category: "Plomberie", before: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400", after: "https://images.unsplash.com/photo-1620626011761-9963d7b52750?q=80&w=400" },
    { id: "2", title: "Installation Ballon", category: "Chauffage", before: "https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=400", after: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400" },
];

export default function PortfolioManagementScreen() {
    const insets = useSafeAreaInsets();
    const [projects, setProjects] = useState(MOCK_PROJECTS);

    const addNewProject = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Simulation of project creation
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, "#312E81"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Mon Portfolio Pro</Text>
                </View>
                <Text style={styles.headerDesc}>Publiez vos chantiers pour prouver votre expertise.</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.uploadCard}>
                    <Ionicons name="cloud-upload-outline" size={40} color={Colors.primary} />
                    <Text style={styles.uploadTitle}>Nouveau Projet</Text>
                    <Text style={styles.uploadDesc}>Ajoutez un titre, une photo Avant et une photo Après.</Text>
                    <Pressable style={styles.uploadBtn} onPress={addNewProject}>
                        <Text style={styles.uploadBtnText}>Commencer</Text>
                    </Pressable>
                </View>

                <Text style={styles.sectionTitle}>Chantiers Réalisés</Text>
                {projects.map((project) => (
                    <View key={project.id} style={styles.projectCard}>
                        <Text style={styles.projectTitle}>{project.title}</Text>
                        <Text style={styles.projectCat}>{project.category}</Text>

                        <View style={styles.comparisonRow}>
                            <View style={styles.imageBox}>
                                <Image source={{ uri: project.before }} style={styles.projectImg} />
                                <View style={styles.tag}><Text style={styles.tagText}>AVANT</Text></View>
                            </View>
                            <View style={styles.imageBox}>
                                <Image source={{ uri: project.after }} style={styles.projectImg} />
                                <View style={[styles.tag, { backgroundColor: Colors.success }]}><Text style={styles.tagText}>APRÈS</Text></View>
                            </View>
                        </View>

                        <View style={styles.projectActions}>
                            <Pressable style={styles.actionBtn}>
                                <Ionicons name="create-outline" size={18} color={Colors.textMuted} />
                                <Text style={styles.actionText}>Modifier</Text>
                            </Pressable>
                            <Pressable style={styles.actionBtn}>
                                <Ionicons name="share-outline" size={18} color={Colors.textMuted} />
                                <Text style={styles.actionText}>Partager</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
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
    content: { flex: 1, padding: 25 },
    uploadCard: { backgroundColor: "white", borderRadius: 30, padding: 30, alignItems: "center", borderStyle: "dashed", borderWidth: 2, borderColor: Colors.primary, marginBottom: 30 },
    uploadTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 15 },
    uploadDesc: { fontSize: 13, color: Colors.textMuted, textAlign: "center", marginTop: 8, lineHeight: 20 },
    uploadBtn: { backgroundColor: Colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 15, marginTop: 20 },
    uploadBtnText: { color: "white", fontFamily: "Inter_800ExtraBold", fontSize: 14 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 20 },
    projectCard: { backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    projectTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
    projectCat: { fontSize: 12, color: Colors.primary, fontFamily: "Inter_600SemiBold", marginTop: 4 },
    comparisonRow: { flexDirection: "row", gap: 15, marginTop: 15 },
    imageBox: { flex: 1, height: 120, borderRadius: 12, overflow: "hidden", position: "relative" },
    projectImg: { width: "100%", height: "100%" },
    tag: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    tagText: { color: "white", fontSize: 10, fontFamily: "Inter_800ExtraBold" },
    projectActions: { flexDirection: "row", marginTop: 20, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 15, gap: 20 },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
    actionText: { fontSize: 13, color: Colors.textMuted, fontFamily: "Inter_600SemiBold" },
});
