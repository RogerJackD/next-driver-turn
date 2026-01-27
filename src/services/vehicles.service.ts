import{ 
  Vehicle, 
  VehicleAssignment, 
  CreateVehicleDto, 
  UpdateVehicleDto,
  AssignDriverDto,
  UnassignDriverDto,
  VehicleStats
} from '@/types';

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
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los vehículos
   * @param status - Filtrar por estado (active/inactive)
   * @param companyId - Filtrar por empresa
   */
  getAll: async (
    status?: string,
    companyId?: number
  ): Promise<Vehicle[]> => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (companyId) params.append('companyId', companyId.toString());

      const url = `${API_BASE_URL}/vehicles${params.toString() ? `?${params.toString()}` : ''}`;

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
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  /**
   * Obtener vehículos disponibles (sin conductor asignado)
   * @param companyId - Filtrar por empresa
   */
  getAvailable: async (companyId?: number): Promise<Vehicle[]> => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId.toString());

      const url = `${API_BASE_URL}/vehicles/available${params.toString() ? `?${params.toString()}` : ''}`;

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
      console.error(`Error updating vehicle ${id}:`, error);
      throw error;
    }
  },

  /**
   * Desactivar un vehículo
   */
  remove: async (id: number): Promise<{ message: string; vehicle: Vehicle }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
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
      console.error(`Error removing vehicle ${id}:`, error);
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
          headers: {
            'Content-Type': 'application/json',
          },
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
  getAssignmentHistory: async (vehicleId: number): Promise<VehicleAssignment[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}/assignment-history`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
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
          headers: {
            'Content-Type': 'application/json',
          },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
          headers: {
            'Content-Type': 'application/json',
          },
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
          headers: {
            'Content-Type': 'application/json',
          },
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
   * Buscar vehículos por término de búsqueda
   * Esta función filtra localmente, pero puedes implementar búsqueda en backend
   */
  search: async (query: string): Promise<Vehicle[]> => {
    try {
      const vehicles = await vehiclesService.getAll();
      const lowercaseQuery = query.toLowerCase();

      return vehicles.filter(
        (vehicle) =>
          vehicle.licensePlate.toLowerCase().includes(lowercaseQuery) ||
          vehicle.brand.toLowerCase().includes(lowercaseQuery) ||
          vehicle.model.toLowerCase().includes(lowercaseQuery) ||
          (vehicle.internalNumber &&
            vehicle.internalNumber.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de vehículos
   * Nota: Este endpoint debe implementarse en el backend
   */
  getStats: async (companyId?: number): Promise<VehicleStats> => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId.toString());

      const url = `${API_BASE_URL}/vehicles/stats${params.toString() ? `?${params.toString()}` : ''}`;

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
      console.error('Error fetching vehicle stats:', error);
      throw error;
    }
  },
};