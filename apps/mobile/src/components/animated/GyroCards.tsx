import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GyroCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxTilt?: number;
  shadowColor?: string;
  onPress?: () => void;
  disabled?: boolean;
}

// Simplified touch-based tilt effect (gyroscope requires native module setup)
export function GyroCard({
  children,
  style,
  maxTilt = 15,
  shadowColor = '#6366f1',
  onPress,
  disabled = false,
}: GyroCardProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleTouchMove = (event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (disabled) return;

    const { locationX, locationY } = event.nativeEvent;
    const cardWidth = SCREEN_WIDTH - 32; // Assuming card with 16px margin
    const cardHeight = 100; // Approximate card height

    // Calculate rotation based on touch position
    const xPercent = (locationX / cardWidth - 0.5) * 2;
    const yPercent = (locationY / cardHeight - 0.5) * 2;

    rotateY.value = withSpring(xPercent * maxTilt, { damping: 15, stiffness: 150 });
    rotateX.value = withSpring(-yPercent * maxTilt, { damping: 15, stiffness: 150 });
  };

  const handleTouchEnd = () => {
    rotateX.value = withSpring(0, { damping: 15, stiffness: 100 });
    rotateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    handleTouchEnd();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const shadowOffset = {
      width: interpolate(rotateY.value, [-maxTilt, maxTilt], [10, -10]),
      height: interpolate(rotateX.value, [-maxTilt, maxTilt], [-10, 10]),
    };

    return {
      shadowOffset,
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 8,
    };
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      onTouchMove={handleTouchMove}
      disabled={disabled}
    >
      <Animated.View style={[styles.card, { shadowColor }, style, animatedStyle, shadowStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Stacked cards with depth effect
interface StackedCardsProps {
  cards: Array<{
    id: string;
    content: React.ReactNode;
  }>;
  onCardPress?: (id: string) => void;
  cardStyle?: ViewStyle;
}

export function StackedCards({ cards, onCardPress, cardStyle }: StackedCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.stackContainer}>
      {cards.map((card, index) => {
        const isActive = index === activeIndex;
        const offset = index - activeIndex;

        return (
          <StackedCardItem
            key={card.id}
            offset={offset}
            isActive={isActive}
            onPress={() => {
              setActiveIndex(index);
              onCardPress?.(card.id);
            }}
            style={cardStyle}
          >
            {card.content}
          </StackedCardItem>
        );
      })}
    </View>
  );
}

interface StackedCardItemProps {
  children: React.ReactNode;
  offset: number;
  isActive: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

function StackedCardItem({
  children,
  offset,
  isActive: _isActive,
  onPress,
  style,
}: StackedCardItemProps) {
  const translateY = useSharedValue(offset * 20);
  const scale = useSharedValue(1 - Math.abs(offset) * 0.05);
  const opacity = useSharedValue(1 - Math.abs(offset) * 0.3);

  useEffect(() => {
    translateY.value = withSpring(offset * 20, { damping: 15, stiffness: 150 });
    scale.value = withSpring(1 - Math.abs(offset) * 0.05, { damping: 15, stiffness: 150 });
    opacity.value = withSpring(Math.max(0.4, 1 - Math.abs(offset) * 0.3), {
      damping: 15,
      stiffness: 150,
    });
  }, [offset, translateY, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
    zIndex: 10 - Math.abs(offset),
  }));

  return (
    <Pressable onPress={onPress} style={styles.stackedCardPressable}>
      <Animated.View style={[styles.stackedCard, style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

// Ripple effect on touch
interface RippleCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  rippleColor?: string;
  onPress?: () => void;
}

export function RippleCard({
  children,
  style,
  rippleColor = 'rgba(99, 102, 241, 0.3)',
  onPress,
}: RippleCardProps) {
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const handlePress = () => {
    rippleScale.value = 0;
    rippleOpacity.value = 1;

    rippleScale.value = withSpring(2, { damping: 15, stiffness: 100 });
    rippleOpacity.value = withSpring(0, { damping: 15, stiffness: 100 });

    onPress?.();
  };

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return (
    <Pressable onPress={handlePress} style={[styles.rippleContainer, style]}>
      <Animated.View style={[styles.ripple, { backgroundColor: rippleColor }, rippleStyle]} />
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  stackContainer: {
    position: 'relative',
    height: 200,
    marginVertical: 20,
  },
  stackedCardPressable: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
  },
  stackedCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    height: 150,
  },
  rippleContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 1000,
    top: '50%',
    left: '50%',
    marginLeft: '-50%',
    marginTop: '-50%',
  },
});

export default GyroCard;
