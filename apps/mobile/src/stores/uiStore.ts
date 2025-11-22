import AsyncStorage from '@react-native-async-storage/async-storage';
import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export type ThemeName = 'cyberpunk' | 'aurora' | 'ocean' | 'space' | 'retrowave' | 'default';

// Create async storage for jotai
const asyncStorage = createJSONStorage<any>(() => ({
  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (key: string, value: any) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
}));

// Current theme
export const themeNameAtom = atomWithStorage<ThemeName>('themeName', 'default', asyncStorage);

// Animations enabled
export const animationsEnabledAtom = atomWithStorage<boolean>(
  'animationsEnabled',
  true,
  asyncStorage,
);

// Sound effects enabled
export const soundEnabledAtom = atomWithStorage<boolean>('soundEnabled', true, asyncStorage);

// Haptic feedback enabled
export const hapticEnabledAtom = atomWithStorage<boolean>('hapticEnabled', true, asyncStorage);

// Loading states
export const isLoadingAtom = atom<boolean>(false);

// Global error state
export const globalErrorAtom = atom<string | null>(null);

// Modal visibility
export const activeModalAtom = atom<string | null>(null);
