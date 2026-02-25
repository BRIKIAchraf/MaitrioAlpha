import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    Platform,
    Linking,
    Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "@/components/MapWrapper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useMissions, Mission } from "@/context/mission-context";


const { width, height } = Dimensions.get("window");

function MissionTrackingScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { missions, updateMission } = useMissions();
    const { user } = useAuth();
    const mission = missions.find((m) => m.id === id);

    const [currentLocation, setCurrentLocation] = useState({ lat: mission?.latitude || 48.8566, lng: mission?.longitude || 2.3522 });
    const [distance, setDistance] = useState(1200); // 1.2km mocked
    const [eta, setEta] = useState(8); // 8 mins mocked

    const mapRef = useRef<any>(null);
    const destLat = mission?.latitude || 48.8566;
    const destLng = mission?.longitude || 2.3522;
    const bottomSheetY = useSharedValue(height);

    useEffect(() => {
        bottomSheetY.value = withSpring(height - 280, { damping: 15 });
    }, []);

    // Simulate movement
    useEffect(() => {
        if (!mission || mission.status !== "en_route") return;

        const interval = setInterval(() => {
            setDistance((prev) => {
                const next = Math.max(0, prev - 50);
                if (next === 500) {
                    Alert.alert("Elite Flow", "Votre artisan arrive bientôt ! (moins de 500m)");
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                if (next === 100) {
                    Alert.alert("Elite Flow", "Votre artisan est devant votre logement.");
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                return next;
            });

            setEta((prev) => Math.max(1, Math.round(distance / 150)));

            // Move marker slightly towards client
            if (true) {
                const step = 0.0005;
                const dLat = destLat - currentLocation.lat;
                const dLng = destLng - currentLocation.lng;
                const magnitude = Math.sqrt(dLat * dLat + dLng * dLng);

                if (magnitude > step) {
                    const nextLocation = {
                        lat: currentLocation.lat + (dLat / magnitude) * step,
                        lng: currentLocation.lng + (dLng / magnitude) * step,
                    };
                    setCurrentLocation(nextLocation);
                    
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [mission, currentLocation]);

    const bottomSheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bottomSheetY.value }],
    }));

    if (!mission) return <View style={styles.centered}><Text>Mission introuvable</Text></View>;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: ((currentLocation.lat) + (destLat)) / 2,
                    longitude: ((currentLocation.lng) + (destLng)) / 2,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {true && (
                    <Marker
                        coordinate={{ latitude: destLat, longitude: destLng }}
                        title="Votre domicile"
                    >
                        <View style={styles.homeMarker}>
                            <Ionicons name="home" size={20} color="white" />
                        </View>
                        <View style={styles.geofenceCircle} />
                    </Marker>
                )}

                {currentLocation && (
                    <Marker
                        coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
                        title={mission?.title}
                    >
                        <View style={styles.artisanMarker}>
                            <MaterialCommunityIcons name="car-electric" size={24} color="white" />
                        </View>
                    </Marker>
                )}

                {true && currentLocation?.lat != null && currentLocation?.lng != null && (
                    <Polyline
                        coordinates={[
                            { latitude: currentLocation.lat, longitude: currentLocation.lng },
                            { latitude: destLat, longitude: destLng },
                        ] as any}
                        strokeColor={Colors.primary}
                        strokeWidth={4}
                        lineDashPattern={[5, 5]}
                    />
                )}
            </MapView>

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color={Colors.text} />
                </Pressable>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{mission?.title}</Text>
                    <View style={styles.guaranteeRow}>
                        <Ionicons name="time-outline" size={14} color={Colors.primary} />
                        <Text style={styles.guaranteeText}>Garantie 30min: 14:22 restants</Text>
                    </View>
                </View>
                <Pressable
                    style={styles.visioBtn}
                    onPress={() => Alert.alert("Visio-Check Gratuite", "Lancement de l'appel vidéo de 5 min pour confirmer le diagnostic...")}
                >
                    <Ionicons name="videocam" size={20} color="white" />
                </Pressable>
                <Pressable
                    style={styles.sosButton}
                    onPress={() => Alert.alert(
                        "SIGNALEMENT D'URGENCE",
                        "Voulez-vous signaler un danger immédiat ?",
                        [
                            { text: "Annuler", style: "cancel" },
                            { text: "ALERTER", style: "destructive" }
                        ]
                    )}
                >
                    <Text style={styles.sosText}>S.O.S</Text>
                </Pressable>
            </View>

            {/* Bottom Sheet */}
            <Animated.View style={[styles.bottomSheet, bottomSheetStyle]}>
                <View style={styles.sheetHandle} />

                <View style={styles.artisanInfo}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.avatar}>
                            <Text style={styles.avatarText}>{mission?.title?.charAt(0)}</Text>
                        </LinearGradient>
                        <View style={styles.badgeContainer}>
                            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                        </View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.artisanName}>{mission?.title}</Text>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>4.9 (128 avis)</Text>
                        </View>
                    </View>

                    <View style={styles.etaContainer}>
                        <Text style={styles.etaTime}>{eta} min</Text>
                        <Text style={styles.etaLabel}>{distance > 1000 ? (distance / 1000).toFixed(1) + ' km' : distance + ' m'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.actions}>
                    {user?.role === 'artisan' ? (
                        <>
                            <Pressable
                                style={[styles.actionButton, styles.quoteButton]}
                                onPress={() => router.push(`/mission/${mission.id}/quote`)}
                            >
                                <Ionicons name="document-text" size={22} color="white" />
                                <Text style={[styles.actionText, { color: 'white' }]}>Créer Devis</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.actionButton, styles.completeButton]}
                                onPress={() => router.push(`/mission/${mission.id}/completion`)}
                            >
                                <Ionicons name="checkmark-done" size={22} color="white" />
                                <Text style={[styles.actionText, { color: 'white' }]}>Terminer</Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <Pressable
                                style={[styles.actionButton, distance > 50 && styles.disabledAction]}
                                onPress={() => distance <= 50 ? Alert.alert("Travail démarré", "Le chronomètre de facturation est activé.") : Alert.alert("Trop loin", "L'artisan n'est pas encore arrivé.")}
                            >
                                <Ionicons name="play" size={22} color={distance <= 50 ? Colors.primary : Colors.textMuted} />
                                <Text style={[styles.actionText, distance > 50 && { color: Colors.textMuted }]}>Suivi Direct</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.actionButton, styles.chatButton]}
                                onPress={() => router.push(`/chat/${mission.id}`)}
                            >
                                <Ionicons name="chatbubble" size={22} color="white" />
                                <Text style={[styles.actionText, { color: 'white' }]}>Message</Text>
                            </Pressable>
                        </>
                    )}
                </View>

                {distance <= 50 && (
                    <View style={styles.geofenceAlert}>
                        <Ionicons name="location" size={16} color="#16A34A" />
                        <Text style={styles.geofenceText}>Zone de confiance atteinte (Portée 50m)</Text>
                    </View>
                )}

                <View style={styles.lottieContainer}>
                    <LottieAnimation
                        source={{ uri: "https://assets9.lottiefiles.com/packages/lf20_m6zL9X.json" }}
                        style={{ width: 60, height: 60 }}
                    />
                    <Text style={styles.lottieText}>Artisan en route pour votre mission</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    map: { flex: 1 },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: { flex: 1, marginLeft: 15 },
    headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
    headerSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
    sosButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#FF3B30',
    },
    sosText: { color: 'white', fontFamily: "Inter_700Bold", fontSize: 12 },
    homeMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#22C55E',
        borderWidth: 3,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    artisanMarker: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    bottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: 300,
        paddingHorizontal: 24,
        paddingTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
        alignSelf: 'center',
        marginBottom: 20,
    },
    artisanInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: { position: 'relative' },
    avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    badgeContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    textContainer: { flex: 1, marginLeft: 15 },
    artisanName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { marginLeft: 4, fontSize: 13, color: Colors.textSecondary },
    etaContainer: { alignItems: 'flex-end' },
    etaTime: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.primary },
    etaLabel: { fontSize: 13, color: Colors.textMuted },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
    actions: { flexDirection: 'row', gap: 12 },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    chatButton: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    actionText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.primary },
    lottieContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingRight: 15,
    },
    lottieText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_500Medium" },
    visioBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginRight: 10 },
    guaranteeRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
    guaranteeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.primary, marginLeft: 4 },
    geofenceCircle: { position: "absolute", top: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(34, 197, 94, 0.1)", borderWidth: 1, borderColor: "rgba(34, 197, 94, 0.3)", zIndex: -1 },
    disabledAction: { borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
    geofenceAlert: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0FDF4", padding: 10, borderRadius: 12, marginTop: 15, justifyContent: "center" },
    geofenceText: { fontSize: 12, color: "#16A34A", fontFamily: "Inter_600SemiBold", marginLeft: 6 },
    quoteButton: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    completeButton: { backgroundColor: Colors.success, borderColor: Colors.success },
});

export default MissionTrackingScreen;
