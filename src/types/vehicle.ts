// ==================== ENTITIES / INTERFACES ====================

import { User } from ".";

// Company Interface
export interface Company {
  id: number;
  name: string;
  taxId: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}



// Vehicle Interface
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

// Vehicle Driver Assignment Interface
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

// Alias para mejor semántica (compatibilidad con código existente)
export type VehicleDriverAssignment = VehicleDriver;
export type VehicleAssignment = VehicleDriver;

// Array types for API responses (compatibilidad con código existente)
export type VehicleDriverAssignments = VehicleDriver[];

// ==================== DTOs (Data Transfer Objects) ====================

// Create Vehicle DTO
export interface CreateVehicleDto {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  companyId?: number; // Opcional, default 1
}

// Update Vehicle DTO
export interface UpdateVehicleDto {
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  status?: 'active' | 'inactive';
  companyId?: number;
}

// Assign Driver DTO
export interface AssignDriverDto {
  userId: number;
  vehicleId: number;
  assignmentDate: string; // Format: YYYY-MM-DD
  notes?: string;
}

// Unassign Driver DTO
export interface UnassignDriverDto {
  assignmentId: number;
  unassignmentDate: string; // Format: YYYY-MM-DD
  unassignmentReason: string;
  notes?: string;
}

// ==================== API RESPONSES ====================

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

// ==================== ERROR HANDLING ====================

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// ==================== TYPE HELPERS ====================

export type VehicleStatus = 'active' | 'inactive';
export type AssignmentStatus = 'active' | 'inactive';
export type UserRole = 0 | 1; // 0 = driver, 1 = admin
export type UserStatus = 'active' | 'inactive';