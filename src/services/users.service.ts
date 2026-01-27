import { 
  User, 
  CreateUserDto, 
  UpdateUserDto,
  ChangePasswordDto
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const usersService = {
  // ==================== CRUD DE USUARIOS ====================

  /**
   * Crear un nuevo usuario
   */
  create: async (data: CreateUserDto): Promise<Omit<User, 'password'>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
   * Obtener todos los usuarios
   * @param role - Filtrar por rol (0 = driver, 1 = admin)
   * @param companyId - Filtrar por empresa
   */
  getAll: async (
    role?: 0 | 1,
    companyId?: number
  ): Promise<User[]> => {
    try {
      const params = new URLSearchParams();
      if (role !== undefined) params.append('role', role.toString());
      if (companyId) params.append('companyId', companyId.toString());

      const url = `${API_BASE_URL}/users${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
   * Obtener solo conductores (role = 0)
   */
  getDrivers: async (): Promise<User[]> => {
    return usersService.getAll(0);
  },

  /**
   * Obtener solo administradores (role = 1)
   */
  getAdmins: async (): Promise<User[]> => {
    return usersService.getAll(1);
  },

  /**
   * Obtener usuarios por empresa
   */
  getByCompany: async (companyId: number): Promise<User[]> => {
    return usersService.getAll(undefined, companyId);
  },

  /**
   * Obtener un usuario por ID
   */
  getById: async (id: number): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
   * Obtener perfil del usuario actual (me)
   * Requiere autenticación
   */
  getMyProfile: async (): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Aquí deberías agregar el token de autenticación
          // 'Authorization': `Bearer ${token}`,
        },
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
   * Actualizar un usuario
   */
  update: async (id: number, data: UpdateUserDto): Promise<Omit<User, 'password'>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
   * Buscar usuarios por término de búsqueda
   * Filtra localmente por nombre, apellido o email
   */
  search: async (query: string, role?: 0 | 1): Promise<User[]> => {
    try {
      const users = await usersService.getAll(role);
      const lowercaseQuery = query.toLowerCase();

      return users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(lowercaseQuery) ||
          user.lastName.toLowerCase().includes(lowercaseQuery) ||
          user.email.toLowerCase().includes(lowercaseQuery) ||
          (user.idCard && user.idCard.toLowerCase().includes(lowercaseQuery)) ||
          (user.phone && user.phone.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  /**
   * Buscar solo conductores
   */
  searchDrivers: async (query: string): Promise<User[]> => {
    return usersService.search(query, 0);
  },

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
   * Obtener conductores disponibles (sin asignación activa)
   * Nota: Esto requiere integración con el servicio de vehículos
   */
  getAvailableDrivers: async (): Promise<User[]> => {
    try {
      const drivers = await usersService.getDrivers();
      // Aquí podrías filtrar por conductores que no tienen asignación activa
      // Esto requeriría una llamada al servicio de vehículos
      return drivers.filter(driver => driver.status === 'active');
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw error;
    }
  },

  /**
   * Validar formato de email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validar formato de contraseña (mínimo 6 caracteres)
   */
  isValidPassword: (password: string): boolean => {
    return password.length >= 6 && password.length <= 50;
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

  /**
   * Obtener estadísticas de usuarios
   * Calcula estadísticas localmente a partir de todos los usuarios
   */
  getStats: async (): Promise<{
    total: number;
    drivers: number;
    admins: number;
    active: number;
    inactive: number;
    suspended: number;
  }> => {
    try {
      const users = await usersService.getAll();
      
      return {
        total: users.length,
        drivers: users.filter(u => u.role === 0).length,
        admins: users.filter(u => u.role === 1).length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        suspended: users.filter(u => u.status === 'suspended').length,
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      throw error;
    }
  },
};