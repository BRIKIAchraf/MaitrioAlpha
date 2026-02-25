import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Image, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const MOCK_USERS = [
    { id: "1", name: "Marie Dupont", email: "marie@example.com", role: "client", status: "actif", date: "2024-02-10" },
    { id: "2", name: "Pierre Martin", email: "pierre@example.com", role: "client", status: "actif", date: "2024-02-12" },
    { id: "3", name: "Sophie Bernard", email: "sophie@example.com", role: "client", status: "suspendu", date: "2024-01-28" },
];

export default function UserManagement() {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState("");

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Gestion Utilisateurs</Text>
                <Text style={styles.subtitle}>{MOCK_USERS.length} clients inscrits</Text>
            </View>

            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.textMuted} />
                <TextInput
                    placeholder="Chercher par nom ou email..."
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                data={MOCK_USERS}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.userCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.name[0]}</Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{item.name}</Text>
                            <Text style={styles.userEmail}>{item.email}</Text>
                        </View>
                        <View style={[styles.statusBadge, item.status === "suspendu" && styles.statusBadgeSuspend]}>
                            <Text style={[styles.statusText, item.status === "suspendu" && styles.statusTextSuspend]}>
                                {item.status}
                            </Text>
                        </View>
                        <Pressable style={styles.actionBtn}>
                            <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
                        </Pressable>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { padding: 20 },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
    subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Inter_400Regular" },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.surface,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 20
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
    list: { paddingHorizontal: 20, gap: 12 },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 18,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 2
    },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + "10", alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.primary },
    userInfo: { flex: 1, marginLeft: 12 },
    userName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
    userEmail: { fontSize: 12, color: Colors.textMuted, fontFamily: "Inter_400Regular" },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.successLight },
    statusBadgeSuspend: { backgroundColor: Colors.dangerLight },
    statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.success },
    statusTextSuspend: { color: Colors.danger },
    actionBtn: { padding: 4, marginLeft: 8 }
});
