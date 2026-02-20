import { User, UserProfile, CreateUserDto, UpdateUserDto, UpdateProfileDto, ChangePasswordDto, SearchUsersParams } from '@/types';
import { UserStatus, UserRole } from '@/constants/enums';
import { authUtils } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const userService = {
  // ==================== CRUD ====================

  /**
   * Obtener todos los usuarios
   */
  getAll: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Buscar usuarios con filtros
   * @param params.q - Texto de búsqueda (nombre de usuario)
   * @param params.status - Filtrar por estado (1=NEW, 2=ACTIVE, 3=BLOCKED)
   * @param params.role - Filtrar por rol (0=DRIVER, 1=ADMIN)
   */
  search: async (params: SearchUsersParams): Promise<User[]> => {
    try {
      const queryParams = new URLSearchParams();

      if (params.q) {
        queryParams.append('q', params.q);
      }

      if (params.status !== undefined) {
        queryParams.append('status', params.status.toString());
      }

      if (params.role !== undefined) {
        queryParams.append('role', params.role.toString());
      }

      const url = `${API_BASE_URL}/users/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo usuario
   */
  create: async (data: CreateUserDto): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Obtener un usuario por ID
   */
  getById: async (id: number): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar un usuario
   */
  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un usuario (soft delete - cambia status a DELETED)
   */
  remove: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar contraseña de un usuario
   */
  changePassword: async (id: number, data: ChangePasswordDto): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/change-password`, {
        method: 'PATCH',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error changing password for user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Resetear contraseña de un usuario (pone clave "123" y status NEW)
   */
  resetPassword: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
        method: 'PATCH',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error resetting password for user ${id}:`, error);
      throw error;
    }
  },

  // ==================== PROFILE ====================

  /**
   * Obtener perfil del usuario actual
   */
  getMyProfile: async (): Promise<UserProfile> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my profile:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil del usuario actual (contraseña y/o teléfono)
   */
  updateMyProfile: async (data: UpdateProfileDto): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: 'PATCH',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // ==================== UTILITIES ====================

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin: (user: User): boolean => {
    return user.role === UserRole.ADMIN;
  },

  /**
   * Verifica si el usuario es conductor
   */
  isDriver: (user: User): boolean => {
    return user.role === UserRole.DRIVER;
  },

  /**
   * Verifica si el usuario está activo
   */
  isActive: (user: User): boolean => {
    return user.status === UserStatus.ACTIVE;
  },

  /**
   * Obtiene el nombre para mostrar del usuario
   */
  getDisplayName: (user: User): string => {
    if (user.driver) {
      return `${user.driver.firstName} ${user.driver.lastName}`;
    }
    return user.name;
  },

  /**
   * Obtiene el texto del estado
   */
  getStatusLabel: (status: UserStatus): string => {
    const labels: Record<UserStatus, string> = {
      [UserStatus.DELETED]: 'Eliminado',
      [UserStatus.NEW]: 'Nuevo',
      [UserStatus.ACTIVE]: 'Activo',
      [UserStatus.BLOCKED]: 'Bloqueado',
    };
    return labels[status] ?? 'Desconocido';
  },

  /**
   * Obtiene el texto del rol
   */
  getRoleLabel: (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.DRIVER]: 'Conductor',
      [UserRole.ADMIN]: 'Administrador',
    };
    return labels[role] ?? 'Desconocido';
  },
};