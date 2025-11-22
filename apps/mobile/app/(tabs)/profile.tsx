import { router } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import { Bell, ChevronRight, LogOut, Palette, Settings } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authTokenAtom, userAtom } from '@/stores/userStore';

export default function ProfileScreen() {
  const [user] = useAtom(userAtom);
  const setAuthToken = useSetAtom(authTokenAtom);
  const setUser = useSetAtom(userAtom);

  const handleLogout = () => {
    setAuthToken('');
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.displayName}>{user?.display_name || 'User'}</Text>
        <Text style={styles.username}>@{user?.username || 'unknown'}</Text>
        {user?.about && <Text style={styles.about}>{user.about}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <Pressable style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Bell size={20} color="#6366f1" />
          </View>
          <Text style={styles.menuText}>Notifications</Text>
          <ChevronRight size={20} color="#666" />
        </Pressable>

        <Pressable style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Palette size={20} color="#6366f1" />
          </View>
          <Text style={styles.menuText}>Themes</Text>
          <ChevronRight size={20} color="#666" />
        </Pressable>

        <Pressable style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Settings size={20} color="#6366f1" />
          </View>
          <Text style={styles.menuText}>Account Settings</Text>
          <ChevronRight size={20} color="#666" />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  about: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
