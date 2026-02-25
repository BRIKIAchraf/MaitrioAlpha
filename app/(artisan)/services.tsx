import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const INITIAL_SERVICES = [
    { id: "1", name: "Installation Robinet", price: 65, duration: "1h", category: "Plomberie" },
    { id: "2", name: "Réparation Fuite", price: 85, duration: "1.5h", category: "Plomberie" },
    { id: "3", name: "Dépannage Ballon d'eau", price: 120, duration: "2h", category: "Plomberie" },
];

export default function ServicesManagementScreen() {
    const insets = useSafeAreaInsets();
    const [services, setServices] = useState(INITIAL_SERVICES);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");

    const addService = () => {
        if (!newName || !newPrice) return;
        const newService = {
            id: Date.now().toString(),
            name: newName,
            price: parseFloat(newPrice),
            duration: "1h",
            category: "Plomberie"
        };
        setServices([...services, newService]);
        setNewName("");
        setNewPrice("");
        setIsAdding(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const deleteService = (id: string) => {
        Alert.alert("Supprimer ?", "Voulez-vous supprimer ce service de votre liste ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: () => {
                    setServices(services.filter(s => s.id !== id));
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, "#312E81"]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Catalogue de Services</Text>
                </View>
                <Text style={styles.headerDesc}>Définissez vos prestations et vos tarifs pour les clients.</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryTitle}>Ma Visibilité</Text>
                    <Text style={styles.summaryText}>Vos services sont affichés dans un rayon de 25km autour de Paris.</Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mes Prestations</Text>
                    <Pressable onPress={() => setIsAdding(true)} style={styles.addBtn}>
                        <Ionicons name="add" size={20} color={Colors.primary} />
                        <Text style={styles.addBtnText}>Ajouter</Text>
                    </Pressable>
                </View>

                {isAdding && (
                    <View style={styles.addCard}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom du service (ex: Pose WC)"
                            value={newName}
                            onChangeText={setNewName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Prix (ex: 75)"
                            keyboardType="numeric"
                            value={newPrice}
                            onChangeText={setNewPrice}
                        />
                        <View style={styles.addActions}>
                            <Pressable style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
                                <Text style={styles.cancelBtnText}>Annuler</Text>
                            </Pressable>
                            <Pressable style={styles.confirmBtn} onPress={addService}>
                                <Text style={styles.confirmBtnText}>Enregistrer</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {services.map((service) => (
                    <View key={service.id} style={styles.serviceCard}>
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceName}>{service.name}</Text>
                            <Text style={styles.serviceSub}>{service.category} • {service.duration}</Text>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={styles.servicePrice}>{service.price}€</Text>
                            <Pressable onPress={() => deleteService(service.id)}>
                                <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                            </Pressable>
                        </View>
                    </View>
                ))}
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
    summaryBox: { backgroundColor: "white", padding: 20, borderRadius: 20, marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    summaryTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 8 },
    summaryText: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
    addBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    addBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.primary },
    addCard: { backgroundColor: "white", padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: Colors.primary },
    input: { backgroundColor: "#F1F5F9", height: 50, borderRadius: 12, paddingHorizontal: 15, marginBottom: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
    addActions: { flexDirection: "row", gap: 10 },
    cancelBtn: { flex: 1, height: 44, alignItems: "center", justifyContent: "center" },
    cancelBtnText: { color: Colors.textMuted, fontFamily: "Inter_700Bold" },
    confirmBtn: { flex: 1, height: 44, backgroundColor: Colors.primary, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    confirmBtnText: { color: "white", fontFamily: "Inter_800ExtraBold" },
    serviceCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 20, borderRadius: 24, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
    serviceSub: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
    priceContainer: { alignItems: "flex-end", gap: 10 },
    servicePrice: { fontSize: 18, fontFamily: "Inter_800ExtraBold", color: Colors.primary },
});
