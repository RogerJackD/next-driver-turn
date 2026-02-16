import {
  Vehicle,
  VehicleAssignment,
  CreateVehicleDto,
  UpdateVehicleDto,
  AssignDriverDto,
  UnassignDriverDto,
  VehicleDriverRelation,
} from '@/types';
import { VehicleStatus, VehicleDriverStatus } from '@/constants/enums';
import { authUtils } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const vehiclesService = {
  // ==================== CRUD DE VEHÍCULOS ====================

  /**
   * Crear un nuevo vehículo
   */
  create: async (data: CreateVehicleDto): Promise<Vehicle> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
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
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los vehículos (automáticamente filtrados por companyId en backend)
   * @param status - Filtrar por estado (active/inactive)
   */
  getAll: async (status?: string): Promise<Vehicle[]> => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const url = `${API_BASE_URL}/vehicles${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  /**
   * Búsqueda avanzada de vehículos
   * @param query - Término de búsqueda
   * @param status - Filtrar por estado
   */
  search: async (query?: string, status?: string): Promise<Vehicle[]> => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (status) params.append('status', status);

      const url = `${API_BASE_URL}/vehicles/search${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  },

  /**
   * Obtener vehículos activos
   */
  getActive: async (): Promise<Vehicle[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/active`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching active vehicles:', error);
      throw error;
    }
  },

  /**
   * Obtener vehículos inactivos
   */
  getInactive: async (): Promise<Vehicle[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/inactive`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching inactive vehicles:', error);
      throw error;
    }
  },

  /**
   * Obtener vehículos disponibles (sin conductor asignado)
   */
  getAvailable: async (): Promise<Vehicle[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/available`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      throw error;
    }
  },

  /**
   * Obtener un vehículo por ID
   */
  getById: async (id: number): Promise<Vehicle> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching vehicle ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar un vehículo
   */
  update: async (id: number, data: UpdateVehicleDto): Promise<Vehicle> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
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
      console.error(`Error updating vehicle ${id}:`, error);
      throw error;
    }
  },

  /**
   * Desactivar un vehículo (status = INACTIVE)
   */
  remove: async (id: number): Promise<{ message: string; vehicle: Vehicle }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error removing vehicle ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar permanentemente un vehículo (status = DELETED)
   */
  deletePermanent: async (id: number): Promise<{ message: string; vehicle: Vehicle }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}/permanent`, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error permanently deleting vehicle ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reactivar un vehículo
   */
  reactivate: async (id: number): Promise<{ message: string; vehicle: Vehicle }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}/reactivate`, {
        method: 'PATCH',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error reactivating vehicle ${id}:`, error);
      throw error;
    }
  },

  // ==================== CONSULTAS ESPECIALIZADAS ====================

  /**
   * Obtener conductor actual de un vehículo
   */
  getCurrentDriver: async (vehicleId: number): Promise<VehicleAssignment> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}/current-driver`,
        {
          method: 'GET',
          headers: authUtils.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching current driver for vehicle ${vehicleId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener historial de asignaciones de un vehículo
   */
  getAssignmentHistory: async (vehicleId: number): Promise<VehicleDriverRelation[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}/assignment-history`,
        {
          method: 'GET',
          headers: authUtils.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching assignment history for vehicle ${vehicleId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener asignación activa de un vehículo
   */
  getActiveAssignment: async (
    vehicleId: number
  ): Promise<VehicleAssignment | { message: string; assignment: null }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}/active-assignment`,
        {
          method: 'GET',
          headers: authUtils.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching active assignment for vehicle ${vehicleId}:`, error);
      throw error;
    }
  },

  // ==================== GESTIÓN DE ASIGNACIONES ====================

  /**
   * Asignar conductor a vehículo
   */
  assignDriver: async (data: AssignDriverDto): Promise<VehicleAssignment> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/assignments`, {
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
      console.error('Error assigning driver:', error);
      throw error;
    }
  },

  /**
   * Desasignar conductor de vehículo
   */
  unassignDriver: async (
    data: UnassignDriverDto
  ): Promise<{ message: string; assignment: VehicleAssignment }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/assignments/unassign`, {
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
      console.error('Error unassigning driver:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las asignaciones
   * @param status - Filtrar por estado (active/inactive)
   * @param vehicleId - Filtrar por vehículo
   * @param userId - Filtrar por conductor
   */
  getAllAssignments: async (
    status?: string,
    vehicleId?: number,
    userId?: number
  ): Promise<VehicleAssignment[]> => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (vehicleId) params.append('vehicleId', vehicleId.toString());
      if (userId) params.append('userId', userId.toString());

      const url = `${API_BASE_URL}/vehicles/assignments/all${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de asignaciones de un conductor
   */
  getDriverAssignmentHistory: async (userId: number): Promise<VehicleAssignment[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/assignments/driver/${userId}`,
        {
          method: 'GET',
          headers: authUtils.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching assignment history for driver ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener asignación activa de un conductor
   */
  getDriverActiveAssignment: async (
    userId: number
  ): Promise<VehicleAssignment | { message: string; assignment: null }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/assignments/driver/${userId}/active`,
        {
          method: 'GET',
          headers: authUtils.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching active assignment for driver ${userId}:`, error);
      throw error;
    }
  },

  // ==================== UTILIDADES ====================

  /**
   * Obtener nombre completo del vehículo
   */
  getDisplayName: (vehicle: Vehicle): string => {
    return `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}`;
  },

  /**
   * Verificar si un vehículo está activo
   */
  isActive: (vehicle: Vehicle): boolean => {
    return vehicle.status === VehicleStatus.ACTIVE;
  },

  /**
   * Verificar si un vehículo tiene conductor asignado
   */
  hasDriver: (vehicle: Vehicle): boolean => {
    return vehicle.vehicleDrivers?.some(vd => vd.status === VehicleDriverStatus.ACTIVE) || false;
  },

  /**
   * Obtener conductor actual del vehículo (de las relaciones cargadas)
   */
  getCurrentDriverFromRelations: (vehicle: Vehicle): VehicleDriverRelation | undefined => {
    return vehicle.vehicleDrivers?.find(vd => vd.status === VehicleDriverStatus.ACTIVE);
  },

  /**
   * Obtener texto de estado
   */
  getStatusText: (status: VehicleStatus): string => {
    return status === VehicleStatus.ACTIVE ? 'Activo' : 'Inactivo';
  },
};