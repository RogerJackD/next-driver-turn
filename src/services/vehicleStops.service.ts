import {
  VehicleStop,
  CreateVehicleStopDto,
  UpdateVehicleStopDto,
  StopExitReason,
  CreateExitReasonDto,
  UpdateExitReasonDto,
  StopExpulsionReason,
  CreateExpulsionReasonDto,
  UpdateExpulsionReasonDto,
} from '@/types';
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

  // ── Exit Reasons ───────────────────────────────────────────────

  getExitReasons: async (stopId: number): Promise<{ immediate: StopExitReason[]; scheduled: StopExitReason[] }> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/${stopId}/exit-reasons`, {
      headers: authUtils.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  },

  getAllExitReasons: async (stopId: number): Promise<StopExitReason[]> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/${stopId}/exit-reasons/all`, {
      headers: authUtils.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const json = await response.json();
    return Array.isArray(json) ? json : (Object.values(json).find(Array.isArray) as StopExitReason[] ?? []);
  },

  createExitReason: async (stopId: number, data: CreateExitReasonDto): Promise<StopExitReason> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/${stopId}/exit-reasons`, {
      method: 'POST',
      headers: authUtils.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error: ${response.status}`);
    }
    return response.json();
  },

  updateExitReason: async (stopId: number, reasonId: number, data: UpdateExitReasonDto): Promise<StopExitReason> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/${stopId}/exit-reasons/${reasonId}`, {
      method: 'PATCH',
      headers: authUtils.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error: ${response.status}`);
    }
    return response.json();
  },

  deleteExitReason: async (stopId: number, reasonId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/${stopId}/exit-reasons/${reasonId}`, {
      method: 'DELETE',
      headers: authUtils.getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error: ${response.status}`);
    }
  },

  // ── Expulsion Reasons ──────────────────────────────────────────

  getExpulsionReasons: async (): Promise<StopExpulsionReason[]> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/expulsion-reasons`, {
      headers: authUtils.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  },

  getAllExpulsionReasons: async (): Promise<StopExpulsionReason[]> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/expulsion-reasons/all`, {
      headers: authUtils.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
  },

  createExpulsionReason: async (data: CreateExpulsionReasonDto): Promise<StopExpulsionReason> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/expulsion-reasons`, {
      method: 'POST',
      headers: authUtils.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error: ${response.status}`);
    }
    return response.json();
  },

  updateExpulsionReason: async (reasonId: number, data: UpdateExpulsionReasonDto): Promise<StopExpulsionReason> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/expulsion-reasons/${reasonId}`, {
      method: 'PATCH',
      headers: authUtils.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error: ${response.status}`);
    }
    return response.json();
  },

  deleteExpulsionReason: async (reasonId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/vehicle-stops/expulsion-reasons/${reasonId}`, {
      method: 'DELETE',
      headers: authUtils.getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error: ${response.status}`);
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
