import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { ArrowLeft, Mic, MoreVertical, Paperclip, Send, Users } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Message } from '@/services/api';
import { phoenixService } from '@/services/phoenix';
import {
  addMessageAtom,
  groupsAtom,
  messagesAtom,
  setTypingUserAtom,
  typingUsersAtom,
} from '@/stores/chatStore';
import { userIdAtom } from '@/stores/userStore';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState('');
  const [_isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const userId = useAtomValue(userIdAtom);
  const allMessages = useAtomValue(messagesAtom);
  const addMessage = useSetAtom(addMessageAtom);
  const typingUsers = useAtomValue(typingUsersAtom);
  const setTypingUser = useSetAtom(setTypingUserAtom);
  const groups = useAtomValue(groupsAtom);

  const group = groups.find((g) => g.id === id);
  const messages = allMessages.get(id) || [];
  const groupTyping = typingUsers.get(id) || [];

  useEffect(() => {
    setIsLoading(true);

    // Join group channel
    phoenixService.joinGroupChannel(id);

    // Listen for new messages
    const unsubMessage = phoenixService.onMessage('message:new', (payload: unknown) => {
      const msg = payload as Message & { group_id?: string };
      if (msg.group_id === id) {
        addMessage({ chatId: id, message: msg });
      }
    });

    // Listen for typing
    const unsubTyping = phoenixService.onMessage('typing:update', (payload: unknown) => {
      const data = payload as { user_id: string; typing: boolean };
      setTypingUser({ chatId: id, userId: data.user_id, isTyping: data.typing });
    });

    setIsLoading(false);

    return () => {
      unsubMessage();
      unsubTyping();
      phoenixService.leaveChannel(`group:${id}`);
    };
  }, [id, addMessage, setTypingUser]);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;

    phoenixService.sendMessage(id, message.trim());
    setMessage('');
    phoenixService.sendTypingStop(id);
  }, [id, message]);

  const handleTextChange = useCallback(
    (text: string) => {
      setMessage(text);
      if (text.length > 0) {
        phoenixService.sendTypingStart(id);
      } else {
        phoenixService.sendTypingStop(id);
      }
    },
    [id],
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isSent = item.sender_id === userId;

    return (
      <Animated.View
        entering={FadeInUp.springify().damping(15)}
        style={[styles.messageBubble, isSent ? styles.sentBubble : styles.receivedBubble]}
      >
        {!isSent && <Text style={styles.senderName}>User {item.sender_id.slice(0, 6)}</Text>}
        <Text style={[styles.messageText, isSent ? styles.sentText : styles.receivedText]}>
          {item.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>{format(new Date(item.created_at), 'HH:mm')}</Text>
          {isSent && (
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          )}
        </View>
      </Animated.View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return '#22c55e';
      case 'delivered':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Users size={20} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{group?.name || 'Group'}</Text>
            {groupTyping.length > 0 ? (
              <Text style={styles.typingIndicator}>
                {groupTyping.length === 1 ? 'typing...' : `${groupTyping.length} typing...`}
              </Text>
            ) : (
              <Text style={styles.memberInfo}>{group?.memberCount || 1} members</Text>
            )}
          </View>
        </View>
        <Pressable style={styles.moreButton}>
          <MoreVertical size={24} color="#fff" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          inverted
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <Pressable style={styles.attachButton}>
            <Paperclip size={22} color="#888" />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#666"
            value={message}
            onChangeText={handleTextChange}
            multiline
            maxLength={4000}
          />
          {message.trim() ? (
            <Pressable style={styles.sendButton} onPress={handleSend}>
              <Send size={22} color="#fff" />
            </Pressable>
          ) : (
            <Pressable style={styles.micButton}>
              <Mic size={22} color="#888" />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  memberInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  typingIndicator: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  sentBubble: {
    backgroundColor: '#6366f1',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#1a1a1a',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    padding: 8,
  },
});
