import { BlurMask, Canvas, Circle, Group, Path, Skia, vec } from '@shopify/react-native-skia';
import { useCallback, useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ParticleType = 'send' | 'receive' | 'firework' | 'sparkle';

interface MessageParticlesProps {
  type: ParticleType;
  x?: number;
  y?: number;
  color?: string;
  onComplete?: () => void;
  visible?: boolean;
}

// Sparkle particle effect for message sent
export function SparkleEffect({
  x = SCREEN_WIDTH / 2,
  y = 100,
  color = '#6366f1',
  onComplete,
  visible = true,
}: MessageParticlesProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  const sparkleCount = 8;
  const sparkles = useMemo(() => {
    return Array.from({ length: sparkleCount }, (_, i) => ({
      id: i,
      angle: (i / sparkleCount) * Math.PI * 2,
      distance: 20 + Math.random() * 30,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.2,
    }));
  }, []);

  useEffect(() => {
    if (visible) {
      progress.value = 0;
      opacity.value = 1;

      progress.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      opacity.value = withDelay(
        400,
        withTiming(0, { duration: 200 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        }),
      );
    }

    return () => {
      cancelAnimation(progress);
      cancelAnimation(opacity);
    };
  }, [visible, progress, opacity, onComplete]);

  const sparklePositions = useDerivedValue(() => {
    return sparkles.map((s) => {
      const p = Math.min(1, progress.value / (1 - s.delay));
      const currentDistance = s.distance * p;
      return {
        ...s,
        cx: x + Math.cos(s.angle) * currentDistance,
        cy: y + Math.sin(s.angle) * currentDistance,
        currentOpacity: opacity.value * (1 - p * 0.5),
        currentSize: s.size * (1 - p * 0.3),
      };
    });
  }, [progress, opacity]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Canvas style={styles.canvas}>
        <Group>
          {sparkles.map((sparkle, index) => (
            <SparkleParticle
              key={sparkle.id}
              sparkle={sparkle}
              index={index}
              sparklePositions={sparklePositions}
              color={color}
            />
          ))}
        </Group>
      </Canvas>
    </View>
  );
}

interface SparkleParticleProps {
  sparkle: { id: number; angle: number; distance: number; size: number; delay: number };
  index: number;
  sparklePositions: {
    value: Array<{ cx: number; cy: number; currentOpacity: number; currentSize: number }>;
  };
  color: string;
}

function SparkleParticle({ sparkle, index, sparklePositions, color }: SparkleParticleProps) {
  const cx = useDerivedValue(() => sparklePositions.value[index]?.cx ?? 0);
  const cy = useDerivedValue(() => sparklePositions.value[index]?.cy ?? 0);
  const r = useDerivedValue(() => sparklePositions.value[index]?.currentSize ?? sparkle.size);
  const opacity = useDerivedValue(() => sparklePositions.value[index]?.currentOpacity ?? 1);

  return (
    <Circle cx={cx} cy={cy} r={r} color={color} opacity={opacity}>
      <BlurMask blur={2} style="normal" />
    </Circle>
  );
}

// Firework effect for message read
export function FireworkEffect({
  x = SCREEN_WIDTH / 2,
  y = 100,
  color = '#22c55e',
  onComplete,
  visible = true,
}: MessageParticlesProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);

  const particleCount = 16;
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (i / particleCount) * Math.PI * 2,
      distance: 40 + Math.random() * 40,
      size: 2 + Math.random() * 3,
      speed: 0.8 + Math.random() * 0.4,
    }));
  }, []);

  useEffect(() => {
    if (visible) {
      progress.value = 0;
      opacity.value = 1;

      progress.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
      opacity.value = withDelay(
        500,
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        }),
      );
    }

    return () => {
      cancelAnimation(progress);
      cancelAnimation(opacity);
    };
  }, [visible, progress, opacity, onComplete]);

  const particlePositions = useDerivedValue(() => {
    return particles.map((p) => {
      const currentDistance = p.distance * progress.value * p.speed;
      // Add gravity effect
      const gravity = progress.value * progress.value * 30;
      return {
        ...p,
        cx: x + Math.cos(p.angle) * currentDistance,
        cy: y + Math.sin(p.angle) * currentDistance + gravity,
        currentOpacity: opacity.value * (1 - progress.value * 0.7),
        currentSize: p.size * (1 - progress.value * 0.5),
      };
    });
  }, [progress, opacity]);

  // Pre-compute derived values to avoid hook calls in JSX after conditional return
  const centerRadius = useDerivedValue(() => 10 * progress.value);
  const centerOpacity = useDerivedValue(() => opacity.value * (1 - progress.value));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Canvas style={styles.canvas}>
        <Group>
          {/* Center burst */}
          <Circle cx={x} cy={y} r={centerRadius} color={color} opacity={centerOpacity}>
            <BlurMask blur={8} style="normal" />
          </Circle>
          {/* Particles */}
          {particles.map((particle, index) => (
            <FireworkParticle
              key={particle.id}
              particle={particle}
              index={index}
              particlePositions={particlePositions}
              color={color}
            />
          ))}
        </Group>
      </Canvas>
    </View>
  );
}

interface FireworkParticleProps {
  particle: { id: number; angle: number; distance: number; size: number; speed: number };
  index: number;
  particlePositions: {
    value: Array<{ cx: number; cy: number; currentOpacity: number; currentSize: number }>;
  };
  color: string;
}

function FireworkParticle({ particle, index, particlePositions, color }: FireworkParticleProps) {
  const cx = useDerivedValue(() => particlePositions.value[index]?.cx ?? 0);
  const cy = useDerivedValue(() => particlePositions.value[index]?.cy ?? 0);
  const r = useDerivedValue(() => particlePositions.value[index]?.currentSize ?? particle.size);
  const opacity = useDerivedValue(() => particlePositions.value[index]?.currentOpacity ?? 1);

  return (
    <Circle cx={cx} cy={cy} r={r} color={color} opacity={opacity}>
      <BlurMask blur={3} style="normal" />
    </Circle>
  );
}

// Glowing orb for message sent status
export function GlowingOrb({
  x = SCREEN_WIDTH / 2,
  y = 100,
  color = '#6366f1',
  visible = true,
}: Omit<MessageParticlesProps, 'type'>) {
  const pulse = useSharedValue(0);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );

      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(glow);
    };
  }, [visible, pulse, glow]);

  const innerRadius = useDerivedValue(() => 4 + pulse.value * 2);
  const outerRadius = useDerivedValue(() => 8 + pulse.value * 4);
  const outerOpacity = useDerivedValue(() => glow.value * 0.5);

  if (!visible) return null;

  return (
    <Canvas style={styles.orbCanvas}>
      <Group>
        {/* Outer glow */}
        <Circle cx={x} cy={y} r={outerRadius} color={color} opacity={outerOpacity}>
          <BlurMask blur={8} style="normal" />
        </Circle>
        {/* Inner core */}
        <Circle cx={x} cy={y} r={innerRadius} color={color} opacity={0.9}>
          <BlurMask blur={2} style="normal" />
        </Circle>
      </Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  canvas: {
    flex: 1,
  },
  orbCanvas: {
    width: 40,
    height: 40,
  },
});

export default {
  SparkleEffect,
  FireworkEffect,
  GlowingOrb,
};
