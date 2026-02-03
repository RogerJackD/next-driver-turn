import { User, CreateUserWithRoleDto, UpdateUserDto, SearchUsersParams } from '@/types';
import { authUtils } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ==================== MOCK DATA ====================
// TODO: Reemplazar con llamadas reales al API cuando estén disponibles
const mockUsers: User[] = [
  {
    id: 1,
    companyId: 1,
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos.mendoza@example.com',
    phone: '951234567',
    idCard: '12345678',
    role: 1,
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-20T08:30:00Z',
  },
  {
    id: 2,
    companyId: 1,
    firstName: 'María',
    lastName: 'García',
    email: 'maria.garcia@example.com',
    phone: '952345678',
    idCard: '23456789',
    role: 0,
    status: 'active',
    createdAt: '2024-01-16T11:00:00Z',
    lastLogin: '2024-01-21T09:00:00Z',
    updatedAt: '2024-01-21T09:00:00Z',
  },
  {
    id: 3,
    companyId: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '953456789',
    idCard: '34567890',
    role: 0,
    status: 'inactive',
    createdAt: '2024-01-17T12:00:00Z',
    lastLogin: null,
    updatedAt: '2024-01-22T10:00:00Z',
  },
  {
    id: 4,
    companyId: 1,
    firstName: 'Ana',
    lastName: 'Torres',
    email: 'ana.torres@example.com',
    phone: '954567890',
    idCard: '45678901',
    role: 1,
    status: 'active',
    createdAt: '2024-01-18T13:00:00Z',
    lastLogin: '2024-01-23T11:00:00Z',
    updatedAt: '2024-01-23T11:00:00Z',
  },
];

// ==================== SERVICE ====================
export const userAdminService = {
  /**
   * Crear un nuevo usuario (conductor o admin)
   * Este endpoint está disponible: POST /v1/api/users
   */
  create: async (data: CreateUserWithRoleDto): Promise<Omit<User, 'password'>> => {
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
   * Obtener todos los usuarios (conductores y admins)
   * TODO: Reemplazar con endpoint real cuando esté disponible
   */
  getAll: async (): Promise<User[]> => {
    // TODO: Descomentar cuando el endpoint esté disponible
    // try {
    //   const response = await fetch(`${API_BASE_URL}/users/all`, {
    //     method: 'GET',
    //     headers: authUtils.getAuthHeaders(),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error: ${response.status}`);
    //   }
    //   return await response.json();
    // } catch (error) {
    //   console.error('Error fetching all users:', error);
    //   throw error;
    // }

    // Mock: Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockUsers];
  },

  /**
   * Buscar usuarios con filtros
   * TODO: Reemplazar con endpoint real cuando esté disponible
   */
  search: async (params: SearchUsersParams): Promise<User[]> => {
    // TODO: Descomentar cuando el endpoint esté disponible
    // try {
    //   const queryParams = new URLSearchParams();
    //   if (params.q) queryParams.append('q', params.q);
    //   if (params.status) queryParams.append('status', params.status);
    //   if (params.role !== undefined) queryParams.append('role', params.role.toString());
    //   const url = `${API_BASE_URL}/users/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    //   const response = await fetch(url, {
    //     method: 'GET',
    //     headers: authUtils.getAuthHeaders(),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error: ${response.status}`);
    //   }
    //   return await response.json();
    // } catch (error) {
    //   console.error('Error searching users:', error);
    //   throw error;
    // }

    // Mock: Filtrar localmente
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockUsers];

    if (params.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.idCard.includes(query) ||
        user.phone?.includes(query)
      );
    }

    if (params.status) {
      filtered = filtered.filter(user => user.status === params.status);
    }

    if (params.role !== undefined) {
      filtered = filtered.filter(user => user.role === params.role);
    }

    return filtered;
  },

  /**
   * Obtener usuarios activos
   * TODO: Reemplazar con endpoint real cuando esté disponible
   */
  getActive: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.filter(user => user.status === 'active');
  },

  /**
   * Obtener usuarios inactivos
   * TODO: Reemplazar con endpoint real cuando esté disponible
   */
  getInactive: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.filter(user => user.status === 'inactive');
  },

  /**
   * Obtener un usuario por ID
   * TODO: Reemplazar con endpoint real cuando esté disponible
   */
  getById: async (id: number): Promise<User> => {
    // TODO: Descomentar cuando el endpoint esté disponible
    // try {
    //   const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    //     method: 'GET',
    //     headers: authUtils.getAuthHeaders(),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error: ${response.status}`);
    //   }
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error fetching user ${id}:`, error);
    //   throw error;
    // }

    await new Promise(resolve => setTimeout(resolve, 300));
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  },

  /**
   * Actualizar un usuario
   * TODO: Reemplazar con endpoint real cuando esté disponible
   */
  update: async (id: number, data: UpdateUserDto): Promise<Omit<User, 'password'>> => {
    // TODO: Descomentar cuando el endpoint esté disponible
    // try {
    //   const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    //     method: 'PATCH',
    //     headers: authUtils.getAuthHeaders(),
    //     body: JSON.stringify(data),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error: ${response.status}`);
    //   }
    //   return await response.json();
    // } catch (error) {
    //   console.error(`Error updating user ${id}:`, error);
    //   throw error;
    // }

    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Convertir status numérico a string si es necesario
    const statusMap: Record<number, 'active' | 'inactive' | 'suspended'> = {
      0: 'inactive',
      1: 'inactive',
      2: 'active',
      3: 'suspended',
    };

    // Construir updateData excluyendo status primero
    const { status, ...restData } = data;
    const updateData: Partial<User> = { ...restData };

    // Manejar la conversión de status
    if (typeof status === 'number') {
      updateData.status = statusMap[status] || 'inactive';
    } else if (typeof status === 'string') {
      updateData.status = status as 'active' | 'inactive' | 'suspended';
    }

    mockUsers[index] = {
      ...mockUsers[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return mockUsers[index];
  },

  /**
   * Eliminar un usuario
   * TODO: Reemplazar con endpoint real cuando esté disponible
   */
  remove: async (id: number): Promise<void> => {
    // TODO: Descomentar cuando el endpoint esté disponible
    // try {
    //   const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    //     method: 'DELETE',
    //     headers: authUtils.getAuthHeaders(),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`Error: ${response.status}`);
    //   }
    // } catch (error) {
    //   console.error(`Error deleting user ${id}:`, error);
    //   throw error;
    // }

    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }
    mockUsers.splice(index, 1);
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
