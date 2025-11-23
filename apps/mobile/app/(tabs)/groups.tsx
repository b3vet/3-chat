import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { Plus, Users } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateGroupModal } from '@/components/group';
import { type Group as ApiGroup, api } from '@/services/api';
import { type Group, groupsAtom } from '@/stores/chatStore';

interface GroupsResponse {
  groups: ApiGroup[];
}

export default function GroupsScreen() {
  const [groups, setGroups] = useAtom(groupsAtom);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const response = (await api.getGroups()) as GroupsResponse;
      const groupsList = response.groups || [];
      setGroups(
        groupsList.map((g) => ({
          id: g.id,
          name: g.name,
          description: g.description ?? undefined,
          iconUrl: g.icon_url ?? undefined,
          creatorId: g.creator_id,
          memberCount: 1,
        })),
      );
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  }, [setGroups]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadGroups();
    setIsRefreshing(false);
  };

  const handleGroupCreated = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

  const renderGroup = ({ item, index }: { item: Group; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable style={styles.groupItem} onPress={() => router.push(`/group/${item.id}`)}>
        <View style={styles.avatar}>
          {item.iconUrl ? (
            <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'G'}</Text>
          ) : (
            <Users size={24} color="#fff" />
          )}
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.description} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          <Text style={styles.memberCount}>{item.memberCount || 1} members</Text>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <Pressable style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <Plus size={24} color="#fff" />
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Users size={48} color="#6366f1" />
          </View>
          <Text style={styles.emptyText}>No groups yet</Text>
          <Text style={styles.emptySubtext}>Create a group to chat with multiple friends!</Text>
          <Pressable style={styles.createButton} onPress={() => setIsModalVisible(true)}>
            <Plus size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create Group</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#6366f1"
            />
          }
        />
      )}

      <CreateGroupModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onCreated={handleGroupCreated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 8,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#0a0a0a',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
