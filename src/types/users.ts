// ==================== USER TYPES ====================

export interface User {
  id: number;
  companyId: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idCard: string;
  role: 0 | 1; // 0 = driver, 1 = admin
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string | null;
  updatedAt: string;
  // Relación opcional
  company?: Company;
}

// ==================== USER DTOs ====================

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  idCard: string;
  password: string;
  // role NO se incluye - siempre será 0 (driver) por defecto
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  idCard?: string;
  role?: 0 | 1;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// ==================== SEARCH/FILTER PARAMS ====================

export interface SearchUsersParams {
  q?: string; // query text
  status?: 'active' | 'inactive' | 'suspended';
  role?: 0 | 1;
}

// ==================== TYPE HELPERS ====================

export type UserRole = 0 | 1; // 0 = driver, 1 = admin
export type UserStatus = 'active' | 'inactive' | 'suspended';

// Import de Company (para evitar circular dependency)
import type { Company } from './company';