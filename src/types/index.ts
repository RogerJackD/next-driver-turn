// User Interface
export interface User {
  id: number;
  companyId: number | null;
  company: null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idCard: string;
  role: number;
  status: string;
  createdAt: string;
  lastLogin: string | null;
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
  status: string;
  createdAt: string;
  updatedAt: string;
  companyId: number | null;
}

// Vehicle Driver Assignment Interface
export interface VehicleDriverAssignment {
  id: number;
  assignmentDate: string;
  unassignmentDate: string | null;
  status: string;
  unassignmentReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: User;
  vehicleId: number;
  vehicle: Vehicle;
}

// Array type for API response
export type VehicleDriverAssignments = VehicleDriverAssignment[];