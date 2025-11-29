import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';
import { NavigationEdgeEffect } from '@/components/animated';
import { api } from '@/services/api';
import { phoenixService } from '@/services/phoenix';
import { activeChatsAtom } from '@/stores/chatStore';
import { friendsAtom, pendingRequestsAtom, sentRequestsAtom } from '@/stores/friendsStore';
import { authTokenAtom, userAtom } from '@/stores/userStore';
import { tamaguiConfig } from '@/themes/tamagui/tamagui.config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const [authToken] = useAtom(authTokenAtom);
  const setUser = useSetAtom(userAtom);
  const setFriends = useSetAtom(friendsAtom);
  const setSentRequests = useSetAtom(sentRequestsAtom);
  const setPendingRequests = useSetAtom(pendingRequestsAtom);
  const setActiveChats = useSetAtom(activeChatsAtom);

  // Track navigation changes to trigger edge effect
  const pathname = usePathname();
  const [navKey, setNavKey] = useState(0);

  useEffect(() => {
    setNavKey((prev) => prev + 1);
  }, [pathname]);

  useEffect(() => {
    if (authToken) {
      phoenixService.connect(authToken);

      // Fetch user profile
      api
        .getProfile()
        .then(({ user }) => setUser(user))
        .catch((err) => console.error('Failed to fetch user profile:', err));

      // Fetch friends data
      Promise.all([api.getFriends(), api.getSentRequests(), api.getPendingRequests()])
        .then(([friendsRes, sentRes, pendingRes]) => {
          setFriends(
            friendsRes.friends.map((user) => ({
              ...user,
              status: 'accepted' as const,
            })),
          );
          setSentRequests(
            sentRes.requests.map((user) => ({
              ...user,
              status: 'pending' as const,
            })),
          );
          setPendingRequests(
            pendingRes.requests.map((user) => ({
              ...user,
              status: 'pending' as const,
            })),
          );
        })
        .catch((err) => console.error('Failed to fetch friends:', err));

      // Fetch chats with last messages
      api
        .getChats()
        .then(({ chats }) => {
          setActiveChats(
            chats.map((chat) => ({
              id: chat.id,
              recipientId: chat.recipient.id,
              name: chat.recipient.display_name,
              avatarUrl: chat.recipient.avatar_url || undefined,
              lastMessage: chat.last_message,
              unreadCount: 0,
            })),
          );
        })
        .catch((err) => console.error('Failed to fetch chats:', err));
    }

    return () => {
      phoenixService.disconnect();
    };
  }, [authToken, setUser, setFriends, setSentRequests, setPendingRequests, setActiveChats]);

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
          <StatusBar style="light" />
          <NavigationEdgeEffect key={navKey} color="#6366f1" duration={600} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen
              name="chat/[id]"
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="group/[id]"
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
