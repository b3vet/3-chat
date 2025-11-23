import { BlurMask, Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type TransitionType = 'portal' | 'slide' | 'fade' | 'zoom' | 'flip';

interface PortalTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  type?: TransitionType;
  duration?: number;
  onTransitionComplete?: () => void;
  portalColor?: string;
  style?: ViewStyle;
}

export function PortalTransition({
  children,
  isVisible,
  type = 'portal',
  duration = 500,
  onTransitionComplete,
  portalColor = '#6366f1',
  style,
}: PortalTransitionProps) {
  const progress = useSharedValue(isVisible ? 1 : 0);
  const portalScale = useSharedValue(isVisible ? 3 : 0);
  const contentOpacity = useSharedValue(isVisible ? 1 : 0);
  const contentScale = useSharedValue(isVisible ? 1 : 0.8);

  useEffect(() => {
    if (isVisible) {
      // Opening animation
      portalScale.value = 0;
      contentOpacity.value = 0;
      contentScale.value = 0.8;

      portalScale.value = withTiming(3, {
        duration: duration * 0.6,
        easing: Easing.out(Easing.cubic),
      });

      contentOpacity.value = withDelay(
        duration * 0.3,
        withTiming(1, { duration: duration * 0.4, easing: Easing.out(Easing.ease) }),
      );

      contentScale.value = withDelay(
        duration * 0.3,
        withSpring(1, { damping: 15, stiffness: 150 }, (finished) => {
          if (finished && onTransitionComplete) {
            runOnJS(onTransitionComplete)();
          }
        }),
      );

      progress.value = withTiming(1, { duration });
    } else {
      // Closing animation
      contentOpacity.value = withTiming(0, {
        duration: duration * 0.3,
        easing: Easing.in(Easing.ease),
      });

      contentScale.value = withTiming(0.8, {
        duration: duration * 0.3,
        easing: Easing.in(Easing.ease),
      });

      portalScale.value = withDelay(
        duration * 0.2,
        withTiming(
          0,
          {
            duration: duration * 0.4,
            easing: Easing.in(Easing.cubic),
          },
          (finished) => {
            if (finished && onTransitionComplete) {
              runOnJS(onTransitionComplete)();
            }
          },
        ),
      );

      progress.value = withTiming(0, { duration });
    }
  }, [
    isVisible,
    duration,
    portalScale,
    contentOpacity,
    contentScale,
    progress,
    onTransitionComplete,
  ]);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'slide':
        return {
          opacity: contentOpacity.value,
          transform: [{ translateX: interpolate(contentOpacity.value, [0, 1], [100, 0]) }],
        };
      case 'fade':
        return {
          opacity: contentOpacity.value,
        };
      case 'zoom':
        return {
          opacity: contentOpacity.value,
          transform: [{ scale: contentScale.value }],
        };
      case 'flip':
        return {
          opacity: contentOpacity.value,
          transform: [
            { perspective: 1000 },
            { rotateY: `${interpolate(contentOpacity.value, [0, 1], [90, 0])}deg` },
          ],
        };
      default:
        return {
          opacity: contentOpacity.value,
          transform: [{ scale: contentScale.value }],
        };
    }
  });

  const portalOpacity = useSharedValue(1);

  useEffect(() => {
    if (type === 'portal') {
      if (isVisible) {
        portalOpacity.value = 1;
        portalOpacity.value = withDelay(
          duration * 0.5,
          withTiming(0, { duration: duration * 0.3 }),
        );
      }
    }
  }, [isVisible, type, duration, portalOpacity]);

  return (
    <View style={[styles.container, style]}>
      {type === 'portal' && (
        <Canvas style={styles.portalCanvas} pointerEvents="none">
          <PortalEffect
            portalScale={portalScale}
            portalOpacity={portalOpacity}
            portalColor={portalColor}
          />
        </Canvas>
      )}
      <Animated.View style={[styles.content, contentAnimatedStyle]}>{children}</Animated.View>
    </View>
  );
}

interface PortalEffectProps {
  portalScale: Animated.SharedValue<number>;
  portalOpacity: Animated.SharedValue<number>;
  portalColor: string;
}

function PortalEffect({ portalScale, portalOpacity, portalColor }: PortalEffectProps) {
  const cx = SCREEN_WIDTH / 2;
  const cy = SCREEN_HEIGHT / 2;
  const maxRadius = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT);

  const r = useDerivedValue(() => (portalScale.value * maxRadius) / 3);
  const opacity = useDerivedValue(() => portalOpacity.value * 0.8);

  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r} opacity={opacity}>
        <RadialGradient c={vec(cx, cy)} r={maxRadius} colors={[portalColor, `${portalColor}00`]} />
        <BlurMask blur={30} style="normal" />
      </Circle>
    </Group>
  );
}

// Import useDerivedValue for PortalEffect
import { useDerivedValue } from 'react-native-reanimated';

// Screen transition wrapper component
interface ScreenTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
  type?: TransitionType;
}

export function ScreenTransition({
  children,
  transitionKey: _transitionKey,
  type = 'portal',
}: ScreenTransitionProps) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <PortalTransition
      isVisible={true}
      type={isFirstRender.current ? 'fade' : type}
      duration={isFirstRender.current ? 200 : 500}
    >
      {children}
    </PortalTransition>
  );
}

// Page transition with shared elements
interface SharedElementTransitionProps {
  children: React.ReactNode;
  sharedElementId: string;
  isSource?: boolean;
}

export function SharedElementTransition({
  children,
  sharedElementId,
  isSource = true,
}: SharedElementTransitionProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!isSource) {
      scale.value = 0.8;
      opacity.value = 0;

      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isSource, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle} testID={`shared-${sharedElementId}`}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  portalCanvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  content: {
    flex: 1,
  },
});

export default PortalTransition;
