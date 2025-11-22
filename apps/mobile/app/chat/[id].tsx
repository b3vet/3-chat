import { useLocalSearchParams } from 'expo-router';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { ChatHeader, type Message, MessageInput, MessageList } from '@/components/chat';
import { api } from '@/services/api';
import { phoenixService } from '@/services/phoenix';
import {
  activeChatIdAtom,
  addMessageAtom,
  chatMessagesAtom,
  clearChatMessagesAtom,
  setTypingUserAtom,
  typingUsersAtom,
} from '@/stores/chatStore';
import { userIdAtom } from '@/stores/userStore';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [chatTitle, setChatTitle] = useState('Chat');

  const userId = useAtomValue(userIdAtom);
  const [, setActiveChatId] = useAtom(activeChatIdAtom);
  const messages = useAtomValue(chatMessagesAtom);
  const addMessage = useSetAtom(addMessageAtom);
  const clearMessages = useSetAtom(clearChatMessagesAtom);
  const typingUsers = useAtomValue(typingUsersAtom);
  const setTypingUser = useSetAtom(setTypingUserAtom);

  const chatTyping = typingUsers.get(id) || [];
  const isTyping = chatTyping.length > 0;

  // Extract other user ID from chat ID (format: userId1:userId2)
  const getOtherUserId = useCallback(() => {
    const parts = id.split(':');
    return parts.find((part) => part !== userId) || parts[0];
  }, [id, userId]);

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      clearMessages();
      const { messages: loadedMessages } = await api.getMessages(id);
      for (const msg of loadedMessages) {
        addMessage({ chatId: id, message: msg });
      }

      // Try to get chat info for title
      const otherUserId = getOtherUserId();
      if (otherUserId) {
        setChatTitle(`${otherUserId.substring(0, 8)}...`);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, addMessage, clearMessages, getOtherUserId]);

  useEffect(() => {
    setActiveChatId(id);
    loadMessages();

    // Join channel
    phoenixService.joinChatChannel(id);

    // Listen for new messages
    const unsubMessage = phoenixService.onMessage('message:new', (payload) => {
      addMessage({ chatId: id, message: payload as Message });
    });

    // Listen for typing
    const unsubTyping = phoenixService.onMessage('typing:update', (payload) => {
      const typingPayload = payload as { user_id: string; typing: boolean };
      setTypingUser({
        chatId: id,
        userId: typingPayload.user_id,
        isTyping: typingPayload.typing,
      });
    });

    return () => {
      unsubMessage();
      unsubTyping();
      phoenixService.leaveChannel(`chat:${id}`);
      setActiveChatId(null);
    };
  }, [id, addMessage, setTypingUser, setActiveChatId, loadMessages]);

  const handleSend = useCallback(
    (content: string) => {
      phoenixService.sendMessage(id, content);
    },
    [id],
  );

  const handleTypingStart = useCallback(() => {
    phoenixService.sendTypingStart(id);
  }, [id]);

  const handleTypingStop = useCallback(() => {
    phoenixService.sendTypingStop(id);
  }, [id]);

  const handleLoadMore = useCallback(async () => {
    // TODO: Implement pagination for loading older messages
  }, []);

  return (
    <View style={styles.container}>
      <ChatHeader title={chatTitle} isTyping={isTyping} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <MessageList
          messages={messages}
          currentUserId={userId}
          onEndReached={handleLoadMore}
          isLoading={isLoading}
        />

        <MessageInput
          onSend={handleSend}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          disabled={isLoading}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
});
