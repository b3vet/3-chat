import { memo, useCallback, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { Message } from '@/services/api';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
  onEndReached?: () => void;
  isLoading?: boolean;
}

const MessageList = memo(function MessageList({
  messages,
  currentUserId,
  onEndReached,
  isLoading,
}: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        id={item.id}
        content={item.content}
        senderId={item.sender_id}
        currentUserId={currentUserId}
        status={item.status}
        createdAt={item.created_at}
        mediaUrl={item.media_url}
        replyToId={item.reply_to_id}
      />
    ),
    [currentUserId],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: 80, // Approximate item height
      offset: 80 * index,
      index,
    }),
    [],
  );

  if (messages.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      inverted
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      maxToRenderPerBatch={15}
      windowSize={21}
      initialNumToRender={20}
      removeClippedSubviews
    />
  );
});

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  },
});

export default MessageList;
