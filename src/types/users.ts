import type { Company } from './company';
import type { Driver } from './driver';
import { UserStatus, UserRole } from '@/constants/enums';

// ==================== USER ENTITY ====================

export interface User {
  id: number;
  name: string; // Username (puede ser DNI u otro identificador)
  companyId: number;
  company?: Company;
  driverId: number | null;
  driver: Driver | null;
  role: UserRole; // 0 = DRIVER, 1 = ADMIN
  status: UserStatus; // 0 = DELETED, 1 = NEW, 2 = ACTIVE, 3 = BLOCKED
  observation: string | null;
  createdAt: string;
  lastLogin: string | null;
  updatedAt: string;
}

// ==================== USER DTOs ====================

export interface CreateUserDto {
  name: string;
  driverId?: number;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  observation?: string;
  driverId?: number;
}

export interface ChangePasswordDto {
  newPassword: string;
}

export interface UpdateProfileDto {
  newPassword?: string;
  phone?: string;
}

export interface UserProfile extends User {
  isDriver: boolean;
}

// ==================== SEARCH/FILTER PARAMS ====================

export interface SearchUsersParams {
  q?: string;
  status?: UserStatus;
  role?: UserRole;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Obtiene el nombre para mostrar del usuario
 * Si tiene conductor asociado, muestra el nombre del conductor
 * Si no, muestra el username
 */
export function getUserDisplayName(user: User): string {
  if (user.driver) {
    return `${user.driver.firstName} ${user.driver.lastName}`;
  }
  return user.name;
}

/**
 * Obtiene el texto del estado
 */
export function getStatusLabel(status: UserStatus): string {
  const labels: Record<UserStatus, string> = {
    [UserStatus.DELETED]: 'Eliminado',
    [UserStatus.NEW]: 'Nuevo',
    [UserStatus.ACTIVE]: 'Activo',
    [UserStatus.BLOCKED]: 'Bloqueado',
  };
  return labels[status] ?? 'Desconocido';
}

/**
 * Obtiene el texto del rol
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.DRIVER]: 'Conductor',
    [UserRole.ADMIN]: 'Administrador',
  };
  return labels[role] ?? 'Desconocido';
}

/**
 * Verifica si el usuario está activo
 */
export function isUserActive(user: User): boolean {
  return user.status === UserStatus.ACTIVE;
}

/**
 * Verifica si el usuario es administrador
 */
export function isUserAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Verifica si el usuario es conductor
 */
export function isUserDriver(user: User): boolean {
  return user.role === UserRole.DRIVER;
}

// Re-export enums for convenience
export { UserStatus, UserRole } from '@/constants/enums';