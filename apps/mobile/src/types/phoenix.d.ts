declare module 'phoenix' {
  export interface SocketOptions {
    params?: Record<string, unknown> | (() => Record<string, unknown>);
    transport?: WebSocket;
    timeout?: number;
    heartbeatIntervalMs?: number;
    reconnectAfterMs?: (tries: number) => number;
    rejoinAfterMs?: (tries: number) => number;
    longpollerTimeout?: number;
    encode?: (payload: unknown, callback: (encoded: string) => void) => void;
    decode?: (payload: string, callback: (decoded: unknown) => void) => void;
    logger?: (kind: string, msg: string, data?: unknown) => void;
    binaryType?: 'arraybuffer' | 'blob';
    vsn?: string;
  }

  export interface PushResponse {
    status: string;
    response: unknown;
  }

  export class Push {
    receive(status: string, callback: (response: unknown) => void): this;
  }

  export class Channel {
    join(timeout?: number): Push;
    leave(timeout?: number): Push;
    on(event: string, callback: (payload: unknown) => void): number;
    off(event: string, ref?: number): void;
    push(event: string, payload: Record<string, unknown>, timeout?: number): Push;
    onClose(callback: () => void): void;
    onError(callback: (reason?: unknown) => void): void;
  }

  export class Socket {
    constructor(endPoint: string, opts?: SocketOptions);
    connect(): void;
    disconnect(callback?: () => void, code?: number, reason?: string): void;
    channel(topic: string, params?: Record<string, unknown>): Channel;
    onOpen(callback: () => void): void;
    onClose(callback: () => void): void;
    onError(callback: (error: unknown) => void): void;
    onMessage(callback: (message: unknown) => void): void;
    isConnected(): boolean;
  }

  export interface PresenceState {
    [key: string]: {
      metas: Array<Record<string, unknown>>;
    };
  }

  export type PresenceOnJoinCallback = (
    key: string,
    currentPresence: unknown | undefined,
    newPresence: unknown,
  ) => void;

  export type PresenceOnLeaveCallback = (
    key: string,
    currentPresence: unknown,
    leftPresence: unknown,
  ) => void;

  export class Presence {
    constructor(channel: Channel);
    onJoin(callback: PresenceOnJoinCallback): void;
    onLeave(callback: PresenceOnLeaveCallback): void;
    onSync(callback: () => void): void;
    list<T = unknown>(by?: (key: string, presence: unknown) => T): T[];
    inPendingSyncState(): boolean;
  }
}
