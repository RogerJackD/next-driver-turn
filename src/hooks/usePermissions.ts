'use client';

import { useState, useEffect, useCallback } from 'react';
import { authUtils } from '@/utils/auth';
import { UserRole } from '@/constants/enums';
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  ROLE_LABELS,
} from '@/config/permissions';

interface UsePermissionsReturn {
  role: UserRole | null;
  roleLabel: string | null;
  isLoading: boolean;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  isAdmin: boolean;
  isDriver: boolean;
  permissions: Permission[];
}

export function usePermissions(): UsePermissionsReturn {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authUtils.getUser();
    if (user !== null && user.role !== undefined) {
      setRole(user.role as UserRole);
    }
    setIsLoading(false);
  }, []);

  const can = useCallback(
    (permission: Permission): boolean => {
      if (role === null) return false;
      return hasPermission(role, permission);
    },
    [role]
  );

  const canAny = useCallback(
    (permissions: Permission[]): boolean => {
      if (role === null) return false;
      return hasAnyPermission(role, permissions);
    },
    [role]
  );

  const canAll = useCallback(
    (permissions: Permission[]): boolean => {
      if (role === null) return false;
      return hasAllPermissions(role, permissions);
    },
    [role]
  );

  const isAdmin = role === UserRole.ADMIN;
  const isDriver = role === UserRole.DRIVER;
  const roleLabel = role !== null ? ROLE_LABELS[role] : null;
  const permissions = role !== null ? getRolePermissions(role) : [];

  return {
    role,
    roleLabel,
    isLoading,
    can,
    canAny,
    canAll,
    isAdmin,
    isDriver,
    permissions,
  };
}