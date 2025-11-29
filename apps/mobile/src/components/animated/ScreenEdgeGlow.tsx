import { BlurMask, Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScreenEdgeGlowProps {
  color?: string;
  intensity?: number;
  animated?: boolean;
  pulseSpeed?: number;
  edgeWidth?: number;
}

export function ScreenEdgeGlow({
  color = '#6366f1',
  intensity = 0.6,
  animated = true,
  pulseSpeed = 2000,
  edgeWidth = 60,
}: ScreenEdgeGlowProps) {
  const pulseValue = useSharedValue(0.4);

  useEffect(() => {
    if (animated) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: pulseSpeed, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: pulseSpeed, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [animated, pulseSpeed, pulseValue]);

  const opacity = useDerivedValue(() => {
    return intensity * pulseValue.value;
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Canvas style={styles.canvas}>
        {/* Left edge glow */}
        <Rect x={0} y={0} width={edgeWidth} height={SCREEN_HEIGHT} opacity={opacity}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(edgeWidth, 0)}
            colors={[`${color}`, 'transparent']}
          />
          <BlurMask blur={20} style="normal" />
        </Rect>

        {/* Right edge glow */}
        <Rect
          x={SCREEN_WIDTH - edgeWidth}
          y={0}
          width={edgeWidth}
          height={SCREEN_HEIGHT}
          opacity={opacity}
        >
          <LinearGradient
            start={vec(SCREEN_WIDTH - edgeWidth, 0)}
            end={vec(SCREEN_WIDTH, 0)}
            colors={['transparent', `${color}`]}
          />
          <BlurMask blur={20} style="normal" />
        </Rect>

        {/* Top edge glow */}
        <Rect x={0} y={0} width={SCREEN_WIDTH} height={edgeWidth} opacity={opacity}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, edgeWidth)}
            colors={[`${color}`, 'transparent']}
          />
          <BlurMask blur={20} style="normal" />
        </Rect>

        {/* Bottom edge glow */}
        <Rect
          x={0}
          y={SCREEN_HEIGHT - edgeWidth}
          width={SCREEN_WIDTH}
          height={edgeWidth}
          opacity={opacity}
        >
          <LinearGradient
            start={vec(0, SCREEN_HEIGHT - edgeWidth)}
            end={vec(0, SCREEN_HEIGHT)}
            colors={['transparent', `${color}`]}
          />
          <BlurMask blur={20} style="normal" />
        </Rect>
      </Canvas>
    </View>
  );
}

// Navigation transition edge effect - plays once on screen enter
interface NavigationEdgeEffectProps {
  color?: string;
  duration?: number;
}

export function NavigationEdgeEffect({
  color = '#6366f1',
  duration = 800,
}: NavigationEdgeEffectProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in, hold, then fade out
    opacity.value = withSequence(
      withTiming(0.9, { duration: duration * 0.25, easing: Easing.out(Easing.ease) }),
      withDelay(duration * 0.3, withTiming(0, { duration: duration * 0.45 })),
    );
    progress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
  }, [duration, opacity, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const edgeWidth = useDerivedValue(() => {
    return 40 + progress.value * 60;
  });

  const blur = useDerivedValue(() => {
    return 15 + progress.value * 20;
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Canvas style={styles.canvas}>
        {/* Animated left edge */}
        <Rect x={0} y={0} width={edgeWidth} height={SCREEN_HEIGHT}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(100, 0)}
            colors={[`${color}`, 'transparent']}
          />
          <BlurMask blur={blur} style="normal" />
        </Rect>

        {/* Animated right edge */}
        <Rect x={SCREEN_WIDTH - 100} y={0} width={100} height={SCREEN_HEIGHT}>
          <LinearGradient
            start={vec(SCREEN_WIDTH - 100, 0)}
            end={vec(SCREEN_WIDTH, 0)}
            colors={['transparent', `${color}`]}
          />
          <BlurMask blur={blur} style="normal" />
        </Rect>

        {/* Animated top edge */}
        <Rect x={0} y={0} width={SCREEN_WIDTH} height={edgeWidth}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 100)}
            colors={[`${color}`, 'transparent']}
          />
          <BlurMask blur={blur} style="normal" />
        </Rect>

        {/* Animated bottom edge */}
        <Rect x={0} y={SCREEN_HEIGHT - 100} width={SCREEN_WIDTH} height={100}>
          <LinearGradient
            start={vec(0, SCREEN_HEIGHT - 100)}
            end={vec(0, SCREEN_HEIGHT)}
            colors={['transparent', `${color}`]}
          />
          <BlurMask blur={blur} style="normal" />
        </Rect>
      </Canvas>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ScreenEdgeGlow;
