import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Check, Clock, Search, UserPlus, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SparkleEffect } from '@/components/particles/MessageParticles';
import { GlassBackdrop, GlassCard, GlassInputContainer } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { api, type User } from '@/services/api';
import hapticsService from '@/services/haptics';
import soundService from '@/services/sound';
import {
  addSentRequestAtom,
  friendSearchResultsAtom,
  friendsAtom,
  sentRequestsAtom,
  setSearchResultsAtom,
} from '@/stores/friendsStore';

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddFriendModal({ visible, onClose }: AddFriendModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setResults] = useAtom(friendSearchResultsAtom);
  const setSearchResultsAtom_ = useSetAtom(setSearchResultsAtom);
  const addSentRequest = useSetAtom(addSentRequestAtom);
  const sentRequests = useAtomValue(sentRequestsAtom);
  const friends = useAtomValue(friendsAtom);
  const [focused, setFocused] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      scale.value = withTiming(0, { duration: 200 });
      setSearchQuery('');
      setResults([]);
    }
  }, [visible, scale, setResults]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResultsAtom_([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.searchUsers(searchQuery);
        setSearchResultsAtom_(response.users);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchResultsAtom_]);

  const handleAddFriend = useCallback(
    async (user: User) => {
      setAddingFriendId(user.id);
      hapticsService.success();
      soundService.play('success');
      setShowParticles(true);

      try {
        await api.addFriend(user.username);
        addSentRequest({
          ...user,
          status: 'pending',
          requested_at: new Date().toISOString(),
        });

        // Show success particles
        setTimeout(() => setShowParticles(false), 1500);
      } catch (error) {
        console.error('Failed to add friend:', error);
        hapticsService.error();
      } finally {
        setAddingFriendId(null);
      }
    },
    [addSentRequest],
  );

  const handleClose = useCallback(() => {
    hapticsService.light();
    onClose();
  }, [onClose]);

  const renderUser = useCallback(
    ({ item }: { item: User }) => {
      const isAdding = addingFriendId === item.id;
      const hasSentRequest = sentRequests.some((r) => r.id === item.id);
      const isFriend = friends.some((f) => f.id === item.id && f.status === 'accepted');
      const canAdd = !hasSentRequest && !isFriend;

      const renderActionIcon = () => {
        if (isAdding) {
          return <ActivityIndicator size="small" color="#6366f1" />;
        }
        if (isFriend) {
          return (
            <View style={styles.statusBadge}>
              <Check size={16} color="#22c55e" />
              <Text style={styles.statusText}>Friends</Text>
            </View>
          );
        }
        if (hasSentRequest) {
          return (
            <View style={styles.statusBadge}>
              <Clock size={16} color="#f59e0b" />
              <Text style={styles.statusTextPending}>Pending</Text>
            </View>
          );
        }
        return <UserPlus size={20} color="#6366f1" />;
      };

      return (
        <Pressable
          onPress={() => canAdd && !isAdding && handleAddFriend(item)}
          style={({ pressed }) => [
            styles.userItem,
            pressed && canAdd && styles.userItemPressed,
            !canAdd && styles.userItemDisabled,
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.display_name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.display_name}</Text>
            <Text style={styles.userUsername}>@{item.username}</Text>
          </View>
          {renderActionIcon()}
        </Pressable>
      );
    },
    [addingFriendId, handleAddFriend, sentRequests, friends],
  );

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
                  Add Friend
                </NeonText>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color="#fff" />
                </Pressable>
              </View>

              {/* Search Input */}
              <View style={styles.searchContainer}>
                <GlassInputContainer
                  width={320}
                  height={56}
                  borderRadius={16}
                  focused={focused}
                  accentColor="#6366f1"
                >
                  <View style={styles.inputWrapper}>
                    <Search
                      size={20}
                      color={focused ? '#6366f1' : '#888'}
                      style={styles.searchIcon}
                    />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="Search by username or phone..."
                      placeholderTextColor="#666"
                      style={styles.input}
                    />
                    {isSearching && (
                      <ActivityIndicator size="small" color="#6366f1" style={styles.loader} />
                    )}
                  </View>
                </GlassInputContainer>
              </View>

              {/* Search Results */}
              <View style={styles.resultsContainer}>
                {searchQuery.trim() === '' ? (
                  <View style={styles.emptyState}>
                    <Search size={48} color="#444" />
                    <Text style={styles.emptyText}>Search for friends</Text>
                    <Text style={styles.emptySubtext}>
                      Enter a username or phone number to find friends
                    </Text>
                  </View>
                ) : searchResults.length === 0 && !isSearching ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No users found</Text>
                    <Text style={styles.emptySubtext}>Try a different search term</Text>
                  </View>
                ) : (
                  <FlatList
                    data={searchResults}
                    renderItem={renderUser}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Particle Effects */}
          {showParticles && (
            <View style={styles.particlesContainer}>
              <SparkleEffect
                type="sparkle"
                color="#6366f1"
                onComplete={() => setShowParticles(false)}
                visible={showParticles}
              />
            </View>
          )}
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
  searchContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    height: '100%',
  },
  loader: {
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userItemPressed: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  userItemDisabled: {
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  statusTextPending: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  userUsername: {
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
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
});
