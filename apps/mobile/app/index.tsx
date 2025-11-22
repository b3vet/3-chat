import { Redirect } from 'expo-router';
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom } from '@/stores/userStore';

export default function Index() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/chats" />;
  }

  return <Redirect href="/(auth)/login" />;
}
