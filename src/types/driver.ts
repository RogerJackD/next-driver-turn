import type { Company } from './company';

// ==================== DRIVER ENTITY ====================

export interface Driver {
  id: number;
  idCard: string;
  firstName: string;
  lastName: string;
  phone: string;
  observation: string | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  user?: DriverUser | null;
  vehicleDrivers: VehicleDriver[];
}

export interface DriverUser {
  id: number;
  name: string;
  companyId: number;
  driverId: number;
  role: number; // 0 = DRIVER
  status: number; // 0 = DELETED, 1 = NEW, 2 = ACTIVE, 3 = BLOCKED
}

export interface VehicleDriver {
  id: number;
  vehicleId: number;
  driverId: number;
  assignmentDate: string;
  unassignmentDate: string | null;
  status: number; // 0 = Inactivo, 1 = Activo
  unassignmentReason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    internalNumber: string;
    status: number;
    companyId: number;
  };
}

// ==================== DRIVER DTOs ====================

export interface CreateDriverDto {
  idCard: string;
  firstName: string;
  lastName: string;
  phone: string;
  observation?: string;
  createUser?: boolean;
}

export interface CreateDriverResponse extends Driver {
  user?: DriverUser | null;
}

export interface UpdateDriverDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  observation?: string;
}

// ==================== EXTERNAL SERVICE: PERSON BY DNI ====================

export interface PersonByDniResponse {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
}

export interface PersonByDniError {
  message: string[];
  error: string;
  statusCode: number;
}
