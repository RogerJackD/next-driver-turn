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

/**
 * Derive the current user's position from queue vehicle list.
 * This is the RELIABLE way to know if we're in queue — bypasses broken queue:myPosition.
 */
function derivePositionFromQueue(
  queue: StopQueue,
  driverId: number | null,
): MyPositionResponse | null {
  if (driverId == null) return null;

  const myEntry = queue.vehicles.find((v) => v.driver.id === driverId);
  if (myEntry) {
    return {
      inQueue: true,
      queueId: myEntry.queueId,
      position: myEntry.position,
      totalInQueue: queue.totalVehicles,
      entryTime: myEntry.entryTime,
      stop: {
        id: queue.stopId,
        name: queue.stopName,
        address: queue.stopAddress ?? '',
      },
    };
  }
  return null; // Not found in THIS stop — might be in another or not in queue
}

export function useQueueSocket() {
  const socketRef = useRef<Socket | null>(null);
  const subscribedStopRef = useRef<number | null>(null);

  // Get driverId once from auth
  const user = authUtils.getUser();
  const driverIdRef = useRef(user?.driverId ?? null);

  const [isConnected, setIsConnected] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<StopQueue | null>(null);
  const [myPosition, setMyPosition] = useState<MyPositionResponse | null>(null);
  const [positionLoaded, setPositionLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process queue data: update queue list AND derive my position from vehicles
  const processQueueData = useCallback(
    (queue: StopQueue) => {
      setCurrentQueue(queue);

      const derived = derivePositionFromQueue(queue, driverIdRef.current);
      if (derived) {
        // Found myself in queue — update position
        setMyPosition(derived);
        setPositionLoaded(true);
      } else if (subscribedStopRef.current === queue.stopId) {
        // I'm viewing this stop and I'm NOT in its vehicle list.
        // Only set inQueue=false if we haven't found ourselves in another stop.
        // If myPosition already says we're in a DIFFERENT stop, keep it.
        setMyPosition((prev) => {
          if (prev?.inQueue && prev?.stop?.id !== queue.stopId) {
            return prev; // Keep: we're in a different stop
          }
          setPositionLoaded(true);
          return { inQueue: false };
        });
      }
    },
    [],
  );

  // Fallback: ask server for position (broken on some backends, but kept as fallback)
  const refreshMyPosition = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.emit('queue:myPosition', {}, (response: any) => {
      const data = response?.data ?? response;
      if (data && data.inQueue === true) {
        // Only trust the response if it says we ARE in queue
        setMyPosition(data as MyPositionResponse);
        setPositionLoaded(true);
      }
    });
  }, []);

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

    // queue:connected fires AFTER auth is processed
    socket.on('queue:connected', () => {
      setIsConnected(true);
      // Try server-side position check (only trust positive responses)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.emit('queue:myPosition', {}, (response: any) => {
        const data = response?.data ?? response;
        if (data && data.inQueue === true) {
          setMyPosition(data as MyPositionResponse);
        }
        setPositionLoaded(true);
      });
      // Fallback timeout
      setTimeout(() => setPositionLoaded(true), 3000);
    });

    socket.on('queue:error', (data: { message: string }) => {
      setError(data.message);
    });

    // Position events from server — only trust positive (inQueue: true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('queue:position', (raw: any) => {
      const data = raw?.data ?? raw;
      if (data && data.inQueue === true) {
        setMyPosition(data as MyPositionResponse);
        setPositionLoaded(true);
      }
    });

    // --- Queue data events (RELIABLE source of truth) ---
    socket.on('queue:updated', (event: QueueUpdatedEvent) => {
      const queue = extractStopQueue(event);
      const stopId = event?.stopId ?? queue?.stopId;
      if (stopId === subscribedStopRef.current && queue) {
        // processQueueData updates both queue list AND derives my position
        processQueueDataRef.current(queue);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('queue:stopQueue', (raw: any) => {
      const queue = extractStopQueue(raw);
      if (queue && queue.stopId === subscribedStopRef.current) {
        processQueueDataRef.current(queue);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ref to avoid stale closures in socket handlers
  const processQueueDataRef = useRef(processQueueData);
  processQueueDataRef.current = processQueueData;

  // Subscribe to a stop's queue
  const subscribeToStop = useCallback((stopId: number) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (subscribedStopRef.current !== null && subscribedStopRef.current !== stopId) {
      socket.emit('queue:unsubscribe', { stopId: subscribedStopRef.current });
    }

    subscribedStopRef.current = stopId;
    setCurrentQueue(null);

    socket.emit('queue:subscribe', { stopId });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.emit('queue:getByStop', { stopId }, (response: any) => {
      if (response) {
        const queue = extractStopQueue(response);
        if (queue) {
          processQueueDataRef.current(queue);
        }
      }
    });
  }, []);

  // Enter queue — extract position from the rich ACK response
  const enterQueue = useCallback((vehicleStopId: number): Promise<SocketCallbackResponse> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket) {
        resolve({ success: false, message: 'No conectado' });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.emit('queue:enter', { vehicleStopId }, (response: any) => {
        const success = response?.success === true;
        const message = response?.message ?? response?.data?.message ?? '';

        if (success) {
          // Extract accurate position from ACK data
          const entry = response?.data?.currentQueue ?? response?.data;
          const stop = entry?.vehicleStop;
          setMyPosition({
            inQueue: true,
            queueId: entry?.id,
            position: entry?.currentPosition,
            entryTime: entry?.entryTime,
            stop: stop
              ? { id: stop.id, name: stop.name, address: stop.address ?? '' }
              : { id: vehicleStopId, name: '', address: '' },
          });
          setPositionLoaded(true);
          subscribedStopRef.current = vehicleStopId;
          // DON'T call refreshMyPosition — it's broken and overwrites good state
        } else {
          // Auto-correct: if backend says "already in queue"
          // Be specific to avoid false positives (e.g. "no puedes entrar a la cola sin vehículo")
          const msg = (typeof message === 'string' ? message : '').toLowerCase();
          const isAlreadyInQueue =
            msg.includes('ya te encuentras') ||
            msg.includes('already in') ||
            msg.includes('ya estás en la cola') ||
            msg.includes('ya se encuentra en');
          if (isAlreadyInQueue) {
            setMyPosition({
              inQueue: true,
              stop: { id: vehicleStopId, name: '', address: '' },
            });
            setPositionLoaded(true);
          }
        }
        resolve({ success, message });
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.emit('queue:exit', { exitReason, observations }, (response: any) => {
        const success = response?.success === true;
        const message = response?.message ?? '';
        if (success) {
          setMyPosition({ inQueue: false });
          setPositionLoaded(true);

          // Backend auto-unsubscribes from room after exit,
          // but user is still viewing this stop — re-subscribe to keep getting updates
          const viewingStop = subscribedStopRef.current;
          if (viewingStop != null) {
            socket.emit('queue:subscribe', { stopId: viewingStop });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socket.emit('queue:getByStop', { stopId: viewingStop }, (resp: any) => {
              if (resp) {
                const queue = extractStopQueue(resp);
                if (queue) {
                  processQueueDataRef.current(queue);
                }
              }
            });
          }
        }
        resolve({ success, message });
      });
    });
  }, []);

  // Change stop (atomic)
  const changeStop = useCallback((newVehicleStopId: number, observations?: string): Promise<SocketCallbackResponse> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket) {
        resolve({ success: false, message: 'No conectado' });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.emit('queue:changeStop', { newVehicleStopId, observations }, (response: any) => {
        const success = response?.success === true;
        const message = response?.message ?? '';
        if (success) {
          const entry = response?.data?.currentQueue ?? response?.data;
          const stop = entry?.vehicleStop;
          setMyPosition({
            inQueue: true,
            queueId: entry?.id,
            position: entry?.currentPosition,
            entryTime: entry?.entryTime,
            stop: stop
              ? { id: stop.id, name: stop.name, address: stop.address ?? '' }
              : { id: newVehicleStopId, name: '', address: '' },
          });
          setPositionLoaded(true);

          // Re-subscribe to the stop we're currently viewing
          // (backend auto-subscribes to new stop but may have unsubscribed from what we're viewing)
          const viewingStop = subscribedStopRef.current;
          if (viewingStop != null) {
            socket.emit('queue:subscribe', { stopId: viewingStop });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socket.emit('queue:getByStop', { stopId: viewingStop }, (resp: any) => {
              if (resp) {
                const queue = extractStopQueue(resp);
                if (queue) {
                  processQueueDataRef.current(queue);
                }
              }
            });
          }
        }
        resolve({ success, message });
      });
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
