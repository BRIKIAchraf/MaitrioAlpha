import React, { useState, useEffect } from "react";
import * as RN from "react-native";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";

interface User {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
    kycStatus?: string;
    createdAt: string;
    name?: string;
}

export default function UserManagement() {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const res = await apiRequest("GET", "/api/admin/users");
            const data = await res.json();
            setUsers(data.map((u: any) => ({
                ...u,
                name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username
            })));
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <RN.View style={[styles.container, { paddingTop: insets.top }]}>
            <RN.View style={styles.header}>
                <RN.Text style={styles.title}>Gestion Utilisateurs</RN.Text>
                <RN.Text style={styles.subtitle}>{isLoading ? "Chargement..." : `${filteredUsers.length} comptes trouvés`}</RN.Text>
            </RN.View>

            <RN.View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={Colors.textMuted} />
                <RN.TextInput
                    placeholder="Chercher par nom, email ou rôle..."
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </RN.View>

            <RN.FlatList
                data={filteredUsers}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                onRefresh={fetchUsers}
                refreshing={isLoading}
                renderItem={({ item }: { item: any }) => (
                    <RN.View style={styles.userCard}>
                        <RN.View style={styles.avatar}>
                            <RN.Text style={styles.avatarText}>{item.name?.[0]}</RN.Text>
                        </RN.View>
                        <RN.View style={styles.userInfo}>
                            <RN.Text style={styles.userName}>{item.name}</RN.Text>
                            <RN.Text style={styles.userEmail}>{item.email} • {item.role}</RN.Text>
                        </RN.View>
                        <RN.View style={[styles.statusBadge, item.kycStatus === "rejected" && styles.statusBadgeSuspend]}>
                            <RN.Text style={[styles.statusText, item.kycStatus === "rejected" && styles.statusTextSuspend]}>
                                {item.kycStatus || "actif"}
                            </RN.Text>
                        </RN.View>
                        <RN.Pressable style={styles.actionBtn}>
                            <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
                        </RN.Pressable>
                    </RN.View>
                )}
                ListEmptyComponent={() => (
                    <RN.View style={{ alignItems: "center", marginTop: 40 }}>
                        <RN.Text style={{ color: Colors.textMuted }}>Aucun utilisateur trouvé.</RN.Text>
                    </RN.View>
                )}
            />
        </RN.View>
    );
}

const styles = RN.StyleSheet.create({
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
        ...Platform.select({
            web: {
                boxShadow: `0px 2px 6px ${Colors.shadow}`,
            },
            default: {
                shadowColor: Colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 6,
                elevation: 2
            }
        })
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
