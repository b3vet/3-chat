// User Types
export interface User {
  id: string;
  username: string;
  phone_number: string;
  display_name: string;
  avatar_url: string | null;
  about: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

// Authentication Types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface RegisterRequest {
  username: string;
  phone_number: string;
  display_name: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp: string;
}

// Message Types
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'voice' | 'document' | 'location';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  sender_id: string;
  chat_id: string | null;
  group_id: string | null;
  content: string;
  message_type: MessageType;
  status: MessageStatus;
  media_url: string | null;
  reply_to_id: string | null;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
  deleted_at: string | null;
}

export interface SendMessageRequest {
  chat_id?: string;
  group_id?: string;
  content: string;
  message_type?: MessageType;
  media_url?: string;
  reply_to_id?: string;
}

// Chat Types
export interface Chat {
  id: string;
  participant_id: string;
  participant: PublicUser;
  last_message: Message | null;
  unread_count: number;
  updated_at: string;
}

// Group Types
export type MemberRole = 'creator' | 'admin' | 'member';

export interface GroupMember {
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  creator_id: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  icon_url?: string;
}

// Friend Types
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
}

// Media Types
export interface MediaUploadResponse {
  url: string;
  filename: string;
  content_type: string;
}

// Presence Types
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserPresence {
  user_id: string;
  status: PresenceStatus;
  last_seen: string;
}

// WebSocket Event Types
export interface TypingEvent {
  user_id: string;
  chat_id?: string;
  group_id?: string;
  typing: boolean;
}

export interface MessageStatusEvent {
  message_id: string;
  status: MessageStatus;
  timestamp: string;
}

export interface PresenceEvent {
  user_id: string;
  status: PresenceStatus;
  last_seen: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
