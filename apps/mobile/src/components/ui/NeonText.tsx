import { useEffect } from 'react';
import { StyleSheet, type TextStyle, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface NeonTextProps {
  children: string;
  color?: string;
  glowColor?: string;
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  animated?: boolean;
  pulseSpeed?: number;
  style?: TextStyle;
}

export function NeonText({
  children,
  color = '#ffffff',
  glowColor = '#6366f1',
  fontSize = 24,
  fontWeight = 'bold',
  animated = true,
  pulseSpeed = 2000,
  style,
}: NeonTextProps) {
  const glowIntensity = useSharedValue(animated ? 0.5 : 1);

  useEffect(() => {
    if (animated) {
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: pulseSpeed / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: pulseSpeed / 2, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [animated, pulseSpeed, glowIntensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    textShadowRadius: 10 + glowIntensity.value * 20,
    opacity: 0.8 + glowIntensity.value * 0.2,
  }));

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          color,
          fontSize,
          fontWeight,
          textShadowColor: glowColor,
          textShadowOffset: { width: 0, height: 0 },
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.Text>
  );
}

// Gradient neon text with color cycling
interface GradientNeonTextProps {
  children: string;
  colors?: string[];
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  cycleSpeed?: number;
  style?: TextStyle;
}

export function GradientNeonText({
  children,
  colors = ['#ff00ff', '#00ffff', '#ff0080', '#00ff80'],
  fontSize = 24,
  fontWeight = 'bold',
  cycleSpeed = 4000,
  style,
}: GradientNeonTextProps) {
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    colorProgress.value = withRepeat(
      withTiming(colors.length - 1, { duration: cycleSpeed, easing: Easing.linear }),
      -1,
      false,
    );
  }, [colors.length, cycleSpeed, colorProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentColor = interpolateColor(
      colorProgress.value % (colors.length - 1),
      colors.map((_, i) => i),
      colors,
    );

    return {
      color: currentColor,
      textShadowColor: currentColor,
      textShadowRadius: 15,
      textShadowOffset: { width: 0, height: 0 },
    };
  });

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          fontSize,
          fontWeight,
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.Text>
  );
}

// Glitch text effect
interface GlitchTextProps {
  children: string;
  color?: string;
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  glitchIntensity?: number;
  style?: TextStyle;
}

export function GlitchText({
  children,
  color = '#ffffff',
  fontSize = 24,
  fontWeight = 'bold',
  glitchIntensity = 3,
  style,
}: GlitchTextProps) {
  const glitchX = useSharedValue(0);
  const glitchY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const glitch = () => {
      // Random glitch effect
      glitchX.value = withSequence(
        withTiming((Math.random() - 0.5) * glitchIntensity, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );

      glitchY.value = withSequence(
        withTiming((Math.random() - 0.5) * glitchIntensity, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );

      opacity.value = withSequence(
        withTiming(0.8, { duration: 30 }),
        withTiming(1, { duration: 30 }),
      );
    };

    // Random glitch intervals
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        glitch();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [glitchIntensity, glitchX, glitchY, opacity]);

  const mainStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: glitchX.value }, { translateY: glitchY.value }],
    opacity: opacity.value,
  }));

  const redStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -glitchX.value * 2 }],
    opacity: Math.abs(glitchX.value) > 0.5 ? 0.7 : 0,
  }));

  const blueStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: glitchX.value * 2 }],
    opacity: Math.abs(glitchX.value) > 0.5 ? 0.7 : 0,
  }));

  return (
    <View style={styles.glitchContainer}>
      {/* Red offset layer */}
      <Animated.Text
        style={[styles.glitchLayer, { color: '#ff0000', fontSize, fontWeight }, redStyle]}
      >
        {children}
      </Animated.Text>

      {/* Blue offset layer */}
      <Animated.Text
        style={[styles.glitchLayer, { color: '#00ffff', fontSize, fontWeight }, blueStyle]}
      >
        {children}
      </Animated.Text>

      {/* Main text */}
      <Animated.Text style={[styles.text, { color, fontSize, fontWeight }, mainStyle, style]}>
        {children}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
  glitchContainer: {
    position: 'relative',
  },
  glitchLayer: {
    position: 'absolute',
    textAlign: 'center',
  },
});

export default NeonText;
