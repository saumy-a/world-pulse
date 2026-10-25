import { io, Socket } from 'socket.io-client';
import type { WorldEvent } from '../types';
import { useEventStore } from '../store/useEventStore';

let socket: Socket | null = null;

export function initSocketConnection(apiUrl = 'http://localhost:4000') {
  if (socket) return socket;

  socket = io(apiUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 5000,
  });

  socket.on('connect', () => {
    useEventStore.getState().setIsConnected(true);
  });

  socket.on('disconnect', () => {
    useEventStore.getState().setIsConnected(false);
  });

  socket.on('connect_error', () => {
    useEventStore.getState().setIsConnected(false);
  });

  socket.on('event:new', (event: WorldEvent) => {
    useEventStore.getState().addEvent(event);
  });

  socket.on('events:stream', (events: WorldEvent[]) => {
    useEventStore.getState().addEvents(events);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    useEventStore.getState().setIsConnected(false);
  }
}
