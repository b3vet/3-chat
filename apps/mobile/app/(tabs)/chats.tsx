import { format } from 'date-fns';
import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { MessageSquarePlus } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StartConversationModal } from '@/components/chat/StartConversationModal';
import { BackgroundParticles } from '@/components/particles/BackgroundParticles';
import { NeonText } from '@/components/ui/NeonText';
import hapticsService from '@/services/haptics';
import soundService from '@/services/sound';
import { activeChatsAtom, type Chat } from '@/stores/chatStore';

export default function ChatsScreen() {
  const chats = useAtomValue(activeChatsAtom);
  const [modalVisible, setModalVisible] = useState(false);

  // Floating Action Button animation
  const fabScale = useSharedValue(1);

  useEffect(() => {
    fabScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [fabScale]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleOpenModal = useCallback(() => {
    hapticsService.light();
    soundService.play('button_press');
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const renderChat = ({ item }: { item: Chat }) => (
    <Pressable style={styles.chatItem} onPress={() => router.push(`/chat/${item.id}`)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>
            {item.lastMessage?.created_at
              ? format(new Date(item.lastMessage.created_at), 'HH:mm')
              : ''}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage?.content || 'No messages yet'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <BackgroundParticles theme="aurora" intensity={0.6} />

      <View style={styles.header}>
        <NeonText
          fontSize={32}
          fontWeight="bold"
          color="#fff"
          glowColor="#888"
          animated
          pulseSpeed={3000}
        >
          Chats
        </NeonText>
      </View>

      {chats.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button below to start a conversation!</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Floating Action Button */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <Pressable
          onPress={handleOpenModal}
          style={({ pressed }) => [styles.fabButton, pressed && styles.fabButtonPressed]}
        >
          <MessageSquarePlus size={28} color="#fff" />
        </Pressable>
      </Animated.View>

      {/* Start Conversation Modal */}
      <StartConversationModal visible={modalVisible} onClose={handleCloseModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    padding: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  chatTime: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#888',
  },
  badge: {
    backgroundColor: '#333',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fabButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
