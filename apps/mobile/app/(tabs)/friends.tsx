import { router } from 'expo-router';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Check, UserPlus, Users, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddFriendModal } from '@/components/friends/AddFriendModal';
import { FriendCard } from '@/components/friends/FriendCard';
import { BackgroundParticles } from '@/components/particles/BackgroundParticles';
import { NeonText } from '@/components/ui/NeonText';
import { api } from '@/services/api';
import hapticsService from '@/services/haptics';
import soundService from '@/services/sound';
import { upsertChatAtom } from '@/stores/chatStore';
import {
  type Friend,
  friendsAtom,
  pendingRequestsAtom,
  removeFriendAtom,
  sentRequestsAtom,
} from '@/stores/friendsStore';
import { userIdAtom } from '@/stores/userStore';

export default function FriendsScreen() {
  const [friends, setFriends] = useAtom(friendsAtom);
  const [pendingRequests, setPendingRequests] = useAtom(pendingRequestsAtom);
  const [, setSentRequests] = useAtom(sentRequestsAtom);
  const removeFriend = useSetAtom(removeFriendAtom);
  const upsertChat = useSetAtom(upsertChatAtom);
  const currentUserId = useAtomValue(userIdAtom);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Floating Action Button animation
  const fabScale = useSharedValue(1);
  const fabRotate = useSharedValue(0);

  useEffect(() => {
    // Pulse animation for FAB
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
    transform: [{ scale: fabScale.value }, { rotate: `${fabRotate.value}deg` }],
  }));

  // Load friends on mount
  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const [friendsResponse, sentResponse, pendingResponse] = await Promise.all([
        api.getFriends(),
        api.getSentRequests(),
        api.getPendingRequests(),
      ]);

      setFriends(
        friendsResponse.friends.map((user) => ({
          ...user,
          status: 'accepted' as const,
        })),
      );

      setSentRequests(
        sentResponse.requests.map((user) => ({
          ...user,
          status: 'pending' as const,
        })),
      );

      setPendingRequests(
        pendingResponse.requests.map((user) => ({
          ...user,
          status: 'pending' as const,
        })),
      );
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  }, []);

  const handleRemoveFriend = useCallback(
    async (friendId: string) => {
      hapticsService.warning();
      soundService.play('error');

      try {
        await api.removeFriend(friendId);
        removeFriend(friendId);
      } catch (error) {
        console.error('Failed to remove friend:', error);
        hapticsService.error();
      }
    },
    [removeFriend],
  );

  const handleAcceptRequest = useCallback(
    async (userId: string) => {
      setProcessingId(userId);
      hapticsService.success();
      soundService.play('success');

      try {
        await api.acceptFriendRequest(userId);
        // Move from pending to friends
        const acceptedUser = pendingRequests.find((r) => r.id === userId);
        if (acceptedUser) {
          setPendingRequests(pendingRequests.filter((r) => r.id !== userId));
          setFriends([...friends, { ...acceptedUser, status: 'accepted' }]);
        }
      } catch (error) {
        console.error('Failed to accept friend request:', error);
        hapticsService.error();
      } finally {
        setProcessingId(null);
      }
    },
    [pendingRequests, friends, setPendingRequests, setFriends],
  );

  const handleRejectRequest = useCallback(
    async (userId: string) => {
      setProcessingId(userId);
      hapticsService.warning();
      soundService.play('error');

      try {
        await api.rejectFriendRequest(userId);
        setPendingRequests(pendingRequests.filter((r) => r.id !== userId));
      } catch (error) {
        console.error('Failed to reject friend request:', error);
        hapticsService.error();
      } finally {
        setProcessingId(null);
      }
    },
    [pendingRequests, setPendingRequests],
  );

  const handleStartChat = useCallback(
    (friendId: string) => {
      if (!currentUserId) return;

      hapticsService.selection();
      soundService.play('button_press');

      const friend = friends.find((f) => f.id === friendId);
      if (friend) {
        // Generate chat_id in sorted format: "user1_id:user2_id"
        const chatId = [currentUserId, friendId].sort().join(':');
        upsertChat({
          id: chatId,
          recipientId: friendId,
          name: friend.display_name,
          avatarUrl: friend.avatar_url || undefined,
          unreadCount: 0,
        });
        // Navigate to the chat
        router.push(`/chat/${chatId}`);
      }
    },
    [friends, upsertChat, currentUserId],
  );

  const handleOpenModal = useCallback(() => {
    hapticsService.light();
    soundService.play('button_press');
    fabRotate.value = withSequence(
      withTiming(180, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      withTiming(360, { duration: 0 }),
    );
    setModalVisible(true);
  }, [fabRotate]);

  const handleCloseModal = useCallback(() => {
    fabRotate.value = 0;
    setModalVisible(false);
  }, [fabRotate]);

  const renderFriend = useCallback(
    ({ item }: { item: Friend }) => (
      <FriendCard friend={item} onRemove={handleRemoveFriend} onStartChat={handleStartChat} />
    ),
    [handleRemoveFriend, handleStartChat],
  );

  const renderPendingRequest = useCallback(
    ({ item }: { item: Friend }) => {
      const isProcessing = processingId === item.id;

      return (
        <View style={styles.requestCard}>
          <View style={styles.requestAvatar}>
            <Text style={styles.requestAvatarText}>
              {item.display_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.requestInfo}>
            <Text style={styles.requestName}>{item.display_name}</Text>
            <Text style={styles.requestUsername}>@{item.username}</Text>
          </View>
          <View style={styles.requestActions}>
            <Pressable
              onPress={() => !isProcessing && handleAcceptRequest(item.id)}
              style={({ pressed }) => [
                styles.acceptButton,
                pressed && styles.buttonPressed,
                isProcessing && styles.buttonDisabled,
              ]}
              disabled={isProcessing}
            >
              <Check size={20} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => !isProcessing && handleRejectRequest(item.id)}
              style={({ pressed }) => [
                styles.rejectButton,
                pressed && styles.buttonPressed,
                isProcessing && styles.buttonDisabled,
              ]}
              disabled={isProcessing}
            >
              <X size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      );
    },
    [processingId, handleAcceptRequest, handleRejectRequest],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: Friend[] } }) => {
      if (section.data.length === 0) return null;
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{section.data.length}</Text>
          </View>
        </View>
      );
    },
    [],
  );

  const acceptedFriends = friends.filter((f) => f.status === 'accepted');
  const hasContent = acceptedFriends.length > 0 || pendingRequests.length > 0;

  const sections = [
    { title: 'Friend Requests', data: pendingRequests, type: 'pending' as const },
    { title: 'Friends', data: acceptedFriends, type: 'friend' as const },
  ].filter((section) => section.data.length > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <BackgroundParticles theme="aurora" intensity={0.6} />

      {/* Header */}
      <View style={styles.header}>
        <NeonText
          fontSize={32}
          fontWeight="bold"
          color="#fff"
          glowColor="#888"
          animated
          pulseSpeed={3000}
        >
          Friends
        </NeonText>
      </View>

      {/* Content */}
      {!hasContent ? (
        <View style={styles.emptyContainer}>
          <Users size={64} color="#444" />
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button below to add your first friend!</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={({ item, section }) =>
            section.type === 'pending' ? renderPendingRequest({ item }) : renderFriend({ item })
          }
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#888"
              colors={['#888']}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <Pressable
          onPress={handleOpenModal}
          style={({ pressed }) => [styles.fabButton, pressed && styles.fabButtonPressed]}
        >
          <UserPlus size={28} color="#fff" />
        </Pressable>
      </Animated.View>

      {/* Add Friend Modal */}
      <AddFriendModal visible={modalVisible} onClose={handleCloseModal} />
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  sectionBadge: {
    marginLeft: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  requestUsername: {
    fontSize: 14,
    color: '#888',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
