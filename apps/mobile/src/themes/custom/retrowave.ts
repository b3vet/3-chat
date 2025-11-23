// Retrowave Theme: 80s aesthetics, synthwave colors, neon grid
export const retrowaveTheme = {
  name: 'retrowave',
  displayName: 'Retrowave',

  colors: {
    // Primary colors - Hot pink
    primary: '#ff1493',
    primaryLight: '#ff69b4',
    primaryDark: '#dc1079',

    // Secondary - Electric orange
    secondary: '#ff6b35',
    secondaryLight: '#ff8c5a',
    secondaryDark: '#e55a2b',

    // Accent colors
    accent: '#ffd93d',
    accentAlt: '#6bcb77',
    warning: '#ffd93d',
    error: '#ff4757',
    success: '#6bcb77',

    // Backgrounds - Sunset gradient base
    background: '#1a0a2e',
    backgroundSecondary: '#2d1450',
    backgroundTertiary: '#401e72',
    surface: '#4a2282',
    surfaceElevated: '#5a2a9a',

    // Text
    text: '#ffffff',
    textSecondary: '#ffb8d0',
    textMuted: '#b08090',

    // Message bubbles
    messageSent: '#ff1493',
    messageReceived: '#2d1450',
    messageSentText: '#ffffff',
    messageReceivedText: '#ffffff',

    // UI elements
    border: '#ff149340',
    borderActive: '#ff1493',
    divider: '#ff149320',
    overlay: 'rgba(26, 10, 46, 0.95)',
  },

  gradients: {
    primary: ['#ff1493', '#ff6b35', '#ffd93d'],
    secondary: ['#ff6b35', '#ff1493', '#9b59b6'],
    background: ['#1a0a2e', '#2d1450', '#401e72'],
    sunset: ['#ff1493', '#ff6b35', '#ffd93d', '#ff6b35', '#ff1493'],
    neonGrid: ['#ff1493', '#00ffff'],
  },

  shadows: {
    neonPink: {
      shadowColor: '#ff1493',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 15,
      elevation: 10,
    },
    neonOrange: {
      shadowColor: '#ff6b35',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 15,
      elevation: 10,
    },
    subtle: {
      shadowColor: '#ff1493',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
  },

  particles: {
    colors: ['#ff1493', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'],
    count: 20,
    blur: 8,
    speed: 0.6,
  },

  animations: {
    gridEnabled: true,
    sunsetGlow: true,
    chromeText: true,
    scanlines: true,
  },

  typography: {
    fontFamily: 'System',
    headerWeight: '800',
    bodyWeight: '400',
    letterSpacing: 1.0,
  },

  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    pill: 24,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export type RetrowaveTheme = typeof retrowaveTheme;
export default retrowaveTheme;
