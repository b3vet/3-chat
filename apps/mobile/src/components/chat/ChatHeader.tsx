import { router } from 'expo-router';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  isTyping?: boolean;
  onCallPress?: () => void;
  onVideoPress?: () => void;
  onMenuPress?: () => void;
}

const ChatHeader = memo(function ChatHeader({
  title,
  subtitle,
  isOnline,
  isTyping,
  onCallPress,
  onVideoPress,
  onMenuPress,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <ArrowLeft size={24} color="#fff" />
      </Pressable>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{title[0]?.toUpperCase() || '?'}</Text>
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {isTyping ? (
          <Text style={styles.typingText}>typing...</Text>
        ) : subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : isOnline ? (
          <Text style={styles.onlineText}>Online</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {onCallPress && (
          <Pressable onPress={onCallPress} style={styles.actionButton} hitSlop={8}>
            <Phone size={20} color="#fff" />
          </Pressable>
        )}
        {onVideoPress && (
          <Pressable onPress={onVideoPress} style={styles.actionButton} hitSlop={8}>
            <Video size={20} color="#fff" />
          </Pressable>
        )}
        {onMenuPress && (
          <Pressable onPress={onMenuPress} style={styles.actionButton} hitSlop={8}>
            <MoreVertical size={20} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: '#000',
  },
  backButton: {
    padding: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#000',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  typingText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
  },
  onlineText: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default ChatHeader;
