import { User, CreateUserDto, UpdateUserDto, ChangePasswordDto, SearchUsersParams } from '@/types';
import { authUtils } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const userService = {

  /**
   * Crear un nuevo usuario (solo conductores - role 0)
   * El admin está autenticado y su companyId se toma del JWT en el backend
   */
  create: async (data: CreateUserDto): Promise<Omit<User, 'password'>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: authUtils.getAuthHeaders(),
        body: JSON.stringify({
          ...data,
          role: 0, // Siempre crear como conductor
        }),
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
   * Obtener todos los usuarios conductores de la empresa del admin autenticado
   */
    getDrivers: async (): Promise<User[]> => {
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
        console.error('Error fetching drivers:', error);
        throw error;
      }
    },

  /**
   * Buscar usuarios con filtros avanzados
   */
  search: async (params: SearchUsersParams): Promise<User[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.append('q', params.q);
      if (params.status) queryParams.append('status', params.status);
      if (params.role !== undefined) queryParams.append('role', params.role.toString());

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
   * Obtener usuarios activos de la empresa
   */
  getActive: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/active`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  },

  /**
   * Obtener usuarios inactivos de la empresa
   */
  getInactive: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/inactive`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching inactive users:', error);
      throw error;
    }
  },

  /**
   * Obtener perfil del usuario actual (me)
   */
  getMyProfile: async (): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
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
 * Actualizar un conductor
 */
  update: async (id: number, data: UpdateUserDto): Promise<Omit<User, 'password'>> => {
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
   * Cambiar contraseña de un usuario
   */
  changePassword: async (
    id: number,
    data: ChangePasswordDto
  ): Promise<{ message: string }> => {
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
   * Eliminar un usuario
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

  // ==================== UTILIDADES ====================

  /**
   * Obtener nombre completo del usuario
   */
  getFullName: (user: User): string => {
    return `${user.firstName} ${user.lastName}`;
  },

  /**
   * Verificar si un usuario es conductor
   */
  isDriver: (user: User): boolean => {
    return user.role === 0;
  },

  /**
   * Verificar si un usuario es administrador
   */
  isAdmin: (user: User): boolean => {
    return user.role === 1;
  },

  /**
   * Verificar si un usuario está activo
   */
  isActive: (user: User): boolean => {
    return user.status === 'active';
  },

  /**
   * Obtener el nombre del rol
   */
  getRoleName: (role: 0 | 1): string => {
    return role === 0 ? 'Conductor' : 'Administrador';
  },

  /**
   * Obtener el nombre del estado
   */
  getStatusName: (status: string): string => {
    const statusNames: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
    };
    return statusNames[status] || status;
  },
};