import { VehicleStop, CreateVehicleStopDto, UpdateVehicleStopDto } from '@/types';
import { VehicleStopStatus } from '@/constants/enums';
import { authUtils } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const vehicleStopsService = {
  /**
   * Obtener todas las zonas
   */
  getAll: async (): Promise<VehicleStop[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-stops`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicle stops:', error);
      throw error;
    }
  },

  /**
   * Buscar zonas por nombre o dirección
   */
  search: async (query: string): Promise<VehicleStop[]> => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);

      const url = `${API_BASE_URL}/vehicle-stops/search${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching vehicle stops:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva zona
   */
  create: async (data: CreateVehicleStopDto): Promise<VehicleStop> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-stops`, {
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
      console.error('Error creating vehicle stop:', error);
      throw error;
    }
  },

  /**
   * Actualizar una zona
   */
  update: async (id: number, data: UpdateVehicleStopDto): Promise<VehicleStop> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-stops/${id}`, {
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
      console.error(`Error updating vehicle stop ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar una zona
   */
  remove: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-stops/${id}`, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting vehicle stop ${id}:`, error);
      throw error;
    }
  },

  /**
   * Activar una zona
   */
  activate: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-stops/${id}/activate`, {
        method: 'PATCH',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error activating vehicle stop ${id}:`, error);
      throw error;
    }
  },

  /**
   * Inactivar una zona
   */
  inactivate: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-stops/${id}/inactivate`, {
        method: 'PATCH',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error inactivating vehicle stop ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene el texto del estado
   */
  getStatusLabel: (status: VehicleStopStatus): string => {
    const labels: Record<VehicleStopStatus, string> = {
      [VehicleStopStatus.DELETED]: 'Eliminado',
      [VehicleStopStatus.ACTIVE]: 'Activo',
      [VehicleStopStatus.INACTIVE]: 'Inactivo',
    };
    return labels[status] ?? 'Desconocido';
  },
};
