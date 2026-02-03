import { Driver } from '@/types';
import { authUtils } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const driverService = {
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
