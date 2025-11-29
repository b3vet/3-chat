import { router } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import { MessageCircle, X } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GlassBackdrop, GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import hapticsService from '@/services/haptics';
import soundService from '@/services/sound';
import { type Friend, friendsAtom } from '@/stores/friendsStore';
import { userIdAtom } from '@/stores/userStore';

interface StartConversationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StartConversationModal({ visible, onClose }: StartConversationModalProps) {
  const [friends] = useAtom(friendsAtom);
  const currentUserId = useAtomValue(userIdAtom);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [visible, scale]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleClose = useCallback(() => {
    hapticsService.light();
    onClose();
  }, [onClose]);

  const handleSelectFriend = useCallback(
    (friend: Friend) => {
      if (!currentUserId) return;

      hapticsService.selection();
      soundService.play('button_press');
      onClose();
      // Generate chat_id in sorted format: "user1_id:user2_id"
      const chatId = [currentUserId, friend.id].sort().join(':');
      router.push(`/chat/${chatId}`);
    },
    [onClose, currentUserId],
  );

  const renderFriend = useCallback(
    ({ item }: { item: Friend }) => (
      <Pressable
        onPress={() => handleSelectFriend(item)}
        style={({ pressed }) => [styles.friendItem, pressed && styles.friendItemPressed]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.display_name[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.display_name}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
        <MessageCircle size={20} color="#6366f1" />
      </Pressable>
    ),
    [handleSelectFriend],
  );

  const acceptedFriends = friends.filter((f) => f.status === 'accepted');

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <GlassBackdrop visible={visible} blur={15} opacity={0.7}>
        <View style={styles.container}>
          <Animated.View style={[styles.modalContent, modalStyle]}>
            <GlassCard
              width={350}
              height={500}
              borderRadius={24}
              blur={20}
              opacity={0.15}
              gradientColors={['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.1)']}
              borderColor="rgba(99, 102, 241, 0.3)"
              animated
              style={styles.card}
            >
              {/* Header */}
              <View style={styles.header}>
                <NeonText
                  fontSize={24}
                  fontWeight="bold"
                  color="#fff"
                  glowColor="#6366f1"
                  animated
                  pulseSpeed={2500}
                >
                  Start Conversation
                </NeonText>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color="#fff" />
                </Pressable>
              </View>

              {/* Friends List */}
              <View style={styles.listContainer}>
                {acceptedFriends.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MessageCircle size={48} color="#444" />
                    <Text style={styles.emptyText}>No friends yet</Text>
                    <Text style={styles.emptySubtext}>
                      Add friends in the Friends tab to start chatting
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={acceptedFriends}
                    renderItem={renderFriend}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            </GlassCard>
          </Animated.View>
        </View>
      </GlassBackdrop>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 350,
    height: 500,
  },
  card: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  friendItemPressed: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#888',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
