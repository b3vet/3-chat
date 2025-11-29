import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { MessageCircle, Trash2, UserCheck, UserMinus } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GlassCard } from '@/components/ui/GlassCard';
import hapticsService from '@/services/haptics';
import soundService from '@/services/sound';
import type { Friend } from '@/stores/friendsStore';
import { userIdAtom } from '@/stores/userStore';

interface FriendCardProps {
  friend: Friend;
  onRemove?: (friendId: string) => void;
  onStartChat?: (friendId: string) => void;
}

export function FriendCard({ friend, onRemove, onStartChat }: FriendCardProps) {
  const currentUserId = useAtomValue(userIdAtom);
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    scale.value = withSpring(0.95, { damping: 15 });
    rotateX.value = withTiming(5, { duration: 100 });
    hapticsService.light();
  }, [scale, rotateX]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    scale.value = withSpring(1, { damping: 15 });
    rotateX.value = withTiming(0, { duration: 100 });
  }, [scale, rotateX]);

  const handleStartChat = useCallback(() => {
    hapticsService.selection();
    soundService.play('button_press');
    if (onStartChat) {
      onStartChat(friend.id);
    } else if (currentUserId) {
      // Generate chat_id in sorted format: "user1_id:user2_id"
      const chatId = [currentUserId, friend.id].sort().join(':');
      router.push(`/chat/${chatId}`);
    }
  }, [friend.id, onStartChat, currentUserId]);

  const handleRemove = useCallback(() => {
    hapticsService.warning();
    soundService.play('error');
    if (onRemove) {
      onRemove(friend.id);
    }
  }, [friend.id, onRemove]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { perspective: 1000 }, { rotateX: `${rotateX.value}deg` }],
  }));

  const getStatusColor = () => {
    switch (friend.status) {
      case 'accepted':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6366f1';
    }
  };

  const getStatusIcon = () => {
    switch (friend.status) {
      case 'accepted':
        return <UserCheck size={14} color="#10b981" />;
      case 'pending':
        return <UserMinus size={14} color="#f59e0b" />;
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleStartChat}
        style={styles.pressable}
      >
        <GlassCard
          width={350}
          height={90}
          borderRadius={20}
          blur={12}
          opacity={0.1}
          gradientColors={
            isPressed
              ? ['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.15)']
              : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
          }
          borderColor={isPressed ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.2)'}
          animated={isPressed}
          style={styles.card}
        >
          <View style={styles.content}>
            {/* Avatar */}
            <View style={[styles.avatar, { borderColor: getStatusColor() }]}>
              <Text style={styles.avatarText}>{friend.display_name[0]?.toUpperCase() || '?'}</Text>
              {friend.status !== 'accepted' && (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                  {getStatusIcon()}
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {friend.display_name}
              </Text>
              <Text style={styles.username} numberOfLines={1}>
                @{friend.username}
              </Text>
              {friend.about && (
                <Text style={styles.about} numberOfLines={1}>
                  {friend.about}
                </Text>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                onPress={handleStartChat}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.chatButton,
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <MessageCircle size={20} color="#fff" />
              </Pressable>

              <Pressable
                onPress={handleRemove}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <Trash2 size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  pressable: {
    width: '100%',
  },
  card: {
    padding: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    position: 'relative',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  about: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  chatButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
});
