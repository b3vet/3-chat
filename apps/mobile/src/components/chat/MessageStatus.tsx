import { BlurMask, Canvas, Circle, Group, LinearGradient, vec } from '@shopify/react-native-skia';
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read';
  size?: number;
  color?: string;
}

const STATUS_COLORS = {
  sent: '#6b7280',
  delivered: '#3b82f6',
  read: '#22c55e',
};

// Glowing orb for "sent" status
const SentIndicator = memo(function SentIndicator({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(pulse);
    };
  }, [pulse]);

  const blurRadius = useDerivedValue(() => interpolate(pulse.value, [0, 1], [2, 6]));

  const scale = useDerivedValue(() => interpolate(pulse.value, [0, 1], [1, 1.2]));

  return (
    <Canvas style={{ width: size, height: size }}>
      <Group transform={[{ translateX: size / 2 }, { translateY: size / 2 }]}>
        <Group transform={[{ scale: scale.value }]}>
          <Circle cx={0} cy={0} r={size / 4}>
            <LinearGradient
              start={vec(-size / 4, -size / 4)}
              end={vec(size / 4, size / 4)}
              colors={[color, `${color}88`]}
            />
            <BlurMask blur={blurRadius.value} style="solid" />
          </Circle>
          <Circle cx={0} cy={0} r={size / 6} color={color} />
        </Group>
      </Group>
    </Canvas>
  );
});

// Sparkles for "delivered" status
const DeliveredIndicator = memo(function DeliveredIndicator({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(animation);
    };
  }, [animation]);

  const sparkle1Y = useDerivedValue(() =>
    interpolate(animation.value, [0, 1], [size / 2, -size / 4]),
  );

  const sparkle2Y = useDerivedValue(() =>
    interpolate((animation.value + 0.33) % 1, [0, 1], [size / 2, -size / 4]),
  );

  const sparkle3Y = useDerivedValue(() =>
    interpolate((animation.value + 0.66) % 1, [0, 1], [size / 2, -size / 4]),
  );

  const sparkle1Opacity = useDerivedValue(() =>
    interpolate(animation.value, [0, 0.5, 1], [0, 1, 0]),
  );

  const sparkle2Opacity = useDerivedValue(() =>
    interpolate((animation.value + 0.33) % 1, [0, 0.5, 1], [0, 1, 0]),
  );

  const sparkle3Opacity = useDerivedValue(() =>
    interpolate((animation.value + 0.66) % 1, [0, 0.5, 1], [0, 1, 0]),
  );

  return (
    <Canvas style={{ width: size, height: size }}>
      <Circle
        cx={size / 4}
        cy={sparkle1Y.value}
        r={2}
        color={color}
        opacity={sparkle1Opacity.value}
      >
        <BlurMask blur={1} style="solid" />
      </Circle>
      <Circle
        cx={size / 2}
        cy={sparkle2Y.value}
        r={2}
        color={color}
        opacity={sparkle2Opacity.value}
      >
        <BlurMask blur={1} style="solid" />
      </Circle>
      <Circle
        cx={(size * 3) / 4}
        cy={sparkle3Y.value}
        r={2}
        color={color}
        opacity={sparkle3Opacity.value}
      >
        <BlurMask blur={1} style="solid" />
      </Circle>
      <Circle cx={size / 2} cy={size / 2} r={size / 6} color={color} />
    </Canvas>
  );
});

// Checkmarks for "read" status with burst effect
const ReadIndicator = memo(function ReadIndicator({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  const burstProgress = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    // Initial burst animation
    burstProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );

    checkScale.value = withSpring(1, { damping: 10, stiffness: 100 });

    return () => {
      cancelAnimation(burstProgress);
      cancelAnimation(checkScale);
    };
  }, [burstProgress, checkScale]);

  const burstRadius = useDerivedValue(() =>
    interpolate(burstProgress.value, [0, 1], [size / 4, size]),
  );

  const burstOpacity = useDerivedValue(() =>
    interpolate(burstProgress.value, [0, 0.5, 1], [0.6, 0.3, 0]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={burstRadius.value}
          color={color}
          opacity={burstOpacity.value}
        >
          <BlurMask blur={4} style="normal" />
        </Circle>
      </Canvas>
      <Animated.View style={[styles.checkContainer, animatedStyle]}>
        <Canvas style={{ width: size, height: size }}>
          <Circle cx={size / 2} cy={size / 2} r={size / 4} color={color}>
            <BlurMask blur={2} style="solid" />
          </Circle>
          <Circle cx={size / 2} cy={size / 2} r={size / 6} color={color} />
        </Canvas>
      </Animated.View>
    </View>
  );
});

const MessageStatus = memo(function MessageStatus({
  status,
  size = 20,
  color,
}: MessageStatusProps) {
  const statusColor = color || STATUS_COLORS[status] || STATUS_COLORS.sent;

  switch (status) {
    case 'delivered':
      return <DeliveredIndicator size={size} color={statusColor} />;
    case 'read':
      return <ReadIndicator size={size} color={statusColor} />;
    default:
      return <SentIndicator size={size} color={statusColor} />;
  }
});

const styles = StyleSheet.create({
  checkContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MessageStatus;
