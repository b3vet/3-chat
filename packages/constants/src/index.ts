// API Constants
export const API_VERSION = '1.0.0';
export const API_TIMEOUT = 30000;

// Validation Constants
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 6;
export const DISPLAY_NAME_MAX_LENGTH = 50;
export const ABOUT_MAX_LENGTH = 500;
export const MESSAGE_MAX_LENGTH = 4000;
export const GROUP_NAME_MAX_LENGTH = 100;
export const GROUP_DESCRIPTION_MAX_LENGTH = 500;

// Limits
export const MAX_GROUP_MEMBERS = 50;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_MESSAGES_PER_MINUTE = 100;
export const MAX_UPLOADS_PER_MINUTE = 10;
export const MAX_API_CALLS_PER_HOUR = 1000;

// Timeouts
export const OTP_VALIDITY_SECONDS = 300; // 5 minutes
export const TYPING_TIMEOUT_MS = 3000;
export const PRESENCE_TIMEOUT_MS = 60000;

// File Types
export const ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
export const ALLOWED_VIDEO_TYPES = ['.mp4', '.mov', '.avi'];
export const ALLOWED_AUDIO_TYPES = ['.mp3', '.wav', '.m4a'];
export const ALLOWED_DOCUMENT_TYPES = ['.pdf', '.doc', '.docx', '.txt'];
export const ALL_ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
];

// Regex Patterns
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// Theme Names
export const THEMES = ['default', 'cyberpunk', 'aurora', 'ocean', 'space', 'retrowave'] as const;
export type ThemeName = (typeof THEMES)[number];

// Message Status Icons (for creative indicators)
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
} as const;

// Presence Status
export const PRESENCE_STATUS = {
  ONLINE: 'online',
  AWAY: 'away',
  BUSY: 'busy',
  OFFLINE: 'offline',
} as const;

// WebSocket Events
export const WS_EVENTS = {
  // Client -> Server
  MESSAGE_SEND: 'message:send',
  MESSAGE_DELETE: 'message:delete',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  PRESENCE_UPDATE: 'presence:update',

  // Server -> Client
  MESSAGE_NEW: 'message:new',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_STATUS: 'message:status',
  TYPING_UPDATE: 'typing:update',
  PRESENCE_CHANGE: 'presence:change',
  MESSAGES_HISTORY: 'messages:history',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'themeName',
  ANIMATIONS_ENABLED: 'animationsEnabled',
  SOUND_ENABLED: 'soundEnabled',
  HAPTIC_ENABLED: 'hapticEnabled',
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  MEDIUM: 300,
  SLOW: 500,
  BOUNCE: 400,
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#6366f1',
  PRIMARY_LIGHT: '#818cf8',
  PRIMARY_DARK: '#4f46e5',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  BACKGROUND: '#000000',
  SURFACE: '#1a1a1a',
  TEXT: '#ffffff',
  TEXT_MUTED: '#a1a1aa',
} as const;
