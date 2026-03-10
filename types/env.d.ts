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
    export const FlatList: any;
    export type FlatList = any;
    export const RefreshControl: any;
    export const TextInput: any;
    export type TextInput = any;
    export const Animated: any;
    export const ActivityIndicator: any;
    export const KeyboardAvoidingView: any;
    export const Linking: any;
    export const Modal: any;
    export const Switch: any;
    export const Vibration: any;
    export const useColorScheme: any;
    export type ScrollViewProps = any;
    export type ViewStyle = any;
}

declare module 'react-native-reanimated' {
    const content: any;
    export default content;
    export const useSharedValue: any;
    export const useAnimatedStyle: any;
    export const withSpring: any;
    export const withTiming: any;
    export const withRepeat: any;
    export const withSequence: any;
    export const withDelay: any;
    export const Easing: any;
    export const interpolateColor: any;
    export const interpolate: any;
    export const Extrapolation: any;
}

declare module 'expo-router' {
    export const router: any;
    export const Link: any;
    export const Redirect: any;
    export const useLocalSearchParams: <T = any>() => T;
    export const useNavigation: any;
    export const Tabs: any;
    export const Stack: any;
    export const useSegments: any;
}

declare module 'expo-blur' {
    export const BlurView: any;
}

declare module 'react-native-gesture-handler' {
    export const GestureHandlerRootView: any;
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
    export const useQuery: <T = any, E = any, D = any, P = any>(options?: any) => any;
    export const useMutation: <T = any, E = any, V = any, C = any>(options?: any) => any;
    export const useQueryClient: () => any;
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
