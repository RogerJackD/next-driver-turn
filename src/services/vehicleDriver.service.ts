import { VehicleDriverAssignments } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const vehicleDriverService = {
  getAssignments: async (): Promise<VehicleDriverAssignments> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/assignments/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data: VehicleDriverAssignments = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vehicle driver assignments:', error);
      throw error;
    }
  },
  
};