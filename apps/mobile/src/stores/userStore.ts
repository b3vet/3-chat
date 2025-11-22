import * as SecureStore from 'expo-secure-store';
import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

import type { User } from '@/services/api';

// Create secure storage for jotai
const secureStorage = createJSONStorage<string>(() => ({
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key);
    return value ?? null;
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
}));

// Auth token with secure storage persistence
export const authTokenAtom = atomWithStorage<string>('authToken', '', secureStorage);

// Refresh token
export const refreshTokenAtom = atomWithStorage<string>('refreshToken', '', secureStorage);

// Current user
export const userAtom = atom<User | null>(null);

// Derived atom for authentication state
export const isAuthenticatedAtom = atom(async (get) => {
  const token = await get(authTokenAtom);
  return Boolean(token && token.length > 0);
});

// User ID derived atom
export const userIdAtom = atom((get) => {
  const user = get(userAtom);
  return user?.id ?? null;
});
