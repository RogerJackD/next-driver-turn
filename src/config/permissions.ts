import { UserRole } from '@/constants/enums';

/**
 * Sistema de permisos basado en roles (RBAC)
 *
 * Para agregar un nuevo rol:
 * 1. Agregar el rol en src/constants/enums.ts (UserRole)
 * 2. Definir sus permisos aquí en ROLE_PERMISSIONS
 *
 * Para agregar un nuevo permiso:
 * 1. Agregar la key en Permission type
 * 2. Asignar el permiso a los roles correspondientes en ROLE_PERMISSIONS
 */

// Permisos disponibles en el sistema
export type Permission =
  | 'menu:reportes'
  | 'menu:mis-reportes'
  | 'menu:perfil'
  | 'menu:zonas'
  | 'menu:gestion-zonas'
  | 'menu:conductores'
  | 'menu:vehiculos'
  | 'menu:usuarios'
  | 'page:conductores'
  | 'page:vehiculos'
  | 'page:usuarios'
  | 'page:paraderos'
  | 'page:zonas'
  | 'page:reportes'
  | 'page:mis-reportes';

// Definición de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Conductor (Role 0) - Zonas para estacionarse y sus reportes personales
  [UserRole.DRIVER]: [
    'menu:mis-reportes',
    'menu:perfil',
    'menu:zonas',
    'page:paraderos',
    'page:mis-reportes',
  ],

  // Administrador (Role 1) - Acceso completo de gestión (sin acceso a estacionarse)
  [UserRole.ADMIN]: [
    'menu:reportes',
    'menu:perfil',
    'menu:gestion-zonas',
    'menu:conductores',
    'menu:vehiculos',
    'menu:usuarios',
    'page:conductores',
    'page:vehiculos',
    'page:usuarios',
    'page:zonas',
    'page:reportes',
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Verifica si un rol tiene al menos uno de los permisos especificados
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Verifica si un rol tiene todos los permisos especificados
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Nombre legible de cada rol (para UI)
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.DRIVER]: 'Conductor',
  [UserRole.ADMIN]: 'Administrador',
};
