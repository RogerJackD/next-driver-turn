import { VehicleStatus, VehicleDriverStatus } from '@/constants/enums';
import type { User } from './users';
import type { Company } from './company';

// ==================== VEHICLE TYPES ====================

export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  internalNumber: string;
  status: VehicleStatus; // 0 = INACTIVE, 1 = ACTIVE
  createdAt: string;
  updatedAt: string;
  companyId: number | null;
  // Relaciones opcionales (cuando el backend las incluye)
  company?: Company;
  vehicleDrivers?: VehicleDriverRelation[];
}

export interface VehicleDriverRelation {
  id: number;
  assignmentDate: string;
  unassignmentDate: string | null;
  status: VehicleDriverStatus; // 0 = INACTIVE, 1 = ACTIVE
  unassignmentReason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  vehicleId: number;
  driverId: number;
  // Relación con conductor
  driver?: AssignedDriver;
}

export interface AssignedDriver {
  id: number;
  idCard: string;
  firstName: string;
  lastName: string;
  phone: string;
  observation: string | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

// Legacy interface for backwards compatibility
export interface VehicleDriver {
  id: number;
  assignmentDate: string;
  unassignmentDate: string | null;
  status: VehicleDriverStatus;
  unassignmentReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  vehicleId: number;
  // Relaciones opcionales
  user?: User;
  vehicle?: Vehicle;
}

// Alias para mejor semántica
export type VehicleAssignment = VehicleDriver;
export type VehicleDriverAssignment = VehicleDriver;
export type VehicleDriverAssignments = VehicleDriver[];

// ==================== VEHICLE DTOs ====================

export interface CreateVehicleDto {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  internalNumber?: string;
  driverIds?: number[]; // Array de IDs de conductores (el último es el activo)
}

export interface UpdateVehicleDto {
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  driverIds?: number[]; // Array de IDs de conductores (el último es el activo)
}

export interface AssignDriverDto {
  userId: number;
  vehicleId: number;
  assignmentDate: string; // Format: YYYY-MM-DD
  notes?: string;
}

export interface UnassignDriverDto {
  assignmentId: number;
  unassignmentDate: string; // Format: YYYY-MM-DD
  unassignmentReason: string;
  notes?: string;
}

// ==================== VEHICLE RESPONSES ====================

export interface VehicleResponse {
  message: string;
  vehicle: Vehicle;
}

export interface AssignmentResponse {
  message: string;
  assignment: VehicleDriver;
}

export interface VehicleStats {
  total: number;
  active: number;
  inactive: number;
  withDriver: number;
  available: number;
}

// Re-export enums for convenience
export { VehicleStatus, VehicleDriverStatus } from '@/constants/enums';
