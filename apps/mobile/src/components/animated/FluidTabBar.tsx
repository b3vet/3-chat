import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurMask, Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useCallback, useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 80;
const INDICATOR_SIZE = 50;

interface FluidTabBarProps extends BottomTabBarProps {
  primaryColor?: string;
  backgroundColor?: string;
}

export function FluidTabBar({
  state,
  descriptors,
  navigation,
  primaryColor = '#6366f1',
  backgroundColor = '#0a0a0a',
}: FluidTabBarProps) {
  const tabCount = state.routes.length;
  const tabWidth = SCREEN_WIDTH / tabCount;

  const activeIndex = useSharedValue(state.index);
  const indicatorX = useSharedValue(state.index * tabWidth + tabWidth / 2 - INDICATOR_SIZE / 2);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 15,
      stiffness: 150,
    });
    indicatorX.value = withSpring(state.index * tabWidth + tabWidth / 2 - INDICATOR_SIZE / 2, {
      damping: 15,
      stiffness: 150,
    });
  }, [state.index, activeIndex, indicatorX, tabWidth]);

  const liquidPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const centerX = indicatorX.value + INDICATOR_SIZE / 2;
    const bulgeHeight = 25;

    path.moveTo(0, bulgeHeight);

    // Left flat section
    path.lineTo(centerX - 60, bulgeHeight);

    // Left curve into bulge
    path.cubicTo(centerX - 40, bulgeHeight, centerX - 35, 0, centerX, 0);

    // Right curve out of bulge
    path.cubicTo(centerX + 35, 0, centerX + 40, bulgeHeight, centerX + 60, bulgeHeight);

    // Right flat section
    path.lineTo(SCREEN_WIDTH, bulgeHeight);
    path.lineTo(SCREEN_WIDTH, TAB_BAR_HEIGHT);
    path.lineTo(0, TAB_BAR_HEIGHT);
    path.close();

    return path;
  }, [indicatorX]);

  const handlePress = useCallback(
    (index: number, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[index].key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation, state.routes],
  );

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Liquid background with Skia */}
      <Canvas style={styles.canvas}>
        <Path path={liquidPath} color={backgroundColor}>
          <BlurMask blur={0.5} style="normal" />
        </Path>
      </Canvas>

      {/* Floating indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: primaryColor },
          useAnimatedStyle(() => ({
            transform: [{ translateX: indicatorX.value }],
          })),
        ]}
      />

      {/* Tab buttons */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const tabIcon = options.tabBarIcon;

          return (
            <Pressable
              key={route.key}
              onPress={() => handlePress(index, route.name, isFocused)}
              style={styles.tab}
            >
              <AnimatedTabIcon
                index={index}
                activeIndex={activeIndex}
                isFocused={isFocused}
                tabIcon={tabIcon}
                primaryColor={primaryColor}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface AnimatedTabIconProps {
  index: number;
  activeIndex: SharedValue<number>;
  isFocused: boolean;
  tabIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
  primaryColor: string;
}

function AnimatedTabIcon({
  index,
  activeIndex,
  isFocused,
  tabIcon,
  primaryColor: _primaryColor,
}: AnimatedTabIconProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = Math.abs(activeIndex.value - index) < 0.5;
    const scale = withSpring(isActive ? 1.2 : 1, { damping: 12, stiffness: 150 });
    const translateY = withSpring(isActive ? -15 : 0, { damping: 12, stiffness: 150 });

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      {tabIcon?.({
        focused: isFocused,
        color: isFocused ? '#ffffff' : '#666666',
        size: 24,
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    paddingTop: 25,
  },
  tab: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default FluidTabBar;
