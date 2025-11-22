import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { format } from 'date-fns';
import { ArrowLeft, Send, Paperclip, Mic } from 'lucide-react-native';

import { userIdAtom } from '@/stores/userStore';
import { chatMessagesAtom, activeChatIdAtom, addMessageAtom, setTypingUserAtom, typingUsersAtom } from '@/stores/chatStore';
import { phoenixService } from '@/services/phoenix';
import { api, type Message } from '@/services/api';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const userId = useAtomValue(userIdAtom);
  const [activeChatId, setActiveChatId] = useAtom(activeChatIdAtom);
  const messages = useAtomValue(chatMessagesAtom);
  const addMessage = useSetAtom(addMessageAtom);
  const typingUsers = useAtomValue(typingUsersAtom);
  const setTypingUser = useSetAtom(setTypingUserAtom);

  const chatTyping = typingUsers.get(id) || [];

  useEffect(() => {
    setActiveChatId(id);
    loadMessages();

    // Join channel
    phoenixService.joinChatChannel(id);

    // Listen for new messages
    const unsubMessage = phoenixService.onMessage('message:new', (payload) => {
      addMessage({ chatId: id, message: payload });
    });

    // Listen for typing
    const unsubTyping = phoenixService.onMessage('typing:update', (payload) => {
      setTypingUser({ chatId: id, userId: payload.user_id, isTyping: payload.typing });
    });

    return () => {
      unsubMessage();
      unsubTyping();
      phoenixService.leaveChannel(`chat:${id}`);
    };
  }, [id]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMessages(id);
      // Load messages into store
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    [id]
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isSent = item.sender_id === userId;

    return (
      <View style={[styles.messageBubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={[styles.messageText, isSent ? styles.sentText : styles.receivedText]}>
          {item.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>
            {format(new Date(item.created_at), 'HH:mm')}
          </Text>
          {isSent && (
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          )}
        </View>
      </View>
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
          <Text style={styles.headerTitle}>Chat</Text>
          {chatTyping.length > 0 && (
            <Text style={styles.typingIndicator}>typing...</Text>
          )}
        </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  typingIndicator: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
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
