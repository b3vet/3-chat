// Space Theme: Stars, galaxy backgrounds, cosmic colors
export const spaceTheme = {
  name: 'space',
  displayName: 'Cosmic Space',

  colors: {
    // Primary colors - Nebula purple
    primary: '#8b5cf6',
    primaryLight: '#a78bfa',
    primaryDark: '#7c3aed',

    // Secondary - Star white/blue
    secondary: '#e0e7ff',
    secondaryLight: '#f0f4ff',
    secondaryDark: '#c7d2fe',

    // Accent colors
    accent: '#f472b6',
    accentAlt: '#38bdf8',
    warning: '#fbbf24',
    error: '#ef4444',
    success: '#34d399',

    // Backgrounds - Deep space black
    background: '#030014',
    backgroundSecondary: '#0a0520',
    backgroundTertiary: '#10082c',
    surface: '#150b38',
    surfaceElevated: '#1a0f44',

    // Text
    text: '#ffffff',
    textSecondary: '#c4b5fd',
    textMuted: '#8b7bb0',

    // Message bubbles
    messageSent: '#7c3aed',
    messageReceived: '#150b38',
    messageSentText: '#ffffff',
    messageReceivedText: '#ffffff',

    // UI elements
    border: '#8b5cf640',
    borderActive: '#8b5cf6',
    divider: '#8b5cf620',
    overlay: 'rgba(3, 0, 20, 0.95)',
  },

  gradients: {
    primary: ['#7c3aed', '#8b5cf6', '#a78bfa'],
    secondary: ['#c7d2fe', '#e0e7ff', '#f0f4ff'],
    background: ['#030014', '#0a0520', '#10082c'],
    nebula: ['#7c3aed', '#8b5cf6', '#f472b6', '#38bdf8'],
    galaxy: ['#030014', '#150b38', '#2d1b69'],
  },

  shadows: {
    nebula: {
      shadowColor: '#8b5cf6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 12,
    },
    star: {
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 6,
    },
    subtle: {
      shadowColor: '#8b5cf6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  particles: {
    colors: ['#ffffff', '#ffffcc', '#ccccff', '#ffccff', '#ccffff'],
    count: 60,
    blur: 2,
    speed: 0.2,
  },

  animations: {
    twinkleEnabled: true,
    shootingStars: true,
    nebulaFlow: true,
    parallaxDepth: 3,
  },

  typography: {
    fontFamily: 'System',
    headerWeight: '600',
    bodyWeight: '400',
    letterSpacing: 0.4,
  },

  borderRadius: {
    small: 6,
    medium: 12,
    large: 20,
    pill: 28,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export type SpaceTheme = typeof spaceTheme;
export default spaceTheme;
