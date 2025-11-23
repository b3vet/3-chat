// Ocean Theme: Water ripples, bubbles, deep sea blues
export const oceanTheme = {
  name: 'ocean',
  displayName: 'Ocean Depths',

  colors: {
    // Primary colors - Ocean blue
    primary: '#0099ff',
    primaryLight: '#66ccff',
    primaryDark: '#0066cc',

    // Secondary - Aqua
    secondary: '#00ccff',
    secondaryLight: '#66e5ff',
    secondaryDark: '#0099cc',

    // Accent colors
    accent: '#66ffff',
    accentAlt: '#0066cc',
    warning: '#ffcc66',
    error: '#ff6666',
    success: '#66ff99',

    // Backgrounds - Deep ocean
    background: '#001833',
    backgroundSecondary: '#002244',
    backgroundTertiary: '#003366',
    surface: '#004080',
    surfaceElevated: '#0055aa',

    // Text
    text: '#ffffff',
    textSecondary: '#aaddff',
    textMuted: '#6699cc',

    // Message bubbles
    messageSent: '#0088cc',
    messageReceived: '#003366',
    messageSentText: '#ffffff',
    messageReceivedText: '#ffffff',

    // UI elements
    border: '#00ccff40',
    borderActive: '#00ccff',
    divider: '#00ccff20',
    overlay: 'rgba(0, 24, 51, 0.9)',
  },

  gradients: {
    primary: ['#0066cc', '#0099ff', '#00ccff'],
    secondary: ['#003366', '#006699', '#0099cc'],
    background: ['#001833', '#002244', '#003366'],
    ocean: ['#001833', '#003366', '#0066cc', '#0099ff'],
    surface: ['#004080', '#0055aa', '#0066cc'],
  },

  shadows: {
    oceanBlue: {
      shadowColor: '#0099ff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    aqua: {
      shadowColor: '#00ccff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    subtle: {
      shadowColor: '#0099ff',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
  },

  particles: {
    colors: ['#0066cc', '#0099ff', '#00ccff', '#66ffff', '#ffffff'],
    count: 30,
    blur: 8,
    speed: 0.5,
  },

  animations: {
    rippleEnabled: true,
    bubblesEnabled: true,
    waveMotion: true,
    floatSpeed: 0.5,
  },

  typography: {
    fontFamily: 'System',
    headerWeight: '600',
    bodyWeight: '400',
    letterSpacing: 0.2,
  },

  borderRadius: {
    small: 8,
    medium: 16,
    large: 24,
    pill: 32,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export type OceanTheme = typeof oceanTheme;
export default oceanTheme;
