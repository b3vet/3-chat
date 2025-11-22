import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { tamaguiConfig } from '@/themes/tamagui/tamagui.config';
import { authTokenAtom } from '@/stores/userStore';
import { phoenixService } from '@/services/phoenix';

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

  useEffect(() => {
    if (authToken) {
      phoenixService.connect(authToken);
    }

    return () => {
      phoenixService.disconnect();
    };
  }, [authToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
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
