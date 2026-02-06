export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: number;
    companyId: number;
    status: number; // 0 = DELETED, 1 = NEW, 2 = ACTIVE, 3 = BLOCKED
    driverId: number | null;
  };
  accessToken: string;
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  companyId: number;
  status: number; // 0 = DELETED, 1 = NEW, 2 = ACTIVE, 3 = BLOCKED
  driverId: number | null;
}