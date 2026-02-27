import { Driver, CreateDriverDto, CreateDriverResponse, UpdateDriverDto, PersonByDniResponse } from '@/types';
import { authUtils } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const driverService = {
  /**
   * Crear un nuevo conductor
   * Si createUser es true, también crea un usuario con DNI como username y password "123"
   */
  create: async (data: CreateDriverDto): Promise<CreateDriverResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers`, {
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
      console.error('Error creating driver:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los conductores
   */
  getAll: async (): Promise<Driver[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers`, {
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
   * Buscar conductores (por nombre, apellido, placa, marca, teléfono)
   */
  search: async (query: string): Promise<Driver[]> => {
    try {
      const url = `${API_BASE_URL}/drivers/search?q=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching drivers:', error);
      throw error;
    }
  },

  /**
   * Actualizar un conductor
   */
  update: async (id: number, data: UpdateDriverDto): Promise<Driver> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
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
      console.error('Error updating driver:', error);
      throw error;
    }
  },

  /**
   * Consultar datos de persona por DNI (servicio externo RENIEC)
   */
  getPersonByDni: async (dni: string): Promise<PersonByDniResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/external-services/person-by-dni?dni=${dni}`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(Array.isArray(error.message) ? error.message[0] : error.message);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching person by DNI:', error);
      throw error;
    }
  },

  /**
   * Activar un conductor
   */
  activate: async (id: number): Promise<Driver> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/${id}/activate`, {
        method: 'PATCH',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error activating driver:', error);
      throw error;
    }
  },

  /**
   * Desactivar un conductor
   */
  deactivate: async (id: number): Promise<Driver> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/${id}/deactivate`, {
        method: 'PATCH',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deactivating driver:', error);
      throw error;
    }
  },

  /**
   * Eliminar un conductor (status = DELETED)
   */
  delete: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
        method: 'DELETE',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  },

  /**
   * Obtener nombre completo del conductor
   */
  getFullName: (driver: Driver): string => {
    return `${driver.firstName} ${driver.lastName}`;
  },

  /**
   * Verificar si el conductor tiene vehículo asignado
   * (el backend ya filtra solo los activos)
   */
  hasVehicle: (driver: Driver): boolean => {
    return driver.vehicleDrivers.length > 0;
  },

  /**
   * Obtener el primer vehículo asignado del conductor
   */
  getVehicle: (driver: Driver) => {
    return driver.vehicleDrivers[0]?.vehicle || null;
  },
};
