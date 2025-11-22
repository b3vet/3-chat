import { Socket, Channel, Presence } from 'phoenix';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:4000/socket';

type MessageHandler = (payload: any) => void;
type PresenceHandler = (presences: any) => void;

class PhoenixService {
  private socket: Socket | null = null;
  private channels: Map<string, Channel> = new Map();
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private presenceHandlers: PresenceHandler[] = [];
  private presence: Presence | null = null;

  connect(token: string): void {
    if (this.socket?.isConnected()) {
      return;
    }

    this.socket = new Socket(WS_URL, {
      params: { token },
      reconnectAfterMs: (tries) => [1000, 2000, 5000, 10000][tries - 1] || 10000,
    });

    this.socket.onOpen(() => {
      console.log('Phoenix socket connected');
    });

    this.socket.onClose(() => {
      console.log('Phoenix socket closed');
    });

    this.socket.onError((error) => {
      console.error('Phoenix socket error:', error);
    });

    this.socket.connect();
  }

  disconnect(): void {
    this.channels.forEach((channel) => channel.leave());
    this.channels.clear();
    this.socket?.disconnect();
    this.socket = null;
  }

  joinUserChannel(userId: string): Channel | null {
    if (!this.socket) return null;

    const channelName = `user:${userId}`;
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = this.socket.channel(channelName, {});

    channel.on('message:new', (payload) => {
      this.notifyHandlers('message:new', payload);
    });

    channel.on('presence:update', (payload) => {
      this.notifyHandlers('presence:update', payload);
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
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
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
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
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
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = this.socket.channel(channelName, {});
    this.presence = new Presence(channel);

    this.presence.onSync(() => {
      const presences = this.presence?.list() || [];
      this.presenceHandlers.forEach((handler) => handler(presences));
    });

    channel
      .join()
      .receive('ok', () => console.log(`Joined ${channelName}`))
      .receive('error', (resp) => console.error(`Failed to join ${channelName}:`, resp));

    this.channels.set(channelName, channel);
    return channel;
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
    this.messageHandlers.get(event)!.push(handler);

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

  private notifyHandlers(event: string, payload: any): void {
    const handlers = this.messageHandlers.get(event) || [];
    handlers.forEach((handler) => handler(payload));
  }
}

export const phoenixService = new PhoenixService();
export default phoenixService;
