import React, { useRef, useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import LottieView from "lottie-react-native";

interface LottieAnimationProps {
    source: any;
    autoPlay?: boolean;
    loop?: boolean;
    style?: ViewStyle;
}

export default function LottieAnimation({
    source,
    autoPlay = true,
    loop = true,
    style
}: LottieAnimationProps) {
    const animation = useRef<LottieView>(null);

    return (
        <View style={[styles.container, style]}>
            <LottieView
                ref={animation}
                source={source}
                autoPlay={autoPlay}
                loop={loop}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 200,
    },
});
