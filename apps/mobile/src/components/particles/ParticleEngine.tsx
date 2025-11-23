import { BlurMask, Canvas, Circle, Group } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: { x: number; y: number };
  opacity: number;
  life: number;
}

interface ParticleEngineProps {
  particleCount?: number;
  colors?: string[];
  maxRadius?: number;
  minRadius?: number;
  speed?: number;
  blur?: number;
  style?: object;
}

export function ParticleEngine({
  particleCount = 30,
  colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4'],
  maxRadius = 8,
  minRadius = 2,
  speed = 1,
  blur = 4,
  style,
}: ParticleEngineProps) {
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(withTiming(1, { duration: 10000, easing: Easing.linear }), -1, false);

    return () => {
      cancelAnimation(time);
    };
  }, [time]);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      radius: minRadius + Math.random() * (maxRadius - minRadius),
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * speed * 2,
        y: (Math.random() - 0.5) * speed * 2,
      },
      opacity: 0.3 + Math.random() * 0.5,
      life: Math.random(),
    }));
  }, [particleCount, colors, maxRadius, minRadius, speed]);

  const animatedParticles = useDerivedValue(() => {
    return particles.map((p) => {
      const t = time.value;
      const cycleTime = (t + p.life) % 1;

      // Smooth floating motion
      const offsetX = Math.sin(cycleTime * Math.PI * 2 + p.id) * 30;
      const offsetY = Math.cos(cycleTime * Math.PI * 2 + p.id * 0.5) * 20;

      // Pulse effect
      const pulse = 0.8 + Math.sin(cycleTime * Math.PI * 4) * 0.2;

      return {
        ...p,
        currentX:
          (((p.x + offsetX + p.velocity.x * t * 100) % SCREEN_WIDTH) + SCREEN_WIDTH) % SCREEN_WIDTH,
        currentY:
          (((p.y + offsetY + p.velocity.y * t * 100) % SCREEN_HEIGHT) + SCREEN_HEIGHT) %
          SCREEN_HEIGHT,
        currentOpacity: p.opacity * pulse,
        currentRadius: p.radius * pulse,
      };
    });
  }, [time]);

  return (
    <Canvas style={[styles.canvas, style]}>
      <Group>
        {particles.map((particle, index) => (
          <AnimatedParticle
            key={particle.id}
            particle={particle}
            index={index}
            animatedParticles={animatedParticles}
            blur={blur}
          />
        ))}
      </Group>
    </Canvas>
  );
}

interface AnimatedParticleProps {
  particle: Particle;
  index: number;
  animatedParticles: {
    value: Array<
      Particle & {
        currentX: number;
        currentY: number;
        currentOpacity: number;
        currentRadius: number;
      }
    >;
  };
  blur: number;
}

function AnimatedParticle({ particle, index, animatedParticles, blur }: AnimatedParticleProps) {
  const cx = useDerivedValue(() => animatedParticles.value[index]?.currentX ?? particle.x);
  const cy = useDerivedValue(() => animatedParticles.value[index]?.currentY ?? particle.y);
  const r = useDerivedValue(() => animatedParticles.value[index]?.currentRadius ?? particle.radius);
  const opacity = useDerivedValue(
    () => animatedParticles.value[index]?.currentOpacity ?? particle.opacity,
  );

  return (
    <Circle cx={cx} cy={cy} r={r} color={particle.color} opacity={opacity}>
      <BlurMask blur={blur} style="normal" />
    </Circle>
  );
}

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ParticleEngine;
