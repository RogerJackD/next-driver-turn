import type { Company } from './company';
import { VehicleStopStatus } from '@/constants/enums';

export interface VehicleStop {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  maxCapacity: number | null;
  type: string | null;
  status: VehicleStopStatus;
  companyId: number;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

// ==================== VEHICLE STOP DTOs ====================

export interface CreateVehicleStopDto {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateVehicleStopDto {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// ==================== STOP EXIT REASONS ====================

export interface StopExitReason {
  id: number;
  vehicleStopId: number;
  name: string;
  autoExitHour: string | null;
  sortOrder: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExitReasonDto {
  name: string;
  autoExitHour?: string | null;
  sortOrder?: number;
}

export interface UpdateExitReasonDto {
  name?: string;
  autoExitHour?: string | null;
  sortOrder?: number;
  status?: number;
}

// ==================== STOP EXPULSION REASONS ====================

export interface StopExpulsionReason {
  id: number;
  companyId: number;
  name: string;
  sortOrder: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpulsionReasonDto {
  name: string;
  sortOrder?: number;
}

export interface UpdateExpulsionReasonDto {
  name?: string;
  sortOrder?: number;
  status?: number;
}
