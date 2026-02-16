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
