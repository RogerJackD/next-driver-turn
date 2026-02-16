// ==================== QUEUE TYPES ====================

export interface QueueDriver {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface QueueVehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  internalNumber: string;
}

export interface QueueEntry {
  queueId: number;
  position: number;
  waitTime: number;
  entryTime: string;
  driver: QueueDriver;
  vehicle: QueueVehicle;
}

export interface StopQueue {
  stopId: number;
  stopName: string;
  stopAddress: string;
  maxCapacity: number;
  totalVehicles: number;
  vehicles: QueueEntry[];
}

export interface QueueUpdatedEvent {
  success: boolean;
  stopId: number;
  data: StopQueue;
  timestamp: string;
}

export interface MyPositionResponse {
  inQueue: boolean;
  queueId?: number;
  position?: number;
  totalInQueue?: number;
  entryTime?: string;
  stop?: {
    id: number;
    name: string;
    address: string;
  };
  message?: string;
}

export type ExitReason = 'service_taken' | 'service_express' | 'change_stop' | 'emergency' | 'shift_end';

export interface SocketCallbackResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
