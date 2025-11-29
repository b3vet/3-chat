import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { Plus, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateGroupModal } from '@/components/group';
import { BackgroundParticles } from '@/components/particles/BackgroundParticles';
import { NeonText } from '@/components/ui/NeonText';
import { type Group as ApiGroup, api } from '@/services/api';
import { type Group, groupsAtom } from '@/stores/chatStore';

interface GroupsResponse {
  groups: ApiGroup[];
}

export default function GroupsScreen() {
  const [groups, setGroups] = useAtom(groupsAtom);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadGroups = async () => {
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
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadGroups();
    setIsRefreshing(false);
  };

  const handleGroupCreated = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

  const renderGroup = ({ item }: { item: Group }) => (
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
          Groups
        </NeonText>
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Users size={48} color="#888" />
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
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#888" />
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
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: '#333',
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
