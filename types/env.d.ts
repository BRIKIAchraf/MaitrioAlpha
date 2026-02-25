declare module 'react-native' {
    const content: any;
    export default content;
    export const View: any;
    export const Text: any;
    export const StyleSheet: any;
    export const ScrollView: any;
    export const Pressable: any;
    export const Image: any;
    export const Dimensions: any;
    export const Platform: any;
    export const Alert: any;
    export const Share: any;
}

declare module 'expo-router' {
    export const router: any;
    export const Link: any;
    export const useLocalSearchParams: any;
    export const useNavigation: any;
    export const Tabs: any;
    export const Stack: any;
}

declare module 'react-native-safe-area-context' {
    export const useSafeAreaInsets: any;
    export const SafeAreaProvider: any;
    export const SafeAreaView: any;
}

declare module 'expo-linear-gradient' {
    export const LinearGradient: any;
}

declare module '@expo/vector-icons' {
    export const Ionicons: any;
    export const MaterialCommunityIcons: any;
    export const FontAwesome: any;
}

declare module 'expo-haptics' {
    export const selectionAsync: any;
    export const impactAsync: any;
    export const notificationAsync: any;
    export enum ImpactFeedbackStyle {
        Light = 'light',
        Medium = 'medium',
        Heavy = 'heavy',
    }
    export enum NotificationFeedbackType {
        Success = 'success',
        Warning = 'warning',
        Error = 'error',
    }
}

declare module '@tanstack/react-query' {
    export const useQuery: any;
    export const useMutation: any;
    export const useQueryClient: any;
    export const QueryClient: any;
    export const QueryClientProvider: any;
}

declare module '@react-native-async-storage/async-storage' {
    const content: any;
    export default content;
}

declare module 'expo-crypto' {
    export const randomUUID: any;
    export const digestStringAsync: any;
    export const CryptoDigestAlgorithm: any;
    export const CryptoEncoding: any;
}
