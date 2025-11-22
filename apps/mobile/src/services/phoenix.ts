import { type Channel, Presence, Socket } from 'phoenix';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:4000/socket';

type MessageHandler = (payload: unknown) => void;
type PresenceHandler = (presences: PresenceUser[]) => void;
type ConnectionHandler = (state: ConnectionState) => void;

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface PresenceUser {
  id: string;
  online_at: string;
  status?: string;
}

interface PresenceMeta {
  online_at: string;
  status?: string;
  phx_ref?: string;
}

class PhoenixService {
  private socket: Socket | null = null;
  private channels: Map<string, Channel> = new Map();
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private presenceHandlers: PresenceHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private presence: Presence | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private userId: string | null = null;

  connect(token: string, userId?: string): void {
    if (this.socket?.isConnected()) {
      return;
    }

    this.userId = userId || null;
    this.setConnectionState('connecting');

    this.socket = new Socket(WS_URL, {
      params: { token },
      reconnectAfterMs: (tries) => {
        const delays = [1000, 2000, 5000, 10000, 30000];
        return delays[Math.min(tries - 1, delays.length - 1)];
      },
      heartbeatIntervalMs: 30000,
    });

    this.socket.onOpen(() => {
      console.log('Phoenix socket connected');
      this.setConnectionState('connected');

      // Auto-join presence channel when connected
      if (this.userId) {
        this.joinPresenceChannel();
        this.joinUserChannel(this.userId);
      }
    });

    this.socket.onClose(() => {
      console.log('Phoenix socket closed');
      this.setConnectionState('disconnected');
    });

    this.socket.onError((error) => {
      console.error('Phoenix socket error:', error);
      this.setConnectionState('error');
    });

    this.socket.connect();
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.channels.forEach((channel) => {
      channel.leave();
    });
    this.channels.clear();
    this.socket?.disconnect();
    this.socket = null;
    this.presence = null;
    this.setConnectionState('disconnected');
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === 'connected' && this.socket?.isConnected() === true;
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionHandlers.forEach((handler) => {
        handler(state);
      });
    }
  }

  joinUserChannel(userId: string): Channel | null {
    if (!this.socket) return null;

    const channelName = `user:${userId}`;
    const existingChannel = this.channels.get(channelName);
    if (existingChannel) {
      return existingChannel;
    }

    const channel = this.socket.channel(channelName, {});

    channel.on('message:new', (payload) => {
      this.notifyHandlers('message:new', payload);
    });

    channel.on('presence:update', (payload) => {
      this.notifyHandlers('presence:update', payload);
    });

    channel.on('friend:request', (payload) => {
      this.notifyHandlers('friend:request', payload);
    });

    channel
      .join()
      .receive('ok', () => console.log(`Joined ${channelName}`))
      .receive('error', (resp) => console.error(`Failed to join ${channelName}:`, resp));

    this.channels.set(channelName, channel);
    return channel;
  }

  joinChatChannel(chatId: string): Channel | null {
    if (!this.socket) return null;

    const channelName = `chat:${chatId}`;
    const existingChannel = this.channels.get(channelName);
    if (existingChannel) {
      return existingChannel;
    }

    const channel = this.socket.channel(channelName, {});

    channel.on('message:new', (payload) => {
      this.notifyHandlers('message:new', payload);
    });

    channel.on('message:deleted', (payload) => {
      this.notifyHandlers('message:deleted', payload);
    });

    channel.on('message:status', (payload) => {
      this.notifyHandlers('message:status', payload);
    });

    channel.on('typing:update', (payload) => {
      this.notifyHandlers('typing:update', payload);
    });

    channel.on('messages:history', (payload) => {
      this.notifyHandlers('messages:history', payload);
    });

    channel
      .join()
      .receive('ok', () => console.log(`Joined ${channelName}`))
      .receive('error', (resp) => console.error(`Failed to join ${channelName}:`, resp));

    this.channels.set(channelName, channel);
    return channel;
  }

  joinGroupChannel(groupId: string): Channel | null {
    if (!this.socket) return null;

    const channelName = `group:${groupId}`;
    const existingChannel = this.channels.get(channelName);
    if (existingChannel) {
      return existingChannel;
    }

    const channel = this.socket.channel(channelName, {});

    channel.on('message:new', (payload) => {
      this.notifyHandlers('message:new', payload);
    });

    channel.on('typing:update', (payload) => {
      this.notifyHandlers('typing:update', payload);
    });

    channel.on('messages:history', (payload) => {
      this.notifyHandlers('messages:history', payload);
    });

    channel
      .join()
      .receive('ok', () => console.log(`Joined ${channelName}`))
      .receive('error', (resp) => console.error(`Failed to join ${channelName}:`, resp));

    this.channels.set(channelName, channel);
    return channel;
  }

  joinPresenceChannel(): Channel | null {
    if (!this.socket) return null;

    const channelName = 'presence:lobby';
    const existingChannel = this.channels.get(channelName);
    if (existingChannel) {
      return existingChannel;
    }

    const channel = this.socket.channel(channelName, {});
    this.presence = new Presence(channel);

    this.presence.onSync(() => {
      const presences = this.parsePresences();
      this.presenceHandlers.forEach((handler) => {
        handler(presences);
      });
      this.notifyHandlers('presence:sync', presences);
    });

    this.presence.onJoin((id, _current, newPresence) => {
      const user = this.parsePresenceUser(
        id,
        newPresence as { metas?: PresenceMeta[] } | undefined,
      );
      if (user) {
        this.notifyHandlers('presence:join', user);
      }
    });

    this.presence.onLeave((id, _current, _leftPresence) => {
      this.notifyHandlers('presence:leave', { id });
    });

    channel
      .join()
      .receive('ok', () => console.log(`Joined ${channelName}`))
      .receive('error', (resp) => console.error(`Failed to join ${channelName}:`, resp));

    this.channels.set(channelName, channel);
    return channel;
  }

  private parsePresences(): PresenceUser[] {
    if (!this.presence) return [];

    return this.presence.list((id: string, presence: unknown) => {
      const typedPresence = presence as { metas: PresenceMeta[] };
      const meta = typedPresence.metas?.[0] || {};
      return {
        id,
        online_at: meta.online_at || new Date().toISOString(),
        status: meta.status,
      };
    });
  }

  private parsePresenceUser(
    id: string,
    presence: { metas?: PresenceMeta[] } | undefined,
  ): PresenceUser | null {
    if (!presence?.metas?.[0]) return null;
    const meta = presence.metas[0];
    return {
      id,
      online_at: meta.online_at || new Date().toISOString(),
      status: meta.status,
    };
  }

  getOnlineUsers(): PresenceUser[] {
    return this.parsePresences();
  }

  isUserOnline(userId: string): boolean {
    const presences = this.parsePresences();
    return presences.some((p) => p.id === userId);
  }

  leaveChannel(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.leave();
      this.channels.delete(channelName);
    }
  }

  sendMessage(chatId: string, content: string, messageType: string = 'text'): void {
    const channel = this.channels.get(`chat:${chatId}`);
    if (channel) {
      channel.push('message:send', { content, message_type: messageType });
    }
  }

  deleteMessage(chatId: string, messageId: string): void {
    const channel = this.channels.get(`chat:${chatId}`);
    if (channel) {
      channel.push('message:delete', { message_id: messageId });
    }
  }

  sendTypingStart(chatId: string): void {
    const channel = this.channels.get(`chat:${chatId}`);
    if (channel) {
      channel.push('typing:start', {});
    }
  }

  sendTypingStop(chatId: string): void {
    const channel = this.channels.get(`chat:${chatId}`);
    if (channel) {
      channel.push('typing:stop', {});
    }
  }

  updateMessageStatus(chatId: string, messageId: string, status: string): void {
    const channel = this.channels.get(`chat:${chatId}`);
    if (channel) {
      channel.push('message:status', { message_id: messageId, status });
    }
  }

  onMessage(event: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(handler);

    return () => {
      const handlers = this.messageHandlers.get(event) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  onPresence(handler: PresenceHandler): () => void {
    this.presenceHandlers.push(handler);
    return () => {
      const index = this.presenceHandlers.indexOf(handler);
      if (index > -1) {
        this.presenceHandlers.splice(index, 1);
      }
    };
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    // Immediately call with current state
    handler(this.connectionState);

    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  private notifyHandlers(event: string, payload: unknown): void {
    const handlers = this.messageHandlers.get(event) || [];
    handlers.forEach((handler) => {
      handler(payload);
    });
  }
}

export const phoenixService = new PhoenixService();
export default phoenixService;
