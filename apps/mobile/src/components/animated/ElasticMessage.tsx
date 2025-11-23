import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ElasticMessageProps {
  children: React.ReactNode;
  isSent?: boolean;
  isNew?: boolean;
  delay?: number;
  style?: ViewStyle;
  bubbleColor?: string;
}

export function ElasticMessage({
  children,
  isSent = false,
  isNew = true,
  delay = 0,
  style,
  bubbleColor,
}: ElasticMessageProps) {
  const scale = useSharedValue(isNew ? 0 : 1);
  const translateX = useSharedValue(isNew ? (isSent ? 50 : -50) : 0);
  const rotate = useSharedValue(isNew ? (isSent ? 10 : -10) : 0);
  const opacity = useSharedValue(isNew ? 0 : 1);

  useEffect(() => {
    if (isNew) {
      // Elastic entrance animation
      scale.value = withDelay(
        delay,
        withSpring(1, {
          damping: 8,
          stiffness: 150,
          mass: 0.5,
        }),
      );

      translateX.value = withDelay(
        delay,
        withSpring(0, {
          damping: 12,
          stiffness: 180,
        }),
      );

      rotate.value = withDelay(
        delay,
        withSequence(
          withSpring(isSent ? -5 : 5, { damping: 8, stiffness: 200 }),
          withSpring(0, { damping: 12, stiffness: 150 }),
        ),
      );

      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) }),
      );
    }
  }, [isNew, isSent, delay, scale, translateX, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const defaultBubbleColor = isSent ? '#6366f1' : '#1a1a1a';

  return (
    <Animated.View
      style={[
        styles.container,
        isSent ? styles.sentContainer : styles.receivedContainer,
        animatedStyle,
        style,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSent ? styles.sentBubble : styles.receivedBubble,
          { backgroundColor: bubbleColor || defaultBubbleColor },
        ]}
      >
        {children}
      </View>
    </Animated.View>
  );
}

// Bounce effect for send action
export function useSendBounce() {
  const bounceValue = useSharedValue(1);

  const bounce = () => {
    bounceValue.value = withSequence(
      withTiming(0.9, { duration: 100, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceValue.value }],
  }));

  return { bounce, animatedStyle };
}

// Wobble effect for received messages
export function useWobble() {
  const wobble = useSharedValue(0);

  const startWobble = () => {
    wobble.value = withSequence(
      withTiming(1, { duration: 100 }),
      withSpring(0, { damping: 5, stiffness: 150 }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(wobble.value, [0, 0.5, 1], [0, -3, 3]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return { startWobble, animatedStyle };
}

// Press feedback animation
export function usePressAnimation() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withTiming(0.95, { duration: 100, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { onPressIn, onPressOut, animatedStyle };
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 8,
  },
  sentContainer: {
    alignSelf: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentBubble: {
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    borderBottomLeftRadius: 4,
  },
});

export default ElasticMessage;
