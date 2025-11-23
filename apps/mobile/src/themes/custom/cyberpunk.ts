// Cyberpunk Theme: Neon colors, glitch effects, dark backgrounds
export const cyberpunkTheme = {
  name: 'cyberpunk',
  displayName: 'Cyberpunk',

  colors: {
    // Primary colors - Neon pink/magenta
    primary: '#ff00ff',
    primaryLight: '#ff66ff',
    primaryDark: '#cc00cc',

    // Secondary - Cyan/Electric blue
    secondary: '#00ffff',
    secondaryLight: '#66ffff',
    secondaryDark: '#00cccc',

    // Accent colors
    accent: '#ff0080',
    accentAlt: '#00ff80',
    warning: '#ffff00',
    error: '#ff0040',
    success: '#00ff40',

    // Backgrounds
    background: '#0a0014',
    backgroundSecondary: '#140028',
    backgroundTertiary: '#1e003c',
    surface: '#1a0033',
    surfaceElevated: '#240044',

    // Text
    text: '#ffffff',
    textSecondary: '#ccccff',
    textMuted: '#8866aa',

    // Message bubbles
    messageSent: '#ff00ff',
    messageReceived: '#1a0033',
    messageSentText: '#ffffff',
    messageReceivedText: '#ffffff',

    // UI elements
    border: '#ff00ff40',
    borderActive: '#ff00ff',
    divider: '#ff00ff20',
    overlay: 'rgba(10, 0, 20, 0.9)',
  },

  gradients: {
    primary: ['#ff00ff', '#ff0080', '#ff00ff'],
    secondary: ['#00ffff', '#0080ff', '#00ffff'],
    background: ['#0a0014', '#140028', '#1e003c'],
    neon: ['#ff00ff', '#00ffff', '#ff00ff'],
    sunset: ['#ff0080', '#ff00ff', '#8000ff'],
  },

  shadows: {
    neonPink: {
      shadowColor: '#ff00ff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 10,
    },
    neonCyan: {
      shadowColor: '#00ffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 10,
    },
    subtle: {
      shadowColor: '#ff00ff',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
  },

  particles: {
    colors: ['#ff00ff', '#00ffff', '#ff0080', '#00ff80', '#ffff00'],
    count: 25,
    blur: 6,
    speed: 0.8,
  },

  animations: {
    glitchEnabled: true,
    neonPulse: true,
    scanlines: true,
    flickerIntensity: 0.05,
  },

  typography: {
    fontFamily: 'System',
    headerWeight: '700',
    bodyWeight: '400',
    letterSpacing: 0.5,
  },

  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
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

export type CyberpunkTheme = typeof cyberpunkTheme;
export default cyberpunkTheme;
