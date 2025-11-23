// Aurora Theme: Northern lights animations, ethereal greens and blues
export const auroraTheme = {
  name: 'aurora',
  displayName: 'Aurora Borealis',

  colors: {
    // Primary colors - Aurora green
    primary: '#00ff88',
    primaryLight: '#66ffbb',
    primaryDark: '#00cc66',

    // Secondary - Deep blue
    secondary: '#0088ff',
    secondaryLight: '#66bbff',
    secondaryDark: '#0066cc',

    // Accent colors
    accent: '#00ffcc',
    accentAlt: '#8800ff',
    warning: '#ffcc00',
    error: '#ff4466',
    success: '#00ff88',

    // Backgrounds - Deep night sky
    background: '#000a14',
    backgroundSecondary: '#001428',
    backgroundTertiary: '#001e3c',
    surface: '#002244',
    surfaceElevated: '#003366',

    // Text
    text: '#ffffff',
    textSecondary: '#aaddff',
    textMuted: '#6699bb',

    // Message bubbles
    messageSent: '#00cc88',
    messageReceived: '#002244',
    messageSentText: '#ffffff',
    messageReceivedText: '#ffffff',

    // UI elements
    border: '#00ff8840',
    borderActive: '#00ff88',
    divider: '#00ff8820',
    overlay: 'rgba(0, 10, 20, 0.9)',
  },

  gradients: {
    primary: ['#00ff88', '#00ccff', '#8800ff'],
    secondary: ['#0088ff', '#00ccff', '#00ff88'],
    background: ['#000a14', '#001428', '#002244'],
    aurora: ['#00ff88', '#00ffcc', '#00ccff', '#0088ff', '#8800ff'],
    night: ['#000a14', '#001e3c', '#003366'],
  },

  shadows: {
    auroraGreen: {
      shadowColor: '#00ff88',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 10,
    },
    auroraBlue: {
      shadowColor: '#00ccff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 10,
    },
    subtle: {
      shadowColor: '#00ff88',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  particles: {
    colors: ['#00ff88', '#00ffcc', '#00ccff', '#0088ff', '#8800ff'],
    count: 20,
    blur: 12,
    speed: 0.3,
  },

  animations: {
    waveEnabled: true,
    shimmer: true,
    flowSpeed: 0.3,
    breathingEffect: true,
  },

  typography: {
    fontFamily: 'System',
    headerWeight: '600',
    bodyWeight: '400',
    letterSpacing: 0.3,
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

export type AuroraTheme = typeof auroraTheme;
export default auroraTheme;
