// ==================== VEHICLE TYPES ====================

export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  internalNumber: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  companyId: number | null;
  // Relaciones opcionales (cuando el backend las incluye)
  company?: Company;
  vehicleDrivers?: VehicleDriver[];
}

export interface VehicleDriver {
  id: number;
  assignmentDate: string;
  unassignmentDate: string | null;
  status: 'active' | 'inactive';
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
  color: string;
  companyId?: number; // Opcional, default 1
}

export interface UpdateVehicleDto {
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  status?: 'active' | 'inactive';
  companyId?: number;
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

// ==================== TYPE HELPERS ====================

export type VehicleStatus = 'active' | 'inactive';
export type AssignmentStatus = 'active' | 'inactive';

// Import de User (para evitar circular dependency)
import type { User } from './users';
import type { Company } from './company';