import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

import { type ConnectionState, type PresenceUser, phoenixService } from '@/services/phoenix';
import { setUserOnlineAtom } from '@/stores/chatStore';

export function useConnectionState() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    phoenixService.getConnectionState(),
  );

  useEffect(() => {
    const unsubscribe = phoenixService.onConnectionChange((state) => {
      setConnectionState(state);
    });

    return unsubscribe;
  }, []);

  return connectionState;
}

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const setUserOnline = useSetAtom(setUserOnlineAtom);

  useEffect(() => {
    const unsubscribe = phoenixService.onPresence((presences) => {
      setOnlineUsers(presences);

      // Update the store with online status
      presences.forEach((user) => {
        setUserOnline({ userId: user.id, isOnline: true });
      });
    });

    // Subscribe to join/leave events
    const unsubJoin = phoenixService.onMessage('presence:join', (payload) => {
      const user = payload as PresenceUser;
      setOnlineUsers((prev) => {
        if (prev.some((u) => u.id === user.id)) return prev;
        return [...prev, user];
      });
      setUserOnline({ userId: user.id, isOnline: true });
    });

    const unsubLeave = phoenixService.onMessage('presence:leave', (payload) => {
      const { id } = payload as { id: string };
      setOnlineUsers((prev) => prev.filter((u) => u.id !== id));
      setUserOnline({ userId: id, isOnline: false });
    });

    return () => {
      unsubscribe();
      unsubJoin();
      unsubLeave();
    };
  }, [setUserOnline]);

  const isOnline = useCallback(
    (userId: string) => onlineUsers.some((u) => u.id === userId),
    [onlineUsers],
  );

  return { onlineUsers, isOnline };
}

export function useTypingIndicator(_chatId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

    const unsubscribe = phoenixService.onMessage('typing:update', (payload) => {
      const { user_id, typing } = payload as { user_id: string; typing: boolean };

      if (typing) {
        // Clear existing timer for this user
        const existingTimer = typingTimers.get(user_id);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Add user to typing list
        setTypingUsers((prev) => {
          if (prev.includes(user_id)) return prev;
          return [...prev, user_id];
        });

        // Auto-remove after 3 seconds of no update
        const timer = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== user_id));
          typingTimers.delete(user_id);
        }, 3000);

        typingTimers.set(user_id, timer);
      } else {
        // Remove user from typing list
        setTypingUsers((prev) => prev.filter((id) => id !== user_id));
        const timer = typingTimers.get(user_id);
        if (timer) {
          clearTimeout(timer);
          typingTimers.delete(user_id);
        }
      }
    });

    return () => {
      unsubscribe();
      // Clear all timers
      typingTimers.forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  return typingUsers;
}

export function useMessageStatus(_chatId: string) {
  useEffect(() => {
    const unsubscribe = phoenixService.onMessage('message:status', (payload) => {
      const { message_id, status } = payload as { message_id: string; status: string };
      // The chatStore will be updated via the store's updateMessageStatusAtom
      console.log(`Message ${message_id} status updated to ${status}`);
    });

    return unsubscribe;
  }, []);
}
