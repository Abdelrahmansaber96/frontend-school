import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const SOCKET_EVENTS = {
  MESSAGE_CREATED: 'message.created',
  NOTIFICATION_CREATED: 'notification.created',
  ATTENDANCE_CREATED: 'attendance.created',
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_LEAVE: 'conversation:leave',
  CONVERSATION_READ: 'conversation:read',
  CONVERSATION_UPDATED: 'conversation:updated',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_READ_ALL: 'notification:readAll',
} as const;

interface ConnectSocketOptions {
  forceReconnect?: boolean;
}

const attachSocketEvents = (client: Socket) => {
  client.off('connect');
  client.off('disconnect');
  client.off('connect_error');

  client.on('connect', () => console.log('[Socket] Connected:', client.id));
  client.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));
  client.on('connect_error', (err) => console.error('[Socket] Error:', err.message));
};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 16_000,
      timeout: 10_000,
    });
    attachSocketEvents(socket);
  }
  return socket;
};

export const connectSocket = ({ forceReconnect = false }: ConnectSocketOptions = {}): Socket => {
  if (forceReconnect) {
    disconnectSocket();
  }

  const client = getSocket();
  if (!client.connected) client.connect();
  return client;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { socket };
