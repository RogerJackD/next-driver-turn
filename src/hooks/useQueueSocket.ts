'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { authUtils } from '@/utils/auth';
import type {
  StopQueue,
  QueueUpdatedEvent,
  MyPositionResponse,
  ExitReason,
  SocketCallbackResponse,
} from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractStopQueue(raw: any): StopQueue | null {
  const data = raw?.data ?? raw;
  if (data && typeof data.stopId === 'number' && Array.isArray(data.vehicles)) {
    return data as StopQueue;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMyPosition(raw: any): MyPositionResponse {
  // Could be { success, data: { inQueue, ... } } or { inQueue, ... } directly
  const data = raw?.data ?? raw;
  if (data && typeof data.inQueue === 'boolean') {
    return data as MyPositionResponse;
  }
  return { inQueue: false };
}

export function useQueueSocket() {
  const socketRef = useRef<Socket | null>(null);
  const subscribedStopRef = useRef<number | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<StopQueue | null>(null);
  const [myPosition, setMyPosition] = useState<MyPositionResponse | null>(null);
  const [positionLoaded, setPositionLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect on mount
  useEffect(() => {
    const token = authUtils.getToken();
    if (!token || !SOCKET_URL) return;

    const socket = io(`${SOCKET_URL}/queue`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('queue:connected', () => {
      setIsConnected(true);
    });

    socket.on('queue:error', (data: { message: string }) => {
      setError(data.message);
    });

    // Real-time queue updates (when subscribed to a stop)
    socket.on('queue:updated', (event: QueueUpdatedEvent) => {
      const queue = extractStopQueue(event);
      const stopId = event?.stopId ?? queue?.stopId;
      if (stopId === subscribedStopRef.current && queue) {
        setCurrentQueue(queue);
      }
    });

    // Response to queue:getByStop (server may respond via event instead of callback)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('queue:stopQueue', (raw: any) => {
      const queue = extractStopQueue(raw);
      if (queue && queue.stopId === subscribedStopRef.current) {
        setCurrentQueue(queue);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Subscribe to a stop's queue
  const subscribeToStop = useCallback((stopId: number) => {
    const socket = socketRef.current;
    if (!socket) return;

    // Unsubscribe from previous
    if (subscribedStopRef.current !== null && subscribedStopRef.current !== stopId) {
      socket.emit('queue:unsubscribe', { stopId: subscribedStopRef.current });
    }

    subscribedStopRef.current = stopId;
    setCurrentQueue(null);

    // Subscribe to new stop
    socket.emit('queue:subscribe', { stopId });

    // Fetch current queue - try callback, server may also respond via queue:stopQueue event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.emit('queue:getByStop', { stopId }, (response: any) => {
      if (response) {
        const queue = extractStopQueue(response);
        if (queue) {
          setCurrentQueue(queue);
        }
      }
    });
  }, []);

  // Enter queue
  const enterQueue = useCallback((vehicleStopId: number): Promise<SocketCallbackResponse> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket) {
        resolve({ success: false, message: 'No conectado' });
        return;
      }

      socket.emit('queue:enter', { vehicleStopId }, (response: SocketCallbackResponse) => {
        if (response.success) {
          refreshMyPosition();
        }
        resolve(response);
      });
    });
  }, []);

  // Exit queue
  const exitQueue = useCallback((exitReason: ExitReason, observations?: string): Promise<SocketCallbackResponse> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket) {
        resolve({ success: false, message: 'No conectado' });
        return;
      }

      socket.emit('queue:exit', { exitReason, observations }, (response: SocketCallbackResponse) => {
        if (response.success) {
          refreshMyPosition();
        }
        resolve(response);
      });
    });
  }, []);

  // Change stop (atomic: exit current + enter new)
  const changeStop = useCallback((newVehicleStopId: number, observations?: string): Promise<SocketCallbackResponse> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket) {
        resolve({ success: false, message: 'No conectado' });
        return;
      }

      socket.emit('queue:changeStop', { newVehicleStopId, observations }, (response: SocketCallbackResponse) => {
        if (response.success) {
          refreshMyPosition();
        }
        resolve(response);
      });
    });
  }, []);

  // Get my position
  const refreshMyPosition = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.emit('queue:myPosition', {}, (response: any) => {
      setMyPosition(extractMyPosition(response));
      setPositionLoaded(true);
    });
  }, []);

  return {
    isConnected,
    currentQueue,
    myPosition,
    positionLoaded,
    error,
    subscribeToStop,
    enterQueue,
    exitQueue,
    changeStop,
    refreshMyPosition,
  };
}
