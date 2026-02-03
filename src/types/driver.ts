import type { Company } from './company';

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
  user: unknown | null;
  vehicleDrivers: VehicleDriver[];
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
