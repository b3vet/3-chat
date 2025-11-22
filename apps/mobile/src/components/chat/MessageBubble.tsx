import { format } from 'date-fns';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export interface MessageBubbleProps {
  id: string;
  content: string;
  senderId: string;
  currentUserId: string | null;
  status: string;
  createdAt: string;
  mediaUrl?: string | null;
  replyToId?: string | null;
}

const MessageBubble = memo(function MessageBubble({
  content,
  senderId,
  currentUserId,
  status,
  createdAt,
}: MessageBubbleProps) {
  const isSent = senderId === currentUserId;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15 }) }],
  }));

  const getStatusColor = (msgStatus: string) => {
    switch (msgStatus) {
      case 'read':
        return '#22c55e';
      case 'delivered':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(15)}
      style={[styles.container, isSent ? styles.sentContainer : styles.receivedContainer]}
    >
      <Animated.View
        style={[animatedStyle, styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}
      >
        <Text style={[styles.content, isSent ? styles.sentText : styles.receivedText]}>
          {content}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.time}>{format(new Date(createdAt), 'HH:mm')}</Text>
          {isSent && (
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 16,
  },
  sentContainer: {
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  sentBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
});

export default MessageBubble;
