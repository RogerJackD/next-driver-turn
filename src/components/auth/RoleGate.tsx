'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/config/permissions';
import { UserRole } from '@/constants/enums';

interface RoleGateProps {
  children: ReactNode;
  /** Permiso requerido para mostrar el contenido */
  permission?: Permission;
  /** Lista de permisos (muestra si tiene al menos uno) */
  anyPermission?: Permission[];
  /** Lista de permisos (muestra si tiene todos) */
  allPermissions?: Permission[];
  /** Roles permitidos directamente */
  allowedRoles?: UserRole[];
  /** Contenido alternativo si no tiene permiso */
  fallback?: ReactNode;
}

/**
 * Componente para renderizado condicional basado en permisos/roles
 *
 * @example
 * ```tsx
 * // Por permiso específico
 * <RoleGate permission="menu:vehiculos">
 *   <VehiculosLink />
 * </RoleGate>
 *
 * // Por rol directo
 * <RoleGate allowedRoles={[UserRole.ADMIN]}>
 *   <AdminPanel />
 * </RoleGate>
 *
 * // Con fallback
 * <RoleGate permission="page:usuarios" fallback={<AccessDenied />}>
 *   <UsersPage />
 * </RoleGate>
 * ```
 */
export function RoleGate({
  children,
  permission,
  anyPermission,
  allPermissions,
  allowedRoles,
  fallback = null,
}: RoleGateProps) {
  const { can, canAny, canAll, role, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  let hasAccess = false;

  // Verificar por rol directo
  if (allowedRoles && role !== null) {
    hasAccess = allowedRoles.includes(role);
  }
  // Verificar por permiso único
  else if (permission) {
    hasAccess = can(permission);
  }
  // Verificar si tiene al menos uno de los permisos
  else if (anyPermission) {
    hasAccess = canAny(anyPermission);
  }
  // Verificar si tiene todos los permisos
  else if (allPermissions) {
    hasAccess = canAll(allPermissions);
  }
  // Si no se especifica ningún criterio, no mostrar nada
  else {
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}