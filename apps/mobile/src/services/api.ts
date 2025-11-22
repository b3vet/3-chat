import ky from 'ky';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

const apiClient = ky.create({
  prefixUrl: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'API-Version': '1.0.0',
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          await SecureStore.deleteItemAsync('authToken');
        }
        return response;
      },
    ],
  },
});

export interface User {
  id: string;
  username: string;
  display_name: string;
  phone_number: string;
  avatar_url: string | null;
  about: string | null;
  verified: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Message {
  id: string;
  sender_id: string;
  chat_id: string | null;
  group_id: string | null;
  content: string;
  message_type: string;
  status: string;
  media_url: string | null;
  reply_to_id: string | null;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
}

export const api = {
  // Auth
  async register(data: {
    username: string;
    phone_number: string;
    display_name: string;
    password: string;
  }) {
    return apiClient.post('auth/register', { json: data }).json<{ message: string; user_id: string }>();
  },

  async verifyOTP(phone_number: string, otp: string): Promise<AuthResponse> {
    return apiClient.post('auth/verify-otp', { json: { phone_number, otp } }).json();
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    return apiClient.post('auth/login', { json: { username, password } }).json();
  },

  async refreshToken(refresh_token: string): Promise<{ access_token: string; refresh_token: string }> {
    return apiClient.post('auth/refresh', { json: { refresh_token } }).json();
  },

  // User
  async getProfile(): Promise<{ user: User }> {
    return apiClient.get('users/profile').json();
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    return apiClient.put('users/profile', { json: data }).json();
  },

  async searchUsers(query: string): Promise<{ users: User[] }> {
    return apiClient.get('users/search', { searchParams: { q: query } }).json();
  },

  // Friends
  async getFriends(): Promise<{ friends: User[] }> {
    return apiClient.get('friends').json();
  },

  async addFriend(username: string) {
    return apiClient.post('friends/add', { json: { username } }).json();
  },

  async removeFriend(id: string) {
    return apiClient.delete(`friends/${id}`).json();
  },

  // Messages
  async getMessages(chatId: string, opts?: { limit?: number; offset?: number }): Promise<{ messages: Message[] }> {
    return apiClient.get(`messages/${chatId}`, { searchParams: opts as any }).json();
  },

  async sendMessage(data: {
    chat_id?: string;
    group_id?: string;
    content: string;
    message_type?: string;
    media_url?: string;
    reply_to_id?: string;
  }): Promise<{ message: Message }> {
    return apiClient.post('messages', { json: data }).json();
  },

  async deleteMessage(id: string) {
    return apiClient.delete(`messages/${id}`).json();
  },

  // Groups
  async getGroups() {
    return apiClient.get('groups').json();
  },

  async createGroup(data: { name: string; description?: string }) {
    return apiClient.post('groups', { json: data }).json();
  },

  async updateGroup(id: string, data: { name?: string; description?: string }) {
    return apiClient.put(`groups/${id}`, { json: data }).json();
  },

  async addGroupMember(groupId: string, userId: string) {
    return apiClient.post(`groups/${groupId}/members`, { json: { user_id: userId } }).json();
  },

  async removeGroupMember(groupId: string, userId: string) {
    return apiClient.delete(`groups/${groupId}/members/${userId}`).json();
  },

  // Media
  async uploadMedia(file: { uri: string; name: string; type: string }) {
    const formData = new FormData();
    formData.append('file', file as any);

    return apiClient
      .post('media/upload', {
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .json<{ url: string; filename: string; content_type: string }>();
  },
};

export default api;
