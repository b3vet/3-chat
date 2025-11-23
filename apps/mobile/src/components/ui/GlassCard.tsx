import {
  BlurMask,
  Canvas,
  Group,
  LinearGradient,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GlassCardProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  borderRadius?: number;
  blur?: number;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  gradientColors?: string[];
  style?: ViewStyle;
  animated?: boolean;
}

export function GlassCard({
  children,
  width = SCREEN_WIDTH - 32,
  height = 150,
  borderRadius = 20,
  blur = 15,
  opacity = 0.1,
  borderColor = 'rgba(255, 255, 255, 0.2)',
  borderWidth = 1,
  gradientColors = ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'],
  style,
  animated = false,
}: GlassCardProps) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [animated, shimmerPosition]);

  const shimmerStart = useDerivedValue(() => {
    return vec(-width + shimmerPosition.value * (width * 3), 0);
  }, [shimmerPosition, width]);

  const shimmerEnd = useDerivedValue(() => {
    return vec(shimmerPosition.value * (width * 3), height);
  }, [shimmerPosition, width, height]);

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Canvas style={styles.canvas}>
        <Group>
          {/* Background blur layer */}
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={borderRadius}
            color={`rgba(255, 255, 255, ${opacity})`}
          >
            <BlurMask blur={blur} style="normal" />
          </RoundedRect>

          {/* Gradient overlay */}
          <RoundedRect x={0} y={0} width={width} height={height} r={borderRadius}>
            <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={gradientColors} />
          </RoundedRect>

          {/* Animated shimmer effect */}
          {animated && (
            <RoundedRect x={0} y={0} width={width} height={height} r={borderRadius}>
              <LinearGradient
                start={shimmerStart}
                end={shimmerEnd}
                colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
              />
            </RoundedRect>
          )}

          {/* Border */}
          <RoundedRect
            x={borderWidth / 2}
            y={borderWidth / 2}
            width={width - borderWidth}
            height={height - borderWidth}
            r={borderRadius - borderWidth / 2}
            color="transparent"
            style="stroke"
            strokeWidth={borderWidth}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={[borderColor, 'rgba(255, 255, 255, 0.05)']}
            />
          </RoundedRect>
        </Group>
      </Canvas>

      {/* Content */}
      <View style={[styles.content, { borderRadius }]}>{children}</View>
    </View>
  );
}

// Glass Button Component
interface GlassButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  width?: number;
  height?: number;
  borderRadius?: number;
  primaryColor?: string;
  style?: ViewStyle;
}

export function GlassButton({
  children,
  onPress: _onPress,
  width = 200,
  height = 50,
  borderRadius = 25,
  primaryColor = '#6366f1',
  style,
}: GlassButtonProps) {
  return (
    <Animated.View style={[{ width, height }, style]}>
      <Canvas style={styles.canvas}>
        <Group>
          {/* Button background */}
          <RoundedRect x={0} y={0} width={width} height={height} r={borderRadius}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={[`${primaryColor}40`, `${primaryColor}20`]}
            />
            <BlurMask blur={10} style="normal" />
          </RoundedRect>

          {/* Glow effect */}
          <RoundedRect x={2} y={2} width={width - 4} height={height - 4} r={borderRadius - 2}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)']}
            />
          </RoundedRect>

          {/* Border */}
          <RoundedRect
            x={0.5}
            y={0.5}
            width={width - 1}
            height={height - 1}
            r={borderRadius}
            color="transparent"
            style="stroke"
            strokeWidth={1}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={[`${primaryColor}60`, `${primaryColor}20`]}
            />
          </RoundedRect>
        </Group>
      </Canvas>

      <View style={[styles.buttonContent, { borderRadius }]}>{children}</View>
    </Animated.View>
  );
}

// Glass Input Component
interface GlassInputContainerProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  borderRadius?: number;
  focused?: boolean;
  accentColor?: string;
  style?: ViewStyle;
}

export function GlassInputContainer({
  children,
  width = SCREEN_WIDTH - 32,
  height = 56,
  borderRadius = 16,
  focused = false,
  accentColor = '#6366f1',
  style,
}: GlassInputContainerProps) {
  const focusOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    focusOpacity.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, focusOpacity]);

  // Border opacity - can be used for dynamic border styling
  const _borderOpacity = useDerivedValue(() => {
    return 0.2 + focusOpacity.value * 0.4;
  });

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Canvas style={styles.canvas}>
        <Group>
          {/* Background */}
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={borderRadius}
            color="rgba(0, 0, 0, 0.3)"
          >
            <BlurMask blur={8} style="normal" />
          </RoundedRect>

          {/* Inner highlight */}
          <RoundedRect x={1} y={1} width={width - 2} height={height / 2} r={borderRadius - 1}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height / 2)}
              colors={['rgba(255, 255, 255, 0.1)', 'transparent']}
            />
          </RoundedRect>

          {/* Border */}
          <RoundedRect
            x={0.5}
            y={0.5}
            width={width - 1}
            height={height - 1}
            r={borderRadius}
            color="transparent"
            style="stroke"
            strokeWidth={1}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, 0)}
              colors={[
                focused ? `${accentColor}80` : 'rgba(255, 255, 255, 0.2)',
                focused ? `${accentColor}40` : 'rgba(255, 255, 255, 0.1)',
              ]}
            />
          </RoundedRect>
        </Group>
      </Canvas>

      <View style={[styles.content, { borderRadius }]}>{children}</View>
    </View>
  );
}

// Glass Modal Backdrop
interface GlassBackdropProps {
  children: React.ReactNode;
  visible: boolean;
  blur?: number;
  opacity?: number;
}

export function GlassBackdrop({ children, visible, blur = 20, opacity = 0.5 }: GlassBackdropProps) {
  const animatedOpacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    animatedOpacity.value = withTiming(visible ? 1 : 0, { duration: 300 });
  }, [visible, animatedOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.backdrop, animatedStyle]}>
      <Canvas style={styles.backdropCanvas}>
        <Rect x={0} y={0} width={SCREEN_WIDTH} height={1000} color={`rgba(0, 0, 0, ${opacity})`}>
          <BlurMask blur={blur} style="normal" />
        </Rect>
      </Canvas>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  buttonContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  backdropCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GlassCard;
