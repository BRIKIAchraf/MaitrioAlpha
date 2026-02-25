import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

export const PROVIDER_GOOGLE = 'google';

export const Marker = ({ children, coordinate, title }: any) => {
    return (
        <View style={{ position: 'absolute', top: '50%', left: '50%' }}>
            {children}
        </View>
    );
};

const AnimatedMarker = Marker;
(Marker as any).Animated = AnimatedMarker;

export const Polyline = (props: any) => null;

const MapWrapper = React.forwardRef(({ children, style, initialRegion }: any, ref: any) => {
    return (
        <View style={[style, styles.webPlaceholder]}>
            <View style={styles.content}>
                <Ionicons name="map-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.webText}>Carte interactive disponible sur Native uniquement</Text>
                <Text style={styles.webSubtext}>
                    Simulation en cours... (Lat: {initialRegion?.latitude?.toFixed(4)}, Lng: {initialRegion?.longitude?.toFixed(4)})
                </Text>
            </View>
            {/* Absolute container for markers to avoid crashing but keep them visible for simulation logic if needed */}
            <View style={StyleSheet.absoluteFill}>
                {children}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    webPlaceholder: {
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 0,
    },
    webText: {
        marginTop: 15,
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: Colors.text,
        textAlign: 'center',
    },
    webSubtext: {
        marginTop: 8,
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: Colors.textMuted,
        textAlign: 'center',
    },
});

export default MapWrapper;
