import { createAnimations } from '@tamagui/animations-react-native';
import { createTamagui, createTokens } from '@tamagui/core';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';

const headingFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
    4: '700',
    5: '800',
  },
});

const bodyFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
  },
});

const tokens = createTokens({
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
    11: 64,
    12: 80,
    true: 16,
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
    true: 16,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    true: 8,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
  color: {
    // Primary colors
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',

    // Background colors
    background: '#000000',
    backgroundLight: '#0a0a0a',
    backgroundCard: '#1a1a1a',

    // Text colors
    text: '#ffffff',
    textMuted: '#a1a1aa',
    textDim: '#71717a',

    // Semantic colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',

    // Border colors
    border: '#27272a',
    borderLight: '#3f3f46',

    // Accent colors
    accent: '#06b6d4',
    accentLight: '#22d3ee',

    // Neon colors for cyberpunk theme
    neonPink: '#ff00ff',
    neonBlue: '#00ffff',
    neonGreen: '#00ff00',
    neonPurple: '#bf00ff',
  },
});

const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 150,
  },
  slow: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 100,
  },
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 200,
  },
  lazy: {
    type: 'spring',
    damping: 25,
    mass: 1.2,
    stiffness: 50,
  },
});

export const tamaguiConfig = createTamagui({
  tokens,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes: {
    dark: {
      background: tokens.color.background,
      backgroundHover: tokens.color.backgroundLight,
      backgroundPress: tokens.color.backgroundCard,
      backgroundFocus: tokens.color.backgroundCard,
      color: tokens.color.text,
      colorHover: tokens.color.textMuted,
      borderColor: tokens.color.border,
      borderColorHover: tokens.color.borderLight,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      primary: tokens.color.primary,
      error: tokens.color.error,
    },
    light: {
      background: '#ffffff',
      backgroundHover: '#f4f4f5',
      backgroundPress: '#e4e4e7',
      backgroundFocus: '#e4e4e7',
      color: '#18181b',
      colorHover: '#71717a',
      borderColor: '#e4e4e7',
      borderColorHover: '#d4d4d8',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      primary: tokens.color.primary,
      error: tokens.color.error,
    },
  },
  shorthands,
  animations,
  defaultTheme: 'dark',
});

export type TamaguiConfig = typeof tamaguiConfig;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}
