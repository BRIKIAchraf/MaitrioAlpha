import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Alert,
    Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

const DOCUMENT_TYPES = [
    { id: "id", label: "Pièce d'Identité (CNI/Passeport)", icon: "card-account-details-outline" },
    { id: "diploma", label: "Diplôme ou Certification", icon: "school-outline" },
    { id: "insurance", label: "Attestation d'Assurance RCP", icon: "shield-lock-outline" },
    { id: "kbis", label: "Kbis ou SIRET", icon: "file-certificate-outline" },
];

export default function ArtisanKYCScreen() {
    const insets = useSafeAreaInsets();
    const [uploads, setUploads] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpload = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Simulate file picker
        Alert.alert("Téléchargement", `Sélectionnez un fichier pour : ${DOCUMENT_TYPES.find(d => d.id === id)?.label}`, [
            { text: "Galerie", onPress: () => setUploads(prev => ({ ...prev, [id]: true })) },
            { text: "Appareil Photo", onPress: () => setUploads(prev => ({ ...prev, [id]: true })) },
            { text: "Annuler", style: "cancel" }
        ]);
    };

    const submitKYC = () => {
        const missing = DOCUMENT_TYPES.filter(d => !uploads[d.id]);
        if (missing.length > 0) {
            Alert.alert("Documents manquants", "Veuillez télécharger tous les documents requis pour validation.");
            return;
        }

        setIsSubmitting(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert(
                "Dossier Envoyé !",
                "Votre dossier est en cours de révision par l'équipe Maîtrio. Validation sous 24h-48h.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, "#312E81"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Validation Pro (KYC)</Text>
                </View>
                <Text style={styles.headerDesc}>Complétez votre profil pour obtenir le badge "Vérifié" et accéder aux missions.</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.infoCard}>
                    <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Sécurité Maximale</Text>
                        <Text style={styles.infoDesc}>Vos données sont cryptées et stockées en conformité avec le RGPD.</Text>
                    </View>
                </View>

                {DOCUMENT_TYPES.map((doc) => (
                    <Pressable
                        key={doc.id}
                        style={[styles.uploadItem, uploads[doc.id] && styles.uploadItemDone]}
                        onPress={() => handleUpload(doc.id)}
                    >
                        <View style={[styles.iconContainer, uploads[doc.id] && styles.iconContainerDone]}>
                            <MaterialCommunityIcons
                                name={doc.icon as any}
                                size={28}
                                color={uploads[doc.id] ? "white" : Colors.primary}
                            />
                        </View>
                        <View style={styles.uploadInfo}>
                            <Text style={styles.uploadLabel}>{doc.label}</Text>
                            <Text style={styles.uploadStatus}>
                                {uploads[doc.id] ? "Document téléchargé • Modifier" : "Appuyez pour télécharger"}
                            </Text>
                        </View>
                        {uploads[doc.id] ? (
                            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                        ) : (
                            <Ionicons name="cloud-upload-outline" size={24} color={Colors.textMuted} />
                        )}
                    </Pressable>
                ))}

                <View style={styles.requirementsBox}>
                    <Text style={styles.reqTitle}>Format requis :</Text>
                    <Text style={styles.reqText}>• JPG, PNG ou PDF (max 5 Mo)</Text>
                    <Text style={styles.reqText}>• Lisibilité totale du document</Text>
                    <Text style={styles.reqText}>• Nom identique au profil Maîtrio</Text>
                </View>

                <Pressable
                    style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                    onPress={submitKYC}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitBtnText}>
                        {isSubmitting ? "ENVOI EN COURS..." : "SOUMETTRE MON DOSSIER"}
                    </Text>
                </Pressable>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { paddingHorizontal: 25, paddingBottom: 35, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "white", fontSize: 20, fontFamily: "Inter_700Bold", marginLeft: 15 },
    headerDesc: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
    content: { flex: 1, padding: 25 },
    infoCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", padding: 20, borderRadius: 24, marginBottom: 25, borderWidth: 1, borderColor: "#DBEAFE" },
    infoTextContainer: { marginLeft: 15, flex: 1 },
    infoTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1E40AF" },
    infoDesc: { fontSize: 12, color: "#1E40AF", marginTop: 4, lineHeight: 18 },
    uploadItem: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 16, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: "#E2E8F0" },
    uploadItemDone: { borderColor: Colors.success, backgroundColor: "#F0FDF410" },
    iconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    iconContainerDone: { backgroundColor: Colors.success },
    uploadInfo: { flex: 1, marginLeft: 15 },
    uploadLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
    uploadStatus: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
    requirementsBox: { backgroundColor: "white", padding: 20, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderStyle: "dashed", borderColor: Colors.border },
    reqTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 8 },
    reqText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
    submitBtn: { backgroundColor: Colors.primary, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: "white", fontSize: 16, fontFamily: "Inter_800ExtraBold", letterSpacing: 1 },
});
