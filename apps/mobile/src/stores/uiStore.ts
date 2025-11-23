import AsyncStorage from '@react-native-async-storage/async-storage';
import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export type ThemeName = 'cyberpunk' | 'aurora' | 'ocean' | 'space' | 'retrowave' | 'default';

// Create async string storage adapter for jotai
// createJSONStorage expects a string storage (handles JSON serialization internally)
const createAsyncStringStorage = () => ({
  getItem: async (key: string) => {
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
});

// Create typed storage adapters for each atom type
const themeStorage = createJSONStorage<ThemeName>(createAsyncStringStorage);
const booleanStorage = createJSONStorage<boolean>(createAsyncStringStorage);

// Current theme
export const themeNameAtom = atomWithStorage<ThemeName>('themeName', 'default', themeStorage);

// Animations enabled
export const animationsEnabledAtom = atomWithStorage<boolean>(
  'animationsEnabled',
  true,
  booleanStorage,
);

// Sound effects enabled
export const soundEnabledAtom = atomWithStorage<boolean>('soundEnabled', true, booleanStorage);

// Haptic feedback enabled
export const hapticEnabledAtom = atomWithStorage<boolean>('hapticEnabled', true, booleanStorage);

// Loading states
export const isLoadingAtom = atom<boolean>(false);

// Global error state
export const globalErrorAtom = atom<string | null>(null);

// Modal visibility
export const activeModalAtom = atom<string | null>(null);
