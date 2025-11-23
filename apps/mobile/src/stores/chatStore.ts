import { atom } from 'jotai';
import type { Message } from '@/services/api';

export interface Chat {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  creatorId: string;
  memberCount: number;
}

// Active chats list
export const activeChatsAtom = atom<Chat[]>([]);

// Groups list
export const groupsAtom = atom<Group[]>([]);

// Current chat messages
export const messagesAtom = atom<Map<string, Message[]>>(new Map());

// Active chat ID
export const activeChatIdAtom = atom<string | null>(null);

// Typing users per chat
export const typingUsersAtom = atom<Map<string, string[]>>(new Map());

// Online users
export const onlineUsersAtom = atom<Set<string>>(new Set<string>());

// Get messages for a specific chat
export const chatMessagesAtom = atom((get) => {
  const chatId = get(activeChatIdAtom);
  const messages = get(messagesAtom);
  return chatId ? messages.get(chatId) || [] : [];
});

// Add message to a chat
export const addMessageAtom = atom(
  null,
  (get, set, { chatId, message }: { chatId: string; message: Message }) => {
    const messages = new Map(get(messagesAtom));
    const chatMessages = messages.get(chatId) || [];
    messages.set(chatId, [...chatMessages, message]);
    set(messagesAtom, messages);
  },
);

// Update message status
export const updateMessageStatusAtom = atom(
  null,
  (
    get,
    set,
    { chatId, messageId, status }: { chatId: string; messageId: string; status: string },
  ) => {
    const messages = new Map(get(messagesAtom));
    const chatMessages = messages.get(chatId) || [];
    const updatedMessages = chatMessages.map((msg) =>
      msg.id === messageId ? { ...msg, status } : msg,
    );
    messages.set(chatId, updatedMessages);
    set(messagesAtom, messages);
  },
);

// Set typing user
export const setTypingUserAtom = atom(
  null,
  (
    get,
    set,
    { chatId, userId, isTyping }: { chatId: string; userId: string; isTyping: boolean },
  ) => {
    const typingUsers = new Map(get(typingUsersAtom));
    const chatTyping = typingUsers.get(chatId) || [];

    if (isTyping && !chatTyping.includes(userId)) {
      typingUsers.set(chatId, [...chatTyping, userId]);
    } else if (!isTyping) {
      typingUsers.set(
        chatId,
        chatTyping.filter((id) => id !== userId),
      );
    }

    set(typingUsersAtom, typingUsers);
  },
);

// Clear messages for a specific chat
export const clearChatMessagesAtom = atom(null, (get, set, chatId: string) => {
  const messages = new Map(get(messagesAtom));
  messages.delete(chatId);
  set(messagesAtom, messages);
});

// Delete a message
export const deleteMessageAtom = atom(
  null,
  (get, set, { chatId, messageId }: { chatId: string; messageId: string }) => {
    const messages = new Map(get(messagesAtom));
    const chatMessages = messages.get(chatId) || [];
    messages.set(
      chatId,
      chatMessages.filter((msg) => msg.id !== messageId),
    );
    set(messagesAtom, messages);
  },
);

// Add or update a chat in the list
export const upsertChatAtom = atom(null, (get, set, chat: Chat) => {
  const chats = get(activeChatsAtom);
  const existingIndex = chats.findIndex((c) => c.id === chat.id);

  if (existingIndex >= 0) {
    const updatedChats = [...chats];
    updatedChats[existingIndex] = chat;
    set(activeChatsAtom, updatedChats);
  } else {
    set(activeChatsAtom, [chat, ...chats]);
  }
});

// Set user online status
export const setUserOnlineAtom = atom(
  null,
  (get, set, { userId, isOnline }: { userId: string; isOnline: boolean }) => {
    const onlineUsers = new Set(get(onlineUsersAtom));
    if (isOnline) {
      onlineUsers.add(userId);
    } else {
      onlineUsers.delete(userId);
    }
    set(onlineUsersAtom, onlineUsers);
  },
);

// Add group
export const addGroupAtom = atom(null, (get, set, group: Group) => {
  const groups = get(groupsAtom);
  set(groupsAtom, [...groups, group]);
});

// Update group
export const updateGroupAtom = atom(
  null,
  (get, set, { groupId, updates }: { groupId: string; updates: Partial<Group> }) => {
    const groups = get(groupsAtom);
    const updatedGroups = groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g));
    set(groupsAtom, updatedGroups);
  },
);

// Remove group
export const removeGroupAtom = atom(null, (get, set, groupId: string) => {
  const groups = get(groupsAtom);
  set(
    groupsAtom,
    groups.filter((g) => g.id !== groupId),
  );
});
