import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  Rect,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ThemeType = 'cyberpunk' | 'aurora' | 'ocean' | 'space' | 'retrowave';

interface BackgroundParticlesProps {
  theme?: ThemeType;
  intensity?: number;
  children?: React.ReactNode;
}

const themeConfigs: Record<
  ThemeType,
  {
    colors: string[];
    particleCount: number;
    blur: number;
    speed: number;
    maxRadius: number;
    minRadius: number;
  }
> = {
  cyberpunk: {
    colors: ['#ff00ff', '#00ffff', '#ff0080', '#00ff80', '#ffff00'],
    particleCount: 25,
    blur: 6,
    speed: 0.8,
    maxRadius: 6,
    minRadius: 2,
  },
  aurora: {
    colors: ['#00ff88', '#00ffcc', '#00ccff', '#0088ff', '#8800ff'],
    particleCount: 20,
    blur: 12,
    speed: 0.3,
    maxRadius: 40,
    minRadius: 15,
  },
  ocean: {
    colors: ['#0066cc', '#0099ff', '#00ccff', '#66ffff', '#ffffff'],
    particleCount: 30,
    blur: 8,
    speed: 0.5,
    maxRadius: 10,
    minRadius: 3,
  },
  space: {
    colors: ['#ffffff', '#ffffcc', '#ccccff', '#ffccff', '#ccffff'],
    particleCount: 60,
    blur: 2,
    speed: 0.2,
    maxRadius: 3,
    minRadius: 1,
  },
  retrowave: {
    colors: ['#ff1493', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'],
    particleCount: 20,
    blur: 8,
    speed: 0.6,
    maxRadius: 8,
    minRadius: 3,
  },
};

export function BackgroundParticles({
  theme = 'cyberpunk',
  intensity = 1,
  children,
}: BackgroundParticlesProps) {
  const config = themeConfigs[theme];
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(withTiming(1, { duration: 20000, easing: Easing.linear }), -1, false);

    return () => {
      cancelAnimation(time);
    };
  }, [time]);

  const particles = useMemo(() => {
    const count = Math.floor(config.particleCount * intensity);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      radius: config.minRadius + Math.random() * (config.maxRadius - config.minRadius),
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      opacity: 0.2 + Math.random() * 0.4,
    }));
  }, [config, intensity]);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Group>
          {theme === 'aurora' && <AuroraEffect time={time} colors={config.colors} />}
          {theme === 'space' && <StarField time={time} particles={particles} config={config} />}
          {theme !== 'aurora' && theme !== 'space' && (
            <FloatingParticles time={time} particles={particles} config={config} />
          )}
        </Group>
      </Canvas>
      {children}
    </View>
  );
}

interface AuroraEffectProps {
  time: { value: number };
  colors: string[];
}

function AuroraEffect({ time, colors }: AuroraEffectProps) {
  const waveCount = 5;

  const waves = useMemo(() => {
    return Array.from({ length: waveCount }, (_, i) => ({
      id: i,
      yOffset: SCREEN_HEIGHT * 0.2 + i * (SCREEN_HEIGHT * 0.15),
      color: colors[i % colors.length],
      amplitude: 30 + i * 10,
      frequency: 0.005 + i * 0.002,
      phase: i * 0.5,
    }));
  }, [colors]);

  return (
    <Group>
      {waves.map((wave) => (
        <AuroraWave key={wave.id} wave={wave} time={time} />
      ))}
    </Group>
  );
}

interface AuroraWaveProps {
  wave: {
    id: number;
    yOffset: number;
    color: string;
    amplitude: number;
    frequency: number;
    phase: number;
  };
  time: { value: number };
}

function AuroraWave({ wave, time }: AuroraWaveProps) {
  const path = useDerivedValue(() => {
    const skPath = Skia.Path.Make();
    const t = time.value * Math.PI * 2;

    skPath.moveTo(0, wave.yOffset);

    for (let x = 0; x <= SCREEN_WIDTH; x += 10) {
      const y =
        wave.yOffset +
        Math.sin(x * wave.frequency + t + wave.phase) * wave.amplitude +
        Math.sin(x * wave.frequency * 2 + t * 1.5) * (wave.amplitude * 0.5);
      skPath.lineTo(x, y);
    }

    skPath.lineTo(SCREEN_WIDTH, SCREEN_HEIGHT);
    skPath.lineTo(0, SCREEN_HEIGHT);
    skPath.close();

    return skPath;
  }, [time]);

  return (
    <Path path={path} color={wave.color} opacity={0.15}>
      <BlurMask blur={30} style="normal" />
    </Path>
  );
}

interface StarFieldProps {
  time: { value: number };
  particles: Array<{
    id: number;
    x: number;
    y: number;
    radius: number;
    color: string;
    phase: number;
    speed: number;
    opacity: number;
  }>;
  config: typeof themeConfigs.space;
}

function StarField({ time, particles, config }: StarFieldProps) {
  return (
    <Group>
      {particles.map((star) => (
        <Star key={star.id} star={star} time={time} />
      ))}
    </Group>
  );
}

interface StarProps {
  star: {
    id: number;
    x: number;
    y: number;
    radius: number;
    color: string;
    phase: number;
    speed: number;
    opacity: number;
  };
  time: { value: number };
}

function Star({ star, time }: StarProps) {
  const opacity = useDerivedValue(() => {
    const t = time.value * Math.PI * 2;
    const twinkle = Math.sin(t * star.speed * 3 + star.phase);
    return star.opacity * (0.5 + twinkle * 0.5);
  }, [time]);

  const radius = useDerivedValue(() => {
    const t = time.value * Math.PI * 2;
    const pulse = Math.sin(t * star.speed * 2 + star.phase);
    return star.radius * (0.8 + pulse * 0.2);
  }, [time]);

  return (
    <Circle cx={star.x} cy={star.y} r={radius} color={star.color} opacity={opacity}>
      <BlurMask blur={1} style="normal" />
    </Circle>
  );
}

interface FloatingParticlesProps {
  time: { value: number };
  particles: Array<{
    id: number;
    x: number;
    y: number;
    radius: number;
    color: string;
    phase: number;
    speed: number;
    opacity: number;
  }>;
  config: typeof themeConfigs.cyberpunk;
}

function FloatingParticles({ time, particles, config }: FloatingParticlesProps) {
  return (
    <Group>
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} time={time} blur={config.blur} />
      ))}
    </Group>
  );
}

interface FloatingParticleProps {
  particle: {
    id: number;
    x: number;
    y: number;
    radius: number;
    color: string;
    phase: number;
    speed: number;
    opacity: number;
  };
  time: { value: number };
  blur: number;
}

function FloatingParticle({ particle, time, blur }: FloatingParticleProps) {
  const cx = useDerivedValue(() => {
    const t = time.value * Math.PI * 2;
    return (
      (particle.x + Math.sin(t * particle.speed + particle.phase) * 50 + SCREEN_WIDTH) %
      SCREEN_WIDTH
    );
  }, [time]);

  const cy = useDerivedValue(() => {
    const t = time.value * Math.PI * 2;
    return (
      (particle.y + Math.cos(t * particle.speed * 0.7 + particle.phase) * 30 + SCREEN_HEIGHT) %
      SCREEN_HEIGHT
    );
  }, [time]);

  const opacity = useDerivedValue(() => {
    const t = time.value * Math.PI * 2;
    return particle.opacity * (0.7 + Math.sin(t * particle.speed * 2) * 0.3);
  }, [time]);

  return (
    <Circle cx={cx} cy={cy} r={particle.radius} color={particle.color} opacity={opacity}>
      <BlurMask blur={blur} style="normal" />
    </Circle>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default BackgroundParticles;
